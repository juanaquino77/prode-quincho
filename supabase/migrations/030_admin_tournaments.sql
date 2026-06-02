-- ============================================================
-- PRODE QUINCHO - Migration 030
-- Admin: gestión de torneos, participantes y freepass por torneo
-- ============================================================

-- RPC: listar participantes de un torneo (admin)
CREATE OR REPLACE FUNCTION public.admin_list_tournament_members(p_tournament_id uuid)
RETURNS TABLE (
  user_id    uuid,
  username   text,
  full_name  text,
  avatar_url text,
  paid       boolean,
  joined_at  timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY
  SELECT tm.user_id, p.username, p.full_name, p.avatar_url, tm.paid, tm.joined_at
  FROM tournament_members tm
  JOIN profiles p ON p.id = tm.user_id
  WHERE tm.tournament_id = p_tournament_id
  ORDER BY tm.joined_at ASC;
END;
$$;

-- RPC: toggle paid de un miembro en un torneo específico (admin freepass por torneo)
CREATE OR REPLACE FUNCTION public.admin_set_member_paid(
  p_user_id       uuid,
  p_tournament_id uuid,
  p_paid          boolean
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  UPDATE tournament_members
  SET paid = p_paid
  WHERE user_id = p_user_id AND tournament_id = p_tournament_id;
END;
$$;

-- RPC: torneos en los que está un usuario (para modal de acciones)
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
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY
  SELECT tm.tournament_id, t.name, t.type, t.entry_fee, tm.paid, tm.joined_at
  FROM tournament_members tm
  JOIN tournaments t ON t.id = tm.tournament_id
  WHERE tm.user_id = p_user_id
  ORDER BY tm.joined_at DESC;
END;
$$;

-- RPC: renombrar torneo (admin)
CREATE OR REPLACE FUNCTION public.admin_update_tournament_name(
  p_tournament_id uuid,
  p_name          text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  UPDATE tournaments SET name = p_name WHERE id = p_tournament_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_tournament_members(uuid)        TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_member_paid(uuid, uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_user_memberships(uuid)               TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_tournament_name(uuid, text)   TO authenticated;
