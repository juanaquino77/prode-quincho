-- Fix trigger auto_join_global_tournament: tenía paid=true hardcodeado
-- Cada usuario nuevo quedaba marcado como que ya presentó tarjeta
CREATE OR REPLACE FUNCTION public.auto_join_global_tournament()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
declare
  _tid uuid;
begin
  select id into _tid
  from public.tournaments
  where type = 'global' and is_active = true
  limit 1;

  if _tid is not null then
    insert into public.tournament_members (tournament_id, user_id, paid)
    values (_tid, new.id, false)
    on conflict do nothing;
  end if;

  return new;
end;
$$;
