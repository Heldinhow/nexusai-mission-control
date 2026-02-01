import type { MissionTimelineEvent } from '../types/mission'

interface AgentTimelineProps {
  timeline: MissionTimelineEvent[]
}

export function AgentTimeline({ timeline }: AgentTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-sm text-slate-500 italic">
        Nenhum evento registrado
      </div>
    )
  }
  
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'mission-created': return '🚀'
      case 'progress-update': return '📈'
      case 'agent-joined': return '👤'
      case 'artifact-created': return '📄'
      case 'mission-completed': return '✅'
      case 'mission-failed': return '❌'
      default: return '•'
    }
  }
  
  const getEventColor = (type: string) => {
    switch (type) {
      case 'mission-created': return 'text-neon-cyan'
      case 'progress-update': return 'text-neon-purple'
      case 'agent-joined': return 'text-neon-green'
      case 'artifact-created': return 'text-yellow-400'
      case 'mission-completed': return 'text-neon-green'
      case 'mission-failed': return 'text-red-500'
      default: return 'text-slate-400'
    }
  }
  
  return (
    <div className="space-y-4">
      {timeline.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center ${getEventColor(event.type)}`}>
              <span className="text-sm">{getEventIcon(event.type)}</span>
            </div>
            {index < timeline.length - 1 && (
              <div className="w-0.5 h-full bg-slate-700 mt-2" />
            )}
          </div>
          
          {/* Event content */}
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-mono ${getEventColor(event.type)}`}>
                {event.agent}
              </span>
              <span className="text-xs text-slate-500">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-sm text-slate-200">
              {event.message}
            </div>
            {Object.keys(event.details || {}).length > 0 && (
              <div className="mt-2 p-2 rounded bg-slate-800/50 text-xs text-slate-400 font-mono">
                {JSON.stringify(event.details, null, 2)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
