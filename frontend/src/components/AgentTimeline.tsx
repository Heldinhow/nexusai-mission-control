import { Rocket, TrendingUp, User, FileText, CheckCircle, XCircle, Circle } from 'lucide-react'
import type { MissionTimelineEvent } from '../types/mission'

interface AgentTimelineProps {
  timeline: MissionTimelineEvent[]
}

export function AgentTimeline({ timeline }: AgentTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-sm text-nexus-text-muted italic">
        Nenhum evento registrado
      </div>
    )
  }
  
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'mission-created': return <Rocket className="w-4 h-4" />
      case 'progress-update': return <TrendingUp className="w-4 h-4" />
      case 'agent-joined': return <User className="w-4 h-4" />
      case 'artifact-created': return <FileText className="w-4 h-4" />
      case 'mission-completed': return <CheckCircle className="w-4 h-4" />
      case 'mission-failed': return <XCircle className="w-4 h-4" />
      default: return <Circle className="w-4 h-4" />
    }
  }
  
  const getEventColor = (type: string) => {
    switch (type) {
      case 'mission-created': return 'text-nexus-primary-400'
      case 'progress-update': return 'text-nexus-primary-500'
      case 'agent-joined': return 'text-nexus-success'
      case 'artifact-created': return 'text-nexus-warning'
      case 'mission-completed': return 'text-nexus-success'
      case 'mission-failed': return 'text-nexus-danger'
      default: return 'text-nexus-text-muted'
    }
  }
  
  return (
    <div className="space-y-4">
      {timeline.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full bg-nexus-bg-tertiary flex items-center justify-center ${getEventColor(event.type)}`}>
              {getEventIcon(event.type)}
            </div>
            {index < timeline.length - 1 && (
              <div className="w-0.5 h-full bg-nexus-border mt-2" />
            )}
          </div>
          
          {/* Event content */}
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-mono ${getEventColor(event.type)}`}>
                {event.agent}
              </span>
              <span className="text-xs text-nexus-text-muted">
                {new Date(event.timestamp).toLocaleTimeString('pt-BR')}
              </span>
            </div>
            <div className="text-sm text-nexus-text-primary">
              {event.message}
            </div>
            {Object.keys(event.details || {}).length > 0 && (
              <div className="mt-2 p-2 rounded bg-nexus-bg-primary text-xs text-nexus-text-secondary font-mono border border-nexus-border">
                {JSON.stringify(event.details, null, 2)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
