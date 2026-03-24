import React from 'react';

export default function AgentCard({ agent, roleLabel, modelShort }) {
  return (
    <div className="agent-card">
      <div className="agent-card-header">
        <div className="agent-name">
          {agent.name}
          <span className="agent-role">{roleLabel}</span>
        </div>
        <span className={`status-badge status-${agent.status}`}>
          {agent.status}
        </span>
      </div>

      {agent.current_task && (
        <div className="agent-task">
          {agent.current_task}
        </div>
      )}

      <div className="agent-meta">
        <span className="agent-model">{modelShort}</span>
        <span>
          {agent.tmux_active ? 'tmux: active' : 'tmux: inactive'}
        </span>
        {agent.last_updated && (
          <span>{new Date(agent.last_updated).toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
}
