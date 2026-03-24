const express = require('express');
const fs = require('fs');
const path = require('path');
const { LOGS_DIR } = require('../paths');
const router = express.Router();

// GET /api/logs/:agent — 에이전트 로그 조회
router.get('/:agent', (req, res) => {
  const logFile = path.join(LOGS_DIR, `${req.params.agent}.log`);
  const lines = parseInt(req.query.lines) || 50;

  try {
    if (!fs.existsSync(logFile)) {
      return res.json({ agent: req.params.agent, logs: [] });
    }

    const content = fs.readFileSync(logFile, 'utf8');
    const allLines = content.trim().split('\n').filter(Boolean);
    const recentLines = allLines.slice(-lines);

    res.json({
      agent: req.params.agent,
      total: allLines.length,
      logs: recentLines,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logs — 전체 에이전트 최근 로그
router.get('/', (req, res) => {
  const agents = ['manager', 'planner', 'backend', 'frontend', 'reviewer', 'tester'];
  const lines = parseInt(req.query.lines) || 10;
  const result = {};

  for (const agent of agents) {
    const logFile = path.join(LOGS_DIR, `${agent}.log`);
    try {
      if (fs.existsSync(logFile)) {
        const content = fs.readFileSync(logFile, 'utf8');
        const allLines = content.trim().split('\n').filter(Boolean);
        result[agent] = allLines.slice(-lines);
      } else {
        result[agent] = [];
      }
    } catch {
      result[agent] = [];
    }
  }

  res.json({ logs: result });
});

module.exports = router;
