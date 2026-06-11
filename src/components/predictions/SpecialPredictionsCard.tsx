import { useState, useRef, useEffect } from 'react'
import { Star, Trophy, Zap, Lock, CheckCircle2, ChevronDown } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { WC2026_PLAYERS, WC2026_TEAMS } from '../../data/wc2026players'
import type { SpecialPrediction } from '../../types'

const LOCK_DATE = new Date('2026-06-11T19:00:00Z') // México vs Sudáfrica — 16:00 AR

interface Props {
  tournamentId: string
  userId: string
  existing: SpecialPrediction | null | undefined
  onSave: (data: { champion_team: string | null; top_scorer: string | null; best_player: string | null }) => Promise<void>
  isSaving: boolean
}

export function SpecialPredictionsCard({ existing, onSave, isSaving }: Props) {
  const isLocked = new Date() >= LOCK_DATE
  const isFilled = !!(existing?.champion_team && existing?.top_scorer && existing?.best_player)

  // Empieza colapsado; se abre automáticamente si no está completo y no está cerrado
  const [open, setOpen] = useState(false)

  const [champion, setChampion] = useState(existing?.champion_team ?? '')
  const [topScorer, setTopScorer] = useState(existing?.top_scorer ?? '')
  const [bestPlayer, setBestPlayer] = useState(existing?.best_player ?? '')
  const [saved, setSaved] = useState(false)

  // Sync when existing data loads
  useEffect(() => {
    if (existing) {
      setChampion(existing.champion_team ?? '')
      setTopScorer(existing.top_scorer ?? '')
      setBestPlayer(existing.best_player ?? '')
    }
  }, [existing])

  async function handleSave() {
    await onSave({
      champion_team: champion || null,
      top_scorer: topScorer || null,
      best_player: bestPlayer || null,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const lockLabel = LOCK_DATE.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    timeZone: 'America/Argentina/Buenos_Aires',
  }) + ' · 20:00 AR'

  return (
    <Card className="mb-5 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
      {/* Header — botón acordeón */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
            <Star size={16} className="text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Predicciones Especiales</p>
            <p className="text-[11px] text-white/40">2 pts por acierto · Campeón · Goleador · MVP</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isLocked ? (
            <span className="flex items-center gap-1 text-xs text-red-400"><Lock size={11} /> Cerradas</span>
          ) : isFilled ? (
            <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle2 size={12} /> Guardadas</span>
          ) : (
            <span className="text-[11px] text-amber-400/80">Cierra {lockLabel}</span>
          )}
          <ChevronDown size={15} className={`text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Contenido expandible */}
      {open && <div className="space-y-4 mt-4">
        {/* Campeón */}
        <div>
          <label className="flex items-center justify-between text-xs font-medium text-white/60 mb-1.5">
            <span className="flex items-center gap-1.5"><Trophy size={12} className="text-amber-400" />Campeón del Mundial</span>
            <span className="text-amber-400/60 font-bold">+2 pts</span>
          </label>
          <TeamSelect
            value={champion}
            onChange={setChampion}
            disabled={isLocked}
          />
        </div>

        {/* Goleador */}
        <div>
          <label className="flex items-center justify-between text-xs font-medium text-white/60 mb-1.5">
            <span className="flex items-center gap-1.5"><Zap size={12} className="text-amber-400" />Goleador del torneo</span>
            <span className="text-amber-400/60 font-bold">+2 pts</span>
          </label>
          <PlayerCombobox
            value={topScorer}
            onChange={setTopScorer}
            placeholder="Buscá o escribí un jugador..."
            disabled={isLocked}
          />
        </div>

        {/* Mejor jugador */}
        <div>
          <label className="flex items-center justify-between text-xs font-medium text-white/60 mb-1.5">
            <span className="flex items-center gap-1.5"><Star size={12} className="text-amber-400" />Mejor jugador del torneo</span>
            <span className="text-amber-400/60 font-bold">+2 pts</span>
          </label>
          <PlayerCombobox
            value={bestPlayer}
            onChange={setBestPlayer}
            placeholder="Buscá o escribí un jugador..."
            disabled={isLocked}
          />
        </div>

        {!isLocked && (
          <Button
            onClick={handleSave}
            loading={isSaving}
            disabled={!champion && !topScorer && !bestPlayer}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold"
          >
            {saved ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} /> ¡Guardadas!
              </span>
            ) : 'Guardar predicciones especiales'}
          </Button>
        )}
      </div>}
    </Card>
  )
}

// ── Team combobox (searchable, igual que PlayerCombobox) ────────────────────

function TeamSelect({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  disabled: boolean
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = WC2026_TEAMS.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10)

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setOpen(true)
  }

  function handleSelect(name: string) {
    onChange(name)
    setQuery('')
    setOpen(false)
  }

  function handleFocus() {
    setQuery('')
    setOpen(true)
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const displayValue = open ? query : value
  const selectedTeam = WC2026_TEAMS.find((t) => t.name === value)

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={value || 'Buscá o escribí un país...'}
        disabled={disabled}
        className="w-full bg-union-navy-light border border-union-blue/20 rounded-lg text-white px-3 py-2.5 text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {value && !open && selectedTeam && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base">
          {selectedTeam.flag}
        </span>
      )}

      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#0d1b2e] border border-union-blue/20 rounded-xl shadow-xl overflow-hidden">
          {filtered.length === 0 ? (
            <p className="px-3 py-2.5 text-xs text-white/40">
              {query ? `"${query}" — no encontrado` : 'Escribí para buscar'}
            </p>
          ) : (
            filtered.map((t) => (
              <button
                key={t.name}
                type="button"
                onMouseDown={() => handleSelect(t.name)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-base leading-none">{t.flag}</span>
                <span className="text-white font-medium">{t.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── Player combobox (searchable + free text) ────────────────────────────────

function PlayerCombobox({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  disabled: boolean
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = WC2026_PLAYERS.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.team.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8)

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    onChange(v)
    setOpen(true)
  }

  function handleSelect(name: string) {
    onChange(name)
    setQuery('')
    setOpen(false)
  }

  function handleFocus() {
    setQuery('')
    setOpen(true)
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const displayValue = open ? query : value

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={value || placeholder}
        disabled={disabled}
        className="w-full bg-union-navy-light border border-union-blue/20 rounded-lg text-white px-3 py-2.5 text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {value && !open && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
          {WC2026_PLAYERS.find((p) => p.name === value)?.flag ?? ''}
        </span>
      )}

      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#0d1b2e] border border-union-blue/20 rounded-xl shadow-xl overflow-hidden">
          {filtered.length === 0 ? (
            <p className="px-3 py-2.5 text-xs text-white/40">
              {query ? `"${query}" — se guardará como escribiste` : 'Escribí para buscar'}
            </p>
          ) : (
            filtered.map((p) => (
              <button
                key={p.name}
                type="button"
                onMouseDown={() => handleSelect(p.name)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-base leading-none">{p.flag}</span>
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{p.name}</p>
                  <p className="text-white/40 text-[11px]">{p.team}</p>
                </div>
              </button>
            ))
          )}
          {query && !WC2026_PLAYERS.some((p) => p.name.toLowerCase() === query.toLowerCase()) && (
            <button
              type="button"
              onMouseDown={() => handleSelect(query)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left border-t border-white/5 hover:bg-white/5 transition-colors"
            >
              <span className="text-white/40 text-xs">✎</span>
              <span className="text-white/70 truncate">Guardar "<span className="text-white">{query}</span>"</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
