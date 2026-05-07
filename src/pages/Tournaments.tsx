import { useState } from 'react'
import { Trophy, Users, Plus, LogIn, Lock, Unlock, Star, Trash2 } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { CreateTournamentModal } from '../components/tournaments/CreateTournamentModal'
import { JoinTournamentModal } from '../components/tournaments/JoinTournamentModal'
import { useUserTournaments, useGlobalTournament, useDeleteTournament } from '../hooks/useTournaments'
import { useAuthStore } from '../store/authStore'
import type { Tournament } from '../types'

export default function Tournaments() {
  const { user } = useAuthStore()
  const { data: myTournaments, isLoading } = useUserTournaments(user?.id)
  const { data: globalTournament } = useGlobalTournament()
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Torneos</h1>
          <p className="text-white/50 text-sm mt-0.5">Jugá con tus amigos o en el torneo global</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setJoinOpen(true)}>
            <LogIn size={15} className="mr-1" /> Unirse con código
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={15} className="mr-1" /> Crear torneo
          </Button>
        </div>
      </div>

      {/* Global tournament */}
      {globalTournament && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">Torneo Global</h2>
          <TournamentCard tournament={globalTournament} isGlobal currentUserId={user?.id} />
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
              .map((t) => <TournamentCard key={t.id} tournament={t} currentUserId={user?.id} />)}
          </div>
        ) : (
          <Card className="text-center py-10">
            <Trophy size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-sm">Aún no estás en ningún torneo de amigos</p>
            <div className="flex gap-2 justify-center mt-4">
              <Button size="sm" onClick={() => setCreateOpen(true)}><Plus size={14} className="mr-1" />Crear torneo</Button>
              <Button size="sm" variant="secondary" onClick={() => setJoinOpen(true)}><LogIn size={14} className="mr-1" />Unirse con código</Button>
            </div>
          </Card>
        )}
      </div>

      <CreateTournamentModal open={createOpen} onClose={() => setCreateOpen(false)} userId={user!.id} />
      <JoinTournamentModal open={joinOpen} onClose={() => setJoinOpen(false)} userId={user!.id} />
    </Layout>
  )
}

function TournamentCard({ tournament, isGlobal, currentUserId }: {
  tournament: Tournament
  isGlobal?: boolean
  currentUserId?: string
}) {
  const deleteTournament = useDeleteTournament()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isCreator = !isGlobal && tournament.created_by === currentUserId

  const competitionLabel = tournament.competition === 'apertura_2026'
    ? '🇦🇷 Apertura 2026'
    : tournament.competition === 'mundial_2026'
    ? '🌎 Mundial 2026'
    : null

  async function handleDelete() {
    await deleteTournament.mutateAsync(tournament.id)
    setConfirmDelete(false)
  }

  return (
    <>
      <Card glow={isGlobal} className="hover:border-union-blue/40 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 bg-union-blue/20 rounded-xl flex items-center justify-center">
            {isGlobal ? <Star size={18} className="text-union-blue" /> : <Trophy size={18} className="text-union-blue" />}
          </div>
          <div className="flex gap-1 items-center">
            {tournament.entry_fee > 0 ? (
              <Badge variant="yellow"><Lock size={10} className="mr-1" />Pago</Badge>
            ) : (
              <Badge variant="green"><Unlock size={10} className="mr-1" />Gratis</Badge>
            )}
            {isGlobal && <Badge variant="blue">Global</Badge>}
            {isCreator && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1 text-white/30 hover:text-red-400 transition-colors ml-1"
                title="Eliminar torneo"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
        <h3 className="font-semibold text-white mb-1">{tournament.name}</h3>
        {competitionLabel && (
          <p className="text-xs text-white/40 mb-1">{competitionLabel}</p>
        )}
        <div className="flex items-center gap-1 text-xs text-white/40 mb-3">
          <Users size={12} />
          {tournament.member_count ?? 0} participante{tournament.member_count !== 1 ? 's' : ''}
        </div>
        {tournament.entry_fee > 0 && (
          <p className="text-sm text-yellow-400 font-medium">${tournament.entry_fee} ARS</p>
        )}
        {tournament.invite_code && (
          <div className="mt-2 bg-union-navy rounded-lg px-3 py-1.5 text-center">
            <p className="text-xs text-white/30">Código</p>
            <p className="text-sm font-bold tracking-wider text-union-blue">{tournament.invite_code}</p>
          </div>
        )}
      </Card>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Eliminar torneo">
        <p className="text-white/70 mb-4">
          ¿Seguro que querés eliminar <span className="text-white font-semibold">"{tournament.name}"</span>? Se borrarán todos los pronósticos asociados.
        </p>
        <div className="flex gap-2">
          <Button variant="danger" onClick={handleDelete} loading={deleteTournament.isPending} className="flex-1">Eliminar</Button>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)} className="flex-1">Cancelar</Button>
        </div>
      </Modal>
    </>
  )
}
