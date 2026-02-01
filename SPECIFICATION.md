# NexusAI Frontend Feature Development Specification

## Executive Summary

This document outlines the comprehensive development plan for implementing and improving five key features in the NexusAI Mission Control frontend. The goal is to create a polished, real-time monitoring dashboard with full task visibility, agent monitoring capabilities, and an integrated terminal interface.

---

## 1. Feature Descriptions

### 1.1 TaskDetail Component

**Current State:** Basic implementation exists with subtask and artifact display

**Target State:**
- **Complete Subtask Information Display:**
  - Status with color-coded indicators (running=blue, completed=green, failed=red, pending=gray)
  - Agent name and ID for each subtask
  - Stage/pipeline phase visualization
  - Precise timing: start time, end time, duration in human-readable format
  - Task description preview

- **Artifact List with Enhanced Details:**
  - File type icons based on extension (JS, TS, CSS, JSON, images, etc.)
  - Full file path with truncation and tooltip
  - File size (when available)
  - Created by agent name
  - Created timestamp
  - Quick actions (view, download when applicable)

- **Task Metadata Panel:**
  - Task ID (truncated with copy button)
  - Current status with badge
  - Progress bar with percentage
  - Creation timestamp
  - Last update timestamp
  - Completion timestamp (if applicable)
  - Source (whatsapp, dashboard, etc.)
  - Parent task reference (if applicable)

- **Loading & Error States:**
  - Skeleton loading UI while fetching details
  - Graceful error handling with retry mechanism
  - Empty states for no subtasks/artifacts
  - Network error recovery

### 1.2 TaskList Component

**Current State:** Basic list with polling, shows tasks with progress bars

**Target State:**
- **Real-time Updates:**
  - WebSocket integration for instant status changes
  - Optimistic UI updates
  - Fallback to polling when WebSocket unavailable
  - Visual indicators for recently updated tasks

- **Enhanced Status Indicators:**
  - Animated pulse for running tasks
  - Color-coded badges (pending, running, completed, failed, cancelled)
  - Status icons (spinner for running, check for completed, X for failed)

- **Progress Visualization:**
  - Smooth animated progress bars
  - Percentage display
  - Stage-based progress indicators

- **Filtering & Sorting:**
  - Status filter dropdown (All, Pending, Running, Completed, Failed, Cancelled)
  - Source filter (WhatsApp, Dashboard, API)
  - Date range filter
  - Sort by: Created (newest/oldest), Updated, Progress, Status
  - Search by task message/content
  - Clear filters button

- **Pagination/Infinite Scroll:**
  - Load more as user scrolls
  - Show total count
  - Items per page selector

### 1.3 AgentMonitor Component

**Current State:** Stats cards, agent list, basic filtering

**Target State:**
- **Live Status Updates:**
  - Real-time agent status via WebSocket
  - Activity timeline showing recent state changes
  - Heartbeat indicator for each agent
  - Last seen timestamp

- **Enhanced Agent Statistics:**
  - Total tasks completed per agent
  - Success rate percentage
  - Average task duration
  - Current task (if running)
  - Task queue depth
  - Error count and rate

- **Running Agent List:**
  - Highlight running agents at top
  - Current task description
  - Progress indicator
  - Time running
  - Kill action (if applicable)
  - Expand for task details

- **Agent Filtering:**
  - Status filter tabs (All, Running, Idle, Error, Completed)
  - Search by agent name
  - Sort by: Name, Status, Last Activity, Task Count

- **Visual Improvements:**
  - Agent avatars/initials
  - Status pulse animation
  - Connection quality indicator

### 1.4 NexusTerminal Component

**Current State:** Basic terminal output showing system status

**Target State:**
- **Agent Activity Feed:**
  - Real-time log of agent state changes
  - Task start/completion events
  - Error notifications
  - Agent spawn/kill events
  - Timestamps for all events
  - Color-coded log levels (info, success, warning, error)

- **System Status Display:**
  - Total agents count with breakdown
  - Active tasks count
  - System uptime
  - WebSocket connection status
  - API latency indicator
  - Memory/CPU usage (if available)

- **Recent Tasks Summary:**
  - Last 5-10 completed tasks
  - Current running tasks
  - Failed tasks with error preview
  - Quick navigation to task details

