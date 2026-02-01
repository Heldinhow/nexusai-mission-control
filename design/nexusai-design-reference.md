# Design Reference: NexusAI Agent Orchestrator

**Source**: Landing page/dashboard design shared by user  
**Project**: Agent Orchestrator Monitoring Frontend  
**Date**: 2026-02-01

---

## Design Overview

Modern dark-themed dashboard for AI agent orchestration with cyberpunk/tech aesthetics. Features a command-center interface with real-time monitoring capabilities.

### Color Palette

**Primary Colors:**
- Background: Dark navy/black (`#0a0a0f` or similar)
- Card backgrounds: Slightly lighter dark (`#12121a`)
- Primary accent: Cyan/Teal (`#00d4ff` or similar)
- Secondary accent: Purple (`#7c3aed` or similar)
- Success: Green (`#10b981`)
- Warning: Yellow/Orange (`#f59e0b`)
- Error: Red (`#ef4444`)

**Text Colors:**
- Primary text: White/light gray (`#ffffff`, `#e2e8f0`)
- Secondary text: Muted gray (`#94a3b8`, `#64748b`)
- Accent text: Cyan (`#00d4ff`)

### Typography

- **Font Family**: Monospace/tech font for headers (JetBrains Mono, Fira Code, or similar)
- **Body**: Clean sans-serif (Inter, Roboto, or system fonts)
- **Terminal**: Strict monospace (SF Mono, Consolas)

---

## Layout Structure

### Navigation (Sidebar)

```
┌─────────────────────────────────────────┐
│  NEXUS AI                              │
│                                        │
│  Overview    ← Active                  │
│  Agents                                  │
│  Analytics                               │
│  Settings                                │
│  Logs                                    │
│                                        │
│  [Status: Connected]                   │
│  UTC 14:32:07                          │
└─────────────────────────────────────────┘
```

**Items:**
- Overview (dashboard home)
- Agents (agent list)
- Analytics (metrics/charts)
- Settings (configuration)
- Logs (live log stream)

### Header/Hero Section (Landing Page Style)

