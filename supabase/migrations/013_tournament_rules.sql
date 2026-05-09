-- ============================================================
-- PRODE QUINCHO - Migration 013
-- Reglas de puntuación configurables por torneo
-- ============================================================

-- 1. Columna rules en tournaments (JSONB con defaults que mantienen comportamiento actual)
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS rules jsonb NOT NULL DEFAULT '{
    "pts_exact": 3,
    "pts_outcome": 1,
    "pts_penalty_correct": 1,
    "pts_penalty_wrong_deduct": 1
  }'::jsonb;

-- 2. calculate_points con parámetros de reglas opcionales
CREATE OR REPLACE FUNCTION public.calculate_points(
  p_home_score              int,
  p_away_score              int,
  p_home_pred               int,
  p_away_pred               int,
  p_stage                   text    DEFAULT 'group',
  p_penalty_winner          text    DEFAULT NULL,
  p_penalty_pred            text    DEFAULT NULL,
  p_pts_exact               int     DEFAULT 3,
  p_pts_outcome             int     DEFAULT 1,
  p_pts_penalty_correct     int     DEFAULT 1,
  p_pts_penalty_wrong_deduct int    DEFAULT 1
) RETURNS int LANGUAGE plpgsql AS $$
DECLARE
  v_exact           boolean;
  v_correct_outcome boolean;
  v_is_draw         boolean;
  v_pred_draw       boolean;
  v_knockout        boolean;
  v_pts             int := 0;
BEGIN
  v_exact           := (p_home_score = p_home_pred AND p_away_score = p_away_pred);
  v_correct_outcome := (SIGN(p_home_score - p_away_score) = SIGN(p_home_pred - p_away_pred));
  v_is_draw         := (p_home_score = p_away_score);
  v_pred_draw       := (p_home_pred  = p_away_pred);
  v_knockout        := p_stage IN ('round_of_32','round_of_16','quarterfinal','semifinal','third_place','final');

  IF v_exact THEN
    v_pts := p_pts_exact;
  ELSIF v_correct_outcome THEN
    v_pts := p_pts_outcome;
  ELSE
    RETURN 0;
  END IF;

  -- Modificador penales (solo empates en eliminatorias)
  IF v_knockout AND v_is_draw AND v_pred_draw
     AND p_penalty_winner IS NOT NULL AND p_penalty_pred IS NOT NULL
  THEN
    IF p_penalty_pred = p_penalty_winner THEN
      v_pts := v_pts + p_pts_penalty_correct;
    ELSIF v_exact THEN
      v_pts := v_pts - p_pts_penalty_wrong_deduct;
    END IF;
  END IF;

  RETURN v_pts;
END;
$$;

-- 3. Trigger actualizado: usa reglas del torneo de cada predicción
CREATE OR REPLACE FUNCTION public.update_prediction_points()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF new.status = 'finished'
     AND new.home_score IS NOT NULL
     AND new.away_score IS NOT NULL
  THEN
    UPDATE public.predictions p
    SET points_earned = public.calculate_points(
          new.home_score,
          new.away_score,
          p.home_score_pred,
          p.away_score_pred,
          new.stage,
          new.penalty_winner,
          p.penalty_pred,
          COALESCE((t.rules->>'pts_exact')::int, 3),
          COALESCE((t.rules->>'pts_outcome')::int, 1),
          COALESCE((t.rules->>'pts_penalty_correct')::int, 1),
          COALESCE((t.rules->>'pts_penalty_wrong_deduct')::int, 1)
        ),
        updated_at = now()
    FROM public.tournaments t
    WHERE p.match_id = new.id
      AND p.tournament_id = t.id;
  END IF;
  RETURN new;
END;
$$;

-- El trigger ya existe, no hace falta recrearlo (misma firma)
