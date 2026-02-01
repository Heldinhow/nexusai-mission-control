# Cost Integration Patterns Research Report

## Decision: Recommended Architecture for Cost Integration

### Core Architecture: Hierarchical Cost Module with Tiered Caching

**Recommended Pattern**: A **two-tier data fetching strategy** with hierarchical cost aggregation:

1. **Primary View**: Show cost summary cards for parent agents with expandable drill-down for children
2. **Secondary View**: Full recursive cost rollup displayed in side panel or modal on demand
3. **Real-time Updates**: 30-second polling with optimistic UI and stale-while-revalidate caching

**Data Flow Architecture**:
```
┌─────────────────────────────────────────────────────────────┐
│                     Cost Data Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Tier 1: Hot Cache (30s TTL)                                  │
│  - Aggregated parent costs                                     │
│  - High-frequency agents                                       │
│                                                               │
│  Tier 2: Warm Cache (5min TTL)                                │
│  - Full hierarchy with recursive rollups                       │
│  - On-demand fetched, cached post-fetch                        │
│                                                               │
│  Tier 3: Cold Storage                                         │
│  - Historical cost trends                                      │
│  - Pre-aggregated by day/week                                  │
└─────────────────────────────────────────────────────────────┘
```

## Rationale: Performance and UX Considerations

### 1. Why Hierarchical Display with Lazy Drill-Down?

**Research Findings**:
- Roll-up dashboards in multi-subsidiary enterprises use **progressive disclosure** (Aufait UX, 2025)
- Smashing Magazine research (2025) emphasizes "Delta Indicators and Trend Sparklines" for rapid comprehension under pressure
- Carbon Design System recommends grouping into cards to improve scannability

**Justification for Agent Orchestrator**:
- Parent agents (5 levels deep, 50 total per constitution) need immediate visibility
- Full recursive rollup for 50 agents is computationally expensive (violates 3-second render target)
- Drill-down pattern allows users to request detailed rollups only when needed
- Reduces cognitive load by showing summary first, details on demand

### 2. Why Tiered Caching Strategy?

**Research Findings**:
- LLM cost tracking systems (Medium, 2025) emphasize: "Every call is measured, but not every call needs real-time display"
- ByteByteGo (2025) recommends cache-aside pattern for read-heavy, write-occasional data
- AWS cost dashboards use pre-aggregated tables for instant executive access

**Justification**:
- Cost data is "expensive to fetch" (clawdbot-cost-tracker API likely has latency)
- 30-second freshness requirement is stricter than 5-minute typical for cost data
- **Stale-while-revalidate** provides immediate display while fetching fresh data in background
- **Accuracy within 5%** (constitution requirement) allows cached data with periodic refresh

### 3. Why Optimistic UI with Skeletons?

**Research Findings**:
- Smashing Magazine (2025): "Skeleton UIs reduce anxiety and show system is working"
- DEV Community (2025): "Build for the worst, deliver the best" - handle offline gracefully
- Replace spinners with skeletons showing expected data structure

**Justification**:
- Users see immediate layout with placeholder content
- Cost metrics update smoothly when fresh data arrives
- Reduces perceived latency during 30-second refresh cycles

## Alternatives Considered

### Alternative 1: Always-Full Recursive Rollup
**Rejected**: Violates 3-second render target for 50 agents × 5 levels. Would require pre-computation at the API layer, shifting complexity.

### Alternative 2: Simple Polling Without Caching
**Rejected**: Expensive API calls every 30 seconds for all agents would overwhelm clawdbot-cost-tracker and violate "expensive to fetch" constraint.

### Alternative 3: WebSocket Real-Time Push
**Considered but deferred**: WebSocket provides true real-time but adds infrastructure complexity. Can be added later as optimization. Initial implementation uses 30-second polling as specified.

### Alternative 4: Event-Driven Cost Updates
**Considered**: Push updates when cost changes exceed threshold. Rejected because token consumption is continuous, not event-driven, and 30-second batching is sufficient for operational monitoring.

## Implementation Notes

### Data Fetching Patterns

#### Primary Cost Fetch (Hot Path)
```typescript
// React Query pattern for hot cache
const useAgentCostSummary = (agentId: string) => {
  return useQuery({
    queryKey: ['cost', 'summary', agentId],
    queryFn: () => fetchCostSummary(agentId),
    staleTime: 30000, // 30 seconds
    cacheTime: 60000, // 1 minute
    refetchInterval: 30000, // 30 second polling
    placeholderData: keepPreviousData, // Show stale while fetching
  });
};
```

#### Recursive Rollup Fetch (Warm Path)
```typescript
// On-demand hierarchical fetch
const useAgentCostHierarchy = (agentId: string) => {
  return useQuery({
    queryKey: ['cost', 'hierarchy', agentId],
    queryFn: () => fetchRecursiveRollup(agentId),
    staleTime: 300000, // 5 minutes
    enabled: false, // Manual trigger via drill-down
  });
};
```

