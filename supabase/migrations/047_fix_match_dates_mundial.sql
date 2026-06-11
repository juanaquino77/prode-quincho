-- Corrección completa de horarios del Mundial 2026
-- Fuente: ESPN Argentina / horario oficial FIFA en hora argentina (UTC-3)
-- Todos los timestamps están en UTC (hora argentina + 3hs)

-- GRUPO A
UPDATE public.matches SET match_date = '2026-06-11T19:00:00Z' WHERE competition = 'mundial_2026' AND home_team = 'México' AND away_team = 'Sudáfrica';
UPDATE public.matches SET match_date = '2026-06-12T02:00:00Z' WHERE competition = 'mundial_2026' AND home_team = 'Corea del Sur' AND away_team = 'República Checa';
UPDATE public.matches SET match_date = '2026-06-18T16:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'República Checa' AND away_team = 'Sudáfrica') OR (home_team = 'Sudáfrica' AND away_team = 'República Checa'));
UPDATE public.matches SET match_date = '2026-06-19T01:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'México' AND away_team = 'Corea del Sur') OR (home_team = 'Corea del Sur' AND away_team = 'México'));
UPDATE public.matches SET match_date = '2026-06-25T01:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Sudáfrica' AND away_team = 'Corea del Sur') OR (home_team = 'Corea del Sur' AND away_team = 'Sudáfrica'));
UPDATE public.matches SET match_date = '2026-06-25T01:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'República Checa' AND away_team = 'México') OR (home_team = 'México' AND away_team = 'República Checa'));

-- GRUPO B
UPDATE public.matches SET match_date = '2026-06-12T19:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Canadá' AND away_team = 'Bosnia y Herzegovina') OR (home_team = 'Bosnia y Herzegovina' AND away_team = 'Canadá'));
UPDATE public.matches SET match_date = '2026-06-13T19:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Qatar' AND away_team = 'Suiza') OR (home_team = 'Suiza' AND away_team = 'Qatar'));
UPDATE public.matches SET match_date = '2026-06-18T19:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Suiza' AND away_team = 'Bosnia y Herzegovina') OR (home_team = 'Bosnia y Herzegovina' AND away_team = 'Suiza'));
UPDATE public.matches SET match_date = '2026-06-18T22:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Canadá' AND away_team = 'Qatar') OR (home_team = 'Qatar' AND away_team = 'Canadá'));
UPDATE public.matches SET match_date = '2026-06-24T19:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Suiza' AND away_team = 'Canadá') OR (home_team = 'Canadá' AND away_team = 'Suiza'));
UPDATE public.matches SET match_date = '2026-06-24T19:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Bosnia y Herzegovina' AND away_team = 'Qatar') OR (home_team = 'Qatar' AND away_team = 'Bosnia y Herzegovina'));

-- GRUPO C
UPDATE public.matches SET match_date = '2026-06-13T22:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Brasil' AND away_team = 'Marruecos') OR (home_team = 'Marruecos' AND away_team = 'Brasil'));
UPDATE public.matches SET match_date = '2026-06-14T01:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Haití' AND away_team = 'Escocia') OR (home_team = 'Escocia' AND away_team = 'Haití'));
UPDATE public.matches SET match_date = '2026-06-19T22:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Escocia' AND away_team = 'Marruecos') OR (home_team = 'Marruecos' AND away_team = 'Escocia'));
UPDATE public.matches SET match_date = '2026-06-20T00:30:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Brasil' AND away_team = 'Haití') OR (home_team = 'Haití' AND away_team = 'Brasil'));
UPDATE public.matches SET match_date = '2026-06-24T22:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Marruecos' AND away_team = 'Haití') OR (home_team = 'Haití' AND away_team = 'Marruecos'));
UPDATE public.matches SET match_date = '2026-06-24T22:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Brasil' AND away_team = 'Escocia') OR (home_team = 'Escocia' AND away_team = 'Brasil'));

-- GRUPO D
UPDATE public.matches SET match_date = '2026-06-13T01:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Estados Unidos' AND away_team = 'Paraguay') OR (home_team = 'Paraguay' AND away_team = 'Estados Unidos'));
UPDATE public.matches SET match_date = '2026-06-13T04:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Australia' AND away_team = 'Turquía') OR (home_team = 'Turquía' AND away_team = 'Australia'));
UPDATE public.matches SET match_date = '2026-06-19T19:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Estados Unidos' AND away_team = 'Australia') OR (home_team = 'Australia' AND away_team = 'Estados Unidos'));
UPDATE public.matches SET match_date = '2026-06-19T03:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Turquía' AND away_team = 'Paraguay') OR (home_team = 'Paraguay' AND away_team = 'Turquía'));
UPDATE public.matches SET match_date = '2026-06-26T02:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Paraguay' AND away_team = 'Australia') OR (home_team = 'Australia' AND away_team = 'Paraguay'));
UPDATE public.matches SET match_date = '2026-06-26T02:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Turquía' AND away_team = 'Estados Unidos') OR (home_team = 'Estados Unidos' AND away_team = 'Turquía'));

