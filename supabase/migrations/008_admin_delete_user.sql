-- ============================================================
-- admin_delete_user — elimina un usuario de auth.users
-- Solo puede ser llamada por admins (verificado dentro de la función)
-- SECURITY DEFINER permite operar sobre auth.users con privilegios elevados
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que quien llama es admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  -- No permitir auto-eliminación
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'No podés eliminarte a vos mismo';
  END IF;

  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

-- Solo usuarios autenticados pueden llamar a esta función
REVOKE ALL ON FUNCTION public.admin_delete_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;

-- ============================================================
-- admin_list_users — devuelve todos los usuarios con su perfil
-- Solo admins; el resto ve solo los perfiles públicos
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id    uuid,
  email      text,
  username   text,
  full_name  text,
  avatar_url text,
  is_admin   boolean,
  created_at timestamptz
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
    COALESCE(pr.is_admin, false) AS is_admin,
    au.created_at
  FROM auth.users au
  LEFT JOIN public.profiles pr ON pr.id = au.id
  ORDER BY au.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
