const express = require('express');
const fs = require('fs');
const { execSync } = require('child_process');
const { TASKS_FILE, SCRIPTS_DIR } = require('../paths');
const router = express.Router();

// GET /api/tasks — 전체 작업 목록
router.get('/', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
    const { agent, status } = req.query;

    let tasks = data.tasks;
    if (agent) tasks = tasks.filter(t => t.assigned_to === agent);
    if (status) tasks = tasks.filter(t => t.status === status);

    res.json({
      total: tasks.length,
      tasks,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks — 작업 추가
router.post('/', (req, res) => {
  const { title, assigned_to, priority, description } = req.body;

  if (!title || !assigned_to) {
    return res.status(400).json({ error: 'title and assigned_to are required' });
  }

  try {
    execSync(
      `${SCRIPTS_DIR}/task-add.sh "${title}" "${assigned_to}" "${priority || 'medium'}" "${description || ''}"`,
      { timeout: 5000 }
    );
    const data = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
    res.json({ ok: true, task: data.tasks[data.tasks.length - 1] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tasks/:id — 작업 상태 변경
router.patch('/:id', (req, res) => {
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: 'status is required' });

  try {
    execSync(`${SCRIPTS_DIR}/task-update.sh ${req.params.id} ${status}`, {
      timeout: 5000,
    });
    res.json({ ok: true, task_id: req.params.id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
