-- ============================================================
-- Migration 035
-- 1. Fix admin_get_global_tournament_stats (double JOIN bug)
-- 2. Add freepass_reason to profiles
-- 3. freepass_reason_options table
-- 4. Update admin_set_free_pass with reason
-- 5. Update admin_list_users with freepass_reason + paid_global
-- ============================================================

-- 1. Fix global stats (subqueries evitan multiplicación de filas)
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
    (SELECT COUNT(*)         FROM tournament_members tm WHERE tm.tournament_id = t.id)::bigint,
    (SELECT COUNT(*)         FROM tournament_members tm WHERE tm.tournament_id = t.id AND tm.paid = true)::bigint,
    COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.tournament_id = t.id AND p.status = 'approved'), 0)
  FROM tournaments t
  WHERE t.type = 'global';
END;
$$;

-- 2. freepass_reason en profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS freepass_reason text;

-- 3. Tabla de motivos de pase libre
CREATE TABLE IF NOT EXISTS public.freepass_reason_options (
  id    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  label text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

INSERT INTO public.freepass_reason_options (label) VALUES
  ('Organizador del torneo'),
  ('Colaborador del club'),
  ('Sponsor'),
  ('Premio / Ganador anterior'),
  ('Cortesía')
ON CONFLICT (label) DO NOTHING;

ALTER TABLE public.freepass_reason_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_freepass_reasons" ON public.freepass_reason_options;
CREATE POLICY "admin_read_freepass_reasons" ON public.freepass_reason_options
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- 4. admin_set_free_pass con reason opcional
CREATE OR REPLACE FUNCTION public.admin_set_free_pass(
  p_user_id  uuid,
  p_free_pass boolean,
  p_reason   text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  UPDATE profiles
  SET
    free_pass       = p_free_pass,
    freepass_reason = CASE WHEN p_free_pass THEN p_reason ELSE NULL END
  WHERE id = p_user_id;
END;
$$;

-- 5. admin_list_users con freepass_reason y paid_global
DROP FUNCTION IF EXISTS public.admin_list_users();
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id        uuid,
  email          text,
  username       text,
  full_name      text,
  avatar_url     text,
  user_is_admin  boolean,
  free_pass      boolean,
  freepass_reason text,
  paid_global    boolean,
  created_at     timestamptz,
  phone          text
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_global_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true) THEN
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
    au.created_at::timestamptz,
    COALESCE(au.raw_user_meta_data->>'phone', au.phone::text)::text
  FROM auth.users au
  LEFT JOIN public.profiles pr ON pr.id = au.id
  ORDER BY au.created_at DESC;
END;
$$;

-- 6. RPCs para gestionar motivos
CREATE OR REPLACE FUNCTION public.admin_list_freepass_reasons()
RETURNS TABLE (id uuid, label text, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY SELECT r.id, r.label, r.created_at FROM freepass_reason_options r ORDER BY r.created_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_freepass_reason(p_label text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  INSERT INTO freepass_reason_options (label) VALUES (p_label) ON CONFLICT (label) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_freepass_reason(p_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  DELETE FROM freepass_reason_options WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_global_tournament_stats()           TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_free_pass(uuid, boolean, text)      TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users()                            TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_freepass_reasons()                 TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_freepass_reason(text)           TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_freepass_reason(uuid)            TO authenticated;
