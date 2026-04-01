export default function StatCard({ label, value, color = '#6C8CFF', icon }) {
  return (
    <div
      className="card card-glow relative overflow-hidden p-4 sm:p-5"
    >
      {/* Subtle glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.07] blur-2xl pointer-events-none"
        style={{ background: color, transform: 'translate(30%, -30%)' }}
      />

      <div className="flex items-center justify-between relative">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
            {label}
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums" style={{ color }}>
            {value}
          </div>
        </div>
        {icon && (
          <div
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl flex-shrink-0"
            style={{ background: `${color}12`, border: `1px solid ${color}18` }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
