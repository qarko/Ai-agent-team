import { useState } from 'react'
import AgentAvatar from './AgentAvatar'
import { AGENT_META, STATUS_CONFIG } from '../constants/agents'
import CommandModal from './CommandModal'
import { timeAgo } from '../utils/timeAgo'

/**
 * AgentCard
 * compact=false (기본): Agents 탭 — 풀 카드
 * compact=true:         Overview 탭 — 한 줄 컴팩트 카드
 */
export default function AgentCard({ agent, onToast, compact = false }) {
  const [showModal, setShowModal] = useState(false)
  const meta      = AGENT_META[agent.id]
  const statusCfg = STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.idle
  const isWorking = agent.status === 'working'
  const isError   = agent.status === 'error'
  const isOffline = agent.status === 'offline'
  const relTime   = timeAgo(agent.updated_at)

  /* ── 컴팩트 뷰 (Overview 전용) ──────────────────────────────────── */
  if (compact) {
    return (
      <div
        className="rounded-xl border flex items-center gap-3 px-4"
        style={{
          background: '#1E293B',
          borderColor: isWorking ? `${meta?.color}55` : '#334155',
          borderLeftWidth: 3,
          borderLeftColor: isOffline ? '#374151' : (meta?.color ?? '#6366F1'),
          minHeight: 56,
        }}
      >
        <span className="text-xl flex-shrink-0">{meta?.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>
              {agent.id}
            </span>
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: statusCfg.color,
                animation: isWorking ? 'agentPulse 1.5s infinite' : undefined,
              }}
            />
            <span className="text-xs font-medium" style={{ color: statusCfg.color }}>
              {statusCfg.label}
            </span>
          </div>
          <p
            className="text-xs truncate mt-0.5"
            style={{
              color: isWorking ? '#6EE7B7' : '#64748B',
              fontWeight: isWorking ? 600 : 400,
            }}
            title={agent.current_task || ''}
          >
            {agent.current_task || '대기 중'}
          </p>
        </div>
        <span className="text-xs flex-shrink-0" style={{ color: '#475569' }}>
          {relTime}
        </span>
      </div>
    )
  }

  /* ── 풀 뷰 (Agents 탭) ──────────────────────────────────────────── */
  return (
    <>
      <div
        className="rounded-xl sm:rounded-2xl border flex flex-col gap-3 relative overflow-hidden transition-all"
        style={{
          background: '#1E293B',
          borderColor: isWorking
            ? `${meta?.color}44`
            : isError ? '#EF444433' : '#334155',
          padding: '16px',
        }}
      >
        {/* 상단 컬러 라인 */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{
            background: isOffline
              ? '#374151'
              : `linear-gradient(90deg, ${meta?.color ?? '#6366F1'}, transparent)`,
          }}
        />

        {/* 헤더: 아바타 + 이름 + 상태 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <AgentAvatar name={agent.id} status={agent.status} size="md" />
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold truncate" style={{ color: '#F1F5F9' }}>
                {agent.id} {meta?.emoji}
              </div>
              <div className="text-xs sm:text-sm" style={{ color: '#94A3B8' }}>
                {agent.role ?? meta?.role}
              </div>
            </div>
          </div>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 flex-shrink-0"
            style={{
              background: `${statusCfg.color}22`,
              color: statusCfg.color,
              border: `1px solid ${statusCfg.color}44`,
            }}
          >
            {statusCfg.pulse && (
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: statusCfg.color, animation: 'agentPulse 1.5s infinite' }}
              />
            )}
            {statusCfg.label}
          </span>
        </div>

        {/* 현재 작업 — working이면 녹색 강조 */}
        <div
          className={`text-sm px-4 py-3 rounded-xl border ${isWorking ? 'task-glow' : ''}`}
          style={{
            background: isWorking ? '#0D2B1E' : '#0F172A',
            color: isWorking ? '#6EE7B7' : '#94A3B8',
            borderColor: isWorking ? 'rgba(16,185,129,0.2)' : 'transparent',
          }}
          title={agent.current_task || '작업 없음'}
        >
          {agent.current_task
            ? <span>"{agent.current_task}"</span>
            : <span style={{ opacity: 0.5, fontStyle: 'italic' }}>대기 중...</span>
          }
        </div>

        {/* 메타 + 상대 시간 */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs px-2 py-1 rounded-lg"
            style={{ background: '#0F172A', color: '#64748B' }}
          >
            {agent.model ?? meta?.model}
          </span>
          <span className="text-xs" style={{ color: '#475569' }}>
            {relTime}
          </span>
        </div>

        {/* 명령 버튼 */}
        <button
          onClick={() => setShowModal(true)}
          disabled={isOffline}
          className="w-full rounded-xl text-sm font-medium transition-all"
          style={{
            background: isOffline ? '#1E293B' : '#334155',
            color: isOffline ? '#374151' : '#94A3B8',
            cursor: isOffline ? 'not-allowed' : 'pointer',
            minHeight: 44,
          }}
          onMouseEnter={e => {
            if (!isOffline) {
              e.currentTarget.style.background = '#475569'
              e.currentTarget.style.color = '#F1F5F9'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = isOffline ? '#1E293B' : '#334155'
            e.currentTarget.style.color = isOffline ? '#374151' : '#94A3B8'
          }}
        >
          {isOffline ? '오프라인' : '명령 보내기'}
        </button>
      </div>

      {showModal && (
        <CommandModal
          agent={agent.id}
          status={agent.status}
          onClose={() => setShowModal(false)}
          onToast={onToast}
        />
      )}
    </>
  )
}
