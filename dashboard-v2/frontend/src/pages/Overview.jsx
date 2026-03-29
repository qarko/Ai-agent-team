function StatCard({ label, value, sub, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium mt-1 opacity-80">{label}</div>
      {sub && <div className="text-xs opacity-60 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function Overview() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">시스템 현황</h2>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="활성 에이전트" value="6" sub="전체 가동 중" color="emerald" />
        <StatCard label="진행 중 작업" value="3" sub="오늘 기준" color="indigo" />
        <StatCard label="완료된 작업" value="12" sub="오늘 기준" color="amber" />
        <StatCard label="오류" value="0" sub="최근 24시간" color="rose" />
      </div>

      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider pt-2">에이전트 상태</h2>
      <div className="space-y-2">
        {[
          { name: 'Manager', status: 'idle', model: 'Sonnet 4.6' },
          { name: 'Planner', status: 'working', model: 'Sonnet 4.6' },
          { name: 'Backend', status: 'idle', model: 'Sonnet 4.6' },
          { name: 'Frontend', status: 'working', model: 'Sonnet 4.6' },
          { name: 'Reviewer', status: 'idle', model: 'Opus 4.6' },
          { name: 'Tester', status: 'idle', model: 'Haiku 4.5' },
        ].map((agent) => (
          <div key={agent.name} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 border border-white/5">
            <div>
              <div className="text-sm font-medium text-white">{agent.name}</div>
              <div className="text-xs text-slate-500">{agent.model}</div>
            </div>
            <span className={[
              'text-xs px-2 py-0.5 rounded-full font-medium',
              agent.status === 'working'
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'bg-slate-500/20 text-slate-400',
            ].join(' ')}>
              {agent.status === 'working' ? '작업 중' : '대기'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
