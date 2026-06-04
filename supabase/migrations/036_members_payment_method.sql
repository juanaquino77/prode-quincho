-- Migration 036: admin_list_tournament_members con método de pago

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
  freepass_reason text
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY
  SELECT
    tm.user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    tm.paid,
    tm.joined_at,
    CASE
      WHEN pay.mp_payment_id IS NOT NULL THEN 'mercadopago'
      WHEN pay.id IS NOT NULL            THEN 'online'
      WHEN tm.paid AND p.free_pass       THEN 'freepass'
      WHEN tm.paid                       THEN 'manual'
      WHEN p.free_pass                   THEN 'freepass'
      ELSE NULL
    END::text AS payment_method,
    p.freepass_reason
  FROM tournament_members tm
  JOIN profiles p ON p.id = tm.user_id
  LEFT JOIN payments pay
    ON pay.tournament_id = tm.tournament_id
    AND pay.user_id = tm.user_id
    AND pay.status = 'approved'
  WHERE tm.tournament_id = p_tournament_id
  ORDER BY tm.joined_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_tournament_members(uuid) TO authenticated;
