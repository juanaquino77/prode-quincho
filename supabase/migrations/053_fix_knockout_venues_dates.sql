-- Migration 053 — Corregir venues y fechas de Octavos → Final
--
-- Fuente: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage
-- Todos los horarios en UTC. Argentina = UTC-3 (sin horario de verano).
--
-- TAMBIÉN corrige referencias de bracket en QF-98 y QF-99, que migration 051
-- dejó cruzadas:
--   QF-98: debe ser Gan.#93 vs Gan.#94 (no #91 vs #92)
--   QF-99: debe ser Gan.#91 vs Gan.#92 (no #93 vs #94)

-- ── Octavos de Final (89-96) ───────────────────────────────────────────────

-- 89: Lincoln Financial Field, Filadelfia | 4 jul 21:00 UTC = 18:00 AR
UPDATE public.matches
SET match_date='2026-07-04T21:00:00Z', venue='Lincoln Financial Field, Filadelfia'
WHERE competition='mundial_2026' AND match_number=89;

-- 90: NRG Stadium, Houston | 4 jul 17:00 UTC = 14:00 AR
UPDATE public.matches
SET match_date='2026-07-04T17:00:00Z', venue='NRG Stadium, Houston'
WHERE competition='mundial_2026' AND match_number=90;

-- 91: MetLife Stadium, Nueva York | 5 jul 20:00 UTC = 17:00 AR
UPDATE public.matches
SET match_date='2026-07-05T20:00:00Z', venue='MetLife Stadium, Nueva York'
WHERE competition='mundial_2026' AND match_number=91;

-- 92: Estadio Azteca, Ciudad de México | 5 jul 22:00 UTC = 19:00 AR
UPDATE public.matches
SET match_date='2026-07-05T22:00:00Z', venue='Estadio Azteca, Ciudad de México'
WHERE competition='mundial_2026' AND match_number=92;

-- 93: AT&T Stadium, Arlington | 6 jul 19:00 UTC = 16:00 AR
UPDATE public.matches
SET match_date='2026-07-06T19:00:00Z', venue='AT&T Stadium, Arlington'
WHERE competition='mundial_2026' AND match_number=93;

-- 94: Lumen Field, Seattle | 6 jul 22:00 UTC = 19:00 AR
UPDATE public.matches
SET match_date='2026-07-06T22:00:00Z', venue='Lumen Field, Seattle'
WHERE competition='mundial_2026' AND match_number=94;

-- 95: Mercedes-Benz Stadium, Atlanta | 7 jul 16:00 UTC = 13:00 AR
UPDATE public.matches
SET match_date='2026-07-07T16:00:00Z', venue='Mercedes-Benz Stadium, Atlanta'
WHERE competition='mundial_2026' AND match_number=95;

-- 96: BC Place, Vancouver | 7 jul 20:00 UTC = 17:00 AR
UPDATE public.matches
SET match_date='2026-07-07T20:00:00Z', venue='BC Place, Vancouver'
WHERE competition='mundial_2026' AND match_number=96;

-- ── Cuartos de Final (97-100) ──────────────────────────────────────────────

-- 97: Gillette Stadium, Foxborough | 9 jul 20:00 UTC = 17:00 AR
UPDATE public.matches
SET home_team='Gan. #89', away_team='Gan. #90',
    match_date='2026-07-09T20:00:00Z', venue='Gillette Stadium, Foxborough'
WHERE competition='mundial_2026' AND match_number=97;

-- 98: SoFi Stadium, Los Ángeles | 10 jul 19:00 UTC = 16:00 AR
-- (bracket fix: 051 tenía #91 vs #92 incorrecto)
UPDATE public.matches
SET home_team='Gan. #93', away_team='Gan. #94',
    match_date='2026-07-10T19:00:00Z', venue='SoFi Stadium, Los Ángeles'
WHERE competition='mundial_2026' AND match_number=98;

-- 99: Hard Rock Stadium, Miami | 11 jul 21:00 UTC = 18:00 AR
-- (bracket fix: 051 tenía #93 vs #94 incorrecto)
UPDATE public.matches
SET home_team='Gan. #91', away_team='Gan. #92',
    match_date='2026-07-11T21:00:00Z', venue='Hard Rock Stadium, Miami'
WHERE competition='mundial_2026' AND match_number=99;

-- 100: Arrowhead Stadium, Kansas City | 12 jul 01:00 UTC = 22:00 AR (11 jul)
UPDATE public.matches
SET home_team='Gan. #95', away_team='Gan. #96',
    match_date='2026-07-12T01:00:00Z', venue='Arrowhead Stadium, Kansas City'
WHERE competition='mundial_2026' AND match_number=100;

-- ── Semifinales (101-102) ──────────────────────────────────────────────────

-- 101: AT&T Stadium, Arlington | 14 jul 18:00 UTC = 15:00 AR
UPDATE public.matches
SET match_date='2026-07-14T18:00:00Z', venue='AT&T Stadium, Arlington'
WHERE competition='mundial_2026' AND match_number=101;

-- 102: Mercedes-Benz Stadium, Atlanta | 15 jul 19:00 UTC = 16:00 AR
UPDATE public.matches
SET match_date='2026-07-15T19:00:00Z', venue='Mercedes-Benz Stadium, Atlanta'
WHERE competition='mundial_2026' AND match_number=102;

-- ── Tercer Puesto (103) ────────────────────────────────────────────────────

-- 103: Hard Rock Stadium, Miami | 18 jul 21:00 UTC = 18:00 AR
UPDATE public.matches
SET match_date='2026-07-18T21:00:00Z', venue='Hard Rock Stadium, Miami'
WHERE competition='mundial_2026' AND match_number=103;

-- ── Final (104) ────────────────────────────────────────────────────────────

-- 104: MetLife Stadium, Nueva York | 19 jul 19:00 UTC = 16:00 AR
UPDATE public.matches
SET match_date='2026-07-19T19:00:00Z', venue='MetLife Stadium, Nueva York'
WHERE competition='mundial_2026' AND match_number=104;
