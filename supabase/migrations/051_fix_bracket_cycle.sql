-- Migration 051 — Romper ciclo infinito en resolveTeamName
--
-- Problema: migration 032 renumeró los partidos (87→89, 88→90 ... 102→104)
-- e insertó nuevos 87 y 88 como R32.
-- Migration 050 luego sobreescribió esos mismos números con referencias del
-- seed original, creando un ciclo:
--   Final (104) → SF101 → QF98 → R16·93 → Gan.#104 → [INFINITO]
--
-- Solución: restaurar las referencias de equipo correctas según la estructura
-- de migration 032 (que era correcta).
-- Las fechas/estadios que pusieron 049/050 se mantienen intactas.

-- ── R32 87 y 88: mantener como R32 con posiciones de grupo (NO "Gan. #X") ──
UPDATE public.matches SET home_team='1J', away_team='2H'
  WHERE competition='mundial_2026' AND match_number=87;
UPDATE public.matches SET home_team='1K', away_team='Mejor 3° (D/E/I/J/L)'
  WHERE competition='mundial_2026' AND match_number=88;

-- ── R16 (89-96): cada uno referencia dos R32 ganadores ────────────────────
UPDATE public.matches SET home_team='Gan. #73', away_team='Gan. #74'
  WHERE competition='mundial_2026' AND match_number=89;
UPDATE public.matches SET home_team='Gan. #75', away_team='Gan. #76'
  WHERE competition='mundial_2026' AND match_number=90;
UPDATE public.matches SET home_team='Gan. #77', away_team='Gan. #78'
  WHERE competition='mundial_2026' AND match_number=91;
UPDATE public.matches SET home_team='Gan. #79', away_team='Gan. #80'
  WHERE competition='mundial_2026' AND match_number=92;
UPDATE public.matches SET home_team='Gan. #81', away_team='Gan. #82'
  WHERE competition='mundial_2026' AND match_number=93;
UPDATE public.matches SET home_team='Gan. #83', away_team='Gan. #84'
  WHERE competition='mundial_2026' AND match_number=94;
UPDATE public.matches SET home_team='Gan. #85', away_team='Gan. #86'
  WHERE competition='mundial_2026' AND match_number=95;
UPDATE public.matches SET home_team='Gan. #87', away_team='Gan. #88'
  WHERE competition='mundial_2026' AND match_number=96;

-- ── QF (97-100): referencia R16 ganadores ─────────────────────────────────
UPDATE public.matches SET home_team='Gan. #89', away_team='Gan. #90'
  WHERE competition='mundial_2026' AND match_number=97;
UPDATE public.matches SET home_team='Gan. #91', away_team='Gan. #92'
  WHERE competition='mundial_2026' AND match_number=98;
UPDATE public.matches SET home_team='Gan. #93', away_team='Gan. #94'
  WHERE competition='mundial_2026' AND match_number=99;
UPDATE public.matches SET home_team='Gan. #95', away_team='Gan. #96'
  WHERE competition='mundial_2026' AND match_number=100;

-- ── SF (101-102): referencia QF ganadores ─────────────────────────────────
UPDATE public.matches SET home_team='Gan. #97', away_team='Gan. #98'
  WHERE competition='mundial_2026' AND match_number=101;
UPDATE public.matches SET home_team='Gan. #99', away_team='Gan. #100'
  WHERE competition='mundial_2026' AND match_number=102;

-- ── 3er puesto (103) y Final (104) ────────────────────────────────────────
UPDATE public.matches SET home_team='Perdedor SF-1', away_team='Perdedor SF-2'
  WHERE competition='mundial_2026' AND match_number=103;
UPDATE public.matches SET home_team='Gan. #101', away_team='Gan. #102'
  WHERE competition='mundial_2026' AND match_number=104;
