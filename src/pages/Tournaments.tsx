import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Trophy, Users, Plus, LogIn, Lock, Unlock, Star, Trash2, Pencil,
  ChevronRight, Copy, Check, ClipboardList, LayoutList, ScrollText, QrCode,
} from 'lucide-react'
import { QRCode } from 'react-qr-code'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { CreateTournamentModal } from '../components/tournaments/CreateTournamentModal'
import { JoinTournamentModal } from '../components/tournaments/JoinTournamentModal'
import { TournamentRulesModal } from '../components/tournaments/TournamentRulesModal'
import { useUserTournaments, useGlobalTournament, useDeleteTournament, useRenameTournament } from '../hooks/useTournaments'
import { useMatches } from '../hooks/useMatches'
import { usePredictions } from '../hooks/usePredictions'
import { useAuthStore } from '../store/authStore'
import { useIsAdmin } from '../hooks/useAuth'
import { cn } from '../lib/utils'
import type { Tournament, MatchStage } from '../types'

// ─── Completion hook ──────────────────────────────────────────
const STAGE_ORDER: MatchStage[] = [
  'group', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final',
]

function usePredictionCompletion(
  userId: string | undefined,
  tournamentId: string,
  competition: string | null,
) {
  const { data: matches } = useMatches(competition ?? undefined)
  const { data: predictions } = usePredictions(userId, tournamentId)

  return useMemo(() => {
    const allMatches = matches ?? []

    // For apertura_2026, only count matches in stages that are currently open for prediction
    let countableMatches = allMatches
    if (competition === 'apertura_2026') {
      const stageSet = new Set(allMatches.map((m) => m.stage))
      const orderedStages = STAGE_ORDER.filter((s) => stageSet.has(s))

      // Find the first stage that still has unfinished matches — that's the last open stage
      const firstLockedIdx = orderedStages.findIndex((_stage, i) => {
        if (i === 0) return false
        const prevStage = orderedStages[i - 1]
        return allMatches.some((m) => m.stage === prevStage && m.status !== 'finished')
      })

      const openStages = new Set(
        firstLockedIdx === -1 ? orderedStages : orderedStages.slice(0, firstLockedIdx)
      )
      countableMatches = allMatches.filter((m) => openStages.has(m.stage))
    }

    const matchIds = new Set(countableMatches.map((m) => m.id))
    const total = countableMatches.length
    const filled = (predictions ?? []).filter((p) => matchIds.has(p.match_id)).length
    const isComplete = total > 0 && filled >= total
    const pct = total > 0 ? Math.round((filled / total) * 100) : 0
    return { total, filled, isComplete, pct }
  }, [matches, predictions, competition])
}

