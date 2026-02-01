#!/bin/bash
# Phase 3: TaskList Component
# Duration: 2-3 days
# Priority: High

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
log "PHASE 3: TaskList Component"
log "========================================="

cd "$FRONTEND_DIR"

# ============================================================================
# TASK 3.1: Create TaskFilters Component
# ============================================================================
log "Task 3.1: Creating filter components..."

mkdir -p src/components/task

cat > src/components/task/TaskFilters.tsx << 'EOF'
import { useState, useCallback } from 'react'
import type { TaskFilter, TaskStatus, TaskSource } from '../../types/task'

interface TaskFiltersProps {
  filter: TaskFilter
  onFilterChange: (filter: Partial<TaskFilter>) => void
  onClearFilters: () => void
}

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'running', label: 'Running', color: '#3b82f6' },
  { value: 'completed', label: 'Completed', color: '#10b981' },
  { value: 'failed', label: 'Failed', color: '#ef4444' },
  { value: 'cancelled', label: 'Cancelled', color: '#6b7280' },
]

const SOURCE_OPTIONS: { value: TaskSource; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'api', label: 'API' },
  { value: 'webhook', label: 'Webhook' },
]

export function TaskFilters({ filter, onFilterChange, onClearFilters }: TaskFiltersProps) {
  const [searchText, setSearchText] = useState(filter.searchText || '')
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchText(value)
    onFilterChange({ searchText: value })
  }, [onFilterChange])
  
  const handleStatusToggle = useCallback((status: TaskStatus) => {
    const currentStatuses = filter.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status]
    onFilterChange({ status: newStatuses.length > 0 ? newStatuses : undefined })
  }, [filter.status, onFilterChange])
  
  const handleSourceToggle = useCallback((source: TaskSource) => {
    const currentSources = filter.source || []
    const newSources = currentSources.includes(source)
      ? currentSources.filter(s => s !== source)
      : [...currentSources, source]
    onFilterChange({ source: newSources.length > 0 ? newSources : undefined })
  }, [filter.source, onFilterChange])
  
  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split(':') as [TaskFilter['sortBy'], TaskFilter['sortOrder']]
    onFilterChange({ sortBy, sortOrder })
  }, [onFilterChange])
  
  const hasActiveFilters = 
    (filter.status?.length || 0) > 0 || 
    (filter.source?.length || 0) > 0 || 
    filter.searchText
  
  return (
    <div className="task-filters" style={{
      background: 'rgba(15, 23, 42, 0.6)',
      borderRadius: '12px',
      padding: '16px 20px',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      marginBottom: '20px'
    }}>
      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '16px'
          }}>🔍</span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchText}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#818cf8'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.3)'}
          />
        </div>
      </div>
      
      {/* Filters Row */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center'
      }}>
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: '#64748b', marginRight: '4px' }}>Status:</span>
          {STATUS_OPTIONS.map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => handleStatusToggle(value)}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s',
                background: filter.status?.includes(value) 
                  ? `${color}30`
                  : 'rgba(30, 41, 59, 0.8)',
                color: filter.status?.includes(value) ? color : '#94a3b8',
                boxShadow: filter.status?.includes(value) ? `0 0 8px ${color}40` : 'none'
              }}
            >
              {label}
            </button>
          ))}
        </div>
        
        {/* Divider */}
        <div style={{ width: '1px', height: '24px', background: 'rgba(99, 102, 241, 0.3)' }} />
        
        {/* Source Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: '#64748b', marginRight: '4px' }}>Source:</span>
          {SOURCE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleSourceToggle(value)}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s',
                background: filter.source?.includes(value)
                  ? 'rgba(99, 102, 241, 0.3)'
                  : 'rgba(30, 41, 59, 0.8)',
                color: filter.source?.includes(value) ? '#818cf8' : '#94a3b8'
              }}
            >
              {label}
            </button>
          ))}
        </div>
        
        {/* Divider */}
        <div style={{ width: '1px', height: '24px', background: 'rgba(99, 102, 241, 0.3)' }} />
        
        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Sort:</span>
          <select
            value={`${filter.sortBy || 'created'}:${filter.sortOrder || 'desc'}`}
            onChange={handleSortChange}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              borderRadius: '6px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              background: 'rgba(30, 41, 59, 0.8)',
              color: '#e2e8f0',
              cursor: 'pointer'
            }}
          >
            <option value="created:desc">Newest First</option>
            <option value="created:asc">Oldest First</option>
            <option value="updated:desc">Recently Updated</option>
            <option value="progress:desc">Progress (High-Low)</option>
            <option value="progress:asc">Progress (Low-High)</option>
          </select>
        </div>
        
        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            style={{
              marginLeft: 'auto',
              padding: '4px 12px',
              fontSize: '12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#ef4444'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  )
}
EOF

