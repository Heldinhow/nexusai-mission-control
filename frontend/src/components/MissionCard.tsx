import { useState } from 'react'
import type { Mission } from '../types/mission'
import { AgentTimeline } from './AgentTimeline'
import { ArtifactGallery } from './ArtifactGallery'

interface MissionCardProps {
  mission: Mission
  onClick?: () => void
  isSelected?: boolean
}

export function MissionCard({ mission, onClick, isSelected }: MissionCardProps) {
  const [expanded, setExpanded] = useState(false)
  
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
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'agora'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m atrás`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`
    return date.toLocaleDateString()
  }
  
  return (
    <div 
      className={`glass-card rounded-xl overflow-hidden transition-all duration-300 ${
        isSelected ? 'ring-2 ring-neon-cyan' : ''
      }`}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => {
          setExpanded(!expanded)
          onClick?.()
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getSourceIcon(mission.source)}</span>
              <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(mission.status)}`}>
                {getStatusIcon(mission.status)} {mission.status.toUpperCase()}
              </span>
              <span className="text-xs text-slate-500">{formatTime(mission.timestamp)}</span>
            </div>
            <p className="text-sm text-slate-200 line-clamp-2">
              {mission.userMessage}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Progress bar */}
            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  mission.progress === 100 ? 'bg-neon-green' : 'bg-neon-cyan'
                }`}
                style={{ width: `${mission.progress}%` }}
              />
            </div>
            <span className="text-xs font-mono text-slate-400 w-8">{mission.progress}%</span>
            
            {/* Expand icon */}
            <svg 
              className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            👤 {(mission.agentsInvolved || []).length} agentes
          </span>
          <span className="flex items-center gap-1">
            📄 {(mission.artifacts || []).length} artefatos
          </span>
          <span className="flex items-center gap-1">
            📊 {(mission.timeline || []).length} eventos
          </span>
        </div>
      </div>
      
      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Timeline</h4>
              <AgentTimeline timeline={mission.timeline} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-3">Artefatos</h4>
              <ArtifactGallery artifacts={mission.artifacts} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
