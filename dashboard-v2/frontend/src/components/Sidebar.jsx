import AgentAvatar from './AgentAvatar'
import { AGENT_META, STATUS_CONFIG } from '../constants/agents'

export default function Sidebar({ agents, tasks, unread, selectedAgent, onSelectAgent }) {
  const activeCount = agents.filter(a => a.status !== 'offline').length
  const workingCount = agents.filter(a => a.status === 'working').length
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col border-r"
      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-subtle)', minHeight: '100vh' }}
    >
      {/* Logo */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6C8CFF, #A78BFA)' }}
          >
            AI
          </div>
          <div>
            <div className="text-sm font-bold gradient-text">Agent Dashboard</div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>v2</div>
          </div>
        </div>
      </div>

      {/* Agent List */}
      <div className="flex-1 py-2 overflow-y-auto">
        {agents.map(agent => {
          const meta = AGENT_META[agent.id]
          const statusCfg = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.idle
          const badge = unread?.[agent.id] ?? 0
          const isSelected = selectedAgent === agent.id

          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(isSelected ? null : agent.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all"
              style={{
                background: isSelected ? 'var(--bg-card)' : 'transparent',
                borderLeft: isSelected ? `3px solid ${meta?.color}` : '3px solid transparent',
                borderRadius: isSelected ? '0 8px 8px 0' : '0',
              }}
            >
              <AgentAvatar name={agent.id} status={agent.status} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {agent.id}
                  </span>
                  {badge > 0 && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-bold ml-1"
                      style={{ background: 'var(--accent)', color: '#fff', fontSize: 10 }}
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

      {/* Bottom Stats */}
      <div className="px-4 py-3 border-t space-y-1.5" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="text-xs flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--green)' }} />
          활성 {activeCount}/6
        </div>
        <div className="text-xs flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
          작업중 {workingCount}
        </div>
        <div className="text-xs flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--yellow)' }} />
          진행중 태스크 {inProgressCount}
        </div>
      </div>
    </aside>
  )
}