- **Terminal Enhancements:**
  - Auto-scroll to latest
  - Scrollback buffer (last 100 lines)
  - Copy to clipboard
  - Pause/resume auto-scroll
  - Clear terminal button
  - Command input (future: direct commands)

### 1.5 App.tsx Integration

**Current State:** Tab switching between Agents and Tasks, basic layout

**Target State:**
- **Robust Tab Switching:**
  - Smooth transitions between views
  - Preserve state when switching tabs
  - Keyboard shortcuts (Ctrl+1 for Agents, Ctrl+2 for Tasks)
  - URL hash sync (#agents, #tasks)

- **Layout Improvements:**
  - Responsive design for mobile/tablet
  - Collapsible sidebar
  - Full-screen mode for terminal
  - Split view option (agents + terminal)

- **Global State Management:**
  - Shared WebSocket connection
  - Cached data between tabs
  - Global notifications/toasts
  - Error boundary for crash recovery

---

## 2. API Endpoints Required

### 2.1 Existing Endpoints (Confirmed Working)

```
GET  /api/agents                    - List all agents
GET  /api/agents/:id                - Get agent details
GET  /api/agents/:id/children       - Get agent children
GET  /api/tasks                     - List all tasks
GET  /api/tasks/:id                 - Get task details with subtasks & artifacts
GET  /api/missions                  - List missions
POST /api/missions                  - Create new mission
GET  /api/hierarchy                 - Get agent hierarchy graph
POST /api/agents/:id/kill          - Kill an agent
```

### 2.2 WebSocket Endpoints

```
WS   /ws                            - Real-time updates
  - Message Types:
    - agent.state_change            - Agent status changes
    - task.transition               - Task status transitions
    - agent.spawned                 - New agent created
    - agent.killed                  - Agent terminated
    - mission-update                - Mission progress updates
```

### 2.3 Additional Endpoints (May Need Backend Implementation)

```
GET  /api/tasks/:id/logs            - Get task execution logs
GET  /api/system/status             - System health & metrics
GET  /api/system/metrics            - Performance metrics (CPU, memory)
GET  /api/agents/:id/stats          - Agent-specific statistics
```

---

## 3. Component Structure

### 3.1 Directory Organization

```
src/
├── components/
│   ├── task/
│   │   ├── TaskDetail.tsx          # Enhanced task detail view
│   │   ├── TaskDetail.css          # Task detail styles
│   │   ├── TaskList.tsx            # Enhanced task list
│   │   ├── TaskList.css            # Task list styles
│   │   ├── TaskCard.tsx            # Individual task card
│   │   ├── TaskFilters.tsx         # Filter controls
│   │   ├── TaskStatusBadge.tsx     # Status badge component
│   │   ├── TaskProgressBar.tsx     # Animated progress bar
│   │   └── SubtaskList.tsx         # Subtask display component
│   │
│   ├── agent/
│   │   ├── AgentMonitor.tsx        # Enhanced agent monitor
│   │   ├── AgentMonitor.css        # Agent monitor styles
│   │   ├── AgentCard.tsx           # Individual agent card
│   │   ├── AgentStats.tsx          # Statistics display
│   │   ├── AgentStatusBadge.tsx    # Agent status indicator
│   │   ├── RunningAgentList.tsx    # Active agents list
│   │   └── AgentActivityTimeline.tsx # Activity feed
│   │
│   ├── terminal/
│   │   ├── NexusTerminal.tsx       # Enhanced terminal
│   │   ├── NexusTerminal.css       # Terminal styles
│   │   ├── TerminalLine.tsx        # Individual line component
│   │   ├── TerminalHeader.tsx      # Terminal controls
│   │   └── TerminalInput.tsx       # Command input (future)
│   │
│   ├── common/
│   │   ├── Loading.tsx             # Loading states
│   │   ├── ErrorBoundary.tsx       # Error handling
│   │   ├── Skeleton.tsx            # Skeleton loaders
│   │   ├── Badge.tsx               # Badge component
│   │   ├── Card.tsx                # Card container
│   │   ├── EmptyState.tsx          # Empty state display
│   │   └── CopyButton.tsx          # Copy to clipboard
│   │
│   └── layout/
│       ├── AppLayout.tsx           # Main layout wrapper
│       ├── Sidebar.tsx             # Navigation sidebar
│       └── Header.tsx              # Top navigation
│
├── hooks/
│   ├── useTasks.ts                 # Task data fetching
│   ├── useTaskDetail.ts            # Single task fetching
│   ├── useAgents.ts                # Agent data fetching
│   ├── useWebSocket.ts             # WebSocket connection
│   ├── useRealtime.ts              # Real-time updates hook
│   ├── useTaskFilters.ts           # Filter state management
│   └── useAgentStats.ts            # Agent statistics
│
├── services/
│   ├── api-client.ts               # Axios instance
│   ├── task-api.ts                 # Task API methods
│   ├── agent-api.ts                # Agent API methods
│   └── websocket-service.ts        # WebSocket management
│
├── stores/
│   ├── taskStore.ts                # Task state (Zustand)
│   ├── agentStore.ts               # Agent state (Zustand)
│   ├── terminalStore.ts            # Terminal state
│   └── uiStore.ts                  # UI state (tabs, etc.)
│
├── types/
│   ├── task.ts                     # Task type definitions
│   ├── agent.ts                    # Agent type definitions
│   ├── api.ts                      # API response types
│   ├── websocket.ts                # WebSocket message types
│   └── index.ts                    # Type exports
│
├── utils/
│   ├── formatters.ts               # Date, time, size formatters
│   ├── status-colors.ts            # Status color mappings
│   ├── validators.ts               # Input validation
│   └── constants.ts                # App constants
│
└── App.tsx                         # Main app component
```

### 3.2 Component Hierarchy

```
App
├── AppLayout
│   ├── Header
│   │   ├── LiveIndicator
│   │   └── LastUpdateTime
│   │
│   ├── Sidebar
│   │   ├── TabNavigation (Agents | Tasks)
│   │   └── QuickStats
│   │
│   └── MainContent
│       ├── AgentMonitor (when agents tab active)
│       │   ├── StatsGrid
│       │   │   └── StatCard x4
│       │   ├── AgentList
│       │   │   └── AgentCard xN
│       │   └── NexusTerminal
│       │       ├── TerminalHeader
│       │       └── TerminalContent
│       │           └── TerminalLine xN
│       │
│       └── TaskList (when tasks tab active)
│           ├── TaskFilters
│           │   ├── SearchInput
│           │   ├── StatusFilter
│           │   ├── SourceFilter
│           │   └── SortDropdown
│           ├── TaskListContent
│           │   └── TaskCard xN
│           │       ├── TaskStatusBadge
│           │       └── TaskProgressBar
│           └── TaskDetail (when task selected)
│               ├── TaskHeader
│               ├── TaskMetadata
│               ├── SubtaskList
│               │   └── SubtaskItem xN
│               └── ArtifactList
│                   └── ArtifactItem xN
```

---

## 4. Data Types Required

### 4.1 Task Types

```typescript
// src/types/task.ts

export type TaskStatus = 
  | 'pending' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'cancelled'

export type TaskSource = 'whatsapp' | 'dashboard' | 'api' | 'webhook'

export interface Task {
  id: string
  userMessage: string
  source: TaskSource
  whatsappMessageId?: string
  status: TaskStatus
  progress: number
  createdAt: string
  updatedAt: string
  completedAt?: string
  
  // Relations
  subtasks?: Subtask[]
  artifacts?: Artifact[]
  
  // Metadata
  metadata?: TaskMetadata
}

export interface Subtask {
  id: number | string
  agentId: string
  agentName: string
  stage: string
  status: TaskStatus
  taskDescription: string
  
  // Timing
  startTime?: string
  endTime?: string
  durationSeconds?: number
  
  // Optional
  artifacts?: Artifact[]
  metadata?: Record<string, unknown>
}

export interface Artifact {
  id: number
  taskId?: string
  path: string
  filePath?: string  // Alias for path
  type: string
  fileType?: string
  description?: string
  size?: number
  createdBy?: string
  createdAt: string
}

export interface TaskMetadata {
  priority?: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
  estimatedDuration?: number
  actualDuration?: number
  parentTaskId?: string
  retryCount?: number
}

// Filter types
export interface TaskFilter {
  status?: TaskStatus[]
  source?: TaskSource[]
  searchText?: string
  dateFrom?: string
  dateTo?: string
  agentId?: string
  sortBy?: 'created' | 'updated' | 'progress' | 'status'
  sortOrder?: 'asc' | 'desc'
}
```

### 4.2 Agent Types

```typescript
// src/types/agent.ts

export type AgentStatus = 
  | 'running' 
  | 'available' 
  | 'busy' 
  | 'idle'
  | 'error' 
  | 'killed' 
  | 'unknown'
  | 'completed'

export interface Agent {
  id: string
  name: string
  status: AgentStatus
  taskCount: number
  createdAt: string
  updatedAt: string
  completedAt?: string | null
  
  // Optional fields
  isActive?: boolean
  hasNotification?: boolean
  notification?: AgentNotification
  currentTaskId?: string
  parentAgentId?: string
  capabilities?: string[]
  lastActivityAt?: string
  spawnReason?: string
  instructions?: string
  metadata?: AgentMetadata
}

export interface AgentNotification {
  agentId: string
  type: string
  status: 'success' | 'error' | 'warning' | 'info'
  message: string
  timestamp: string
  task?: string
  artifacts?: string[]
  testResult?: string
  testSummary?: TestSummary
  fixes?: string[]
  prevention?: string
  nextAgent?: string
}

export interface TestSummary {
  total: number
  passed: number
  failed: number
  coverage: string
}

export interface AgentMetadata {
  model?: string
  version?: string
  tags?: string[]
}

export interface AgentStats {
  agentId: string
  totalTasks: number
  completedTasks: number
  failedTasks: number
  successRate: number
  averageTaskDuration: number
  currentTask?: Task
  queueDepth: number
}

// Filter types
export interface AgentFilter {
  status?: AgentStatus[]
  searchText?: string
  hasParent?: boolean
  hasActiveTask?: boolean
}
```

### 4.3 Terminal Types

```typescript
// src/types/terminal.ts

export type TerminalLineType = 
  | 'command' 
  | 'success' 
  | 'error' 
  | 'info' 
  | 'system' 
  | 'agent'
  | 'warning'

export interface TerminalLine {
  id: string
  type: TerminalLineType
  text: string
  timestamp: string
  agentId?: string
  taskId?: string
}

export interface TerminalState {
  lines: TerminalLine[]
  isAutoScroll: boolean
  isPaused: boolean
  maxLines: number
}

export interface SystemStatus {
  totalAgents: number
  runningAgents: number
  totalTasks: number
  activeTasks: number
  completedTasks: number
  failedTasks: number
  uptime: number
  websocketStatus: 'connected' | 'disconnected' | 'reconnecting'
  apiLatency?: number
}
```

### 4.4 API Types

```typescript
// src/types/api.ts

export interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
  timestamp: string
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}
```

### 4.5 WebSocket Types

```typescript
// src/types/websocket.ts

export type WebSocketMessageType =
  | 'agent.state_change'
  | 'task.transition'
  | 'agent.spawned'
  | 'agent.killed'
  | 'mission.update'
  | 'system.status'
  | 'ping'
  | 'pong'

export interface BaseWebSocketMessage {
  type: WebSocketMessageType
  timestamp: string
}

export interface AgentStateChangeMessage extends BaseWebSocketMessage {
  type: 'agent.state_change'
  agentId: string
  previousStatus: AgentStatus
  currentStatus: AgentStatus
  taskId?: string
}

export interface TaskTransitionMessage extends BaseWebSocketMessage {
  type: 'task.transition'
  taskId: string
  agentId: string
  previousStatus: TaskStatus
  currentStatus: TaskStatus
  progress?: number
}

export interface MissionUpdateMessage extends BaseWebSocketMessage {
  type: 'mission.update'
  mission: Mission
}

export type WsMessage =
  | AgentStateChangeMessage
  | TaskTransitionMessage
  | MissionUpdateMessage
```

---

## 5. Implementation Order

### Phase 1: Foundation & Data Layer (Priority: Critical)
**Duration:** 1-2 days
**Goal:** Establish solid data fetching and state management foundation

#### Tasks:
1. **Update Type Definitions** (2-3 hours)
   - Refine task.ts with complete types
   - Refine agent.ts with complete types
   - Create terminal.ts types
   - Ensure all API response types match backend

2. **Enhance API Services** (3-4 hours)
   - Update task-api.ts with all endpoints
   - Update agent-api.ts with all endpoints
   - Add error handling and retry logic
   - Add request/response interceptors

3. **Create Zustand Stores** (4-5 hours)
   - Create taskStore.ts for task state
   - Create agentStore.ts for agent state
   - Create terminalStore.ts for terminal logs
   - Implement proper state updates and selectors

4. **Create Custom Hooks** (4-5 hours)
   - Refactor useTasks.ts with TanStack Query
   - Create useTaskDetail.ts for single task
   - Refactor useAgents.ts
   - Create useWebSocket.ts for real-time
   - Create useRealtime.ts combining polling + WS

**Deliverables:**
- All type definitions complete
- API services fully functional
- State management stores ready
- Data fetching hooks working

---

### Phase 2: TaskDetail Component (Priority: High)
**Duration:** 2-3 days
**Goal:** Fully functional task detail view with all metadata

#### Tasks:
1. **Create Sub-components** (4-5 hours)
   - Create SubtaskList.tsx
   - Create SubtaskItem.tsx with timing display
   - Create ArtifactList.tsx
   - Create ArtifactItem.tsx with file icons
   - Create TaskMetadata.tsx panel

2. **Enhance TaskDetail.tsx** (4-6 hours)
   - Integrate sub-components
   - Add proper loading skeleton
   - Add error state with retry
   - Add empty states
   - Implement auto-refresh for running tasks

3. **Styling & Polish** (3-4 hours)
   - Create/update TaskDetail.css
   - Match design system (glassmorphism, neon accents)
   - Responsive layout
   - Animation for status changes

4. **Testing** (2-3 hours)
   - Test with various task states
   - Test error scenarios
   - Test empty subtasks/artifacts

**Deliverables:**
- TaskDetail component complete
- All subtask info displayed
- All artifacts listed
- Loading/error states working

---

### Phase 3: TaskList Component (Priority: High)
**Duration:** 2-3 days
**Goal:** Real-time task list with filtering and sorting

#### Tasks:
1. **Create Filter Components** (4-5 hours)
   - Create TaskFilters.tsx container
   - Create StatusFilter.tsx dropdown
   - Create SourceFilter.tsx
   - Create SearchInput.tsx with debounce
   - Create SortDropdown.tsx

2. **Enhance TaskCard.tsx** (3-4 hours)
   - Create TaskStatusBadge.tsx
   - Create TaskProgressBar.tsx with animation
   - Add recent update indicator
   - Add click handler for detail view

3. **Enhance TaskList.tsx** (4-6 hours)
   - Integrate filter components
   - Add real-time updates via WebSocket
   - Implement filtering logic
   - Add sorting functionality
   - Add infinite scroll or pagination

4. **Styling & Polish** (3-4 hours)
   - Create/update TaskList.css
   - Smooth animations for list updates
   - Loading states
   - Empty state design

**Deliverables:**
- TaskList with real-time updates
- Full filtering and sorting
- Progress bars animated
- Status indicators complete

---

### Phase 4: AgentMonitor Component (Priority: Medium-High)
**Duration:** 2 days
**Goal:** Live agent monitoring with statistics

#### Tasks:
1. **Create Agent Sub-components** (3-4 hours)
   - Create AgentStats.tsx for statistics
   - Create RunningAgentList.tsx
   - Create AgentActivityTimeline.tsx
   - Enhance AgentCard.tsx

2. **Enhance AgentMonitor.tsx** (3-4 hours)
   - Integrate new sub-components
   - Add live status updates
   - Implement filtering tabs
   - Add sort controls

3. **Add Statistics** (3-4 hours)
   - Calculate success rates
   - Compute average durations
   - Track task counts
   - Show queue depths

4. **Styling & Polish** (2-3 hours)
   - Update AgentMonitor.css
   - Add pulse animations for running
   - Improve stats visualization

**Deliverables:**
- AgentMonitor with live updates
- Agent statistics displayed
- Running agent list prominent
- Activity timeline visible

---

### Phase 5: NexusTerminal Component (Priority: Medium)
**Duration:** 1-2 days
**Goal:** Rich terminal with activity feed and system status

#### Tasks:
1. **Create Terminal Components** (3-4 hours)
   - Create TerminalHeader.tsx with controls
   - Create TerminalLine.tsx
   - Create TerminalInput.tsx (future use)

2. **Enhance NexusTerminal.tsx** (4-5 hours)
   - Implement activity feed
   - Add system status display
   - Add recent tasks summary
   - Implement scrollback buffer
   - Add auto-scroll control

3. **Integrate WebSocket Events** (2-3 hours)
   - Listen to agent events
   - Listen to task events
   - Format events as terminal lines
   - Add timestamps

4. **Styling & Polish** (2-3 hours)
   - Update NexusTerminal.css
   - Add syntax highlighting for log types
   - Improve readability

**Deliverables:**
- NexusTerminal with activity feed
- System status visible
- Recent tasks shown
- Scrollback working

---

### Phase 6: App.tsx Integration (Priority: Medium)
**Duration:** 1-2 days
**Goal:** Seamless tab switching and global state

#### Tasks:
1. **Enhance Layout** (3-4 hours)
   - Update AppLayout.tsx
   - Add responsive behavior
   - Improve sidebar design
   - Add collapsible sections

2. **Implement State Persistence** (2-3 hours)
   - Preserve selected task on tab switch
   - Sync URL with active tab
   - Add keyboard shortcuts

3. **Add Global Features** (3-4 hours)
   - Add toast notifications
   - Implement global error boundary
   - Add loading overlay
   - Connection status indicator

4. **Polish & Optimization** (2-3 hours)
   - Code cleanup
   - Performance optimization
   - Remove console logs
   - Final styling tweaks

**Deliverables:**
- Smooth tab switching
- State preserved between tabs
- Global notifications
- Responsive design

---

### Phase 7: Testing & Polish (Priority: High)
**Duration:** 2 days
**Goal:** Production-ready quality

#### Tasks:
1. **Integration Testing** (4-6 hours)
   - Test all features together
   - Test WebSocket reconnection
   - Test error scenarios
   - Test with real backend data

2. **Performance Optimization** (3-4 hours)
   - Optimize re-renders
   - Implement virtualization for long lists
   - Optimize WebSocket message handling

3. **Final Polish** (3-4 hours)
   - Fix any visual issues
   - Ensure consistent spacing
   - Verify all animations
   - Dark mode verification

4. **Documentation** (2-3 hours)
   - Update component docs
   - Add inline comments
   - Create usage examples

**Deliverables:**
- All features working together
- No critical bugs
- Performance acceptable
- Code documented

---

## Summary Timeline

| Phase | Duration | Feature |
|-------|----------|---------|
| 1 | 1-2 days | Foundation & Data Layer |
| 2 | 2-3 days | TaskDetail Component |
| 3 | 2-3 days | TaskList Component |
| 4 | 2 days | AgentMonitor Component |
| 5 | 1-2 days | NexusTerminal Component |
| 6 | 1-2 days | App.tsx Integration |
| 7 | 2 days | Testing & Polish |
| **Total** | **11-15 days** | **Complete Implementation** |

---

## Success Criteria

1. ✅ TaskDetail shows complete subtask info (status, agent, stage, timing)
2. ✅ TaskDetail displays all artifacts with file types and paths
3. ✅ TaskDetail has proper loading and error states
4. ✅ TaskList updates in real-time via WebSocket
5. ✅ TaskList has status indicators and animated progress bars
6. ✅ TaskList supports filtering by status, source, date, and search
7. ✅ AgentMonitor shows live status updates
8. ✅ AgentMonitor displays agent statistics
9. ✅ AgentMonitor highlights running agents
10. ✅ NexusTerminal shows agent activity feed
11. ✅ NexusTerminal displays system status
12. ✅ NexusTerminal shows recent tasks
13. ✅ App.tsx allows seamless tab switching between Agents and Tasks
14. ✅ All components match design system (glassmorphism, neon accents)
15. ✅ Responsive design works on different screen sizes
