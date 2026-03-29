import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import './index.css'
import Overview from './components/overview/Overview'
import TeamView from './components/teams/TeamView'
import TaskList from './components/tasks/TaskList'
import ChatView from './components/chat/ChatView'
import LogViewer from './components/logs/LogViewer'
import { useAgents } from './hooks/useAgents'
import { useChat } from './hooks/useChat'
import { useOmc } from './hooks/useOmc'

const TABS = [
  { id: 'overview', label: '개요', icon: '📊' },
  { id: 'teams',    label: '팀',   icon: '👥' },
  { id: 'tasks',    label: '태스크', icon: '📋' },
  { id: 'chat',     label: '채팅', icon: '💬' },
  { id: 'logs',     label: '로그', icon: '📜' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('overview')
  const [unread, setUnread] = useState({})
  const [activeChatChannel, setActiveChatChannel] = useState('all')

  const activeTabRef = useRef(activeTab)
  const activeChatChannelRef = useRef(activeChatChannel)
  useEffect(() => {
    activeTabRef.current = activeTab
    activeChatChannelRef.current = activeChatChannel
  })

  const handleNewMessages = useCallback((newMsgs) => {
    setUnread(prev => {
      const next = { ...prev }
      let changed = false
      newMsgs.forEach(msg => {
        if (msg.from === 'system') return
        const ch = msg.from
        const isReading =
          activeTabRef.current === 'chat' &&
          (activeChatChannelRef.current === 'all' || activeChatChannelRef.current === ch)
        if (!isReading) {
          next[ch] = (next[ch] ?? 0) + 1
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [])

  const { agents } = useAgents()
  const { messages: chatMessages } = useChat({ limit: 100, onNewMessages: handleNewMessages })
  const { teams: omcTeams, tasks: omcTasks, loading: omcLoading } = useOmc()

  const agentStatusMap = useMemo(() =>
    Object.fromEntries(agents.map(a => [a.id, a.status])),
    [agents]
  )

  function handleClearUnread(channel) {
    if (channel === 'all') {
      setUnread({})
    } else {
      setUnread(prev => ({ ...prev, [channel]: 0 }))
    }
  }

  function handleTabChange(tabId) {
    setActiveTab(tabId)
    if (tabId === 'chat' && activeChatChannelRef.current === 'all') {
      setUnread({})
    }
  }

  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col min-h-screen max-w-screen overflow-x-hidden" style={{ background: '#0F172A' }}>
      {/* 상단 헤더 - 모바일에서 간결하게 */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ background: '#0F172A', borderColor: '#1E293B' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' }}
          >
            AI
          </div>
          <span className="text-sm font-bold hidden sm:block" style={{ color: '#F1F5F9' }}>
            Agent Dashboard
          </span>
        </div>

        {/* 데스크톱: 상단 탭 */}
        <nav className="hidden md:flex items-center gap-1" role="tablist" aria-label="대시보드 탭">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-label={tab.label}
                onClick={() => handleTabChange(tab.id)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: isActive ? '#1E293B' : 'transparent',
                  color: isActive ? '#F1F5F9' : '#64748B',
                  border: isActive ? '1px solid #334155' : '1px solid transparent',
                }}
              >
                <span className="mr-1" aria-hidden="true">{tab.icon}</span>
                {tab.label}
                {tab.id === 'chat' && totalUnread > 0 && (
                  <span
                    className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: '#8B5CF6', color: '#fff' }}
                    aria-label={`읽지 않은 메시지 ${totalUnread}개`}
                  >
                    {totalUnread}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* 우측 상태 */}
        <div className="flex items-center gap-3 text-xs" style={{ color: '#64748B' }}>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#10B981' }} />
            {agents.filter(a => a.status !== 'offline').length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#8B5CF6' }} />
            {agents.filter(a => a.status === 'working').length}
          </span>
        </div>
      </header>

      {/* 탭 컨텐츠 - 하단 탭바 공간 확보 */}
      <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {activeTab === 'overview' && (
          <Overview
            agents={agents}
            chatMessages={chatMessages}
            onGotoChat={() => handleTabChange('chat')}
            omcTeams={omcTeams}
            omcTasks={omcTasks}
          />
        )}
        {activeTab === 'teams' && (
          <TeamView teams={omcTeams} tasks={omcTasks} />
        )}
        {activeTab === 'tasks' && (
          omcLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: '#64748B' }}>
              <div className="spinner" />
              <span className="text-sm">작업 목록 로딩 중...</span>
            </div>
          ) : (
            <TaskList omcTasks={omcTasks} omcTeams={omcTeams} />
          )
        )}
        {activeTab === 'chat' && (
          <ChatView
            agentStatus={agentStatusMap}
            unread={unread}
            onClearUnread={handleClearUnread}
            channel={activeChatChannel}
            onChannelChange={setActiveChatChannel}
          />
        )}
        {activeTab === 'logs' && (
          <LogViewer />
        )}
      </div>

      {/* 모바일 하단 탭바 */}
      <nav
        className="fixed bottom-0 left-0 right-0 flex md:hidden border-t z-40"
        role="tablist"
        aria-label="대시보드 탭"
        style={{
          background: '#0F172A',
          borderColor: '#1E293B',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onClick={() => handleTabChange(tab.id)}
              className="flex-1 flex flex-col items-center text-xs transition-colors relative"
              style={{
                color: isActive ? '#A78BFA' : '#64748B',
                minHeight: 56,
                paddingTop: 10,
                paddingBottom: 6,
              }}
            >
              <span className="text-lg" aria-hidden="true">{tab.icon}</span>
              <span className="mt-0.5">{tab.label}</span>
              {tab.id === 'chat' && totalUnread > 0 && (
                <span
                  className="absolute top-1 right-1/4 text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold"
                  style={{ background: '#8B5CF6', color: '#fff' }}
                  aria-label={`읽지 않은 메시지 ${totalUnread > 9 ? '9개 이상' : totalUnread + '개'}`}
                >
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              )}
              {isActive && (
                <span
                  className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-full"
                  style={{ background: '#8B5CF6' }}
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </nav>

    </div>
  )
}
