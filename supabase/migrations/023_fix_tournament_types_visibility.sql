-- ============================================================
-- PRODE QUINCHO - Migration 023
-- Fix visibilidad de tournament_types para usuarios no-admin
-- ============================================================

-- ── 1. Recrear vista pública SIN security_invoker ─────────────
-- Con security_invoker = true, el RLS de la tabla bloquea a non-admins.
-- Al quitarlo (default = security_definer), la vista corre como el owner
-- (superuser), bypasea RLS, y solo expone las columnas seguras.
DROP VIEW IF EXISTS public.tournament_types_public;
CREATE VIEW public.tournament_types_public AS
  SELECT id, name, description,
         pts_exact, pts_outcome,
         pts_penalty_correct, pts_penalty_wrong_deduct,
         pts_penalty_wrong_deduct_draw_outcome,
         requires_exact_score,
         prediction_lock_hours, show_rival_predictions,
         is_active, created_at
  FROM public.tournament_types
  WHERE is_active = true;

GRANT SELECT ON public.tournament_types_public TO authenticated, anon;

-- ── 2. Política SELECT separada para admins en tournament_types ─
-- La política FOR ALL cubre SELECT+INSERT+UPDATE+DELETE para admins.
-- Esto es suficiente; no se necesita cambio adicional para el admin panel.
-- (El admin ya puede leer con la política existente FOR ALL.)
