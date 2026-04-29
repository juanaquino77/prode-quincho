import { useState } from 'react'
import { Trophy, Users, Plus, LogIn, Lock, Unlock, Star } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { CreateTournamentModal } from '../components/tournaments/CreateTournamentModal'
import { JoinTournamentModal } from '../components/tournaments/JoinTournamentModal'
import { useUserTournaments, useGlobalTournament } from '../hooks/useTournaments'
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
            <LogIn size={15} className="mr-1" /> Unirse
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={15} className="mr-1" /> Crear
          </Button>
        </div>
      </div>

      {/* Global tournament */}
      {globalTournament && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">Torneo Global</h2>
          <TournamentCard tournament={globalTournament} isGlobal />
        </div>
      )}

      {/* My tournaments */}
      <div>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-2">Mis Torneos de Amigos</h2>
        {isLoading ? (
          <p className="text-white/40 text-sm">Cargando...</p>
        ) : myTournaments && myTournaments.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {myTournaments
              .filter((t) => t.type === 'friends')
              .map((t) => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        ) : (
          <Card className="text-center py-10">
            <Trophy size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-sm">Aún no estás en ningún torneo de amigos</p>
            <div className="flex gap-2 justify-center mt-4">
              <Button size="sm" onClick={() => setCreateOpen(true)}><Plus size={14} className="mr-1" />Crear torneo</Button>
              <Button size="sm" variant="secondary" onClick={() => setJoinOpen(true)}><LogIn size={14} className="mr-1" />Unirse</Button>
            </div>
          </Card>
        )}
      </div>

      <CreateTournamentModal open={createOpen} onClose={() => setCreateOpen(false)} userId={user!.id} />
      <JoinTournamentModal open={joinOpen} onClose={() => setJoinOpen(false)} userId={user!.id} />
    </Layout>
  )
}

function TournamentCard({ tournament, isGlobal }: { tournament: Tournament; isGlobal?: boolean }) {
  return (
    <Card glow={isGlobal} className="hover:border-union-blue/40 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-union-blue/20 rounded-xl flex items-center justify-center">
          {isGlobal ? <Star size={18} className="text-union-blue" /> : <Trophy size={18} className="text-union-blue" />}
        </div>
        <div className="flex gap-1">
          {tournament.entry_fee > 0 ? (
            <Badge variant="yellow"><Lock size={10} className="mr-1" />Pago</Badge>
          ) : (
            <Badge variant="green"><Unlock size={10} className="mr-1" />Gratis</Badge>
          )}
          {isGlobal && <Badge variant="blue">Global</Badge>}
        </div>
      </div>
      <h3 className="font-semibold text-white mb-1">{tournament.name}</h3>
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
  )
}
