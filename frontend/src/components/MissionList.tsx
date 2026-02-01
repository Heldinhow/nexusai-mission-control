import { useState } from 'react'
import { Target, Plus, X } from 'lucide-react'
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
  
  const getFilterLabel = (status: string) => {
    switch (status) {
      case 'all': return 'Todas'
      case 'pending': return 'Pendentes'
      case 'in_progress': return 'Em Progresso'
      case 'completed': return 'Concluídas'
      case 'failed': return 'Falhas'
      default: return status
    }
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-nexus-text-primary">
            <Target className="w-5 h-5 text-nexus-primary-500" />
            Missões
          </h2>
          <LiveIndicator connected={wsConnected} />
        </div>
        
        <button
          onClick={() => setShowNewMission(true)}
          className="px-4 py-2 rounded-lg bg-nexus-primary-500/20 text-nexus-primary-400 border border-nexus-primary-500/30 hover:bg-nexus-primary-500/30 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
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
                ? 'bg-nexus-primary-500/20 text-nexus-primary-400 border border-nexus-primary-500/30' 
                : 'bg-nexus-bg-secondary text-nexus-text-muted hover:bg-nexus-bg-tertiary'
            }`}
          >
            {getFilterLabel(status)}
            <span className="ml-2 text-xs opacity-50">({getStatusCount(status)})</span>
          </button>
        ))}
      </div>
      
      {/* New Mission Modal */}
      {showNewMission && (
        <div className="bg-nexus-bg-secondary rounded-xl p-4 border border-nexus-primary-500/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-nexus-text-primary">Nova Missão</h3>
            <button
              onClick={() => setShowNewMission(false)}
              className="p-1 rounded hover:bg-nexus-bg-tertiary transition-colors"
            >
              <X className="w-4 h-4 text-nexus-text-muted" />
            </button>
          </div>
          <textarea
            value={newMissionText}
            onChange={(e) => setNewMissionText(e.target.value)}
            placeholder="Descreva o que você quer que os agentes façam..."
            className="w-full h-24 bg-nexus-bg-primary border border-nexus-border rounded-lg p-3 text-sm text-nexus-text-primary placeholder:text-nexus-text-muted focus:outline-none focus:border-nexus-primary-500/50 resize-none"
          />
          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              onClick={() => setShowNewMission(false)}
              className="px-4 py-2 rounded-lg text-sm text-nexus-text-muted hover:text-nexus-text-primary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateMission}
              disabled={!newMissionText.trim()}
              className="px-4 py-2 rounded-lg bg-nexus-primary-500/20 text-nexus-primary-400 border border-nexus-primary-500/30 hover:bg-nexus-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
            >
              Criar Missão
            </button>
          </div>
        </div>
      )}
      
      {/* Mission List */}
      <div className="space-y-3">
        {filteredMissions.length === 0 ? (
          <div className="text-center py-12 text-nexus-text-muted">
            <div className="flex justify-center mb-3">
              <Target className="w-12 h-12 text-nexus-text-muted opacity-50" />
            </div>
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
