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
    <div className="p-3 sm:p-5 space-y-6 max-w-7xl mx-auto">

      {/* ── 통계 카드 4개 ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="활성 팀"       value={activeTeams.length}       color="#8B5CF6" icon="👥" />
        <StatCard label="진행중 태스크" value={inProgressTasks.length}   color="#F59E0B" icon="📋" />
        <StatCard label="완료 태스크"   value={completedTasks.length}    color="#10B981" icon="✓"  />
        <StatCard label="오늘 메시지"   value={todayMessages.length}     color="#EC4899" icon="💬" />
      </div>

      {/* ── OMC 팀 ─────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold" style={{ color: '#94A3B8', letterSpacing: '0.05em' }}>
            OMC 팀
          </h2>
          {omcTeams && omcTeams.length > 0 && (
            <span
              className="text-xs px-2 py-1 rounded-full font-semibold"
              style={{ background: '#8B5CF622', color: '#A78BFA' }}
            >
              {omcTeams.length}개 팀
            </span>
          )}
        </div>
        {!omcTeams || omcTeams.length === 0 ? (
          <div
            className="rounded-xl border text-sm text-center py-8"
            style={{ background: '#1E293B', borderColor: '#334155', color: '#475569' }}
          >
            활성 OMC 팀 없음
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {omcTeams.map(team => (
              <OmcTeamCard key={team.id || team.name} team={team} tasks={omcTasks || []} />
            ))}
          </div>
        )}
      </section>

      {/* ── 에이전트 현황 — 컴팩트 그리드 ──────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold" style={{ color: '#94A3B8', letterSpacing: '0.05em' }}>
            에이전트 현황
          </h2>
          <span className="text-xs" style={{ color: '#475569' }}>
            {workingCount > 0 ? `${workingCount}명 작업중` : '모두 대기중'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {agents.map(agent => {
            const meta = AGENT_META[agent.id]
            const isOnline = agent.status !== 'offline'
            return (
              <div
                key={agent.id}
                className="rounded-xl border p-3 text-center"
                style={{
                  background: '#1E293B',
                  borderColor: isOnline ? '#8B5CF633' : '#334155',
                }}
              >
                <div className="text-2xl mb-1">{meta?.emoji || '🤖'}</div>
                <div className="text-xs font-semibold truncate" style={{ color: '#E2E8F0' }}>
                  {agent.id}
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{
                      background: isOnline ? '#10B981' : '#475569',
                      animation: agent.status === 'working' ? 'agentPulse 1.5s infinite' : 'none',
                    }}
                  />
                  <span className="text-xs" style={{ color: isOnline ? '#10B981' : '#475569' }}>
                    {agent.status === 'working' ? '작업중' : isOnline ? '온라인' : '오프라인'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 최근 채팅 + 완료 태스크 미리보기 ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* 최근 채팅 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold" style={{ color: '#94A3B8', letterSpacing: '0.05em' }}>
              최근 채팅
            </h2>
            <button
              onClick={onGotoChat}
              aria-label="채팅 전체 보기"
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: '#8B5CF6', background: '#8B5CF611', minHeight: 44 }}
            >
              전체 보기 →
            </button>
          </div>
          <div
            className="rounded-xl border"
            style={{ background: '#1E293B', borderColor: '#334155' }}
          >
            <RecentChat messages={chatMessages} onGotoChat={onGotoChat} />
          </div>
        </section>

        {/* 완료 태스크 미리보기 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold" style={{ color: '#94A3B8', letterSpacing: '0.05em' }}>
              최근 완료 태스크
            </h2>
            <span
              className="text-xs px-2 py-1 rounded-full font-semibold"
              style={{
                background: completedTasks.length > 0 ? '#10B98122' : '#33415533',
                color: completedTasks.length > 0 ? '#34D399' : '#475569',
              }}
            >
              {completedTasks.length}건
            </span>
          </div>
          <div
            className="rounded-xl border divide-y"
            style={{ background: '#1E293B', borderColor: '#334155', divideColor: '#1E293B' }}
          >
            {completedTasks.length === 0 ? (
              <div className="text-sm text-center py-10" style={{ color: '#475569' }}>
                <div className="text-2xl mb-2">✓</div>
                완료된 태스크 없음
              </div>
            ) : (
              completedTasks.slice(0, 5).map(t => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                    style={{ background: '#10B98122', color: '#34D399' }}
                  >
                    ✓
                  </span>
                  <span className="flex-1 truncate text-sm" style={{ color: '#CBD5E1' }}>
                    {t.title}
                  </span>
                  {t.team_name && (
                    <span className="text-xs flex-shrink-0" style={{ color: '#A78BFA' }}>
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
