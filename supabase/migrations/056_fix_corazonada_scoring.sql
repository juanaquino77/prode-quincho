-- ============================================================
-- PRODE QUINCHO - Migration 056
-- Fix corazonada: lógica correcta de puntos
-- Regla: exacto = 3 pts, exacto + corazonada = 5 pts TOTAL
--        (no es bonus adicional, es reemplazo del pts_exact)
-- Recalcula todos los partidos ya jugados con la lógica correcta
-- ============================================================

-- 1. Asegurar que calculate_points tiene la lógica correcta de corazonada
CREATE OR REPLACE FUNCTION public.calculate_points(
  p_home_score                            integer,
  p_away_score                            integer,
  p_home_pred                             integer,
  p_away_pred                             integer,
  p_stage                                 text    DEFAULT 'group',
  p_penalty_winner                        text    DEFAULT NULL,
  p_penalty_pred                          text    DEFAULT NULL,
  p_pts_exact                             integer DEFAULT 3,
  p_pts_outcome                           integer DEFAULT 1,
  p_pts_penalty_correct                   integer DEFAULT 1,
  p_pts_penalty_wrong_deduct              integer DEFAULT 1,
  p_pts_penalty_wrong_deduct_draw_outcome integer DEFAULT 0,
  p_requires_exact_score                  boolean DEFAULT true,
  p_is_corazonada                         boolean DEFAULT false,
  p_pts_corazonada                        integer DEFAULT 5
) RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_exact           boolean;
  v_correct_outcome boolean;
  v_is_draw         boolean;
  v_pred_draw       boolean;
  v_knockout        boolean;
  v_pts             int := 0;
  v_base_exact      int;
BEGIN
  v_exact           := (p_home_score = p_home_pred AND p_away_score = p_away_pred);
  v_correct_outcome := (SIGN(p_home_score - p_away_score) = SIGN(p_home_pred - p_away_pred));
  v_is_draw         := (p_home_score = p_away_score);
  v_pred_draw       := (p_home_pred  = p_away_pred);
  v_knockout        := p_stage IN ('round_of_32','round_of_16','quarterfinal','semifinal','third_place','final');

  -- Corazonada: si es exacto Y tiene corazonada → p_pts_corazonada TOTALES (no bonus)
  -- Si es exacto sin corazonada → p_pts_exact normales
  v_base_exact := CASE WHEN p_is_corazonada AND v_exact THEN p_pts_corazonada ELSE p_pts_exact END;

  IF NOT p_requires_exact_score THEN
    IF v_correct_outcome THEN
      v_pts := p_pts_outcome;
    ELSE
      RETURN 0;
    END IF;
  ELSE
    IF v_exact THEN
      v_pts := v_base_exact;
    ELSIF v_correct_outcome THEN
      v_pts := p_pts_outcome;
    ELSE
      RETURN 0;
    END IF;
  END IF;

  -- Penales: solo empates en eliminatorias
  IF v_knockout AND v_is_draw AND v_pred_draw
     AND p_penalty_winner IS NOT NULL AND p_penalty_pred IS NOT NULL
  THEN
    IF p_penalty_pred = p_penalty_winner THEN
      v_pts := v_pts + p_pts_penalty_correct;
    ELSIF v_exact AND p_requires_exact_score THEN
      v_pts := v_pts - p_pts_penalty_wrong_deduct;
    ELSE
      v_pts := v_pts - p_pts_penalty_wrong_deduct_draw_outcome;
    END IF;
  END IF;

  RETURN v_pts;
END;
$$;

-- 2. Asegurar que el trigger usa la lógica de corazonada correctamente
CREATE OR REPLACE FUNCTION public.update_prediction_points()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF (new.status = 'finished' OR new.status = 'live')
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
          COALESCE((t.rules->>'pts_exact')::int,                             3),
          COALESCE((t.rules->>'pts_outcome')::int,                           1),
          COALESCE((t.rules->>'pts_penalty_correct')::int,                   1),
          COALESCE((t.rules->>'pts_penalty_wrong_deduct')::int,              1),
          COALESCE((t.rules->>'pts_penalty_wrong_deduct_draw_outcome')::int, 0),
          COALESCE((t.rules->>'requires_exact_score')::boolean,              true),
          -- Solo true si el usuario puso explícitamente corazonada en este partido
          EXISTS (
            SELECT 1 FROM public.corazonadas c
            WHERE c.match_id      = new.id
              AND c.user_id       = p.user_id
              AND c.tournament_id = p.tournament_id
          ),
          COALESCE(t.pts_corazonada_bonus, 5)
        ),
        updated_at = now()
    FROM public.tournaments t
    WHERE p.match_id      = new.id
      AND p.tournament_id = t.id;
  END IF;
  RETURN new;
END;
$$;

-- 3. Recalcular puntos para TODOS los partidos ya jugados (finished o live)
--    Esto corrige los puntos del partido México vs Sudáfrica y cualquier otro
--    del primer día que se hayan calculado incorrectamente.
UPDATE public.predictions p
SET points_earned = public.calculate_points(
      m.home_score,
      m.away_score,
      p.home_score_pred,
      p.away_score_pred,
      m.stage,
      m.penalty_winner,
      p.penalty_pred,
      COALESCE((t.rules->>'pts_exact')::int,                             3),
      COALESCE((t.rules->>'pts_outcome')::int,                           1),
      COALESCE((t.rules->>'pts_penalty_correct')::int,                   1),
      COALESCE((t.rules->>'pts_penalty_wrong_deduct')::int,              1),
      COALESCE((t.rules->>'pts_penalty_wrong_deduct_draw_outcome')::int, 0),
      COALESCE((t.rules->>'requires_exact_score')::boolean,              true),
      -- Solo true si el usuario puso explícitamente corazonada en este partido
      EXISTS (
        SELECT 1 FROM public.corazonadas c
        WHERE c.match_id      = m.id
          AND c.user_id       = p.user_id
          AND c.tournament_id = p.tournament_id
      ),
      COALESCE(t.pts_corazonada_bonus, 5)
    ),
    updated_at = now()
FROM public.matches m,
     public.tournaments t
WHERE p.match_id      = m.id
  AND p.tournament_id = t.id
  AND m.status IN ('finished', 'live')
  AND m.home_score IS NOT NULL
  AND m.away_score IS NOT NULL;
