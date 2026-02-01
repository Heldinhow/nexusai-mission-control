import { useState, useEffect, useRef } from 'react'
import type { Agent, LogEntry } from './types/index'
import { MissionList } from './components/MissionList'
import { LiveIndicator } from './components/LiveIndicator'
import { useMissions } from './hooks/useMissions'
import './App.css'

function App() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'agents' | 'missions'>('agents')
  const logsEndRef = useRef<HTMLDivElement>(null)

  useMissions() // Initialize WebSocket for missions

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch(`http://76.13.101.17:4105/api/agents?t=${Date.now()}`)
        const data = await res.json()
        setAgents(data.data || [])
        setLastUpdate(new Date().toLocaleTimeString())
      } catch (err) {
        console.error('Failed to fetch agents:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
    const interval = setInterval(fetchAgents, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const addLog = (type: string, message: string) => {
    const entry: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type: type as any,
      message,
      agentId: undefined
    }
    setLogs(prev => [entry, ...prev].slice(0, 50))
  }

  useEffect(() => {
    const lines = [
      '[*] NexusAI Agent Monitor v2.0 (REALTIME)',
      '[*] Backend: http://76.13.101.17:4105',
      '[*] Update: 2s (no cache)',
      `[*] Last: ${lastUpdate || 'never'}`,
      '',
      ...agents.map(a => {
        const icon = a.status === 'running' ? '>' : a.status === 'completed' ? '✓' : '-'
        return `${icon} ${a.name}: ${a.status.toUpperCase()}`
      }),
      '',
      '[*] Monitoring...'
    ]
    setTerminalLines(lines)
  }, [agents, lastUpdate])

  useEffect(() => {
    const completed = agents.filter(a => a.status === 'completed' && a.hasNotification)
    if (completed.length > 0) {
      completed.forEach(agent => {
        addLog('SUCCESS', `${agent.name} completed!`)
      })
    }
  }, [agents])

  const activeAgents = agents.filter(a => a.status === 'running').length
  const completedAgents = agents.filter(a => a.status === 'completed').length
  const idleAgents = agents.filter(a => a.status === 'idle').length

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden">
      <div className="fixed inset-0 bg-grid pointer-events-none z-0" />
      <div className="fixed w-[600px] h-[600px] rounded-full bg-neon-cyan/15 blur-[100px] -top-48 -left-48 pointer-events-none" />
      <div className="fixed w-[600px] h-[600px] rounded-full bg-neon-purple/15 blur-[100px] -bottom-48 -right-48 pointer-events-none" />
      
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center neon-glow-cyan">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">
                Nexus<span className="text-neon-cyan">AI</span>
                <span className="text-xs text-slate-500 ml-2 font-normal">Mission Control</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <LiveIndicator connected={true} />
              <span className="text-xs text-slate-500">Updated: {lastUpdate || '...'}</span>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="pt-20 pb-6 px-6 h-screen">
        <div className="max-w-7xl mx-auto h-full">
          <div className="dashboard-grid h-full">
            <aside className="glass-strong rounded-2xl p-4 flex flex-col">
              {/* Tabs */}
              <div className="space-y-2 mb-6">
                <button
                  onClick={() => setActiveTab('agents')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'agents' 
                      ? 'bg-neon-cyan/10 text-neon-cyan' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm">Agents</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('missions')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'missions' 
                      ? 'bg-neon-cyan/10 text-neon-cyan' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span className="text-sm">Missions</span>
                </button>
              </div>
              
              <div className="mt-auto pt-4 border-t border-white/5">
                <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-3">System Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Running</span>
                    <span className="text-neon-cyan font-mono">{activeAgents}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Completed</span>
                    <span className="text-neon-green font-mono">{completedAgents}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Idle</span>
                    <span className="text-slate-500 font-mono">{idleAgents}</span>
                  </div>
                </div>
              </div>
            </aside>
            
            <div className="space-y-4 overflow-auto">
              {activeTab === 'agents' ? (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="glass-card rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Total</span>
                        <svg className="w-5 h-5 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="text-3xl font-bold font-mono">{agents.length}</div>
                    </div>
                    
                    <div className="glass-card rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Active</span>
                        <svg className="w-5 h-5 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="text-3xl font-bold font-mono text-neon-cyan">{activeAgents}</div>
                    </div>
                    
                    <div className="glass-card rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Done</span>
                        <svg className="w-5 h-5 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-3xl font-bold font-mono text-neon-green">{completedAgents}</div>
                    </div>
                  </div>
                  
                  {/* Terminal */}
                  <div className="terminal rounded-xl overflow-hidden">
                    <div className="terminal-header px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500/80" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                          <div className="w-3 h-3 rounded-full bg-green-500/80" />
                        </div>
                        <span className="ml-3 text-xs text-slate-400 font-mono">agent-monitor</span>
                      </div>
                      <span className="text-xs text-slate-500">{lastUpdate}</span>
                    </div>
                    <div className="p-4 font-mono text-xs h-48 overflow-auto" ref={logsEndRef}>
                      {terminalLines.map((line, i) => (
                        <div 
                          key={i} 
                          className={`${
                            line?.includes('✓') ? 'text-neon-green' : 
                            line?.includes('>') ? 'text-neon-cyan' : 
                            line?.startsWith('[*]') ? 'text-slate-400' :
                            'text-slate-300'
                          }`}
                        >
                          {line || ''}
                        </div>
                      ))}
                      <div className="flex items-center mt-2">
                        <span className="text-neon-cyan animate-pulse">_</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Agents List */}
                  <div className="glass-card rounded-xl p-4">
                    <h4 className="text-sm font-medium mb-4">Agents ({agents.length})</h4>
                    {loading ? (
                      <div className="text-center py-8 text-slate-500">Loading...</div>
                    ) : agents.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">No agents found</div>
                    ) : (
                      <div className="space-y-2">
                        {agents.map((agent) => (
                          <div key={agent.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className={`w-2 h-2 rounded-full ${
                                agent.status === 'running' ? 'bg-neon-cyan animate-pulse' :
                                agent.status === 'completed' ? 'bg-neon-green' :
                                'bg-slate-500'
                              }`} />
                              <div>
                                <span className="text-sm font-mono">{agent.name}</span>
                                {agent.completedAt && (
                                  <div className="text-xs text-slate-500">
                                    {new Date(agent.completedAt).toLocaleTimeString()}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              agent.status === 'running' ? 'bg-neon-cyan/10 text-neon-cyan' :
                              agent.status === 'completed' ? 'bg-neon-green/10 text-neon-green' :
                              'bg-slate-500/10 text-slate-400'
                            }`}>
                              {agent.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <MissionList />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
