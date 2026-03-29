"""OMC 데이터 API — ~/.claude/ 기반 OMC 팀/태스크/세션 조회.

GET  /api/omc/teams              팀 목록 + 멤버/태스크 수
GET  /api/omc/teams/{team_name}  팀 상세 (멤버 목록, 태스크 목록)
GET  /api/omc/tasks              OMC 태스크 데이터
GET  /api/omc/sessions           프로젝트별 OMC 세션 히스토리
GET  /api/omc/stats              총 팀 수, 총 태스크, 완료율, 활성 에이전트 수
"""

import json
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/omc", tags=["omc"])
logger = logging.getLogger("omc")

TEAMS_DIR = Path.home() / ".claude" / "teams"
TASKS_DIR = Path.home() / ".claude" / "tasks"
PROJECT_ROOTS = [
    Path.home() / "coin-bot",
    Path.home() / "dashboard-v2",
]


def _read_json(path: Path) -> dict | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def _get_team_tasks(team_name: str) -> list:
    """특정 팀의 태스크 목록 반환."""
    tasks = []
    team_tasks_dir = TASKS_DIR / team_name
    if not team_tasks_dir.is_dir():
        return tasks
    for task_file in team_tasks_dir.glob("*.json"):
        data = _read_json(task_file)
        if data is None:
            continue
        data["team"] = team_name
        data["source"] = "omc"
        tasks.append(data)
    return tasks


def _get_all_tasks() -> list:
    """모든 OMC 태스크 수집."""
    tasks = []
    if not TASKS_DIR.is_dir():
        return tasks
    for team_dir in TASKS_DIR.iterdir():
        if not team_dir.is_dir():
            continue
        for task_file in team_dir.glob("*.json"):
            data = _read_json(task_file)
            if data is None:
                continue
            data["team"] = team_dir.name
            data["source"] = "omc"
            tasks.append(data)
    return tasks


def _get_all_teams() -> list:
    """모든 OMC 팀 정보 수집 (멤버/태스크 수 포함)."""
    teams = []
    if not TEAMS_DIR.is_dir():
        return teams
    for team_dir in TEAMS_DIR.iterdir():
        if not team_dir.is_dir():
            continue
        config = _read_json(team_dir / "config.json")
        if config is None:
            continue
        team_name = config.get("name", team_dir.name)
        members = [
            {
                "name": m.get("name"),
                "agent_id": m.get("agentId"),
                "model": m.get("model"),
                "is_active": m.get("isActive", False),
                "agent_type": m.get("agentType", ""),
            }
            for m in config.get("members", [])
        ]
        team_tasks = _get_team_tasks(team_name)
        teams.append({
            "name": team_name,
            "description": config.get("description", ""),
            "created_at": config.get("createdAt"),
            "members": members,
            "member_count": len(members),
            "task_count": len(team_tasks),
        })
    return teams


# ── Teams ────────────────────────────────────────────────────────────────────

@router.get("/teams")
async def list_teams():
    try:
        return _get_all_teams()
    except Exception:
        logger.exception("OMC 팀 목록 조회 실패")
        raise HTTPException(status_code=500, detail="OMC 팀 목록을 불러올 수 없습니다")


@router.get("/teams/{team_name}")
async def get_team(team_name: str):
    try:
        teams = _get_all_teams()
        for team in teams:
            if team["name"] == team_name:
                # 상세: 태스크 목록도 포함
                team["tasks"] = _get_team_tasks(team_name)
                return team
        raise HTTPException(status_code=404, detail="Team not found")
    except HTTPException:
        raise
    except Exception:
        logger.exception("OMC 팀 상세 조회 실패: %s", team_name)
        raise HTTPException(status_code=500, detail="OMC 팀 정보를 불러올 수 없습니다")


# ── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_stats():
    try:
        teams = _get_all_teams()
        all_tasks = _get_all_tasks()
        total_tasks = len(all_tasks)
        completed_tasks = sum(1 for t in all_tasks if t.get("status") == "completed")
        active_agents = sum(
            1
            for team in teams
            for m in team.get("members", [])
            if m.get("is_active")
        )
        return {
            "total_teams": len(teams),
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "completion_rate": round(completed_tasks / total_tasks * 100, 1) if total_tasks > 0 else 0,
            "active_agents": active_agents,
        }
    except Exception:
        logger.exception("OMC 통계 조회 실패")
        raise HTTPException(status_code=500, detail="OMC 통계를 불러올 수 없습니다")


# ── Tasks ────────────────────────────────────────────────────────────────────

@router.get("/tasks")
async def list_omc_tasks():
    try:
        return _get_all_tasks()
    except Exception:
        logger.exception("OMC 태스크 조회 실패")
        raise HTTPException(status_code=500, detail="OMC 태스크를 불러올 수 없습니다")


# ── Sessions ─────────────────────────────────────────────────────────────────

@router.get("/sessions")
async def list_sessions():
    sessions = []
    try:
        for root in PROJECT_ROOTS:
            sessions_dir = root / ".omc" / "sessions"
            if not sessions_dir.is_dir():
                continue
            for sf in sessions_dir.glob("*.json"):
                data = _read_json(sf)
                if data is None:
                    continue
                data["project"] = root.name
                sessions.append(data)
    except Exception:
        logger.exception("OMC 세션 조회 실패")
        raise HTTPException(status_code=500, detail="OMC 세션을 불러올 수 없습니다")
    return sessions