```
┌─────────────────────────────────────────────────────────────┐
│  NexusAI                              Features Dashboard   │
│                                                            │
│  Get Started                                               │
│  v2.0 Now Available                                        │
│                                                            │
│  AI-Agent                                                  │
│  Orchestration                                             │
│                                                            │
│  Deploy, manage, and scale autonomous AI agents...         │
│                                                            │
│  [Launch Platform]  [Watch Demo]                           │
│                                                            │
│  10K+      99.9%      50ms       500+                      │
│  Active    Uptime     Latency    Enterprises               │
│  Agents                                                        │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard Main Content

#### Top Stats Cards (4-column grid)

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Agent Status    │ │ Total Requests  │ │ Avg Response    │ │ Success Rate    │
│                 │ │                 │ │                 │ │                 │
│ Active 24       │ │ 2.4M            │ │ 47ms            │ │ 99.97%          │
│ Idle 8          │ │ +12.5%          │ │ -3ms            │ │ +0.02%          │
│ Processing 12   │ │ from last hour  │ │ improvement     │ │ from baseline   │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

**Card Design:**
- Dark background with subtle border
- Accent color indicator (left border or top)
- Large metric number
- Trend indicator with color (↑ green, ↓ red)
- Context label

#### Main Chart Area

```
┌─────────────────────────────────────────────────────────────┐
│ Request Volume (Last 24h)                          [Live]   │
│                                                             │
│    │                                                        │
│ 2M │    ╱╲                                                  │
│    │   ╱  ╲    ╱╲                                          │
│ 1M │  ╱    ╲  ╱  ╲    ╱╲                                   │
│    │ ╱      ╲╱    ╲  ╱  ╲                                  │
│  0 │╱              ╲╱    ╲                                 │
│    └────────────────────────────────────────────────────   │
│    00:00    06:00    12:00    18:00    23:59               │
└─────────────────────────────────────────────────────────────┘
```

**Chart Features:**
- Time-series line/area chart
- Gradient fill under line
- Hover tooltips
- Time range selector
- "Live" indicator badge

#### Live Logs Panel

```
┌─────────────────────────────────────────────────────────────┐
│ Live Logs                                          [Export] │
│                                                             │
│ 14:31:58 INFO  Agent-7 completed task #2847                 │
│ 14:31:55 DEBUG Load balancer redistributed 3 agents         │
│ 14:31:52 AGENT Agent-12 initialized new workflow            │
│ 14:31:48 INFO  API gateway received batch request           │
│ 14:31:45 WARN  High latency detected on node-3              │
│                                                             │
│ [Auto-scroll active]                                        │
└─────────────────────────────────────────────────────────────┘
```

**Log Entry Format:**
```
[TIMESTAMP] [LEVEL] [AGENT-ID] [MESSAGE]
```

**Log Level Colors:**
- INFO: Cyan/Blue
- DEBUG: Gray
- WARN: Yellow/Orange
- ERROR: Red
- AGENT: Purple (custom for agent events)

---

## Key UI Components

### 1. Agent Status Cards

```
┌────────────────────┐
│ ● Active           │  ← Green dot indicator
│                    │
│ 24                 │  ← Large number
│                    │
│ Processing tasks   │  ← Description
└────────────────────┘
```

### 2. Terminal/Console Display

```
┌──────────────────────────────────────┐
│ nexus-terminal — bash — 80x24       │
│                                      │
│ Last login: from 192.168.1.100      │
│ $ ./nexus-init --secure --verbose   │
│                                      │
│ [Initializing...]                    │
│ ✓ Secure connection established      │
│ ✓ Agent registry online              │
│ ✓ Load balancer active               │
│                                      │
│ $                                    │
└──────────────────────────────────────┘
```

**Features:**
- Monospace font
- Command prompt style
- Syntax highlighting (optional)
- Scrollback buffer
- Copy-to-clipboard button

### 3. Feature Cards (Landing Page)

```
┌────────────────────┐
│                    │
│    [Icon]          │
│                    │
│ Auto-Scaling       │
│                    │
│ Dynamically scale  │
│ your agent fleet...│
│                    │
│ Learn more →       │
└────────────────────┘
```

**Features Listed:**
1. Auto-Scaling - Dynamic scaling based on workload
2. Enterprise Security - Encryption, RBAC, compliance
3. Real-time Analytics - Performance metrics, insights
4. Universal Integration - 100+ platforms, webhooks, SDKs
5. Visual Workflow - Drag-and-drop interface
6. Custom Agents - Python SDK for custom agents

### 4. Agent Table/List (Inferred)

```
┌─────────────────────────────────────────────────────────────┐
│ Agents                                             [Filter] │
│                                                             │
│ ID       NAME           STATUS      TASK       UPTIME │
│ ────────────────────────────────────────────────────────── │
│ AG-001  DocumentParser  ● Active   #2847       2h 34m  │
│ AG-002  CodeAnalyzer    ● Idle     -           5h 12m  │
│ AG-003  DataProcessor   ◐ Processing #2848     1h 45m  │
│ AG-004  APIWorker       ● Error    FAILED      3h 22m  │
│                                                             │
│ [← Prev] Page 1 of 5 [Next →]                               │
└─────────────────────────────────────────────────────────────┘
```

**Table Features:**
- Sortable columns
- Status indicators (colored dots)
- Row hover effects
- Action buttons (View, Kill, Restart)
- Pagination

### 5. Kill Switch Button (Critical Safety)

```
┌────────────────────┐
│ ⚠ KILL AGENT       │  ← Red background, warning icon
└────────────────────┘

