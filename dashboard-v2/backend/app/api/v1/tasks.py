"""태스크 API — OMC 태스크 전용 (읽기 전용).

~/.claude/tasks/*/ 디렉토리에서 OMC 태스크를 읽어 반환.
CRUD는 OMC TaskCreate/TaskUpdate로 관리되므로 GET만 제공.

GET  /api/tasks/           전체 조회 (status, team 필터)
GET  /api/tasks/{task_id}  단일 조회
"""

import json
import logging
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/tasks", tags=["tasks"])
logger = logging.getLogger("tasks")

OMC_TASKS_DIR = Path.home() / ".claude" / "tasks"


def _read_omc_tasks() -> list:
    """~/.claude/tasks/*/*.json 에서 OMC 태스크 수집."""
    tasks = []
    try:
        if not OMC_TASKS_DIR.is_dir():
            return tasks
        for team_dir in OMC_TASKS_DIR.iterdir():
            if not team_dir.is_dir():
                continue
            for task_file in team_dir.glob("*.json"):
                try:
                    data = json.loads(task_file.read_text(encoding="utf-8"))
                except Exception:
                    continue
                tasks.append({
                    "id": f"omc-{team_dir.name}-{data.get('id', task_file.stem)}",
                    "title": data.get("subject", ""),
                    "description": data.get("description"),
                    "assigned_to": data.get("owner"),
                    "status": data.get("status", "pending"),
                    "team": team_dir.name,
                    "source": "omc",
                })
    except Exception:
        logger.exception("OMC 태스크 읽기 실패")
    return tasks


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/")
async def list_tasks(
    status: Optional[str] = None,
    team: Optional[str] = None,
):
    try:
        tasks = _read_omc_tasks()
        if status:
            tasks = [t for t in tasks if t.get("status") == status]
        if team:
            tasks = [t for t in tasks if t.get("team") == team]
        return tasks
    except Exception:
        logger.exception("태스크 목록 조회 실패")
        raise HTTPException(status_code=500, detail="태스크 목록을 불러올 수 없습니다")


@router.get("/{task_id}")
async def get_task(task_id: str):
    try:
        for task in _read_omc_tasks():
            if task.get("id") == task_id:
                return task
        raise HTTPException(status_code=404, detail="Task not found")
    except HTTPException:
        raise
    except Exception:
        logger.exception("태스크 조회 실패: %s", task_id)
        raise HTTPException(status_code=500, detail="태스크 정보를 불러올 수 없습니다")
