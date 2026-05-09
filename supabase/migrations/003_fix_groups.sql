-- ============================================================
-- PRODE QUINCHO - Fix grupos fase de grupos Mundial 2026
-- Reemplaza los equipos provisionales del sorteo de dic 2024
-- con los clasificados finales confirmados
-- ============================================================

delete from public.matches where stage = 'group';

insert into public.matches (match_number, stage, group_name, home_team, away_team, home_flag, away_flag, match_date, venue, status) values
-- GRUPO A: México, Sudáfrica, Corea del Sur, República Checa
(1, 'group', 'A', 'México', 'Sudáfrica', '🇲🇽', '🇿🇦', '2026-06-11T23:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(2, 'group', 'A', 'Corea del Sur', 'República Checa', '🇰🇷', '🇨🇿', '2026-06-12T02:00:00Z', 'Estadio Azteca, Ciudad de México', 'upcoming'),
(3, 'group', 'A', 'México', 'Corea del Sur', '🇲🇽', '🇰🇷', '2026-06-15T23:00:00Z', 'Estadio Azteca, Ciudad de México', 'upcoming'),
(4, 'group', 'A', 'República Checa', 'Sudáfrica', '🇨🇿', '🇿🇦', '2026-06-16T02:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(5, 'group', 'A', 'México', 'República Checa', '🇲🇽', '🇨🇿', '2026-06-20T01:00:00Z', 'Estadio Azteca, Ciudad de México', 'upcoming'),
(6, 'group', 'A', 'Sudáfrica', 'Corea del Sur', '🇿🇦', '🇰🇷', '2026-06-20T01:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
-- GRUPO B: Canadá, Bosnia y Herzegovina, Qatar, Suiza
(7, 'group', 'B', 'Canadá', 'Bosnia y Herzegovina', '🇨🇦', '🇧🇦', '2026-06-12T23:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(8, 'group', 'B', 'Qatar', 'Suiza', '🇶🇦', '🇨🇭', '2026-06-13T02:00:00Z', 'SoFi Stadium, Los Ángeles', 'upcoming'),
(9, 'group', 'B', 'Canadá', 'Qatar', '🇨🇦', '🇶🇦', '2026-06-16T23:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(10, 'group', 'B', 'Suiza', 'Bosnia y Herzegovina', '🇨🇭', '🇧🇦', '2026-06-17T02:00:00Z', 'Levi''s Stadium, San Francisco', 'upcoming'),
(11, 'group', 'B', 'Canadá', 'Suiza', '🇨🇦', '🇨🇭', '2026-06-21T01:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(12, 'group', 'B', 'Bosnia y Herzegovina', 'Qatar', '🇧🇦', '🇶🇦', '2026-06-21T01:00:00Z', 'Estadio Akron, Guadalajara', 'upcoming'),
-- GRUPO C: Brasil, Marruecos, Haití, Escocia
(13, 'group', 'C', 'Brasil', 'Marruecos', '🇧🇷', '🇲🇦', '2026-06-13T23:00:00Z', 'Levi''s Stadium, San Francisco', 'upcoming'),
(14, 'group', 'C', 'Haití', 'Escocia', '🇭🇹', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '2026-06-14T02:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(15, 'group', 'C', 'Brasil', 'Haití', '🇧🇷', '🇭🇹', '2026-06-17T23:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(16, 'group', 'C', 'Escocia', 'Marruecos', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🇲🇦', '2026-06-18T02:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(17, 'group', 'C', 'Brasil', 'Escocia', '🇧🇷', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '2026-06-22T01:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(18, 'group', 'C', 'Marruecos', 'Haití', '🇲🇦', '🇭🇹', '2026-06-22T01:00:00Z', 'Estadio Azteca, Ciudad de México', 'upcoming'),
-- GRUPO D: Estados Unidos, Paraguay, Australia, Turquía
(19, 'group', 'D', 'Estados Unidos', 'Paraguay', '🇺🇸', '🇵🇾', '2026-06-13T22:00:00Z', 'BMO Field, Toronto', 'upcoming'),
(20, 'group', 'D', 'Australia', 'Turquía', '🇦🇺', '🇹🇷', '2026-06-14T01:00:00Z', 'BMO Field, Toronto', 'upcoming'),
(21, 'group', 'D', 'Estados Unidos', 'Australia', '🇺🇸', '🇦🇺', '2026-06-17T22:00:00Z', 'BC Place, Vancouver', 'upcoming'),
(22, 'group', 'D', 'Turquía', 'Paraguay', '🇹🇷', '🇵🇾', '2026-06-18T01:00:00Z', 'BMO Field, Toronto', 'upcoming'),
(23, 'group', 'D', 'Estados Unidos', 'Turquía', '🇺🇸', '🇹🇷', '2026-06-22T00:00:00Z', 'BC Place, Vancouver', 'upcoming'),
(24, 'group', 'D', 'Paraguay', 'Australia', '🇵🇾', '🇦🇺', '2026-06-22T00:00:00Z', 'BMO Field, Toronto', 'upcoming'),
-- GRUPO E: Alemania, Curazao, Costa de Marfil, Ecuador
(25, 'group', 'E', 'Alemania', 'Curazao', '🇩🇪', '🇨🇼', '2026-06-14T20:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(26, 'group', 'E', 'Costa de Marfil', 'Ecuador', '🇨🇮', '🇪🇨', '2026-06-14T23:00:00Z', 'SoFi Stadium, Los Ángeles', 'upcoming'),
(27, 'group', 'E', 'Alemania', 'Costa de Marfil', '🇩🇪', '🇨🇮', '2026-06-18T20:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(28, 'group', 'E', 'Ecuador', 'Curazao', '🇪🇨', '🇨🇼', '2026-06-18T23:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(29, 'group', 'E', 'Alemania', 'Ecuador', '🇩🇪', '🇪🇨', '2026-06-23T01:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(30, 'group', 'E', 'Curazao', 'Costa de Marfil', '🇨🇼', '🇨🇮', '2026-06-23T01:00:00Z', 'Levi''s Stadium, San Francisco', 'upcoming'),
-- GRUPO F: Países Bajos, Japón, Suecia, Túnez
(31, 'group', 'F', 'Países Bajos', 'Japón', '🇳🇱', '🇯🇵', '2026-06-14T19:00:00Z', 'BMO Field, Toronto', 'upcoming'),
(32, 'group', 'F', 'Suecia', 'Túnez', '🇸🇪', '🇹🇳', '2026-06-14T22:00:00Z', 'BC Place, Vancouver', 'upcoming'),
(33, 'group', 'F', 'Países Bajos', 'Suecia', '🇳🇱', '🇸🇪', '2026-06-18T19:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(34, 'group', 'F', 'Túnez', 'Japón', '🇹🇳', '🇯🇵', '2026-06-18T22:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(35, 'group', 'F', 'Países Bajos', 'Túnez', '🇳🇱', '🇹🇳', '2026-06-23T00:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(36, 'group', 'F', 'Japón', 'Suecia', '🇯🇵', '🇸🇪', '2026-06-23T00:00:00Z', 'BMO Field, Toronto', 'upcoming'),
-- GRUPO G: Bélgica, Egipto, Irán, Nueva Zelanda
(37, 'group', 'G', 'Bélgica', 'Egipto', '🇧🇪', '🇪🇬', '2026-06-15T20:00:00Z', 'SoFi Stadium, Los Ángeles', 'upcoming'),
(38, 'group', 'G', 'Irán', 'Nueva Zelanda', '🇮🇷', '🇳🇿', '2026-06-15T23:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(39, 'group', 'G', 'Bélgica', 'Irán', '🇧🇪', '🇮🇷', '2026-06-19T20:00:00Z', 'SoFi Stadium, Los Ángeles', 'upcoming'),
(40, 'group', 'G', 'Nueva Zelanda', 'Egipto', '🇳🇿', '🇪🇬', '2026-06-19T23:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(41, 'group', 'G', 'Bélgica', 'Nueva Zelanda', '🇧🇪', '🇳🇿', '2026-06-24T01:00:00Z', 'Estadio Azteca, Ciudad de México', 'upcoming'),
(42, 'group', 'G', 'Egipto', 'Irán', '🇪🇬', '🇮🇷', '2026-06-24T01:00:00Z', 'Levi''s Stadium, San Francisco', 'upcoming'),
-- GRUPO H: España, Cabo Verde, Arabia Saudita, Uruguay
(43, 'group', 'H', 'España', 'Cabo Verde', '🇪🇸', '🇨🇻', '2026-06-15T19:00:00Z', 'BC Place, Vancouver', 'upcoming'),
(44, 'group', 'H', 'Arabia Saudita', 'Uruguay', '🇸🇦', '🇺🇾', '2026-06-15T22:00:00Z', 'BMO Field, Toronto', 'upcoming'),
(45, 'group', 'H', 'España', 'Arabia Saudita', '🇪🇸', '🇸🇦', '2026-06-19T19:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(46, 'group', 'H', 'Uruguay', 'Cabo Verde', '🇺🇾', '🇨🇻', '2026-06-19T22:00:00Z', 'BC Place, Vancouver', 'upcoming'),
(47, 'group', 'H', 'España', 'Uruguay', '🇪🇸', '🇺🇾', '2026-06-24T00:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(48, 'group', 'H', 'Cabo Verde', 'Arabia Saudita', '🇨🇻', '🇸🇦', '2026-06-24T00:00:00Z', 'BMO Field, Toronto', 'upcoming'),
-- GRUPO I: Francia, Senegal, Irak, Noruega
(49, 'group', 'I', 'Francia', 'Senegal', '🇫🇷', '🇸🇳', '2026-06-16T20:00:00Z', 'Levi''s Stadium, San Francisco', 'upcoming'),
(50, 'group', 'I', 'Irak', 'Noruega', '🇮🇶', '🇳🇴', '2026-06-16T23:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(51, 'group', 'I', 'Francia', 'Irak', '🇫🇷', '🇮🇶', '2026-06-20T20:00:00Z', 'SoFi Stadium, Los Ángeles', 'upcoming'),
(52, 'group', 'I', 'Noruega', 'Senegal', '🇳🇴', '🇸🇳', '2026-06-20T23:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(53, 'group', 'I', 'Francia', 'Noruega', '🇫🇷', '🇳🇴', '2026-06-25T01:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(54, 'group', 'I', 'Senegal', 'Irak', '🇸🇳', '🇮🇶', '2026-06-25T01:00:00Z', 'Estadio Azteca, Ciudad de México', 'upcoming'),
-- GRUPO J: Argentina, Argelia, Austria, Jordania
(55, 'group', 'J', 'Argentina', 'Argelia', '🇦🇷', '🇩🇿', '2026-06-16T19:00:00Z', 'BMO Field, Toronto', 'upcoming'),
(56, 'group', 'J', 'Austria', 'Jordania', '🇦🇹', '🇯🇴', '2026-06-16T22:00:00Z', 'BC Place, Vancouver', 'upcoming'),
(57, 'group', 'J', 'Argentina', 'Austria', '🇦🇷', '🇦🇹', '2026-06-20T19:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(58, 'group', 'J', 'Jordania', 'Argelia', '🇯🇴', '🇩🇿', '2026-06-20T22:00:00Z', 'BMO Field, Toronto', 'upcoming'),
(59, 'group', 'J', 'Argentina', 'Jordania', '🇦🇷', '🇯🇴', '2026-06-25T00:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(60, 'group', 'J', 'Argelia', 'Austria', '🇩🇿', '🇦🇹', '2026-06-25T00:00:00Z', 'BC Place, Vancouver', 'upcoming'),
-- GRUPO K: Portugal, Rep. Dem. del Congo, Uzbekistán, Colombia
(61, 'group', 'K', 'Portugal', 'Rep. Dem. del Congo', '🇵🇹', '🇨🇩', '2026-06-17T20:00:00Z', 'SoFi Stadium, Los Ángeles', 'upcoming'),
(62, 'group', 'K', 'Uzbekistán', 'Colombia', '🇺🇿', '🇨🇴', '2026-06-17T23:00:00Z', 'Estadio Azteca, Ciudad de México', 'upcoming'),
(63, 'group', 'K', 'Portugal', 'Uzbekistán', '🇵🇹', '🇺🇿', '2026-06-21T20:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(64, 'group', 'K', 'Colombia', 'Rep. Dem. del Congo', '🇨🇴', '🇨🇩', '2026-06-21T23:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(65, 'group', 'K', 'Portugal', 'Colombia', '🇵🇹', '🇨🇴', '2026-06-26T01:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(66, 'group', 'K', 'Rep. Dem. del Congo', 'Uzbekistán', '🇨🇩', '🇺🇿', '2026-06-26T01:00:00Z', 'Estadio Akron, Guadalajara', 'upcoming'),
-- GRUPO L: Inglaterra, Croacia, Ghana, Panamá
(67, 'group', 'L', 'Inglaterra', 'Croacia', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🇭🇷', '2026-06-17T19:00:00Z', 'BC Place, Vancouver', 'upcoming'),
(68, 'group', 'L', 'Ghana', 'Panamá', '🇬🇭', '🇵🇦', '2026-06-17T22:00:00Z', 'BMO Field, Toronto', 'upcoming'),
(69, 'group', 'L', 'Inglaterra', 'Ghana', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🇬🇭', '2026-06-21T19:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(70, 'group', 'L', 'Panamá', 'Croacia', '🇵🇦', '🇭🇷', '2026-06-21T22:00:00Z', 'BC Place, Vancouver', 'upcoming'),
(71, 'group', 'L', 'Inglaterra', 'Panamá', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🇵🇦', '2026-06-26T00:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(72, 'group', 'L', 'Croacia', 'Ghana', '🇭🇷', '🇬🇭', '2026-06-26T00:00:00Z', 'BMO Field, Toronto', 'upcoming')

on conflict (match_number) do update set
  home_team = excluded.home_team,
  away_team = excluded.away_team,
  home_flag = excluded.home_flag,
  away_flag = excluded.away_flag;
