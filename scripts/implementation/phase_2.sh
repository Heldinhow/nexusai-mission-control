#!/bin/bash
# Phase 2: TaskDetail Component
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
log "PHASE 2: TaskDetail Component"
log "========================================="

cd "$FRONTEND_DIR"

# ============================================================================
# TASK 2.1: Create Subtask Components
# ============================================================================
log "Task 2.1: Creating subtask components..."

mkdir -p src/components/task

cat > src/components/task/SubtaskItem.tsx << 'EOF'
import type { Subtask } from '../../types/task'
import { getStatusColor } from '../../utils/status-colors'
import { formatDate, formatDuration } from '../../utils/formatters'

interface SubtaskItemProps {
  subtask: Subtask
  index: number
}

export function SubtaskItem({ subtask, index }: SubtaskItemProps) {
  const status = subtask.status || 'pending'
  const statusColor = getStatusColor(status)
  
  return (
    <div className="subtask-item" style={{ 
      borderLeft: `3px solid ${statusColor}`,
      background: 'rgba(30, 41, 59, 0.5)',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '8px'
    }}>
      <div className="subtask-header" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        marginBottom: '8px'
      }}>
        <span 
          className="status-dot"
          style={{ 
            width: '10px', 
            height: '10px', 
            borderRadius: '50%',
            backgroundColor: statusColor,
            animation: status === 'running' ? 'pulse 2s infinite' : 'none'
          }}
        />
        <span className="subtask-index" style={{ 
          fontSize: '12px', 
          color: '#64748b',
          fontFamily: 'monospace'
        }}>
          #{index + 1}
        </span>
        <span className="agent-name" style={{ 
          fontWeight: 600,
          color: '#e2e8f0'
        }}>
          {subtask.agentName || subtask.agent_name || subtask.agentId || subtask.agent_id || 'Unknown Agent'}
        </span>
        <span className="stage-badge" style={{
          fontSize: '11px',
          padding: '2px 8px',
          borderRadius: '4px',
          background: 'rgba(99, 102, 241, 0.2)',
          color: '#818cf8',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {subtask.stage}
        </span>
        <span 
          className="subtask-status"
          style={{ 
            marginLeft: 'auto',
            fontSize: '12px',
            color: statusColor,
            fontWeight: 500,
            textTransform: 'capitalize'
          }}
        >
          {status}
        </span>
      </div>
      
      <div className="subtask-description" style={{
        fontSize: '13px',
        color: '#94a3b8',
        marginBottom: '10px',
        lineHeight: 1.5
      }}>
        {subtask.taskDescription || subtask.task_description || subtask.description || 'No description'}
      </div>
      
      <div className="subtask-meta" style={{
        display: 'flex',
        gap: '16px',
        fontSize: '12px',
        color: '#64748b',
        fontFamily: 'monospace'
      }}>
        <span title="Start time">
          🕐 {formatDate(subtask.startTime || subtask.start_time)}
        </span>
        <span title="End time">
          🏁 {formatDate(subtask.endTime || subtask.end_time)}
        </span>
        <span title="Duration">
          ⏱️ {formatDuration(subtask.durationSeconds || subtask.duration_seconds)}
        </span>
      </div>
    </div>
  )
}
EOF

cat > src/components/task/SubtaskList.tsx << 'EOF'
import type { Subtask } from '../../types/task'
import { SubtaskItem } from './SubtaskItem'
import { EmptyState } from '../common/EmptyState'

interface SubtaskListProps {
  subtasks: Subtask[]
  loading?: boolean
}

