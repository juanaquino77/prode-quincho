-- ============================================================
-- PRODE QUINCHO - Schema inicial
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Profiles
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  is_admin boolean default false,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Profiles son públicos para leer" on public.profiles for select using (true);
create policy "Usuarios editan su propio perfil" on public.profiles for update using (auth.uid() = id);
create policy "Usuarios insertan su propio perfil" on public.profiles for insert with check (auth.uid() = id);

-- Trigger para crear perfil en registro con OAuth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _username text;
begin
  _username := split_part(new.email, '@', 1);
  -- evitar colisiones de username
  if exists (select 1 from public.profiles where username = _username) then
    _username := _username || '_' || floor(random() * 9999)::text;
  end if;
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    _username,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Matches
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  group_name text,
  stage text not null default 'group',
  match_number int,
  home_team text not null,
  away_team text not null,
  home_flag text,
  away_flag text,
  match_date timestamptz not null,
  venue text,
  home_score int,
  away_score int,
  status text not null default 'upcoming' check (status in ('upcoming', 'live', 'finished')),
  created_at timestamptz default now()
);
alter table public.matches enable row level security;
create policy "Partidos son públicos" on public.matches for select using (true);
create policy "Solo admins modifican partidos" on public.matches
  for all using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- Tournaments
create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'friends' check (type in ('global', 'friends')),
  invite_code text unique,
  created_by uuid references auth.users(id),
  entry_fee numeric not null default 0,
  prize_pool numeric not null default 0,
  club_fee_percentage numeric not null default 10,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table public.tournaments enable row level security;
create policy "Torneos activos son públicos" on public.tournaments for select using (is_active = true);
create policy "Usuarios autenticados crean torneos" on public.tournaments
  for insert with check (auth.uid() = created_by);
create policy "Creador y admins modifican torneos" on public.tournaments
  for update using (
    auth.uid() = created_by
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Tournament members
create table if not exists public.tournament_members (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  paid boolean default false,
  joined_at timestamptz default now(),
  unique(tournament_id, user_id)
);
alter table public.tournament_members enable row level security;
create policy "Miembros son visibles para miembros del torneo" on public.tournament_members
  for select using (auth.uid() = user_id or exists (
    select 1 from public.tournament_members tm2
    where tm2.tournament_id = tournament_members.tournament_id and tm2.user_id = auth.uid()
  ));
create policy "Usuarios se unen a torneos" on public.tournament_members
  for insert with check (auth.uid() = user_id);

-- Predictions
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  match_id uuid references public.matches(id) on delete cascade,
  tournament_id uuid references public.tournaments(id) on delete cascade,
  home_score_pred int not null,
  away_score_pred int not null,
  points_earned int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, match_id, tournament_id)
);
alter table public.predictions enable row level security;
create policy "Cada usuario ve sus propios pronósticos" on public.predictions
  for select using (auth.uid() = user_id);
create policy "Usuarios insertan sus pronósticos" on public.predictions
  for insert with check (auth.uid() = user_id);
create policy "Usuarios actualizan sus pronósticos" on public.predictions
  for update using (auth.uid() = user_id);

-- Función para calcular puntos
create or replace function public.calculate_points(
  p_home_score int, p_away_score int,
  p_home_pred int, p_away_pred int
) returns int language plpgsql as $$
begin
  -- Resultado exacto: 2 puntos
  if p_home_score = p_home_pred and p_away_score = p_away_pred then
    return 2;
  end if;
  -- Resultado correcto (ganador/empate): 1 punto
  if sign(p_home_score - p_away_score) = sign(p_home_pred - p_away_pred) then
    return 1;
  end if;
  return 0;
end;
$$;

-- Trigger para actualizar puntos cuando se cargan resultados
create or replace function public.update_prediction_points()
returns trigger language plpgsql security definer as $$
begin
  if new.status = 'finished' and new.home_score is not null and new.away_score is not null then
    update public.predictions
    set points_earned = public.calculate_points(new.home_score, new.away_score, home_score_pred, away_score_pred),
        updated_at = now()
    where match_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_match_finished on public.matches;
create trigger on_match_finished
  after update of status, home_score, away_score on public.matches
  for each row execute procedure public.update_prediction_points();

-- Función leaderboard (tabla de posiciones)
create or replace function public.get_leaderboard(p_tournament_id uuid)
returns table (
  user_id uuid,
  username text,
  full_name text,
  avatar_url text,
  total_points bigint,
  exact_scores bigint,
  correct_outcomes bigint,
  total_predictions bigint,
  rank bigint
) language sql security definer as $$
  select
    pr.id as user_id,
    pr.username,
    pr.full_name,
    pr.avatar_url,
    coalesce(sum(p.points_earned), 0) as total_points,
    count(case when p.points_earned = 2 then 1 end) as exact_scores,
    count(case when p.points_earned >= 1 then 1 end) as correct_outcomes,
    count(p.id) as total_predictions,
    rank() over (order by coalesce(sum(p.points_earned), 0) desc, count(case when p.points_earned = 2 then 1 end) desc) as rank
  from public.tournament_members tm
  join public.profiles pr on pr.id = tm.user_id
  left join public.predictions p on p.user_id = tm.user_id and p.tournament_id = p_tournament_id
  where tm.tournament_id = p_tournament_id
  group by pr.id, pr.username, pr.full_name, pr.avatar_url
  order by total_points desc, exact_scores desc;
$$;

-- ============================================================
-- Datos iniciales: Torneo Global
-- ============================================================
insert into public.tournaments (name, type, invite_code, is_active)
values ('Torneo Global - Mundial 2026', 'global', null, true)
on conflict do nothing;
