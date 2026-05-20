-- ============================================================
-- PRODE QUINCHO - Migration 022
-- Modo 1X2 y penalización diferenciada por empate/resultado exacto
-- ============================================================

-- ── 1. Nuevas columnas en tournament_types ────────────────────
ALTER TABLE public.tournament_types
  ADD COLUMN IF NOT EXISTS requires_exact_score           boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS pts_penalty_wrong_deduct_draw_outcome int NOT NULL DEFAULT 0;

-- ── 2. Recrear vista pública con nuevas columnas ──────────────
DROP VIEW IF EXISTS public.tournament_types_public;
CREATE VIEW public.tournament_types_public
  WITH (security_invoker = true)
AS
  SELECT id, name, description,
         pts_exact, pts_outcome,
         pts_penalty_correct, pts_penalty_wrong_deduct,
         pts_penalty_wrong_deduct_draw_outcome,
         requires_exact_score,
         prediction_lock_hours, show_rival_predictions,
         is_active, created_at
  FROM public.tournament_types
  WHERE is_active = true;

GRANT SELECT ON public.tournament_types_public TO authenticated, anon;

-- ── 3. RPC admin_upsert_tournament_type (SECURITY DEFINER) ────
-- Bypasea RLS verificando is_admin en el caller
CREATE OR REPLACE FUNCTION public.admin_upsert_tournament_type(
  p_name                                  text,
  p_description                           text,
  p_pts_exact                             int,
  p_pts_outcome                           int,
  p_pts_penalty_correct                   int,
  p_pts_penalty_wrong_deduct              int,
  p_pts_penalty_wrong_deduct_draw_outcome int,
  p_requires_exact_score                  boolean,
  p_prediction_lock_hours                 int,
  p_show_rival_predictions                text,
  p_club_fee_percentage                   numeric,
  p_is_active                             boolean,
  p_id                                    uuid DEFAULT NULL
) RETURNS public.tournament_types
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result public.tournament_types;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  IF p_id IS NOT NULL THEN
    UPDATE public.tournament_types SET
      name                                  = p_name,
      description                           = p_description,
      pts_exact                             = p_pts_exact,
      pts_outcome                           = p_pts_outcome,
      pts_penalty_correct                   = p_pts_penalty_correct,
      pts_penalty_wrong_deduct              = p_pts_penalty_wrong_deduct,
      pts_penalty_wrong_deduct_draw_outcome = p_pts_penalty_wrong_deduct_draw_outcome,
      requires_exact_score                  = p_requires_exact_score,
      prediction_lock_hours                 = p_prediction_lock_hours,
      show_rival_predictions                = p_show_rival_predictions,
      club_fee_percentage                   = p_club_fee_percentage,
      is_active                             = p_is_active
    WHERE id = p_id
    RETURNING * INTO v_result;
  ELSE
    INSERT INTO public.tournament_types (
      name, description,
      pts_exact, pts_outcome,
      pts_penalty_correct, pts_penalty_wrong_deduct,
      pts_penalty_wrong_deduct_draw_outcome, requires_exact_score,
      prediction_lock_hours, show_rival_predictions,
      club_fee_percentage, is_active
    ) VALUES (
      p_name, p_description,
      p_pts_exact, p_pts_outcome,
      p_pts_penalty_correct, p_pts_penalty_wrong_deduct,
      p_pts_penalty_wrong_deduct_draw_outcome, p_requires_exact_score,
      p_prediction_lock_hours, p_show_rival_predictions,
      p_club_fee_percentage, p_is_active
    )
    RETURNING * INTO v_result;
  END IF;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_upsert_tournament_type(
  text, text, int, int, int, int, int, boolean, int, text, numeric, boolean, uuid
) TO authenticated;

-- ── 4. Actualizar create_tournament: incluye nuevos campos en rules ──
CREATE OR REPLACE FUNCTION public.create_tournament(
  p_name               text,
  p_entry_fee          numeric,
  p_tournament_type_id uuid,
  p_competition        text,
  p_created_by         uuid
) RETURNS public.tournaments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type       public.tournament_types;
  v_code       text;
  v_tournament public.tournaments;
