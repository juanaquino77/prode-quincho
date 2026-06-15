-- ============================================================
-- PRODE QUINCHO - Migration 063
-- Reemplaza is_hot boolean por hot_level int (0/1/2)
-- 🔥🔥 = 7+ puntos en últimos 3 partidos
-- 🔥   = 2-6 puntos en últimos 3 partidos
-- 0    = menos de 2 puntos
-- Mantiene: is_cold, is_active = true, christiandafnos siempre 🥶
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
  hot_level             int,
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
      COUNT(*) AS played,
      -- 🔥 hot_level: basado en puntos totales en últimos 3 partidos
      CASE WHEN COUNT(*) >= 3 THEN
        CASE
          WHEN SUM(CASE WHEN rn <= 3 THEN points_earned ELSE 0 END) >= 7 THEN 2
          WHEN SUM(CASE WHEN rn <= 3 THEN points_earned ELSE 0 END) >= 2 THEN 1
          ELSE 0
        END
      ELSE 0 END AS hot_level,
      -- 🥶 is_cold: 0 puntos en cada uno de los últimos 3 partidos
      CASE WHEN COUNT(*) >= 3 THEN
        COUNT(CASE WHEN rn <= 3 AND points_earned > 0 THEN 1 END) = 0
      ELSE false END AS is_cold
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
      ORDER BY COALESCE(SUM(p.points_earned), 0)              DESC,
               COUNT(CASE WHEN p.points_earned >= 3 THEN 1 END) DESC
    )                                                                  AS rank,
    tm.paid                                                            AS paid,
    COALESCE(pr.free_pass, false)                                      AS free_pass,
    COALESCE(si.hot_level, 0)                                          AS hot_level,
    -- christiandafnos siempre tiene frío
    CASE WHEN pr.username = 'christiandafnos' THEN true
         ELSE COALESCE(si.is_cold, false)
    END                                                                AS is_cold
  FROM public.tournament_members tm
  JOIN public.profiles pr ON pr.id = tm.user_id
  LEFT JOIN public.predictions p
         ON p.user_id       = tm.user_id
        AND p.tournament_id = p_tournament_id
  LEFT JOIN streak_info si ON si.user_id = tm.user_id
  WHERE tm.tournament_id = p_tournament_id
    AND tm.is_active = true
  GROUP BY pr.id, pr.username, pr.full_name, pr.avatar_url, tm.paid, pr.free_pass, si.hot_level, si.is_cold
  ORDER BY COALESCE(SUM(p.points_earned), 0) DESC,
           COUNT(CASE WHEN p.points_earned >= 3 THEN 1 END) DESC;
$$;
