-- Migration 040: copy_predictions también copia las corazonadas

CREATE OR REPLACE FUNCTION public.copy_predictions(
  p_user_id             uuid,
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

  -- Copiar predicciones (sin pisar las existentes)
  INSERT INTO predictions (user_id, match_id, tournament_id, home_score_pred, away_score_pred, penalty_pred)
  SELECT p_user_id, match_id, p_target_tournament_id, home_score_pred, away_score_pred, penalty_pred
  FROM predictions
  WHERE user_id = p_user_id
    AND tournament_id = p_source_tournament_id
  ON CONFLICT (user_id, match_id, tournament_id) DO NOTHING;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Copiar corazonadas (solo las que no existan ya en el torneo destino)
  INSERT INTO corazonadas (user_id, tournament_id, match_id, group_name)
  SELECT p_user_id, p_target_tournament_id, c.match_id, c.group_name
  FROM corazonadas c
  WHERE c.user_id = p_user_id
    AND c.tournament_id = p_source_tournament_id
    -- Verificar que no haya ya una corazonada para ese grupo en el torneo destino
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

GRANT EXECUTE ON FUNCTION public.copy_predictions(uuid, uuid, uuid) TO authenticated;