-- GRUPO E
UPDATE public.matches SET match_date = '2026-06-14T17:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Alemania' AND away_team = 'Curazao') OR (home_team = 'Curazao' AND away_team = 'Alemania'));
UPDATE public.matches SET match_date = '2026-06-14T23:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Costa de Marfil' AND away_team = 'Ecuador') OR (home_team = 'Ecuador' AND away_team = 'Costa de Marfil'));
UPDATE public.matches SET match_date = '2026-06-20T20:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Alemania' AND away_team = 'Costa de Marfil') OR (home_team = 'Costa de Marfil' AND away_team = 'Alemania'));
UPDATE public.matches SET match_date = '2026-06-21T00:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Ecuador' AND away_team = 'Curazao') OR (home_team = 'Curazao' AND away_team = 'Ecuador'));
UPDATE public.matches SET match_date = '2026-06-25T20:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Curazao' AND away_team = 'Costa de Marfil') OR (home_team = 'Costa de Marfil' AND away_team = 'Curazao'));
UPDATE public.matches SET match_date = '2026-06-25T20:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Ecuador' AND away_team = 'Alemania') OR (home_team = 'Alemania' AND away_team = 'Ecuador'));

-- GRUPO F
UPDATE public.matches SET match_date = '2026-06-14T20:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Países Bajos' AND away_team = 'Japón') OR (home_team = 'Japón' AND away_team = 'Países Bajos'));
UPDATE public.matches SET match_date = '2026-06-15T02:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Suecia' AND away_team = 'Túnez') OR (home_team = 'Túnez' AND away_team = 'Suecia'));
UPDATE public.matches SET match_date = '2026-06-20T17:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Países Bajos' AND away_team = 'Suecia') OR (home_team = 'Suecia' AND away_team = 'Países Bajos'));
UPDATE public.matches SET match_date = '2026-06-20T04:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Túnez' AND away_team = 'Japón') OR (home_team = 'Japón' AND away_team = 'Túnez'));
UPDATE public.matches SET match_date = '2026-06-25T23:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Japón' AND away_team = 'Suecia') OR (home_team = 'Suecia' AND away_team = 'Japón'));
UPDATE public.matches SET match_date = '2026-06-25T23:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Túnez' AND away_team = 'Países Bajos') OR (home_team = 'Países Bajos' AND away_team = 'Túnez'));

-- GRUPO G
UPDATE public.matches SET match_date = '2026-06-15T19:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Bélgica' AND away_team = 'Egipto') OR (home_team = 'Egipto' AND away_team = 'Bélgica'));
UPDATE public.matches SET match_date = '2026-06-16T01:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Irán' AND away_team = 'Nueva Zelanda') OR (home_team = 'Nueva Zelanda' AND away_team = 'Irán'));
UPDATE public.matches SET match_date = '2026-06-21T19:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Bélgica' AND away_team = 'Irán') OR (home_team = 'Irán' AND away_team = 'Bélgica'));
UPDATE public.matches SET match_date = '2026-06-22T01:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Nueva Zelanda' AND away_team = 'Egipto') OR (home_team = 'Egipto' AND away_team = 'Nueva Zelanda'));
UPDATE public.matches SET match_date = '2026-06-26T03:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Egipto' AND away_team = 'Irán') OR (home_team = 'Irán' AND away_team = 'Egipto'));
UPDATE public.matches SET match_date = '2026-06-26T03:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Nueva Zelanda' AND away_team = 'Bélgica') OR (home_team = 'Bélgica' AND away_team = 'Nueva Zelanda'));

-- GRUPO H
UPDATE public.matches SET match_date = '2026-06-15T16:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'España' AND away_team = 'Cabo Verde') OR (home_team = 'Cabo Verde' AND away_team = 'España'));
UPDATE public.matches SET match_date = '2026-06-15T22:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Arabia Saudita' AND away_team = 'Uruguay') OR (home_team = 'Uruguay' AND away_team = 'Arabia Saudita'));
UPDATE public.matches SET match_date = '2026-06-21T16:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'España' AND away_team = 'Arabia Saudita') OR (home_team = 'Arabia Saudita' AND away_team = 'España'));
UPDATE public.matches SET match_date = '2026-06-21T22:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Uruguay' AND away_team = 'Cabo Verde') OR (home_team = 'Cabo Verde' AND away_team = 'Uruguay'));
UPDATE public.matches SET match_date = '2026-06-27T00:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Cabo Verde' AND away_team = 'Arabia Saudita') OR (home_team = 'Arabia Saudita' AND away_team = 'Cabo Verde'));
UPDATE public.matches SET match_date = '2026-06-27T00:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Uruguay' AND away_team = 'España') OR (home_team = 'España' AND away_team = 'Uruguay'));

