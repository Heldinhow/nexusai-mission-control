#!/bin/bash
# Phase 4: AgentMonitor Component
# Duration: 2 days
# Priority: Medium-High

set -e

WORKSPACE="/root/.openclaw/workspace/projects/agent-orchestrator-monitor"
FRONTEND_DIR="$WORKSPACE/frontend"
SCRIPT_DIR="$WORKSPACE/scripts/implementation"

log() {
    echo "[$(date '+%H:%M:%S')] $1"
}

success() {
    echo "[SUCCESS] $1"
}

log "========================================="
log "PHASE 4: AgentMonitor Component"
log "========================================="

cd "$FRONTEND_DIR"

# ============================================================================
# TASK 4.1: Create Agent Components
# ============================================================================
log "Task 4.1: Creating agent components..."

mkdir -p src/components/agent

cat > src/components/agent/AgentCard.tsx << 'EOF'
import type { Agent } from '../../types/agent'
import { getAgentStatusColor, getAgentStatusLabel } from '../../utils/status-colors'
import { formatRelativeTime } from '../../utils/formatters'

interface AgentCardProps {
  agent: Agent
  onClick?: (agent: Agent) => void
  isSelected?: boolean
}

export function AgentCard({ agent, onClick, isSelected }: AgentCardProps) {
  const statusColor = getAgentStatusColor(agent.status)
  const isRunning = agent.status === 'running'
  
  return (
    <div
      onClick={() => onClick?.(agent)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        background: isSelected 
          ? 'rgba(99, 102, 241, 0.2)' 
          : isRunning 
            ? 'rgba(16, 185, 129, 0.1)'
            : 'rgba(30, 41, 59, 0.6)',
        borderRadius: '10px',
        border: isSelected 
          ? '1px solid rgba(99, 102, 241, 0.5)' 
          : isRunning 
            ? '1px solid rgba(16, 185, 129, 0.3)'
            : '1px solid transparent',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.background = 'rgba(51, 65, 85, 0.8)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isSelected 
          ? 'rgba(99, 102, 241, 0.2)' 
          : isRunning 
            ? 'rgba(16, 185, 129, 0.1)'
            : 'rgba(30, 41, 59, 0.6)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Status Indicator */}
        <div style={{
          position: 'relative',
          width: '12px',
          height: '12px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: statusColor,
            animation: isRunning ? 'pulse 2s infinite' : 'none'
          }} />
          {isRunning && (
            <div style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '50%',
              border: `2px solid ${statusColor}`,
              opacity: 0.5,
              animation: 'pulse-ring 2s infinite'
            }} />
          )}
        </div>
        
        {/* Agent Info */}
        <div>
          <div style={{
            fontWeight: 600,
            fontSize: '14px',
            color: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {agent.name}
            {agent.hasNotification && (
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#f59e0b',
                animation: 'pulse 2s infinite'
              }} />
            )}
          </div>
          <div style={{
            fontSize: '11px',
            color: statusColor,
            marginTop: '2px',
            textTransform: 'capitalize'
          }}>
            {getAgentStatusLabel(agent.status)}
          </div>
        </div>
      </div>
      
      {/* Meta */}
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontSize: '12px',
          color: '#64748b'
        }}>
          {agent.taskCount || 0} tasks
        </div>
        <div style={{
          fontSize: '10px',
          color: '#475569',
          marginTop: '2px'
        }}>
          {formatRelativeTime(agent.updatedAt || agent.updated_at)}
        </div>
      </div>
    </div>
  )
}
EOF

cat > src/components/agent/RunningAgentList.tsx << 'EOF'
import type { Agent } from '../../types/agent'
import { AgentCard } from './AgentCard'
import { EmptyState } from '../common/EmptyState'

interface RunningAgentListProps {
  agents: Agent[]
  onSelectAgent?: (agent: Agent) => void
}

export function RunningAgentList({ agents, onSelectAgent }: RunningAgentListProps) {
  const runningAgents = agents.filter(a => a.status === 'running')
  
  if (runningAgents.length === 0) {
    return (
      <EmptyState
        icon="💤"
        title="No Running Agents"
        message="All agents are currently idle."
      />
    )
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {runningAgents.map(agent => (
        <AgentCard 
          key={agent.id} 
          agent={agent} 
          onClick={onSelectAgent}
        />
      ))}
    </div>
  )
}
EOF

cat > src/components/agent/AgentStats.tsx << 'EOF'
import type { Agent } from '../../types/agent'
import { getAgentStatusColor } from '../../utils/status-colors'

interface AgentStatsProps {
  agents: Agent[]
}

interface StatCardProps {
  label: string
  value: number
  color: string
  icon: string
}

function StatCard({ label, value, color, icon }: StatCardProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      background: 'rgba(15, 23, 42, 0.6)',
      borderRadius: '12px',
      border: `1px solid ${color}30`,
      transition: 'all 0.2s ease'
    }}>
      <div>
        <div style={{
          fontSize: '24px',
          fontWeight: 700,
          color: color
        }}>
          {value}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginTop: '4px'
        }}>
          {label}
        </div>
      </div>
      <span style={{ fontSize: '24px' }}>{icon}</span>
    </div>
  )
}

