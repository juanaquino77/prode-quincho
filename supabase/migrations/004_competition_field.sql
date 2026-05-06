-- ============================================================
-- PRODE QUINCHO - Migration 004
-- Competition field on matches + tournaments for tournament scoping
-- ============================================================

-- 1. Add competition to matches (default: mundial_2026)
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS competition text NOT NULL DEFAULT 'mundial_2026';

-- 2. Mark existing Argentine test matches
UPDATE public.matches
  SET competition = 'apertura_2026'
  WHERE match_number BETWEEN 200 AND 207;

-- 3. Add competition to tournaments (null = no filter, show all)
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS competition text;

-- Global tournament stays with competition = null (shows all matches)
-- Friend tournaments will have competition = 'apertura_2026' or 'mundial_2026'
