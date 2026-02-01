#!/bin/bash
# Phase 5: NexusTerminal Component
# Duration: 1-2 days
# Priority: Medium

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
log "PHASE 5: NexusTerminal Component"
log "========================================="

cd "$FRONTEND_DIR"

# ============================================================================
# TASK 5.1: Create Terminal Components
# ============================================================================
log "Task 5.1: Creating terminal components..."

mkdir -p src/components/terminal

cat > src/components/terminal/TerminalLine.tsx << 'EOF'
import type { TerminalLine as TerminalLineType } from '../../types/terminal'

interface TerminalLineProps {
  line: TerminalLineType
}

const TYPE_COLORS: Record<TerminalLineType['type'], string> = {
  command: '#818cf8',  // Indigo
  success: '#10b981',  // Green
  error: '#ef4444',    // Red
  warning: '#f59e0b',  // Amber
  info: '#3b82f6',     // Blue
  system: '#94a3b8',   // Slate
  agent: '#22c55e'     // Green
}

const TYPE_ICONS: Record<TerminalLineType['type'], string> = {
  command: '$',
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
  system: '→',
  agent: '🤖'
}

export function TerminalLine({ line }: TerminalLineProps) {
  const color = TYPE_COLORS[line.type]
  const icon = TYPE_ICONS[line.type]
  const time = new Date(line.timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: '12px',
      lineHeight: '1.5',
      padding: '2px 0'
    }}>
      <span style={{ 
        color: '#475569',
        minWidth: '60px',
        fontSize: '11px'
      }}>
        {time}
      </span>
      <span style={{ 
        color,
        minWidth: '16px',
        textAlign: 'center'
      }}>
        {icon}
      </span>
      <span style={{ 
        color: line.type === 'system' ? '#94a3b8' : '#e2e8f0',
        flex: 1,
        wordBreak: 'break-word'
      }}>
        {line.text}
      </span>
    </div>
  )
}
EOF

cat > src/components/terminal/TerminalHeader.tsx << 'EOF'
import { useTerminalStore } from '../../stores/terminalStore'

export function TerminalHeader() {
  const { isAutoScroll, isPaused, toggleAutoScroll, togglePause, clear } = useTerminalStore()
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 16px',
      background: 'rgba(15, 23, 42, 0.9)',
      borderBottom: '1px solid rgba(99, 102, 241, 0.2)'
    }}>
      {/* Window Controls */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <span style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: '#ef4444'
        }} />
        <span style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: '#f59e0b'
        }} />
        <span style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: '#10b981'
        }} />
        <span style={{
          marginLeft: '12px',
          fontSize: '12px',
          color: '#64748b',
          fontWeight: 500
        }}>
          nexus-terminal
        </span>
      </div>
      
      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={togglePause}
          style={{
            padding: '4px 10px',
            fontSize: '11px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            background: isPaused ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 41, 59, 0.8)',
            color: isPaused ? '#f59e0b' : '#94a3b8'
          }}
        >
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>
        <button
          onClick={toggleAutoScroll}
          style={{
            padding: '4px 10px',
            fontSize: '11px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            background: isAutoScroll ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.8)',
            color: isAutoScroll ? '#10b981' : '#94a3b8'
          }}
        >
          {isAutoScroll ? '⬇ Auto' : '⬇ Manual'}
        </button>
        <button
          onClick={clear}
          style={{
            padding: '4px 10px',
            fontSize: '11px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#ef4444'
          }}
        >
          🗑 Clear
        </button>
      </div>
    </div>
  )
}
EOF

success "Task 5.1 complete: Terminal components created"

# ============================================================================
# TASK 5.2: Create NexusTerminal Component
# ============================================================================
log "Task 5.2: Creating NexusTerminal component..."

cat > src/components/terminal/NexusTerminal.tsx << 'EOF'
import { useEffect, useRef } from 'react'
import { useTerminalStore } from '../../stores/terminalStore'
import { webSocketService } from '../../services/websocket-service'
import type { Agent, Task } from '../../types'
import { TerminalLine } from './TerminalLine'
import { TerminalHeader } from './TerminalHeader'

interface NexusTerminalProps {
  agents?: Agent[]
  recentTasks?: Task[]
}

