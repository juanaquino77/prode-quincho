-- ============================================================
-- PRODE QUINCHO - Migration 003
-- Scoring update (3/1 pts), penalty prediction, Argentine test matches
-- ============================================================

-- 1. Add penalty_winner to matches ('home' | 'away' | null)
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS penalty_winner text
    CHECK (penalty_winner IN ('home', 'away'));

-- 2. Add penalty_pred to predictions ('home' | 'away' | null)
ALTER TABLE public.predictions
  ADD COLUMN IF NOT EXISTS penalty_pred text
    CHECK (penalty_pred IN ('home', 'away'));

-- 3. New calculate_points function (updated signature + 3/1 scoring + penalty modifier)
CREATE OR REPLACE FUNCTION public.calculate_points(
  p_home_score     int,
  p_away_score     int,
  p_home_pred      int,
  p_away_pred      int,
  p_stage          text    DEFAULT 'group',
  p_penalty_winner text    DEFAULT NULL,
  p_penalty_pred   text    DEFAULT NULL
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

  -- Base points: 3 exact, 1 correct outcome, 0 wrong
  IF v_exact THEN
    v_pts := 3;
  ELSIF v_correct_outcome THEN
    v_pts := 1;
  ELSE
    RETURN 0;
  END IF;

  -- Penalty modifier (knockout draw only)
  IF v_knockout AND v_is_draw AND v_pred_draw
     AND p_penalty_winner IS NOT NULL AND p_penalty_pred IS NOT NULL
  THEN
    IF p_penalty_pred = p_penalty_winner THEN
      v_pts := v_pts + 1;          -- correct penalty: +1 always
    ELSIF v_exact THEN
      v_pts := v_pts - 1;          -- wrong penalty on exact score only: -1
      -- (no deduction when only correct-outcome-level)
    END IF;
  END IF;

  RETURN v_pts;
END;
$$;

-- 4. Update trigger function to pass stage + penalty columns
CREATE OR REPLACE FUNCTION public.update_prediction_points()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF new.status = 'finished'
     AND new.home_score IS NOT NULL
     AND new.away_score IS NOT NULL
  THEN
    UPDATE public.predictions
    SET points_earned = public.calculate_points(
          new.home_score,
          new.away_score,
          home_score_pred,
          away_score_pred,
          new.stage,
          new.penalty_winner,
          penalty_pred
        ),
        updated_at = now()
    WHERE match_id = new.id;
  END IF;
  RETURN new;
END;
$$;

-- 5. Re-create trigger so it also fires when penalty_winner is updated
DROP TRIGGER IF EXISTS on_match_finished ON public.matches;
CREATE TRIGGER on_match_finished
  AFTER UPDATE OF status, home_score, away_score, penalty_winner ON public.matches
  FOR EACH ROW EXECUTE PROCEDURE public.update_prediction_points();

-- 6. Update leaderboard: exact_scores = points_earned >= 3 (was >= 2)
CREATE OR REPLACE FUNCTION public.get_leaderboard(p_tournament_id uuid)
RETURNS TABLE (
  user_id           uuid,
  username          text,
  full_name         text,
  avatar_url        text,
  total_points      bigint,
  exact_scores      bigint,
  correct_outcomes  bigint,
  total_predictions bigint,
  rank              bigint
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    pr.id                                                             AS user_id,
    pr.username,
    pr.full_name,
    pr.avatar_url,
    COALESCE(SUM(p.points_earned), 0)                                 AS total_points,
    COUNT(CASE WHEN p.points_earned >= 3 THEN 1 END)                  AS exact_scores,
    COUNT(CASE WHEN p.points_earned >= 1 THEN 1 END)                  AS correct_outcomes,
    COUNT(p.id)                                                       AS total_predictions,
    RANK() OVER (
      ORDER BY COALESCE(SUM(p.points_earned), 0) DESC,
               COUNT(CASE WHEN p.points_earned >= 3 THEN 1 END) DESC
    )                                                                 AS rank
  FROM public.tournament_members tm
  JOIN public.profiles pr ON pr.id = tm.user_id
  LEFT JOIN public.predictions p
         ON p.user_id = tm.user_id
        AND p.tournament_id = p_tournament_id
  WHERE tm.tournament_id = p_tournament_id
  GROUP BY pr.id, pr.username, pr.full_name, pr.avatar_url
  ORDER BY total_points DESC, exact_scores DESC;
$$;

-- 7. Recalculate existing finished predictions with the new scoring function
UPDATE public.predictions p
SET points_earned = public.calculate_points(
      m.home_score,
      m.away_score,
      p.home_score_pred,
      p.away_score_pred,
      m.stage,
      m.penalty_winner,
      p.penalty_pred
    )
FROM public.matches m
WHERE p.match_id = m.id
  AND m.status = 'finished'
  AND m.home_score IS NOT NULL
  AND m.away_score IS NOT NULL;

-- 8. Argentine test matches — Torneo Apertura 2026 Octavos de Final
--    All knockout (round_of_16). ART = UTC-3, so +3h for UTC.
--    match_numbers 200-207 to avoid conflicts with World Cup seeds.
INSERT INTO public.matches
  (match_number, stage, group_name, home_team, away_team, home_flag, away_flag, match_date, venue, status)
VALUES
  -- Sábado 9 de mayo
  (200, 'round_of_16', NULL, 'Independiente Rivadavia', 'Unión de Santa Fe',    NULL, NULL, '2026-05-09T18:00:00Z', 'Mendoza',      'upcoming'),
  (201, 'round_of_16', NULL, 'Talleres',                'Belgrano',             NULL, NULL, '2026-05-09T20:30:00Z', 'Córdoba',      'upcoming'),
  (202, 'round_of_16', NULL, 'Boca Juniors',            'Huracán',              NULL, NULL, '2026-05-09T22:30:00Z', 'Buenos Aires', 'upcoming'),
  (203, 'round_of_16', NULL, 'Argentinos Juniors',      'Lanús',                NULL, NULL, '2026-05-10T00:30:00Z', 'Buenos Aires', 'upcoming'),
  -- Domingo 10 de mayo
  (204, 'round_of_16', NULL, 'Estudiantes de La Plata', 'Racing Club',          NULL, NULL, '2026-05-10T18:00:00Z', 'La Plata',     'upcoming'),
  (205, 'round_of_16', NULL, 'Rosario Central',         'Independiente',        NULL, NULL, '2026-05-10T20:30:00Z', 'Rosario',      'upcoming'),
  (206, 'round_of_16', NULL, 'River Plate',             'San Lorenzo',          NULL, NULL, '2026-05-10T22:30:00Z', 'Buenos Aires', 'upcoming'),
  (207, 'round_of_16', NULL, 'Vélez Sarsfield',         'Gimnasia de La Plata', NULL, NULL, '2026-05-11T00:30:00Z', 'Buenos Aires', 'upcoming')
;