-- GRUPO I
UPDATE public.matches SET match_date = '2026-06-16T19:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Francia' AND away_team = 'Senegal') OR (home_team = 'Senegal' AND away_team = 'Francia'));
UPDATE public.matches SET match_date = '2026-06-16T22:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Irak' AND away_team = 'Noruega') OR (home_team = 'Noruega' AND away_team = 'Irak'));
UPDATE public.matches SET match_date = '2026-06-22T21:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Francia' AND away_team = 'Irak') OR (home_team = 'Irak' AND away_team = 'Francia'));
UPDATE public.matches SET match_date = '2026-06-23T00:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Noruega' AND away_team = 'Senegal') OR (home_team = 'Senegal' AND away_team = 'Noruega'));
UPDATE public.matches SET match_date = '2026-06-26T19:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Noruega' AND away_team = 'Francia') OR (home_team = 'Francia' AND away_team = 'Noruega'));
UPDATE public.matches SET match_date = '2026-06-26T19:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Senegal' AND away_team = 'Irak') OR (home_team = 'Irak' AND away_team = 'Senegal'));

-- GRUPO J
UPDATE public.matches SET match_date = '2026-06-16T04:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Austria' AND away_team = 'Jordania') OR (home_team = 'Jordania' AND away_team = 'Austria'));
UPDATE public.matches SET match_date = '2026-06-17T01:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Argentina' AND away_team = 'Argelia') OR (home_team = 'Argelia' AND away_team = 'Argentina'));
UPDATE public.matches SET match_date = '2026-06-22T17:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Argentina' AND away_team = 'Austria') OR (home_team = 'Austria' AND away_team = 'Argentina'));
UPDATE public.matches SET match_date = '2026-06-22T03:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Jordania' AND away_team = 'Argelia') OR (home_team = 'Argelia' AND away_team = 'Jordania'));
UPDATE public.matches SET match_date = '2026-06-28T02:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Argelia' AND away_team = 'Austria') OR (home_team = 'Austria' AND away_team = 'Argelia'));
UPDATE public.matches SET match_date = '2026-06-28T02:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Jordania' AND away_team = 'Argentina') OR (home_team = 'Argentina' AND away_team = 'Jordania'));

-- GRUPO K
UPDATE public.matches SET match_date = '2026-06-17T17:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Portugal' AND away_team = 'Rep. Dem. del Congo') OR (home_team = 'Rep. Dem. del Congo' AND away_team = 'Portugal'));
UPDATE public.matches SET match_date = '2026-06-18T02:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Uzbekistán' AND away_team = 'Colombia') OR (home_team = 'Colombia' AND away_team = 'Uzbekistán'));
UPDATE public.matches SET match_date = '2026-06-23T17:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Portugal' AND away_team = 'Uzbekistán') OR (home_team = 'Uzbekistán' AND away_team = 'Portugal'));
UPDATE public.matches SET match_date = '2026-06-24T02:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Colombia' AND away_team = 'Rep. Dem. del Congo') OR (home_team = 'Rep. Dem. del Congo' AND away_team = 'Colombia'));
UPDATE public.matches SET match_date = '2026-06-27T23:30:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Colombia' AND away_team = 'Portugal') OR (home_team = 'Portugal' AND away_team = 'Colombia'));
UPDATE public.matches SET match_date = '2026-06-27T23:30:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Rep. Dem. del Congo' AND away_team = 'Uzbekistán') OR (home_team = 'Uzbekistán' AND away_team = 'Rep. Dem. del Congo'));

-- GRUPO L
UPDATE public.matches SET match_date = '2026-06-17T20:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Inglaterra' AND away_team = 'Croacia') OR (home_team = 'Croacia' AND away_team = 'Inglaterra'));
UPDATE public.matches SET match_date = '2026-06-17T23:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Ghana' AND away_team = 'Panamá') OR (home_team = 'Panamá' AND away_team = 'Ghana'));
UPDATE public.matches SET match_date = '2026-06-23T20:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Inglaterra' AND away_team = 'Ghana') OR (home_team = 'Ghana' AND away_team = 'Inglaterra'));
UPDATE public.matches SET match_date = '2026-06-23T23:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Panamá' AND away_team = 'Croacia') OR (home_team = 'Croacia' AND away_team = 'Panamá'));
UPDATE public.matches SET match_date = '2026-06-27T21:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Croacia' AND away_team = 'Ghana') OR (home_team = 'Ghana' AND away_team = 'Croacia'));
UPDATE public.matches SET match_date = '2026-06-27T21:00:00Z' WHERE competition = 'mundial_2026' AND ((home_team = 'Panamá' AND away_team = 'Inglaterra') OR (home_team = 'Inglaterra' AND away_team = 'Panamá'));
