-- ============================================================
-- PRODE QUINCHO - Migration 031
-- Cambiar cierre de pronósticos de 0h a 15 min antes del partido
-- ============================================================

UPDATE public.tournament_types
SET prediction_lock_hours = 0.25;
