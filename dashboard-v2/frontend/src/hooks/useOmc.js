import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || ''

export function useOmc() {
  const [teams, setTeams] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function fetchOmc() {
      try {
        const [teamsRes, tasksRes] = await Promise.all([
          fetch(`${API_BASE}/api/omc/teams`),
          fetch(`${API_BASE}/api/omc/tasks`),
        ])

        if (active) {
          if (teamsRes.ok) {
            setTeams(await teamsRes.json())
          }
          if (tasksRes.ok) {
            setTasks(await tasksRes.json())
          }
          setLoading(false)
        }
      } catch {
        if (active) setLoading(false)
      }
    }

    fetchOmc()
    const id = setInterval(fetchOmc, 10000)
    return () => { active = false; clearInterval(id) }
  }, [])

  return { teams, tasks, loading }
}
