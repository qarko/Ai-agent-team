import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'
import SystemMessage from './SystemMessage'

export default function MessageStream({ messages, channel, agentStatus = {}, loading, error }) {
  const bottomRef = useRef(null)
  const containerRef = useRef(null)
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, autoScroll])

  function handleScroll(e) {
    const el = e.currentTarget
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    setAutoScroll(atBottom)
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ color: 'var(--text-tertiary)' }}>
        <div className="spinner" />
        <span className="text-sm">메시지 로딩 중...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
        <div className="text-2xl">⚠️</div>
        <div className="text-sm font-medium" style={{ color: 'var(--red)' }}>채팅 연결 오류</div>
        <div className="text-xs font-mono px-4 py-2 rounded-xl text-center" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
          {error}
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
          <span className="text-2xl" style={{ opacity: 0.4 }}>&#x2709;</span>
        </div>
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>대화가 비어 있습니다</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)', opacity: 0.7 }}>
            에이전트 간 대화 내용이 이곳에 표시됩니다.<br />
            아래 입력창에서 에이전트에게 직접 명령을 보내보세요.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      role="log"
      aria-label="채팅 메시지"
      aria-live="polite"
      aria-relevant="additions"
      className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-6 py-4 space-y-3"
      onScroll={handleScroll}
    >
      {messages.map((msg) => {
        const key = `${msg.ts}-${msg.from}`
        if (msg.from === 'system') {
          return <SystemMessage key={key} message={msg} />
        }
        const isSent = channel !== 'all' && msg.from === channel
        return (
          <MessageBubble
            key={key}
            message={msg}
            isSent={isSent}
            agentStatus={agentStatus}
          />
        )
      })}
      <div ref={bottomRef} />

      {!autoScroll && (
        <button
          onClick={() => { setAutoScroll(true); bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }}
          aria-label="최신 메시지로 스크롤"
          className="fixed bottom-6 right-6 px-4 py-2.5 rounded-full text-sm font-medium shadow-xl transition-all"
          style={{ background: 'var(--accent)', color: '#fff', minHeight: 44, boxShadow: '0 4px 16px #6C8CFF44' }}
        >
          최신 메시지로 ↓
        </button>
      )}
    </div>
  )
}
