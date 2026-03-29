import { useState } from 'react'
import ChannelList from './ChannelList'
import MessageStream from './MessageStream'
import ChatInput from './ChatInput'
import { useChat } from '../../hooks/useChat'
import { AGENT_NAMES } from '../../constants/agents'

export default function ChatView({ agentStatus = {}, unread = {}, onClearUnread, channel, onChannelChange }) {
  const { messages, loading, error } = useChat({
    agent: channel === 'all' ? undefined : channel,
    limit: 100,
  })
  const [sendTarget, setSendTarget] = useState(channel === 'all' ? 'manager' : channel)

  function handleChannelChange(ch) {
    onChannelChange(ch)
    onClearUnread?.(ch)
    if (ch !== 'all') setSendTarget(ch)
  }

  return (
    <div className="flex flex-col overflow-x-hidden" style={{ height: 'calc(100vh - 60px)' }}>
      {/* 상단 채널 필터 탭 */}
      <ChannelList active={channel} onChange={handleChannelChange} unread={unread} />

      {/* 채널 헤더 */}
      <div className="px-4 sm:px-6 py-2 border-b flex items-center gap-2" style={{ borderColor: '#1E293B' }}>
        <span className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>
          {channel === 'all' ? '전체' : channel}
        </span>
        {error && (
          <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: '#EF444422', color: '#F87171' }}>
            오류
          </span>
        )}
      </div>

      {/* 메시지 스트림 */}
      <MessageStream
        messages={messages}
        channel={channel}
        agentStatus={agentStatus}
        loading={loading}
        error={error}
      />

      {/* 입력창 */}
      <ChatInput
        target={sendTarget}
        onTargetChange={setSendTarget}
        agents={AGENT_NAMES}
      />
    </div>
  )
}
