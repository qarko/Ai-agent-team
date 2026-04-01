import { useState, useEffect } from 'react'
import './index.css'

const API = import.meta.env.VITE_API_URL || ''

const TABS = [
  { id: 'overview', label: '개요', icon: '📊' },
  { id: 'projects', label: '프로젝트', icon: '📁' },
  { id: 'jobs',     label: '작업', icon: '⏳' },
]

function useApi(endpoint, interval = 5000) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    async function fetch_() {
      try {
        const res = await fetch(`${API}/api/system/${endpoint}`)
        if (res.ok && active) setData(await res.json())
      } catch (_) {}
      if (active) setLoading(false)
    }
    fetch_()
    const id = setInterval(fetch_, interval)
    return () => { active = false; clearInterval(id) }
  }, [endpoint, interval])
  return { data, loading }
}

// ── Card Component ──
function Card({ title, children, className = '', accent }) {
  return (
    <div className={`card card-glow p-5 ${className}`}>
      {title && (
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2"
          style={{ color: 'var(--text-tertiary)' }}>
          {accent && <span className="w-1 h-3.5 rounded-full" style={{ background: accent }} />}
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

function StatBox({ label, value, sub, color = 'var(--text-primary)', icon }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {icon && (
        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1"
          style={{ background: `${color}15` }}>
          <span className="text-base">{icon}</span>
        </div>
      )}
      <div className="text-2xl font-bold tabular-nums tracking-tight" style={{ color }}>{value}</div>
      <div className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{label}</div>
      {sub && <div className="text-xs" style={{ color: 'var(--text-tertiary)', opacity: 0.7 }}>{sub}</div>}
    </div>
  )
}

function ProgressBar({ percent, color = 'var(--accent)', label }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
          <span className="text-xs font-mono tabular-nums" style={{ color }}>{percent}%</span>
        </div>
      )}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-inset)' }}>
        <div className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(percent, 100)}%`,
            background: `linear-gradient(90deg, ${color}, ${color}CC)`,
          }} />
      </div>
    </div>
  )
}

function SystemHistoryChart({ data }) {
  if (!data || data.length < 2) {
    return (
      <div className="text-xs text-center py-8 flex flex-col items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-inset)' }}>
          <span className="text-sm">📈</span>
        </div>
        데이터 수집 중... (최소 2개 스냅샷 필요)
      </div>
    )
  }

  const points = data.slice(-30)
  const W = 500, H = 160, PAD_L = 38, PAD_R = 10, PAD_T = 12, PAD_B = 28
  const chartW = W - PAD_L - PAD_R
  const chartH = H - PAD_T - PAD_B

  function toPath(key, pts) {
    return pts.map((p, i) => {
      const x = PAD_L + (i / (pts.length - 1)) * chartW
      const y = PAD_T + chartH - (p[key] / 100) * chartH
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' ')
  }

  function toAreaPath(key, pts) {
    const linePath = pts.map((p, i) => {
      const x = PAD_L + (i / (pts.length - 1)) * chartW
      const y = PAD_T + chartH - (p[key] / 100) * chartH
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    }).join(' ')
    const lastX = PAD_L + ((pts.length - 1) / (pts.length - 1)) * chartW
    const firstX = PAD_L
    const bottom = PAD_T + chartH
    return `${linePath} L${lastX},${bottom} L${firstX},${bottom} Z`
  }

  const gridLines = [0, 25, 50, 75, 100]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 200 }}>
      <defs>
        <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00D68F" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#00D68F" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6C8CFF" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#6C8CFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {gridLines.map(v => {
        const y = PAD_T + chartH - (v / 100) * chartH
        return (
          <g key={v}>
            <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#1E1E24" strokeWidth="0.5" />
            <text x={PAD_L - 6} y={y + 3} textAnchor="end" fill="#5E5E6E" fontSize="8" fontFamily="monospace">{v}%</text>
          </g>
        )
      })}

      {/* Area fills */}
      <path d={toAreaPath('cpu_percent', points)} fill="url(#cpuGrad)" />
      <path d={toAreaPath('ram_percent', points)} fill="url(#ramGrad)" />

      {/* CPU line */}
      <path d={toPath('cpu_percent', points)} fill="none" stroke="#00D68F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* RAM line */}
      <path d={toPath('ram_percent', points)} fill="none" stroke="#6C8CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Disk line */}
      <path d={toPath('disk_percent', points)} fill="none" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4,3" opacity="0.7" />

      {/* Legend */}
      <rect x={PAD_L} y={H - 12} width="6" height="6" rx="1.5" fill="#00D68F" />
      <text x={PAD_L + 10} y={H - 6} fill="#9A9AA8" fontSize="8" fontFamily="system-ui">CPU</text>
      <rect x={PAD_L + 40} y={H - 12} width="6" height="6" rx="1.5" fill="#6C8CFF" />
      <text x={PAD_L + 50} y={H - 6} fill="#9A9AA8" fontSize="8" fontFamily="system-ui">RAM</text>
      <rect x={PAD_L + 82} y={H - 12} width="6" height="6" rx="1.5" fill="#A78BFA" opacity="0.7" />
      <text x={PAD_L + 92} y={H - 6} fill="#9A9AA8" fontSize="8" fontFamily="system-ui">Disk</text>
    </svg>
  )
}

// ── Overview Page ──
function OverviewPage() {
  const { data, loading } = useApi('overview', 3000)
  const { data: historyData } = useApi('history', 60000)

  if (loading || !data) return (
    <div className="p-6 flex items-center justify-center gap-3" style={{ color: 'var(--text-tertiary)' }}>
      <span className="spinner spinner-sm" />
      <span className="text-sm">로딩 중...</span>
    </div>
  )

  const { system: sys, processes, environment: env } = data

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
      {/* System Stats */}
      <Card title="시스템 리소스" accent="var(--green)">
        <div className="grid grid-cols-3 gap-6 mb-5">
          <StatBox
            label="CPU" value={`${sys.cpu_percent}%`}
            sub={`${sys.cpu_cores} cores`}
            color={sys.cpu_percent > 80 ? 'var(--red)' : 'var(--green)'}
            icon="⚡"
          />
          <StatBox
            label="RAM" value={`${sys.ram_percent}%`}
            sub={`${sys.ram_used_gb}/${sys.ram_total_gb}GB`}
            color={sys.ram_percent > 80 ? 'var(--red)' : 'var(--accent)'}
            icon="💾"
          />
          <StatBox
            label="디스크" value={`${sys.disk_percent}%`}
            sub={`${sys.disk_used_gb}/${sys.disk_total_gb}GB`}
            color="var(--purple)"
            icon="💿"
          />
        </div>
        <div className="space-y-3">
          <ProgressBar percent={sys.cpu_percent} color="var(--green)" label="CPU" />
          <ProgressBar percent={sys.ram_percent} color="var(--accent)" label="RAM" />
          <ProgressBar percent={sys.disk_percent} color="var(--purple)" label="디스크" />
        </div>
      </Card>

      {/* System History Chart */}
      <Card title="시스템 히스토리 (최근 30분)" accent="var(--accent)">
        <SystemHistoryChart data={historyData?.history} />
      </Card>

      {/* Processes */}
      <Card title={`프로세스 (상위 ${processes.length}개)`} accent="var(--yellow)">
        <div className="space-y-0 max-h-64 overflow-y-auto -mx-1 px-1">
          {processes.map((p, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-2.5 border-b last:border-b-0"
              style={{ borderColor: 'var(--border-subtle)' }}>
              <span className="truncate flex-1 mr-3 font-medium" style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
              <span className="flex-shrink-0 flex gap-4 font-mono tabular-nums">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.cpu > 50 ? 'var(--red)' : 'var(--green)' }} />
                  <span style={{ color: p.cpu > 50 ? 'var(--red)' : 'var(--green)' }}>{p.cpu}%</span>
                </span>
                <span style={{ color: 'var(--text-tertiary)' }}>{p.uptime}</span>
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Environment */}
      <Card title="환경" accent="var(--purple)">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <div className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--purple)' }}>
              <span className="w-5 h-5 rounded-md flex items-center justify-center text-xs" style={{ background: 'var(--purple)', opacity: 0.15 }}>P</span>
              플러그인 ({env.plugins.length})
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {env.plugins.map((p, i) => (
                <div key={i} className="text-xs py-1 px-2 rounded-md truncate"
                  style={{ color: 'var(--text-secondary)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-inset)' }}>
                  {p.split('@')[0]}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
              <span className="w-5 h-5 rounded-md flex items-center justify-center text-xs" style={{ background: 'var(--accent)', opacity: 0.15 }}>S</span>
              스킬 ({env.skills.length})
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {env.skills.map((s, i) => (
                <div key={i} className="text-xs py-1 px-2 rounded-md truncate"
                  style={{ color: 'var(--text-secondary)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-inset)' }}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
        {env.tmux_sessions.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div className="text-xs font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--green)' }}>
              <span className="w-5 h-5 rounded-md flex items-center justify-center text-xs" style={{ background: 'var(--green)', opacity: 0.15 }}>T</span>
              tmux 세션 ({env.tmux_sessions.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {env.tmux_sessions.map((s, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-lg font-mono"
                  style={{ background: 'var(--bg-inset)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

// ── Projects Page ──
function ProjectsPage() {
  const { data, loading } = useApi('projects', 10000)

  if (loading || !data) return (
    <div className="p-6 flex items-center justify-center gap-3" style={{ color: 'var(--text-tertiary)' }}>
      <span className="spinner spinner-sm" />
      <span className="text-sm">로딩 중...</span>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-4xl mx-auto">
      {data.projects.map((proj, i) => (
        <div key={i} className="card card-glow p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent-muted)' }}>
                <span className="text-lg">📁</span>
              </div>
              <div>
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{proj.name}</span>
                {proj.railway_project && (
                  <div className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }} />
                    Railway: <span style={{ color: 'var(--green)' }}>{proj.railway_project}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {proj.branch && (
                <span className="text-xs px-2.5 py-1 rounded-lg font-mono"
                  style={{ background: 'var(--accent-muted)', color: 'var(--accent)', border: '1px solid #6C8CFF33' }}>
                  {proj.branch}
                </span>
              )}
              {proj.changed_files > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-lg font-medium"
                  style={{ background: '#FFB54522', color: 'var(--yellow)' }}>
                  {proj.changed_files} 변경
                </span>
              )}
            </div>
          </div>

          {proj.last_commit && (
            <div className="text-xs mb-3 px-3 py-2 rounded-lg flex items-center gap-2"
              style={{ background: 'var(--bg-inset)', color: 'var(--text-tertiary)' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" opacity="0.5">
                <path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.25a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"/>
              </svg>
              {proj.last_commit}
            </div>
          )}

          {proj.recent_commits && (
            <div className="space-y-0 rounded-lg overflow-hidden" style={{ background: 'var(--bg-inset)' }}>
              {proj.recent_commits.map((c, j) => (
                <div key={j} className="text-xs py-2 px-3 border-b last:border-b-0 font-mono"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  {c}
                </div>
              ))}
            </div>
          )}

          {proj.error && (
            <div className="text-xs mt-3 px-3 py-2 rounded-lg flex items-center gap-2"
              style={{ background: '#FF5C5C11', color: 'var(--red)', border: '1px solid #FF5C5C22' }}>
              <span>!</span> {proj.error}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Jobs Page ──
function JobsPage() {
  const { data, loading } = useApi('jobs', 5000)

  if (loading || !data) return (
    <div className="p-6 flex items-center justify-center gap-3" style={{ color: 'var(--text-tertiary)' }}>
      <span className="spinner spinner-sm" />
      <span className="text-sm">로딩 중...</span>
    </div>
  )

  if (data.jobs.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-3" style={{ color: 'var(--text-tertiary)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--bg-card)' }}>
          <span className="text-3xl">😴</span>
        </div>
        <p className="text-sm font-medium">실행 중인 백그라운드 작업 없음</p>
        <p className="text-xs">작업이 시작되면 여기에 표시됩니다</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-4xl mx-auto">
      {data.jobs.map((job, i) => (
        <div key={i} className="card card-glow p-5 relative overflow-hidden">
          {/* Top accent line for running jobs */}
          {job.status === 'running' && (
            <div className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, var(--green), var(--green)00)' }} />
          )}

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: job.status === 'running' ? 'var(--green-muted)' : 'var(--bg-inset)' }}>
                <span className="text-base">{job.status === 'running' ? '⚡' : '✅'}</span>
              </div>
              <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{job.name}</span>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-2"
              style={{
                background: job.status === 'running' ? 'var(--green-muted)' : '#5E5E6E22',
                color: job.status === 'running' ? 'var(--green)' : 'var(--text-tertiary)',
                border: `1px solid ${job.status === 'running' ? '#00D68F33' : 'var(--border-subtle)'}`,
              }}>
              {job.status === 'running' && (
                <span className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--green)', animation: 'agentPulse 1.5s infinite' }} />
              )}
              {job.status === 'running' ? '실행 중' : '완료'}
            </span>
          </div>

          {job.progress && (
            <div className="mb-3">
              <ProgressBar percent={parseInt(job.progress) || 0} color="var(--accent)" label={`진행률: ${job.progress}`} />
            </div>
          )}

          {job.cpu && (
            <div className="flex items-center gap-4 text-xs mb-3 px-3 py-2 rounded-lg"
              style={{ background: 'var(--bg-inset)', color: 'var(--text-tertiary)' }}>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }} />
                CPU: {job.cpu}%
              </span>
              <span>실행시간: {job.uptime}</span>
            </div>
          )}

          {job.report_exists && (
            <div className="text-xs flex items-center gap-2 mb-3 px-3 py-2 rounded-lg"
              style={{ background: 'var(--green-muted)', color: 'var(--green)' }}>
              <span>📄</span> 리포트 생성됨
            </div>
          )}

          {job.last_log && job.last_log.length > 0 && (
            <div className="p-3 rounded-lg text-xs font-mono max-h-36 overflow-y-auto leading-relaxed"
              style={{ background: 'var(--bg-inset)', color: 'var(--text-tertiary)', border: '1px solid var(--border-subtle)' }}>
              {job.last_log.map((line, j) => (
                <div key={j} className="py-0.5">{line}</div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main App ──
export default function App() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="flex flex-col min-h-screen max-w-screen overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="glass flex items-center justify-between px-5 py-3.5 border-b flex-shrink-0 sticky top-0 z-30"
        style={{ background: '#0A0A0BEE', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6C8CFF, #A78BFA)' }}>
            D
          </div>
          <span className="text-sm font-bold hidden sm:block gradient-text">Dev Dashboard</span>
        </div>

        <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-card)' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: isActive ? 'var(--bg-elevated)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                }}>
                <span className="mr-1.5">{tab.icon}</span>{tab.label}
              </button>
            )
          })}
        </nav>

        <div className="text-xs font-mono tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
          {new Date().toLocaleDateString('ko-KR')}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-4">
        {activeTab === 'overview' && <OverviewPage />}
        {activeTab === 'projects' && <ProjectsPage />}
        {activeTab === 'jobs' && <JobsPage />}
      </div>

      {/* Mobile Bottom Tab */}
      <nav className="fixed bottom-0 left-0 right-0 flex md:hidden border-t z-40 glass"
        style={{ background: '#0A0A0BEE', borderColor: 'var(--border-subtle)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center text-xs transition-all relative"
              style={{
                color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
                minHeight: 58,
                paddingTop: 10,
                paddingBottom: 6,
              }}>
              {isActive && (
                <span className="absolute top-0 left-1/4 right-1/4 h-[2px] rounded-full"
                  style={{ background: 'var(--accent)' }} />
              )}
              <span className="text-lg mb-0.5">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
