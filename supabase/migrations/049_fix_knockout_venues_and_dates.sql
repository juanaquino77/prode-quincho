-- Corrección definitiva: fechas, horarios y estadios de todos los partidos de eliminatorias.
-- Fuente: Wikipedia 2026 FIFA World Cup knockout stage (verificado contra FIFA.com y ESPN).
-- El formato 2026 tiene 32 equipos en eliminatorias → Ronda de 32, Octavos, Cuartos, Semis, Final.
-- UTC = hora ET + 4h (EDT), CT + 5h (CDT), PT + 7h (PDT).

-- =====================================================================
-- RONDA DE 32 (28 jun – 3 jul)
-- =====================================================================
UPDATE public.matches SET match_date = '2026-06-28T19:00:00Z', venue = 'SoFi Stadium, Los Ángeles'            WHERE competition = 'mundial_2026' AND match_number = 73;
UPDATE public.matches SET match_date = '2026-06-29T16:00:00Z', venue = 'NRG Stadium, Houston'                 WHERE competition = 'mundial_2026' AND match_number = 74;
UPDATE public.matches SET match_date = '2026-06-29T20:30:00Z', venue = 'Gillette Stadium, Boston'             WHERE competition = 'mundial_2026' AND match_number = 75;
UPDATE public.matches SET match_date = '2026-06-30T00:00:00Z', venue = 'Estadio BBVA, Monterrey'             WHERE competition = 'mundial_2026' AND match_number = 76;
UPDATE public.matches SET match_date = '2026-06-30T16:00:00Z', venue = 'AT&T Stadium, Arlington'              WHERE competition = 'mundial_2026' AND match_number = 77;
UPDATE public.matches SET match_date = '2026-06-30T21:00:00Z', venue = 'MetLife Stadium, Nueva York'          WHERE competition = 'mundial_2026' AND match_number = 78;
UPDATE public.matches SET match_date = '2026-07-01T00:00:00Z', venue = 'Estadio Azteca, Ciudad de México'     WHERE competition = 'mundial_2026' AND match_number = 79;
UPDATE public.matches SET match_date = '2026-07-01T16:00:00Z', venue = 'Mercedes-Benz Stadium, Atlanta'       WHERE competition = 'mundial_2026' AND match_number = 80;
UPDATE public.matches SET match_date = '2026-07-01T20:00:00Z', venue = 'Lumen Field, Seattle'                 WHERE competition = 'mundial_2026' AND match_number = 81;
UPDATE public.matches SET match_date = '2026-07-02T00:00:00Z', venue = 'Levi''s Stadium, San Francisco'       WHERE competition = 'mundial_2026' AND match_number = 82;
UPDATE public.matches SET match_date = '2026-07-02T19:00:00Z', venue = 'SoFi Stadium, Los Ángeles'            WHERE competition = 'mundial_2026' AND match_number = 83;
UPDATE public.matches SET match_date = '2026-07-02T23:00:00Z', venue = 'BMO Field, Toronto'                   WHERE competition = 'mundial_2026' AND match_number = 84;
UPDATE public.matches SET match_date = '2026-07-03T03:00:00Z', venue = 'BC Place, Vancouver'                  WHERE competition = 'mundial_2026' AND match_number = 85;
UPDATE public.matches SET match_date = '2026-07-03T17:00:00Z', venue = 'AT&T Stadium, Arlington'              WHERE competition = 'mundial_2026' AND match_number = 86;

-- =====================================================================
-- OCTAVOS DE FINAL (4 – 7 jul)
-- =====================================================================
UPDATE public.matches SET match_date = '2026-07-04T16:00:00Z', venue = 'NRG Stadium, Houston'                 WHERE competition = 'mundial_2026' AND match_number = 87;
UPDATE public.matches SET match_date = '2026-07-04T21:00:00Z', venue = 'Lincoln Financial Field, Filadelfia' WHERE competition = 'mundial_2026' AND match_number = 88;
UPDATE public.matches SET match_date = '2026-07-05T20:00:00Z', venue = 'MetLife Stadium, Nueva York'          WHERE competition = 'mundial_2026' AND match_number = 89;
UPDATE public.matches SET match_date = '2026-07-05T23:00:00Z', venue = 'Estadio Azteca, Ciudad de México'     WHERE competition = 'mundial_2026' AND match_number = 90;
UPDATE public.matches SET match_date = '2026-07-06T18:00:00Z', venue = 'AT&T Stadium, Arlington'              WHERE competition = 'mundial_2026' AND match_number = 91;
UPDATE public.matches SET match_date = '2026-07-07T00:00:00Z', venue = 'Lumen Field, Seattle'                 WHERE competition = 'mundial_2026' AND match_number = 92;
UPDATE public.matches SET match_date = '2026-07-07T16:00:00Z', venue = 'Mercedes-Benz Stadium, Atlanta'       WHERE competition = 'mundial_2026' AND match_number = 93;
UPDATE public.matches SET match_date = '2026-07-07T20:00:00Z', venue = 'BC Place, Vancouver'                  WHERE competition = 'mundial_2026' AND match_number = 94;

-- =====================================================================
-- CUARTOS DE FINAL (9 – 11 jul)
-- =====================================================================
UPDATE public.matches SET match_date = '2026-07-09T20:00:00Z', venue = 'Gillette Stadium, Boston'             WHERE competition = 'mundial_2026' AND match_number = 95;
UPDATE public.matches SET match_date = '2026-07-10T19:00:00Z', venue = 'SoFi Stadium, Los Ángeles'            WHERE competition = 'mundial_2026' AND match_number = 96;
UPDATE public.matches SET match_date = '2026-07-11T21:00:00Z', venue = 'Hard Rock Stadium, Miami'             WHERE competition = 'mundial_2026' AND match_number = 97;
UPDATE public.matches SET match_date = '2026-07-12T00:00:00Z', venue = 'Arrowhead Stadium, Kansas City'       WHERE competition = 'mundial_2026' AND match_number = 98;

-- =====================================================================
-- SEMIFINALES (14 – 15 jul)
-- =====================================================================
UPDATE public.matches SET match_date = '2026-07-14T18:00:00Z', venue = 'AT&T Stadium, Arlington'              WHERE competition = 'mundial_2026' AND match_number = 99;
UPDATE public.matches SET match_date = '2026-07-15T19:00:00Z', venue = 'Mercedes-Benz Stadium, Atlanta'       WHERE competition = 'mundial_2026' AND match_number = 100;

-- =====================================================================
-- TERCER PUESTO (18 jul)
-- =====================================================================
UPDATE public.matches SET match_date = '2026-07-18T21:00:00Z', venue = 'Hard Rock Stadium, Miami'             WHERE competition = 'mundial_2026' AND match_number = 101;

-- =====================================================================
-- FINAL (19 jul) — MetLife Stadium, Nueva York/Nueva Jersey
-- =====================================================================
UPDATE public.matches SET match_date = '2026-07-19T19:00:00Z', venue = 'MetLife Stadium, Nueva York'          WHERE competition = 'mundial_2026' AND match_number = 102;
