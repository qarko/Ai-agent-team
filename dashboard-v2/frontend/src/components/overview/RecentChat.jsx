import { AGENT_META } from '../../constants/agents'

export default function RecentChat({ messages, onGotoChat }) {
  if (!messages?.length) {
    return (
      <div className="text-sm text-center py-8" style={{ color: '#64748B' }}>
        최근 메시지가 없습니다
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {messages.slice(-5).reverse().map((msg, i) => {
        const meta = AGENT_META[msg.from]
        const time = new Date(msg.ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

        return (
          <div key={i} className="flex gap-3 items-start p-3 rounded-xl" style={{ background: '#0F172A' }}>
            <span className="text-lg leading-none flex-shrink-0 mt-0.5">{meta?.emoji ?? '💬'}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm" style={{ color: meta?.color ?? '#94A3B8' }}>
                  {msg.from}
                </span>
                {msg.to && (
                  <span className="text-xs" style={{ color: '#64748B' }}>→ {msg.to}</span>
                )}
                <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{time}</span>
              </div>
              <div className="text-sm truncate mt-1" style={{ color: '#94A3B8' }}>
                {msg.message}
              </div>
            </div>
          </div>
        )
      })}
      <button
        onClick={onGotoChat}
        className="text-sm w-full text-center pt-2 font-medium"
        style={{ color: '#8B5CF6' }}
      >
        채팅 더보기 →
      </button>
    </div>
  )
}
