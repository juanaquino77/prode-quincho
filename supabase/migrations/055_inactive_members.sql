-- Migration 055 — Usuarios inactivos en torneos
--
-- Criterio: paid = false Y sin predicciones cargadas → is_active = false
-- Los admins pueden reactivar desde el panel.
-- El leaderboard filtra is_active = true.
-- Excepción manual: gabialecarmona14 se mantiene activo.

-- ── 1. Columna is_active en tournament_members ────────────────────────────
ALTER TABLE public.tournament_members
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- ── 2. Función para que admins activen/desactiven un miembro ─────────────
CREATE OR REPLACE FUNCTION public.admin_set_member_active(
  p_user_id       uuid,
  p_tournament_id uuid,
  p_active        boolean
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  UPDATE tournament_members
     SET is_active = p_active
   WHERE user_id = p_user_id AND tournament_id = p_tournament_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_member_active(uuid, uuid, boolean) TO authenticated;

-- ── 3. get_leaderboard: excluir miembros inactivos ───────────────────────
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

-- ── 4. Exponer is_active en admin_list_tournament_members ────────────────
DROP FUNCTION IF EXISTS public.admin_list_tournament_members(uuid);
CREATE OR REPLACE FUNCTION public.admin_list_tournament_members(p_tournament_id uuid)
RETURNS TABLE (
  user_id                  uuid,
  username                 text,
  full_name                text,
  avatar_url               text,
  paid                     boolean,
  joined_at                timestamptz,
  payment_method           text,
  freepass_reason          text,
  payment_note             text,
  payment_amount           numeric,
  prediction_count         bigint,
  has_special_predictions  boolean,
  is_active                boolean
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR is_organizer = true)
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  RETURN QUERY
  SELECT
    tm.user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    tm.paid,
    tm.joined_at,
    CASE
      WHEN pay.mp_payment_id IS NOT NULL THEN 'mercadopago'
      WHEN pay.id IS NOT NULL            THEN 'manual'
      WHEN tm.paid AND p.free_pass       THEN 'freepass'
      WHEN tm.paid AND tm.payment_note IS NOT NULL THEN 'manual'
      WHEN tm.paid                       THEN 'manual'
      WHEN p.free_pass                   THEN 'freepass'
      ELSE NULL
    END::text AS payment_method,
    p.freepass_reason,
    tm.payment_note,
    pay.amount AS payment_amount,
    COALESCE((
      SELECT COUNT(*)
      FROM predictions pr
      WHERE pr.user_id = tm.user_id
        AND pr.tournament_id = p_tournament_id
    ), 0) AS prediction_count,
    EXISTS (
      SELECT 1
      FROM special_predictions sp
      WHERE sp.user_id = tm.user_id
        AND sp.tournament_id = p_tournament_id
        AND (sp.champion_team IS NOT NULL OR sp.top_scorer IS NOT NULL OR sp.best_player IS NOT NULL)
    ) AS has_special_predictions,
    tm.is_active
  FROM tournament_members tm
  JOIN profiles p ON p.id = tm.user_id
  LEFT JOIN payments pay
    ON pay.tournament_id = tm.tournament_id
    AND pay.user_id = tm.user_id
    AND pay.status = 'approved'
  WHERE tm.tournament_id = p_tournament_id
  ORDER BY tm.is_active DESC, tm.paid DESC, tm.joined_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_tournament_members(uuid) TO authenticated;

-- ── 5. RPC público para que el usuario vea su propio estado ──────────────
CREATE OR REPLACE FUNCTION public.get_my_membership_status(p_tournament_id uuid)
RETURNS TABLE (is_active boolean, paid boolean)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT tm.is_active, tm.paid
  FROM public.tournament_members tm
  WHERE tm.tournament_id = p_tournament_id
    AND tm.user_id = auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_membership_status(uuid) TO authenticated;