export function SubtaskList({ subtasks, loading }: SubtaskListProps) {
  if (loading) {
    return (
      <div className="subtask-list-loading" style={{ padding: '20px' }}>
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            style={{
              height: '80px',
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '8px',
              marginBottom: '8px',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>
    )
  }
  
  if (subtasks.length === 0) {
    return (
      <EmptyState 
        icon="📋"
        title="No Subtasks"
        message="This task doesn't have any subtasks yet."
      />
    )
  }
  
  return (
    <div className="subtask-list" style={{ padding: '4px' }}>
      {subtasks.map((subtask, index) => (
        <SubtaskItem key={subtask.id || index} subtask={subtask} index={index} />
      ))}
    </div>
  )
}
EOF

success "Task 2.1 complete: Subtask components created"

# ============================================================================
# TASK 2.2: Create Artifact Components
# ============================================================================
log "Task 2.2: Creating artifact components..."

cat > src/components/task/ArtifactItem.tsx << 'EOF'
import type { Artifact } from '../../types/task'
import { getFileIcon, getFileName } from '../../utils/formatters'
import { CopyButton } from '../common/CopyButton'

interface ArtifactItemProps {
  artifact: Artifact
}

export function ArtifactItem({ artifact }: ArtifactItemProps) {
  const filePath = artifact.filePath || artifact.file_path || artifact.path || ''
  const fileName = getFileName(filePath)
  const fileIcon = getFileIcon(filePath)
  const fileType = artifact.fileType || artifact.file_type || artifact.type || 'file'
  
  return (
    <div 
      className="artifact-item"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: 'rgba(30, 41, 59, 0.5)',
        borderRadius: '8px',
        marginBottom: '8px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        border: '1px solid transparent'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(51, 65, 85, 0.7)'
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)'
        e.currentTarget.style.borderColor = 'transparent'
      }}
    >
      <span className="file-icon" style={{ fontSize: '20px' }}>
        {fileIcon}
      </span>
      
      <div className="artifact-info" style={{ flex: 1, minWidth: 0 }}>
        <div className="file-name" style={{
          fontSize: '14px',
          fontWeight: 500,
          color: '#e2e8f0',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {fileName}
        </div>
        <div className="file-path" style={{
          fontSize: '11px',
          color: '#64748b',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginTop: '2px'
        }}>
          {filePath}
        </div>
      </div>
      
      <span className="file-type" style={{
        fontSize: '10px',
        padding: '2px 8px',
        borderRadius: '4px',
        background: 'rgba(99, 102, 241, 0.15)',
        color: '#818cf8',
        textTransform: 'uppercase',
        fontWeight: 500
      }}>
        {fileType}
      </span>
      
      <CopyButton text={filePath} size="small" />
    </div>
  )
}
EOF

cat > src/components/task/ArtifactList.tsx << 'EOF'
import type { Artifact } from '../../types/task'
import { ArtifactItem } from './ArtifactItem'
import { EmptyState } from '../common/EmptyState'

interface ArtifactListProps {
  artifacts: Artifact[]
  loading?: boolean
}

export function ArtifactList({ artifacts, loading }: ArtifactListProps) {
  if (loading) {
    return (
      <div className="artifact-list-loading" style={{ padding: '20px' }}>
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            style={{
              height: '60px',
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '8px',
              marginBottom: '8px',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>
    )
  }
  
  if (artifacts.length === 0) {
    return (
      <EmptyState 
        icon="📁"
        title="No Artifacts"
        message="This task hasn't produced any artifacts yet."
      />
    )
  }
  
  return (
    <div className="artifact-list" style={{ padding: '4px' }}>
      {artifacts.map((artifact) => (
        <ArtifactItem key={artifact.id} artifact={artifact} />
      ))}
    </div>
  )
}
EOF

success "Task 2.2 complete: Artifact components created"

# ============================================================================
# TASK 2.3: Create TaskMetadata Component
# ============================================================================
log "Task 2.3: Creating task metadata component..."

cat > src/components/task/TaskMetadata.tsx << 'EOF'
import type { Task } from '../../types/task'
import { formatDate } from '../../utils/formatters'
import { CopyButton } from '../common/CopyButton'
import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskProgressBar } from './TaskProgressBar'

interface TaskMetadataProps {
  task: Task
}

export function TaskMetadata({ task }: TaskMetadataProps) {
  const metadataItems = [
    { label: 'ID', value: task.id, isCode: true, copyable: true },
    { label: 'Source', value: task.source, badge: true },
    { label: 'Status', value: <TaskStatusBadge status={task.status} /> },
    { label: 'Progress', value: <TaskProgressBar progress={task.progress} status={task.status} /> },
    { label: 'Created', value: formatDate(task.createdAt || task.created_at) },
    { label: 'Updated', value: formatDate(task.updatedAt || task.updated_at) },
    { label: 'Completed', value: formatDate(task.completedAt || task.completed_at) || '-' },
  ]
  
  return (
    <div className="task-metadata" style={{
      background: 'rgba(15, 23, 42, 0.6)',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid rgba(99, 102, 241, 0.2)'
    }}>
      <h4 style={{
        margin: '0 0 16px 0',
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: '#64748b'
      }}>
        Task Information
      </h4>
      
      <div className="metadata-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '12px'
      }}>
        {metadataItems.map((item) => (
          <div 
            key={item.label}
            className="metadata-item"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <span style={{
              fontSize: '11px',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {item.label}
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {typeof item.value === 'string' ? (
                <span style={{
                  fontSize: '13px',
                  color: '#e2e8f0',
                  fontFamily: item.isCode ? 'monospace' : 'inherit',
                  wordBreak: 'break-all'
                }}>
                  {item.value}
                </span>
              ) : (
                item.value
              )}
              {item.copyable && typeof item.value === 'string' && (
                <CopyButton text={item.value} size="small" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
EOF

success "Task 2.3 complete: TaskMetadata component created"

# ============================================================================
# TASK 2.4: Create Utility Components
# ============================================================================
log "Task 2.4: Creating utility components..."

mkdir -p src/components/common

cat > src/components/common/EmptyState.tsx << 'EOF'
interface EmptyStateProps {
  icon: string
  title: string
  message: string
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      <span style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</span>
      <h4 style={{
        margin: '0 0 8px 0',
        fontSize: '16px',
        color: '#94a3b8'
      }}>{title}</h4>
      <p style={{
        margin: 0,
        fontSize: '14px',
        color: '#64748b'
      }}>{message}</p>
    </div>
  )
}
EOF

cat > src/components/common/CopyButton.tsx << 'EOF'
import { useState } from 'react'

interface CopyButtonProps {
  text: string
  size?: 'small' | 'medium'
}

export function CopyButton({ text, size = 'medium' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      style={{
        padding: size === 'small' ? '4px 8px' : '6px 12px',
        fontSize: size === 'small' ? '11px' : '12px',
        background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(99, 102, 241, 0.15)',
        color: copied ? '#4ade80' : '#818cf8',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      {copied ? '✓ Copied' : '📋'}
    </button>
  )
}
EOF

cat > src/components/common/Skeleton.tsx << 'EOF'
interface SkeletonProps {
  height?: number | string
  width?: number | string
  className?: string
}

export function Skeleton({ height = 20, width = '100%', className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
        background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.5) 25%, rgba(51, 65, 85, 0.5) 50%, rgba(30, 41, 59, 0.5) 75%)',
        backgroundSize: '200% 100%',
        borderRadius: '4px',
        animation: 'shimmer 1.5s infinite'
      }}
    />
  )
}
EOF

success "Task 2.4 complete: Utility components created"

# ============================================================================
# TASK 2.5: Create Status Badge and Progress Bar
# ============================================================================
log "Task 2.5: Creating status badge and progress bar..."

cat > src/components/task/TaskStatusBadge.tsx << 'EOF'
import type { TaskStatus } from '../../types/task'
import { getStatusColor, getStatusLabel } from '../../utils/status-colors'

interface TaskStatusBadgeProps {
  status: TaskStatus
  size?: 'small' | 'medium' | 'large'
}

export function TaskStatusBadge({ status, size = 'medium' }: TaskStatusBadgeProps) {
  const color = getStatusColor(status)
  const label = getStatusLabel(status)
  
  const sizeStyles = {
    small: { padding: '2px 8px', fontSize: '10px' },
    medium: { padding: '4px 12px', fontSize: '12px' },
    large: { padding: '6px 16px', fontSize: '14px' }
  }
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      borderRadius: '6px',
      fontWeight: 500,
      textTransform: 'capitalize',
      backgroundColor: `${color}20`,
      color: color,
      ...sizeStyles[size]
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: color,
        animation: status === 'running' ? 'pulse 2s infinite' : 'none'
      }} />
      {label}
    </span>
  )
}
EOF

cat > src/components/task/TaskProgressBar.tsx << 'EOF'
import type { TaskStatus } from '../../types/task'
import { getStatusColor } from '../../utils/status-colors'

interface TaskProgressBarProps {
  progress: number
  status: TaskStatus
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
}

export function TaskProgressBar({ 
  progress, 
  status, 
  size = 'medium',
  showLabel = true 
}: TaskProgressBarProps) {
  const color = getStatusColor(status)
  const clampedProgress = Math.max(0, Math.min(100, progress))
  
  const sizeStyles = {
    small: { height: '4px', borderRadius: '2px' },
    medium: { height: '8px', borderRadius: '4px' },
    large: { height: '12px', borderRadius: '6px' }
  }
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flex: 1
    }}>
      <div style={{
        flex: 1,
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        overflow: 'hidden',
        ...sizeStyles[size]
      }}>
        <div style={{
          height: '100%',
          width: `${clampedProgress}%`,
          backgroundColor: color,
          borderRadius: sizeStyles[size].borderRadius,
          transition: 'width 0.5s ease-out',
          boxShadow: status === 'running' ? `0 0 10px ${color}60` : 'none'
        }} />
      </div>
      {showLabel && (
        <span style={{
          fontSize: size === 'small' ? '11px' : '12px',
          fontWeight: 500,
          color: '#94a3b8',
          minWidth: '36px',
          textAlign: 'right',
          fontFamily: 'monospace'
        }}>
          {Math.round(clampedProgress)}%
        </span>
      )}
    </div>
  )
}
EOF

