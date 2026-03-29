export const AGENT_META = {
  manager: {
    emoji: '🎯',
    color: '#6366F1',
    role: '총괄',
    model: 'Sonnet 4.6',
    tmux: 'agent-manager',
  },
  planner: {
    emoji: '📋',
    color: '#8B5CF6',
    role: '기획',
    model: 'Sonnet 4.6',
    tmux: 'agent-planner',
  },
  backend: {
    emoji: '⚙️',
    color: '#0EA5E9',
    role: '백엔드',
    model: 'Sonnet 4.6',
    tmux: 'agent-backend',
  },
  frontend: {
    emoji: '🎨',
    color: '#EC4899',
    role: '프론트엔드',
    model: 'Sonnet 4.6',
    tmux: 'agent-frontend',
  },
  reviewer: {
    emoji: '🔍',
    color: '#F59E0B',
    role: '리뷰',
    model: 'Opus 4.6',
    tmux: 'agent-reviewer',
  },
  tester: {
    emoji: '🧪',
    color: '#10B981',
    role: '테스트',
    model: 'Haiku 4.5',
    tmux: 'agent-tester',
  },
}

export const AGENT_NAMES = Object.keys(AGENT_META)

export const STATUS_CONFIG = {
  working: { label: '작업중', color: '#10B981', pulse: true },
  idle:    { label: '대기중', color: '#6B7280', pulse: false },
  error:   { label: '오류',   color: '#EF4444', pulse: false },
  offline: { label: '오프라인', color: '#374151', pulse: false },
}
