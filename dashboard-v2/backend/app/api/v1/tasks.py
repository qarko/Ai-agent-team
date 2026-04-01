"""태스크 API — OMC 태스크 + 수동 태스크 관리.

~/.claude/tasks/*/ 디렉토리에서 OMC 태스크를 읽어 반환.
수동 태스크는 /tmp/dashboard_tasks.json 에 저장.

GET   /api/tasks/           전체 조회 (status, team 필터)
GET   /api/tasks/{task_id}  단일 조회
POST  /api/tasks/           수동 태스크 생성
PATCH /api/tasks/{task_id}  태스크 수정
"""

import json
import logging
import uuid
from pathlib import Path
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/tasks", tags=["tasks"])
logger = logging.getLogger("tasks")

OMC_TASKS_DIR = Path.home() / ".claude" / "tasks"
MANUAL_TASKS_FILE = Path("/tmp/dashboard_tasks.json")


class TaskCreate(BaseModel):
    subject: str
    description: Optional[str] = None
    status: str = "pending"


class TaskUpdate(BaseModel):
    status: Optional[str] = None
    description: Optional[str] = None


def _read_manual_tasks() -> list:
    """수동 생성 태스크 로드."""
    try:
        if MANUAL_TASKS_FILE.exists():
            return json.loads(MANUAL_TASKS_FILE.read_text(encoding="utf-8"))
    except Exception:
        logger.warning("수동 태스크 파일 읽기 실패")
    return []


def _write_manual_tasks(tasks: list):
    """수동 태스크 저장."""
    MANUAL_TASKS_FILE.write_text(
        json.dumps(tasks, ensure_ascii=False, indent=2), encoding="utf-8"
    )


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
        tasks = _read_omc_tasks() + _read_manual_tasks()
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
        all_tasks = _read_omc_tasks() + _read_manual_tasks()
        for task in all_tasks:
            if task.get("id") == task_id:
                return task
        raise HTTPException(status_code=404, detail="Task not found")
    except HTTPException:
        raise
    except Exception:
        logger.exception("태스크 조회 실패: %s", task_id)
        raise HTTPException(status_code=500, detail="태스크 정보를 불러올 수 없습니다")


@router.post("/")
async def create_task(body: TaskCreate):
    """수동 태스크 생성."""
    try:
        tasks = _read_manual_tasks()
        new_task = {
            "id": f"manual-{uuid.uuid4().hex[:8]}",
            "title": body.subject,
            "description": body.description,
            "status": body.status,
            "source": "manual",
            "team": "manual",
            "created_at": datetime.now().isoformat(),
        }
        tasks.append(new_task)
        _write_manual_tasks(tasks)
        return new_task
    except Exception:
        logger.exception("태스크 생성 실패")
        raise HTTPException(status_code=500, detail="태스크 생성에 실패했습니다")


@router.patch("/{task_id}")
async def update_task(task_id: str, body: TaskUpdate):
    """태스크 수정 (수동 태스크만 가능)."""
    try:
        tasks = _read_manual_tasks()
        for task in tasks:
            if task.get("id") == task_id:
                if body.status is not None:
                    task["status"] = body.status
                if body.description is not None:
                    task["description"] = body.description
                task["updated_at"] = datetime.now().isoformat()
                _write_manual_tasks(tasks)
                return task
        raise HTTPException(status_code=404, detail="수동 태스크만 수정 가능합니다")
    except HTTPException:
        raise
    except Exception:
        logger.exception("태스크 수정 실패: %s", task_id)
        raise HTTPException(status_code=500, detail="태스크 수정에 실패했습니다")
