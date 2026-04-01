import { useState } from 'react'

const STATUS_DOT = {
  active:  '#6C8CFF',
  idle:    '#5E5E6E',
  working: '#00D68F',
  offline: '#2A2A32',
}

export default function TeamView({ teams, tasks }) {
  const [selectedTeam, setSelectedTeam] = useState(null)

  const activeTeams = (teams || []).filter(t => t.status !== 'completed')
  const completedTeams = (teams || []).filter(t => t.status === 'completed')

  if (selectedTeam) {
    return (
      <TeamDetail
        team={selectedTeam}
        tasks={tasks}
        onBack={() => setSelectedTeam(null)}
      />
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
        OMC 팀 ({(teams || []).length})
      </h2>

      {/* Active teams */}
      {activeTeams.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: 'var(--accent)', animation: 'agentPulse 1.5s infinite' }}
            />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
              활성 팀 ({activeTeams.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeTeams.map(team => (
              <TeamCard
                key={team.id || team.name}
                team={team}
                tasks={tasks}
                onClick={() => setSelectedTeam(team)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed teams */}
      {completedTeams.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-tertiary)' }}>
            완료된 팀 ({completedTeams.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {completedTeams.map(team => (
              <TeamCard
                key={team.id || team.name}
                team={team}
                tasks={tasks}
                onClick={() => setSelectedTeam(team)}
              />
            ))}
          </div>
        </section>
      )}

      {(!teams || teams.length === 0) && (
        <div className="card text-sm text-center py-16 flex flex-col items-center gap-3">
          <span className="text-3xl opacity-30">👥</span>
          <span style={{ color: 'var(--text-tertiary)' }}>활성 OMC 팀이 없습니다</span>
        </div>
      )}
    </div>
  )
}

function TeamCard({ team, tasks, onClick }) {
  const teamTasks = (tasks || []).filter(t => t.team_id === team.id || t.team_name === team.name)
  const completed = teamTasks.filter(t => t.status === 'completed').length
  const total = teamTasks.length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      className="card card-glow p-4 cursor-pointer transition-all"
      style={{ borderColor: '#6C8CFF22' }}
    >
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
              <div className="text-xs truncate max-w-[200px]" style={{ color: 'var(--text-tertiary)' }}>
                {team.description}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Members */}
      {team.members && team.members.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {team.members.slice(0, 6).map((member, i) => {
            const name = typeof member === 'string' ? member : member.name
            const status = typeof member === 'string' ? 'active' : (member.status || 'active')
            return (
              <span
                key={i}
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                title={name}
                style={{
                  background: STATUS_DOT[status] + '22',
                  color: STATUS_DOT[status],
                  border: `1.5px solid ${STATUS_DOT[status]}44`,
                }}
              >
                {name.charAt(0).toUpperCase()}
              </span>
            )
          })}
          {team.members.length > 6 && (
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
              style={{ background: 'var(--bg-inset)', color: 'var(--text-secondary)' }}
            >
              +{team.members.length - 6}
            </span>
          )}
        </div>
      )}

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span style={{ color: 'var(--text-tertiary)' }}>태스크</span>
          <span className="font-mono tabular-nums" style={{ color: 'var(--accent)' }}>{completed}/{total} ({progress}%)</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-inset)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6C8CFF, #A78BFA)' }}
          />
        </div>
      </div>
    </div>
  )
}

