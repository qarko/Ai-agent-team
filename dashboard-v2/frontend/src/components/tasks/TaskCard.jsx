import { useState } from 'react'
import { AGENT_META } from '../../constants/agents'

const PRIORITY_STYLE = {
  high:   { label: '높음', icon: '🔴', color: '#EF4444' },
  medium: { label: '중간', icon: '🟡', color: '#F59E0B' },
  low:    { label: '낮음', icon: '🟢', color: '#10B981' },
}

const STATUS_STYLE = {
  pending:     { label: '대기중',  bg: '#1E293B',   color: '#94A3B8', border: '#334155',   pulse: false },
  in_progress: { label: '진행중',  bg: '#8B5CF611', color: '#A78BFA', border: '#8B5CF644', pulse: true },
  completed:   { label: '완료',    bg: '#10B98111', color: '#34D399', border: '#10B98144', pulse: false },
  failed:      { label: '실패',    bg: '#EF444411', color: '#F87171', border: '#EF444444', pulse: false },
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
      className="rounded-xl border cursor-pointer transition-all"
      style={{
        background:   '#1E293B',
        borderColor:  isInProgress ? '#8B5CF633' : '#334155',
        padding:      '14px 16px',
      }}
      onClick={() => setExpanded(v => !v)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(v => !v) } }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">

          {/* ID + 우선순위 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono" style={{ color: '#475569' }}>
              #{task.id}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-md font-semibold"
              style={{ background: `${prio.color}22`, color: prio.color }}
            >
              {prio.icon} {prio.label}
            </span>
          </div>

          {/* 제목 */}
          <div className="font-medium" style={{ color: '#E2E8F0', fontSize: '14px' }}>
            {task.title}
          </div>

          {/* 담당자 */}
          {task.agent_id && (
            <div className="text-xs mt-1.5" style={{ color: meta?.color ?? '#94A3B8' }}>
              {meta?.emoji} {task.agent_id}
            </div>
          )}
        </div>

        {/* 상태 뱃지 — 더 눈에 띄게 */}
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

      {/* 펼쳐지는 설명 */}
      {expanded && task.description && (
        <div
          className="mt-3 text-sm rounded-lg px-3 py-2.5"
          style={{ background: '#0F172A', color: '#94A3B8', lineHeight: 1.6 }}
        >
          {task.description}
        </div>
      )}

      {/* 펼침 힌트 */}
      {task.description && (
        <div className="flex justify-end mt-2">
          <span className="text-xs" style={{ color: '#334155' }}>
            {expanded ? '▲ 접기' : '▼ 설명 보기'}
          </span>
        </div>
      )}
    </div>
  )
}
