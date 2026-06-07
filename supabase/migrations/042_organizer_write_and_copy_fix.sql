-- Migration 042:
-- 1. admin_set_free_pass permite organizadores
-- 2. admin_set_member_paid permite organizadores, solo torneos globales
-- 3. copy_predictions usa DO UPDATE para partidos no iniciados

-- 1. admin_set_free_pass
CREATE OR REPLACE FUNCTION public.admin_set_free_pass(
  p_user_id  uuid,
  p_free_pass boolean,
  p_reason   text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND (is_admin = true OR is_organizer = true)
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  UPDATE profiles
  SET free_pass = p_free_pass,
      freepass_reason = CASE WHEN p_free_pass THEN p_reason ELSE NULL END
  WHERE id = p_user_id;
END;
$$;

-- 2. admin_set_member_paid: organizers solo pueden operar torneos globales
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
    -- Organizer puede, pero solo para torneos globales
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_organizer = true) THEN
      RAISE EXCEPTION 'No autorizado';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM tournaments WHERE id = p_tournament_id AND type = 'global'
    ) THEN
      RAISE EXCEPTION 'Organizadores solo pueden gestionar pagos del torneo global';
    END IF;
  END IF;

  UPDATE tournament_members
  SET paid = p_paid, payment_note = CASE WHEN p_paid THEN p_note ELSE NULL END
  WHERE user_id = p_user_id AND tournament_id = p_tournament_id;

  IF p_paid AND p_amount IS NOT NULL AND p_amount > 0 THEN
    INSERT INTO payments (user_id, tournament_id, amount, status, currency)
    VALUES (p_user_id, p_tournament_id, p_amount, 'approved', 'ARS')
    ON CONFLICT (user_id, tournament_id)
      DO UPDATE SET amount = EXCLUDED.amount, status = 'approved', updated_at = now();
  END IF;

  IF NOT p_paid THEN
    DELETE FROM payments
    WHERE user_id = p_user_id AND tournament_id = p_tournament_id AND mp_payment_id IS NULL;
  END IF;
END;
$$;

-- 3. copy_predictions: sobreescribe predicciones de partidos no iniciados
CREATE OR REPLACE FUNCTION public.copy_predictions(
  p_user_id              uuid,
  p_source_tournament_id uuid,
  p_target_tournament_id uuid
)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM tournament_members
    WHERE tournament_id = p_target_tournament_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'No sos miembro del torneo destino';
  END IF;

  -- Copiar solo partidos que aún no empezaron, sobreescribiendo si ya existen
  INSERT INTO predictions (user_id, match_id, tournament_id, home_score_pred, away_score_pred, penalty_pred)
  SELECT p_user_id, pr.match_id, p_target_tournament_id, pr.home_score_pred, pr.away_score_pred, pr.penalty_pred
  FROM predictions pr
  JOIN matches m ON m.id = pr.match_id
  WHERE pr.user_id = p_user_id
    AND pr.tournament_id = p_source_tournament_id
    AND m.starts_at > now()
  ON CONFLICT (user_id, match_id, tournament_id) DO UPDATE SET
    home_score_pred = EXCLUDED.home_score_pred,
    away_score_pred = EXCLUDED.away_score_pred,
    penalty_pred    = EXCLUDED.penalty_pred;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Copiar corazonadas de grupos que aún no empezaron el primer partido
  INSERT INTO corazonadas (user_id, tournament_id, match_id, group_name)
  SELECT p_user_id, p_target_tournament_id, c.match_id, c.group_name
  FROM corazonadas c
  JOIN matches m ON m.id = c.match_id
  WHERE c.user_id = p_user_id
    AND c.tournament_id = p_source_tournament_id
    AND m.starts_at > now()
    AND NOT EXISTS (
      SELECT 1 FROM corazonadas existing
      WHERE existing.user_id = p_user_id
        AND existing.tournament_id = p_target_tournament_id
        AND existing.group_name = c.group_name
    )
  ON CONFLICT DO NOTHING;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_free_pass(uuid, boolean, text)          TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_member_paid(uuid, uuid, boolean, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.copy_predictions(uuid, uuid, uuid)                TO authenticated;
