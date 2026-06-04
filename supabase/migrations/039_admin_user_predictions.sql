-- Migration 039: admin puede ver todas las predicciones de un usuario

CREATE OR REPLACE FUNCTION public.admin_get_user_predictions(
  p_user_id       uuid,
  p_tournament_id uuid
)
RETURNS TABLE (
  match_id        uuid,
  stage           text,
  group_name      text,
  match_number    int,
  home_team       text,
  away_team       text,
  match_date      timestamptz,
  match_status    text,
  home_score      int,
  away_score      int,
  home_score_pred int,
  away_score_pred int,
  penalty_pred    text,
  points_earned   numeric,
  is_corazonada   boolean
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR is_organizer = true)) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY
  SELECT
    m.id,
    m.stage::text,
    m.group_name,
    m.match_number,
    m.home_team,
    m.away_team,
    m.match_date,
    m.status::text,
    m.home_score,
    m.away_score,
    p.home_score_pred,
    p.away_score_pred,
    p.penalty_pred::text,
    COALESCE(p.points_earned, 0),
    EXISTS (
      SELECT 1 FROM corazonadas c
      WHERE c.user_id = p_user_id AND c.tournament_id = p_tournament_id AND c.match_id = m.id
    )
  FROM predictions p
  JOIN matches m ON m.id = p.match_id
  WHERE p.user_id = p_user_id AND p.tournament_id = p_tournament_id
  ORDER BY m.stage, m.group_name, m.match_date, m.match_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_user_special_predictions(
  p_user_id       uuid,
  p_tournament_id uuid
)
RETURNS TABLE (
  champion_team  text,
  top_scorer     text,
  best_player    text,
  points_earned  numeric
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR is_organizer = true)) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY
  SELECT sp.champion_team, sp.top_scorer, sp.best_player, COALESCE(sp.points_earned, 0)
  FROM special_predictions sp
  WHERE sp.user_id = p_user_id AND sp.tournament_id = p_tournament_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_user_predictions(uuid, uuid)         TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_user_special_predictions(uuid, uuid)  TO authenticated;
