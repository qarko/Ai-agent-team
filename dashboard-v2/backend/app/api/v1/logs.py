"""로그 API — /home/claude/shared/logs/{agent}.log 파일 기반.

GET /api/logs/           사용 가능한 로그 파일 목록
GET /api/logs/{agent}    에이전트 로그 마지막 N줄 (lines 파라미터)
"""

import logging
import re
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/logs", tags=["logs"])
logger = logging.getLogger("logs")

LOGS_DIR = Path("/home/claude/shared/logs")
ALLOWED_AGENTS = {"manager", "planner", "backend", "frontend", "reviewer", "tester"}


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/")
async def list_logs():
    """사용 가능한 로그 파일 목록."""
    try:
        if not LOGS_DIR.exists():
            return []
        files = []
        for f in sorted(LOGS_DIR.glob("*.log")):
            try:
                files.append({
                    "filename": f.name,
                    "agent":    f.stem,
                    "size":     f.stat().st_size,
                })
            except OSError:
                pass
        return files
    except Exception:
        logger.exception("로그 목록 조회 실패")
        raise HTTPException(status_code=500, detail="로그 목록을 불러올 수 없습니다")


@router.get("/{agent}")
async def get_agent_logs(
    agent: str,
    lines: int = Query(50, ge=1, le=1000, description="마지막 N줄"),
    since: Optional[str] = Query(None, description="이 문자열 이후 줄만 (prefix 필터)"),
):
    """에이전트 로그 파일의 마지막 N줄을 반환합니다."""
    # 경로 순회 방지: agent 이름에 '/', '..' 등 차단
    if not re.match(r"^[\w\-]+$", agent):
        raise HTTPException(status_code=400, detail="유효하지 않은 에이전트 이름입니다")

    # resolve 후 LOGS_DIR 범위 내인지 이중 검증
    log_file = (LOGS_DIR / f"{agent}.log").resolve()
    if not str(log_file).startswith(str(LOGS_DIR.resolve())):
        raise HTTPException(status_code=400, detail="유효하지 않은 에이전트 이름입니다")

    if not log_file.exists():
        return {
            "agent": agent,
            "lines": [],
            "total": 0,
            "message": f"{agent} 로그 파일이 아직 생성되지 않았습니다",
        }

    try:
        content = log_file.read_text(encoding="utf-8", errors="replace")
    except PermissionError:
        raise HTTPException(status_code=403, detail="로그 파일 읽기 권한이 없습니다")
    except OSError:
        logger.exception("로그 파일 읽기 실패: %s", agent)
        raise HTTPException(status_code=500, detail="로그 파일을 읽을 수 없습니다")

    all_lines = [l for l in content.splitlines() if l.strip()]

    if since:
        # since 문자열이 포함된 줄 이후만 반환
        idx = next(
            (i for i, l in enumerate(all_lines) if since in l),
            None,
        )
        if idx is not None:
            all_lines = all_lines[idx + 1:]

    tail = all_lines[-lines:]
    return {"agent": agent, "lines": tail, "total": len(all_lines)}
