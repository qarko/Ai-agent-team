import React from 'react';

export default function TaskList({ tasks }) {
  if (tasks.length === 0) {
    return <div className="empty-state">등록된 작업이 없습니다</div>;
  }

  return (
    <div className="tasks-list">
      {tasks.map(task => (
        <div key={task.id} className="task-item">
          <div className="task-header">
            <span className="task-title">{task.title}</span>
            <span className={`status-badge status-${task.status === 'in_progress' ? 'working' : task.status === 'completed' ? 'idle' : task.status === 'failed' ? 'error' : 'stopped'}`}>
              {task.status}
            </span>
          </div>
          <div className="task-meta">
            <span className="task-id">#{task.id}</span>
            <span>{task.assigned_to}</span>
            <span className={`priority-${task.priority}`}>{task.priority}</span>
            {task.description && <span>{task.description}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
