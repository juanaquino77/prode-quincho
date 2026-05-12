-- ============================================================
-- PRODE QUINCHO - Migration 019
-- Bloquear pronósticos al inicio del partido (prediction_lock_hours = 0)
-- ============================================================
UPDATE public.tournament_types SET prediction_lock_hours = 0;
