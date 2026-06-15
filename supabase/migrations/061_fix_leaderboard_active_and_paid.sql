-- ============================================================
-- PRODE QUINCHO - Migration 061
-- Fix get_leaderboard: restaurar filtro is_active=true y campos paid/free_pass
-- que se perdieron en migraciones 057-060
-- ============================================================

DROP FUNCTION IF EXISTS public.get_leaderboard(uuid);

CREATE FUNCTION public.get_leaderboard(p_tournament_id uuid)
RETURNS TABLE (
  user_id               uuid,
  username              text,
  full_name             text,
  avatar_url            text,
  total_points          bigint,
  exact_scores          bigint,
  correct_outcomes      bigint,
  total_predictions     bigint,
  corazonadas_acertadas bigint,
  rank                  bigint,
  paid                  boolean,
  free_pass             boolean,
  is_hot                boolean,
  is_cold               boolean
) LANGUAGE sql SECURITY DEFINER AS $$
  WITH recent_preds AS (
    SELECT
      p.user_id,
      p.points_earned,
      ROW_NUMBER() OVER (
        PARTITION BY p.user_id
        ORDER BY m.match_date DESC
      ) AS rn
    FROM public.predictions p
    JOIN public.matches m ON m.id = p.match_id
    WHERE p.tournament_id = p_tournament_id
      AND m.status        = 'finished'
      AND m.home_score   IS NOT NULL
      AND m.away_score   IS NOT NULL
  ),
  streak_info AS (
    SELECT
      user_id,
      CASE WHEN COUNT(*) >= 3 THEN (
        COUNT(CASE WHEN rn <= 3 AND points_earned >= 3 THEN 1 END) >= 2
        OR COUNT(CASE WHEN rn <= 3 AND points_earned = 0 THEN 1 END) = 0
      ) ELSE false END AS is_hot,
      CASE WHEN COUNT(*) >= 3 THEN (
        SUM(points_earned) = 0
        OR COUNT(CASE WHEN rn <= 3 AND points_earned > 0 THEN 1 END) = 0
      ) ELSE false END AS is_cold
    FROM recent_preds
    GROUP BY user_id
  )
  SELECT
    pr.id                                                              AS user_id,
    pr.username,
    pr.full_name,
    pr.avatar_url,
    COALESCE(SUM(p.points_earned), 0)                                  AS total_points,
    COUNT(CASE WHEN p.points_earned >= 3 THEN 1 END)                   AS exact_scores,
    COUNT(CASE WHEN p.points_earned >= 1 THEN 1 END)                   AS correct_outcomes,
    COUNT(p.id)                                                        AS total_predictions,
    COUNT(CASE WHEN EXISTS (
      SELECT 1 FROM public.corazonadas c
      WHERE c.match_id      = p.match_id
        AND c.user_id       = p.user_id
        AND c.tournament_id = p.tournament_id
    ) AND p.points_earned >= 5 THEN 1 END)                             AS corazonadas_acertadas,
    RANK() OVER (
      ORDER BY COALESCE(SUM(p.points_earned), 0)             DESC,
               COUNT(CASE WHEN p.points_earned >= 3 THEN 1 END) DESC
    )                                                                  AS rank,
    tm.paid                                                            AS paid,
    COALESCE(pr.free_pass, false)                                      AS free_pass,
    COALESCE(si.is_hot,  false)                                        AS is_hot,
    COALESCE(si.is_cold, false)                                        AS is_cold
  FROM public.tournament_members tm
  JOIN public.profiles pr ON pr.id = tm.user_id
  LEFT JOIN public.predictions p
         ON p.user_id      = tm.user_id
        AND p.tournament_id = p_tournament_id
  LEFT JOIN streak_info si ON si.user_id = tm.user_id
  WHERE tm.tournament_id = p_tournament_id
    AND tm.is_active      = true
  GROUP BY pr.id, pr.username, pr.full_name, pr.avatar_url, tm.paid, pr.free_pass, si.is_hot, si.is_cold
  ORDER BY total_points DESC, exact_scores DESC;
$$;
