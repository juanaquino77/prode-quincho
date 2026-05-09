-- ============================================================
-- PRODE QUINCHO - Tabla de pagos MercadoPago
-- ============================================================

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  tournament_id uuid references public.tournaments(id) on delete cascade not null,
  mp_preference_id text,
  mp_payment_id text,
  amount numeric not null,
  currency text not null default 'ARS',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, tournament_id)
);

alter table public.payments enable row level security;

create policy "Users see own payments" on public.payments
  for select using (auth.uid() = user_id);
