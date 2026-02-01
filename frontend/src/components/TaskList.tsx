import { useState, useEffect, useMemo } from 'react'
import type { Task } from '../types/index'
import { TaskDetail } from './TaskDetail'
import { RefreshCw, X, Search } from 'lucide-react'

type TaskStatus = 'all' | 'pending' | 'running' | 'completed' | 'failed'

export function TaskList({ onSelectTask }: { onSelectTask?: (task: Task) => void }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<TaskStatus>('all')
  const [searchText, setSearchText] = useState('')

  const fetchTasks = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`http://76.13.101.17:4105/api/tasks?t=${Date.now()}`)
      if (!res.ok) throw new Error('Failed to fetch tasks')
      const data = await res.json()
      setTasks(data.data || [])
    } catch (err) {
      setError('Falha ao carregar tarefas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 5000)
    return () => clearInterval(interval)
  }, [])

  // Apply filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false
      }
      
      // Text search filter
      if (searchText.trim()) {
        const search = searchText.toLowerCase()
        const messageMatch = (task.user_message || task.message || '').toLowerCase().includes(search)
        const idMatch = task.id.toLowerCase().includes(search)
        const agentMatch = (task.agent_name || '').toLowerCase().includes(search)
        const sourceMatch = (task.source || '').toLowerCase().includes(search)
        
        if (!messageMatch && !idMatch && !agentMatch && !sourceMatch) {
          return false
        }
      }
      
      return true
    })
  }, [tasks, statusFilter, searchText])

  // Get task counts by status
  const statusCounts = useMemo(() => ({
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    running: tasks.filter(t => t.status === 'running').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
  }), [tasks])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-nexus-success'
      case 'running': return 'bg-nexus-info'
      case 'failed': return 'bg-nexus-danger'
      default: return 'bg-nexus-text-muted'
    }
  }

  if (selectedTask) {
    return <TaskDetail task={selectedTask} onBack={() => setSelectedTask(null)} />
  }

  return (
    <div className="bg-nexus-bg-secondary rounded-xl p-4 max-h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-nexus-text-primary font-semibold text-base">Tarefas</h3>
        <button 
          className="bg-nexus-bg-tertiary hover:bg-nexus-border text-nexus-accent-400 p-2 rounded-lg transition-colors duration-150"
          onClick={fetchTasks}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-nexus-text-muted text-xs font-medium">
            Status:
          </label>
          <select 
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus)}
            className="bg-nexus-bg-tertiary border border-nexus-border text-nexus-text-secondary px-3 py-1.5 rounded-md text-xs cursor-pointer outline-none focus:border-nexus-primary-500 hover:border-nexus-primary-500 transition-colors"
          >
            <option value="all">Todas ({statusCounts.all})</option>
            <option value="pending">Pendentes ({statusCounts.pending})</option>
            <option value="running">Executando ({statusCounts.running})</option>
            <option value="completed">Concluídas ({statusCounts.completed})</option>
            <option value="failed">Falhas ({statusCounts.failed})</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 flex-1 min-w-48 relative">
          <label htmlFor="search-input" className="text-nexus-text-muted text-xs font-medium">
            Buscar:
          </label>
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nexus-text-muted" />
            <input
              id="search-input"
              type="text"
              placeholder="Mensagem, ID, agente..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-nexus-bg-tertiary border border-nexus-border text-nexus-text-secondary pl-8 pr-8 py-1.5 rounded-md text-xs w-full outline-none focus:border-nexus-primary-500 hover:border-nexus-primary-500 placeholder-nexus-text-muted transition-colors"
            />
            {searchText && (
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none text-nexus-text-muted hover:text-nexus-danger cursor-pointer p-1 rounded transition-colors"
                onClick={() => setSearchText('')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex justify-between items-center text-nexus-text-muted text-xs mb-3 pb-2 border-b border-nexus-bg-tertiary">
        <span>Mostrando {filteredTasks.length} de {tasks.length} tarefas</span>
        {(statusFilter !== 'all' || searchText) && (
          <button 
            className="bg-transparent border border-nexus-border text-nexus-accent-400 px-2.5 py-1 rounded text-xs cursor-pointer hover:bg-nexus-bg-tertiary hover:border-nexus-accent-400 transition-colors"
            onClick={() => {
              setStatusFilter('all')
              setSearchText('')
            }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {loading && tasks.length === 0 ? (
        <div className="text-nexus-text-muted text-center py-10">Carregando tarefas...</div>
      ) : error ? (
        <div className="text-nexus-danger text-center py-10">
          {error}
          <button 
            className="mt-3 px-4 py-2 bg-nexus-bg-tertiary border-none rounded-md text-nexus-accent-400 cursor-pointer hover:bg-nexus-border transition-colors"
            onClick={fetchTasks}
          >
            Tentar novamente
          </button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-nexus-text-muted text-center py-10">
          {tasks.length === 0 
            ? 'Nenhuma tarefa encontrada' 
            : 'Nenhuma tarefa corresponde aos filtros'}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto flex flex-col gap-3">
          {filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className="bg-nexus-bg-tertiary rounded-lg p-3 cursor-pointer transition-all duration-150 border border-transparent hover:border-nexus-primary-500 hover:translate-x-1"
              onClick={() => {
                setSelectedTask(task)
                onSelectTask?.(task)
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                <span className="text-nexus-text-muted text-2xs font-mono">{task.id.slice(0, 8)}</span>
                <span className="bg-nexus-bg-primary px-2 py-0.5 rounded text-2xs text-nexus-accent-400 ml-auto">
                  {task.source}
                </span>
                {task.agent_name && (
                  <span className="bg-nexus-bg-secondary px-2 py-0.5 rounded text-2xs text-nexus-text-muted border border-nexus-border">
                    {task.agent_name}
                  </span>
                )}
              </div>
              <div className="text-nexus-text-secondary text-sm mb-2 leading-relaxed">
                {task.user_message || task.message}
              </div>
              <div className="flex justify-between items-center text-xs text-nexus-text-muted">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 bg-nexus-bg-primary rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getStatusColor(task.status)}`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span>{task.progress}%</span>
                </div>
                <span className="text-nexus-text-muted">
                  {new Date(task.created_at).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
