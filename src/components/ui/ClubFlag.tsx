/**
 * ClubFlag — renders the official club crest from Wikimedia Commons.
 * Falls back to a colored initials badge for unknown teams.
 */

import { useState } from 'react'
import { TEAM_COLORS } from '../../lib/teamColors'

interface ClubFlagProps {
  teamName: string
  size?: number
  className?: string
}

const CREST_URLS: Record<string, string> = {
  'River Plate':             'https://upload.wikimedia.org/wikipedia/commons/3/39/River_Plate_logo.svg',
  'Boca Juniors':            'https://upload.wikimedia.org/wikipedia/commons/8/83/Escudo_del_Club_Atl%C3%A9tico_Boca_Juniors.svg',
  'Racing Club':             'https://upload.wikimedia.org/wikipedia/commons/e/e2/Escudo_del_Racing_Club_de_Avellaneda.svg',
  'Independiente':           'https://upload.wikimedia.org/wikipedia/commons/d/db/Escudo_del_Club_Atl%C3%A9tico_Independiente.svg',
  'San Lorenzo':             'https://upload.wikimedia.org/wikipedia/commons/7/77/Escudo_del_Club_Atl%C3%A9tico_San_Lorenzo_de_Almagro.svg',
  'Huracán':                 'https://upload.wikimedia.org/wikipedia/commons/9/99/Escudo_del_Club_Atl%C3%A9tico_Hurac%C3%A1n.svg',
  'Vélez Sarsfield':         'https://upload.wikimedia.org/wikipedia/commons/2/21/Escudo_del_Club_Atl%C3%A9tico_V%C3%A9lez_Sarsfield.svg',
  'Estudiantes de La Plata': 'https://upload.wikimedia.org/wikipedia/commons/6/68/Escudo_del_Club_Estudiantes_de_La_Plata.svg',
  'Gimnasia de La Plata':    'https://upload.wikimedia.org/wikipedia/commons/9/9e/Gimnasia_y_Esgrima_La_Plata_logo.png',
  'Belgrano':                'https://upload.wikimedia.org/wikipedia/commons/4/4b/Escudo_de_Belgrano_de_C%C3%B3rdoba.svg',
  'Talleres':                'https://upload.wikimedia.org/wikipedia/commons/6/6b/Escudo_del_Club_Atl%C3%A9tico_Talleres.svg',
  'Godoy Cruz':              'https://upload.wikimedia.org/wikipedia/commons/8/84/Escudo_del_Club_Deportivo_Godoy_Cruz_Antonio_Tomba.svg',
  'Lanús':                   'https://upload.wikimedia.org/wikipedia/commons/8/84/Escudo_del_Club_Lan%C3%BAs.png',
  'Banfield':                'https://upload.wikimedia.org/wikipedia/commons/a/a2/Escudo_del_Club_Atl%C3%A9tico_Banfield.svg',
  'Defensa y Justicia':      'https://upload.wikimedia.org/wikipedia/commons/7/70/Escudo_del_Club_Social_y_Deportivo_Defensa_y_Justicia.svg',
  'Instituto':               'https://upload.wikimedia.org/wikipedia/commons/7/77/Escudo_Instituto_Atletico_Central_Cordoba.svg',
  // Apertura 2026 — equipos adicionales
  'Argentinos Juniors':      'https://upload.wikimedia.org/wikipedia/commons/1/1b/Escudo_de_la_Asociaci%C3%B3n_Atl%C3%A9tica_Argentinos_Juniors.svg',
  'Independiente Rivadavia': 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Escudo_del_Club_Independiente_Rivadavia.svg',
  'Unión de Santa Fe':       'https://upload.wikimedia.org/wikipedia/commons/8/8e/Escudo_del_Club_Atl%C3%A9tico_Uni%C3%B3n.svg',
  'Rosario Central':         'https://upload.wikimedia.org/wikipedia/commons/8/84/Escudo_del_Club_Atl%C3%A9tico_Rosario_Central.svg',
}

function Fallback({ teamName, size, className }: ClubFlagProps) {
  const colors = TEAM_COLORS[teamName]
  const initials = colors?.initials ?? teamName.slice(0, 2).toUpperCase()
  return (
    <div
      className={`rounded-full flex items-center justify-center font-extrabold shrink-0 ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(8, (size ?? 32) * 0.28),
        background: colors?.bg ?? '#334155',
        color: colors?.text ?? '#fff',
      }}
    >
      {initials}
    </div>
  )
}

export function ClubFlag({ teamName, size = 32, className = '' }: ClubFlagProps) {
  const url = CREST_URLS[teamName]
  const [errored, setErrored] = useState(false)

  if (!url || errored) {
    return <Fallback teamName={teamName} size={size} className={className} />
  }

  return (
    <img
      src={url}
      alt={teamName}
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className={`object-contain shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
