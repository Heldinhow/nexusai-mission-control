import { X, Clock, Loader2, CheckCircle, XCircle, Ban, HelpCircle, MessageCircle, Plug, LayoutDashboard, Cog, BarChart3, Package, Info, Users, FileText } from 'lucide-react'
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
      case 'pending': return <Clock className="w-4 h-4" />
      case 'in_progress': return <Loader2 className="w-4 h-4 animate-spin" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'failed': return <XCircle className="w-4 h-4" />
      case 'cancelled': return <Ban className="w-4 h-4" />
      default: return <HelpCircle className="w-4 h-4" />
    }
  }
  
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'whatsapp': return <MessageCircle className="w-6 h-6" />
      case 'api': return <Plug className="w-6 h-6" />
      case 'dashboard': return <LayoutDashboard className="w-6 h-6" />
      case 'system': return <Cog className="w-6 h-6" />
      default: return <HelpCircle className="w-6 h-6" />
    }
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
  
  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'whatsapp': return 'WhatsApp'
      case 'api': return 'API'
      case 'dashboard': return 'Dashboard'
      case 'system': return 'Sistema'
      default: return source
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-nexus-bg-primary/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-nexus-bg-secondary rounded-2xl border border-nexus-border shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-nexus-border bg-nexus-bg-secondary/95 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-nexus-text-secondary">{getSourceIcon(mission.source)}</span>
                <span className={`text-sm px-3 py-1 rounded-full border flex items-center gap-1 ${getStatusColor(mission.status)}`}>
                  {getStatusIcon(mission.status)} {getStatusLabel(mission.status)}
                </span>
                <span className="text-xs text-nexus-text-muted font-mono">
                  {new Date(mission.timestamp).toLocaleString('pt-BR')}
                </span>
              </div>
              <h2 className="text-xl font-medium text-nexus-text-primary">
                {mission.userMessage}
              </h2>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-nexus-bg-tertiary transition-colors"
            >
              <X className="w-6 h-6 text-nexus-text-muted" />
            </button>
          </div>
          
          {/* Progress */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 h-3 bg-nexus-bg-tertiary rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  mission.progress === 100 ? 'bg-nexus-success' : 'bg-nexus-primary-500'
                }`}
                style={{ width: `${mission.progress}%` }}
              />
            </div>
            <span className="text-lg font-mono font-bold text-nexus-text-primary">
              {mission.progress}%
            </span>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-nexus-bg-tertiary rounded-xl p-4 text-center border border-nexus-border">
              <div className="text-3xl font-bold font-mono text-nexus-primary-400 flex items-center justify-center gap-2">
                <Users className="w-6 h-6" />
                {(mission.agentsInvolved || []).length}
              </div>
              <div className="text-xs text-nexus-text-muted mt-1">Agentes</div>
            </div>
            <div className="bg-nexus-bg-tertiary rounded-xl p-4 text-center border border-nexus-border">
              <div className="text-3xl font-bold font-mono text-nexus-primary-500 flex items-center justify-center gap-2">
                <FileText className="w-6 h-6" />
                {(mission.artifacts || []).length}
              </div>
              <div className="text-xs text-nexus-text-muted mt-1">Artefatos</div>
            </div>
            <div className="bg-nexus-bg-tertiary rounded-xl p-4 text-center border border-nexus-border">
              <div className="text-3xl font-bold font-mono text-nexus-success flex items-center justify-center gap-2">
                <BarChart3 className="w-6 h-6" />
                {(mission.timeline || []).length}
              </div>
              <div className="text-xs text-nexus-text-muted mt-1">Eventos</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Timeline */}
            <div>
              <h3 className="text-lg font-medium text-nexus-text-primary mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> Linha do Tempo de Eventos
              </h3>
              <div className="bg-nexus-bg-tertiary rounded-xl p-4 max-h-[400px] overflow-auto border border-nexus-border">
                <AgentTimeline timeline={mission.timeline || []} />
              </div>
            </div>
            
            {/* Artifacts */}
            <div>
              <h3 className="text-lg font-medium text-nexus-text-primary mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" /> Artefatos Gerados
              </h3>
              <div className="bg-nexus-bg-tertiary rounded-xl p-4 max-h-[400px] overflow-auto border border-nexus-border">
                <ArtifactGallery artifacts={mission.artifacts || []} />
              </div>
            </div>
          </div>
          
          {/* Metadata */}
          <div>
            <h3 className="text-lg font-medium text-nexus-text-primary mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" /> Detalhes Técnicos
            </h3>
            <div className="bg-nexus-bg-tertiary rounded-xl p-4 font-mono text-xs text-nexus-text-secondary overflow-auto border border-nexus-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-nexus-text-muted">ID:</span> {mission.id}
                </div>
                <div>
                  <span className="text-nexus-text-muted">Origem:</span> {getSourceLabel(mission.source)}
                </div>
                {mission.whatsappMessageId && (
                  <div>
                    <span className="text-nexus-text-muted">ID WhatsApp:</span> {mission.whatsappMessageId}
                  </div>
                )}
                <div>
                  <span className="text-nexus-text-muted">Data/Hora:</span> {mission.timestamp}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
