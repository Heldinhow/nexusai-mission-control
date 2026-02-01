import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKillSwitch } from '../../hooks/useKillSwitch'
import { Button } from '../common/Button'
import { Modal } from '../common/Modal'
import type { Agent } from '../../types/agent'

interface KillSwitchButtonProps {
  agent: Agent
  variant?: 'button' | 'icon'
  size?: 'sm' | 'md' | 'lg'
}

export const KillSwitchButton: React.FC<KillSwitchButtonProps> = ({
  agent,
  variant = 'button',
  size = 'md',
}) => {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [killReason, setKillReason] = useState('manual')
  const [cascadeKill, setCascadeKill] = useState(true)
  
  const {
    kill,
    isKilling,
    confirmationValue,
    setConfirmationValue,
    isConfirmed,
    reset,
  } = useKillSwitch(agent.id, {
    onSuccess: () => {
      setShowModal(false)
      // Navigate back to dashboard after successful kill
      setTimeout(() => navigate('/'), 1500)
    },
  })

  const handleKill = () => {
    kill({
      reason: {
        type: killReason,
        description: getReasonDescription(killReason),
      },
      cascade: cascadeKill,
    })
  }

  const handleClose = () => {
    setShowModal(false)
    reset()
  }

  if (agent.status === 'killed') {
    return (
      <Button variant="ghost" size={size} disabled>
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Killed
      </Button>
    )
  }

  return (
    <>
      {variant === 'button' ? (
        <Button
          variant="danger"
          size={size}
          onClick={() => setShowModal(true)}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Kill Agent
        </Button>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="p-2 text-nexus-danger hover:bg-nexus-danger/10 rounded-lg transition-colors"
          title="Kill Agent"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </button>
      )}

      <Modal
        isOpen={showModal}
        onClose={handleClose}
        title="⚠️ Terminate Agent"
        size="md"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleKill}
              isLoading={isKilling}
              disabled={!isConfirmed || isKilling}
            >
              {isKilling ? 'Terminating...' : 'Terminate Permanently'}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Warning */}
          <div className="bg-nexus-danger/10 border border-nexus-danger/30 rounded-lg p-4">
            <p className="text-nexus-danger font-medium">
              This action cannot be undone. The agent will be permanently terminated.
            </p>
          </div>

          {/* Agent Info */}
          <div className="space-y-2">
            <label className="text-sm text-nexus-text-secondary">Target Agent</label>
            <div className="flex items-center gap-3 p-3 bg-nexus-bg rounded-lg">
              <div className="w-10 h-10 bg-nexus-border rounded-lg flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <p className="font-medium text-nexus-text-primary">{agent.name}</p>
                <p className="text-sm text-nexus-text-muted font-mono">{agent.id}</p>
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="text-sm text-nexus-text-secondary">Reason for termination</label>
            <select
              value={killReason}
              onChange={(e) => setKillReason(e.target.value)}
              className="w-full bg-nexus-bg border border-nexus-border rounded-lg px-4 py-2 text-nexus-text-primary focus:outline-none focus:ring-2 focus:ring-nexus-accent"
            >
              <option value="manual">Manual termination by operator</option>
              <option value="infinite_loop">Infinite loop detected</option>
              <option value="excessive_cost">Excessive resource consumption</option>
              <option value="system">System maintenance</option>
            </select>
          </div>

          {/* Cascade Kill Option */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="cascade"
              checked={cascadeKill}
              onChange={(e) => setCascadeKill(e.target.checked)}
              className="w-4 h-4 rounded border-nexus-border bg-nexus-bg text-nexus-accent focus:ring-nexus-accent"
            />
            <label htmlFor="cascade" className="text-nexus-text-primary">
              Also terminate all spawned children
            </label>
          </div>

          {/* Type to Confirm */}
          <div className="space-y-2">
            <label className="text-sm text-nexus-text-secondary">
              Type <code className="bg-nexus-border px-1 rounded">{agent.id}</code> to confirm
            </label>
            <input
              type="text"
              value={confirmationValue}
              onChange={(e) => setConfirmationValue(e.target.value)}
              placeholder={`Enter ${agent.id} to confirm`}
              className="w-full bg-nexus-bg border border-nexus-border rounded-lg px-4 py-2 text-nexus-text-primary placeholder-nexus-text-muted focus:outline-none focus:ring-2 focus:ring-nexus-accent font-mono"
            />
            {!isConfirmed && confirmationValue.length > 0 && (
              <p className="text-sm text-nexus-danger">
                Agent ID doesn't match
              </p>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}

function getReasonDescription(reason: string): string {
  const descriptions: Record<string, string> = {
    manual: 'Operator-initiated termination',
    infinite_loop: 'Agent detected in infinite loop',
    excessive_cost: 'Excessive token consumption detected',
    system: 'System maintenance shutdown',
  }
  return descriptions[reason] || 'Unknown reason'
}
