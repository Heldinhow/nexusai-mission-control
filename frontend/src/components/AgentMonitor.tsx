import { useState, useEffect, useMemo } from 'react';
import type { Agent, Task } from '../types/index';
import { NexusTerminal } from './NexusTerminal';
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Pause,
  Settings,
  BarChart3
} from 'lucide-react';

export function AgentMonitor({ agents }: { agents: Agent[] }) {
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'running' | 'completed' | 'error'>('all');
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setTasksLoading(true);
      setTasksError(null);
      try {
        const res = await fetch(`http://76.13.101.17:4105/api/tasks?t=${Date.now()}`);
        if (!res.ok) throw new Error('Falha ao carregar tasks');
        const data = await res.json();
        setRecentTasks((data.data || []).slice(0, 10));
      } catch (err) {
        setTasksError('Falha ao carregar tasks');
        console.error(err);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const totalAgents = agents.length;
    const activeAgents = agents.filter(a => a.status === 'running' && a.is_active).length;
    const idleAgents = agents.filter(a => a.status === 'idle' || !a.is_active).length;
    const errorAgents = agents.filter(a => a.status === 'error').length;
    const processingAgents = agents.filter(a => a.status === 'processing').length;
    
    const totalTasks = agents.reduce((acc, a) => acc + (a.task_count || 0), 0);
    
    const taskCounts = {
      pending: recentTasks.filter(t => t.status === 'pending').length,
      running: recentTasks.filter(t => t.status === 'running').length,
      completed: recentTasks.filter(t => t.status === 'completed').length,
      failed: recentTasks.filter(t => t.status === 'failed').length,
    };

    return {
      agents: {
        total: totalAgents,
        active: activeAgents,
        idle: idleAgents,
        error: errorAgents,
        processing: processingAgents,
      },
      tasks: {
        total: totalTasks,
        recent: recentTasks.length,
        ...taskCounts,
      }
    };
  }, [agents, recentTasks]);

  const statusBreakdown = useMemo(() => {
    return {
      running: agents.filter(a => a.status === 'running').length,
      completed: agents.filter(a => a.status === 'completed').length,
      error: agents.filter(a => a.status === 'error').length,
      idle: agents.filter(a => a.status === 'idle').length,
      processing: agents.filter(a => a.status === 'processing').length,
      unknown: agents.filter(a => a.status === 'unknown').length,
    };
  }, [agents]);

  const filteredAgents = agents.filter(a => 
    filter === 'all' ? true : a.status === filter
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'running': 
        return { 
          color: 'text-nexus-success', 
          bg: 'bg-nexus-success/10', 
          border: 'border-nexus-success/30',
          icon: Activity,
          label: 'Executando'
        };
      case 'completed': 
        return { 
          color: 'text-nexus-primary-500', 
          bg: 'bg-nexus-primary-500/10', 
          border: 'border-nexus-primary-500/30',
          icon: CheckCircle2,
          label: 'Concluído'
        };
      case 'error': 
        return { 
          color: 'text-nexus-danger', 
          bg: 'bg-nexus-danger/10', 
          border: 'border-nexus-danger/30',
          icon: AlertCircle,
          label: 'Erro'
        };
      case 'processing': 
        return { 
          color: 'text-nexus-warning', 
          bg: 'bg-nexus-warning/10', 
          border: 'border-nexus-warning/30',
          icon: Settings,
          label: 'Processando'
        };
      case 'idle': 
        return { 
          color: 'text-nexus-text-muted', 
          bg: 'bg-nexus-bg-tertiary', 
          border: 'border-nexus-border',
          icon: Pause,
          label: 'Disponível'
        };
      default: 
        return { 
          color: 'text-nexus-text-secondary', 
          bg: 'bg-nexus-bg-tertiary', 
          border: 'border-nexus-border',
          icon: Clock,
          label: status
        };
    }
  };

  const StatCard = ({ 
    icon: Icon, 
    value, 
    label, 
    sublabel, 
    variant = 'default' 
  }: { 
    icon: React.ElementType;
    value: number | string;
    label: string;
    sublabel?: string;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  }) => {
    const variantStyles = {
      default: 'bg-nexus-bg-secondary border-nexus-border',
      primary: 'bg-nexus-primary-500/10 border-nexus-primary-500/30',
      success: 'bg-nexus-success/10 border-nexus-success/30',
      warning: 'bg-nexus-warning/10 border-nexus-warning/30',
      danger: 'bg-nexus-danger/10 border-nexus-danger/30',
    };

    const iconColors = {
      default: 'text-nexus-text-muted',
      primary: 'text-nexus-primary-500',
      success: 'text-nexus-success',
      warning: 'text-nexus-warning',
      danger: 'text-nexus-danger',
    };

    return (
      <div className={`flex items-center justify-between p-4 rounded-lg border ${variantStyles[variant]}`}>
        <div className="flex flex-col">
          <span className="text-2xl font-bold font-mono text-nexus-text-primary">
            {value}
          </span>
          <span className="text-xs text-nexus-text-secondary uppercase tracking-wider mt-1">
            {label}
          </span>
          {sublabel && (
            <span className="text-xs text-nexus-text-muted mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
        <Icon className={`w-6 h-6 ${iconColors[variant]}`} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          icon={Activity}
          value={stats.agents.active}
          label="Agents Ativos"
          sublabel={`de ${stats.agents.total} total`}
          variant="success"
        />
        <StatCard 
          icon={Pause}
          value={stats.agents.idle}
          label="Disponíveis"
          variant="default"
        />
        <StatCard 
          icon={Settings}
          value={stats.agents.processing}
          label="Processando"
          variant="warning"
        />
        <StatCard 
          icon={AlertCircle}
          value={stats.agents.error}
          label="Erros"
          variant="danger"
        />
        <StatCard 
          icon={BarChart3}
          value={stats.tasks.total}
          label="Total Tasks"
          sublabel="Todos os agents"
          variant="primary"
        />
      </div>

      {/* Status Breakdown */}
      <div className="bg-nexus-bg-secondary border border-nexus-border rounded-lg p-4">
        <h4 className="text-sm font-semibold text-nexus-text-primary mb-3">
          Distribuição de Status
        </h4>
        
        {/* Progress Bar */}
        <div className="flex h-6 rounded-md overflow-hidden bg-nexus-bg-tertiary">
          {statusBreakdown.running > 0 && (
            <div 
              className="bg-nexus-success transition-all duration-300"
              style={{ width: `${(statusBreakdown.running / agents.length) * 100}%` }}
              title={`Executando: ${statusBreakdown.running}`}
            />
          )}
          {statusBreakdown.processing > 0 && (
            <div 
              className="bg-nexus-warning transition-all duration-300"
              style={{ width: `${(statusBreakdown.processing / agents.length) * 100}%` }}
              title={`Processando: ${statusBreakdown.processing}`}
            />
          )}
          {statusBreakdown.idle > 0 && (
            <div 
              className="bg-nexus-text-muted transition-all duration-300"
              style={{ width: `${(statusBreakdown.idle / agents.length) * 100}%` }}
              title={`Disponíveis: ${statusBreakdown.idle}`}
            />
          )}
          {statusBreakdown.completed > 0 && (
            <div 
              className="bg-nexus-primary-500 transition-all duration-300"
              style={{ width: `${(statusBreakdown.completed / agents.length) * 100}%` }}
              title={`Concluídos: ${statusBreakdown.completed}`}
            />
          )}
          {statusBreakdown.error > 0 && (
            <div 
              className="bg-nexus-danger transition-all duration-300"
              style={{ width: `${(statusBreakdown.error / agents.length) * 100}%` }}
              title={`Erros: ${statusBreakdown.error}`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-3">
          <div className="flex items-center gap-2 text-xs text-nexus-text-secondary">
            <span className="w-2 h-2 rounded-full bg-nexus-success" />
            <span>Executando ({statusBreakdown.running})</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-nexus-text-secondary">
            <span className="w-2 h-2 rounded-full bg-nexus-warning" />
            <span>Processando ({statusBreakdown.processing})</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-nexus-text-secondary">
            <span className="w-2 h-2 rounded-full bg-nexus-text-muted" />
            <span>Disponíveis ({statusBreakdown.idle})</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-nexus-text-secondary">
            <span className="w-2 h-2 rounded-full bg-nexus-primary-500" />
            <span>Concluídos ({statusBreakdown.completed})</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-nexus-text-secondary">
            <span className="w-2 h-2 rounded-full bg-nexus-danger" />
            <span>Erros ({statusBreakdown.error})</span>
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-nexus-bg-secondary border border-nexus-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-nexus-text-primary">
              Agents ({filteredAgents.length})
            </h4>
            <div className="flex gap-1">
              {(['all', 'running', 'completed', 'error'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    filter === f
                      ? 'bg-nexus-primary-500/10 text-nexus-primary-500 border border-nexus-primary-500/30'
                      : 'text-nexus-text-secondary hover:bg-nexus-bg-tertiary'
                  }`}
                >
                  {f === 'all' ? 'Todos' : f === 'running' ? 'Ativos' : f === 'completed' ? 'Concluídos' : 'Erros'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredAgents.map(agent => {
              const statusConfig = getStatusConfig(agent.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div 
                  key={agent.id} 
                  className={`p-3 rounded-lg border transition-all cursor-pointer hover:translate-x-1 ${statusConfig.bg} ${statusConfig.border}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                      <span className="font-medium text-nexus-text-primary font-mono text-sm">
                        {agent.name}
                      </span>
                    </div>
                    <span className={`text-xs font-medium uppercase ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 pl-6 text-xs text-nexus-text-muted">
                    <span>{agent.task_count || 0} tasks</span>
                    <span>{agent.updated_at ? new Date(agent.updated_at).toLocaleTimeString('pt-BR') : '-'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Terminal */}
        <div className="bg-nexus-bg-secondary border border-nexus-border rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-nexus-danger" />
                <span className="w-2.5 h-2.5 rounded-full bg-nexus-warning" />
                <span className="w-2.5 h-2.5 rounded-full bg-nexus-success" />
              </div>
              <span className="text-xs text-nexus-text-muted font-mono ml-2">terminal</span>
            </div>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            <NexusTerminal 
              agents={agents} 
              recentTasks={recentTasks}
              tasksLoading={tasksLoading}
              tasksError={tasksError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentMonitor;
