#!/bin/bash
# NexusAI Frontend Implementation Scheduler
# This script manages the sequential execution of feature development phases

WORKSPACE="/root/.openclaw/workspace/projects/agent-orchestrator-monitor"
STATE_FILE="$WORKSPACE/.cron/implementation_state.json"
LOG_FILE="$WORKSPACE/.cron/implementation.log"
FRONTEND_DIR="$WORKSPACE/frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Initialize state file if it doesn't exist
init_state() {
    if [ ! -f "$STATE_FILE" ]; then
        cat > "$STATE_FILE" << 'EOF'
{
  "currentPhase": 0,
  "totalPhases": 7,
  "phases": [
    {"id": 1, "name": "Foundation & Data Layer", "status": "pending", "startedAt": null, "completedAt": null},
    {"id": 2, "name": "TaskDetail Component", "status": "pending", "startedAt": null, "completedAt": null},
    {"id": 3, "name": "TaskList Component", "status": "pending", "startedAt": null, "completedAt": null},
    {"id": 4, "name": "AgentMonitor Component", "status": "pending", "startedAt": null, "completedAt": null},
    {"id": 5, "name": "NexusTerminal Component", "status": "pending", "startedAt": null, "completedAt": null},
    {"id": 6, "name": "App.tsx Integration", "status": "pending", "startedAt": null, "completedAt": null},
    {"id": 7, "name": "Testing & Polish", "status": "pending", "startedAt": null, "completedAt": null}
  ],
  "overallProgress": 0,
  "startDate": null,
  "estimatedCompletion": null
}
EOF
        log "State file initialized"
    fi
}

# Update phase status
update_phase_status() {
    local phase_id=$1
    local status=$2
    local timestamp=$(date -Iseconds)
    
    node -e "
const fs = require('fs');
const state = JSON.parse(fs.readFileSync('$STATE_FILE', 'utf8'));
const phase = state.phases.find(p => p.id === $phase_id);
if (phase) {
    phase.status = '$status';
    if ('$status' === 'in_progress' && !phase.startedAt) {
        phase.startedAt = '$timestamp';
    }
    if ('$status' === 'completed') {
        phase.completedAt = '$timestamp';
    }
}
// Update overall progress
const completed = state.phases.filter(p => p.status === 'completed').length;
state.overallProgress = Math.round((completed / state.totalPhases) * 100);
fs.writeFileSync('$STATE_FILE', JSON.stringify(state, null, 2));
"
}

# Get current phase
get_current_phase() {
    node -e "
const fs = require('fs');
const state = JSON.parse(fs.readFileSync('$STATE_FILE', 'utf8'));
const current = state.phases.find(p => p.status === 'in_progress');
if (current) {
    console.log(current.id);
} else {
    const pending = state.phases.find(p => p.status === 'pending');
    console.log(pending ? pending.id : '0');
}
"
}

# Mark phase complete and trigger next
complete_phase() {
    local phase_id=$1
    update_phase_status "$phase_id" "completed"
    success "Phase $phase_id completed"
    
    # Check if all phases complete
    local next_phase=$((phase_id + 1))
    if [ "$next_phase" -le 7 ]; then
        log "Triggering Phase $next_phase..."
        # Schedule next phase to run in 5 minutes
        echo "cd $WORKSPACE && bash scripts/implementation/phase_${next_phase}.sh" | at now + 5 minutes 2>/dev/null || {
            warning "at command not available, manual execution required"
            log "Run manually: bash scripts/implementation/phase_${next_phase}.sh"
        }
    else
        success "All phases completed!"
        # Send notification if possible
        if command -v curl &> /dev/null; then
            curl -X POST http://76.13.101.17:4105/api/notifications \
                -H "Content-Type: application/json" \
                -d '{"message":"NexusAI Frontend Implementation Complete!","type":"success"}' 2>/dev/null || true
        fi
    fi
}

# Display status
show_status() {
    log "=== Implementation Status ==="
    node -e "
const fs = require('fs');
const state = JSON.parse(fs.readFileSync('$STATE_FILE', 'utf8'));
console.log('Overall Progress: ' + state.overallProgress + '%');
console.log('');
state.phases.forEach(p => {
    const icon = p.status === 'completed' ? '✅' : p.status === 'in_progress' ? '🔄' : '⏳';
    console.log(icon + ' Phase ' + p.id + ': ' + p.name + ' (' + p.status + ')');
});
"
    log "==========================="
}

# Main execution
case "${1:-status}" in
    init)
        init_state
        log "Implementation scheduler initialized"
        ;;
    status)
        init_state
        show_status
        ;;
    start)
        init_state
        log "Starting implementation from Phase 1..."
        bash "$WORKSPACE/scripts/implementation/phase_1.sh"
        ;;
    next)
        init_state
        current=$(get_current_phase)
        if [ "$current" -gt 0 ] && [ "$current" -lt 7 ]; then
            next=$((current + 1))
            log "Starting Phase $next..."
            bash "$WORKSPACE/scripts/implementation/phase_${next}.sh"
        else
            error "Cannot determine next phase. Current: $current"
        fi
        ;;
    reset)
        rm -f "$STATE_FILE"
        init_state
        log "Implementation state reset"
        ;;
    *)
        echo "Usage: $0 {init|status|start|next|reset}"
        exit 1
        ;;
esac
