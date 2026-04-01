import StatCard from './StatCard'
import RecentChat from './RecentChat'
import AgentCard from '../AgentCard'
import OmcTeamCard from './OmcTeamCard'
import { AGENT_META } from '../../constants/agents'

export default function Overview({ agents, chatMessages, onGotoChat, omcTeams, omcTasks }) {
  const activeTeams     = (omcTeams || []).filter(t => t.status !== 'completed')
  const inProgressTasks = (omcTasks || []).filter(t => t.status === 'in_progress')
  const completedTasks  = (omcTasks || []).filter(t => t.status === 'completed')
  const workingCount    = agents.filter(a => a.status === 'working').length
  const todayMessages   = chatMessages.filter(m => {
    const d = new Date(m.ts)
    return d.toDateString() === new Date().toDateString()
  })

  return (
    <div className="p-3 sm:p-6 space-y-6 max-w-7xl mx-auto">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="활성 팀"       value={activeTeams.length}       color="#6C8CFF" icon="👥" />
        <StatCard label="진행중 태스크" value={inProgressTasks.length}   color="#FFB545" icon="📋" />
        <StatCard label="완료 태스크"   value={completedTasks.length}    color="#00D68F" icon="✓"  />
        <StatCard label="오늘 메시지"   value={todayMessages.length}     color="#EC4899" icon="💬" />
      </div>

      {/* OMC Teams */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
            <span className="w-1 h-3.5 rounded-full" style={{ background: 'var(--accent)' }} />
            OMC 팀
          </h2>
          {omcTeams && omcTeams.length > 0 && (
            <span
              className="text-xs px-2.5 py-1 rounded-lg font-semibold"
              style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
            >
              {omcTeams.length}개 팀
            </span>
          )}
        </div>
        {!omcTeams || omcTeams.length === 0 ? (
          <div
            className="card text-sm text-center py-10 flex flex-col items-center gap-2"
          >
            <span className="text-2xl opacity-30">👥</span>
            <span style={{ color: 'var(--text-tertiary)' }}>활성 OMC 팀 없음</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {omcTeams.map(team => (
              <OmcTeamCard key={team.id || team.name} team={team} tasks={omcTasks || []} />
            ))}
          </div>
        )}
      </section>

      {/* Agent Status - Compact Grid */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
            <span className="w-1 h-3.5 rounded-full" style={{ background: 'var(--green)' }} />
            에이전트 현황
          </h2>
          <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
            {workingCount > 0 ? `${workingCount}명 작업중` : '모두 대기중'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {agents.map(agent => {
            const meta = AGENT_META[agent.id]
            const isOnline = agent.status !== 'offline'
            const isWorking = agent.status === 'working'
            return (
              <div
                key={agent.id}
                className="card p-3.5 text-center transition-all"
                style={{
                  borderColor: isWorking ? `${meta?.color}44` : isOnline ? 'var(--border-subtle)' : 'var(--border-subtle)',
                }}
              >
                <div className="text-2xl mb-1.5">{meta?.emoji || '🤖'}</div>
                <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {agent.id}
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{
                      background: isOnline ? 'var(--green)' : 'var(--text-tertiary)',
                      animation: isWorking ? 'agentPulse 1.5s infinite' : 'none',
                    }}
                  />
                  <span className="text-xs font-medium" style={{ color: isOnline ? 'var(--green)' : 'var(--text-tertiary)' }}>
                    {isWorking ? '작업중' : isOnline ? '온라인' : '오프라인'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Recent Chat + Completed Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Chat */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
              <span className="w-1 h-3.5 rounded-full" style={{ background: '#EC4899' }} />
              최근 채팅
            </h2>
            <button
              onClick={onGotoChat}
              aria-label="채팅 전체 보기"
              className="text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
              style={{ color: 'var(--accent)', background: 'var(--accent-muted)', minHeight: 36 }}
            >
              전체 보기 →
            </button>
          </div>
          <div className="card overflow-hidden">
            <RecentChat messages={chatMessages} onGotoChat={onGotoChat} />
          </div>
        </section>

        {/* Completed Tasks Preview */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
              <span className="w-1 h-3.5 rounded-full" style={{ background: 'var(--green)' }} />
              최근 완료 태스크
            </h2>
            <span
              className="text-xs px-2.5 py-1 rounded-lg font-semibold"
              style={{
                background: completedTasks.length > 0 ? 'var(--green-muted)' : 'var(--bg-card)',
                color: completedTasks.length > 0 ? 'var(--green)' : 'var(--text-tertiary)',
              }}
            >
              {completedTasks.length}건
            </span>
          </div>
          <div className="card overflow-hidden divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {completedTasks.length === 0 ? (
              <div className="text-sm text-center py-12 flex flex-col items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--bg-inset)' }}>
                  <span className="text-lg opacity-50">✓</span>
                </div>
                완료된 태스크 없음
              </div>
            ) : (
              completedTasks.slice(0, 5).map(t => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                    style={{ background: 'var(--green-muted)', color: 'var(--green)' }}
                  >
                    ✓
                  </span>
                  <span className="flex-1 truncate text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {t.title}
                  </span>
                  {t.team_name && (
                    <span className="text-xs flex-shrink-0 px-2 py-0.5 rounded-md" style={{ color: 'var(--accent)', background: 'var(--accent-muted)' }}>
                      {t.team_name}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
