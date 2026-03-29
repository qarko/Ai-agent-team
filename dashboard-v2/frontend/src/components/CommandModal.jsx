import { useState } from 'react'
import AgentAvatar from './AgentAvatar'
import { AGENT_META } from '../constants/agents'

const API_BASE = import.meta.env.VITE_API_URL || ''
const ALLOWED_AGENTS = ['manager', 'planner', 'backend', 'frontend', 'reviewer', 'tester']
const MAX_LENGTH = 500

export default function CommandModal({ agent, status, onClose, onToast }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const meta = AGENT_META[agent]

  async function handleSend() {
    const cmd = text.trim()
    if (!cmd || !ALLOWED_AGENTS.includes(agent)) return
    if (cmd.length > MAX_LENGTH) return

    setSending(true)
    try {
      const res = await fetch(`${API_BASE}/api/agents/${agent}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      onToast?.(`${meta?.emoji} ${agent}에게 명령을 전송했습니다`)
      onClose()
    } catch (e) {
      onToast?.(`전송 실패: ${e.message}`, 'error')
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-[480px] mx-4 sm:mx-0 rounded-xl border"
        style={{ background: '#1E293B', borderColor: '#334155' }}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: '#334155' }}>
          <AgentAvatar name={agent} status={status} size="sm" />
          <span id="modal-title" className="font-semibold" style={{ color: '#F1F5F9' }}>
            <span aria-hidden="true">{meta?.emoji}</span> {agent} 에게 명령 전송
          </span>
          <button
            onClick={onClose}
            aria-label="모달 닫기"
            className="ml-auto text-lg leading-none min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
            style={{ color: '#94A3B8' }}
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-3">
          <textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={MAX_LENGTH}
            rows={4}
            placeholder="명령을 입력하세요... (Ctrl+Enter 전송)"
            className="w-full rounded-lg px-3 py-2 text-sm resize-none outline-none"
            style={{
              background: '#334155',
              color: '#F1F5F9',
              border: '1px solid #475569',
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: '#64748B' }}>
              {text.length}/{MAX_LENGTH}
            </span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                aria-label="명령 전송 취소"
                className="px-4 py-2.5 rounded-lg text-sm min-h-[44px]"
                style={{ background: '#334155', color: '#94A3B8' }}
              >
                취소
              </button>
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                aria-label={sending ? '전송 중' : '명령 전송'}
                className="px-4 py-2.5 rounded-lg text-sm font-medium min-h-[44px]"
                style={{
                  background: text.trim() && !sending ? '#8B5CF6' : '#334155',
                  color: text.trim() && !sending ? '#fff' : '#475569',
                  cursor: text.trim() && !sending ? 'pointer' : 'not-allowed',
                }}
              >
                {sending ? '전송 중...' : '전송'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
