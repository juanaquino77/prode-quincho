-- ============================================================
-- PRODE QUINCHO - Migration 016
-- Corrige local/visitante en octavos del Apertura 2026:
--   Match 203: Argentinos Juniors (local) vs Lanús
--   Match 205: Rosario Central (local) vs Independiente
-- ============================================================

-- ── Match 203: swap si está invertido ─────────────────────────
DO $$
DECLARE
  v_home text; v_away text; v_hflag text; v_aflag text;
BEGIN
  SELECT home_team, away_team, home_flag, away_flag
    INTO v_home, v_away, v_hflag, v_aflag
  FROM public.matches WHERE match_number = 203 AND competition = 'apertura_2026';

  IF v_home ILIKE '%Lanús%' OR v_home ILIKE '%Lanus%' THEN
    UPDATE public.matches
    SET home_team = v_away, away_team = v_home,
        home_flag = v_aflag, away_flag = v_hflag
    WHERE match_number = 203 AND competition = 'apertura_2026';
  END IF;
END;
$$;

-- ── Match 205: swap si está invertido ─────────────────────────
DO $$
DECLARE
  v_home text; v_away text; v_hflag text; v_aflag text;
BEGIN
  SELECT home_team, away_team, home_flag, away_flag
    INTO v_home, v_away, v_hflag, v_aflag
  FROM public.matches WHERE match_number = 205 AND competition = 'apertura_2026';

  IF v_home ILIKE '%Independiente%' THEN
    UPDATE public.matches
    SET home_team = v_away, away_team = v_home,
        home_flag = v_aflag, away_flag = v_hflag
    WHERE match_number = 205 AND competition = 'apertura_2026';
  END IF;
END;
$$;

-- ── Cuartos: corregir placeholders (solo si existen como texto) ─
UPDATE public.matches
SET home_team = REPLACE(home_team, 'Gan. Lanús o Argentinos', 'Gan. Argentinos o Lanús'),
    away_team = REPLACE(away_team, 'Gan. Lanús o Argentinos', 'Gan. Argentinos o Lanús')
WHERE competition = 'apertura_2026'
  AND (home_team ILIKE '%Lanús o Argentinos%' OR away_team ILIKE '%Lanús o Argentinos%');

UPDATE public.matches
SET home_team = REPLACE(home_team, 'Gan. Independiente o Central', 'Gan. Central o Independiente'),
    away_team = REPLACE(away_team, 'Gan. Independiente o Central', 'Gan. Central o Independiente')
WHERE competition = 'apertura_2026'
  AND (home_team ILIKE '%Independiente o Central%' OR away_team ILIKE '%Independiente o Central%');