### UI Patterns for Token & Cost Display

#### Pattern 1: Compact Cost Cards (Primary View)
```
┌────────────────────────────────────┐
│ Agent Alpha                     [▼]│
│                                    │
│  💰 $12.45      🪙 4.2K tokens     │
│  ↑ +$3.20      ↑ +1.2K (30s)      │
│  [Self: $2.10] [Children: $10.35] │
└────────────────────────────────────┘
```
- **Delta indicators** show change since last refresh (green/red arrows)
- **Sparkline** next to cost shows 5-minute trend
- **Self vs Children** breakdown visible without drill-down

#### Pattern 2: Hierarchical Tree (Drill-Down View)
```
📁 Agent Alpha........................$12.45
   ├─ 👤 Self........................$2.10
   ├─ 📁 Child A.....................$4.50
   │   ├─ 👤 Self....................$1.20
   │   └─ 📁 Grandchild..............$3.30
   └─ 📁 Child B.....................$5.85
```
- **Recursive display** with collapsible nodes
- **Dot leaders** align costs for easy scanning
- **Icons** distinguish self (👤) from group (📁)

#### Pattern 3: Token Breakdown
```
Tokens: 4,237
├─ Input:  3,210 (76%)  ████████████░░
└─ Output: 1,027 (24%)  ████░░░░░░░░░░
```
- **Visual percentage bars** for quick ratio understanding
- **Absolute numbers** for precision
- **Hover tooltip** shows exact count and model breakdown

### Handling Missing/Unavailable Cost Data

**Graded Degradation Strategy** (based on Smashing Magazine resilient UI patterns):

| Scenario | UX Treatment | Visual Indicator |
|----------|-------------|------------------|
| Cost data loading | Skeleton placeholder | Gray pulse animation |
| Cost data stale (>30s) | Show cached value with timestamp | "Updated 45s ago" |
| Cost API unavailable | Show last known + error notice | Yellow banner "Cost data unavailable" |
| Agent has no cost tracker | Hide cost section entirely | No visual presence |
| Partial data (some children) | Show available + "..." indicator | Grayed incomplete row |
| Cost exceeds threshold | Highlight in red with alert badge | 🔴 $150.00 [ALERT] |

**Key Principles**:
1. **Never block** the entire dashboard for cost data issues
2. **Transparency**: Always show data freshness timestamp
3. **Graceful fallback**: Cached data is better than no data
4. **Progressive enhancement**: Add cost display only when data available

### Visualization Patterns for Cost Trends

#### Pattern 1: Sparkline with Current Value
```
Cost Trend (1h)
$12.45    ╭╮    ╭╮
          ╯╰╮  ╭╯╰╮
            ╰──╯
```
- Compact 20px height sparkline
- No axes for minimal visual noise
- Color-coded: green if under budget, red if over threshold

#### Pattern 2: Comparative Bar Chart
```
Agent Cost Comparison (Current Session)
Alpha     ████████████████████ $12.45
Beta      ████████████ $8.20
Gamma     ██████ $4.10
Delta     ██ $1.50
```
- Horizontal bars for easy agent name scanning
- Sorted descending by default
- Truncation indicator if >5 agents shown

#### Pattern 3: Time-Series with Anomaly Detection
```
Cost Over Time (Last 24h)
$   ╭╮      ╭╮        ╭╮
15  ││  ╭╮  ││   ╭╮   ││ ← Alert threshold
    ││  ││ ╭╯│╮  ││  ╭╯│
10  │╰╮╭╯│╭╯ ││╭╮││╭╮│ │
    │ ││ ││  │││││││││ │
 5  ╰─╯╰─╯╰──╯╰╯╰╯╰╯╰─╯
    00 06 12 18 00
```
- Anomaly markers when cost spikes above baseline
- Baseline calculated from 7-day rolling average
- Interactive: click spike to see what agent caused it

### Threshold Alerting Patterns

#### Budget-Based Alerts
```typescript
type CostAlert = {
  agentId: string;
  severity: 'warning' | 'critical';
  type: 'budget_threshold' | 'spike_detection' | 'anomaly';
  message: string;
  currentCost: number;
  threshold: number;
  recommendedAction: string;
};
```

**Alert Triggers** (based on AWS Budgets vs Cost Explorer patterns):

1. **Percentage of Budget**:
   - Warning at 80% of daily budget
   - Critical at 100% of daily budget
   - Show projected end-of-day cost if current rate continues

2. **Spike Detection**:
   - 3× the 7-day average hourly cost
   - Minimum 30-minute sustained spike (avoid noise)
   - Compare to parent/peer agents (is this agent an outlier?)

3. **Anomaly Detection**:
   - Statistical outlier using standard deviation
   - Seasonal adjustment (account for time-of-day patterns)

#### Alert UI Patterns

