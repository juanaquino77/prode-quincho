-- Migration 038: rol organizador (co-admin de solo lectura)

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_organizer boolean DEFAULT false;

-- Actualizar admin_list_users con is_organizer
DROP FUNCTION IF EXISTS public.admin_list_users();
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id         uuid,
  email           text,
  username        text,
  full_name       text,
  avatar_url      text,
  user_is_admin   boolean,
  free_pass       boolean,
  freepass_reason text,
  paid_global     boolean,
  is_organizer    boolean,
  created_at      timestamptz,
  phone           text
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_global_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND (p.is_admin = true OR p.is_organizer = true)) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  SELECT id INTO v_global_id FROM tournaments WHERE type = 'global' LIMIT 1;
  RETURN QUERY
  SELECT
    au.id::uuid,
    au.email::text,
    pr.username::text,
    pr.full_name::text,
    pr.avatar_url::text,
    COALESCE(pr.is_admin, false)::boolean,
    COALESCE(pr.free_pass, false)::boolean,
    pr.freepass_reason::text,
    COALESCE((
      SELECT tm.paid FROM tournament_members tm
      WHERE tm.tournament_id = v_global_id AND tm.user_id = au.id
    ), false)::boolean,
    COALESCE(pr.is_organizer, false)::boolean,
    au.created_at::timestamptz,
    COALESCE(au.raw_user_meta_data->>'phone', au.phone::text)::text
  FROM auth.users au
  LEFT JOIN public.profiles pr ON pr.id = au.id
  ORDER BY au.created_at DESC;
END;
$$;

-- RPC para togglear el rol de organizador
CREATE OR REPLACE FUNCTION public.admin_set_organizer(p_user_id uuid, p_is_organizer boolean)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  UPDATE profiles SET is_organizer = p_is_organizer WHERE id = p_user_id;
END;
$$;

-- Ampliar admin_get_global_tournament_stats para organizadores
CREATE OR REPLACE FUNCTION public.admin_get_global_tournament_stats()
RETURNS TABLE (
  tournament_id    uuid,
  tournament_name  text,
  entry_fee        numeric,
  total_members    bigint,
  paid_members     bigint,
  total_collected  numeric,
  mp_collected     numeric,
  manual_collected numeric
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR is_organizer = true)) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY
  SELECT
    t.id, t.name, t.entry_fee,
    (SELECT COUNT(*)   FROM tournament_members tm WHERE tm.tournament_id = t.id)::bigint,
    (SELECT COUNT(*)   FROM tournament_members tm WHERE tm.tournament_id = t.id AND tm.paid = true)::bigint,
    COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.tournament_id = t.id AND p.status = 'approved'), 0),
    COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.tournament_id = t.id AND p.status = 'approved' AND p.mp_payment_id IS NOT NULL), 0),
    COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.tournament_id = t.id AND p.status = 'approved' AND p.mp_payment_id IS NULL), 0)
  FROM tournaments t WHERE t.type = 'global';
END;
$$;

-- Extender admin_list_tournament_members para organizadores
DROP FUNCTION IF EXISTS public.admin_list_tournament_members(uuid);
CREATE OR REPLACE FUNCTION public.admin_list_tournament_members(p_tournament_id uuid)
RETURNS TABLE (
  user_id         uuid,
  username        text,
  full_name       text,
  avatar_url      text,
  paid            boolean,
  joined_at       timestamptz,
  payment_method  text,
  freepass_reason text,
  payment_note    text
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR is_organizer = true)) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY
  SELECT
    tm.user_id, p.username, p.full_name, p.avatar_url, tm.paid, tm.joined_at,
    CASE
      WHEN pay.mp_payment_id IS NOT NULL THEN 'mercadopago'
      WHEN pay.id IS NOT NULL            THEN 'manual'
      WHEN tm.paid AND p.free_pass       THEN 'freepass'
      WHEN tm.paid AND tm.payment_note IS NOT NULL THEN 'manual'
      WHEN tm.paid                       THEN 'manual'
      WHEN p.free_pass                   THEN 'freepass'
      ELSE NULL
    END::text,
    p.freepass_reason,
    tm.payment_note
  FROM tournament_members tm
  JOIN profiles p ON p.id = tm.user_id
  LEFT JOIN payments pay
    ON pay.tournament_id = tm.tournament_id AND pay.user_id = tm.user_id AND pay.status = 'approved'
  WHERE tm.tournament_id = p_tournament_id
  ORDER BY tm.paid DESC, tm.joined_at ASC;
END;
$$;

-- También extender admin_get_friend_tournaments para organizadores
CREATE OR REPLACE FUNCTION public.admin_get_friend_tournaments()
RETURNS TABLE (
  id            uuid,
  name          text,
  created_by    uuid,
  entry_fee     numeric,
  created_at    timestamptz,
  member_count  bigint
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR is_organizer = true)) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY
  SELECT
    t.id, t.name, t.created_by, t.entry_fee, t.created_at,
    COUNT(tm.user_id)::bigint
  FROM tournaments t
  LEFT JOIN tournament_members tm ON tm.tournament_id = t.id
  WHERE t.type = 'friends' AND t.is_active = true
  GROUP BY t.id, t.name, t.created_by, t.entry_fee, t.created_at
  ORDER BY t.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_users()                            TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_organizer(uuid, boolean)            TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_global_tournament_stats()           TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_tournament_members(uuid)           TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_friend_tournaments()                TO authenticated;
