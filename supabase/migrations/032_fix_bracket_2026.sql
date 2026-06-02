-- ============================================================
-- PRODE QUINCHO - Migration 032
-- Corregir bracket Mundial 2026 según estructura oficial FIFA
-- IMPORTANTE: los renumerados van en cascada (de mayor a menor)
-- para no violar el UNIQUE constraint de match_number
-- ============================================================

-- ── 1. Actualizar nombres de los 14 round_of_32 existentes (73-86) ───────────

UPDATE public.matches SET home_team = '2° Grupo A',   away_team = '2° Grupo B'            WHERE match_number = 73  AND competition = 'mundial_2026';
UPDATE public.matches SET home_team = '1° Grupo E',   away_team = 'Mejor 3° (A/B/C/D/F)'  WHERE match_number = 74  AND competition = 'mundial_2026';
UPDATE public.matches SET home_team = '1° Grupo F',   away_team = '2° Grupo C'             WHERE match_number = 75  AND competition = 'mundial_2026';
UPDATE public.matches SET home_team = '1° Grupo C',   away_team = '2° Grupo F'             WHERE match_number = 76  AND competition = 'mundial_2026';
UPDATE public.matches SET home_team = '1° Grupo I',   away_team = 'Mejor 3° (C/D/F/G/H)'  WHERE match_number = 77  AND competition = 'mundial_2026';
UPDATE public.matches SET home_team = '2° Grupo E',   away_team = '2° Grupo I'             WHERE match_number = 78  AND competition = 'mundial_2026';
UPDATE public.matches SET home_team = '1° Grupo A',   away_team = 'Mejor 3° (C/E/F/H/I)'  WHERE match_number = 79  AND competition = 'mundial_2026';
UPDATE public.matches SET home_team = '1° Grupo L',   away_team = 'Mejor 3° (E/H/I/J/K)'  WHERE match_number = 80  AND competition = 'mundial_2026';
UPDATE public.matches SET home_team = '1° Grupo D',   away_team = 'Mejor 3° (B/E/F/I/J)'  WHERE match_number = 81  AND competition = 'mundial_2026';
UPDATE public.matches SET home_team = '1° Grupo G',   away_team = 'Mejor 3° (A/E/H/I/J)'  WHERE match_number = 82  AND competition = 'mundial_2026';
UPDATE public.matches SET home_team = '2° Grupo K',   away_team = '2° Grupo L'             WHERE match_number = 83  AND competition = 'mundial_2026';
UPDATE public.matches SET home_team = '1° Grupo H',   away_team = '2° Grupo J'             WHERE match_number = 84  AND competition = 'mundial_2026';
UPDATE public.matches SET home_team = '1° Grupo B',   away_team = 'Mejor 3° (E/F/G/I/J)'  WHERE match_number = 85  AND competition = 'mundial_2026';
UPDATE public.matches SET home_team = '2° Grupo D',   away_team = '2° Grupo G'             WHERE match_number = 86  AND competition = 'mundial_2026';

-- ── 2. Liberar números 87-88 renumerando en cascada (mayor → menor) ──────────
--    Orden: Final → 3° → SF → QF → R16 (siempre hacia números libres)

-- Final: 102 → 104
UPDATE public.matches SET match_number = 104,
  home_team = 'Gan. #101', away_team = 'Gan. #102',
  match_date = '2026-08-02T23:00:00Z', venue = 'MetLife Stadium, Nueva York'
  WHERE match_number = 102 AND stage = 'final' AND competition = 'mundial_2026';

-- Tercer puesto: 101 → 103
UPDATE public.matches SET match_number = 103,
  home_team = 'Perdedor SF-1', away_team = 'Perdedor SF-2'
  WHERE match_number = 101 AND stage = 'third_place' AND competition = 'mundial_2026';

-- Semis: 100→102, 99→101
UPDATE public.matches SET match_number = 102,
  home_team = 'Gan. #99', away_team = 'Gan. #100',
  match_date = '2026-07-27T23:00:00Z', venue = 'MetLife Stadium, Nueva York'
  WHERE match_number = 100 AND stage = 'semifinal' AND competition = 'mundial_2026';
UPDATE public.matches SET match_number = 101,
  home_team = 'Gan. #97', away_team = 'Gan. #98',
  match_date = '2026-07-26T23:00:00Z', venue = 'AT&T Stadium, Dallas'
  WHERE match_number = 99 AND stage = 'semifinal' AND competition = 'mundial_2026';

-- Cuartos: 98→100, 97→99, 96→98, 95→97
UPDATE public.matches SET match_number = 100,
  home_team = 'Gan. #95', away_team = 'Gan. #96',
  match_date = '2026-07-19T23:00:00Z', venue = 'SoFi Stadium, Los Ángeles'
  WHERE match_number = 98 AND stage = 'quarterfinal' AND competition = 'mundial_2026';
