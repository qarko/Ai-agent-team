import AgentAvatar from './AgentAvatar'
import { AGENT_META, STATUS_CONFIG } from '../constants/agents'

export default function Sidebar({ agents, tasks, unread, selectedAgent, onSelectAgent }) {
  const activeCount = agents.filter(a => a.status !== 'offline').length
  const workingCount = agents.filter(a => a.status === 'working').length
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col border-r"
      style={{ background: '#0F172A', borderColor: '#334155', minHeight: '100vh' }}
    >
      {/* 로고 */}
      <div className="px-4 py-4 border-b" style={{ borderColor: '#334155' }}>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
            style={{ background: '#8B5CF6' }}
          >
            AI
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Agent Dashboard</div>
            <div className="text-xs" style={{ color: '#64748B' }}>v2</div>
          </div>
        </div>
      </div>

      {/* 에이전트 목록 */}
      <div className="flex-1 py-2 overflow-y-auto">
        {agents.map(agent => {
          // 백엔드: agent.id = 'manager' (식별자)
          const meta = AGENT_META[agent.id]
          const statusCfg = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.idle
          const badge = unread?.[agent.id] ?? 0
          const isSelected = selectedAgent === agent.id

          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(isSelected ? null : agent.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors"
              style={{
                background: isSelected ? '#1E293B' : 'transparent',
                borderLeft: isSelected ? `3px solid ${meta?.color}` : '3px solid transparent',
              }}
            >
              <AgentAvatar name={agent.id} status={agent.status} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: '#F1F5F9' }}>
                    {agent.id}
                  </span>
                  {badge > 0 && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-bold ml-1"
                      style={{ background: '#8B5CF6', color: '#fff', fontSize: 10 }}
                    >
                      {badge}
                    </span>
                  )}
                </div>
                <div
                  className="text-xs truncate"
                  style={{ color: statusCfg.color, opacity: 0.8 }}
                >
                  {agent.current_task || statusCfg.label}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* 하단 통계 */}
      <div className="px-4 py-3 border-t space-y-1" style={{ borderColor: '#334155' }}>
        <div className="text-xs" style={{ color: '#64748B' }}>
          <span style={{ color: '#10B981' }}>●</span> 활성 {activeCount}/6
        </div>
        <div className="text-xs" style={{ color: '#64748B' }}>
          <span style={{ color: '#8B5CF6' }}>●</span> 작업중 {workingCount}
        </div>
        <div className="text-xs" style={{ color: '#64748B' }}>
          <span style={{ color: '#F59E0B' }}>●</span> 진행중 태스크 {inProgressCount}
        </div>
      </div>
    </aside>
  )
}
