"""시스템 상태 + 환경 정보 API."""

import subprocess
import psutil
import json
import logging
from pathlib import Path
from datetime import datetime

from fastapi import APIRouter

router = APIRouter(prefix="/system", tags=["system"])
logger = logging.getLogger(__name__)

HOME = Path.home()
HISTORY_FILE = Path("/tmp/system_history.json")
MAX_HISTORY = 60


@router.get("/overview")
async def overview():
    """메인 대시보드 데이터: 시스템 + 환경 + 프로세스."""
    # CPU / RAM / Disk
    cpu_pct = psutil.cpu_percent(interval=0.5)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    # 주요 프로세스
    processes = []
    for proc in psutil.process_iter(["pid", "name", "cpu_percent", "memory_percent", "cmdline", "create_time"]):
        try:
            info = proc.info
            cmd = " ".join(info["cmdline"][:3]) if info["cmdline"] else info["name"]
            if info["cpu_percent"] and info["cpu_percent"] > 0.5:
                processes.append({
                    "pid": info["pid"],
                    "name": cmd[:80],
                    "cpu": round(info["cpu_percent"], 1),
                    "mem": round(info["memory_percent"], 1),
                    "uptime": _uptime_str(info["create_time"]),
                })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

    processes.sort(key=lambda x: -x["cpu"])

    # 플러그인 목록
    plugins = []
    try:
        settings = json.loads((HOME / ".claude" / "settings.json").read_text())
        plugins = list(settings.get("enabledPlugins", {}).keys())
    except Exception:
        pass

    # 스킬 목록
    skills = []
    try:
        skills_dir = HOME / ".claude" / "skills"
        if skills_dir.is_dir():
            skills = [f.name for f in skills_dir.iterdir()]
    except Exception:
        pass

    # tmux 세션
    tmux_sessions = []
    try:
        r = subprocess.run(["tmux", "ls"], capture_output=True, text=True, timeout=3)
        if r.returncode == 0:
            tmux_sessions = [line.split(":")[0] for line in r.stdout.strip().splitlines()]
    except Exception:
        pass

    return {
        "system": {
            "cpu_percent": cpu_pct,
            "cpu_cores": psutil.cpu_count(),
            "ram_total_gb": round(mem.total / (1024**3), 1),
            "ram_used_gb": round(mem.used / (1024**3), 1),
            "ram_percent": mem.percent,
            "disk_total_gb": round(disk.total / (1024**3), 1),
            "disk_used_gb": round(disk.used / (1024**3), 1),
            "disk_percent": disk.percent,
        },
        "processes": processes[:15],
        "environment": {
            "plugins": plugins,
            "skills": skills,
            "tmux_sessions": tmux_sessions,
        },
        "timestamp": datetime.now().isoformat(),
    }


@router.get("/projects")
async def projects():
    """프로젝트별 Git 상태 + 배포 정보."""
    project_list = [
        {"name": "coin-bot", "path": str(HOME / "coin-bot"), "railway": "coin-auto-trade"},
        {"name": "cleaning-bot", "path": str(HOME / "cleaning-bot"), "railway": "Allgreen"},
    ]

    results = []
    for proj in project_list:
        p = Path(proj["path"])
        info = {"name": proj["name"], "railway_project": proj["railway"]}

        if not p.is_dir():
            info["error"] = "디렉토리 없음"
            results.append(info)
            continue

        # Git 상태
        try:
            branch = subprocess.run(
                ["git", "branch", "--show-current"], cwd=p,
                capture_output=True, text=True, timeout=5
            ).stdout.strip()
            info["branch"] = branch

            # 최근 커밋 3개
            log = subprocess.run(
                ["git", "log", "--oneline", "-3"], cwd=p,
                capture_output=True, text=True, timeout=5
            ).stdout.strip()
            info["recent_commits"] = log.splitlines()

            # 변경 파일 수
            status = subprocess.run(
                ["git", "status", "--short"], cwd=p,
                capture_output=True, text=True, timeout=5
            ).stdout.strip()
            changed = len([l for l in status.splitlines() if l.strip()])
            info["changed_files"] = changed

            # 마지막 커밋 시간
            last_commit_time = subprocess.run(
                ["git", "log", "-1", "--format=%ci"], cwd=p,
                capture_output=True, text=True, timeout=5
            ).stdout.strip()
            info["last_commit"] = last_commit_time

        except Exception as e:
            info["error"] = str(e)

        results.append(info)

    return {"projects": results}


