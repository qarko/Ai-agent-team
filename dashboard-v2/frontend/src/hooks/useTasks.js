import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || ''

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function fetchTasks() {
      try {
        const res = await fetch(`${API_BASE}/api/tasks/`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (active) {
          setTasks(data)
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

    fetchTasks()
    const id = setInterval(fetchTasks, 5000)
    return () => { active = false; clearInterval(id) }
  }, [])

  return { tasks, loading, error }
}
