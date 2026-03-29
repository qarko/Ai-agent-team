"""채팅 API — /home/claude/shared/chat/messages.jsonl 기반.

messages.jsonl 형식 (한 줄 = 한 메시지):
{"ts":"2026-03-25T15:56:13Z","from":"system","to":"planner","message":"..."}

GET  /api/chat/messages   JSONL 읽기 (limit, offset, agent, since 필터)
POST /api/chat/send       send-to-agent.sh 호출 + JSONL 기록
"""

import asyncio
import json
import logging
import os
import re
import subprocess
from collections import deque
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter(prefix="/chat", tags=["chat"])
logger = logging.getLogger("chat")

CHAT_FILE = Path("/home/claude/shared/chat/messages.jsonl")
_chat_lock = asyncio.Lock()
ALLOWED_AGENTS = {"manager", "planner", "backend", "frontend", "reviewer", "tester"}


# ── 파일 helpers ──────────────────────────────────────────────────────────────

def _load_messages(max_lines: int = 0) -> list[dict]:
    """JSONL 메시지 로드. max_lines > 0이면 파일 끝에서 마지막 N줄만 읽는다."""
    if not CHAT_FILE.exists():
        return []
    if max_lines > 0:
        return _tail_messages(max_lines)
    messages = []
    for line in CHAT_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            messages.append(json.loads(line))
        except json.JSONDecodeError:
            pass
    return messages


def _tail_messages(n: int) -> list[dict]:
    """파일 끝에서 마지막 n줄만 효율적으로 읽는다."""
    try:
        with open(CHAT_FILE, "rb") as f:
            f.seek(0, os.SEEK_END)
            size = f.tell()
            if size == 0:
                return []
            # 한 줄 평균 ~300바이트 가정, 넉넉하게 읽기
            chunk_size = min(size, n * 512)
            f.seek(max(0, size - chunk_size))
            data = f.read().decode("utf-8", errors="replace")
    except (OSError, ValueError):
        return []

    lines = deque(maxlen=n)
    for line in data.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            lines.append(json.loads(line))
        except json.JSONDecodeError:
            pass
    return list(lines)


def _append_message(entry: dict) -> None:
    CHAT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(CHAT_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def _parse_ts(ts_str: str) -> Optional[datetime]:
    try:
        return datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return None


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/messages")
async def get_messages(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    agent: Optional[str] = Query(None, description="from 또는 to가 이 에이전트인 메시지"),
    since: Optional[str] = Query(None, description="이 시각 이후 메시지만 (ISO8601)"),
):
    try:
        # 필터 없이 limit+offset만 쓸 경우 tail 최적화
        need_full = bool(agent or since)
        async with _chat_lock:
            if need_full:
                messages = _load_messages()
            else:
                messages = _load_messages(max_lines=offset + limit)

        if agent:
            messages = [m for m in messages if m.get("from") == agent or m.get("to") == agent]

        if since:
            try:
                since_dt = datetime.fromisoformat(since.replace("Z", "+00:00"))
            except ValueError:
                raise HTTPException(status_code=400, detail="since가 ISO8601 형식이 아닙니다")
            messages = [
                m for m in messages
                if (ts := _parse_ts(m.get("ts", ""))) is not None and ts > since_dt
            ]

        total = len(messages)
        return {"messages": messages[offset: offset + limit], "total": total}
    except HTTPException:
        raise
    except Exception:
        logger.exception("메시지 조회 실패")
        raise HTTPException(status_code=500, detail="메시지를 불러올 수 없습니다")


class SendMessageRequest(BaseModel):
    to: str
    message: str


@router.post("/send")
async def send_message(req: SendMessageRequest):
    if req.to not in ALLOWED_AGENTS:
        raise HTTPException(status_code=400, detail=f"유효하지 않은 에이전트: {req.to}")
    if re.search(r"[`$\\]", req.message):
        raise HTTPException(status_code=400, detail="허용되지 않는 문자가 포함되어 있습니다")
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="메시지가 비어 있습니다")

    try:
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

        # JSONL에 기록
        async with _chat_lock:
            _append_message({"ts": ts, "from": "user", "to": req.to, "message": req.message})

        # send-to-agent.sh 호출
        script = "/home/claude/scripts/send-to-agent.sh"
        delivered = False
        try:
            result = subprocess.run(
                [script, req.to, req.message],
                capture_output=True, text=True, timeout=10,
            )
            delivered = result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass

        return {"ok": True, "delivered": delivered, "ts": ts}
    except HTTPException:
        raise
    except Exception:
        logger.exception("메시지 전송 실패")
        raise HTTPException(status_code=500, detail="메시지 전송에 실패했습니다")
