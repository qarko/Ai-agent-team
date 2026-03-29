/**
 * 날짜 문자열을 '3분 전' 형식의 상대시간으로 변환
 */
export function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (seconds < 5)  return '방금 전'
  if (seconds < 60) return `${seconds}초 전`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)   return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}