**Inline Alert Badge** (for agent cards):
```
┌────────────────────────────────────┐
│ Agent Alpha                    [⚠️]│  ← Yellow warning
│ 💰 $145.00 / $150.00 budget        │
│ 🔴 Critical: 97% of daily budget   │
└────────────────────────────────────┘
```

**Global Alert Banner** (for system-wide issues):
```
┌────────────────────────────────────────────────┐
│ ⚠️  3 agents approaching budget limits         │
│     View details →                             │
└────────────────────────────────────────────────┘
```

**Toast Notification** (for real-time threshold breach):
```
┌────────────────────────────────────┐
│ 🔴 Cost Alert                      │
│ Agent "Gamma" exceeded $50 budget  │
│ Current: $52.30                    │
│ [View] [Dismiss]                   │
└────────────────────────────────────┘
```

### Caching Strategy Implementation

#### React Query Configuration
```typescript
// Global cost query configuration
export const costQueryConfig = {
  // Hot cache: Always visible cost summaries
  summary: {
    staleTime: 30000,    // 30 seconds
    cacheTime: 120000,   // 2 minutes
    refetchInterval: 30000, // 30 second polling
    refetchIntervalInBackground: true,
    placeholderData: keepPreviousData,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  
  // Warm cache: Hierarchical rollups
  hierarchy: {
    staleTime: 300000,   // 5 minutes
    cacheTime: 600000,   // 10 minutes
    enabled: false,      // Manual trigger
    retry: 2,
  },
  
  // Cold storage: Historical trends
  history: {
    staleTime: 3600000,  // 1 hour
    cacheTime: 86400000, // 24 hours
    retry: 1,
  },
};
```

#### Cache Invalidation Strategy
```typescript
// Invalidate on agent state changes
const invalidateCostCache = (agentId: string) => {
  queryClient.invalidateQueries({
    queryKey: ['cost', 'summary', agentId],
    exact: false,
  });
};

// Background refetch on focus
const useCostOnFocus = () => {
  useEffect(() => {
    const handleFocus = () => {
      queryClient.refetchQueries({
        queryKey: ['cost'],
        type: 'active',
      });
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
};
```

### Contract Testing Requirements

Per constitution: "Cost integration requires contract tests with clawdbot-cost-tracker API mocks"

**Test Scenarios**:

1. **Happy Path**:
   - Mock returns valid cost data with input/output tokens
   - Verify UI displays formatted costs correctly
   - Verify recursive rollup math (parent = self + sum(children))

2. **Partial Data**:
   - Mock returns cost for parent but some children missing
   - Verify UI handles gracefully with "..." indicators
   - Verify warning shown for incomplete data

3. **API Unavailable**:
   - Mock returns 503/504 errors
   - Verify cached data displayed with stale timestamp
   - Verify retry mechanism with exponential backoff
   - Verify error banner appears after max retries

4. **Malformed Data**:
   - Mock returns invalid JSON, negative costs, missing fields
   - Verify error boundary catches without crashing dashboard
   - Verify fallback to "Cost unavailable" state

5. **Threshold Alerts**:
   - Mock returns cost at 95% of budget
   - Verify warning badge appears
   - Mock returns cost at 105% of budget
   - Verify critical alert with notification

### Performance Targets

Per constitution requirements:

| Metric | Target | Implementation Strategy |
|--------|--------|------------------------|
| Dashboard load | <3s for 100 agents | Parallel fetch + skeleton UI |
| Cost data freshness | 30 seconds | Polling with stale-while-revalidate |
| Recursive rollup render | <3s for 50 agents | Lazy load on drill-down only |
| Cost accuracy | Within 5% | Cache tolerance acceptable |
| Alert latency | <60s from threshold breach | 30s polling + 30s processing |

### Summary

The recommended architecture prioritizes:

1. **Performance**: Tiered caching reduces API load and meets 3-second render targets
2. **UX Clarity**: Hierarchical drill-down prevents cognitive overload
3. **Resilience**: Graded degradation handles API failures gracefully
4. **Real-time**: 30-second polling with optimistic UI satisfies freshness requirements
5. **Accuracy**: 5% tolerance allows smart caching without compromising usefulness

This design satisfies all constitutional requirements while providing room for future optimization (WebSocket push, predictive pre-fetching) without breaking changes.

---

**References**:
- Aufait UX (2025): Roll-Up Dashboard Design for Multi-Subsidiary Enterprises
- Smashing Magazine (2025): From Data To Decisions: UX Strategies For Real-Time Dashboards
- ByteByteGo (2025): A Guide to Top Caching Strategies
- Medium/Codastra (2025): LLM Cost Dashboards for Backends
- DEV Community (2025): Designing a Resilient UI
- AWS Cost Management Docs: Dashboards and Cost Explorer patterns
- Datadog Cloud Cost Monitor: Alerting patterns
- Carbon Design System: Empty States and Error Handling