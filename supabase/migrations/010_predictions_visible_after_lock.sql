-- Allow authenticated users to see predictions for matches that are already locked
-- (finished, live, or within 2 hours of kickoff).
-- Own predictions are already covered by the existing policy.

create policy "Ver pronósticos de partidos cerrados"
  on public.predictions
  for select
  using (
    auth.uid() is not null
    and exists (
      select 1 from public.matches m
      where m.id = predictions.match_id
        and (
          m.status in ('finished', 'live')
          or m.match_date <= now() + interval '2 hours'
        )
    )
  );
