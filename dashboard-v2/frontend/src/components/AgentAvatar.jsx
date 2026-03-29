import { AGENT_META, STATUS_CONFIG } from '../constants/agents'

const SIZES = {
  sm: { box: 24, font: 12, dot: 7, offset: -1 },
  md: { box: 40, font: 20, dot: 10, offset: -2 },
  lg: { box: 64, font: 32, dot: 14, offset: -3 },
}

export default function AgentAvatar({ name, status = 'idle', size = 'md' }) {
  const meta = AGENT_META[name]
  const s = SIZES[size]
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle

  if (!meta) return null

  return (
    <div style={{ position: 'relative', width: s.box, height: s.box, flexShrink: 0 }}>
      {/* 아바타 원형 */}
      <div style={{
        width: s.box,
        height: s.box,
        borderRadius: '50%',
        background: `${meta.color}33`,
        border: `2px solid ${meta.color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: s.font,
        lineHeight: 1,
        userSelect: 'none',
      }}>
        {meta.emoji}
      </div>

      {/* 상태 인디케이터 (우하단) */}
      <div style={{
        position: 'absolute',
        bottom: s.offset,
        right: s.offset,
        width: s.dot,
        height: s.dot,
        borderRadius: '50%',
        background: statusCfg.color,
        border: '2px solid #0F172A',
        animation: statusCfg.pulse ? 'agentPulse 1.5s infinite' : 'none',
      }} />
    </div>
  )
}
