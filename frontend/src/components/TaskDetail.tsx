import { useState, useEffect } from 'react'
import type { Task, Subtask, Artifact } from '../types/index'
import { 
  ArrowLeft, 
  Clock, 
  Flag,
  Timer,
  FileText,
  FileJson,
  FileCode,
  FileImage,
  FileArchive,
  File,
  ListTodo,
  FolderOpen
} from 'lucide-react'

interface TaskDetailProps {
  task: Task
  onBack?: () => void
}

export function TaskDetail({ task, onBack }: TaskDetailProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || [])
  const [artifacts, setArtifacts] = useState<Artifact[]>(task.artifacts || [])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      // Se já temos dados na task, usar diretamente
      if (task.subtasks && task.subtasks.length > 0) {
        setSubtasks(task.subtasks)
        setLoading(false)
        return
      }
      if (task.artifacts && task.artifacts.length > 0) {
        setArtifacts(task.artifacts)
        setLoading(false)
        return
      }
      
      setLoading(true)
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        const res = await fetch(`http://76.13.101.17:4105/api/tasks/${task.id}`, {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        if (!res.ok) throw new Error('Failed to fetch task details')
        const data = await res.json()
        setSubtasks(data.data?.subtasks || [])
        setArtifacts(data.data?.artifacts || [])
      } catch (err) {
        console.warn('Could not fetch task details, showing basic info')
      } finally {
        setLoading(false)
      }
    }

    // Pequeno delay para mostrar loading visual, mas não bloquear
    const timer = setTimeout(() => {
      fetchDetails()
    }, 500)

    return () => clearTimeout(timer)
  }, [task])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-nexus-success'
      case 'running': return 'bg-nexus-info'
      case 'failed': return 'bg-nexus-danger'
      default: return 'bg-nexus-text-muted'
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-nexus-success'
      case 'running': return 'text-nexus-info'
      case 'failed': return 'text-nexus-danger'
      default: return 'text-nexus-text-muted'
    }
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleString('pt-BR')
    } catch {
      return '-'
    }
  }

  const formatDuration = (seconds: number | null | undefined) => {
    if (seconds === undefined || seconds === null) return '-'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) return `${mins}m ${secs}s`
    return `${secs}s`
  }

  const getFileName = (path: string) => path.split('/').pop() || path

  const getFileIcon = (path: string) => {
    const ext = path?.split('.').pop()?.toLowerCase() || ''
    const iconClass = "w-5 h-5 flex-shrink-0"
    
    switch (ext) {
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return <FileCode className={`${iconClass} text-nexus-primary-400`} />
      case 'json':
        return <FileJson className={`${iconClass} text-nexus-warning`} />
      case 'md':
      case 'txt':
        return <FileText className={`${iconClass} text-nexus-text-secondary`} />
      case 'css':
      case 'scss':
      case 'less':
        return <FileCode className={`${iconClass} text-nexus-accent-400`} />
      case 'html':
        return <FileCode className={`${iconClass} text-nexus-danger`} />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
        return <FileImage className={`${iconClass} text-nexus-accent-400`} />
      case 'pdf':
        return <FileText className={`${iconClass} text-nexus-danger`} />
      case 'zip':
      case 'tar':
      case 'gz':
      case 'rar':
        return <FileArchive className={`${iconClass} text-nexus-warning`} />
      default:
        return <File className={`${iconClass} text-nexus-text-muted`} />
    }
  }

  if (loading) {
    return (
      <div className="bg-nexus-bg-secondary rounded-xl p-5 max-h-full overflow-y-auto">
        <div className="flex items-center gap-4 mb-5">
          <button 
            className="bg-nexus-bg-tertiary hover:bg-nexus-border text-nexus-accent-400 px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <h3 className="text-nexus-text-primary font-semibold text-base m-0">Detalhes da Tarefa</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-nexus-text-muted">
          <div className="w-9 h-9 border-3 border-nexus-bg-tertiary border-t-nexus-accent-400 rounded-full animate-spin mb-4" />
          <p>Carregando detalhes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-nexus-bg-secondary rounded-xl p-5 max-h-full overflow-y-auto">
      <div className="flex items-center gap-4 mb-5">
        <button 
          className="bg-nexus-bg-tertiary hover:bg-nexus-border text-nexus-accent-400 px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <h3 className="text-nexus-text-primary font-semibold text-base m-0">Detalhes da Tarefa</h3>
      </div>

      <div className="bg-nexus-bg-tertiary rounded-lg p-4 mb-5">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-nexus-text-muted text-xs min-w-20 flex-shrink-0">ID</span>
          <span className="text-nexus-accent-400 text-xs font-mono break-all">{task.id}</span>
        </div>
        <div className="flex items-start gap-3 mb-3">
          <span className="text-nexus-text-muted text-xs min-w-20 flex-shrink-0">Status</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase text-white ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>
        <div className="flex items-start gap-3 mb-3">
          <span className="text-nexus-text-muted text-xs min-w-20 flex-shrink-0">Progresso</span>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-1 h-2 bg-nexus-bg-primary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-nexus-primary-500 to-nexus-accent-400 transition-all duration-300"
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <span className="text-nexus-text-secondary text-xs">{task.progress}%</span>
          </div>
        </div>
        <div className="flex items-start gap-3 mb-3">
          <span className="text-nexus-text-muted text-xs min-w-20 flex-shrink-0">Criado em</span>
          <span className="text-nexus-text-secondary text-xs">{formatDate(task.created_at)}</span>
        </div>
        <div className="flex items-start gap-3 mb-3">
          <span className="text-nexus-text-muted text-xs min-w-20 flex-shrink-0">Atualizado em</span>
          <span className="text-nexus-text-secondary text-xs">{formatDate(task.updated_at)}</span>
        </div>
        {task.agent_name && (
          <div className="flex items-start gap-3">
            <span className="text-nexus-text-muted text-xs min-w-20 flex-shrink-0">Agente</span>
            <span className="text-nexus-text-secondary text-xs">{task.agent_name}</span>
          </div>
        )}
      </div>

      {/* Subtarefas */}
      <div className="mb-5">
        <h4 className="text-nexus-text-secondary text-sm font-semibold m-0 mb-3 flex items-center gap-2">
          <ListTodo className="w-4 h-4" />
          Subtarefas ({subtasks.length})
        </h4>
        {subtasks.length === 0 ? (
          <div className="text-nexus-text-muted text-center py-8 bg-nexus-bg-tertiary/50 rounded-lg">Nenhuma subtarefa</div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {subtasks.map((sub, idx) => (
              <div key={sub.id || idx} className="bg-nexus-bg-tertiary rounded-lg p-3.5 border-l-2 border-nexus-accent-400">
                <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getStatusColor(sub.status)}`} />
                  <span className="text-nexus-accent-400 font-semibold text-xs font-mono">{sub.agent_name || 'Desconhecido'}</span>
                  {sub.stage && <span className="bg-nexus-bg-primary px-2.5 py-0.5 rounded text-2xs text-nexus-text-muted ml-auto">{sub.stage}</span>}
                  <span className={`text-2xs font-semibold uppercase ${getStatusTextColor(sub.status)}`}>
                    {sub.status}
                  </span>
                </div>
                <div className="bg-black/20 rounded-md p-2.5 ml-5">
                  <div className="flex gap-5 text-xs text-nexus-text-muted mb-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Início: {formatDate(sub.start_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flag className="w-3 h-3" />
                      Fim: {formatDate(sub.end_time)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-nexus-text-muted">
                    <span className="flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      Duração: {formatDuration(sub.duration_seconds)}
                    </span>
                    {sub.task_description && (
                      <span className="text-nexus-text-muted italic">{sub.task_description}</span>
                    )}
                  </div>
                </div>
                {sub.file_path && (
                  <div className="flex items-center gap-2 mt-2.5 ml-5 text-xs">
                    {getFileIcon(sub.file_path)}
                    <span className="text-nexus-text-muted font-mono break-all">{sub.file_path}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Artefatos */}
      <div className="mb-5">
        <h4 className="text-nexus-text-secondary text-sm font-semibold m-0 mb-3 flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          Arquivos ({artifacts.length})
        </h4>
        {artifacts.length === 0 ? (
          <div className="text-nexus-text-muted text-center py-8 bg-nexus-bg-tertiary/50 rounded-lg">Nenhum arquivo</div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {artifacts.map((art) => (
              <div 
                key={art.id} 
                className="flex items-center gap-3 bg-nexus-bg-tertiary rounded-lg p-3.5 transition-all duration-150 hover:bg-nexus-bg-secondary hover:translate-x-1"
              >
                {getFileIcon(art.file_path)}
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <span className="text-nexus-text-secondary text-sm font-medium break-all">{getFileName(art.file_path)}</span>
                  <span className="text-nexus-text-muted text-2xs font-mono break-all">{art.file_path}</span>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="bg-nexus-bg-primary px-2.5 py-1 rounded text-2xs text-nexus-accent-400">
                    {art.file_type || art.type || 'arquivo'}
                  </span>
                  <span className="text-2xs text-nexus-text-muted">{formatDate(art.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
