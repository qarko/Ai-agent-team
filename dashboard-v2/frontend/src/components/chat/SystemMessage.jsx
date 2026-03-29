export default function SystemMessage({ message }) {
  const time = new Date(message.ts).toLocaleTimeString('ko-KR', {
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex-1 h-px" style={{ background: '#334155' }} />
      <div className="text-xs italic text-center px-2" style={{ color: '#64748B', whiteSpace: 'nowrap' }}>
        [시스템] {time} — {message.message}
      </div>
      <div className="flex-1 h-px" style={{ background: '#334155' }} />
    </div>
  )
}
