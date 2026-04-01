"""알림/알럿 API.

GET  /api/alerts/   최근 알림 목록 (최대 100개)
POST /api/alerts/   알림 생성
"""

import json
import logging
import uuid
import psutil
from pathlib import Path
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/alerts", tags=["alerts"])
logger = logging.getLogger("alerts")

ALERTS_FILE = Path("/tmp/dashboard_alerts.json")
MAX_ALERTS = 100


class AlertCreate(BaseModel):
    level: str = "info"  # info, warning, error
    message: str
    source: Optional[str] = None


def _read_alerts() -> list:
    try:
        if ALERTS_FILE.exists():
            return json.loads(ALERTS_FILE.read_text(encoding="utf-8"))
    except Exception:
        logger.warning("알림 파일 읽기 실패")
    return []


def _write_alerts(alerts: list):
    if len(alerts) > MAX_ALERTS:
        alerts = alerts[-MAX_ALERTS:]
    ALERTS_FILE.write_text(
        json.dumps(alerts, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def _auto_check_alerts() -> list:
    """시스템 상태 기반 자동 알림 생성."""
    generated = []
    try:
        cpu_pct = psutil.cpu_percent(interval=0.3)
        mem = psutil.virtual_memory()

        if cpu_pct > 90:
            generated.append({
                "id": f"auto-cpu-{uuid.uuid4().hex[:6]}",
                "level": "error",
                "message": f"CPU 사용률 {cpu_pct}% — 과부하 경고",
                "source": "system-monitor",
                "timestamp": datetime.now().isoformat(),
                "auto": True,
            })

        if mem.percent > 90:
            generated.append({
                "id": f"auto-ram-{uuid.uuid4().hex[:6]}",
                "level": "error",
                "message": f"RAM 사용률 {mem.percent}% — 메모리 부족 경고",
                "source": "system-monitor",
                "timestamp": datetime.now().isoformat(),
                "auto": True,
            })

        # 에이전트(tmux 세션) 다운 체크
        import subprocess
        expected_agents = ["agent-manager", "agent-planner", "agent-backend",
                          "agent-frontend", "agent-reviewer", "agent-tester"]
        try:
            r = subprocess.run(["tmux", "ls"], capture_output=True, text=True, timeout=3)
            active_sessions = []
            if r.returncode == 0:
                active_sessions = [line.split(":")[0] for line in r.stdout.strip().splitlines()]

            for agent in expected_agents:
                if agent not in active_sessions:
                    generated.append({
                        "id": f"auto-agent-{uuid.uuid4().hex[:6]}",
                        "level": "warning",
                        "message": f"에이전트 '{agent}' 세션 없음 — 오프라인 상태",
                        "source": "agent-monitor",
                        "timestamp": datetime.now().isoformat(),
                        "auto": True,
                    })
        except Exception:
            pass

    except Exception:
        logger.exception("자동 알림 체크 실패")

    return generated


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/")
async def list_alerts(level: Optional[str] = None):
    """최근 알림 목록 반환 + 자동 알림 체크."""
    try:
        alerts = _read_alerts()

        # 자동 생성 알림 추가 및 저장
        auto_alerts = _auto_check_alerts()
        if auto_alerts:
            alerts.extend(auto_alerts)
            _write_alerts(alerts)

        # 필터
        if level:
            alerts = [a for a in alerts if a.get("level") == level]

        # 최신순 반환
        alerts.sort(key=lambda a: a.get("timestamp", ""), reverse=True)
        return {"alerts": alerts[:MAX_ALERTS]}
    except Exception:
        logger.exception("알림 목록 조회 실패")
        raise HTTPException(status_code=500, detail="알림을 불러올 수 없습니다")


@router.post("/")
async def create_alert(body: AlertCreate):
    """수동 알림 생성."""
    try:
        if body.level not in ("info", "warning", "error"):
            raise HTTPException(status_code=400, detail="level은 info/warning/error만 가능")

        alerts = _read_alerts()
        new_alert = {
            "id": f"alert-{uuid.uuid4().hex[:8]}",
            "level": body.level,
            "message": body.message,
            "source": body.source or "dashboard",
            "timestamp": datetime.now().isoformat(),
            "auto": False,
        }
        alerts.append(new_alert)
        _write_alerts(alerts)
        return new_alert
    except HTTPException:
        raise
    except Exception:
        logger.exception("알림 생성 실패")
        raise HTTPException(status_code=500, detail="알림 생성에 실패했습니다")
