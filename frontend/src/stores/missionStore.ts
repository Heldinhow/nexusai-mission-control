import { create } from 'zustand'
import type { Mission } from '../types/mission'

interface MissionState {
  missions: Mission[]
  selectedMission: Mission | null
  isLoading: boolean
  error: string | null
  wsConnected: boolean
  
  // Actions
  setMissions: (missions: Mission[]) => void
  addMission: (mission: Mission) => void
  updateMission: (mission: Mission) => void
  selectMission: (mission: Mission | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setWsConnected: (connected: boolean) => void
}

export const useMissionStore = create<MissionState>((set) => ({
  missions: [],
  selectedMission: null,
  isLoading: false,
  error: null,
  wsConnected: false,
  
  setMissions: (missions) => set({ missions }),
  addMission: (mission) => set((state) => ({ 
    missions: [mission, ...state.missions] 
  })),
  updateMission: (mission) => set((state) => ({
    missions: state.missions.map(m => m.id === mission.id ? mission : m)
  })),
  selectMission: (mission) => set({ selectedMission: mission }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setWsConnected: (wsConnected) => set({ wsConnected }),
}))
