-- =====================================================
-- MIGRATION: Predicciones Especiales Pre-Torneo
-- Correr en Supabase SQL Editor
-- =====================================================

-- 1. Agregar columna a tournaments
ALTER TABLE tournaments
  ADD COLUMN IF NOT EXISTS has_special_predictions boolean NOT NULL DEFAULT false;

-- 2. Habilitar en el torneo global del Mundial 2026
UPDATE tournaments SET has_special_predictions = true WHERE type = 'global';

-- 3. Agregar columna a tournament_types (para config de torneos de amigos)
ALTER TABLE tournament_types
  ADD COLUMN IF NOT EXISTS has_special_predictions boolean NOT NULL DEFAULT false;

-- 4. Crear tabla de predicciones especiales
CREATE TABLE IF NOT EXISTS special_predictions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tournament_id  uuid        NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  champion_team  text,
  top_scorer     text,
  best_player    text,
  points_earned  int         NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, tournament_id)
);

-- 5. RLS
ALTER TABLE special_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sp_select_all"
  ON special_predictions FOR SELECT TO authenticated USING (true);

CREATE POLICY "sp_insert_own"
  ON special_predictions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sp_update_own"
  ON special_predictions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
