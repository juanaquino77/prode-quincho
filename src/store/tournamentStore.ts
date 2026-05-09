import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TournamentStore {
  selectedTournamentId: string | null
  setSelectedTournamentId: (id: string) => void
}

export const useTournamentStore = create<TournamentStore>()(
  persist(
    (set) => ({
      selectedTournamentId: null,
      setSelectedTournamentId: (id) => set({ selectedTournamentId: id }),
    }),
    { name: 'selected-tournament' }
  )
)
