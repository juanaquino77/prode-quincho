-- ============================================================
-- PRODE QUINCHO - Migration 024
-- Agrega columnas faltantes en tournaments + RPC admin para listar tipos
-- ============================================================

-- ── 1. Columnas faltantes en tournaments ──────────────────────
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS tournament_type_id     uuid REFERENCES public.tournament_types(id),
  ADD COLUMN IF NOT EXISTS prediction_lock_hours  int  NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS show_rival_predictions text NOT NULL DEFAULT 'after'
    CHECK (show_rival_predictions IN ('before', 'after'));

-- ── 2. Actualizar vista tournaments_public si existe ──────────
DROP VIEW IF EXISTS public.tournaments_public;
CREATE VIEW public.tournaments_public AS
  SELECT id, name, type, invite_code, created_by,
         entry_fee, prize_pool, is_active, competition, rules,
         prediction_lock_hours, show_rival_predictions,
         tournament_type_id, created_at
  FROM public.tournaments
  WHERE is_active = true;

GRANT SELECT ON public.tournaments_public TO authenticated, anon;

-- ── 3. RPC admin_list_tournament_types (SECURITY DEFINER) ─────
-- El SELECT directo a tournament_types falla por RLS para non-admins.
-- Este RPC verifica admin internamente y devuelve todos los tipos.
CREATE OR REPLACE FUNCTION public.admin_list_tournament_types()
RETURNS SETOF public.tournament_types
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY SELECT * FROM public.tournament_types ORDER BY name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_tournament_types() TO authenticated;
