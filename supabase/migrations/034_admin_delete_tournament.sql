-- Migration 034: admin_delete_tournament RPC + global tournament stats RPC

CREATE OR REPLACE FUNCTION public.admin_delete_tournament(p_tournament_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  DELETE FROM tournament_members WHERE tournament_id = p_tournament_id;
  DELETE FROM tournaments WHERE id = p_tournament_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_global_tournament_stats()
RETURNS TABLE (
  tournament_id   uuid,
  tournament_name text,
  entry_fee       numeric,
  total_members   bigint,
  paid_members    bigint,
  total_collected numeric
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.entry_fee,
    COUNT(tm.user_id)::bigint,
    COUNT(tm.user_id) FILTER (WHERE tm.paid = true)::bigint,
    COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'approved'), 0)
  FROM tournaments t
  LEFT JOIN tournament_members tm ON tm.tournament_id = t.id
  LEFT JOIN payments p ON p.tournament_id = t.id
  WHERE t.type = 'global'
  GROUP BY t.id, t.name, t.entry_fee;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_tournament(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_global_tournament_stats() TO authenticated;
