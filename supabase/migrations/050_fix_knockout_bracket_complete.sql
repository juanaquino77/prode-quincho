-- Corrección completa del cuadro de eliminatorias según bracket oficial FIFA 2026.
-- Fuente: Wikipedia 2026 FIFA World Cup knockout stage (verificado contra FIFA.com).
-- Se corrigen: posiciones de grupo (home_team/away_team), estadios y fechas UTC.
-- Se agregan los 2 partidos faltantes de la Ronda de 32 (matches 103-104).
-- UTC = hora ET + 4h, CT + 5h, PT + 7h.

-- =====================================================================
-- RONDA DE 32: posiciones oficiales + estadios + fechas
-- =====================================================================
UPDATE public.matches SET home_team='2A', away_team='2B',
  match_date='2026-06-28T19:00:00Z', venue='SoFi Stadium, Los Ángeles'
  WHERE competition='mundial_2026' AND match_number=73;

UPDATE public.matches SET home_team='1E', away_team='Mejor 3° (A/B/C/D/F)',
  match_date='2026-06-29T20:30:00Z', venue='Gillette Stadium, Boston'
  WHERE competition='mundial_2026' AND match_number=74;

UPDATE public.matches SET home_team='1F', away_team='2C',
  match_date='2026-06-30T00:00:00Z', venue='Estadio BBVA, Monterrey'
  WHERE competition='mundial_2026' AND match_number=75;

UPDATE public.matches SET home_team='1C', away_team='2F',
  match_date='2026-06-29T16:00:00Z', venue='NRG Stadium, Houston'
  WHERE competition='mundial_2026' AND match_number=76;

UPDATE public.matches SET home_team='1I', away_team='Mejor 3° (C/D/F/G/H)',
  match_date='2026-06-30T21:00:00Z', venue='MetLife Stadium, Nueva York'
  WHERE competition='mundial_2026' AND match_number=77;

UPDATE public.matches SET home_team='2E', away_team='2I',
  match_date='2026-06-30T16:00:00Z', venue='AT&T Stadium, Arlington'
  WHERE competition='mundial_2026' AND match_number=78;

UPDATE public.matches SET home_team='1A', away_team='Mejor 3° (C/E/F/H/I)',
  match_date='2026-07-01T00:00:00Z', venue='Estadio Azteca, Ciudad de México'
  WHERE competition='mundial_2026' AND match_number=79;

UPDATE public.matches SET home_team='1L', away_team='Mejor 3° (E/H/I/J/K)',
  match_date='2026-07-01T16:00:00Z', venue='Mercedes-Benz Stadium, Atlanta'
  WHERE competition='mundial_2026' AND match_number=80;

UPDATE public.matches SET home_team='1G', away_team='Mejor 3° (A/E/H/I/J)',
  match_date='2026-07-01T20:00:00Z', venue='Lumen Field, Seattle'
  WHERE competition='mundial_2026' AND match_number=82;

UPDATE public.matches SET home_team='1D', away_team='Mejor 3° (B/E/F/I/J)',
  match_date='2026-07-02T00:00:00Z', venue='Levi''s Stadium, San Francisco'
  WHERE competition='mundial_2026' AND match_number=81;

UPDATE public.matches SET home_team='2K', away_team='2L',
  match_date='2026-07-02T23:00:00Z', venue='BMO Field, Toronto'
  WHERE competition='mundial_2026' AND match_number=83;

UPDATE public.matches SET home_team='1H', away_team='2J',
  match_date='2026-07-02T19:00:00Z', venue='SoFi Stadium, Los Ángeles'
  WHERE competition='mundial_2026' AND match_number=84;

UPDATE public.matches SET home_team='1B', away_team='Mejor 3° (E/F/G/I/J)',
  match_date='2026-07-03T03:00:00Z', venue='BC Place, Vancouver'
  WHERE competition='mundial_2026' AND match_number=85;

-- MATCH 86: 1J vs 2H en Miami (Argentina si sale 1° del Grupo J)
UPDATE public.matches SET home_team='1J', away_team='2H',
  match_date='2026-07-03T22:00:00Z', venue='Hard Rock Stadium, Miami'
  WHERE competition='mundial_2026' AND match_number=86;

-- 2 partidos de R32 faltantes en la DB original
INSERT INTO public.matches (match_number, stage, group_name, home_team, away_team, home_flag, away_flag, match_date, venue, status, competition, home_score, away_score)
VALUES
  (103, 'round_of_32', NULL, '2D', '2G', '🏆', '🏆', '2026-07-03T17:00:00Z', 'AT&T Stadium, Arlington',    'upcoming', 'mundial_2026', NULL, NULL),
  (104, 'round_of_32', NULL, '1K', 'Mejor 3° (D/E/I/J/L)', '🏆', '🏆', '2026-07-04T00:30:00Z', 'Arrowhead Stadium, Kansas City', 'upcoming', 'mundial_2026', NULL, NULL)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- OCTAVOS DE FINAL: bracket oficial + estadios + fechas
