import React, { useState, useEffect } from 'react';

export default function LogViewer({ agents }) {
  const [selected, setSelected] = useState(agents[0] || 'manager');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`/api/logs/${selected}?lines=50`);
        const data = await res.json();
        setLogs(data.logs || []);
      } catch (err) {
        console.error('Log fetch error:', err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [selected]);

  return (
    <div>
      <div className="log-agent-select">
        {agents.map(name => (
          <button
            key={name}
            className={`log-agent-btn ${selected === name ? 'active' : ''}`}
            onClick={() => setSelected(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="logs-container">
        {logs.length === 0 ? (
          <div className="empty-state">로그가 없습니다</div>
        ) : (
          logs.map((line, i) => (
            <div key={i} className="log-line">{line}</div>
          ))
        )}
      </div>
    </div>
  );
}
