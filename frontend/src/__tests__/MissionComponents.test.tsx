import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MissionCard } from '../components/MissionCard'
import { MissionDetail } from '../components/MissionDetail'
import type { Mission } from '../types/mission'

// Mock de missão completa
const completeMission: Mission = {
  id: 'mission-001',
  userMessage: 'Test mission',
  source: 'whatsapp',
  timestamp: new Date().toISOString(),
  status: 'completed',
  progress: 100,
  agentsInvolved: ['agent-1', 'agent-2'],
  artifacts: [{ id: 'art-1', path: '/test', type: 'code', createdBy: 'agent-1', timestamp: new Date().toISOString() }],
  timeline: [{ id: 'evt-1', timestamp: new Date().toISOString(), type: 'mission-created', agent: 'system', message: 'Created', details: {} }],
  metadata: {}
}

// Mock de missão INCOMPLETA (sem arrays)
const incompleteMission: Mission = {
  id: 'mission-002',
  userMessage: 'Incomplete mission',
  source: 'whatsapp',
  timestamp: new Date().toISOString(),
  status: 'pending',
  progress: 0,
  // Arrays undefined - cenário que quebrava antes
  agentsInvolved: undefined as any,
  artifacts: undefined as any,
  timeline: undefined as any,
  metadata: {}
}

// Mock de missão com arrays vazios
const emptyMission: Mission = {
  id: 'mission-003',
  userMessage: 'Empty mission',
  source: 'whatsapp',
  timestamp: new Date().toISOString(),
  status: 'pending',
  progress: 0,
  agentsInvolved: [],
  artifacts: [],
  timeline: [],
  metadata: {}
}

describe('MissionCard - Robustez', () => {
  test('deve renderizar missão completa sem erros', () => {
    render(<MissionCard mission={completeMission} />)
    expect(screen.getByText('Test mission')).toBeDefined()
    expect(screen.getByText('2 agentes')).toBeDefined()
    expect(screen.getByText('1 artefatos')).toBeDefined()
  })

  test('deve renderizar missão com arrays undefined (cenário de erro)', () => {
    // Este teste falharia antes do fix - agora deve passar
    expect(() => render(<MissionCard mission={incompleteMission} />)).not.toThrow()
    expect(screen.getByText('Incomplete mission')).toBeDefined()
    expect(screen.getByText('0 agentes')).toBeDefined() // Fallback para 0
  })

  test('deve renderizar missão com arrays vazios', () => {
    render(<MissionCard mission={emptyMission} />)
    expect(screen.getByText('Empty mission')).toBeDefined()
    expect(screen.getByText('0 agentes')).toBeDefined()
    expect(screen.getByText('0 artefatos')).toBeDefined()
  })
})

describe('MissionDetail - Robustez', () => {
  test('deve renderizar detalhe de missão completa', () => {
    render(<MissionDetail mission={completeMission} />)
    expect(screen.getByText('Test mission')).toBeDefined()
    expect(screen.getByText('Agentes')).toBeDefined()
  })

  test('deve renderizar detalhe de missão com arrays undefined (cenário de erro)', () => {
    // Este teste falharia antes do fix
    expect(() => render(<MissionDetail mission={incompleteMission} />)).not.toThrow()
    expect(screen.getByText('Incomplete mission')).toBeDefined()
  })

  test('deve renderizar detalhe de missão vazia', () => {
    render(<MissionDetail mission={emptyMission} />)
    expect(screen.getByText('Empty mission')).toBeDefined()
  })

  test('deve fechar modal ao clicar no botão', () => {
    const onClose = vi.fn()
    render(<MissionDetail mission={completeMission} onClose={onClose} />)
    
    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalled()
  })
})

describe('Edge Cases', () => {
  test('deve lidar com missão com progress undefined', () => {
    const mission = { ...completeMission, progress: undefined as any }
    expect(() => render(<MissionCard mission={mission} />)).not.toThrow()
  })

  test('deve lidar com missão com source undefined', () => {
    const mission = { ...completeMission, source: undefined as any }
    expect(() => render(<MissionCard mission={mission} />)).not.toThrow()
  })

  test('deve lidar com status desconhecido', () => {
    const mission = { ...completeMission, status: 'unknown-status' as any }
    render(<MissionCard mission={mission} />)
    expect(screen.getByText('Test mission')).toBeDefined()
  })
})
