import { useState, useEffect, useRef } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || ''

export function useChat({ agent, limit = 100, onNewMessages } = {}) {
  const [messages, setMessages] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const lastTsRef = useRef(null)

  useEffect(() => {
    let active = true
    lastTsRef.current = null
    setMessages([])
    setLoading(true)

    async function fetchInitial() {
      try {
        const params = new URLSearchParams({ limit })
        if (agent) params.set('agent', agent)
        const res = await fetch(`${API_BASE}/api/chat/messages?${params}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (active) {
          setMessages(data.messages)
          setTotal(data.total)
          setError(null)
          setLoading(false)
          if (data.messages.length > 0) {
            lastTsRef.current = data.messages[data.messages.length - 1].ts
          }
        }
      } catch (e) {
        if (active) {
          setError(e.message)
          setLoading(false)
        }
      }
    }

    async function fetchNew() {
      try {
        const params = new URLSearchParams()
        if (agent) params.set('agent', agent)
        if (lastTsRef.current) params.set('since', lastTsRef.current)
        const res = await fetch(`${API_BASE}/api/chat/messages?${params}`)
        if (!res.ok) return
        const data = await res.json()
        if (active && data.messages.length > 0) {
          setMessages(prev => [...prev, ...data.messages])
          setTotal(data.total)
          lastTsRef.current = data.messages[data.messages.length - 1].ts
          onNewMessages?.(data.messages)
        }
      } catch {
        // silently ignore polling errors
      }
    }

    fetchInitial()
    const id = setInterval(fetchNew, 3000)
    return () => { active = false; clearInterval(id) }
  }, [agent, limit, onNewMessages])

  return { messages, total, loading, error }
}
