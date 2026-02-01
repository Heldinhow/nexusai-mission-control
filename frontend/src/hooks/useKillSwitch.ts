import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { agentApi } from '../services/agent-api'
import type { Agent } from '../types/agent'

interface UseKillSwitchOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useKillSwitch(agentId: string, options: UseKillSwitchOptions = {}) {
  const queryClient = useQueryClient()
  const [confirmationValue, setConfirmationValue] = useState('')

  const killMutation = useMutation({
    mutationFn: async (params: {
      reason: { type: string; description: string }
      cascade: boolean
    }) => {
      return await agentApi.killAgent(agentId, {
        reason: params.reason,
        confirmation: {
          method: 'type_to_confirm',
          typedValue: confirmationValue,
        },
        cascade: params.cascade,
        forceImmediate: false,
      })
    },
    onSuccess: () => {
      // Invalidate agent queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      queryClient.invalidateQueries({ queryKey: ['agent', agentId] })
      
      // Update the killed agent in cache
      queryClient.setQueryData(['agent', agentId], (old: Agent | undefined) => {
        if (!old) return old
        return { ...old, status: 'killed' as const }
      })
      
      options.onSuccess?.()
      setConfirmationValue('')
    },
    onError: (error: Error) => {
      options.onError?.(error)
    },
  })

  return {
    kill: killMutation.mutate,
    isKilling: killMutation.isPending,
    error: killMutation.error,
    confirmationValue,
    setConfirmationValue,
    isConfirmed: confirmationValue === agentId,
    reset: () => setConfirmationValue(''),
  }
}
