import { useState } from 'react'
import AgentAvatar from './AgentAvatar'
import { AGENT_META, STATUS_CONFIG } from '../constants/agents'
import CommandModal from './CommandModal'
import { timeAgo } from '../utils/timeAgo'

/**
 * AgentCard
 * compact=false (default): Agents tab - full card
 * compact=true:            Overview tab - compact single line
 */
export default function AgentCard({ agent, onToast, compact = false }) {
  const [showModal, setShowModal] = useState(false)
  const meta      = AGENT_META[agent.id]
  const statusCfg = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.idle
  const isWorking = agent.status === 'working'
  const isError   = agent.status === 'error'
  const isOffline = agent.status === 'offline'
  const relTime   = timeAgo(agent.updated_at)

  /* Compact view (Overview) */
  if (compact) {
    return (
      <div
        className="card flex items-center gap-3 px-4"
        style={{
          borderColor: isWorking ? `${meta?.color}44` : 'var(--border-subtle)',
          borderLeftWidth: 3,
          borderLeftColor: isOffline ? 'var(--border-default)' : (meta?.color ?? '#6366F1'),
          minHeight: 56,
        }}
      >
        <span className="text-xl flex-shrink-0">{meta?.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {agent.id}
            </span>
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: statusCfg.color,
                animation: isWorking ? 'agentPulse 1.5s infinite' : undefined,
                boxShadow: isWorking ? `0 0 6px ${statusCfg.color}66` : 'none',
              }}
            />
            <span className="text-xs font-medium" style={{ color: statusCfg.color }}>
              {statusCfg.label}
            </span>
          </div>
          <p
            className="text-xs truncate mt-0.5"
            style={{
              color: isWorking ? 'var(--green)' : 'var(--text-tertiary)',
              fontWeight: isWorking ? 600 : 400,
            }}
            title={agent.current_task || ''}
          >
            {agent.current_task || '대기 중'}
          </p>
        </div>
        <span className="text-xs flex-shrink-0 font-mono" style={{ color: 'var(--text-tertiary)' }}>
          {relTime}
        </span>
      </div>
    )
  }

  /* Full view (Agents tab) */
  return (
    <>
      <div
        className="card card-glow flex flex-col gap-3.5 relative overflow-hidden transition-all"
        style={{
          borderColor: isWorking
            ? `${meta?.color}44`
            : isError ? '#FF5C5C33' : 'var(--border-subtle)',
          padding: '18px',
        }}
      >
        {/* Top color line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: isOffline
              ? 'var(--border-default)'
              : `linear-gradient(90deg, ${meta?.color ?? '#6366F1'}, transparent)`,
          }}
        />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <AgentAvatar name={agent.id} status={agent.status} size="md" />
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                {agent.id} {meta?.emoji}
              </div>
              <div className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                {agent.role ?? meta?.role}
              </div>
            </div>
          </div>
          <span
            className="text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 flex-shrink-0"
            style={{
              background: `${statusCfg.color}18`,
              color: statusCfg.color,
              border: `1px solid ${statusCfg.color}33`,
            }}
          >
            {statusCfg.pulse && (
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: statusCfg.color, animation: 'agentPulse 1.5s infinite' }}
              />
            )}
            {statusCfg.label}
          </span>
        </div>

        {/* Current task */}
        <div
          className={`text-sm px-4 py-3 rounded-xl border ${isWorking ? 'task-glow' : ''}`}
          style={{
            background: isWorking ? '#00D68F0A' : 'var(--bg-inset)',
            color: isWorking ? 'var(--green)' : 'var(--text-secondary)',
            borderColor: isWorking ? 'rgba(0,214,143,0.2)' : 'var(--border-subtle)',
          }}
          title={agent.current_task || '작업 없음'}
        >
          {agent.current_task
            ? <span>"{agent.current_task}"</span>
            : <span style={{ opacity: 0.4, fontStyle: 'italic' }}>대기 중...</span>
          }
        </div>

        {/* Meta + relative time */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs px-2.5 py-1 rounded-lg font-mono"
            style={{ background: 'var(--bg-inset)', color: 'var(--text-tertiary)', border: '1px solid var(--border-subtle)' }}
          >
            {agent.model ?? meta?.model}
          </span>
          <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
            {relTime}
          </span>
        </div>

        {/* Command button */}
        <button
          onClick={() => setShowModal(true)}
          disabled={isOffline}
          className="w-full rounded-xl text-sm font-medium transition-all"
          style={{
            background: isOffline ? 'var(--bg-inset)' : 'var(--border-default)',
            color: isOffline ? 'var(--text-tertiary)' : 'var(--text-secondary)',
            cursor: isOffline ? 'not-allowed' : 'pointer',
            minHeight: 44,
            border: '1px solid var(--border-subtle)',
          }}
          onMouseEnter={e => {
            if (!isOffline) {
              e.currentTarget.style.background = 'var(--accent-muted)'
              e.currentTarget.style.color = 'var(--accent)'
              e.currentTarget.style.borderColor = '#6C8CFF33'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = isOffline ? 'var(--bg-inset)' : 'var(--border-default)'
            e.currentTarget.style.color = isOffline ? 'var(--text-tertiary)' : 'var(--text-secondary)'
            e.currentTarget.style.borderColor = 'var(--border-subtle)'
          }}
        >
          {isOffline ? '오프라인' : '명령 보내기'}
        </button>
      </div>

      {showModal && (
        <CommandModal
          agent={agent.id}
          status={agent.status}
          onClose={() => setShowModal(false)}
          onToast={onToast}
        />
      )}
    </>
  )
}
