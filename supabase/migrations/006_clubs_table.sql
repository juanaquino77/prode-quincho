-- ============================================================
-- Tabla de clubes — almacena información y colores de cada club
-- ============================================================
CREATE TABLE IF NOT EXISTS public.clubs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text UNIQUE NOT NULL,          -- nombre exacto (debe coincidir con matches.home_team / away_team)
  short_name    text,                           -- nombre corto para UI compacta
  initials      text,                           -- 2-3 letras para badges
  primary_color   text,                         -- color principal (hex)
  secondary_color text,                         -- color secundario (hex)
  tertiary_color  text,                         -- color terciario (hex, opcional)
  stripe_style  text DEFAULT 'vertical',        -- vertical | horizontal | sash | diagonal | solid | halves
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clubes son públicos para leer"
  ON public.clubs FOR SELECT USING (true);

CREATE POLICY "Solo admins modifican clubes"
  ON public.clubs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- ============================================================
-- Seed — Apertura 2026 (octavos)
-- stripe_style:
--   vertical   = rajas verticales bicolor
--   horizontal = rajas horizontales bicolor
--   sash       = banda diagonal sobre fondo (ej: River)
--   diagonal   = partido en diagonal
--   halves     = mitad izquierda / mitad derecha
--   solid      = color sólido
-- ============================================================
INSERT INTO public.clubs (name, short_name, initials, primary_color, secondary_color, tertiary_color, stripe_style) VALUES
  ('Boca Juniors',            'Boca',        'BJ', '#003087', '#F5B800', NULL,      'horizontal'),
  ('River Plate',             'River',       'RP', '#FFFFFF', '#CC0000', NULL,      'sash'),
  ('Racing Club',             'Racing',      'RC', '#2C5FAA', '#FFFFFF', NULL,      'vertical'),
  ('Independiente',           'Independiente','IN', '#CC0000', '#CC0000', NULL,     'solid'),
  ('San Lorenzo',             'San Lorenzo', 'SL', '#C0392B', '#003087', NULL,      'vertical'),
  ('Huracán',                 'Huracán',     'HU', '#FFFFFF', '#3A7BD5', NULL,      'vertical'),
  ('Vélez Sarsfield',         'Vélez',       'VS', '#003087', '#FFFFFF', NULL,      'solid'),
  ('Estudiantes de La Plata', 'Estudiantes', 'ES', '#CC0000', '#FFFFFF', NULL,      'vertical'),
  ('Talleres',                'Talleres',    'TA', '#003087', '#FFFFFF', NULL,      'vertical'),
  ('Belgrano',                'Belgrano',    'BE', '#1E3A8A', '#FFFFFF', NULL,      'vertical'),
  ('Rosario Central',         'Central',     'RC', '#003087', '#F5B800', NULL,      'vertical'),
  ('Argentinos Juniors',      'Argentinos',  'AJ', '#CC0000', '#FFFFFF', NULL,      'vertical'),
  ('Lanús',                   'Lanús',       'LA', '#6B1A2A', '#FFFFFF', NULL,      'solid'),
  ('Gimnasia de La Plata',    'Gimnasia',    'GI', '#1E3A8A', '#FFFFFF', NULL,      'diagonal'),
  ('Independiente Rivadavia', 'Rivadavia',   'IR', '#1E3A8A', '#FFFFFF', NULL,      'horizontal'),
  ('Unión de Santa Fe',       'Unión',       'UN', '#CC0000', '#FFFFFF', NULL,      'vertical')
ON CONFLICT (name) DO NOTHING;
