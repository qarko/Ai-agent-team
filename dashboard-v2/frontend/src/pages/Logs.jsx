export default function Logs() {
  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">시스템 로그</h2>
      <div className="font-mono text-xs text-slate-400 space-y-1 bg-black/30 rounded-lg p-3 border border-white/5">
        <div><span className="text-slate-600">2026-03-25 15:00:01</span> <span className="text-emerald-400">[INFO]</span> Frontend agent started</div>
        <div><span className="text-slate-600">2026-03-25 14:59:43</span> <span className="text-indigo-400">[TASK]</span> Dashboard v2 layout initialized</div>
        <div><span className="text-slate-600">2026-03-25 14:58:12</span> <span className="text-emerald-400">[INFO]</span> All agents online</div>
      </div>
    </div>
  )
}
