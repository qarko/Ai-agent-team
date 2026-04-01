import { AGENT_META, AGENT_NAMES } from '../../constants/agents'

export default function ChannelList({ active, onChange, unread = {} }) {
  const channels = ['all', ...AGENT_NAMES]

  return (
    <div
      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 border-b flex-shrink-0 flex-wrap"
      style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-subtle)' }}
    >
      {channels.map(ch => {
        const meta = ch === 'all' ? null : AGENT_META[ch]
        const badge = ch === 'all' ? 0 : (unread[ch] ?? 0)
        const isActive = active === ch

        return (
          <button
            key={ch}
            onClick={() => onChange(ch)}
            aria-label={ch === 'all' ? '전체 채널' : `${ch} 채널`}
            aria-pressed={isActive}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap min-h-[44px]"
            style={{
              background: isActive ? (meta ? `${meta.color}18` : 'var(--accent-muted)') : 'var(--bg-card)',
              color: isActive ? (meta ? meta.color : 'var(--accent)') : 'var(--text-tertiary)',
              border: `1px solid ${isActive ? (meta ? meta.color + '33' : '#6C8CFF33') : 'var(--border-subtle)'}`,
            }}
          >
            <span aria-hidden="true">{meta ? meta.emoji : '📡'}</span>
            <span>{ch === 'all' ? '전체' : ch}</span>
            {badge > 0 && (
              <span
                className="text-xs rounded-full px-1.5 py-0.5 font-bold"
                style={{ background: 'var(--accent)', color: '#fff', fontSize: 10 }}
              >
                {badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
