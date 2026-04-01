import { AGENT_NAMES, AGENT_META } from '../../constants/agents'

const STATUS_OPTIONS = [
  { value: 'all',         label: '전체',   color: '#6C8CFF' },
  { value: 'pending',     label: '대기중', color: '#5E5E6E' },
  { value: 'in_progress', label: '진행중', color: '#6C8CFF' },
  { value: 'completed',   label: '완료',   color: '#00D68F' },
  { value: 'failed',      label: '실패',   color: '#FF5C5C' },
]

export default function TaskFilter({ statusFilter, assigneeFilter, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {/* Status filter */}
      {STATUS_OPTIONS.map(opt => {
        const isActive = statusFilter === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange({ statusFilter: opt.value, assigneeFilter })}
            className="px-3.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background:  isActive ? `${opt.color}18` : 'var(--bg-card)',
              color:       isActive ? opt.color : 'var(--text-tertiary)',
              border:      `1px solid ${isActive ? opt.color + '44' : 'var(--border-subtle)'}`,
              minHeight:   44,
              paddingTop:  '8px',
              paddingBottom: '8px',
            }}
          >
            {opt.label}
          </button>
        )
      })}

      {/* Assignee filter */}
      <select
        value={assigneeFilter}
        onChange={e => onChange({ statusFilter, assigneeFilter: e.target.value })}
        aria-label="담당자 필터"
        className="ml-auto rounded-xl px-3 text-sm outline-none"
        style={{
          background: 'var(--bg-card)',
          color:      'var(--text-secondary)',
          border:     '1px solid var(--border-subtle)',
          minHeight:  44,
        }}
      >
        <option value="all">담당자: 전체</option>
        {AGENT_NAMES.map(n => (
          <option key={n} value={n}>
            {AGENT_META[n]?.emoji} {n}
          </option>
        ))}
      </select>
    </div>
  )
}
