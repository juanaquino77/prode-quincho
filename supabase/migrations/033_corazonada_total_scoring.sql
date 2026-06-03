-- ============================================================
-- PRODE QUINCHO - Migration 033
-- Corazonada: 5 pts TOTAL (no bonus adicional) al acertar exacto
-- Leaderboard: columna corazonadas_acertadas
-- Admin: función segura para contar participantes de torneos amigos
-- ============================================================

-- 1. Tabla corazonadas (idempotente por si no existe)
CREATE TABLE IF NOT EXISTS public.corazonadas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tournament_id uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  match_id      uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  group_name    text,
  created_at    timestamptz DEFAULT now()
);
ALTER TABLE public.corazonadas ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Usuarios ven sus propias corazonadas"
  ON public.corazonadas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Usuarios insertan sus corazonadas"
  ON public.corazonadas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Usuarios borran sus corazonadas"
  ON public.corazonadas FOR DELETE USING (auth.uid() = user_id);

-- 2. calculate_points: ahora acepta flag de corazonada
--    Cuando p_is_corazonada=true y resultado exacto → p_pts_corazonada pts TOTALES
--    (reemplaza a p_pts_exact, no se suman: 5 total, no 3+5)
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

  -- Corazonada: si es exacto usa pts_corazonada TOTALES en vez de pts_exact
  v_base_exact := CASE WHEN p_is_corazonada THEN p_pts_corazonada ELSE p_pts_exact END;

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

  -- Penales: solo empates en eliminatorias (aplican también sobre corazonada)
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

-- 3. Trigger: pasa el flag is_corazonada al calcular puntos
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
          -- ¿Es corazonada de este usuario en este torneo?
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

-- 4. get_leaderboard: agrega columna corazonadas_acertadas
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
  rank                  bigint
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
    )                                                                  AS rank
  FROM public.tournament_members tm
  JOIN public.profiles pr ON pr.id = tm.user_id
  LEFT JOIN public.predictions p
         ON p.user_id      = tm.user_id
        AND p.tournament_id = p_tournament_id
  WHERE tm.tournament_id = p_tournament_id
  GROUP BY pr.id, pr.username, pr.full_name, pr.avatar_url
  ORDER BY total_points DESC, exact_scores DESC;
$$;

-- 5. Admin: función segura para contar participantes (bypasa RLS)
CREATE OR REPLACE FUNCTION public.admin_get_friend_tournaments()
RETURNS TABLE (
  id              uuid,
  name            text,
  created_by      uuid,
  entry_fee       numeric,
  created_at      timestamptz,
  member_count    bigint
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.created_by,
    t.entry_fee,
    t.created_at,
    COUNT(tm.user_id) AS member_count
  FROM tournaments t
  LEFT JOIN tournament_members tm ON tm.tournament_id = t.id
  WHERE t.type = 'friends' AND t.is_active = true
  GROUP BY t.id, t.name, t.created_by, t.entry_fee, t.created_at
  ORDER BY t.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_friend_tournaments() TO authenticated;
