-- ============================================================
-- PRODE QUINCHO - Migration 058
-- Restaura get_leaderboard al estado de migration 055:
--   - Filtra miembros inactivos (is_active = true)
--   - Devuelve paid y free_pass
--   - Elimina is_hot / is_cold (las rachas se calculan en el frontend)
-- ============================================================

DROP FUNCTION IF EXISTS public.get_leaderboard(uuid);

CREATE OR REPLACE FUNCTION public.get_leaderboard(p_tournament_id uuid)
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
  free_pass             boolean
) LANGUAGE sql SECURITY DEFINER AS $$
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
    COALESCE(pr.free_pass, false)                                      AS free_pass
  FROM public.tournament_members tm
  JOIN public.profiles pr ON pr.id = tm.user_id
  LEFT JOIN public.predictions p
         ON p.user_id      = tm.user_id
        AND p.tournament_id = p_tournament_id
  WHERE tm.tournament_id = p_tournament_id
    AND tm.is_active = true
  GROUP BY pr.id, pr.username, pr.full_name, pr.avatar_url, tm.paid, pr.free_pass
  ORDER BY total_points DESC, exact_scores DESC;
$$;
