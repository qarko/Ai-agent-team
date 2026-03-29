"""에이전트 API — tmux 실시간 상태 + OMC 팀 멤버 병합.

GET  /api/agents/        전체 에이전트 목록 (tmux 실시간 상태 + OMC 멤버)
GET  /api/agents/{id}    단일 에이전트
POST /api/agents/{id}/command  에이전트에 명령 전송
"""

import json
import subprocess
import logging
import re
from pathlib import Path

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/agents", tags=["agents"])
logger = logging.getLogger("agents")

TEAMS_DIR = Path.home() / ".claude" / "teams"
TMUX_AGENTS = {
    "manager":  {"name": "Manager",  "role": "작업 분배/조율",   "tmux_session": "agent-manager"},
    "planner":  {"name": "Planner",  "role": "기획/명세",       "tmux_session": "agent-planner"},
    "backend":  {"name": "Backend",  "role": "API/서버 구현",   "tmux_session": "agent-backend"},
    "frontend": {"name": "Frontend", "role": "UI/미니앱",      "tmux_session": "agent-frontend"},
    "reviewer": {"name": "Reviewer", "role": "코드 리뷰",      "tmux_session": "agent-reviewer"},
    "tester":   {"name": "Tester",   "role": "테스트",         "tmux_session": "agent-tester"},
}
SAFE_COMMAND = re.compile(r"^[\w\s가-힣.,\-:/?=\[\]()@#%+*'\"!~]+$")
MAX_COMMAND_LEN = 500


def _tmux_running(session: str) -> bool:
    """tmux 세션이 살아 있으면 True."""
    try:
        result = subprocess.run(
            ["tmux", "has-session", "-t", session],
            capture_output=True, timeout=3,
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def _read_omc_teams() -> dict:
    """OMC 팀 config에서 멤버 정보를 {name: info} 맵으로 반환."""
    members = {}
    try:
        if not TEAMS_DIR.is_dir():
            return members
        for team_dir in TEAMS_DIR.iterdir():
            if not team_dir.is_dir():
                continue
            config_path = team_dir / "config.json"
            if not config_path.exists():
                continue
            try:
                config = json.loads(config_path.read_text(encoding="utf-8"))
            except Exception:
                continue
            team_name = config.get("name", team_dir.name)
            for m in config.get("members", []):
                name = m.get("name", "")
                members[name] = {
                    "team_name": team_name,
                    "model": m.get("model"),
                    "is_active": m.get("isActive", False),
                    "agent_type": m.get("agentType", ""),
                    "role": m.get("agentType", ""),
                }
    except Exception:
        logger.exception("OMC 팀 멤버 읽기 실패")
    return members


def _build_agent(agent_id: str, info: dict, omc_info: dict | None = None) -> dict:
    """에이전트 응답 객체 생성."""
    session = info.get("tmux_session", f"agent-{agent_id}")
    running = _tmux_running(session)
    resp = {
        "id": agent_id,
        "name": info.get("name", agent_id),
        "status": "online" if running else "offline",
        "role": info.get("role", ""),
    }
    if omc_info:
        resp["team_name"] = omc_info.get("team_name")
        resp["model"] = omc_info.get("model")
    return resp


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/")
async def list_agents():
    try:
        omc_members = _read_omc_teams()
        result = []

        # 6개 tmux 에이전트
        for aid, info in TMUX_AGENTS.items():
            omc_info = omc_members.pop(aid, None)
            result.append(_build_agent(aid, info, omc_info))

        # OMC에만 있는 추가 멤버
        for name, info in omc_members.items():
            result.append({
                "id": name,
                "name": name,
                "status": "online" if info.get("is_active") else "offline",
                "role": info.get("role", ""),
                "team_name": info.get("team_name"),
                "model": info.get("model"),
                "source": "omc",
            })

        return result
    except Exception:
        logger.exception("에이전트 목록 조회 실패")
        raise HTTPException(status_code=500, detail="에이전트 목록을 불러올 수 없습니다")


@router.get("/{agent_id}")
async def get_agent(agent_id: str):
    info = TMUX_AGENTS.get(agent_id)
    if info is None:
        # OMC 멤버에서 검색
        omc_members = _read_omc_teams()
        omc_info = omc_members.get(agent_id)
        if omc_info is None:
            raise HTTPException(status_code=404, detail="Agent not found")
        return {
            "id": agent_id,
            "name": agent_id,
            "status": "online" if omc_info.get("is_active") else "offline",
            "role": omc_info.get("role", ""),
            "team_name": omc_info.get("team_name"),
            "model": omc_info.get("model"),
            "source": "omc",
        }

    omc_members = _read_omc_teams()
    omc_info = omc_members.get(agent_id)
    return _build_agent(agent_id, info, omc_info)


@router.post("/{agent_id}/command")
async def send_command(agent_id: str, body: dict):
    if agent_id not in TMUX_AGENTS:
        raise HTTPException(status_code=404, detail="Agent not found")

    cmd = (body.get("command") or "").strip()
    if not cmd or len(cmd) > MAX_COMMAND_LEN:
        raise HTTPException(status_code=400, detail="명령 길이가 올바르지 않습니다")
    if "\n" in cmd or "\r" in cmd or "\0" in cmd:
        raise HTTPException(status_code=400, detail="명령에 제어 문자가 포함되어 있습니다")
    if not SAFE_COMMAND.match(cmd):
        raise HTTPException(status_code=400, detail="허용되지 않는 문자가 포함되어 있습니다")

    script = "/home/claude/scripts/send-to-agent.sh"
    try:
        result = subprocess.run(
            [script, agent_id, cmd],
            capture_output=True, text=True, timeout=10,
        )
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail="명령 전송에 실패했습니다")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="명령 전송 스크립트를 찾을 수 없습니다")
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="명령 전송 타임아웃")

    return {"ok": True, "agent": agent_id}
