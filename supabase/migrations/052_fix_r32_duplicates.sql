-- Migration 052 — Corregir duplicado en Ronda de 32
--
-- Migration 051 puso '1J vs 2H' en match 87, pero eso ya es match 86.
-- Según el bracket oficial FIFA 2026:
--   match 86: 1J vs 2H  (Hard Rock Miami, 3 jul)  ← correcto
--   match 87: 2D vs 2G  (AT&T Arlington, 3 jul)   ← fix
--   match 88: 1K vs Mejor 3° (D/E/I/J/L) (Arrowhead KC, 4 jul) ← fix fechas

UPDATE public.matches
SET home_team='2D', away_team='2G',
    match_date='2026-07-03T17:00:00Z', venue='AT&T Stadium, Arlington'
WHERE competition='mundial_2026' AND match_number=87;

UPDATE public.matches
SET match_date='2026-07-04T00:30:00Z', venue='Arrowhead Stadium, Kansas City'
WHERE competition='mundial_2026' AND match_number=88;
