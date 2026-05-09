// Hardcoded team crest URLs — Wikipedia SVG (verified working)
// Used as fallback when match.home_flag/away_flag is missing or broken
const BASE = 'https://upload.wikimedia.org/wikipedia/commons'

export const TEAM_CRESTS: Record<string, string> = {
  // Apertura 2026 — Octavos
  'Boca Juniors':               `${BASE}/8/83/Escudo_del_Club_Atl%C3%A9tico_Boca_Juniors.svg`,
  'River Plate':                `${BASE}/3/39/River_Plate_logo.svg`,
  'Racing Club':                `${BASE}/e/e2/Escudo_del_Racing_Club_de_Avellaneda.svg`,
  'Independiente':              `${BASE}/d/db/Escudo_del_Club_Atl%C3%A9tico_Independiente.svg`,
  'San Lorenzo':                `${BASE}/7/77/Escudo_del_Club_Atl%C3%A9tico_San_Lorenzo_de_Almagro.svg`,
  'Huracán':                    `${BASE}/9/99/Escudo_del_Club_Atl%C3%A9tico_Hurac%C3%A1n.svg`,
  'Vélez Sarsfield':            `${BASE}/2/24/V%C3%A9lez_S%C3%A1rsfield_escudo.svg`,
  'Estudiantes de La Plata':    `${BASE}/9/96/Estudiantes_de_La_Plata_escudo.svg`,
  'Talleres':                   `${BASE}/6/6b/Escudo_del_Club_Atl%C3%A9tico_Talleres.svg`,
  'Belgrano':                   `${BASE}/f/f3/Escudo_del_Club_Atl%C3%A9tico_Belgrano.svg`,
  'Rosario Central':            `${BASE}/c/ce/Rosario_Central_logo.svg`,
  'Argentinos Juniors':         `${BASE}/d/de/Club_Atletico_Argentinos_Juniors_escudo.svg`,
  'Lanús':                      `${BASE}/e/ed/Club_Atl%C3%A9tico_Lan%C3%BAs_escudo.svg`,
  'Gimnasia de La Plata':       `${BASE}/3/3d/Escudo_del_Club_de_Gimnasia_y_Esgrima_La_Plata.svg`,
  'Independiente Rivadavia':    `${BASE}/7/7f/Escudo_del_Club_Independiente_Rivadavia.svg`,
  'Unión de Santa Fe':          `${BASE}/f/fb/Escudo_Club_Atletico_Union.svg`,
}
