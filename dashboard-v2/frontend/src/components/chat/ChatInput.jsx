import { useState } from 'react'
import { AGENT_META } from '../../constants/agents'

const API_BASE = import.meta.env.VITE_API_URL || ''

export default function ChatInput({ target, onTargetChange, agents }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSend() {
    const msg = text.trim()
    if (!msg || sending) return

    setSending(true)
    try {
      const res = await fetch(`${API_BASE}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: target, message: msg }),
      })
      if (res.ok) {
        setText('')
      }
    } catch {
      // ignore
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const meta = AGENT_META[target]

  return (
    <div
      className="flex-shrink-0 border-t px-3 sm:px-4 py-3 flex items-end gap-2 sticky bottom-0 z-10"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
    >
      {/* Agent selector */}
      <select
        value={target}
        onChange={e => onTargetChange(e.target.value)}
        aria-label="메시지 수신 에이전트"
        className="text-xs rounded-xl px-2.5 py-2 border outline-none flex-shrink-0"
        style={{
          background: 'var(--bg-inset)',
          borderColor: 'var(--border-subtle)',
          color: meta?.color ?? 'var(--text-secondary)',
          minHeight: 44,
        }}
      >
        {agents.map(name => (
          <option key={name} value={name}>
            {AGENT_META[name]?.emoji} {name}
          </option>
        ))}
      </select>

      {/* Input */}
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`${target}에게 메시지...`}
        aria-label={`${target}에게 메시지 입력`}
        maxLength={500}
        className="flex-1 text-sm rounded-xl px-3.5 py-2 border outline-none min-w-0 transition-all"
        style={{
          background: 'var(--bg-inset)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-primary)',
          minHeight: 44,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#6C8CFF44' }}
        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
      />

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!text.trim() || sending}
        aria-label={sending ? '전송 중' : `${target}에게 전송`}
        className="text-sm px-4 py-2 rounded-xl font-medium transition-all flex-shrink-0"
        style={{
          background: text.trim() ? 'var(--accent)' : 'var(--bg-elevated)',
          color: text.trim() ? '#fff' : 'var(--text-tertiary)',
          opacity: sending ? 0.5 : 1,
          minHeight: 44,
          boxShadow: text.trim() ? '0 2px 8px #6C8CFF33' : 'none',
        }}
      >
        {sending ? '...' : '전송'}
      </button>
    </div>
  )
}
