import React, { useState, useEffect, useCallback } from 'react';
import AgentCard from './components/AgentCard';
import TaskList from './components/TaskList';
import LogViewer from './components/LogViewer';

const ROLE_LABELS = {
  manager: '총괄',
  planner: '기획',
  backend: '백엔드',
  frontend: '프론트엔드',
  reviewer: '리뷰',
  tester: '테스트',
};

const MODEL_SHORT = {
  'claude-opus-4-6': 'Opus 4.6',
  'claude-sonnet-4-6': 'Sonnet 4.6',
  'claude-haiku-4-5': 'Haiku 4.5',
};

export default function App() {
  const [tab, setTab] = useState('agents');
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [agentsRes, tasksRes] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/tasks'),
      ]);
      const agentsData = await agentsRes.json();
      const tasksData = await tasksRes.json();
      setAgents(agentsData.agents || []);
      setTasks(tasksData.tasks || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const activeCount = agents.filter(a => a.status !== 'stopped').length;
  const workingCount = agents.filter(a => a.status === 'working').length;

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Agent Dashboard</h1>
        <div className="subtitle">
          {activeCount}개 활성 / {workingCount}개 작업중 / {tasks.length}개 태스크
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'agents' ? 'active' : ''}`} onClick={() => setTab('agents')}>
          에이전트
        </button>
        <button className={`tab ${tab === 'tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}>
          작업
        </button>
        <button className={`tab ${tab === 'logs' ? 'active' : ''}`} onClick={() => setTab('logs')}>
          로그
        </button>
      </div>

      <div className="refresh-bar">
        <span>{lastUpdate ? `${lastUpdate.toLocaleTimeString()} 업데이트` : '로딩중...'}</span>
        <button className="refresh-btn" onClick={fetchData}>새로고침</button>
      </div>

      {tab === 'agents' && (
        <div className="agents-grid">
          {agents.map(agent => (
            <AgentCard
              key={agent.name}
              agent={agent}
              roleLabel={ROLE_LABELS[agent.name]}
              modelShort={MODEL_SHORT[agent.model] || agent.model}
            />
          ))}
        </div>
      )}

      {tab === 'tasks' && <TaskList tasks={tasks} />}

      {tab === 'logs' && <LogViewer agents={agents.map(a => a.name)} />}
    </div>
  );
}
