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

      {/* 모바일: max 95%, 데스크톱: max 72% */}
      <div
        style={{
          maxWidth: 'min(95%, 520px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          alignItems: isSent ? 'flex-end' : 'flex-start',
        }}
      >
        {/* 발신자 + 시간 + 수신자 */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs" style={{ color: '#64748B' }}>
          {!isSent && (
            <span style={{ color: meta?.color, fontWeight: 600 }}>
              {meta?.emoji} {message.from}
            </span>
          )}
          <span>{time}</span>
          {message.to && (
            <span>→ {AGENT_META[message.to]?.emoji} {message.to}</span>
          )}
          {isSent && (
            <span style={{ color: meta?.color, fontWeight: 600 }}>
              {meta?.emoji} {message.from}
            </span>
          )}
        </div>

        {/* 버블 */}
        <div
          className="px-3 py-2.5 text-sm"
          style={{
            background: isSent ? (meta?.color ?? '#8B5CF6') : '#334155',
            color: '#F1F5F9',
            borderRadius: isSent ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
          }}
        >
          {message.message}
        </div>
      </div>
    </div>
  )
}
