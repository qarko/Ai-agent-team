const STATUS_DOT = {
  active:  '#8B5CF6',
  idle:    '#64748B',
  working: '#10B981',
  offline: '#334155',
}

export default function OmcTeamCard({ team, tasks }) {
  const teamTasks = tasks.filter(t => t.team_id === team.id || t.team_name === team.name)
  const inProgress = teamTasks.filter(t => t.status === 'in_progress').length
  const completed = teamTasks.filter(t => t.status === 'completed').length
  const total = teamTasks.length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: '#1E293B',
        borderColor: '#8B5CF633',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}
          >
            T
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: '#E2E8F0' }}>
              {team.name}
            </div>
            {team.description && (
              <div className="text-xs" style={{ color: '#64748B' }}>
                {team.description}
              </div>
            )}
          </div>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full font-semibold"
          style={{ background: '#8B5CF622', color: '#A78BFA' }}
        >
          OMC
        </span>
      </div>

      {/* Members */}
      {team.members && team.members.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-medium mb-1.5" style={{ color: '#94A3B8' }}>
            팀원 ({team.members.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {team.members.map((member, i) => {
              const name = typeof member === 'string' ? member : member.name
              const status = typeof member === 'string' ? 'active' : (member.status || 'active')
              return (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-md flex items-center gap-1.5"
                  style={{ background: '#0F172A', color: '#CBD5E1' }}
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
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span style={{ color: '#94A3B8' }}>
            태스크 진행률
          </span>
          <span style={{ color: '#A78BFA' }}>
            {completed}/{total} ({progress}%)
          </span>
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: '#0F172A' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #7C3AED, #8B5CF6)',
            }}
          />
        </div>
        <div className="flex gap-3 mt-1.5 text-xs" style={{ color: '#64748B' }}>
          <span>진행중 {inProgress}</span>
          <span>완료 {completed}</span>
        </div>
      </div>
    </div>
  )
}
