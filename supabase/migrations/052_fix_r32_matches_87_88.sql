-- Migration 052 — Corregir matches 87 y 88 de R32
-- Migration 051 los dejó con equipos incorrectos (87 era duplicado de 86).
-- Fuente: bracket oficial FIFA (Wikipedia 2026 FIFA World Cup knockout stage).

UPDATE public.matches
SET home_team = '1K',
    away_team = 'Mejor 3° (D/E/I/J/L)',
    match_date = '2026-07-03T01:30:00Z',
    venue      = 'Arrowhead Stadium, Kansas City'
WHERE competition = 'mundial_2026' AND match_number = 87;

UPDATE public.matches
SET home_team = '2D',
    away_team = '2G',
    match_date = '2026-07-03T18:00:00Z',
    venue      = 'AT&T Stadium, Arlington'
WHERE competition = 'mundial_2026' AND match_number = 88;
