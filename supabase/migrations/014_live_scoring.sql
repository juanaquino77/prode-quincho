-- ============================================================
-- PRODE QUINCHO - Migration 014
-- Puntos provisionales durante partidos en vivo
-- ============================================================

-- Actualiza puntos tanto en 'live' como en 'finished'
-- Así la tabla de posiciones refleja el marcador actual durante el partido
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

-- El trigger ya existe con la firma correcta, no hace falta recrearlo
