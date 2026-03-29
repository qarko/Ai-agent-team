# Review: Dashboard V2 Backend API

- 날짜: 2026-03-28
- 결과: **NEEDS_FIX** (3 critical, 4 informational — 4건 자동 수정, 3건 미결)
- 대상: `/home/claude/dashboard-v2/backend/app/` 전체
- 모드: /review (gstack)

---

## Pre-Landing Review: 7 issues (3 critical, 4 informational)

### AUTO-FIXED (4건)

| # | 파일 | 심각도 | 문제 | 수정 내용 |
|---|------|--------|------|-----------|
| 1 | `logs.py:45` | CRITICAL | Path Traversal — `agent` 파라미터가 sanitize 없이 파일 경로에 사용됨. `../../etc/something` 입력으로 임의 `.log` 파일 읽기 가능 | `re.match(r"^[\w\-]+$", agent)` 검증 추가. 알파벳/숫자/하이픈/언더스코어만 허용 |
| 2 | `main.py:37` | CRITICAL | Path Traversal (SPA fallback) — `path` 파라미터로 `STATIC_DIR` 외부 파일 접근 가능 | `.resolve()` 후 `STATIC_DIR` prefix 검증 추가. 외부 경로 시 403 반환 |
| 3 | `tasks.py:63-64` | INFO | priority/status 입력 검증 없음 — 임의 문자열 허용 | `VALID_PRIORITIES`, `VALID_STATUSES` 상수 + `model_post_init()` 검증 추가 |
| 4 | `agents.py:108` | INFO | agent status 입력 검증 없음 | `VALID_STATUSES` 상수 + PATCH 엔드포인트에 검증 로직 추가 |

### NEEDS INPUT (3건 — 미결)

#### 1. [CRITICAL] Race Condition — JSON 파일 TOCTOU (agents.py, tasks.py, chat.py)

**문제:** 모든 JSON 파일 기반 엔드포인트가 read→modify→write 패턴 사용. 동시 요청 시:
- `create_task()`: 같은 `next_id` 할당 → 중복 ID
- `update_agent()`: 동시 PATCH → 한쪽 업데이트 유실
- `update_task()`: 동시 수정 → 데이터 유실

**해결 방안:**
- A) `fcntl.flock()` 파일 락 추가 (간단, 단일 서버용)
- B) SQLite로 전환 (concurrent-safe, 약간의 리팩토링 필요)
- C) 현재 유지 (단일 사용자 대시보드라면 실제 race 가능성 낮음)

**권장:** 현재 용도(팀 내부 대시보드)에서는 C가 현실적. 외부 공개 시 B 권장.

#### 2. [INFO] Sync I/O in async endpoints — Event loop blocking

**문제:** `subprocess.run()`, `file.read_text()`, `file.write_text()` 가 async 엔드포인트에서 직접 호출됨.
- `agents.py`: `_tmux_running()` (subprocess), `_read_state()/_write_state()` (file I/O)
- `chat.py`: `_load_messages()/_append_message()` (file I/O), `send_message()` (subprocess)
- `tasks.py`: `_read()/_write()` (file I/O)
- `logs.py`: `log_file.read_text()` (file I/O)

**해결 방안:**
- A) `async def` → `def`로 변경 (FastAPI가 자동으로 threadpool 실행)
- B) `asyncio.to_thread()` 래핑
- C) 현재 유지 (동시 접속 적을 경우)

**권장:** A가 가장 간단. `async def`를 `def`로 바꾸면 FastAPI가 알아서 스레드에서 실행.

#### 3. [INFO] 인증/인가 없음 — 모든 엔드포인트 공개

**문제:** 모든 API가 인증 없이 접근 가능. 특히 위험한 엔드포인트:
- `POST /api/agents/{id}/command` — 에이전트에 임의 명령 전송
- `DELETE /api/tasks/{id}` — 태스크 삭제
- `POST /api/chat/send` — 에이전트에 메시지 전송

**권장:** 내부망 전용이면 허용 가능. 외부 노출 시 최소한 API key 미들웨어 추가 필요.

---

## 보안 체크리스트

| 항목 | 결과 |
|------|------|
| API키 하드코딩 | PASS — 없음 |
| Shell Injection | PASS — subprocess array args + regex 검증 |
| Path Traversal | **FIXED** — logs.py, main.py 모두 수정 |
| SQL Injection | N/A — SQL 미사용 |
| 입력 검증 | **FIXED** — priority/status/agent 검증 추가 |
| 에러 시 민감정보 노출 | PASS — 에러 메시지에 내부 경로 미노출 |
| HTTPS | N/A — 서버 레벨 설정 |

---

## 코드 품질 요약

**잘된 점:**
- 깔끔한 구조. 모듈 분리 적절
- subprocess 호출 시 shell=True 미사용 (보안적으로 올바름)
- CORS 설정이 환경변수 기반
- Pydantic 모델로 요청 검증
- 에러 처리 일관됨

**개선 필요:**
- Race condition (아키텍처 결정 필요)
- Sync/Async 혼용
- 인증 미구현

---

## 파일별 변경 사항

| 파일 | 변경 |
|------|------|
| `api/v1/logs.py` | `import re` 추가, Path traversal 방지 regex 검증 |
| `main.py` | `.resolve()` + prefix 검증으로 경로 순회 차단 |
| `api/v1/tasks.py` | `VALID_PRIORITIES`, `VALID_STATUSES` 상수 + 모델 검증 |
| `api/v1/agents.py` | `VALID_STATUSES` 상수 + PATCH 검증 |
