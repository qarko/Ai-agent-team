import json
import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api.v1 import router as api_router
from app.core.config import settings

logger = logging.getLogger("main")
app = FastAPI(title="Dashboard API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type"],
)

app.include_router(api_router)


@app.get("/health")
async def health():
    import subprocess
    stats = {"active_agents": 0, "total_messages": 0, "total_tasks": 0, "omc_teams": 0}

    # tmux 에이전트 활성 수
    tmux_sessions = ["agent-manager", "agent-planner", "agent-backend",
                     "agent-frontend", "agent-reviewer", "agent-tester"]
    for session in tmux_sessions:
        try:
            r = subprocess.run(["tmux", "has-session", "-t", session],
                               capture_output=True, timeout=3)
            if r.returncode == 0:
                stats["active_agents"] += 1
        except Exception:
            pass

    # OMC 팀 수
    try:
        teams_dir = Path.home() / ".claude" / "teams"
        if teams_dir.is_dir():
            stats["omc_teams"] = sum(
                1 for d in teams_dir.iterdir()
                if d.is_dir() and (d / "config.json").exists()
            )
    except Exception:
        pass

    # 채팅 메시지 수
    try:
        chat_file = Path("/home/claude/shared/chat/messages.jsonl")
        if chat_file.exists():
            stats["total_messages"] = sum(
                1 for line in chat_file.read_text(encoding="utf-8").splitlines()
                if line.strip()
            )
    except Exception:
        pass

    # OMC 태스크 수
    try:
        tasks_dir = Path.home() / ".claude" / "tasks"
        if tasks_dir.is_dir():
            for team_dir in tasks_dir.iterdir():
                if team_dir.is_dir():
                    stats["total_tasks"] += sum(1 for _ in team_dir.glob("*.json"))
    except Exception:
        pass

    return {"status": "ok", **stats}


# Serve frontend static files
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
if STATIC_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{path:path}")
    async def serve_spa(path: str):
        if path.startswith("api/") or path == "health":
            from fastapi.responses import JSONResponse
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        file_path = (STATIC_DIR / path).resolve()
        # 경로 순회 방지: STATIC_DIR 외부 접근 차단
        if not str(file_path).startswith(str(STATIC_DIR.resolve())):
            from fastapi.responses import JSONResponse
            return JSONResponse(status_code=403, content={"detail": "Forbidden"})
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")
