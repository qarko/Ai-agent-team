import { AGENT_META } from '../../constants/agents'

export default function RecentChat({ messages, onGotoChat }) {
  if (!messages?.length) {
    return (
      <div className="text-sm text-center py-10 flex flex-col items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
        <span className="text-xl opacity-40">💬</span>
        최근 메시지가 없습니다
      </div>
    )
  }

  return (
    <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
      {messages.slice(-5).reverse().map((msg, i) => {
        const meta = AGENT_META[msg.from]
        const time = new Date(msg.ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

        return (
          <div key={i} className="flex gap-3 items-start p-3.5 transition-colors"
            style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-inset)' }}>
            <span className="text-lg leading-none flex-shrink-0 mt-0.5">{meta?.emoji ?? '💬'}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm" style={{ color: meta?.color ?? 'var(--text-secondary)' }}>
                  {msg.from}
                </span>
                {msg.to && (
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>→ {msg.to}</span>
                )}
                <span className="text-xs ml-auto font-mono tabular-nums" style={{ color: 'var(--text-tertiary)' }}>{time}</span>
              </div>
              <div className="text-sm truncate mt-1" style={{ color: 'var(--text-secondary)' }}>
                {msg.message}
              </div>
            </div>
          </div>
        )
      })}
      <button
        onClick={onGotoChat}
        className="text-sm w-full text-center py-3 font-medium transition-colors"
        style={{ color: 'var(--accent)' }}
      >
        채팅 더보기 →
      </button>
    </div>
  )
}