-- Winner Match X se muestra como "Gan. #X" (resuelto automáticamente por la app)
-- =====================================================================
UPDATE public.matches SET home_team='Gan. #74', away_team='Gan. #77',
  match_date='2026-07-04T21:00:00Z', venue='Lincoln Financial Field, Filadelfia'
  WHERE competition='mundial_2026' AND match_number=87;

UPDATE public.matches SET home_team='Gan. #73', away_team='Gan. #75',
  match_date='2026-07-04T16:00:00Z', venue='NRG Stadium, Houston'
  WHERE competition='mundial_2026' AND match_number=88;

UPDATE public.matches SET home_team='Gan. #76', away_team='Gan. #78',
  match_date='2026-07-05T20:00:00Z', venue='MetLife Stadium, Nueva York'
  WHERE competition='mundial_2026' AND match_number=89;

UPDATE public.matches SET home_team='Gan. #79', away_team='Gan. #80',
  match_date='2026-07-05T23:00:00Z', venue='Estadio Azteca, Ciudad de México'
  WHERE competition='mundial_2026' AND match_number=90;

UPDATE public.matches SET home_team='Gan. #83', away_team='Gan. #84',
  match_date='2026-07-06T18:00:00Z', venue='AT&T Stadium, Arlington'
  WHERE competition='mundial_2026' AND match_number=91;

UPDATE public.matches SET home_team='Gan. #81', away_team='Gan. #82',
  match_date='2026-07-07T00:00:00Z', venue='Lumen Field, Seattle'
  WHERE competition='mundial_2026' AND match_number=92;

UPDATE public.matches SET home_team='Gan. #86', away_team='Gan. #104',
  match_date='2026-07-07T16:00:00Z', venue='Mercedes-Benz Stadium, Atlanta'
  WHERE competition='mundial_2026' AND match_number=93;

UPDATE public.matches SET home_team='Gan. #85', away_team='Gan. #103',
  match_date='2026-07-07T20:00:00Z', venue='BC Place, Vancouver'
  WHERE competition='mundial_2026' AND match_number=94;

-- =====================================================================
-- CUARTOS DE FINAL
-- =====================================================================
UPDATE public.matches SET home_team='Gan. #87', away_team='Gan. #88',
  match_date='2026-07-09T20:00:00Z', venue='Gillette Stadium, Boston'
  WHERE competition='mundial_2026' AND match_number=95;

UPDATE public.matches SET home_team='Gan. #91', away_team='Gan. #92',
  match_date='2026-07-10T19:00:00Z', venue='SoFi Stadium, Los Ángeles'
  WHERE competition='mundial_2026' AND match_number=96;

UPDATE public.matches SET home_team='Gan. #89', away_team='Gan. #90',
  match_date='2026-07-11T21:00:00Z', venue='Hard Rock Stadium, Miami'
  WHERE competition='mundial_2026' AND match_number=97;

UPDATE public.matches SET home_team='Gan. #93', away_team='Gan. #94',
  match_date='2026-07-12T00:00:00Z', venue='Arrowhead Stadium, Kansas City'
  WHERE competition='mundial_2026' AND match_number=98;

-- =====================================================================
-- SEMIFINALES
-- =====================================================================
UPDATE public.matches SET home_team='Gan. #95', away_team='Gan. #96',
  match_date='2026-07-14T18:00:00Z', venue='AT&T Stadium, Arlington'
  WHERE competition='mundial_2026' AND match_number=99;

UPDATE public.matches SET home_team='Gan. #97', away_team='Gan. #98',
  match_date='2026-07-15T19:00:00Z', venue='Mercedes-Benz Stadium, Atlanta'
  WHERE competition='mundial_2026' AND match_number=100;

-- =====================================================================
-- TERCER PUESTO
-- =====================================================================
UPDATE public.matches SET
  match_date='2026-07-18T21:00:00Z', venue='Hard Rock Stadium, Miami'
  WHERE competition='mundial_2026' AND match_number=101;

-- =====================================================================
-- FINAL
-- =====================================================================
UPDATE public.matches SET home_team='Gan. #99', away_team='Gan. #100',
  match_date='2026-07-19T19:00:00Z', venue='MetLife Stadium, Nueva York'
  WHERE competition='mundial_2026' AND match_number=102;