@router.get("/jobs")
async def jobs():
    """백그라운드 작업 상태."""
    job_list = []

    # 8년 백테스트 확인
    bt_log = HOME / "coin-bot" / "backtest_results" / "8year_log.txt"
    bt_report = HOME / "coin-bot" / "backtest_results" / "8year_report.txt"

    if bt_log.exists():
        try:
            log_lines = bt_log.read_text(encoding="utf-8").splitlines()
            last_lines = log_lines[-5:] if log_lines else []

            # 진행률 파싱
            progress = "알 수 없음"
            for line in reversed(log_lines):
                if "/" in line and "17" in line:
                    # [6/17] 패턴 찾기
                    import re
                    m = re.search(r'\[(\d+)/(\d+)\]', line)
                    if m:
                        current, total = int(m.group(1)), int(m.group(2))
                        progress = f"{current}/{total} ({current/total*100:.0f}%)"
                        break

            # 프로세스 실행 중인지 확인
            is_running = False
            for proc in psutil.process_iter(["cmdline"]):
                try:
                    cmd = " ".join(proc.info["cmdline"] or [])
                    if "backtest_8year" in cmd:
                        is_running = True
                        break
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass

            job_list.append({
                "name": "8년 백테스트",
                "status": "running" if is_running else "completed",
                "progress": progress,
                "last_log": last_lines,
                "report_exists": bt_report.exists(),
            })
        except Exception as e:
            job_list.append({"name": "8년 백테스트", "error": str(e)})

    # 기타 python 백그라운드 작업
    for proc in psutil.process_iter(["pid", "name", "cmdline", "cpu_percent", "create_time"]):
        try:
            cmd = " ".join(proc.info["cmdline"] or [])
            if "python" in cmd and ("backtest" in cmd or "optimize" in cmd) and "backtest_8year" not in cmd:
                job_list.append({
                    "name": cmd[:60],
                    "status": "running",
                    "pid": proc.info["pid"],
                    "cpu": round(proc.info["cpu_percent"], 1),
                    "uptime": _uptime_str(proc.info["create_time"]),
                })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

    return {"jobs": job_list}


@router.get("/history")
async def history():
    """CPU/RAM/디스크 스냅샷 히스토리 (최대 60개, 1분 간격 기준 1시간)."""
    # 현재 스냅샷 생성
    cpu_pct = psutil.cpu_percent(interval=0.3)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    snapshot = {
        "timestamp": datetime.now().isoformat(),
        "cpu_percent": cpu_pct,
        "ram_percent": mem.percent,
        "disk_percent": disk.percent,
    }

    # 기존 히스토리 로드
    entries = []
    try:
        if HISTORY_FILE.exists():
            entries = json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
    except Exception:
        logger.warning("히스토리 파일 읽기 실패, 새로 생성")
        entries = []

    # 새 스냅샷 추가 + 최대 개수 유지
    entries.append(snapshot)
    if len(entries) > MAX_HISTORY:
        entries = entries[-MAX_HISTORY:]

    # 저장
    try:
        HISTORY_FILE.write_text(json.dumps(entries, ensure_ascii=False), encoding="utf-8")
    except Exception:
        logger.exception("히스토리 파일 저장 실패")

    return {"history": entries}


def _uptime_str(create_time):
    if not create_time:
        return "알 수 없음"
    delta = datetime.now().timestamp() - create_time
    hours = int(delta // 3600)
    minutes = int((delta % 3600) // 60)
    if hours > 24:
        return f"{hours // 24}일 {hours % 24}시간"
    elif hours > 0:
        return f"{hours}시간 {minutes}분"
    else:
        return f"{minutes}분"
