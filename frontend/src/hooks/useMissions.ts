import { useEffect, useState, useCallback } from 'react'
import { useMissionStore } from '../stores/missionStore'
import type { Mission } from '../types/mission'

const API_URL = 'http://76.13.101.17:4105'

export function useMissions() {
  const { 
    missions, 
    setMissions, 
    updateMission, 
    setLoading, 
    setError, 
    wsConnected, 
    setWsConnected 
  } = useMissionStore()
  
  const [lastFetch, setLastFetch] = useState(Date.now())

  // Fetch missions from API
  const fetchMissions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/missions?t=${Date.now()}`)
      const data = await res.json()
      setMissions(data.data || [])
      setLastFetch(Date.now())
    } catch (err) {
      console.error('Failed to fetch missions:', err)
    }
  }, [setMissions])

  // Initial fetch
  useEffect(() => {
    setLoading(true)
    fetchMissions().then(() => setLoading(false))
  }, [fetchMissions, setLoading])

  // Polling fallback (every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!wsConnected) {
        fetchMissions()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [fetchMissions, wsConnected])

  // WebSocket connection (optional)
  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5

    const connect = () => {
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.log('Max WebSocket reconnect attempts reached, using polling only')
        setWsConnected(false)
        return
      }

      try {
        ws = new WebSocket(`ws://76.13.101.17:4105/ws`)
        
        ws.onopen = () => {
          console.log('🟢 WebSocket connected')
          setWsConnected(true)
          reconnectAttempts = 0
        }
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'mission-update') {
              updateMission(data.mission)
            } else if (data.type === 'initial') {
              setMissions(data.missions || [])
            }
          } catch (err) {
            console.error('WebSocket message error:', err)
          }
        }
        
        ws.onclose = () => {
          console.log('🔴 WebSocket disconnected')
          setWsConnected(false)
          reconnectAttempts++
          reconnectTimeout = setTimeout(connect, 5000)
        }
        
        ws.onerror = (err) => {
          console.log('WebSocket error, falling back to polling')
          setWsConnected(false)
          ws?.close()
        }
      } catch (err) {
        console.log('WebSocket creation failed, using polling')
        setWsConnected(false)
      }
    }

    connect()
    
    return () => {
      clearTimeout(reconnectTimeout)
      ws?.close()
    }
  }, [setMissions, setWsConnected, updateMission])

  const createMission = async (userMessage: string, source = 'dashboard') => {
    try {
      const res = await fetch(`${API_URL}/api/missions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage, source })
      })
      const data = await res.json()
      await fetchMissions()
      return data.data as Mission
    } catch (err) {
      setError('Failed to create mission')
      return null
    }
  }

  return {
    missions,
    wsConnected,
    createMission,
    refresh: fetchMissions
  }
}