export function NexusTerminal({ agents = [], recentTasks = [] }: NexusTerminalProps) {
  const { lines, isAutoScroll, isPaused, addLine, addLines } = useTerminalStore()
  const terminalRef = useRef<HTMLDivElement>(null)
  const prevAgentsRef = useRef<Agent[]>([])
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (isAutoScroll && !isPaused && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines, isAutoScroll, isPaused])
  
  // Add initial system info
  useEffect(() => {
    const now = new Date().toISOString()
    addLines([
      { type: 'info', text: '╔════════════════════════════════════════════════════════════╗', timestamp: now },
      { type: 'info', text: '║          NexusAI Mission Control - Terminal v2.0           ║', timestamp: now },
      { type: 'info', text: '╚════════════════════════════════════════════════════════════╝', timestamp: now },
      { type: 'system', text: '', timestamp: now },
    ])
  }, [addLines])
  
  // Monitor agent changes
  useEffect(() => {
    const now = new Date().toISOString()
    const prevAgents = prevAgentsRef.current
    
    // Check for status changes
    agents.forEach(agent => {
      const prevAgent = prevAgents.find(a => a.id === agent.id)
      
      if (!prevAgent) {
        // New agent
        addLine({
          type: 'agent',
          text: `Agent "${agent.name}" registered (${agent.status})`,
          timestamp: now,
          agentId: agent.id
        })
      } else if (prevAgent.status !== agent.status) {
        // Status change
        addLine({
          type: agent.status === 'error' ? 'error' : agent.status === 'running' ? 'success' : 'info',
          text: `Agent "${agent.name}" status: ${prevAgent.status} → ${agent.status}`,
          timestamp: now,
          agentId: agent.id
        })
      }
    })
    
    prevAgentsRef.current = agents
  }, [agents, addLine])
  
  // Listen to WebSocket events
  useEffect(() => {
    const handleAgentStateChange = (data: { agentId: string; previousStatus: string; currentStatus: string }) => {
      const agent = agents.find(a => a.id === data.agentId)
      addLine({
        type: 'agent',
        text: `State change: ${agent?.name || data.agentId} (${data.previousStatus} → ${data.currentStatus})`,
        timestamp: new Date().toISOString(),
        agentId: data.agentId
      })
    }
    
    const handleTaskTransition = (data: { taskId: string; previousStatus: string; currentStatus: string }) => {
      addLine({
        type: 'info',
        text: `Task ${data.taskId.slice(0, 8)}...: ${data.previousStatus} → ${data.currentStatus}`,
        timestamp: new Date().toISOString(),
        taskId: data.taskId
      })
    }
    
    webSocketService.on('agent.state_change', handleAgentStateChange)
    webSocketService.on('task.transition', handleTaskTransition)
    
    return () => {
      webSocketService.off('agent.state_change', handleAgentStateChange)
      webSocketService.off('task.transition', handleTaskTransition)
    }
  }, [agents, addLine])
  
  // System status
  const runningCount = agents.filter(a => a.status === 'running').length
  const totalTasks = recentTasks.length
  
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.8)',
      borderRadius: '12px',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <TerminalHeader />
      
      {/* Status Bar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        padding: '8px 16px',
        background: 'rgba(30, 41, 59, 0.8)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
        fontSize: '11px',
        color: '#64748b'
      }}>
        <span>Agents: <strong style={{ color: '#10b981' }}>{runningCount}</strong>/{agents.length}</span>
        <span>Tasks: <strong style={{ color: '#3b82f6' }}>{totalTasks}</strong></span>
        <span style={{ marginLeft: 'auto' }}>
          WS: {webSocketService.isConnected() ? 
            <span style={{ color: '#10b981' }}>● Connected</span> : 
            <span style={{ color: '#ef4444' }}>● Disconnected</span>
          }
        </span>
      </div>
      
      {/* Terminal Content */}
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
        }}
      >
        {lines.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#475569',
            padding: '40px',
            fontStyle: 'italic'
          }}>
            Waiting for activity...
          </div>
        ) : (
          lines.map((line) => (
            <TerminalLine key={line.id} line={line} />
          ))
        )}
        
        {/* Cursor */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '8px'
        }}>
          <span style={{ color: '#10b981' }}>➜</span>
          <span style={{
            width: '8px',
            height: '16px',
            background: '#10b981',
            animation: 'blink 1s infinite'
          }} />
        </div>
      </div>
    </div>
  )
}
EOF

success "Task 5.2 complete: NexusTerminal component created"

# ============================================================================
# TASK 5.3: Add blink Animation
# ============================================================================
log "Task 5.3: Adding blink animation..."

cat >> src/App.css << 'EOF'

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}
EOF

success "Task 5.3 complete: blink animation added"

# ============================================================================
# COMPLETION
# ============================================================================
log "========================================="
success "PHASE 5 COMPLETE: NexusTerminal Component"
log "========================================="
log ""
log "Completed tasks:"
log "  ✓ Task 5.1: Created TerminalLine and TerminalHeader components"
log "  ✓ Task 5.2: Created NexusTerminal with activity feed and WebSocket"
log "  ✓ Task 5.3: Added blink animation"
log ""

# Mark phase complete
source "$SCRIPT_DIR/scheduler.sh"
complete_phase 5
