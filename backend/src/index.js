const express = require('express');
const cors = require('cors');
const path = require('path');
const agentsRouter = require('./routes/agents');
const tasksRouter = require('./routes/tasks');
const logsRouter = require('./routes/logs');

const { BASE_DIR } = require('./paths');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_DIST = path.join(BASE_DIR, 'frontend/dist');

app.use(cors());
app.use(express.json());

// 정적 파일 서빙 (프론트엔드 빌드)
app.use(express.static(FRONTEND_DIST));

// API 라우트
app.use('/api/agents', agentsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/logs', logsRouter);

// SPA 폴백
app.get('/{*splat}', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(FRONTEND_DIST, 'index.html');
    if (require('fs').existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'Frontend not built yet' });
    }
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dashboard API running on http://0.0.0.0:${PORT}`);
});
