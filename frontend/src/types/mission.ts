// Mission types for Nexus Mission Control

export interface MissionTimelineEvent {
  id: string
  timestamp: string
  type: 'mission-created' | 'progress-update' | 'agent-joined' | 'artifact-created' | 'mission-completed' | 'mission-failed'
  agent: string
  message: string
  details: Record<string, any>
}

export interface MissionArtifact {
  id: string
  path: string
  type: string
  description?: string
  createdBy: string
  timestamp: string
}

export interface Mission {
  id: string
  userMessage: string
  source: 'whatsapp' | 'api' | 'dashboard' | 'system' | 'unknown'
  whatsappMessageId?: string
  timestamp: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
  progress: number
  agentsInvolved: string[]
  artifacts: MissionArtifact[]
  timeline: MissionTimelineEvent[]
  metadata: Record<string, any>
}

export interface MissionAgent {
  id: string
  status: string
  timeline: MissionTimelineEvent[]
  notification: any
  joinedAt: string
}
