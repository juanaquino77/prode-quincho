-- ============================================================
-- PRODE QUINCHO - Partidos Mundial 2026
-- Ejecutar DESPUÉS del script 001_initial.sql
-- ============================================================

insert into public.matches (match_number, stage, group_name, home_team, away_team, home_flag, away_flag, match_date, venue, status) values
-- GRUPO A
(1, 'group', 'A', 'México', 'Jamaica', '🇲🇽', '🇯🇲', '2026-06-11T23:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(2, 'group', 'A', 'Ecuador', 'Venezuela', '🇪🇨', '🇻🇪', '2026-06-12T02:00:00Z', 'Estadio Azteca, Ciudad de México', 'upcoming'),
(3, 'group', 'A', 'México', 'Ecuador', '🇲🇽', '🇪🇨', '2026-06-15T23:00:00Z', 'Estadio Azteca, Ciudad de México', 'upcoming'),
(4, 'group', 'A', 'Venezuela', 'Jamaica', '🇻🇪', '🇯🇲', '2026-06-16T02:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(5, 'group', 'A', 'México', 'Venezuela', '🇲🇽', '🇻🇪', '2026-06-20T01:00:00Z', 'Estadio Azteca, Ciudad de México', 'upcoming'),
(6, 'group', 'A', 'Jamaica', 'Ecuador', '🇯🇲', '🇪🇨', '2026-06-20T01:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
-- GRUPO B
(7, 'group', 'B', 'Argentina', 'Chile', '🇦🇷', '🇨🇱', '2026-06-12T23:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(8, 'group', 'B', 'Perú', 'Australia', '🇵🇪', '🇦🇺', '2026-06-13T02:00:00Z', 'SoFi Stadium, Los Ángeles', 'upcoming'),
(9, 'group', 'B', 'Argentina', 'Perú', '🇦🇷', '🇵🇪', '2026-06-16T23:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(10, 'group', 'B', 'Australia', 'Chile', '🇦🇺', '🇨🇱', '2026-06-17T02:00:00Z', 'Levi''s Stadium, San Francisco', 'upcoming'),
(11, 'group', 'B', 'Argentina', 'Australia', '🇦🇷', '🇦🇺', '2026-06-21T01:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(12, 'group', 'B', 'Chile', 'Perú', '🇨🇱', '🇵🇪', '2026-06-21T01:00:00Z', 'Estadio Akron, Guadalajara', 'upcoming'),
-- GRUPO C
(13, 'group', 'C', 'Estados Unidos', 'Panamá', '🇺🇸', '🇵🇦', '2026-06-13T23:00:00Z', 'Levi''s Stadium, San Francisco', 'upcoming'),
(14, 'group', 'C', 'Uruguay', 'Bolivia', '🇺🇾', '🇧🇴', '2026-06-14T02:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(15, 'group', 'C', 'Estados Unidos', 'Uruguay', '🇺🇸', '🇺🇾', '2026-06-17T23:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(16, 'group', 'C', 'Bolivia', 'Panamá', '🇧🇴', '🇵🇦', '2026-06-18T02:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(17, 'group', 'C', 'Estados Unidos', 'Bolivia', '🇺🇸', '🇧🇴', '2026-06-22T01:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(18, 'group', 'C', 'Panamá', 'Uruguay', '🇵🇦', '🇺🇾', '2026-06-22T01:00:00Z', 'Estadio Azteca, Ciudad de México', 'upcoming'),
-- GRUPO D
(19, 'group', 'D', 'Canadá', 'Marruecos', '🇨🇦', '🇲🇦', '2026-06-13T22:00:00Z', 'BMO Field, Toronto', 'upcoming'),
(20, 'group', 'D', 'Bélgica', 'Croacia', '🇧🇪', '🇭🇷', '2026-06-14T01:00:00Z', 'BMO Field, Toronto', 'upcoming'),
(21, 'group', 'D', 'Canadá', 'Bélgica', '🇨🇦', '🇧🇪', '2026-06-17T22:00:00Z', 'BC Place, Vancouver', 'upcoming'),
(22, 'group', 'D', 'Croacia', 'Marruecos', '🇭🇷', '🇲🇦', '2026-06-18T01:00:00Z', 'BMO Field, Toronto', 'upcoming'),
(23, 'group', 'D', 'Canadá', 'Croacia', '🇨🇦', '🇭🇷', '2026-06-22T00:00:00Z', 'BC Place, Vancouver', 'upcoming'),
(24, 'group', 'D', 'Marruecos', 'Bélgica', '🇲🇦', '🇧🇪', '2026-06-22T00:00:00Z', 'BMO Field, Toronto', 'upcoming'),
-- GRUPO E
(25, 'group', 'E', 'España', 'Senegal', '🇪🇸', '🇸🇳', '2026-06-14T20:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(26, 'group', 'E', 'Turquía', 'Costa Rica', '🇹🇷', '🇨🇷', '2026-06-14T23:00:00Z', 'SoFi Stadium, Los Ángeles', 'upcoming'),
(27, 'group', 'E', 'España', 'Turquía', '🇪🇸', '🇹🇷', '2026-06-18T20:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(28, 'group', 'E', 'Costa Rica', 'Senegal', '🇨🇷', '🇸🇳', '2026-06-18T23:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(29, 'group', 'E', 'España', 'Costa Rica', '🇪🇸', '🇨🇷', '2026-06-23T01:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(30, 'group', 'E', 'Senegal', 'Turquía', '🇸🇳', '🇹🇷', '2026-06-23T01:00:00Z', 'Levi''s Stadium, San Francisco', 'upcoming'),
-- GRUPO F
(31, 'group', 'F', 'Francia', 'Polonia', '🇫🇷', '🇵🇱', '2026-06-14T19:00:00Z', 'BMO Field, Toronto', 'upcoming'),
(32, 'group', 'F', 'Camerún', 'Arabia Saudita', '🇨🇲', '🇸🇦', '2026-06-14T22:00:00Z', 'BC Place, Vancouver', 'upcoming'),
(33, 'group', 'F', 'Francia', 'Camerún', '🇫🇷', '🇨🇲', '2026-06-18T19:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(34, 'group', 'F', 'Arabia Saudita', 'Polonia', '🇸🇦', '🇵🇱', '2026-06-18T22:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(35, 'group', 'F', 'Francia', 'Arabia Saudita', '🇫🇷', '🇸🇦', '2026-06-23T00:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(36, 'group', 'F', 'Polonia', 'Camerún', '🇵🇱', '🇨🇲', '2026-06-23T00:00:00Z', 'BMO Field, Toronto', 'upcoming'),
-- GRUPO G
(37, 'group', 'G', 'Brasil', 'Japón', '🇧🇷', '🇯🇵', '2026-06-15T20:00:00Z', 'SoFi Stadium, Los Ángeles', 'upcoming'),
(38, 'group', 'G', 'Colombia', 'Paraguay', '🇨🇴', '🇵🇾', '2026-06-15T23:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(39, 'group', 'G', 'Brasil', 'Colombia', '🇧🇷', '🇨🇴', '2026-06-19T20:00:00Z', 'SoFi Stadium, Los Ángeles', 'upcoming'),
(40, 'group', 'G', 'Paraguay', 'Japón', '🇵🇾', '🇯🇵', '2026-06-19T23:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(41, 'group', 'G', 'Brasil', 'Paraguay', '🇧🇷', '🇵🇾', '2026-06-24T01:00:00Z', 'Estadio Azteca, Ciudad de México', 'upcoming'),
(42, 'group', 'G', 'Japón', 'Colombia', '🇯🇵', '🇨🇴', '2026-06-24T01:00:00Z', 'Levi''s Stadium, San Francisco', 'upcoming'),
-- GRUPO H
(43, 'group', 'H', 'Inglaterra', 'Eslovaquia', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🇸🇰', '2026-06-15T19:00:00Z', 'BC Place, Vancouver', 'upcoming'),
(44, 'group', 'H', 'Nigeria', 'Honduras', '🇳🇬', '🇭🇳', '2026-06-15T22:00:00Z', 'BMO Field, Toronto', 'upcoming'),
(45, 'group', 'H', 'Inglaterra', 'Nigeria', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🇳🇬', '2026-06-19T19:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(46, 'group', 'H', 'Honduras', 'Eslovaquia', '🇭🇳', '🇸🇰', '2026-06-19T22:00:00Z', 'BC Place, Vancouver', 'upcoming'),
(47, 'group', 'H', 'Inglaterra', 'Honduras', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🇭🇳', '2026-06-24T00:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(48, 'group', 'H', 'Eslovaquia', 'Nigeria', '🇸🇰', '🇳🇬', '2026-06-24T00:00:00Z', 'BMO Field, Toronto', 'upcoming'),
-- GRUPO I
(49, 'group', 'I', 'Portugal', 'República Checa', '🇵🇹', '🇨🇿', '2026-06-16T20:00:00Z', 'Levi''s Stadium, San Francisco', 'upcoming'),
(50, 'group', 'I', 'Corea del Sur', 'Ghana', '🇰🇷', '🇬🇭', '2026-06-16T23:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(51, 'group', 'I', 'Portugal', 'Corea del Sur', '🇵🇹', '🇰🇷', '2026-06-20T20:00:00Z', 'SoFi Stadium, Los Ángeles', 'upcoming'),
(52, 'group', 'I', 'Ghana', 'República Checa', '🇬🇭', '🇨🇿', '2026-06-20T23:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(53, 'group', 'I', 'Portugal', 'Ghana', '🇵🇹', '🇬🇭', '2026-06-25T01:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(54, 'group', 'I', 'República Checa', 'Corea del Sur', '🇨🇿', '🇰🇷', '2026-06-25T01:00:00Z', 'Estadio Azteca, Ciudad de México', 'upcoming'),
-- GRUPO J
(55, 'group', 'J', 'Países Bajos', 'Egipto', '🇳🇱', '🇪🇬', '2026-06-16T19:00:00Z', 'BMO Field, Toronto', 'upcoming'),
(56, 'group', 'J', 'Irán', 'Suiza', '🇮🇷', '🇨🇭', '2026-06-16T22:00:00Z', 'BC Place, Vancouver', 'upcoming'),
(57, 'group', 'J', 'Países Bajos', 'Irán', '🇳🇱', '🇮🇷', '2026-06-20T19:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(58, 'group', 'J', 'Suiza', 'Egipto', '🇨🇭', '🇪🇬', '2026-06-20T22:00:00Z', 'BMO Field, Toronto', 'upcoming'),
(59, 'group', 'J', 'Países Bajos', 'Suiza', '🇳🇱', '🇨🇭', '2026-06-25T00:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(60, 'group', 'J', 'Egipto', 'Irán', '🇪🇬', '🇮🇷', '2026-06-25T00:00:00Z', 'BC Place, Vancouver', 'upcoming'),
-- GRUPO K
(61, 'group', 'K', 'Alemania', 'Costa de Marfil', '🇩🇪', '🇨🇮', '2026-06-17T20:00:00Z', 'SoFi Stadium, Los Ángeles', 'upcoming'),
(62, 'group', 'K', 'Serbia', 'Guatemala', '🇷🇸', '🇬🇹', '2026-06-17T23:00:00Z', 'Estadio Azteca, Ciudad de México', 'upcoming'),
(63, 'group', 'K', 'Alemania', 'Serbia', '🇩🇪', '🇷🇸', '2026-06-21T20:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(64, 'group', 'K', 'Guatemala', 'Costa de Marfil', '🇬🇹', '🇨🇮', '2026-06-21T23:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(65, 'group', 'K', 'Alemania', 'Guatemala', '🇩🇪', '🇬🇹', '2026-06-26T01:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(66, 'group', 'K', 'Costa de Marfil', 'Serbia', '🇨🇮', '🇷🇸', '2026-06-26T01:00:00Z', 'Estadio Akron, Guadalajara', 'upcoming'),
-- GRUPO L
(67, 'group', 'L', 'Italia', 'Dinamarca', '🇮🇹', '🇩🇰', '2026-06-17T19:00:00Z', 'BC Place, Vancouver', 'upcoming'),
(68, 'group', 'L', 'Argelia', 'Nueva Zelanda', '🇩🇿', '🇳🇿', '2026-06-17T22:00:00Z', 'BMO Field, Toronto', 'upcoming'),
(69, 'group', 'L', 'Italia', 'Argelia', '🇮🇹', '🇩🇿', '2026-06-21T19:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(70, 'group', 'L', 'Nueva Zelanda', 'Dinamarca', '🇳🇿', '🇩🇰', '2026-06-21T22:00:00Z', 'BC Place, Vancouver', 'upcoming'),
(71, 'group', 'L', 'Italia', 'Nueva Zelanda', '🇮🇹', '🇳🇿', '2026-06-26T00:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(72, 'group', 'L', 'Dinamarca', 'Argelia', '🇩🇰', '🇩🇿', '2026-06-26T00:00:00Z', 'BMO Field, Toronto', 'upcoming'),

-- RONDA DE 32 (placeholders)
(73, 'round_of_32', null, '1° Grupo A', '2° Grupo B', '🏆', '🏆', '2026-07-04T19:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(74, 'round_of_32', null, '1° Grupo B', '2° Grupo A', '🏆', '🏆', '2026-07-04T23:00:00Z', 'SoFi Stadium, Los Ángeles', 'upcoming'),
(75, 'round_of_32', null, '1° Grupo C', '2° Grupo D', '🏆', '🏆', '2026-07-05T19:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(76, 'round_of_32', null, '1° Grupo D', '2° Grupo C', '🏆', '🏆', '2026-07-05T23:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(77, 'round_of_32', null, '1° Grupo E', '2° Grupo F', '🏆', '🏆', '2026-07-06T19:00:00Z', 'Levi''s Stadium, San Francisco', 'upcoming'),
(78, 'round_of_32', null, '1° Grupo F', '2° Grupo E', '🏆', '🏆', '2026-07-06T23:00:00Z', 'Estadio Azteca, Ciudad de México', 'upcoming'),
(79, 'round_of_32', null, '1° Grupo G', '2° Grupo H', '🏆', '🏆', '2026-07-07T19:00:00Z', 'BMO Field, Toronto', 'upcoming'),
(80, 'round_of_32', null, '1° Grupo H', '2° Grupo G', '🏆', '🏆', '2026-07-07T23:00:00Z', 'BC Place, Vancouver', 'upcoming'),
(81, 'round_of_32', null, '1° Grupo I', '2° Grupo J', '🏆', '🏆', '2026-07-08T02:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(82, 'round_of_32', null, '1° Grupo J', '2° Grupo I', '🏆', '🏆', '2026-07-08T19:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(83, 'round_of_32', null, '1° Grupo K', '2° Grupo L', '🏆', '🏆', '2026-07-08T23:00:00Z', 'SoFi Stadium, Los Ángeles', 'upcoming'),
(84, 'round_of_32', null, '1° Grupo L', '2° Grupo K', '🏆', '🏆', '2026-07-09T02:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(85, 'round_of_32', null, 'Mejor 3° (A/B/C)', 'Mejor 3° (D/E/F)', '🏆', '🏆', '2026-07-09T19:00:00Z', 'Estadio Azteca, Ciudad de México', 'upcoming'),
(86, 'round_of_32', null, 'Mejor 3° (G/H/I)', 'Mejor 3° (J/K/L)', '🏆', '🏆', '2026-07-09T23:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),

-- OCTAVOS DE FINAL
(87, 'round_of_16', null, 'Ganador R32-1', 'Ganador R32-2', '🏆', '🏆', '2026-07-10T19:00:00Z', 'SoFi Stadium, Los Ángeles', 'upcoming'),
(88, 'round_of_16', null, 'Ganador R32-3', 'Ganador R32-4', '🏆', '🏆', '2026-07-10T23:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(89, 'round_of_16', null, 'Ganador R32-5', 'Ganador R32-6', '🏆', '🏆', '2026-07-11T19:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(90, 'round_of_16', null, 'Ganador R32-7', 'Ganador R32-8', '🏆', '🏆', '2026-07-11T23:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(91, 'round_of_16', null, 'Ganador R32-9', 'Ganador R32-10', '🏆', '🏆', '2026-07-12T19:00:00Z', 'BMO Field, Toronto', 'upcoming'),
(92, 'round_of_16', null, 'Ganador R32-11', 'Ganador R32-12', '🏆', '🏆', '2026-07-12T23:00:00Z', 'BC Place, Vancouver', 'upcoming'),
(93, 'round_of_16', null, 'Ganador R32-13', 'Ganador R32-14', '🏆', '🏆', '2026-07-13T19:00:00Z', 'Levi''s Stadium, San Francisco', 'upcoming'),
(94, 'round_of_16', null, 'Ganador R32-15', 'Ganador R32-16', '🏆', '🏆', '2026-07-13T23:00:00Z', 'Estadio Azteca, Ciudad de México', 'upcoming'),

-- CUARTOS DE FINAL
(95, 'quarterfinal', null, 'Ganador Oct-1', 'Ganador Oct-2', '🏆', '🏆', '2026-07-17T23:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(96, 'quarterfinal', null, 'Ganador Oct-3', 'Ganador Oct-4', '🏆', '🏆', '2026-07-18T23:00:00Z', 'Rose Bowl, Los Ángeles', 'upcoming'),
(97, 'quarterfinal', null, 'Ganador Oct-5', 'Ganador Oct-6', '🏆', '🏆', '2026-07-19T02:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),
(98, 'quarterfinal', null, 'Ganador Oct-7', 'Ganador Oct-8', '🏆', '🏆', '2026-07-19T23:00:00Z', 'SoFi Stadium, Los Ángeles', 'upcoming'),

-- SEMIFINALES
(99, 'semifinal', null, 'Ganador QF-1', 'Ganador QF-2', '🏆', '🏆', '2026-07-26T23:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),
(100, 'semifinal', null, 'Ganador QF-3', 'Ganador QF-4', '🏆', '🏆', '2026-07-27T23:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming'),

-- TERCER PUESTO
(101, 'third_place', null, 'Perdedor SF-1', 'Perdedor SF-2', '🏆', '🏆', '2026-07-30T23:00:00Z', 'AT&T Stadium, Dallas', 'upcoming'),

-- FINAL
(102, 'final', null, 'Campeón SF-1', 'Campeón SF-2', '🏆', '🏆', '2026-08-02T23:00:00Z', 'MetLife Stadium, Nueva York', 'upcoming')

on conflict do nothing;
