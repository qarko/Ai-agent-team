export default function StatCard({ label, value, color = '#8B5CF6', icon }) {
  return (
    <div
      className="rounded-xl p-4 sm:p-5 border relative overflow-hidden"
      style={{
        background: '#1E293B',
        borderColor: '#334155',
      }}
    >
      <div
        className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 blur-2xl"
        style={{ background: color, transform: 'translate(30%, -30%)' }}
      />

      <div className="flex items-center justify-between relative">
        <div className="min-w-0">
          <div className="text-xs sm:text-sm font-medium mb-1" style={{ color: '#94A3B8' }}>
            {label}
          </div>
          <div className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color }}>
            {value}
          </div>
        </div>
        {icon && (
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl flex-shrink-0"
            style={{ background: `${color}15` }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
