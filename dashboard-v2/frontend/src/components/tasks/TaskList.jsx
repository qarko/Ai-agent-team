import { useState } from 'react'
import TaskCard from './TaskCard'

const STATUS_OPTIONS = [
  { value: 'all',         label: '전체',   color: '#6C8CFF' },
  { value: 'pending',     label: '대기중', color: '#9A9AA8' },
  { value: 'in_progress', label: '진행중', color: '#6C8CFF' },
  { value: 'completed',   label: '완료',   color: '#00D68F' },
  { value: 'failed',      label: '실패',   color: '#FF5C5C' },
]

export default function TaskList({ omcTasks, omcTeams }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [teamFilter, setTeamFilter] = useState('all')

  const tasks = omcTasks || []

  const filtered = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (teamFilter !== 'all') {
      const matchTeam = t.team_id === teamFilter || t.team_name === teamFilter
      if (!matchTeam) return false
    }
    return true
  })

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        태스크 ({filtered.length})
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {STATUS_OPTIONS.map(opt => {
          const isActive = statusFilter === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className="px-3.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background:  isActive ? `${opt.color}18` : 'var(--bg-card)',
                color:       isActive ? opt.color : 'var(--text-tertiary)',
                border:      `1px solid ${isActive ? opt.color + '44' : 'var(--border-subtle)'}`,
                minHeight:   40,
                paddingTop:  '7px',
                paddingBottom: '7px',
              }}
            >
              {opt.label}
            </button>
          )
        })}

        {/* Team filter */}
        {omcTeams && omcTeams.length > 0 && (
          <select
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
            aria-label="팀 필터"
            className="ml-auto rounded-xl px-3 text-sm outline-none"
            style={{
              background: 'var(--bg-card)',
              color:      'var(--text-secondary)',
              border:     '1px solid var(--border-subtle)',
              minHeight:  40,
            }}
          >
            <option value="all">팀: 전체</option>
            {omcTeams.map(team => (
              <option key={team.id || team.name} value={team.id || team.name}>
                {team.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-sm text-center py-16 flex flex-col items-center gap-3" style={{ color: 'var(--text-tertiary)' }}>
            <span className="text-2xl opacity-40">📋</span>
            조건에 맞는 태스크가 없습니다
          </div>
        ) : (
          filtered.map(task => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  )
}
