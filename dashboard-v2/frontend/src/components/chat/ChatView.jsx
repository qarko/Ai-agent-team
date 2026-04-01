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
      {/* Channel filter tabs */}
      <ChannelList active={channel} onChange={handleChannelChange} unread={unread} />

      {/* Channel header */}
      <div className="px-4 sm:px-6 py-2 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {channel === 'all' ? '전체' : channel}
        </span>
        {error && (
          <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: '#FF5C5C18', color: 'var(--red)' }}>
            오류
          </span>
        )}
      </div>

      {/* Message stream */}
      <MessageStream
        messages={messages}
        channel={channel}
        agentStatus={agentStatus}
        loading={loading}
        error={error}
      />

      {/* Input */}
      <ChatInput
        target={sendTarget}
        onTargetChange={setSendTarget}
        agents={AGENT_NAMES}
      />
    </div>
  )
}
