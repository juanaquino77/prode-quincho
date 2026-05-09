-- ============================================================
-- Apertura 2026 — cuartos, semis y final
-- Fuente: ESPN, La Nacion, Infobae (mayo 2026)
-- Bracket: Sábado → Martes cuartos | Domingo → Miércoles cuartos
-- Final: Estadio Mario Alberto Kempes, Córdoba — 24 mayo 15:30
-- ============================================================

-- Cuartos de Final — Martes 12 mayo (ganadores del Sábado 9)
INSERT INTO public.matches (match_number, stage, home_team, away_team, match_date, competition, status)
VALUES
  (208, 'quarterfinal', 'Gan. Talleres o Belgrano',    'Gan. Rivadavia o Unión',     '2026-05-12 19:00:00-03', 'apertura_2026', 'upcoming'),
  (209, 'quarterfinal', 'Gan. Boca o Huracán',          'Gan. Argentinos o Lanús',    '2026-05-12 21:30:00-03', 'apertura_2026', 'upcoming'),

-- Cuartos de Final — Miércoles 13 mayo (ganadores del Domingo 10)
  (210, 'quarterfinal', 'Gan. Estudiantes o Racing',    'Gan. Central o Independiente','2026-05-13 19:00:00-03', 'apertura_2026', 'upcoming'),
  (211, 'quarterfinal', 'Gan. River o San Lorenzo',     'Gan. Vélez o Gimnasia',       '2026-05-13 21:30:00-03', 'apertura_2026', 'upcoming'),

-- Semifinales — Sábado 16 y Domingo 17 mayo
  (212, 'semifinal',    'Gan. CF Martes 1',             'Gan. CF Martes 2',            '2026-05-16 21:00:00-03', 'apertura_2026', 'upcoming'),
  (213, 'semifinal',    'Gan. CF Miércoles 1',          'Gan. CF Miércoles 2',         '2026-05-17 21:00:00-03', 'apertura_2026', 'upcoming'),

-- Final — Domingo 24 mayo, Kempes (Córdoba)
  (214, 'final',        'Gan. Semifinal 1',             'Gan. Semifinal 2',            '2026-05-24 15:30:00-03', 'apertura_2026', 'upcoming')

ON CONFLICT (match_number) DO NOTHING;
