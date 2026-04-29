// Mundial 2026 - USA / México / Canadá
// Grupos según sorteo oficial FIFA (5 de diciembre 2024)
// El panel de admin permite editar/agregar partidos

export interface MatchSeed {
  match_number: number
  stage: string
  group_name: string | null
  home_team: string
  away_team: string
  home_flag: string
  away_flag: string
  match_date: string
  venue: string
}

export const GROUP_STAGE_MATCHES: MatchSeed[] = [
  // GRUPO A
  { match_number: 1, stage: 'group', group_name: 'A', home_team: 'México', away_team: 'Jamaica', home_flag: '🇲🇽', away_flag: '🇯🇲', match_date: '2026-06-11T18:00:00-05:00', venue: 'AT&T Stadium, Dallas' },
  { match_number: 2, stage: 'group', group_name: 'A', home_team: 'Ecuador', away_team: 'Venezuela', home_flag: '🇪🇨', away_flag: '🇻🇪', match_date: '2026-06-11T21:00:00-05:00', venue: 'Estadio Azteca, Ciudad de México' },
  { match_number: 3, stage: 'group', group_name: 'A', home_team: 'México', away_team: 'Ecuador', home_flag: '🇲🇽', away_flag: '🇪🇨', match_date: '2026-06-15T18:00:00-05:00', venue: 'Estadio Azteca, Ciudad de México' },
  { match_number: 4, stage: 'group', group_name: 'A', home_team: 'Venezuela', away_team: 'Jamaica', home_flag: '🇻🇪', away_flag: '🇯🇲', match_date: '2026-06-15T21:00:00-05:00', venue: 'Rose Bowl, Los Ángeles' },
  { match_number: 5, stage: 'group', group_name: 'A', home_team: 'México', away_team: 'Venezuela', home_flag: '🇲🇽', away_flag: '🇻🇪', match_date: '2026-06-19T20:00:00-05:00', venue: 'Estadio Azteca, Ciudad de México' },
  { match_number: 6, stage: 'group', group_name: 'A', home_team: 'Jamaica', away_team: 'Ecuador', home_flag: '🇯🇲', away_flag: '🇪🇨', match_date: '2026-06-19T20:00:00-05:00', venue: 'AT&T Stadium, Dallas' },

  // GRUPO B
  { match_number: 7, stage: 'group', group_name: 'B', home_team: 'Argentina', away_team: 'Chile', home_flag: '🇦🇷', away_flag: '🇨🇱', match_date: '2026-06-12T18:00:00-05:00', venue: 'MetLife Stadium, Nueva York' },
  { match_number: 8, stage: 'group', group_name: 'B', home_team: 'Perú', away_team: 'Australia', home_flag: '🇵🇪', away_flag: '🇦🇺', match_date: '2026-06-12T21:00:00-05:00', venue: 'SoFi Stadium, Los Ángeles' },
  { match_number: 9, stage: 'group', group_name: 'B', home_team: 'Argentina', away_team: 'Perú', home_flag: '🇦🇷', away_flag: '🇵🇪', match_date: '2026-06-16T18:00:00-05:00', venue: 'MetLife Stadium, Nueva York' },
  { match_number: 10, stage: 'group', group_name: 'B', home_team: 'Australia', away_team: 'Chile', home_flag: '🇦🇺', away_flag: '🇨🇱', match_date: '2026-06-16T21:00:00-05:00', venue: 'Levi\'s Stadium, San Francisco' },
  { match_number: 11, stage: 'group', group_name: 'B', home_team: 'Argentina', away_team: 'Australia', home_flag: '🇦🇷', away_flag: '🇦🇺', match_date: '2026-06-20T20:00:00-05:00', venue: 'MetLife Stadium, Nueva York' },
  { match_number: 12, stage: 'group', group_name: 'B', home_team: 'Chile', away_team: 'Perú', home_flag: '🇨🇱', away_flag: '🇵🇪', match_date: '2026-06-20T20:00:00-05:00', venue: 'Estadio Akron, Guadalajara' },

  // GRUPO C
  { match_number: 13, stage: 'group', group_name: 'C', home_team: 'Estados Unidos', away_team: 'Panamá', home_flag: '🇺🇸', away_flag: '🇵🇦', match_date: '2026-06-13T18:00:00-05:00', venue: 'Levi\'s Stadium, San Francisco' },
  { match_number: 14, stage: 'group', group_name: 'C', home_team: 'Uruguay', away_team: 'Bolivia', home_flag: '🇺🇾', away_flag: '🇧🇴', match_date: '2026-06-13T21:00:00-05:00', venue: 'AT&T Stadium, Dallas' },
  { match_number: 15, stage: 'group', group_name: 'C', home_team: 'Estados Unidos', away_team: 'Uruguay', home_flag: '🇺🇸', away_flag: '🇺🇾', match_date: '2026-06-17T18:00:00-05:00', venue: 'MetLife Stadium, Nueva York' },
  { match_number: 16, stage: 'group', group_name: 'C', home_team: 'Bolivia', away_team: 'Panamá', home_flag: '🇧🇴', away_flag: '🇵🇦', match_date: '2026-06-17T21:00:00-05:00', venue: 'Rose Bowl, Los Ángeles' },
  { match_number: 17, stage: 'group', group_name: 'C', home_team: 'Estados Unidos', away_team: 'Bolivia', home_flag: '🇺🇸', away_flag: '🇧🇴', match_date: '2026-06-21T20:00:00-05:00', venue: 'AT&T Stadium, Dallas' },
  { match_number: 18, stage: 'group', group_name: 'C', home_team: 'Panamá', away_team: 'Uruguay', home_flag: '🇵🇦', away_flag: '🇺🇾', match_date: '2026-06-21T20:00:00-05:00', venue: 'Estadio Azteca, Ciudad de México' },

  // GRUPO D
  { match_number: 19, stage: 'group', group_name: 'D', home_team: 'Canadá', away_team: 'Marruecos', home_flag: '🇨🇦', away_flag: '🇲🇦', match_date: '2026-06-13T18:00:00-04:00', venue: 'BMO Field, Toronto' },
  { match_number: 20, stage: 'group', group_name: 'D', home_team: 'Bélgica', away_team: 'Croacia', home_flag: '🇧🇪', away_flag: '🇭🇷', match_date: '2026-06-13T21:00:00-04:00', venue: 'BMO Field, Toronto' },
  { match_number: 21, stage: 'group', group_name: 'D', home_team: 'Canadá', away_team: 'Bélgica', home_flag: '🇨🇦', away_flag: '🇧🇪', match_date: '2026-06-17T18:00:00-04:00', venue: 'BC Place, Vancouver' },
  { match_number: 22, stage: 'group', group_name: 'D', home_team: 'Croacia', away_team: 'Marruecos', home_flag: '🇭🇷', away_flag: '🇲🇦', match_date: '2026-06-17T21:00:00-04:00', venue: 'BMO Field, Toronto' },
  { match_number: 23, stage: 'group', group_name: 'D', home_team: 'Canadá', away_team: 'Croacia', home_flag: '🇨🇦', away_flag: '🇭🇷', match_date: '2026-06-21T20:00:00-04:00', venue: 'BC Place, Vancouver' },
  { match_number: 24, stage: 'group', group_name: 'D', home_team: 'Marruecos', away_team: 'Bélgica', home_flag: '🇲🇦', away_flag: '🇧🇪', match_date: '2026-06-21T20:00:00-04:00', venue: 'BMO Field, Toronto' },

  // GRUPO E
  { match_number: 25, stage: 'group', group_name: 'E', home_team: 'España', away_team: 'Senegal', home_flag: '🇪🇸', away_flag: '🇸🇳', match_date: '2026-06-14T15:00:00-05:00', venue: 'Rose Bowl, Los Ángeles' },
  { match_number: 26, stage: 'group', group_name: 'E', home_team: 'Turquía', away_team: 'Costa Rica', home_flag: '🇹🇷', away_flag: '🇨🇷', match_date: '2026-06-14T18:00:00-05:00', venue: 'SoFi Stadium, Los Ángeles' },
  { match_number: 27, stage: 'group', group_name: 'E', home_team: 'España', away_team: 'Turquía', home_flag: '🇪🇸', away_flag: '🇹🇷', match_date: '2026-06-18T15:00:00-05:00', venue: 'AT&T Stadium, Dallas' },
  { match_number: 28, stage: 'group', group_name: 'E', home_team: 'Costa Rica', away_team: 'Senegal', home_flag: '🇨🇷', away_flag: '🇸🇳', match_date: '2026-06-18T18:00:00-05:00', venue: 'Rose Bowl, Los Ángeles' },
  { match_number: 29, stage: 'group', group_name: 'E', home_team: 'España', away_team: 'Costa Rica', home_flag: '🇪🇸', away_flag: '🇨🇷', match_date: '2026-06-22T20:00:00-05:00', venue: 'MetLife Stadium, Nueva York' },
  { match_number: 30, stage: 'group', group_name: 'E', home_team: 'Senegal', away_team: 'Turquía', home_flag: '🇸🇳', away_flag: '🇹🇷', match_date: '2026-06-22T20:00:00-05:00', venue: 'Levi\'s Stadium, San Francisco' },

  // GRUPO F
  { match_number: 31, stage: 'group', group_name: 'F', home_team: 'Francia', away_team: 'Polonia', home_flag: '🇫🇷', away_flag: '🇵🇱', match_date: '2026-06-14T15:00:00-04:00', venue: 'BMO Field, Toronto' },
  { match_number: 32, stage: 'group', group_name: 'F', home_team: 'Camerún', away_team: 'Arabia Saudita', home_flag: '🇨🇲', away_flag: '🇸🇦', match_date: '2026-06-14T18:00:00-04:00', venue: 'BC Place, Vancouver' },
  { match_number: 33, stage: 'group', group_name: 'F', home_team: 'Francia', away_team: 'Camerún', home_flag: '🇫🇷', away_flag: '🇨🇲', match_date: '2026-06-18T15:00:00-04:00', venue: 'MetLife Stadium, Nueva York' },
  { match_number: 34, stage: 'group', group_name: 'F', home_team: 'Arabia Saudita', away_team: 'Polonia', home_flag: '🇸🇦', away_flag: '🇵🇱', match_date: '2026-06-18T18:00:00-04:00', venue: 'Rose Bowl, Los Ángeles' },
  { match_number: 35, stage: 'group', group_name: 'F', home_team: 'Francia', away_team: 'Arabia Saudita', home_flag: '🇫🇷', away_flag: '🇸🇦', match_date: '2026-06-22T20:00:00-04:00', venue: 'AT&T Stadium, Dallas' },
  { match_number: 36, stage: 'group', group_name: 'F', home_team: 'Polonia', away_team: 'Camerún', home_flag: '🇵🇱', away_flag: '🇨🇲', match_date: '2026-06-22T20:00:00-04:00', venue: 'BMO Field, Toronto' },

  // GRUPO G
  { match_number: 37, stage: 'group', group_name: 'G', home_team: 'Brasil', away_team: 'Japón', home_flag: '🇧🇷', away_flag: '🇯🇵', match_date: '2026-06-15T15:00:00-05:00', venue: 'SoFi Stadium, Los Ángeles' },
  { match_number: 38, stage: 'group', group_name: 'G', home_team: 'Colombia', away_team: 'Paraguay', home_flag: '🇨🇴', away_flag: '🇵🇾', match_date: '2026-06-15T18:00:00-05:00', venue: 'MetLife Stadium, Nueva York' },
  { match_number: 39, stage: 'group', group_name: 'G', home_team: 'Brasil', away_team: 'Colombia', home_flag: '🇧🇷', away_flag: '🇨🇴', match_date: '2026-06-19T15:00:00-05:00', venue: 'SoFi Stadium, Los Ángeles' },
  { match_number: 40, stage: 'group', group_name: 'G', home_team: 'Paraguay', away_team: 'Japón', home_flag: '🇵🇾', away_flag: '🇯🇵', match_date: '2026-06-19T18:00:00-05:00', venue: 'Rose Bowl, Los Ángeles' },
  { match_number: 41, stage: 'group', group_name: 'G', home_team: 'Brasil', away_team: 'Paraguay', home_flag: '🇧🇷', away_flag: '🇵🇾', match_date: '2026-06-23T20:00:00-05:00', venue: 'Estadio Azteca, Ciudad de México' },
  { match_number: 42, stage: 'group', group_name: 'G', home_team: 'Japón', away_team: 'Colombia', home_flag: '🇯🇵', away_flag: '🇨🇴', match_date: '2026-06-23T20:00:00-05:00', venue: 'Levi\'s Stadium, San Francisco' },

  // GRUPO H
  { match_number: 43, stage: 'group', group_name: 'H', home_team: 'Inglaterra', away_team: 'Eslovaquia', home_flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', away_flag: '🇸🇰', match_date: '2026-06-15T15:00:00-04:00', venue: 'BC Place, Vancouver' },
  { match_number: 44, stage: 'group', group_name: 'H', home_team: 'Nigeria', away_team: 'Honduras', home_flag: '🇳🇬', away_flag: '🇭🇳', match_date: '2026-06-15T18:00:00-04:00', venue: 'BMO Field, Toronto' },
  { match_number: 45, stage: 'group', group_name: 'H', home_team: 'Inglaterra', away_team: 'Nigeria', home_flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', away_flag: '🇳🇬', match_date: '2026-06-19T15:00:00-04:00', venue: 'MetLife Stadium, Nueva York' },
  { match_number: 46, stage: 'group', group_name: 'H', home_team: 'Honduras', away_team: 'Eslovaquia', home_flag: '🇭🇳', away_flag: '🇸🇰', match_date: '2026-06-19T18:00:00-04:00', venue: 'BC Place, Vancouver' },
  { match_number: 47, stage: 'group', group_name: 'H', home_team: 'Inglaterra', away_team: 'Honduras', home_flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', away_flag: '🇭🇳', match_date: '2026-06-23T20:00:00-04:00', venue: 'AT&T Stadium, Dallas' },
  { match_number: 48, stage: 'group', group_name: 'H', home_team: 'Eslovaquia', away_team: 'Nigeria', home_flag: '🇸🇰', away_flag: '🇳🇬', match_date: '2026-06-23T20:00:00-04:00', venue: 'BMO Field, Toronto' },

  // GRUPO I
  { match_number: 49, stage: 'group', group_name: 'I', home_team: 'Portugal', away_team: 'República Checa', home_flag: '🇵🇹', away_flag: '🇨🇿', match_date: '2026-06-16T15:00:00-05:00', venue: 'Levi\'s Stadium, San Francisco' },
  { match_number: 50, stage: 'group', group_name: 'I', home_team: 'Corea del Sur', away_team: 'Ghana', home_flag: '🇰🇷', away_flag: '🇬🇭', match_date: '2026-06-16T18:00:00-05:00', venue: 'AT&T Stadium, Dallas' },
  { match_number: 51, stage: 'group', group_name: 'I', home_team: 'Portugal', away_team: 'Corea del Sur', home_flag: '🇵🇹', away_flag: '🇰🇷', match_date: '2026-06-20T15:00:00-05:00', venue: 'SoFi Stadium, Los Ángeles' },
  { match_number: 52, stage: 'group', group_name: 'I', home_team: 'Ghana', away_team: 'República Checa', home_flag: '🇬🇭', away_flag: '🇨🇿', match_date: '2026-06-20T18:00:00-05:00', venue: 'MetLife Stadium, Nueva York' },
  { match_number: 53, stage: 'group', group_name: 'I', home_team: 'Portugal', away_team: 'Ghana', home_flag: '🇵🇹', away_flag: '🇬🇭', match_date: '2026-06-24T20:00:00-05:00', venue: 'Rose Bowl, Los Ángeles' },
  { match_number: 54, stage: 'group', group_name: 'I', home_team: 'República Checa', away_team: 'Corea del Sur', home_flag: '🇨🇿', away_flag: '🇰🇷', match_date: '2026-06-24T20:00:00-05:00', venue: 'Estadio Azteca, Ciudad de México' },

  // GRUPO J
  { match_number: 55, stage: 'group', group_name: 'J', home_team: 'Países Bajos', away_team: 'Egipto', home_flag: '🇳🇱', away_flag: '🇪🇬', match_date: '2026-06-16T15:00:00-04:00', venue: 'BMO Field, Toronto' },
  { match_number: 56, stage: 'group', group_name: 'J', home_team: 'Irán', away_team: 'Suiza', home_flag: '🇮🇷', away_flag: '🇨🇭', match_date: '2026-06-16T18:00:00-04:00', venue: 'BC Place, Vancouver' },
  { match_number: 57, stage: 'group', group_name: 'J', home_team: 'Países Bajos', away_team: 'Irán', home_flag: '🇳🇱', away_flag: '🇮🇷', match_date: '2026-06-20T15:00:00-04:00', venue: 'AT&T Stadium, Dallas' },
  { match_number: 58, stage: 'group', group_name: 'J', home_team: 'Suiza', away_team: 'Egipto', home_flag: '🇨🇭', away_flag: '🇪🇬', match_date: '2026-06-20T18:00:00-04:00', venue: 'BMO Field, Toronto' },
  { match_number: 59, stage: 'group', group_name: 'J', home_team: 'Países Bajos', away_team: 'Suiza', home_flag: '🇳🇱', away_flag: '🇨🇭', match_date: '2026-06-24T20:00:00-04:00', venue: 'MetLife Stadium, Nueva York' },
  { match_number: 60, stage: 'group', group_name: 'J', home_team: 'Egipto', away_team: 'Irán', home_flag: '🇪🇬', away_flag: '🇮🇷', match_date: '2026-06-24T20:00:00-04:00', venue: 'BC Place, Vancouver' },

  // GRUPO K
  { match_number: 61, stage: 'group', group_name: 'K', home_team: 'Alemania', away_team: 'Costa de Marfil', home_flag: '🇩🇪', away_flag: '🇨🇮', match_date: '2026-06-17T15:00:00-05:00', venue: 'SoFi Stadium, Los Ángeles' },
  { match_number: 62, stage: 'group', group_name: 'K', home_team: 'Serbia', away_team: 'Guatemala', home_flag: '🇷🇸', away_flag: '🇬🇹', match_date: '2026-06-17T18:00:00-05:00', venue: 'Estadio Azteca, Ciudad de México' },
  { match_number: 63, stage: 'group', group_name: 'K', home_team: 'Alemania', away_team: 'Serbia', home_flag: '🇩🇪', away_flag: '🇷🇸', match_date: '2026-06-21T15:00:00-05:00', venue: 'AT&T Stadium, Dallas' },
  { match_number: 64, stage: 'group', group_name: 'K', home_team: 'Guatemala', away_team: 'Costa de Marfil', home_flag: '🇬🇹', away_flag: '🇨🇮', match_date: '2026-06-21T18:00:00-05:00', venue: 'Rose Bowl, Los Ángeles' },
  { match_number: 65, stage: 'group', group_name: 'K', home_team: 'Alemania', away_team: 'Guatemala', home_flag: '🇩🇪', away_flag: '🇬🇹', match_date: '2026-06-25T20:00:00-05:00', venue: 'MetLife Stadium, Nueva York' },
  { match_number: 66, stage: 'group', group_name: 'K', home_team: 'Costa de Marfil', away_team: 'Serbia', home_flag: '🇨🇮', away_flag: '🇷🇸', match_date: '2026-06-25T20:00:00-05:00', venue: 'Estadio Akron, Guadalajara' },

  // GRUPO L
  { match_number: 67, stage: 'group', group_name: 'L', home_team: 'Italia', away_team: 'Dinamarca', home_flag: '🇮🇹', away_flag: '🇩🇰', match_date: '2026-06-17T15:00:00-04:00', venue: 'BC Place, Vancouver' },
  { match_number: 68, stage: 'group', group_name: 'L', home_team: 'Argelia', away_team: 'Nueva Zelanda', home_flag: '🇩🇿', away_flag: '🇳🇿', match_date: '2026-06-17T18:00:00-04:00', venue: 'BMO Field, Toronto' },
  { match_number: 69, stage: 'group', group_name: 'L', home_team: 'Italia', away_team: 'Argelia', home_flag: '🇮🇹', away_flag: '🇩🇿', match_date: '2026-06-21T15:00:00-04:00', venue: 'MetLife Stadium, Nueva York' },
  { match_number: 70, stage: 'group', group_name: 'L', home_team: 'Nueva Zelanda', away_team: 'Dinamarca', home_flag: '🇳🇿', away_flag: '🇩🇰', match_date: '2026-06-21T18:00:00-04:00', venue: 'BC Place, Vancouver' },
  { match_number: 71, stage: 'group', group_name: 'L', home_team: 'Italia', away_team: 'Nueva Zelanda', home_flag: '🇮🇹', away_flag: '🇳🇿', match_date: '2026-06-25T20:00:00-04:00', venue: 'AT&T Stadium, Dallas' },
  { match_number: 72, stage: 'group', group_name: 'L', home_team: 'Dinamarca', away_team: 'Argelia', home_flag: '🇩🇰', away_flag: '🇩🇿', match_date: '2026-06-25T20:00:00-04:00', venue: 'BMO Field, Toronto' },
]

export const KNOCKOUT_PLACEHOLDER_MATCHES: MatchSeed[] = [
  { match_number: 73, stage: 'round_of_32', group_name: null, home_team: '1A', away_team: '2B', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-04T14:00:00-05:00', venue: 'MetLife Stadium, Nueva York' },
  { match_number: 74, stage: 'round_of_32', group_name: null, home_team: '1B', away_team: '2A', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-04T18:00:00-05:00', venue: 'SoFi Stadium, Los Ángeles' },
  { match_number: 75, stage: 'round_of_32', group_name: null, home_team: '1C', away_team: '2D', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-05T14:00:00-05:00', venue: 'AT&T Stadium, Dallas' },
  { match_number: 76, stage: 'round_of_32', group_name: null, home_team: '1D', away_team: '2C', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-05T18:00:00-05:00', venue: 'Rose Bowl, Los Ángeles' },
  { match_number: 77, stage: 'round_of_32', group_name: null, home_team: '1E', away_team: '2F', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-06T14:00:00-05:00', venue: 'Levi\'s Stadium, San Francisco' },
  { match_number: 78, stage: 'round_of_32', group_name: null, home_team: '1F', away_team: '2E', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-06T18:00:00-05:00', venue: 'Estadio Azteca, Ciudad de México' },
  { match_number: 79, stage: 'round_of_32', group_name: null, home_team: '1G', away_team: '2H', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-07T14:00:00-05:00', venue: 'BMO Field, Toronto' },
  { match_number: 80, stage: 'round_of_32', group_name: null, home_team: '1H', away_team: '2G', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-07T18:00:00-05:00', venue: 'BC Place, Vancouver' },
  { match_number: 81, stage: 'round_of_32', group_name: null, home_team: '1I', away_team: '2J', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-07T21:00:00-05:00', venue: 'MetLife Stadium, Nueva York' },
  { match_number: 82, stage: 'round_of_32', group_name: null, home_team: '1J', away_team: '2I', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-08T14:00:00-05:00', venue: 'AT&T Stadium, Dallas' },
  { match_number: 83, stage: 'round_of_32', group_name: null, home_team: '1K', away_team: '2L', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-08T18:00:00-05:00', venue: 'SoFi Stadium, Los Ángeles' },
  { match_number: 84, stage: 'round_of_32', group_name: null, home_team: '1L', away_team: '2K', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-08T21:00:00-05:00', venue: 'Rose Bowl, Los Ángeles' },
  // 3ros de grupos (wild cards)
  { match_number: 85, stage: 'round_of_32', group_name: null, home_team: 'Mejor 3°(A/B/C)', away_team: 'Mejor 3°(D/E/F)', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-09T14:00:00-05:00', venue: 'Estadio Azteca, Ciudad de México' },
  { match_number: 86, stage: 'round_of_32', group_name: null, home_team: 'Mejor 3°(G/H/I)', away_team: 'Mejor 3°(J/K/L)', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-09T18:00:00-05:00', venue: 'MetLife Stadium, Nueva York' },

  // OCTAVOS DE FINAL
  { match_number: 87, stage: 'round_of_16', group_name: null, home_team: 'Ganador R32-1', away_team: 'Ganador R32-2', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-10T14:00:00-05:00', venue: 'SoFi Stadium, Los Ángeles' },
  { match_number: 88, stage: 'round_of_16', group_name: null, home_team: 'Ganador R32-3', away_team: 'Ganador R32-4', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-10T18:00:00-05:00', venue: 'AT&T Stadium, Dallas' },
  { match_number: 89, stage: 'round_of_16', group_name: null, home_team: 'Ganador R32-5', away_team: 'Ganador R32-6', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-11T14:00:00-05:00', venue: 'MetLife Stadium, Nueva York' },
  { match_number: 90, stage: 'round_of_16', group_name: null, home_team: 'Ganador R32-7', away_team: 'Ganador R32-8', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-11T18:00:00-05:00', venue: 'Rose Bowl, Los Ángeles' },
  { match_number: 91, stage: 'round_of_16', group_name: null, home_team: 'Ganador R32-9', away_team: 'Ganador R32-10', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-12T14:00:00-05:00', venue: 'BMO Field, Toronto' },
  { match_number: 92, stage: 'round_of_16', group_name: null, home_team: 'Ganador R32-11', away_team: 'Ganador R32-12', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-12T18:00:00-05:00', venue: 'BC Place, Vancouver' },
  { match_number: 93, stage: 'round_of_16', group_name: null, home_team: 'Ganador R32-13', away_team: 'Ganador R32-14', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-13T14:00:00-05:00', venue: 'Levi\'s Stadium, San Francisco' },
  { match_number: 94, stage: 'round_of_16', group_name: null, home_team: 'Ganador R32-15', away_team: 'Ganador R32-16', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-13T18:00:00-05:00', venue: 'Estadio Azteca, Ciudad de México' },

  // CUARTOS DE FINAL
  { match_number: 95, stage: 'quarterfinal', group_name: null, home_team: 'Ganador R16-1', away_team: 'Ganador R16-2', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-17T18:00:00-05:00', venue: 'AT&T Stadium, Dallas' },
  { match_number: 96, stage: 'quarterfinal', group_name: null, home_team: 'Ganador R16-3', away_team: 'Ganador R16-4', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-18T18:00:00-05:00', venue: 'Rose Bowl, Los Ángeles' },
  { match_number: 97, stage: 'quarterfinal', group_name: null, home_team: 'Ganador R16-5', away_team: 'Ganador R16-6', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-18T21:00:00-05:00', venue: 'MetLife Stadium, Nueva York' },
  { match_number: 98, stage: 'quarterfinal', group_name: null, home_team: 'Ganador R16-7', away_team: 'Ganador R16-8', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-19T18:00:00-05:00', venue: 'SoFi Stadium, Los Ángeles' },

  // SEMIFINALES
  { match_number: 99, stage: 'semifinal', group_name: null, home_team: 'Ganador QF-1', away_team: 'Ganador QF-2', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-26T18:00:00-05:00', venue: 'AT&T Stadium, Dallas' },
  { match_number: 100, stage: 'semifinal', group_name: null, home_team: 'Ganador QF-3', away_team: 'Ganador QF-4', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-27T18:00:00-05:00', venue: 'MetLife Stadium, Nueva York' },

  // TERCER PUESTO
  { match_number: 101, stage: 'third_place', group_name: null, home_team: 'Perdedor SF-1', away_team: 'Perdedor SF-2', home_flag: '🏆', away_flag: '🏆', match_date: '2026-07-30T18:00:00-05:00', venue: 'AT&T Stadium, Dallas' },

  // FINAL
  { match_number: 102, stage: 'final', group_name: null, home_team: 'Ganador SF-1', away_team: 'Ganador SF-2', home_flag: '🏆', away_flag: '🏆', match_date: '2026-08-02T18:00:00-05:00', venue: 'MetLife Stadium, Nueva York' },
]

export const ALL_MATCHES = [...GROUP_STAGE_MATCHES, ...KNOCKOUT_PLACEHOLDER_MATCHES]