On Click:
┌──────────────────────────────────────┐
│ ⚠ Terminate Agent AG-003?           │
│                                      │
│ This will immediately stop the agent │
│ and all spawned children (3 total).  │
│                                      │
│ Type "AG-003" to confirm:            │
│ [________________]                   │
│                                      │
│ [Cancel]  [Terminate Permanently]    │
└──────────────────────────────────────┘
```

**Design Requirements:**
- Red color scheme (#dc2626, #991b1b)
- Warning icon
- Modal confirmation
- Type-to-confirm pattern
- Clear consequences description

### 6. Connection Status Indicator

```
┌─────────┐
│ ● Live  │  ← Green pulsing dot
└─────────┘

┌─────────┐
│ ○ Disconnected │  ← Gray
└─────────┘
```

**States:**
- Connected: Green pulsing dot "Live"
- Reconnecting: Yellow spinning icon "Reconnecting..."
- Disconnected: Red "Disconnected"

---

## Responsive Breakpoints

- **Desktop**: 1440px+ (full layout)
- **Laptop**: 1024px - 1439px (collapsed sidebar optional)
- **Tablet**: 768px - 1023px (hamburger menu, stacked cards)
- **Mobile**: < 768px (single column, essential metrics only)

---

## Animation & Micro-interactions

### Required Animations
1. **Live indicator**: Pulsing green dot (subtle, 2s cycle)
2. **Log scroll**: Smooth auto-scroll with new entries
3. **Chart updates**: Smooth line transitions
4. **Status changes**: Color fade transitions
5. **Card hover**: Subtle lift/shadow effect
6. **Kill switch**: Shake on invalid confirmation

### Hover States
- Cards: Slight elevation increase, border highlight
- Table rows: Background color shift
- Buttons: Brightness/contrast change
- Links: Underline or color change

---

## Icons (Recommended Sets)

- **Lucide React**: Clean, modern, consistent
- **Heroicons**: Tailwind-friendly
- **Phosphor Icons**: Weight variations

**Key Icons Needed:**
- Activity/Pulse (live indicator)
- Terminal (logs)
- Cpu/Server (agents)
- BarChart (analytics)
- Settings/Gear (settings)
- AlertTriangle (kill switch)
- Check/Cross (status)
- ChevronDown/Up (expand/collapse)
- Search (filter)
- Refresh (reload)

---

## Tailwind Configuration Reference

```javascript
// tailwind.config.js additions
module.exports = {
  theme: {
    extend: {
      colors: {
        nexus: {
          bg: '#0a0a0f',
          card: '#12121a',
          border: '#1e1e2e',
          accent: '#00d4ff',
          purple: '#7c3aed',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00d4ff20' },
          '100%': { boxShadow: '0 0 20px #00d4ff40' },
        }
      }
    }
  }
}
```

---

## Component Implementation Priority

### Phase 1: Core UI (Setup)
1. Layout shell (sidebar + main content)
2. Header with navigation
3. Status cards (Agent Status, Requests, Response, Success Rate)
4. Basic styling and theme

### Phase 2: Dashboard (MVP)
1. Agent list table
2. Live logs panel
3. Connection status indicator
4. Request volume chart

### Phase 3: Advanced Features
1. Agent detail view
2. Kill switch modal
3. Cost/metrics panels
4. Graph visualization

### Phase 4: Polish
1. Animations and transitions
2. Responsive breakpoints
3. Dark mode optimization
4. Terminal/console visual effects

---

## Implementation Notes

1. **Use CSS Grid/Flexbox** for layout (not floats)
2. **CSS Variables** for theme colors (easy dark mode)
3. **SVG Icons** for crisp rendering at any size
4. **CSS Animations** for live indicator (not JS)
5. **Intersection Observer** for scroll-based effects
6. **CSS Backdrop Filter** for glassmorphism effects (optional)

---

## References

- **Design System**: Similar to Vercel Dashboard, GitHub Dark Mode
- **Typography**: JetBrains Mono (code), Inter (UI)
- **Color Inspiration**: Cyberpunk 2077 UI, Tron Legacy
- **Layout**: Grafana Dashboards, Datadog, New Relic
