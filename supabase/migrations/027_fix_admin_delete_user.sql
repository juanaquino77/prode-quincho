-- Fix 1: tournaments.created_by sin ON DELETE, bloquea borrar usuarios que crearon torneos
ALTER TABLE public.tournaments
  DROP CONSTRAINT IF EXISTS tournaments_created_by_fkey;
ALTER TABLE public.tournaments
  ADD CONSTRAINT tournaments_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix 2: admin_list_users retornaba "is_admin" pero el frontend esperaba "user_is_admin"
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id      uuid,
  email        text,
  username     text,
  full_name    text,
  avatar_url   text,
  user_is_admin boolean,
  created_at   timestamptz
)
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

  RETURN QUERY
  SELECT
    au.id          AS user_id,
    au.email       AS email,
    pr.username,
    pr.full_name,
    pr.avatar_url,
    COALESCE(pr.is_admin, false) AS user_is_admin,
    au.created_at
  FROM auth.users au
  LEFT JOIN public.profiles pr ON pr.id = au.id
  ORDER BY au.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
