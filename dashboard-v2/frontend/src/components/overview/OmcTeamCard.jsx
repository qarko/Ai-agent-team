const STATUS_DOT = {
  active:  '#6C8CFF',
  idle:    '#5E5E6E',
  working: '#00D68F',
  offline: '#2A2A32',
}

export default function OmcTeamCard({ team, tasks }) {
  const teamTasks = tasks.filter(t => t.team_id === team.id || t.team_name === team.name)
  const inProgress = teamTasks.filter(t => t.status === 'in_progress').length
  const completed = teamTasks.filter(t => t.status === 'completed').length
  const total = teamTasks.length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="card card-glow p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6C8CFF, #A78BFA)' }}
          >
            T
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {team.name}
            </div>
            {team.description && (
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {team.description}
              </div>
            )}
          </div>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-lg font-semibold"
          style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
        >
          OMC
        </span>
      </div>

      {/* Members */}
      {team.members && team.members.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>
            팀원 ({team.members.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {team.members.map((member, i) => {
              const name = typeof member === 'string' ? member : member.name
              const status = typeof member === 'string' ? 'active' : (member.status || 'active')
              return (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                  style={{ background: 'var(--bg-inset)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ background: STATUS_DOT[status] || STATUS_DOT.idle }}
                  />
                  {name}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Task progress */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span style={{ color: 'var(--text-tertiary)' }}>태스크 진행률</span>
          <span className="font-mono tabular-nums" style={{ color: 'var(--accent)' }}>
            {completed}/{total} ({progress}%)
          </span>
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: 'var(--bg-inset)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #6C8CFF, #A78BFA)',
            }}
          />
        </div>
        <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
            진행중 {inProgress}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }} />
            완료 {completed}
          </span>
        </div>
      </div>
    </div>
  )
}
