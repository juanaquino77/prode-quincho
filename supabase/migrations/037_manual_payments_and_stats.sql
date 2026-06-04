-- Migration 037
-- 1. payment_note en tournament_members
-- 2. admin_set_member_paid acepta monto + nota + crea payment manual
-- 3. admin_get_global_tournament_stats separa MP vs manual
-- 4. admin_list_tournament_members retorna payment_note

-- 1. payment_note
ALTER TABLE public.tournament_members ADD COLUMN IF NOT EXISTS payment_note text;

-- 2. admin_set_member_paid con monto y nota
DROP FUNCTION IF EXISTS public.admin_set_member_paid(uuid, uuid, boolean);
CREATE OR REPLACE FUNCTION public.admin_set_member_paid(
  p_user_id       uuid,
  p_tournament_id uuid,
  p_paid          boolean,
  p_amount        numeric  DEFAULT NULL,
  p_note          text     DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  UPDATE tournament_members
  SET paid = p_paid, payment_note = CASE WHEN p_paid THEN p_note ELSE NULL END
  WHERE user_id = p_user_id AND tournament_id = p_tournament_id;

  IF p_paid AND p_amount IS NOT NULL AND p_amount > 0 THEN
    -- Crear/actualizar registro de pago manual (transferencia)
    INSERT INTO payments (user_id, tournament_id, amount, status, currency)
    VALUES (p_user_id, p_tournament_id, p_amount, 'approved', 'ARS')
    ON CONFLICT (user_id, tournament_id)
      DO UPDATE SET amount = EXCLUDED.amount, status = 'approved', updated_at = now();
  END IF;

  IF NOT p_paid THEN
    -- Al desmarcar: eliminar pagos manuales (sin mp_payment_id)
    DELETE FROM payments
    WHERE user_id = p_user_id AND tournament_id = p_tournament_id AND mp_payment_id IS NULL;
  END IF;
END;
$$;

-- 3. admin_get_global_tournament_stats con desglose
DROP FUNCTION IF EXISTS public.admin_get_global_tournament_stats();
CREATE OR REPLACE FUNCTION public.admin_get_global_tournament_stats()
RETURNS TABLE (
  tournament_id   uuid,
  tournament_name text,
  entry_fee       numeric,
  total_members   bigint,
  paid_members    bigint,
  total_collected numeric,
  mp_collected    numeric,
  manual_collected numeric
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
    (SELECT COUNT(*)   FROM tournament_members tm WHERE tm.tournament_id = t.id)::bigint,
    (SELECT COUNT(*)   FROM tournament_members tm WHERE tm.tournament_id = t.id AND tm.paid = true)::bigint,
    COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.tournament_id = t.id AND p.status = 'approved'), 0),
    COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.tournament_id = t.id AND p.status = 'approved' AND p.mp_payment_id IS NOT NULL), 0),
    COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.tournament_id = t.id AND p.status = 'approved' AND p.mp_payment_id IS NULL), 0)
  FROM tournaments t
  WHERE t.type = 'global';
END;
$$;

-- 4. admin_list_tournament_members con payment_note
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
      WHEN pay.id IS NOT NULL            THEN 'manual'
      WHEN tm.paid AND p.free_pass       THEN 'freepass'
      WHEN tm.paid AND tm.payment_note IS NOT NULL THEN 'manual'
      WHEN tm.paid                       THEN 'manual'
      WHEN p.free_pass                   THEN 'freepass'
      ELSE NULL
    END::text AS payment_method,
    p.freepass_reason,
    tm.payment_note
  FROM tournament_members tm
  JOIN profiles p ON p.id = tm.user_id
  LEFT JOIN payments pay
    ON pay.tournament_id = tm.tournament_id
    AND pay.user_id = tm.user_id
    AND pay.status = 'approved'
  WHERE tm.tournament_id = p_tournament_id
  ORDER BY tm.paid DESC, tm.joined_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_member_paid(uuid, uuid, boolean, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_global_tournament_stats()                       TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_tournament_members(uuid)                       TO authenticated;
