import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Activity, Loader2, FileText, XCircle } from 'lucide-react'
import type { Agent, Task } from '../types/index'

interface NexusTerminalProps {
  agents: Agent[]
  recentTasks: Task[]
  tasksLoading?: boolean
  tasksError?: string | null
}

interface TerminalLine {
  type: 'command' | 'success' | 'error' | 'info' | 'system' | 'agent' | 'warning'
  text: string
  icon?: React.ReactNode
}

export function NexusTerminal({ agents, recentTasks, tasksLoading, tasksError }: NexusTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([])

  useEffect(() => {
    const output: TerminalLine[] = []
    
    output.push({ type: 'info', text: '╔════════════════════════════════════╗' })
    output.push({ type: 'info', text: '║     NexusAI Centro de Controle     ║' })
    output.push({ type: 'info', text: '╚════════════════════════════════════╝' })
    output.push({ type: 'system', text: '' })
    
    // Resumo de status dos agentes
    const runningAgents = agents.filter(a => a.status === 'running')
    const errorAgents = agents.filter(a => a.status === 'error')
    
    if (errorAgents.length > 0) {
      output.push({ type: 'error', text: `${errorAgents.length} agente(s) em estado de erro`, icon: <XCircle className="w-3 h-3" /> })
    }
    
    if (runningAgents.length > 0) {
      output.push({ type: 'success', text: `${runningAgents.length} agente(s) em execução`, icon: <CheckCircle className="w-3 h-3" /> })
      runningAgents.slice(0, 5).forEach(agent => {
        output.push({ type: 'agent', text: `   └ ${agent.name}` })
      })
      if (runningAgents.length > 5) {
        output.push({ type: 'system', text: `   └ ... e mais ${runningAgents.length - 5}` })
      }
    } else if (errorAgents.length === 0) {
      output.push({ type: 'info', text: 'Nenhum agente em execução', icon: <Activity className="w-3 h-3" /> })
    }
    
    output.push({ type: 'system', text: '' })
    output.push({ type: 'info', text: 'Status do Sistema:', icon: <Activity className="w-3 h-3" /> })
    output.push({ type: 'system', text: `   Total de Agentes: ${agents.length}` })
    output.push({ type: 'system', text: `   Ativos: ${agents.filter(a => a.is_active).length}` })
    output.push({ type: 'system', text: `   Total de Tarefas: ${agents.reduce((acc, a) => acc + (a.task_count || 0), 0)}` })
    
    // Status das tarefas recentes
    if (recentTasks.length > 0) {
      output.push({ type: 'system', text: `   Tarefas Recentes: ${recentTasks.length}` })
      const running = recentTasks.filter(t => t.status === 'running').length
      const completed = recentTasks.filter(t => t.status === 'completed').length
      const failed = recentTasks.filter(t => t.status === 'failed').length
      output.push({ type: 'system', text: `     └ Em Execução: ${running} | Concluídas: ${completed} | Falhas: ${failed}` })
    }
    
    // Estados de carregamento/erro
    if (tasksLoading) {
      output.push({ type: 'warning', text: '' })
      output.push({ type: 'warning', text: 'Carregando tarefas...', icon: <Loader2 className="w-3 h-3 animate-spin" /> })
    } else if (tasksError) {
      output.push({ type: 'error', text: '' })
      output.push({ type: 'error', text: `${tasksError}`, icon: <AlertCircle className="w-3 h-3" /> })
    }
    
    // Detalhes das tarefas recentes
    if (recentTasks.length > 0) {
      output.push({ type: 'info', text: '' })
      output.push({ type: 'info', text: 'Tarefas recentes:', icon: <FileText className="w-3 h-3" /> })
      recentTasks.slice(0, 5).forEach(task => {
        const status = task.status === 'completed' ? '✓' : task.status === 'running' ? '●' : task.status === 'failed' ? '✗' : '○'
        const message = (task.user_message || task.message || '').slice(0, 40)
        output.push({ type: 'system', text: `${status} [${task.id.slice(0, 8)}] ${message}${message.length >= 40 ? '...' : ''}` })
      })
    }

    output.push({ type: 'info', text: '' })
    output.push({ type: 'success', text: 'Sistema pronto' })

    setLines(output)
  }, [agents, recentTasks, tasksLoading, tasksError])

  const getLineClass = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command': return 'text-nexus-text-primary'
      case 'success': return 'text-nexus-success'
      case 'error': return 'text-nexus-danger'
      case 'info': return 'text-nexus-primary-500'
      case 'system': return 'text-nexus-text-muted'
      case 'agent': return 'text-nexus-primary-400'
      case 'warning': return 'text-nexus-warning'
      default: return 'text-nexus-text-secondary'
    }
  }

  return (
    <div className="bg-nexus-bg-secondary rounded-xl overflow-hidden border border-nexus-border shadow-lg font-mono">
      <div className="p-4 min-h-[200px] max-h-[300px] overflow-y-auto text-sm leading-relaxed scrollbar-thin scrollbar-thumb-nexus-border scrollbar-track-transparent">
        {lines.map((line, i) => (
          <div key={i} className={`mb-1 whitespace-pre-wrap break-words flex items-center gap-2 ${getLineClass(line.type)}`}>
            {line.type === 'system' && <span className="text-nexus-primary-500 mr-1">→</span>}
            {line.icon && <span className="inline-flex">{line.icon}</span>}
            <span>{line.text}</span>
          </div>
        ))}
        <div className="mb-1 flex items-center">
          <span className="text-nexus-primary-500 mr-2">›</span>
          <span className="inline-block w-2 h-4 bg-nexus-primary-500 animate-pulse"></span>
        </div>
      </div>
    </div>
  )
}
