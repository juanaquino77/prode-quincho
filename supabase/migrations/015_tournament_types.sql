-- ============================================================
-- PRODE QUINCHO - Migration 015
-- Tipos de torneo (plantillas de reglas definidas por el admin)
-- ============================================================

-- ── 1. Tabla tournament_types ─────────────────────────────────
CREATE TABLE public.tournament_types (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                      text NOT NULL UNIQUE,
  description               text,
  pts_exact                 int  NOT NULL DEFAULT 3,
  pts_outcome               int  NOT NULL DEFAULT 1,
  pts_penalty_correct       int  NOT NULL DEFAULT 1,
  pts_penalty_wrong_deduct  int  NOT NULL DEFAULT 1,
  prediction_lock_hours     int  NOT NULL DEFAULT 2,
  show_rival_predictions    text NOT NULL DEFAULT 'after'
                              CHECK (show_rival_predictions IN ('before', 'after')),
  club_fee_percentage       numeric NOT NULL DEFAULT 10
                              CHECK (club_fee_percentage >= 0 AND club_fee_percentage <= 100),
  is_active                 boolean NOT NULL DEFAULT true,
  created_at                timestamptz DEFAULT now()
);

-- ── 2. RLS: solo admins leen/escriben la tabla completa ───────
ALTER TABLE public.tournament_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins gestionan tournament_types" ON public.tournament_types
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- ── 3. Vista pública (sin club_fee_percentage) ────────────────
CREATE VIEW public.tournament_types_public
  WITH (security_invoker = true)
AS
  SELECT id, name, description,
         pts_exact, pts_outcome, pts_penalty_correct, pts_penalty_wrong_deduct,
         prediction_lock_hours, show_rival_predictions,
         is_active, created_at
  FROM public.tournament_types
  WHERE is_active = true;

GRANT SELECT ON public.tournament_types_public TO authenticated, anon;

-- ── 4. Columnas nuevas en tournaments ─────────────────────────
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS tournament_type_id     uuid REFERENCES public.tournament_types(id),
  ADD COLUMN IF NOT EXISTS prediction_lock_hours  int  NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS show_rival_predictions text NOT NULL DEFAULT 'after'
    CHECK (show_rival_predictions IN ('before', 'after'));

-- ── 5. Vista pública de tournaments (sin club_fee_percentage) ─
CREATE VIEW public.tournaments_public
  WITH (security_invoker = true)
AS
  SELECT id, name, type, invite_code, created_by,
         entry_fee, prize_pool, is_active, competition, rules,
         prediction_lock_hours, show_rival_predictions,
         tournament_type_id, created_at
  FROM public.tournaments
  WHERE is_active = true;

GRANT SELECT ON public.tournaments_public TO authenticated, anon;

-- ── 6. RPC create_tournament (security definer) ───────────────
-- Lee club_fee_percentage internamente sin exponerlo al cliente
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
      'pts_exact',               v_type.pts_exact,
      'pts_outcome',             v_type.pts_outcome,
      'pts_penalty_correct',     v_type.pts_penalty_correct,
      'pts_penalty_wrong_deduct', v_type.pts_penalty_wrong_deduct
    ),
    v_type.prediction_lock_hours,
    v_type.show_rival_predictions,
    p_tournament_type_id
  )
  RETURNING * INTO v_tournament;

  -- Auto-inscribir al creador
  INSERT INTO public.tournament_members (tournament_id, user_id, paid)
  VALUES (v_tournament.id, p_created_by, p_entry_fee = 0);

  RETURN v_tournament;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_tournament(text, numeric, uuid, text, uuid) TO authenticated;

-- ── 7. RLS predictions: compañeros de torneo pueden verse ─────
-- Permite ver predicciones de otros miembros del mismo torneo.
-- El frontend controla si se muestran antes/después del partido
-- según show_rival_predictions del torneo.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'predictions'
      AND policyname = 'Ver pronósticos de compañeros de torneo'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Ver pronósticos de compañeros de torneo"
        ON public.predictions FOR SELECT
        USING (
          auth.uid() IS NOT NULL AND
          EXISTS (
            SELECT 1 FROM public.tournament_members tm
            WHERE tm.tournament_id = predictions.tournament_id
              AND tm.user_id = auth.uid()
          )
        )
    $policy$;
  END IF;
END;
$$;

-- ── 8. Tabla reminder_logs (idempotencia de emails) ───────────
CREATE TABLE public.reminder_logs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id  uuid NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  round_key      text NOT NULL,
  sent_at        timestamptz DEFAULT now(),
  UNIQUE(tournament_id, user_id, round_key)
);

ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;
-- Sin policy: solo service role (edge function) accede

-- ── 9. Seed: tipos de torneo iniciales ────────────────────────
INSERT INTO public.tournament_types (
  name, description,
  pts_exact, pts_outcome, pts_penalty_correct, pts_penalty_wrong_deduct,
  prediction_lock_hours, show_rival_predictions, club_fee_percentage
) VALUES
  ('Normal',
   'Reglas clásicas. Pronósticos cierran 2 horas antes del primer partido de cada jornada.',
   3, 1, 1, 1, 2, 'after', 10),
  ('Jeringa',
   'Mayor puntaje por exactitud. Pronósticos cierran 6 horas antes y podés ver los pronósticos de tus rivales.',
   5, 2, 2, 2, 6, 'before', 15)
ON CONFLICT (name) DO NOTHING;

-- ── 10. pg_cron: recordatorios cada 15 minutos ────────────────
SELECT cron.unschedule('send-prediction-reminders') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'send-prediction-reminders'
);

SELECT cron.schedule(
  'send-prediction-reminders',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://ueecbkteyzgjilaindwj.supabase.co/functions/v1/send-prediction-reminders',
    headers := jsonb_build_object(
      'Content-Type',   'application/json',
      'x-reminder-secret', 'prode-reminder-2026'
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);
