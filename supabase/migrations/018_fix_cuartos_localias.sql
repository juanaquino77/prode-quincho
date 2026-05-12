-- ============================================================
-- PRODE QUINCHO - Migration 018
-- Fix localías cuartos de final: matches 209 y 210
-- 209: Argentinos Juniors debe ser LOCAL (no Huracán)
-- 210: Rosario Central debe ser LOCAL (no Racing Club)
-- ============================================================

DO $$
DECLARE
  r record;
BEGIN
  -- ── Match 209: Argentinos Juniors debe ser LOCAL ────────────
  SELECT * INTO r FROM public.matches
  WHERE match_number = 209 AND competition = 'apertura_2026';

  IF FOUND AND r.home_team NOT ILIKE '%Argentinos%' THEN
    UPDATE public.matches SET
      home_team  = r.away_team,  away_team  = r.home_team,
      home_flag  = r.away_flag,  away_flag  = r.home_flag,
      home_score = r.away_score, away_score = r.home_score
    WHERE match_number = 209 AND competition = 'apertura_2026';
    RAISE NOTICE 'Match 209 corregido: % (local) vs %', r.away_team, r.home_team;
  ELSE
    RAISE NOTICE 'Match 209 ya está correcto: % (local)', r.home_team;
  END IF;

  -- ── Match 210: Rosario Central debe ser LOCAL ───────────────
  SELECT * INTO r FROM public.matches
  WHERE match_number = 210 AND competition = 'apertura_2026';

  IF FOUND AND r.home_team NOT ILIKE '%Central%' THEN
    UPDATE public.matches SET
      home_team  = r.away_team,  away_team  = r.home_team,
      home_flag  = r.away_flag,  away_flag  = r.home_flag,
      home_score = r.away_score, away_score = r.home_score
    WHERE match_number = 210 AND competition = 'apertura_2026';
    RAISE NOTICE 'Match 210 corregido: % (local) vs %', r.away_team, r.home_team;
  ELSE
    RAISE NOTICE 'Match 210 ya está correcto: % (local)', r.home_team;
  END IF;
END;
$$;