// ─── Page ─────────────────────────────────────────────────────
export default function Tournaments() {
  const { user, profile } = useAuthStore()
  const isAdmin = useIsAdmin()
  const navigate = useNavigate()
  const { data: myTournaments, isLoading } = useUserTournaments(user?.id)
  const { data: globalTournament } = useGlobalTournament()
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)

  // Preferir versión de myTournaments (tiene user_paid); fallback a globalTournament
  const globalWithMembership = myTournaments?.find((t) => t.type === 'global')
  const globalForCard = globalWithMembership ?? globalTournament

  const globalPaid = globalWithMembership?.user_paid === true || profile?.free_pass === true
  const globalRequiresPayment = (globalTournament?.entry_fee ?? 0) > 0

  function handleCreate() {
    if (!isAdmin && globalRequiresPayment && !globalPaid) { setBlockOpen(true); return }
    setCreateOpen(true)
  }

  function handleJoin() {
    if (!isAdmin && globalRequiresPayment && !globalPaid) { setBlockOpen(true); return }
    setJoinOpen(true)
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Torneos</h1>
          <p className="text-white/50 text-sm mt-0.5">Jugá con tus amigos o en el torneo global</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleJoin}>
            <LogIn size={15} className="mr-1" /> Unirse con código
          </Button>
          <Button size="sm" onClick={handleCreate}>
            <Plus size={15} className="mr-1" /> Crear torneo
          </Button>
        </div>
      </div>

      {/* Global tournament */}
      {globalForCard && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">Torneo Global</h2>
          <TournamentCard tournament={globalForCard} isGlobal userId={user?.id} />
        </div>
      )}

      {/* My tournaments */}
      <div>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">Mis Torneos de Amigos</h2>
        {isLoading ? (
          <p className="text-white/40 text-sm">Cargando...</p>
        ) : myTournaments && myTournaments.filter((t) => t.type === 'friends').length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {myTournaments
              .filter((t) => t.type === 'friends')
              .map((t) => <TournamentCard key={t.id} tournament={t} userId={user?.id} />)}
          </div>
        ) : (
          <Card className="text-center py-10">
            <Trophy size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-sm">Aún no estás en ningún torneo de amigos</p>
            <div className="flex gap-2 justify-center mt-4">
              <Button size="sm" onClick={handleCreate}><Plus size={14} className="mr-1" />Crear torneo</Button>
              <Button size="sm" variant="secondary" onClick={handleJoin}><LogIn size={14} className="mr-1" />Unirse con código</Button>
            </div>
          </Card>
        )}
      </div>

      <CreateTournamentModal open={createOpen} onClose={() => setCreateOpen(false)} userId={user!.id} />
      <JoinTournamentModal open={joinOpen} onClose={() => setJoinOpen(false)} userId={user!.id} />

      {/* Modal: requiere presentar tarjeta global primero */}
      <Modal open={blockOpen} onClose={() => setBlockOpen(false)} title="Primero presentá tu tarjeta">
        <div className="text-center py-2 space-y-4">
          <p className="text-4xl">🎯</p>
          <p className="text-white/70 text-sm leading-relaxed">
            Para crear o unirte a un torneo de amigos primero tenés que presentar tu tarjeta en el <span className="text-white font-semibold">Torneo Global</span>.
          </p>
          <Button
            className="w-full"
            onClick={() => { setBlockOpen(false); navigate(`/predicciones?t=${globalForCard?.id}`) }}
          >
            Ir a presentar mi tarjeta →
          </Button>
          <button onClick={() => setBlockOpen(false)} className="text-xs text-white/30 hover:text-white/60 transition-colors">
            Cerrar
          </button>
        </div>
      </Modal>
    </Layout>
  )
}

