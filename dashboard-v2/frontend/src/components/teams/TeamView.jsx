import { useState } from 'react'

const STATUS_DOT = {
  active:  '#8B5CF6',
  idle:    '#64748B',
  working: '#10B981',
  offline: '#334155',
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
      <h2 className="text-base font-bold" style={{ color: '#F1F5F9' }}>
        OMC 팀 ({(teams || []).length})
      </h2>

      {/* 활성 팀 */}
      {activeTeams.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: '#8B5CF6', animation: 'agentPulse 1.5s infinite' }}
            />
            <h3 className="text-sm font-semibold" style={{ color: '#A78BFA' }}>
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

      {/* 완료 팀 */}
      {completedTeams.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#64748B' }}>
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
        <div
          className="rounded-xl border text-sm text-center py-16"
          style={{ background: '#1E293B', borderColor: '#334155', color: '#475569' }}
        >
          활성 OMC 팀이 없습니다
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
      className="rounded-xl border p-4 cursor-pointer transition-all hover:border-purple-500/50"
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
              <div className="text-xs truncate max-w-[200px]" style={{ color: '#64748B' }}>
                {team.description}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Members */}
      {team.members && team.members.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {team.members.slice(0, 6).map((member, i) => {
            const name = typeof member === 'string' ? member : member.name
            const status = typeof member === 'string' ? 'active' : (member.status || 'active')
            return (
              <span
                key={i}
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                title={name}
                style={{
                  background: STATUS_DOT[status] + '33',
                  color: STATUS_DOT[status],
                  border: `1.5px solid ${STATUS_DOT[status]}55`,
                }}
              >
                {name.charAt(0).toUpperCase()}
              </span>
            )
          })}
          {team.members.length > 6 && (
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
              style={{ background: '#33415566', color: '#94A3B8' }}
            >
              +{team.members.length - 6}
            </span>
          )}
        </div>
      )}

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span style={{ color: '#94A3B8' }}>태스크</span>
          <span style={{ color: '#A78BFA' }}>{completed}/{total} ({progress}%)</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#0F172A' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #7C3AED, #8B5CF6)' }}
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
          style={{ color: '#A78BFA', background: '#8B5CF611' }}
        >
          ← 팀 목록
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}
          >
            T
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#F1F5F9' }}>
              {team.name}
            </h2>
            {team.description && (
              <p className="text-sm" style={{ color: '#64748B' }}>{team.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Members */}
      {team.members && team.members.length > 0 && (
        <section>
          <h3 className="text-sm font-bold mb-3" style={{ color: '#94A3B8', letterSpacing: '0.05em' }}>
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
                  className="rounded-xl border p-3 flex items-center gap-3"
                  style={{
                    background: '#1E293B',
                    borderColor: isOnline ? '#8B5CF633' : '#334155',
                  }}
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                    style={{
                      background: STATUS_DOT[status] + '33',
                      color: STATUS_DOT[status],
                    }}
                  >
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: '#E2E8F0' }}>
                      {name}
                    </div>
                    <div className="flex items-center gap-1">
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
        <h3 className="text-sm font-bold mb-3" style={{ color: '#94A3B8', letterSpacing: '0.05em' }}>
          태스크 ({teamTasks.length})
        </h3>

        {teamTasks.length === 0 ? (
          <div
            className="rounded-xl border text-sm text-center py-8"
            style={{ background: '#1E293B', borderColor: '#334155', color: '#475569' }}
          >
            태스크 없음
          </div>
        ) : (
          <div className="space-y-4">
            {inProgress.length > 0 && (
              <TaskGroup label="진행중" tasks={inProgress} dotColor="#8B5CF6" pulse />
            )}
            {pending.length > 0 && (
              <TaskGroup label="대기중" tasks={pending} dotColor="#64748B" />
            )}
            {completed.length > 0 && (
              <TaskGroup label="완료" tasks={completed} dotColor="#10B981" />
            )}
          </div>
        )}
      </section>

      {/* Session history */}
      {team.sessions && team.sessions.length > 0 && (
        <section>
          <h3 className="text-sm font-bold mb-3" style={{ color: '#94A3B8', letterSpacing: '0.05em' }}>
            세션 히스토리
          </h3>
          <div className="space-y-2">
            {team.sessions.map((session, i) => (
              <div
                key={i}
                className="rounded-xl border px-4 py-3 text-sm"
                style={{ background: '#1E293B', borderColor: '#334155', color: '#CBD5E1' }}
              >
                <div className="flex items-center justify-between">
                  <span>{session.id || `Session ${i + 1}`}</span>
                  <span className="text-xs" style={{ color: '#64748B' }}>
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
    pending:     { bg: '#1E293B',   color: '#94A3B8', border: '#334155' },
    in_progress: { bg: '#8B5CF611', color: '#A78BFA', border: '#8B5CF633' },
    completed:   { bg: '#10B98111', color: '#34D399', border: '#10B98133' },
    failed:      { bg: '#EF444411', color: '#F87171', border: '#EF444433' },
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
              className="rounded-xl border px-4 py-3"
              style={{ background: st.bg, borderColor: st.border }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium" style={{ color: '#E2E8F0' }}>
                    {t.title}
                  </div>
                  {t.description && (
                    <div className="text-xs mt-1 truncate" style={{ color: '#64748B' }}>
                      {t.description}
                    </div>
                  )}
                </div>
                {t.agent_id && (
                  <span className="text-xs flex-shrink-0" style={{ color: '#A78BFA' }}>
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
