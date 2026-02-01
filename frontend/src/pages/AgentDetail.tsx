import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAgent } from '../hooks/useAgents'
import { useTaskHistory } from '../hooks/useTasks'
import { Card } from '../components/common/Card'
import { Loading } from '../components/common/Loading'
import { Button } from '../components/common/Button'
import { KillSwitchButton } from '../components/kill-switch/KillSwitchButton'
import { AgentInfo } from '../components/agent-details/AgentInfo'
import { CurrentTask } from '../components/agent-details/CurrentTask'
import { TaskHistory } from '../components/agent-details/TaskHistory'
import type { Task } from '../types/task'

export const AgentDetail: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>()
  const navigate = useNavigate()
  
  const { data: agent, isLoading: agentLoading, error: agentError } = useAgent(agentId || '')
  const { data: taskHistory, isLoading: historyLoading } = useTaskHistory(agentId || '')

  if (agentLoading) {
    return <Loading fullScreen text="Loading agent details..." />
  }

  if (agentError || !agent) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-nexus-danger mb-2">Agent not found</h3>
            <p className="text-nexus-text-secondary mb-4">
              The agent you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')} variant="primary">
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const currentTask = taskHistory?.find((t: Task) => t.id === agent.currentTaskId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate('/')} 
            variant="ghost"
            className="p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-nexus-text-primary">{agent.name}</h1>
            <p className="text-nexus-text-muted font-mono">{agent.id}</p>
          </div>
        </div>
        
        {/* Kill Switch */}
        <KillSwitchButton agent={agent} />
      </div>

      {/* Agent Info */}
      <AgentInfo agent={agent} />

      {/* Current Task */}
      {currentTask && <CurrentTask task={currentTask} />}

      {/* Task History */}
      <TaskHistory 
        tasks={taskHistory || []} 
        isLoading={historyLoading}
        currentTaskId={agent.currentTaskId}
      />
    </div>
  )
}
