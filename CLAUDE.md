# AI Agent Team - Telegram Bot Multi-Agent System

## Project Overview

텔레그램 봇 기반 AI 에이전트 팀 시스템. 각 에이전트는 독립된 tmux 세션에서 실행되며, 텔레그램 미니앱 대시보드를 통해 진행 상황을 모니터링한다.

## Architecture

```
┌─────────────────────────────────────────────┐
│              Telegram Mini App              │
│           (Dashboard / Monitor)             │
└─────────────┬───────────────────────────────┘
              │ WebSocket / Polling
┌─────────────▼───────────────────────────────┐
│           Dashboard Backend (API)           │
│       - 에이전트 상태 조회                    │
│       - 작업 로그 조회                        │
│       - 명령 전달                            │
└─────────────┬───────────────────────────────┘
              │
┌─────────────▼───────────────────────────────┐
│         Shared State (JSON / SQLite)        │
│   - agent_status.json                       │
│   - task_queue.json                         │
│   - logs/                                   │
└──┬──────┬──────┬──────┬──────┬──────┬───────┘
   │      │      │      │      │      │
┌──▼─┐ ┌──▼─┐ ┌──▼─┐ ┌──▼─┐ ┌──▼─┐ ┌──▼─┐
│총괄│ │기획│ │백엔드│ │프론트│ │리뷰│ │테스트│
│tmux│ │tmux│ │tmux│ │tmux│ │tmux│ │tmux│
└────┘ └────┘ └────┘ └────┘ └────┘ └────┘
```

## Agent Roles

### 1. 총괄 에이전트 (manager)
- tmux session: `agent-manager`
- 역할: 전체 작업 분배 및 조율, 에이전트 간 의존성 관리
- 텔레그램 봇을 통해 사용자와 직접 소통
- 다른 에이전트에게 작업 지시 및 결과 수집

### 2. 기획 에이전트 (planner)
- tmux session: `agent-planner`
- 역할: 요구사항 분석, 기능 명세 작성, 작업 분해
- 출력: specs/, tasks/ 디렉토리에 문서 생성

### 3. 백엔드 에이전트 (backend)
- tmux session: `agent-backend`
- 역할: API 설계 및 구현, 데이터베이스 스키마, 서버 로직
- 출력: backend/ 디렉토리에 코드 생성

### 4. 프론트엔드 에이전트 (frontend)
- tmux session: `agent-frontend`
- 역할: UI 컴포넌트 구현, 텔레그램 미니앱 개발
- 출력: frontend/ 디렉토리에 코드 생성

### 5. 리뷰 에이전트 (reviewer)
- tmux session: `agent-reviewer`
- 역할: 코드 리뷰, 품질 검증, 개선 제안
- 출력: reviews/ 디렉토리에 리뷰 리포트 생성

### 6. 테스트 에이전트 (tester)
- tmux session: `agent-tester`
- 역할: 테스트 케이스 작성, 테스트 실행, 버그 리포트
- 출력: tests/ 디렉토리에 테스트 코드 및 결과

## Directory Structure

```
/home/claude/
├── CLAUDE.md                 # 이 파일 (프로젝트 계획)
├── shared/                   # 에이전트 간 공유 상태
│   ├── state.json            # 에이전트 상태 (running/idle/error)
│   ├── tasks.json            # 작업 큐 및 진행 상황
│   └── logs/                 # 에이전트별 로그
│       ├── manager.log
│       ├── planner.log
│       ├── backend.log
│       ├── frontend.log
│       ├── reviewer.log
│       └── tester.log
├── specs/                    # 기획 산출물
├── backend/                  # 백엔드 코드
├── frontend/                 # 프론트엔드 코드 (미니앱 대시보드)
├── reviews/                  # 리뷰 리포트
├── tests/                    # 테스트 코드
└── scripts/                  # 에이전트 관리 스크립트
    ├── start-all.sh          # 전체 에이전트 시작
    ├── stop-all.sh           # 전체 에이전트 중지
    └── status.sh             # 에이전트 상태 확인
```

## Communication Protocol

에이전트 간 통신은 파일 기반으로 수행:

1. **작업 지시**: `shared/tasks.json`에 작업 추가 (총괄 → 각 에이전트)
2. **상태 보고**: `shared/state.json`에 상태 업데이트 (각 에이전트 → 총괄)
3. **로그**: `shared/logs/`에 실시간 로그 기록
4. **산출물**: 각 에이전트의 지정 디렉토리에 결과물 저장

## Task Flow

```
사용자 (Telegram) → 총괄 에이전트
  → 기획 에이전트 (요구사항 분석)
  → 백엔드 에이전트 (API 구현)
  → 프론트엔드 에이전트 (UI 구현)
  → 리뷰 에이전트 (코드 검토)
  → 테스트 에이전트 (테스트 수행)
  → 총괄 에이전트 (결과 종합)
→ 사용자 (Telegram)
```

## Telegram Mini App Dashboard

미니앱에서 확인 가능한 정보:
- 각 에이전트의 현재 상태 (실행중/대기/에러)
- 진행 중인 작업 목록 및 진행률
- 에이전트별 최근 로그
- 작업 히스토리

## Tech Stack

- **Agent Runtime**: Claude Code (각 tmux 세션에서 실행)
- **State Management**: JSON 파일 기반 (필요시 SQLite로 전환)
- **Dashboard Backend**: Node.js + Express
- **Dashboard Frontend**: React (Telegram Mini App SDK)
- **Process Management**: tmux + bash scripts

## Implementation Phases

### Phase 1: Infrastructure
- [ ] 공유 상태 파일 구조 생성 (shared/)
- [ ] tmux 세션 관리 스크립트 작성 (scripts/)
- [ ] 에이전트 간 통신 프로토콜 구현

### Phase 2: Core Agents
- [ ] 총괄 에이전트 설정 및 텔레그램 봇 연동
- [ ] 기획 에이전트 프롬프트 및 워크플로우 구성
- [ ] 백엔드/프론트엔드 에이전트 구성

### Phase 3: Quality Agents
- [ ] 리뷰 에이전트 구성
- [ ] 테스트 에이전트 구성

### Phase 4: Dashboard
- [ ] 대시보드 백엔드 API 구현
- [ ] 텔레그램 미니앱 프론트엔드 구현
- [ ] 실시간 상태 모니터링 기능