success "Task 3.1 complete: TaskFilters component created"

# ============================================================================
# TASK 3.2: Create TaskCard Component
# ============================================================================
log "Task 3.2: Creating TaskCard component..."

cat > src/components/task/TaskCard.tsx << 'EOF'
import { memo } from 'react'
import type { Task } from '../../types/task'
import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskProgressBar } from './TaskProgressBar'
import { formatRelativeTime } from '../../utils/formatters'

interface TaskCardProps {
  task: Task
  onClick?: (task: Task) => void
  isSelected?: boolean
  recentlyUpdated?: boolean
}

export const TaskCard = memo(function TaskCard({ 
  task, 
  onClick, 
  isSelected,
  recentlyUpdated 
}: TaskCardProps) {
  const message = task.userMessage || task.message || task.user_message || 'No message'
  const truncatedMessage = message.length > 100 ? message.slice(0, 100) + '...' : message
  
  return (
    <div
      onClick={() => onClick?.(task)}
      style={{
        padding: '16px 20px',
        background: isSelected 
          ? 'rgba(99, 102, 241, 0.2)' 
          : 'rgba(30, 41, 59, 0.6)',
        borderRadius: '12px',
        border: isSelected 
          ? '1px solid rgba(99, 102, 241, 0.5)' 
          : recentlyUpdated 
            ? '1px solid rgba(59, 130, 246, 0.4)'
            : '1px solid transparent',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        animation: recentlyUpdated ? 'pulse-border 2s' : 'fadeIn 0.3s ease-out'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.background = 'rgba(51, 65, 85, 0.8)'
          e.currentTarget.style.transform = 'translateX(4px)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isSelected 
          ? 'rgba(99, 102, 241, 0.2)' 
          : 'rgba(30, 41, 59, 0.6)'
        e.currentTarget.style.transform = 'translateX(0)'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '10px'
      }}>
        <TaskStatusBadge status={task.status} size="small" />
        
        <span style={{
          fontSize: '11px',
          padding: '2px 8px',
          background: 'rgba(99, 102, 241, 0.15)',
          color: '#818cf8',
          borderRadius: '4px',
          textTransform: 'uppercase'
        }}>
          {task.source}
        </span>
        
        <span style={{
          fontSize: '11px',
          color: '#64748b',
          fontFamily: 'monospace'
        }}>
          {task.id.slice(0, 8)}...
        </span>
        
        {recentlyUpdated && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '10px',
            padding: '2px 8px',
            background: 'rgba(59, 130, 246, 0.2)',
            color: '#3b82f6',
            borderRadius: '4px',
            animation: 'pulse 2s infinite'
          }}>
            Updated
          </span>
        )}
      </div>
      
      {/* Message */}
      <p style={{
        margin: '0 0 12px 0',
        fontSize: '14px',
        color: '#e2e8f0',
        lineHeight: 1.5
      }}>
        {truncatedMessage}
      </p>
      
      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{ flex: 1 }}>
          <TaskProgressBar 
            progress={task.progress || 0} 
            status={task.status}
            size="small"
            showLabel={true}
          />
        </div>
        
        <span style={{
          fontSize: '11px',
          color: '#64748b',
          whiteSpace: 'nowrap'
        }}>
          {formatRelativeTime(task.updatedAt || task.updated_at)}
        </span>
      </div>
    </div>
  )
})
EOF

success "Task 3.2 complete: TaskCard component created"

# ============================================================================
# TASK 3.3: Create Enhanced TaskList Component
# ============================================================================
log "Task 3.3: Creating enhanced TaskList component..."

