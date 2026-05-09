-- ============================================================
-- Fix horarios octavos de final Apertura 2026
-- Fuente: Infobae, ESPN, La Nación (verificados en múltiples fuentes)
-- ART = UTC-3  →  offset -03 permite que Postgres convierta solo
-- ============================================================

-- Sábado 9 mayo ─────────────────────────────────────────────

UPDATE public.matches SET match_date = '2026-05-09 16:30:00-03'
WHERE competition = 'apertura_2026' AND stage = 'round_of_16'
  AND home_team ILIKE '%Talleres%' AND away_team ILIKE '%Belgrano%';

UPDATE public.matches SET match_date = '2026-05-09 19:00:00-03'
WHERE competition = 'apertura_2026' AND stage = 'round_of_16'
  AND home_team ILIKE '%Boca%' AND away_team ILIKE '%Hurac%';

UPDATE public.matches SET match_date = '2026-05-09 21:30:00-03'
WHERE competition = 'apertura_2026' AND stage = 'round_of_16'
  AND home_team ILIKE '%Argentinos%' AND away_team ILIKE '%Lan%s%';

UPDATE public.matches SET match_date = '2026-05-09 21:30:00-03'
WHERE competition = 'apertura_2026' AND stage = 'round_of_16'
  AND home_team ILIKE '%Rivadavia%' AND away_team ILIKE '%Uni%n%';

-- Domingo 10 mayo ────────────────────────────────────────────

UPDATE public.matches SET match_date = '2026-05-10 15:00:00-03'
WHERE competition = 'apertura_2026' AND stage = 'round_of_16'
  AND home_team ILIKE '%Central%'
  AND away_team ILIKE '%Independiente%' AND away_team NOT ILIKE '%Rivadavia%';

UPDATE public.matches SET match_date = '2026-05-10 17:00:00-03'
WHERE competition = 'apertura_2026' AND stage = 'round_of_16'
  AND home_team ILIKE '%Estudiantes%' AND away_team ILIKE '%Racing%';

UPDATE public.matches SET match_date = '2026-05-10 19:00:00-03'
WHERE competition = 'apertura_2026' AND stage = 'round_of_16'
  AND home_team ILIKE '%River%' AND away_team ILIKE '%San Lorenzo%';

UPDATE public.matches SET match_date = '2026-05-10 21:30:00-03'
WHERE competition = 'apertura_2026' AND stage = 'round_of_16'
  AND home_team ILIKE '%V%lez%' AND away_team ILIKE '%Gimnasia%';
