import React from 'react'
import { Card } from '../common/Card'
import { AgentList } from './AgentList'
import { useAgents } from '../../hooks/useAgents'
import { Loading } from '../common/Loading'

export const DashboardLayout: React.FC = () => {
  const { data: agentsData, isLoading, error } = useAgents()

  // Calculate stats baseado nos dados do backend
  const stats = React.useMemo(() => {
    const agents = Array.isArray(agentsData?.data) ? agentsData.data : []
    
    return {
      active: agents.filter((a) => a.status === 'running' && a.isActive).length,
      idle: agents.filter((a) => a.status === 'available' || !a.isActive).length,
      processing: agents.filter((a) => a.taskCount > 0).length,
      error: agents.filter((a) => a.status === 'error').length,
      totalTasks: agents.reduce((acc, a) => acc + (a.taskCount || 0), 0),
    }
  }, [agentsData])

  if (isLoading) {
    return <Loading fullScreen text="Loading agents..." />
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-nexus-danger/10 border border-nexus-danger/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-nexus-danger mb-2">Error loading agents</h3>
          <p className="text-nexus-text-secondary">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-nexus-success">
          <div className="space-y-2">
            <p className="text-nexus-text-secondary text-sm">Active Agents</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-nexus-text-primary">{stats.active}</span>
              <span className="text-nexus-success text-sm">Processing</span>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-nexus-accent">
          <div className="space-y-2">
            <p className="text-nexus-text-secondary text-sm">Idle Agents</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-nexus-text-primary">{stats.idle}</span>
              <span className="text-nexus-accent text-sm">Available</span>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-nexus-purple">
          <div className="space-y-2">
            <p className="text-nexus-text-secondary text-sm">Total Tasks</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-nexus-text-primary">{stats.totalTasks}</span>
              <span className="text-nexus-purple text-sm">Across all agents</span>
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-nexus-danger">
          <div className="space-y-2">
            <p className="text-nexus-text-secondary text-sm">Errors</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-nexus-text-primary">{stats.error}</span>
              <span className="text-nexus-danger text-sm">Need attention</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Agent List */}
      <Card title="Agents" subtitle={`Total: ${agentsData?.data.length || 0} agents`}>
        <AgentList agents={agentsData?.data || []} />
      </Card>
    </div>
  )
}