export function AgentStats({ agents }: AgentStatsProps) {
  const stats = {
    total: agents.length,
    running: agents.filter(a => a.status === 'running').length,
    completed: agents.filter(a => a.status === 'completed').length,
    error: agents.filter(a => a.status === 'error').length,
    idle: agents.filter(a => a.status === 'idle').length,
    unknown: agents.filter(a => a.status === 'unknown').length,
  }
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '12px'
    }}>
      <StatCard 
        label="Running" 
        value={stats.running} 
        color="#10b981" 
        icon="▶️" 
      />
      <StatCard 
        label="Completed" 
        value={stats.completed} 
        color="#22c55e" 
        icon="✅" 
      />
      <StatCard 
        label="Error" 
        value={stats.error} 
        color="#ef4444" 
        icon="❌" 
      />
      <StatCard 
        label="Idle" 
        value={stats.idle} 
        color="#64748b" 
        icon="💤" 
      />
    </div>
  )
}
EOF

success "Task 4.1 complete: Agent components created"

# ============================================================================
# TASK 4.2: Create AgentMonitor Component
# ============================================================================
log "Task 4.2: Creating AgentMonitor component..."

cat > src/components/agent/AgentMonitor.tsx << 'EOF'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAgents } from '../../hooks/useAgents'
import { useAgentStore } from '../../stores/agentStore'
import { webSocketService } from '../../services/websocket-service'
import type { Agent, AgentStatus } from '../../types/agent'
import { AgentStats } from './AgentStats'
import { RunningAgentList } from './RunningAgentList'
import { AgentCard } from './AgentCard'
import { NexusTerminal } from '../terminal/NexusTerminal'
import { EmptyState } from '../common/EmptyState'
import { Skeleton } from '../common/Skeleton'

const STATUS_FILTERS: { value: AgentStatus | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: '#818cf8' },
  { value: 'running', label: 'Running', color: '#10b981' },
  { value: 'idle', label: 'Idle', color: '#64748b' },
  { value: 'error', label: 'Error', color: '#ef4444' },
  { value: 'completed', label: 'Completed', color: '#22c55e' },
]

export function AgentMonitor() {
  const [activeFilter, setActiveFilter] = useState<AgentStatus | 'all'>('all')
  const [searchText, setSearchText] = useState('')
  const { data: agentsData, isLoading, error, refetch } = useAgents()
  
  const agents = useMemo(() => agentsData?.data || [], [agentsData])
  
  // Handle WebSocket updates
  useEffect(() => {
    const handleAgentUpdate = () => {
      refetch()
    }
    
    webSocketService.on('agent.state_change', handleAgentUpdate)
    return () => webSocketService.off('agent.state_change', handleAgentUpdate)
  }, [refetch])
  
  // Filter agents
  const filteredAgents = useMemo(() => {
    let result = [...agents]
    
    // Filter by status
    if (activeFilter !== 'all') {
      result = result.filter(a => a.status === activeFilter)
    }
    
    // Filter by search
    if (searchText) {
      const search = searchText.toLowerCase()
      result = result.filter(a => 
        a.name.toLowerCase().includes(search) ||
        a.id.toLowerCase().includes(search)
      )
    }
    
    // Sort: running first, then by name
    result.sort((a, b) => {
      if (a.status === 'running' && b.status !== 'running') return -1
      if (b.status === 'running' && a.status !== 'running') return 1
      return a.name.localeCompare(b.name)
    })
    
    return result
  }, [agents, activeFilter, searchText])
  
  if (error) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: 'rgba(239, 68, 68, 0.1)',
        borderRadius: '12px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ color: '#ef4444' }}>Failed to Load Agents</h3>
        <button onClick={() => refetch()} style={{
          padding: '10px 20px',
          background: 'rgba(99, 102, 241, 0.2)',
          color: '#818cf8',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '16px'
        }}>
          🔄 Retry
        </button>
      </div>
    )
  }
  
  return (
    <div className="agent-monitor" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Stats */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} height={80} />)}
        </div>
      ) : (
        <div style={{ marginBottom: '24px' }}>
          <AgentStats agents={agents} />
        </div>
      )}
      
      {/* Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
      }}>
        {/* Agent List */}
        <div>
          {/* Filters */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}>
            {STATUS_FILTERS.map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => setActiveFilter(value)}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 500,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: activeFilter === value 
                    ? `${color}30`
                    : 'rgba(30, 41, 59, 0.8)',
                  color: activeFilter === value ? color : '#94a3b8',
                  boxShadow: activeFilter === value ? `0 0 10px ${color}30` : 'none'
                }}
              >
                {label}
              </button>
            ))}
          </div>
          
          {/* Search */}
          <input
            type="text"
            placeholder="Search agents..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              marginBottom: '16px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          
          {/* Agent List */}
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} height={70} />)}
            </div>
          ) : filteredAgents.length === 0 ? (
            <EmptyState
              icon="🤖"
              title="No Agents Found"
              message={searchText || activeFilter !== 'all'
                ? "Try adjusting your filters."
                : "No agents are currently registered."}
            />
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {filteredAgents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </div>
        
        {/* Terminal */}
        <div>
          <NexusTerminal agents={agents} />
        </div>
      </div>
    </div>
  )
}
EOF

success "Task 4.2 complete: AgentMonitor component created"

# ============================================================================
# TASK 4.3: Add pulse-ring Animation
# ============================================================================
log "Task 4.3: Adding pulse-ring animation..."

cat >> src/App.css << 'EOF'

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}
EOF

success "Task 4.3 complete: pulse-ring animation added"

# ============================================================================
# COMPLETION
# ============================================================================
log "========================================="
success "PHASE 4 COMPLETE: AgentMonitor Component"
log "========================================="
log ""
log "Completed tasks:"
log "  ✓ Task 4.1: Created AgentCard, RunningAgentList, AgentStats components"
log "  ✓ Task 4.2: Created AgentMonitor with filtering and search"
log "  ✓ Task 4.3: Added pulse-ring animation"
log ""

# Mark phase complete
source "$SCRIPT_DIR/scheduler.sh"
complete_phase 4
