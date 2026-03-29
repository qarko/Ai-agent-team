import { AGENT_NAMES, AGENT_META } from '../../constants/agents'

const STATUS_OPTIONS = [
  { value: 'all',         label: '전체',   color: '#6366F1' },
  { value: 'pending',     label: '대기중', color: '#64748B' },
  { value: 'in_progress', label: '진행중', color: '#60A5FA' },
  { value: 'completed',   label: '완료',   color: '#34D399' },
  { value: 'failed',      label: '실패',   color: '#F87171' },
]

export default function TaskFilter({ statusFilter, assigneeFilter, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* 상태 필터 */}
      {STATUS_OPTIONS.map(opt => {
        const isActive = statusFilter === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange({ statusFilter: opt.value, assigneeFilter })}
            className="px-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background:  isActive ? `${opt.color}22` : '#1E293B',
              color:       isActive ? opt.color : '#64748B',
              border:      `1px solid ${isActive ? opt.color + '55' : '#334155'}`,
              minHeight:   44,
              paddingTop:  '8px',
              paddingBottom: '8px',
            }}
          >
            {opt.label}
          </button>
        )
      })}

      {/* 담당자 필터 */}
      <select
        value={assigneeFilter}
        onChange={e => onChange({ statusFilter, assigneeFilter: e.target.value })}
        aria-label="담당자 필터"
        className="ml-auto rounded-xl px-3 text-sm outline-none"
        style={{
          background: '#1E293B',
          color:      '#94A3B8',
          border:     '1px solid #334155',
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