success "Task 2.5 complete: Status badge and progress bar created"

# ============================================================================
# TASK 2.6: Update Utility Functions
# ============================================================================
log "Task 2.6: Updating utility functions..."

cat > src/utils/formatters.ts << 'EOF'
// Date formatting
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return '-'
  }
}

export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (seconds < 60) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    
    return formatDate(dateStr)
  } catch {
    return '-'
  }
}

// Duration formatting
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === undefined || seconds === null || isNaN(seconds)) return '-'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const hours = Math.floor(mins / 60)
  
  if (hours > 0) {
    const remainingMins = mins % 60
    return `${hours}h ${remainingMins}m ${secs}s`
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`
  }
  return `${secs}s`
}

// File formatting
export function getFileName(path: string | null | undefined): string {
  if (!path) return 'unknown'
  return path.split('/').pop() || path
}

export function getFileExtension(path: string | null | undefined): string {
  if (!path) return ''
  return path.split('.').pop()?.toLowerCase() || ''
}

export function getFileIcon(path: string | null | undefined): string {
  if (!path) return '📁'
  
  const ext = getFileExtension(path)
  
  const icons: Record<string, string> = {
    // Code files
    js: '📄',
    ts: '📘',
    jsx: '⚛️',
    tsx: '⚛️',
    py: '🐍',
    java: '☕',
    go: '🔵',
    rs: '🦀',
    cpp: '⚙️',
    c: '⚙️',
    h: '📋',
    
    // Web files
    json: '📋',
    html: '🌐',
    css: '🎨',
    scss: '🎨',
    sass: '🎨',
    less: '🎨',
    
    // Documentation
    md: '📝',
    txt: '📄',
    pdf: '📕',
    doc: '📘',
    docx: '📘',
    
    // Images
    png: '🖼️',
    jpg: '🖼️',
    jpeg: '🖼️',
    gif: '🎭',
    svg: '🎨',
    ico: '🎯',
    
    // Archives
    zip: '📦',
    tar: '📦',
    gz: '📦',
    rar: '📦',
    '7z': '📦',
    
    // Database
    sql: '🗄️',
    db: '🗄️',
    sqlite: '🗄️',
    
    // Config
    yml: '⚙️',
    yaml: '⚙️',
    toml: '⚙️',
    ini: '⚙️',
    env: '🔒',
    
    // Scripts
    sh: '🔧',
    bash: '🔧',
    zsh: '🔧',
    ps1: '🔧',
    bat: '🔧',
    
    // Git
    gitignore: '🔒',
    gitattributes: '🔒',
  }
  
  return icons[ext] || '📄'
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return '-'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}
EOF

success "Task 2.6 complete: Utility functions updated"

# ============================================================================
# TASK 2.7: Update Status Colors
# ============================================================================
log "Task 2.7: Updating status colors..."

cat > src/utils/status-colors.ts << 'EOF'
import type { TaskStatus, AgentStatus } from '../types'

// Task status colors
export function getTaskStatusColor(status: TaskStatus | string): string {
  const colors: Record<string, string> = {
    pending: '#f59e0b',    // Amber
    running: '#3b82f6',    // Blue
    completed: '#10b981',  // Green
    success: '#10b981',    // Green
    failed: '#ef4444',     // Red
    error: '#ef4444',      // Red
    cancelled: '#6b7280',  // Gray
    unknown: '#6b7280',    // Gray
  }
  return colors[status] || '#64748b'
}

export function getTaskStatusLabel(status: TaskStatus | string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    running: 'Running',
    completed: 'Completed',
    success: 'Success',
    failed: 'Failed',
    error: 'Error',
    cancelled: 'Cancelled',
    unknown: 'Unknown',
  }
  return labels[status] || status
}

// Agent status colors
export function getAgentStatusColor(status: AgentStatus | string): string {
  const colors: Record<string, string> = {
    running: '#10b981',    // Green
    available: '#22c55e',  // Green
    busy: '#f59e0b',       // Amber
    idle: '#64748b',       // Gray
    error: '#ef4444',      // Red
    killed: '#dc2626',     // Dark Red
    unknown: '#6b7280',    // Gray
    completed: '#10b981',  // Green
  }
  return colors[status] || '#64748b'
}

export function getAgentStatusLabel(status: AgentStatus | string): string {
  const labels: Record<string, string> = {
    running: 'Running',
    available: 'Available',
    busy: 'Busy',
    idle: 'Idle',
    error: 'Error',
    killed: 'Killed',
    unknown: 'Unknown',
    completed: 'Completed',
  }
  return labels[status] || status
}

// Generic status color (works for both)
export function getStatusColor(status: string): string {
  return getTaskStatusColor(status) || getAgentStatusColor(status) || '#64748b'
}

// Progress bar colors
export function getProgressColor(progress: number): string {
  if (progress < 25) return '#ef4444'   // Red
  if (progress < 50) return '#f59e0b'   // Amber
  if (progress < 75) return '#3b82f6'   // Blue
  return '#10b981'                       // Green
}

// Priority colors
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: '#64748b',
    medium: '#3b82f6',
    high: '#f59e0b',
    critical: '#ef4444',
  }
  return colors[priority] || '#64748b'
}
EOF

success "Task 2.7 complete: Status colors updated"

# ============================================================================
# TASK 2.8: Update TaskDetail Component
# ============================================================================
log "Task 2.8: Updating TaskDetail component..."

cat > src/components/task/TaskDetail.tsx << 'EOF'
import { useEffect, useState } from 'react'
import { useTask } from '../../hooks/useTasks'
import type { Task } from '../../types/task'
import { SubtaskList } from './SubtaskList'
import { ArtifactList } from './ArtifactList'
import { TaskMetadata } from './TaskMetadata'
import { Skeleton } from '../common/Skeleton'

interface TaskDetailProps {
  task: Task
  onBack?: () => void
}

export function TaskDetail({ task, onBack }: TaskDetailProps) {
  const { data: taskDetail, isLoading, error, refetch } = useTask(task.id)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Auto-refresh for running tasks
  useEffect(() => {
    if (task.status !== 'running') return
    
    const interval = setInterval(() => {
      refetch()
    }, 3000)
    
    return () => clearInterval(interval)
  }, [task.status, refetch])
  
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 500)
  }
  
  const displayTask = taskDetail || task
  const subtasks = displayTask.subtasks || []
  const artifacts = displayTask.artifacts || []
  
  if (error) {
    return (
      <div className="task-detail-error" style={{
        padding: '40px',
        textAlign: 'center',
        background: 'rgba(239, 68, 68, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(239, 68, 68, 0.3)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>Failed to Load Task Details</h3>
        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            onClick={() => refetch()}
            style={{
              padding: '10px 20px',
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            🔄 Try Again
          </button>
          {onBack && (
            <button 
              onClick={onBack}
              style={{
                padding: '10px 20px',
                background: 'rgba(100, 116, 139, 0.2)',
                color: '#94a3b8',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ← Go Back
            </button>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className="task-detail" style={{
      background: 'rgba(15, 23, 42, 0.4)',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid rgba(99, 102, 241, 0.15)'
    }}>
      {/* Header */}
      <div className="task-detail-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        background: 'rgba(15, 23, 42, 0.6)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onBack && (
            <button 
              onClick={onBack}
              style={{
                padding: '8px 16px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ← Back
            </button>
          )}
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 600,
            color: '#e2e8f0'
          }}>
            Task Details
          </h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {task.status === 'running' && (
            <span style={{
              fontSize: '12px',
              color: '#3b82f6',
              animation: 'pulse 2s infinite'
            }}>
              ● Live
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              padding: '8px 16px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              opacity: isRefreshing ? 0.5 : 1
            }}
          >
            {isRefreshing ? '🔄' : '↻'} Refresh
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div style={{ padding: '24px' }}>
        {/* User Message */}
        <div style={{
          marginBottom: '24px',
          padding: '16px 20px',
          background: 'rgba(99, 102, 241, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#818cf8',
            marginBottom: '8px'
          }}>
            Request
          </div>
          <p style={{
            margin: 0,
            fontSize: '15px',
            color: '#e2e8f0',
            lineHeight: 1.6
          }}>
            {displayTask.userMessage || displayTask.message || displayTask.user_message || 'No message'}
          </p>
        </div>
        
        {/* Metadata */}
        <div style={{ marginBottom: '24px' }}>
          {isLoading && !taskDetail ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              <Skeleton height={80} />
            </div>
          ) : (
            <TaskMetadata task={displayTask} />
          )}
        </div>
        
        {/* Subtasks Section */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📋 Subtasks
              <span style={{
                fontSize: '12px',
                padding: '2px 10px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
                borderRadius: '12px'
              }}>
                {subtasks.length}
              </span>
            </h3>
          </div>
          <SubtaskList subtasks={subtasks} loading={isLoading && !taskDetail} />
        </div>
        
        {/* Artifacts Section */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📁 Artifacts
              <span style={{
                fontSize: '12px',
                padding: '2px 10px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
                borderRadius: '12px'
              }}>
                {artifacts.length}
              </span>
            </h3>
          </div>
          <ArtifactList artifacts={artifacts} loading={isLoading && !taskDetail} />
        </div>
      </div>
    </div>
  )
}
EOF

success "Task 2.8 complete: TaskDetail component updated"

# ============================================================================
# TASK 2.9: Add CSS Animation Keyframes
# ============================================================================
log "Task 2.9: Adding CSS animations..."

cat >> src/App.css << 'EOF'

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Apply animations */
.subtask-item {
  animation: fadeIn 0.3s ease-out;
}

.artifact-item {
  animation: fadeIn 0.3s ease-out;
}

.task-detail {
  animation: slideIn 0.4s ease-out;
}
EOF

success "Task 2.9 complete: CSS animations added"

# ============================================================================
# COMPLETION
# ============================================================================
log "========================================="
success "PHASE 2 COMPLETE: TaskDetail Component"
log "========================================="
log ""
log "Completed tasks:"
log "  ✓ Task 2.1: Created SubtaskItem and SubtaskList components"
log "  ✓ Task 2.2: Created ArtifactItem and ArtifactList components"
log "  ✓ Task 2.3: Created TaskMetadata component"
log "  ✓ Task 2.4: Created utility components (EmptyState, CopyButton, Skeleton)"
log "  ✓ Task 2.5: Created TaskStatusBadge and TaskProgressBar"
log "  ✓ Task 2.6: Updated formatters utility"
log "  ✓ Task 2.7: Updated status-colors utility"
log "  ✓ Task 2.8: Updated TaskDetail component with loading/error states"
log "  ✓ Task 2.9: Added CSS animations"
log ""

# Mark phase complete
source "$SCRIPT_DIR/scheduler.sh"
complete_phase 2
