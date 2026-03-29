import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || ''

export function useAgents() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function fetchAgents() {
      try {
        const res = await fetch(`${API_BASE}/api/agents/`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (active) {
          setAgents(data)
          setError(null)
          setLoading(false)
        }
      } catch (e) {
        if (active) {
          setError(e.message)
          setLoading(false)
        }
      }
    }

    fetchAgents()
    const id = setInterval(fetchAgents, 5000)
    return () => { active = false; clearInterval(id) }
  }, [])

  return { agents, loading, error }
}