UPDATE public.matches SET match_number = 99,
  home_team = 'Gan. #93', away_team = 'Gan. #94',
  match_date = '2026-07-19T02:00:00Z', venue = 'MetLife Stadium, Nueva York'
  WHERE match_number = 97 AND stage = 'quarterfinal' AND competition = 'mundial_2026';
UPDATE public.matches SET match_number = 98,
  home_team = 'Gan. #91', away_team = 'Gan. #92',
  match_date = '2026-07-18T23:00:00Z', venue = 'Rose Bowl, Los Ángeles'
  WHERE match_number = 96 AND stage = 'quarterfinal' AND competition = 'mundial_2026';
UPDATE public.matches SET match_number = 97,
  home_team = 'Gan. #89', away_team = 'Gan. #90',
  match_date = '2026-07-17T23:00:00Z', venue = 'AT&T Stadium, Dallas'
  WHERE match_number = 95 AND stage = 'quarterfinal' AND competition = 'mundial_2026';

-- R16: 94→96, 93→95, 92→94, 91→93, 90→92, 89→91, 88→90, 87→89
UPDATE public.matches SET match_number = 96,
  home_team = 'Gan. #87', away_team = 'Gan. #88',
  match_date = '2026-07-14T23:00:00Z', venue = 'Estadio Azteca, Ciudad de México'
  WHERE match_number = 94 AND stage = 'round_of_16' AND competition = 'mundial_2026';
UPDATE public.matches SET match_number = 95,
  home_team = 'Gan. #85', away_team = 'Gan. #86',
  match_date = '2026-07-14T19:00:00Z', venue = 'Levi''s Stadium, San Francisco'
  WHERE match_number = 93 AND stage = 'round_of_16' AND competition = 'mundial_2026';
UPDATE public.matches SET match_number = 94,
  home_team = 'Gan. #83', away_team = 'Gan. #84',
  match_date = '2026-07-13T23:00:00Z', venue = 'BC Place, Vancouver'
  WHERE match_number = 92 AND stage = 'round_of_16' AND competition = 'mundial_2026';
UPDATE public.matches SET match_number = 93,
  home_team = 'Gan. #81', away_team = 'Gan. #82',
  match_date = '2026-07-13T19:00:00Z', venue = 'BMO Field, Toronto'
  WHERE match_number = 91 AND stage = 'round_of_16' AND competition = 'mundial_2026';
UPDATE public.matches SET match_number = 92,
  home_team = 'Gan. #79', away_team = 'Gan. #80',
  match_date = '2026-07-12T23:00:00Z', venue = 'Rose Bowl, Los Ángeles'
  WHERE match_number = 90 AND stage = 'round_of_16' AND competition = 'mundial_2026';
UPDATE public.matches SET match_number = 91,
  home_team = 'Gan. #77', away_team = 'Gan. #78',
  match_date = '2026-07-12T19:00:00Z', venue = 'SoFi Stadium, Los Ángeles'
  WHERE match_number = 89 AND stage = 'round_of_16' AND competition = 'mundial_2026';
UPDATE public.matches SET match_number = 90,
  home_team = 'Gan. #75', away_team = 'Gan. #76',
  match_date = '2026-07-11T23:00:00Z', venue = 'AT&T Stadium, Dallas'
  WHERE match_number = 88 AND stage = 'round_of_16' AND competition = 'mundial_2026';
UPDATE public.matches SET match_number = 89,
  home_team = 'Gan. #73', away_team = 'Gan. #74',
  match_date = '2026-07-11T19:00:00Z', venue = 'MetLife Stadium, Nueva York'
  WHERE match_number = 87 AND stage = 'round_of_16' AND competition = 'mundial_2026';

-- ── 3. Insertar los 2 partidos nuevos de round_of_32 (87 y 88 ahora libres) ──

INSERT INTO public.matches
  (match_number, stage, group_name, home_team, away_team, home_flag, away_flag,
   match_date, venue, status, competition)
VALUES
  (87, 'round_of_32', null, '1° Grupo J', '2° Grupo H', '🏆', '🏆',
   '2026-07-10T02:00:00Z', 'SoFi Stadium, Los Ángeles', 'upcoming', 'mundial_2026'),
  (88, 'round_of_32', null, '1° Grupo K', 'Mejor 3° (D/E/I/J/L)', '🏆', '🏆',
   '2026-07-10T19:00:00Z', 'AT&T Stadium, Dallas', 'upcoming', 'mundial_2026');
