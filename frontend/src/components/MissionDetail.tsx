import { AgentTimeline } from './AgentTimeline'
import { ArtifactGallery } from './ArtifactGallery'
import type { Mission } from '../types/mission'

interface MissionDetailProps {
  mission: Mission
  onClose?: () => void
}

export function MissionDetail({ mission, onClose }: MissionDetailProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'in_progress': return 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20'
      case 'completed': return 'bg-neon-green/10 text-neon-green border-neon-green/20'
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20'
      case 'cancelled': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'in_progress': return '🔄'
      case 'completed': return '✅'
      case 'failed': return '❌'
      case 'cancelled': return '🚫'
      default: return '❓'
    }
  }
  
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'whatsapp': return '💬'
      case 'api': return '🔌'
      case 'dashboard': return '🖥️'
      case 'system': return '⚙️'
      default: return '📌'
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto glass-strong rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{getSourceIcon(mission.source)}</span>
                <span className={`text-sm px-3 py-1 rounded-full border ${getStatusColor(mission.status)}`}>
                  {getStatusIcon(mission.status)} {mission.status.toUpperCase()}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(mission.timestamp).toLocaleString()}
                </span>
              </div>
              <h2 className="text-xl font-medium text-white">
                {mission.userMessage}
              </h2>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  mission.progress === 100 ? 'bg-neon-green' : 'bg-neon-cyan'
                }`}
                style={{ width: `${mission.progress}%` }}
              />
            </div>
            <span className="text-lg font-mono font-bold text-slate-300">
              {mission.progress}%
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-3xl font-bold font-mono text-neon-cyan">
                {(mission.agentsInvolved || []).length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Agentes</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-3xl font-bold font-mono text-neon-purple">
                {(mission.artifacts || []).length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Artefatos</div>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-3xl font-bold font-mono text-neon-green">
                {(mission.timeline || []).length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Eventos</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Timeline */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <span>📊</span> Timeline de Eventos
              </h3>
              <div className="glass rounded-xl p-4 max-h-[400px] overflow-auto">
                <AgentTimeline timeline={mission.timeline || []} />
              </div>
            </div>
            
            {/* Artifacts */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <span>📦</span> Artefatos Gerados
              </h3>
              <div className="glass rounded-xl p-4 max-h-[400px] overflow-auto">
                <ArtifactGallery artifacts={mission.artifacts || []} />
              </div>
            </div>
          </div>
          
          {/* Metadata */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <span>ℹ️</span> Detalhes Técnicos
            </h3>
            <div className="glass rounded-xl p-4 font-mono text-xs text-slate-400 overflow-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500">ID:</span> {mission.id}
                </div>
                <div>
                  <span className="text-slate-500">Source:</span> {mission.source}
                </div>
                {mission.whatsappMessageId && (
                  <div>
                    <span className="text-slate-500">WhatsApp ID:</span> {mission.whatsappMessageId}
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Timestamp:</span> {mission.timestamp}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
