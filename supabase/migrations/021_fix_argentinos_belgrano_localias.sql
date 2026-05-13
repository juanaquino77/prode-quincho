-- ============================================================
-- PRODE QUINCHO - Migration 021
-- Fix localía: Argentinos Juniors debe ser LOCAL vs Belgrano
-- ============================================================
DO $$
DECLARE r record;
BEGIN
  SELECT * INTO r FROM public.matches
  WHERE competition = 'apertura_2026'
    AND (
      (home_team ILIKE '%Argentinos%' AND away_team ILIKE '%Belgrano%') OR
      (home_team ILIKE '%Belgrano%'   AND away_team ILIKE '%Argentinos%')
    );

  IF FOUND AND r.home_team NOT ILIKE '%Argentinos%' THEN
    UPDATE public.matches SET
      home_team  = r.away_team,  away_team  = r.home_team,
      home_flag  = r.away_flag,  away_flag  = r.home_flag,
      home_score = r.away_score, away_score = r.home_score
    WHERE id = r.id;
    RAISE NOTICE 'Corregido: % (local) vs %', r.away_team, r.home_team;
  ELSE
    RAISE NOTICE 'Ya correcto o no encontrado';
  END IF;
END;
$$;