// ─── Card ─────────────────────────────────────────────────────
function TournamentCard({ tournament, isGlobal, userId }: {
  tournament: Tournament
  isGlobal?: boolean
  userId?: string
}) {
  const navigate = useNavigate()
  const deleteTournament = useDeleteTournament()
  const renameTournament = useRenameTournament()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameValue, setRenameValue] = useState(tournament.name)
  const [copied, setCopied] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)
  const isCreator = !isGlobal

  const needsPayment = tournament.entry_fee > 0 && tournament.user_paid !== true

  const { total, filled, isComplete, pct } = usePredictionCompletion(
    userId,
    tournament.id,
    tournament.competition ?? null,
  )

  // Destination: knockout tournaments go to bracket ONLY when all predictions filled
  const isKnockoutOnly = tournament.competition === 'apertura_2026'
  const destination = isKnockoutOnly && isComplete
    ? `/bracket?t=${tournament.id}`
    : `/predicciones?t=${tournament.id}`

  // CTA label & icon
  const { ctaLabel, CtaIcon } = isComplete && isKnockoutOnly
    ? { ctaLabel: 'Ver llave', CtaIcon: LayoutList }
    : isComplete
    ? { ctaLabel: 'Ver predicciones', CtaIcon: LayoutList }
    : { ctaLabel: 'Completar pronósticos', CtaIcon: ClipboardList }

  const competitionLabel = tournament.competition === 'apertura_2026'
    ? '🇦🇷 Apertura 2026'
    : tournament.competition === 'mundial_2026'
    ? '🌎 Mundial 2026'
    : null

  // Progress bar color
  const progressColor = isComplete
    ? 'bg-green-500'
    : pct > 0
    ? 'bg-yellow-400'
    : 'bg-white/10'

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation()
    if (!tournament.invite_code) return
    navigator.clipboard.writeText(tournament.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleCopyLink(e: React.MouseEvent) {
    e.stopPropagation()
    if (!tournament.invite_code) return
    navigator.clipboard.writeText(`${window.location.origin}/unirse/${tournament.invite_code}`)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  async function handleDelete() {
    await deleteTournament.mutateAsync(tournament.id)
    setConfirmDelete(false)
  }

  function handleCardClick() {
    navigate(destination)
  }

  return (
    <>
      <div className="group cursor-pointer" onClick={handleCardClick}>
        <Card glow={isGlobal} className={cn(
          'transition-all',
          needsPayment
            ? 'border-yellow-500/30'
            : 'hover:border-union-blue/60 group-hover:bg-union-navy-light/60'
        )}>

          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-union-blue/20 rounded-xl flex items-center justify-center group-hover:bg-union-blue/30 transition-colors">
              {isGlobal ? <Star size={18} className="text-union-blue" /> : <Trophy size={18} className="text-union-blue" />}
            </div>
            <div className="flex gap-1 items-center">
              {tournament.entry_fee > 0
                ? <Badge variant="yellow"><Lock size={10} className="mr-1" />Pago</Badge>
                : <Badge variant="green"><Unlock size={10} className="mr-1" />Gratis</Badge>}
              {isGlobal && <Badge variant="blue">Global</Badge>}
              {isCreator && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setRenameValue(tournament.name); setRenameOpen(true) }}
                    className="p-1 text-white/30 hover:text-union-blue transition-colors"
                    title="Renombrar torneo"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
                    className="p-1 text-white/30 hover:text-red-400 transition-colors"
                    title="Eliminar torneo"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Name & meta */}
          <h3 className="font-semibold text-white mb-0.5">{tournament.name}</h3>
          {competitionLabel && <p className="text-xs text-white/40 mb-1">{competitionLabel}</p>}
          <div className="flex items-center gap-1 text-xs text-white/40 mb-3">
            <Users size={12} />
            {tournament.member_count ?? 0} participante{tournament.member_count !== 1 ? 's' : ''}
          </div>

          {/* Prediction progress */}
          {total > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-white/40">Mis pronósticos</span>
                <span className={cn(
                  'text-[11px] font-semibold',
                  isComplete ? 'text-green-400' : pct > 0 ? 'text-yellow-400' : 'text-white/30'
                )}>
                  {isComplete ? '✓ Completo' : `${filled}/${total}`}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', progressColor)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {/* Payment status */}
          {tournament.entry_fee > 0 && (
            needsPayment ? (
              <div className="mb-3 flex items-center justify-between rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-2">
                <span className="text-yellow-400 text-xs font-semibold">Entrada: ${tournament.entry_fee} ARS</span>
                <span className="text-white/30 text-xs">Pagar al presentar</span>
              </div>
            ) : (
              <p className="text-sm text-green-400 font-medium mb-2">✓ Entrada pagada</p>
            )
          )}

          {/* Invite code */}
          {tournament.invite_code && (
            <div className="mb-3 flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="group/code flex-1 bg-union-navy hover:bg-union-navy-light rounded-lg px-3 py-2 flex items-center justify-between gap-2 transition-colors border border-transparent hover:border-union-blue/20"
                title="Copiar código"
              >
                <div className="text-left">
                  <p className="text-[10px] text-white/30 leading-none mb-0.5">Código de invitación</p>
                  <p className="text-sm font-bold tracking-widest text-union-blue">{tournament.invite_code}</p>
                </div>
                <div className={cn(
                  'shrink-0 p-1.5 rounded-md transition-all',
                  copied
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-union-blue/10 text-union-blue/50 group-hover/code:bg-union-blue/20 group-hover/code:text-union-blue'
                )}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </div>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setQrOpen(true) }}
                className="shrink-0 p-2.5 bg-union-navy hover:bg-union-navy-light rounded-lg border border-transparent hover:border-union-blue/20 text-union-blue/50 hover:text-union-blue transition-colors"
                title="Compartir QR"
              >
                <QrCode size={18} />
              </button>
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-union-blue/10">
              <button
                onClick={(e) => { e.stopPropagation(); setRulesOpen(true) }}
                className="flex items-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                <ScrollText size={11} />
                Ver reglas
              </button>
              <div className={cn(
                'flex items-center gap-1 text-xs font-semibold transition-colors',
                isComplete
                  ? 'text-green-400 group-hover:text-green-300'
                  : pct > 0
                  ? 'text-yellow-400 group-hover:text-yellow-300'
                  : 'text-union-blue group-hover:text-union-blue-light'
              )}>
                <CtaIcon size={12} />
                {ctaLabel}
                <ChevronRight size={13} />
              </div>
            </div>
        </Card>
      </div>

      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="Compartir torneo">
        <div className="text-center">
          <p className="text-white/50 text-sm mb-4">
            Compartí este QR o link para que tus amigos se unan a{' '}
            <span className="text-white font-semibold">{tournament.name}</span>
          </p>
          <div className="flex justify-center bg-white p-4 rounded-xl mb-4 mx-auto w-fit">
            <QRCode value={`${window.location.origin}/unirse/${tournament.invite_code}`} size={200} />
          </div>
          <p className="text-xs text-white/30 break-all mb-4">
            {`${window.location.origin}/unirse/${tournament.invite_code}`}
          </p>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Te invito a mi grupo de prode del Mundial 2026 🏆\nSumate al torneo "${tournament.name}" acá 👉 www.prodequincho.com/unirse/${tournament.invite_code}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm py-2.5 rounded-xl transition-colors mb-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Compartir por WhatsApp
          </a>
          <Button onClick={handleCopyLink} className="w-full" variant="secondary">
            {copiedLink
              ? <><Check size={14} className="mr-1.5" />Link copiado!</>
              : <><Copy size={14} className="mr-1.5" />Copiar link</>
            }
          </Button>
        </div>
      </Modal>

      <Modal open={renameOpen} onClose={() => setRenameOpen(false)} title="Renombrar torneo">
        <input
          className="w-full bg-union-navy border border-union-blue/20 rounded-lg text-white px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-union-blue"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          maxLength={50}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter' && renameValue.trim().length >= 3) {
              renameTournament.mutate({ id: tournament.id, name: renameValue.trim() }, { onSuccess: () => setRenameOpen(false) })
            }
          }}
        />
        <div className="flex gap-2">
          <Button
            onClick={() => renameTournament.mutate({ id: tournament.id, name: renameValue.trim() }, { onSuccess: () => setRenameOpen(false) })}
            loading={renameTournament.isPending}
            disabled={renameValue.trim().length < 3}
            className="flex-1"
          >
            Guardar
          </Button>
          <Button variant="secondary" onClick={() => setRenameOpen(false)} className="flex-1">Cancelar</Button>
        </div>
      </Modal>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Eliminar torneo">
        <p className="text-white/70 mb-4">
          ¿Seguro que querés eliminar <span className="text-white font-semibold">"{tournament.name}"</span>? Se borrarán todos los pronósticos asociados.
        </p>
        <div className="flex gap-2">
          <Button variant="danger" onClick={handleDelete} loading={deleteTournament.isPending} className="flex-1">Eliminar</Button>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)} className="flex-1">Cancelar</Button>
        </div>
      </Modal>

      <TournamentRulesModal
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        tournament={tournament}
      />
    </>
  )
}
