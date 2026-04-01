import AgentAvatar from '../AgentAvatar'
import { AGENT_META } from '../../constants/agents'

export default function MessageBubble({ message, isSent, agentStatus = {} }) {
  const meta = AGENT_META[message.from]
  const time = new Date(message.ts).toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div
      className="flex gap-2 items-start"
      style={{ flexDirection: isSent ? 'row-reverse' : 'row' }}
    >
      <AgentAvatar
        name={message.from}
        status={agentStatus[message.from] ?? 'idle'}
        size="sm"
      />

      <div
        style={{
          maxWidth: 'min(95%, 520px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          alignItems: isSent ? 'flex-end' : 'flex-start',
        }}
      >
        {/* Sender + time + receiver */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {!isSent && (
            <span style={{ color: meta?.color, fontWeight: 600 }}>
              {meta?.emoji} {message.from}
            </span>
          )}
          <span className="font-mono tabular-nums">{time}</span>
          {message.to && (
            <span>→ {AGENT_META[message.to]?.emoji} {message.to}</span>
          )}
          {isSent && (
            <span style={{ color: meta?.color, fontWeight: 600 }}>
              {meta?.emoji} {message.from}
            </span>
          )}
        </div>

        {/* Bubble */}
        <div
          className="px-3.5 py-2.5 text-sm"
          style={{
            background: isSent ? (meta?.color ?? 'var(--accent)') : 'var(--bg-elevated)',
            color: isSent ? '#fff' : 'var(--text-primary)',
            borderRadius: isSent ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
            border: isSent ? 'none' : '1px solid var(--border-subtle)',
          }}
        >
          {message.message}
        </div>
      </div>
    </div>
  )
}