BEGIN
  SELECT * INTO v_type
  FROM public.tournament_types
  WHERE id = p_tournament_type_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tipo de torneo no encontrado o inactivo';
  END IF;

  v_code := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 6));

  INSERT INTO public.tournaments (
    name, type, invite_code, created_by,
    entry_fee, club_fee_percentage, is_active,
    competition, rules,
    prediction_lock_hours, show_rival_predictions,
    tournament_type_id
  ) VALUES (
    p_name, 'friends', v_code, p_created_by,
    p_entry_fee, v_type.club_fee_percentage, true,
    p_competition,
    jsonb_build_object(
      'pts_exact',                             v_type.pts_exact,
      'pts_outcome',                           v_type.pts_outcome,
      'pts_penalty_correct',                   v_type.pts_penalty_correct,
      'pts_penalty_wrong_deduct',              v_type.pts_penalty_wrong_deduct,
      'pts_penalty_wrong_deduct_draw_outcome', v_type.pts_penalty_wrong_deduct_draw_outcome,
      'requires_exact_score',                  v_type.requires_exact_score
    ),
    v_type.prediction_lock_hours,
    v_type.show_rival_predictions,
    p_tournament_type_id
  )
  RETURNING * INTO v_tournament;

  INSERT INTO public.tournament_members (tournament_id, user_id, paid)
  VALUES (v_tournament.id, p_created_by, p_entry_fee = 0);

  RETURN v_tournament;
END;
$$;

-- ── 5. Actualizar calculate_points: nuevos parámetros ─────────
CREATE OR REPLACE FUNCTION public.calculate_points(
  p_home_score                          integer,
  p_away_score                          integer,
  p_home_pred                           integer,
  p_away_pred                           integer,
  p_stage                               text    DEFAULT 'group',
  p_penalty_winner                      text    DEFAULT NULL,
  p_penalty_pred                        text    DEFAULT NULL,
  p_pts_exact                           integer DEFAULT 3,
  p_pts_outcome                         integer DEFAULT 1,
  p_pts_penalty_correct                 integer DEFAULT 1,
  p_pts_penalty_wrong_deduct            integer DEFAULT 1,
  p_pts_penalty_wrong_deduct_draw_outcome integer DEFAULT 0,
  p_requires_exact_score                boolean DEFAULT true
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
BEGIN
  v_exact           := (p_home_score = p_home_pred AND p_away_score = p_away_pred);
  v_correct_outcome := (SIGN(p_home_score - p_away_score) = SIGN(p_home_pred - p_away_pred));
  v_is_draw         := (p_home_score = p_away_score);
  v_pred_draw       := (p_home_pred  = p_away_pred);
  v_knockout        := p_stage IN ('round_of_32','round_of_16','quarterfinal','semifinal','third_place','final');

  -- En modo 1X2 (requires_exact_score = false), el exacto no aplica
  IF NOT p_requires_exact_score THEN
    IF v_correct_outcome THEN
      v_pts := p_pts_outcome;
    ELSE
      RETURN 0;
    END IF;
  ELSE
    IF v_exact THEN
      v_pts := p_pts_exact;
    ELSIF v_correct_outcome THEN
      v_pts := p_pts_outcome;
    ELSE
      RETURN 0;
    END IF;
  END IF;

  -- Modificador penales (solo empates en eliminatorias)
  IF v_knockout AND v_is_draw AND v_pred_draw
     AND p_penalty_winner IS NOT NULL AND p_penalty_pred IS NOT NULL
  THEN
    IF p_penalty_pred = p_penalty_winner THEN
      v_pts := v_pts + p_pts_penalty_correct;
    ELSIF v_exact AND p_requires_exact_score THEN
      -- Acertó el marcador exacto + erró el penal → descuento completo
      v_pts := v_pts - p_pts_penalty_wrong_deduct;
    ELSE
      -- Acertó el empate (no exacto) o modo 1X2 + erró el penal → descuento reducido (default 0)
      v_pts := v_pts - p_pts_penalty_wrong_deduct_draw_outcome;
    END IF;
  END IF;

  RETURN v_pts;
END;
$$;

-- ── 6. Actualizar trigger update_prediction_points ────────────
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
          COALESCE((t.rules->>'pts_penalty_wrong_deduct')::int, 1),
          COALESCE((t.rules->>'pts_penalty_wrong_deduct_draw_outcome')::int, 0),
          COALESCE((t.rules->>'requires_exact_score')::boolean, true)
        ),
        updated_at = now()
    FROM public.tournaments t
    WHERE p.match_id = new.id
      AND p.tournament_id = t.id;
  END IF;
  RETURN new;
END;
$$;
