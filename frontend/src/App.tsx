import { useState, useEffect } from 'react';
import type { Agent, Task } from './types/index';
import { TaskList } from './components/TaskList';
import { TaskDetail } from './components/TaskDetail';
import { AgentMonitor } from './components/AgentMonitor';
import { LiveIndicator } from './components/LiveIndicator';
import { useMissions } from './hooks/useMissions';
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Users,
  FileText,
  Zap
} from 'lucide-react';
import './index.css';

function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'agents' | 'tasks'>('agents');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useMissions();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch(`http://76.13.101.17:4105/api/agents?t=${Date.now()}`);
        const data = await res.json();
        setAgents(data.data || []);
        setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
      } catch (err) {
        console.error('Falha ao carregar agents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
    const interval = setInterval(fetchAgents, 2000);
    return () => clearInterval(interval);
  }, []);

  const runningCount = agents.filter(a => a.status === 'running').length;
  const completedCount = agents.filter(a => a.status === 'completed').length;
  const errorCount = agents.filter(a => a.status === 'error').length;
  const idleCount = agents.filter(a => a.status === 'idle').length;
  const unknownCount = agents.filter(a => a.status === 'unknown').length;

  return (
    <div className="min-h-screen bg-nexus-bg-primary text-nexus-text-primary font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-nexus-bg-secondary border-b border-nexus-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-nexus-primary-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-nexus-text-primary">
                  Nexus AI
                </span>
                <span className="hidden sm:inline text-xs text-nexus-text-muted ml-2">
                  Mission Control
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4">
              <LiveIndicator connected={true} />
              <span className="text-xs text-nexus-text-muted">
                Atualizado: {lastUpdate || '...'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="pt-16 min-h-screen flex">
        {/* Sidebar */}
        <aside className="w-64 bg-nexus-bg-secondary border-r border-nexus-border flex-shrink-0 hidden md:flex flex-col">
          <div className="p-4 flex-1">
            {/* Navigation */}
            <nav className="space-y-1">
              <button
                onClick={() => { setActiveTab('agents'); setSelectedTask(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'agents'
                    ? 'bg-nexus-primary-500/10 text-nexus-primary-500'
                    : 'text-nexus-text-secondary hover:bg-nexus-bg-tertiary hover:text-nexus-text-primary'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Agents</span>
              </button>

              <button
                onClick={() => { setActiveTab('tasks'); setSelectedTask(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'tasks'
                    ? 'bg-nexus-primary-500/10 text-nexus-primary-500'
                    : 'text-nexus-text-secondary hover:bg-nexus-bg-tertiary hover:text-nexus-text-primary'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Tasks</span>
              </button>
            </nav>

            {/* Stats Summary */}
            <div className="mt-8 pt-6 border-t border-nexus-border">
              <h3 className="text-xs font-semibold text-nexus-text-muted uppercase tracking-wider mb-3">
                Status dos Agents
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-nexus-success" />
                    <span className="text-nexus-text-secondary">Executando</span>
                  </div>
                  <span className="font-mono font-medium">{runningCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-nexus-primary-500" />
                    <span className="text-nexus-text-secondary">Concluídos</span>
                  </div>
                  <span className="font-mono font-medium">{completedCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-nexus-danger" />
                    <span className="text-nexus-text-secondary">Erros</span>
                  </div>
                  <span className="font-mono font-medium">{errorCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-nexus-text-muted" />
                    <span className="text-nexus-text-secondary">Disponíveis</span>
                  </div>
                  <span className="font-mono font-medium">{idleCount}</span>
                </div>
                {unknownCount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-nexus-warning/20 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-nexus-warning"></span>
                      </span>
                      <span className="text-nexus-text-secondary">Desconhecidos</span>
                    </div>
                    <span className="font-mono font-medium">{unknownCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64 text-nexus-text-secondary">
                Carregando...
              </div>
            ) : selectedTask ? (
              <TaskDetail task={selectedTask} onBack={() => setSelectedTask(null)} />
            ) : activeTab === 'agents' ? (
              <AgentMonitor agents={agents} />
            ) : (
              <TaskList onSelectTask={setSelectedTask} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
