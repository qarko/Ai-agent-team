import { useState } from 'react'
import { AGENT_META } from '../../constants/agents'

const PRIORITY_STYLE = {
  high:   { label: '높음', color: '#FF5C5C' },
  medium: { label: '중간', color: '#FFB545' },
  low:    { label: '낮음', color: '#00D68F' },
}

const STATUS_STYLE = {
  pending:     { label: '대기중',  bg: 'var(--bg-card)',   color: 'var(--text-secondary)', border: 'var(--border-subtle)',   pulse: false },
  in_progress: { label: '진행중',  bg: '#6C8CFF0C', color: '#6C8CFF', border: '#6C8CFF33', pulse: true },
  completed:   { label: '완료',    bg: '#00D68F0C', color: '#00D68F', border: '#00D68F33', pulse: false },
  failed:      { label: '실패',    bg: '#FF5C5C0C', color: '#FF5C5C', border: '#FF5C5C33', pulse: false },
}

export default function TaskCard({ task }) {
  const [expanded, setExpanded] = useState(false)
  const meta = AGENT_META[task.agent_id]
  const prio = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.medium
  const st   = STATUS_STYLE[task.status]     ?? STATUS_STYLE.pending
  const isInProgress = task.status === 'in_progress'

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label={`작업 #${task.id}: ${task.title}`}
      className="card cursor-pointer transition-all"
      style={{
        borderColor:  isInProgress ? '#6C8CFF33' : 'var(--border-subtle)',
        padding:      '16px 18px',
      }}
      onClick={() => setExpanded(v => !v)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(v => !v) } }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">

          {/* ID + Priority */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
              #{task.id}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-md font-semibold"
              style={{ background: `${prio.color}18`, color: prio.color }}
            >
              {prio.label}
            </span>
          </div>

          {/* Title */}
          <div className="font-medium" style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
            {task.title}
          </div>

          {/* Assignee */}
          {task.agent_id && (
            <div className="text-xs mt-1.5 flex items-center gap-1.5" style={{ color: meta?.color ?? 'var(--text-secondary)' }}>
              {meta?.emoji} {task.agent_id}
            </div>
          )}
        </div>

        {/* Status badge */}
        <span
          className="text-xs px-3 py-1.5 rounded-lg font-semibold flex-shrink-0 flex items-center gap-1.5"
          style={{
            background: st.bg,
            color:      st.color,
            border:     `1px solid ${st.border}`,
            minWidth:   56,
            textAlign:  'center',
          }}
        >
          {st.pulse && (
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: st.color, animation: 'agentPulse 1.5s infinite' }}
            />
          )}
          {st.label}
        </span>
      </div>

      {/* Expanded description */}
      {expanded && task.description && (
        <div
          className="mt-3 text-sm rounded-xl px-4 py-3"
          style={{ background: 'var(--bg-inset)', color: 'var(--text-secondary)', lineHeight: 1.7, border: '1px solid var(--border-subtle)' }}
        >
          {task.description}
        </div>
      )}

      {/* Expand hint */}
      {task.description && (
        <div className="flex justify-end mt-2">
          <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)', opacity: 0.6 }}>
            {expanded ? '▲ 접기' : '▼ 설명 보기'}
          </span>
        </div>
      )}
    </div>
  )
}
