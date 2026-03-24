const express = require('express');
const fs = require('fs');
const { execSync } = require('child_process');
const router = express.Router();

const STATE_FILE = '/home/claude/shared/state.json';

// GET /api/agents — 전체 에이전트 상태
router.get('/', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    const agents = Object.entries(data.agents).map(([name, info]) => ({
      name,
      ...info,
      tmux_active: isTmuxActive(info.tmux_session),
    }));
    res.json({ agents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/agents/:name — 특정 에이전트 상태
router.get('/:name', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    const agent = data.agents[req.params.name];
    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    res.json({
      name: req.params.name,
      ...agent,
      tmux_active: isTmuxActive(agent.tmux_session),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/agents/:name/command — 에이전트에 명령 전송
router.post('/:name/command', (req, res) => {
  const { name } = req.params;
  const { command } = req.body;

  if (!command) return res.status(400).json({ error: 'command is required' });

  try {
    execSync(`/home/claude/scripts/send-to-agent.sh ${name} "${command.replace(/"/g, '\\"')}"`, {
      timeout: 5000,
    });
    res.json({ ok: true, agent: name, command });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function isTmuxActive(sessionName) {
  try {
    execSync(`tmux has-session -t ${sessionName} 2>/dev/null`);
    return true;
  } catch {
    return false;
  }
}

module.exports = router;
