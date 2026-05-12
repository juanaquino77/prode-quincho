-- ============================================================
-- PRODE QUINCHO - Migration 017
-- Fix definitivo de localías: Argentinos (203) y Central (205)
-- Swapea home↔away (equipos, flags, scores) si el local no es el correcto
-- ============================================================

DO $$
DECLARE
  r record;
BEGIN
  -- ── Match 203: Argentinos Juniors debe ser LOCAL ────────────
  SELECT * INTO r FROM public.matches
  WHERE match_number = 203 AND competition = 'apertura_2026';

  IF FOUND AND r.home_team NOT ILIKE '%Argentinos%' THEN
    UPDATE public.matches SET
      home_team  = r.away_team,  away_team  = r.home_team,
      home_flag  = r.away_flag,  away_flag  = r.home_flag,
      home_score = r.away_score, away_score = r.home_score
    WHERE match_number = 203 AND competition = 'apertura_2026';
    RAISE NOTICE 'Match 203 corregido: % (local) vs %', r.away_team, r.home_team;
  ELSE
    RAISE NOTICE 'Match 203 ya está correcto: % (local)', r.home_team;
  END IF;

  -- ── Match 205: Rosario Central debe ser LOCAL ───────────────
  SELECT * INTO r FROM public.matches
  WHERE match_number = 205 AND competition = 'apertura_2026';

  IF FOUND AND r.home_team NOT ILIKE '%Central%' THEN
    UPDATE public.matches SET
      home_team  = r.away_team,  away_team  = r.home_team,
      home_flag  = r.away_flag,  away_flag  = r.home_flag,
      home_score = r.away_score, away_score = r.home_score
    WHERE match_number = 205 AND competition = 'apertura_2026';
    RAISE NOTICE 'Match 205 corregido: % (local) vs %', r.away_team, r.home_team;
  ELSE
    RAISE NOTICE 'Match 205 ya está correcto: % (local)', r.home_team;
  END IF;
END;
$$;
