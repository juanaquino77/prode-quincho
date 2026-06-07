-- Migration 043: organizers pueden leer freepass_reason_options y user memberships

-- 1. RLS freepass_reason_options: permitir lectura a organizadores
DROP POLICY IF EXISTS "admin_read_freepass_reasons" ON public.freepass_reason_options;
CREATE POLICY "admin_read_freepass_reasons" ON public.freepass_reason_options
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR is_organizer = true)
  ));

-- 2. admin_user_memberships: permitir a organizadores
CREATE OR REPLACE FUNCTION public.admin_user_memberships(p_user_id uuid)
RETURNS TABLE (
  tournament_id   uuid,
  tournament_name text,
  tournament_type text,
  entry_fee       numeric,
  paid            boolean,
  joined_at       timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR is_organizer = true)
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY
  SELECT tm.tournament_id, t.name::text, t.type::text, t.entry_fee, tm.paid, tm.joined_at
  FROM tournament_members tm
  JOIN tournaments t ON t.id = tm.tournament_id
  WHERE tm.user_id = p_user_id
  ORDER BY tm.joined_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_user_memberships(uuid) TO authenticated;