cat > src/components/task/TaskList.tsx << 'EOF'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useTasks } from '../../hooks/useTasks'
import { useTaskStore } from '../../stores/taskStore'
import { webSocketService } from '../../services/websocket-service'
import type { Task, TaskFilter } from '../../types/task'
import { TaskFilters } from './TaskFilters'
import { TaskCard } from './TaskCard'
import { TaskDetail } from './TaskDetail'
import { EmptyState } from '../common/EmptyState'
import { Skeleton } from '../common/Skeleton'

interface TaskListProps {
  onSelectTask?: (task: Task) => void
}

export function TaskList({ onSelectTask }: TaskListProps) {
  const { filter, setFilter, clearFilter, selectTask, selectedTask } = useTaskStore()
  const { data: tasksData, isLoading, error, refetch } = useTasks(filter)
  const [recentlyUpdated, setRecentlyUpdated] = useState<Set<string>>(new Set())
  
  const tasks = useMemo(() => tasksData?.data || [], [tasksData])
  
  // Handle WebSocket real-time updates
  useEffect(() => {
    const handleTaskUpdate = (data: { taskId: string }) => {
      // Mark task as recently updated
      setRecentlyUpdated(prev => new Set(prev).add(data.taskId))
      
      // Clear the "recently updated" indicator after 5 seconds
      setTimeout(() => {
        setRecentlyUpdated(prev => {
          const next = new Set(prev)
          next.delete(data.taskId)
          return next
        })
      }, 5000)
      
      // Refresh the list
      refetch()
    }
    
    webSocketService.on('task.transition', handleTaskUpdate)
    return () => webSocketService.off('task.transition', handleTaskUpdate)
  }, [refetch])
  
  const handleFilterChange = useCallback((newFilter: Partial<TaskFilter>) => {
    setFilter(newFilter)
  }, [setFilter])
  
  const handleTaskClick = useCallback((task: Task) => {
    selectTask(task)
    onSelectTask?.(task)
  }, [selectTask, onSelectTask])
  
  const handleBack = useCallback(() => {
    selectTask(null)
  }, [selectTask])
  
  // Show task detail if selected
  if (selectedTask) {
    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <TaskDetail task={selectedTask} onBack={handleBack} />
      </div>
    )
  }
  
  if (error) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: 'rgba(239, 68, 68, 0.1)',
        borderRadius: '12px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>Failed to Load Tasks</h3>
        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
        <button
          onClick={() => refetch()}
          style={{
            padding: '10px 20px',
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#818cf8',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🔄 Retry
        </button>
      </div>
    )
  }
  
  return (
    <div className="task-list" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: 600,
          color: '#e2e8f0'
        }}>
          Tasks
          {tasks.length > 0 && (
            <span style={{
              marginLeft: '12px',
              fontSize: '13px',
              padding: '4px 12px',
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              borderRadius: '12px'
            }}>
              {tasks.length}
            </span>
          )}
        </h2>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isLoading ? '🔄' : '↻'} Refresh
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <TaskFilters
        filter={filter}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilter}
      />
      
      {/* Task List */}
      {isLoading && tasks.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height={100} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No Tasks Found"
          message={filter.searchText || filter.status?.length || filter.source?.length
            ? "Try adjusting your filters to see more tasks."
            : "No tasks have been created yet."}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={handleTaskClick}
              recentlyUpdated={recentlyUpdated.has(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
EOF

success "Task 3.3 complete: TaskList component created"

# ============================================================================
# TASK 3.4: Add Animation Keyframes
# ============================================================================
log "Task 3.4: Adding animation keyframes..."

cat >> src/App.css << 'EOF'

@keyframes pulse-border {
  0%, 100% {
    border-color: rgba(59, 130, 246, 0.4);
  }
  50% {
    border-color: rgba(59, 130, 246, 0.8);
  }
}
EOF

success "Task 3.4 complete: Animation keyframes added"

# ============================================================================
# COMPLETION
# ============================================================================
log "========================================="
success "PHASE 3 COMPLETE: TaskList Component"
log "========================================="
log ""
log "Completed tasks:"
log "  ✓ Task 3.1: Created TaskFilters component with status, source, and sort"
log "  ✓ Task 3.2: Created TaskCard component with animations"
log "  ✓ Task 3.3: Created enhanced TaskList with real-time updates"
log "  ✓ Task 3.4: Added pulse-border animation"
log ""

# Mark phase complete
source "$SCRIPT_DIR/scheduler.sh"
complete_phase 3