function TeamDetail({ team, tasks, onBack }) {
  const teamTasks = (tasks || []).filter(t => t.team_id === team.id || t.team_name === team.name)
  const pending = teamTasks.filter(t => t.status === 'pending')
  const inProgress = teamTasks.filter(t => t.status === 'in_progress')
  const completed = teamTasks.filter(t => t.status === 'completed')

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Back + Header */}
      <div>
        <button
          onClick={onBack}
          className="text-xs mb-3 px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--accent)', background: 'var(--accent-muted)' }}
        >
          ← 팀 목록
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6C8CFF, #A78BFA)' }}
          >
            T
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {team.name}
            </h2>
            {team.description && (
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{team.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Members */}
      {team.members && team.members.length > 0 && (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
            <span className="w-1 h-3.5 rounded-full" style={{ background: 'var(--accent)' }} />
            팀원 ({team.members.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {team.members.map((member, i) => {
              const name = typeof member === 'string' ? member : member.name
              const status = typeof member === 'string' ? 'active' : (member.status || 'active')
              const isOnline = status !== 'offline'
              return (
                <div
                  key={i}
                  className="card flex items-center gap-3 p-3"
                  style={{
                    borderColor: isOnline ? '#6C8CFF22' : 'var(--border-subtle)',
                  }}
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{
                      background: STATUS_DOT[status] + '22',
                      color: STATUS_DOT[status],
                    }}
                  >
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{ background: STATUS_DOT[status] }}
                      />
                      <span className="text-xs" style={{ color: STATUS_DOT[status] }}>
                        {status === 'working' ? '작업중' : status === 'active' ? '활성' : status === 'idle' ? '대기' : '오프라인'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Tasks by status */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
          <span className="w-1 h-3.5 rounded-full" style={{ background: 'var(--purple)' }} />
          태스크 ({teamTasks.length})
        </h3>

        {teamTasks.length === 0 ? (
          <div className="card text-sm text-center py-10 flex flex-col items-center gap-2">
            <span className="text-xl opacity-30">📋</span>
            <span style={{ color: 'var(--text-tertiary)' }}>태스크 없음</span>
          </div>
        ) : (
          <div className="space-y-4">
            {inProgress.length > 0 && (
              <TaskGroup label="진행중" tasks={inProgress} dotColor="#6C8CFF" pulse />
            )}
            {pending.length > 0 && (
              <TaskGroup label="대기중" tasks={pending} dotColor="#5E5E6E" />
            )}
            {completed.length > 0 && (
              <TaskGroup label="완료" tasks={completed} dotColor="#00D68F" />
            )}
          </div>
        )}
      </section>

      {/* Session history */}
      {team.sessions && team.sessions.length > 0 && (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
            <span className="w-1 h-3.5 rounded-full" style={{ background: 'var(--yellow)' }} />
            세션 히스토리
          </h3>
          <div className="space-y-2">
            {team.sessions.map((session, i) => (
              <div
                key={i}
                className="card px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>{session.id || `Session ${i + 1}`}</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
                    {session.created_at || session.timestamp || ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function TaskGroup({ label, tasks, dotColor, pulse }) {
  const STATUS_STYLE = {
    pending:     { bg: 'var(--bg-card)',   color: 'var(--text-secondary)', border: 'var(--border-subtle)' },
    in_progress: { bg: '#6C8CFF0C', color: 'var(--accent)', border: '#6C8CFF22' },
    completed:   { bg: '#00D68F0C', color: 'var(--green)', border: '#00D68F22' },
    failed:      { bg: '#FF5C5C0C', color: 'var(--red)', border: '#FF5C5C22' },
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{
            background: dotColor,
            animation: pulse ? 'agentPulse 1.5s infinite' : 'none',
          }}
        />
        <span className="text-xs font-semibold" style={{ color: dotColor }}>
          {label} ({tasks.length})
        </span>
      </div>
      <div className="space-y-2">
        {tasks.map(t => {
          const st = STATUS_STYLE[t.status] || STATUS_STYLE.pending
          return (
            <div
              key={t.id}
              className="card px-4 py-3"
              style={{ borderColor: st.border }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {t.title}
                  </div>
                  {t.description && (
                    <div className="text-xs mt-1 truncate" style={{ color: 'var(--text-tertiary)' }}>
                      {t.description}
                    </div>
                  )}
                </div>
                {t.agent_id && (
                  <span className="text-xs flex-shrink-0 px-2 py-0.5 rounded-md" style={{ color: 'var(--accent)', background: 'var(--accent-muted)' }}>
                    {t.agent_id}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
