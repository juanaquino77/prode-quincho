-- Fix horarios incorrectos en fase de grupos del Mundial 2026
-- Fuente: CBS Sports / Yahoo Sports / NBC Sports (ET = EDT = UTC-4 en junio)
-- Todos los timestamps en UTC. Hora ARG = UTC - 3h.

-- GRUPO G Jornada 1 (15 junio)
-- Bélgica vs Egipto: 3pm ET = 19:00 UTC = 16:00 ART (estaba en 22:00 UTC = 19:00 ART)
UPDATE public.matches
SET match_date = '2026-06-15T19:00:00Z'
WHERE competition = 'mundial_2026'
  AND ((home_team = 'Bélgica' AND away_team = 'Egipto') OR (home_team = 'Egipto' AND away_team = 'Bélgica'));

-- Irán vs Nueva Zelanda: 9pm ET = 01:00 UTC 16/06 = 22:00 ART 15/06 (estaba en 04:00 UTC 16/06)
UPDATE public.matches
SET match_date = '2026-06-16T01:00:00Z'
WHERE competition = 'mundial_2026'
  AND ((home_team = 'Irán' AND away_team = 'Nueva Zelanda') OR (home_team = 'Nueva Zelanda' AND away_team = 'Irán'));

-- GRUPO J Jornada 1 (madrugada 16→17 junio)
-- Austria vs Jordania: midnight ET 16→17 = 04:00 UTC 17/06 = 01:00 ART 17/06 (estaba en 04:00 UTC 16/06, un día antes)
UPDATE public.matches
SET match_date = '2026-06-17T04:00:00Z'
WHERE competition = 'mundial_2026'
  AND ((home_team = 'Austria' AND away_team = 'Jordania') OR (home_team = 'Jordania' AND away_team = 'Austria'));

-- GRUPO A Jornada 2 (18 junio)
-- México vs Corea del Sur: 9pm ET = 01:00 UTC 19/06 = 22:00 ART 18/06 (estaba en 03:00 UTC 19/06)
UPDATE public.matches
SET match_date = '2026-06-19T01:00:00Z'
WHERE competition = 'mundial_2026'
  AND ((home_team = 'México' AND away_team = 'Corea del Sur') OR (home_team = 'Corea del Sur' AND away_team = 'México'));
