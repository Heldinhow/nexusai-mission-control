import { useState } from 'react'
import { useMissionStore } from '../stores/missionStore'
import { useMissions } from '../hooks/useMissions'
import { MissionCard } from './MissionCard'
import { MissionDetail } from './MissionDetail'
import { LiveIndicator } from './LiveIndicator'
import type { Mission } from '../types/mission'

export function MissionList() {
  const { missions, wsConnected } = useMissionStore()
  const { createMission } = useMissions()
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'failed'>('all')
  const [showNewMission, setShowNewMission] = useState(false)
  const [newMissionText, setNewMissionText] = useState('')
  
  const filteredMissions = missions.filter(mission => {
    if (filter === 'all') return true
    return mission.status === filter
  })
  
  const handleCreateMission = async () => {
    if (!newMissionText.trim()) return
    
    const mission = await createMission(newMissionText, 'dashboard')
    if (mission) {
      setNewMissionText('')
      setShowNewMission(false)
      setSelectedMission(mission)
    }
  }
  
  const getStatusCount = (status: string) => {
    if (status === 'all') return missions.length
    return missions.filter(m => m.status === status).length
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="text-neon-cyan">🎯</span>
            Missões
          </h2>
          <LiveIndicator connected={wsConnected} />
        </div>
        
        <button
          onClick={() => setShowNewMission(true)}
          className="px-4 py-2 rounded-lg bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Missão
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'pending', 'in_progress', 'completed', 'failed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === status 
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {status === 'all' && 'Todas'}
            {status === 'pending' && 'Pendentes'}
            {status === 'in_progress' && 'Em Progresso'}
            {status === 'completed' && 'Completas'}
            {status === 'failed' && 'Falhas'}
            <span className="ml-2 text-xs opacity-50">({getStatusCount(status)})</span>
          </button>
        ))}
      </div>
      
      {/* New Mission Modal */}
      {showNewMission && (
        <div className="glass rounded-xl p-4 border border-neon-cyan/30">
          <h3 className="text-sm font-medium text-white mb-3">Nova Missão</h3>
          <textarea
            value={newMissionText}
            onChange={(e) => setNewMissionText(e.target.value)}
            placeholder="Descreva o que você quer que os agentes façam..."
            className="w-full h-24 bg-slate-900/50 border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-neon-cyan/50"
          />
          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              onClick={() => setShowNewMission(false)}
              className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateMission}
              disabled={!newMissionText.trim()}
              className="px-4 py-2 rounded-lg bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
            >
              Criar Missão
            </button>
          </div>
        </div>
      )}
      
      {/* Mission List */}
      <div className="space-y-3">
        {filteredMissions.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <div className="text-4xl mb-3">🎯</div>
            <p>Nenhuma missão encontrada</p>
            <p className="text-sm opacity-50">Crie uma nova missão para começar</p>
          </div>
        ) : (
          filteredMissions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onClick={() => setSelectedMission(mission)}
              isSelected={selectedMission?.id === mission.id}
            />
          ))
        )}
      </div>
      
      {/* Detail Modal */}
      {selectedMission && (
        <MissionDetail 
          mission={selectedMission}
          onClose={() => setSelectedMission(null)}
        />
      )}
    </div>
  )
}
