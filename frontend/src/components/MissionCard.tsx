import { useState } from 'react'
import { Clock, Loader2, CheckCircle, XCircle, Ban, HelpCircle, MessageCircle, Plug, LayoutDashboard, Cog, Users, FileText, BarChart3, ChevronDown } from 'lucide-react'
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
      case 'pending': return 'bg-nexus-warning/10 text-nexus-warning border-nexus-warning/20'
      case 'in_progress': return 'bg-nexus-primary-500/10 text-nexus-primary-400 border-nexus-primary-500/20'
      case 'completed': return 'bg-nexus-success/10 text-nexus-success border-nexus-success/20'
      case 'failed': return 'bg-nexus-danger/10 text-nexus-danger border-nexus-danger/20'
      case 'cancelled': return 'bg-nexus-text-muted/10 text-nexus-text-muted border-nexus-text-muted/20'
      default: return 'bg-nexus-text-muted/10 text-nexus-text-muted border-nexus-text-muted/20'
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />
      case 'in_progress': return <Loader2 className="w-3 h-3 animate-spin" />
      case 'completed': return <CheckCircle className="w-3 h-3" />
      case 'failed': return <XCircle className="w-3 h-3" />
      case 'cancelled': return <Ban className="w-3 h-3" />
      default: return <HelpCircle className="w-3 h-3" />
    }
  }
  
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'whatsapp': return <MessageCircle className="w-5 h-5" />
      case 'api': return <Plug className="w-5 h-5" />
      case 'dashboard': return <LayoutDashboard className="w-5 h-5" />
      case 'system': return <Cog className="w-5 h-5" />
      default: return <HelpCircle className="w-5 h-5" />
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
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'PENDENTE'
      case 'in_progress': return 'EM PROGRESSO'
      case 'completed': return 'CONCLUÍDA'
      case 'failed': return 'FALHA'
      case 'cancelled': return 'CANCELADA'
      default: return status.toUpperCase()
    }
  }
  
  return (
    <div 
      className={`bg-nexus-bg-secondary rounded-xl overflow-hidden transition-all duration-300 border border-nexus-border ${
        isSelected ? 'ring-2 ring-nexus-primary-500' : ''
      }`}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-nexus-bg-tertiary transition-colors"
        onClick={() => {
          setExpanded(!expanded)
          onClick?.()
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-nexus-text-secondary">{getSourceIcon(mission.source)}</span>
              <span className={`text-xs px-2 py-0.5 rounded border flex items-center gap-1 ${getStatusColor(mission.status)}`}>
                {getStatusIcon(mission.status)} {getStatusLabel(mission.status)}
              </span>
              <span className="text-xs text-nexus-text-muted">{formatTime(mission.timestamp)}</span>
            </div>
            <p className="text-sm text-nexus-text-primary line-clamp-2">
              {mission.userMessage}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Progress bar */}
            <div className="w-16 h-2 bg-nexus-bg-tertiary rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  mission.progress === 100 ? 'bg-nexus-success' : 'bg-nexus-primary-500'
                }`}
                style={{ width: `${mission.progress}%` }}
              />
            </div>
            <span className="text-xs font-mono text-nexus-text-secondary w-8">{mission.progress}%</span>
            
            {/* Expand icon */}
            <ChevronDown className={`w-5 h-5 text-nexus-text-secondary transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="flex items-center gap-4 mt-3 text-xs text-nexus-text-muted">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {(mission.agentsInvolved || []).length} agentes
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3 h-3" /> {(mission.artifacts || []).length} artefatos
          </span>
          <span className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> {(mission.timeline || []).length} eventos
          </span>
        </div>
      </div>
      
      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-nexus-border pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-nexus-text-primary mb-3">Linha do Tempo</h4>
              <AgentTimeline timeline={mission.timeline} />
            </div>
            <div>
              <h4 className="text-sm font-medium text-nexus-text-primary mb-3">Artefatos</h4>
              <ArtifactGallery artifacts={mission.artifacts} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
