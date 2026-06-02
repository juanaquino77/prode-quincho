import { create } from 'zustand'

const TOUR_SEEN_KEY = 'prode_tour_v1_seen'

interface HelpState {
  tourOpen: boolean
  howToPlayOpen: boolean
  openTour: () => void
  closeTour: () => void
  openHowToPlay: () => void
  closeHowToPlay: () => void
}

export const useHelpStore = create<HelpState>((set) => ({
  tourOpen: false,
  howToPlayOpen: false,
  openTour: () => set({ tourOpen: true }),
  closeTour: () => set({ tourOpen: false }),
  openHowToPlay: () => set({ howToPlayOpen: true }),
  closeHowToPlay: () => set({ howToPlayOpen: false }),
}))

export const hasTourBeenSeen = () => localStorage.getItem(TOUR_SEEN_KEY) === 'true'
export const markTourAsSeen = () => localStorage.setItem(TOUR_SEEN_KEY, 'true')
