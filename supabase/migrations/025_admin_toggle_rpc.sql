-- ============================================================
-- PRODE QUINCHO - Migration 025
-- RPC para toggle activo/inactivo de tipos de torneo
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_toggle_tournament_type_active(
  p_id        uuid,
  p_is_active boolean
) RETURNS void
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

  UPDATE public.tournament_types
  SET is_active = p_is_active
  WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_toggle_tournament_type_active(uuid, boolean) TO authenticated;
