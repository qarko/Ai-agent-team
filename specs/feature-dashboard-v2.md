# 대시보드 v2 기능 명세

**작성일**: 2026-03-25
**작성자**: planner
**버전**: 1.0

---

## 1. 개요

기존 대시보드(v1)의 기능을 유지하면서, 에이전트 간 채팅 뷰 및 캐릭터 아바타를 추가한 v2를 설계한다.

### 1.1 현재 v1 구성

```
frontend/src/
  App.jsx               — 탭 기반 레이아웃 (에이전트 / 작업 / 로그)
  components/
    AgentCard.jsx       — 에이전트 상태 카드 (이름, 역할, 상태, 모델, tmux)
    TaskList.jsx        — 작업 목록
    LogViewer.jsx       — 에이전트별 로그 뷰어

backend/src/
  index.js              — Express 서버 (포트 3001)
  routes/
    agents.js           — GET /api/agents, GET /api/agents/:name, POST /api/agents/:name/command
    tasks.js            — GET /api/tasks
    logs.js             — GET /api/logs/:name
```

### 1.2 v2 추가 목표

- 에이전트별 캐릭터 아바타(이모지 + 색상 테마)
- 에이전트 간 채팅 메시지 버블 뷰
- 실시간 알림 뱃지
- 전체 레이아웃 개선 (사이드바 + 메인 패널)

---

## 2. 에이전트 캐릭터 정의

각 에이전트는 고유 아바타, 색상, 이모지를 가진다.

| 에이전트 | 역할 | 아바타 이모지 | 색상 테마 | 모델 |
|----------|------|-------------|-----------|------|
| manager  | 총괄 | 🎯 | #6366F1 (인디고) | Sonnet 4.6 |
| planner  | 기획 | 📋 | #8B5CF6 (보라) | Sonnet 4.6 |
| backend  | 백엔드 | ⚙️ | #0EA5E9 (파랑) | Sonnet 4.6 |
| frontend | 프론트엔드 | 🎨 | #EC4899 (핑크) | Sonnet 4.6 |
| reviewer | 리뷰 | 🔍 | #F59E0B (앰버) | Opus 4.6 |
| tester   | 테스트 | 🧪 | #10B981 (에메랄드) | Haiku 4.5 |

### 2.1 아바타 컴포넌트 스펙

```
AgentAvatar
  - 크기: sm(24px) / md(40px) / lg(64px)
  - 배경: 에이전트 색상 테마 (투명도 20%)
  - 테두리: 에이전트 색상 테마
  - 상태 인디케이터: 우하단 작은 원 (working=초록 깜빡임 / idle=회색 / error=빨강 / stopped=검정)
  - 아바타 이모지: 중앙 배치
```

---

## 3. 화면 구성 (레이아웃)

```
+---------------------------+-----------------------------+
|        사이드바            |         메인 패널            |
|  (에이전트 목록 + 상태)    |  (선택된 뷰 표시)            |
|  240px 고정               |  나머지 너비                 |
+---------------------------+-----------------------------+
```

### 3.1 사이드바

- 상단: 로고 + "Agent Dashboard" 텍스트
- 에이전트 목록 (6개): 아바타 + 이름 + 상태 뱃지 + 현재 작업 텍스트 (truncate)
- 에이전트 클릭 시 해당 에이전트 상세 뷰로 이동
- 하단: 요약 통계 (활성 N / 작업중 N / 태스크 N)
- 미읽 채팅 뱃지: 에이전트 옆에 숫자 표시

### 3.2 상단 내비게이션 탭

메인 패널 상단에 탭 위치:

```
[개요]  [에이전트]  [작업]  [채팅]  [로그]
```

### 3.3 탭별 뷰

| 탭 | 내용 |
|----|------|
| 개요 | 에이전트 그리드 카드 + 최근 채팅 미리보기 + 진행중 작업 |
| 에이전트 | 에이전트 상세 카드 그리드 |
| 작업 | 작업 목록 (필터: 상태별, 담당자별) |
| 채팅 | 에이전트 간 채팅 버블 뷰 |
| 로그 | 에이전트별 터미널 로그 |

---

## 4. 에이전트 카드 v2 (AgentCard)

### 4.1 카드 구조

```
+--------------------------------+
|  [아바타 md]  manager  🎯      |
|  총괄              [working]   |
|                                |
|  현재 작업: "대시보드 설계..."  |
|                                |
|  Sonnet 4.6  |  tmux: active  |
|  업데이트: 15:05:33            |
|                                |
|  [명령 보내기] 버튼             |
+--------------------------------+
```

### 4.2 상태 뱃지 색상

| 상태 | 색상 | 표시 |
|------|------|------|
| working | 초록 (#10B981) + 깜빡임 | 작업중 |
| idle | 회색 (#6B7280) | 대기중 |
| error | 빨강 (#EF4444) | 오류 |
| stopped | 어두운 회색 (#374151) | 중지됨 |

### 4.3 명령 보내기

- 카드 하단 버튼 클릭 → 모달 팝업
- 텍스트 입력창 + 전송 버튼
- POST /api/agents/:name/command 호출
- 전송 후 토스트 알림 표시

---

## 5. 채팅 뷰 (ChatView)

### 5.1 데이터 소스

- 파일: `/home/claude/shared/chat/messages.jsonl`
- 형식: JSONL (1줄 = 1 JSON 객체)
- 필드:
  ```json
  {
    "ts": "2026-03-25T15:56:13Z",
    "from": "planner",
    "to": "backend",
    "message": "specs/feature-xxx.md 작성 완료..."
  }
  ```
- `from`이 `"system"`인 경우 시스템 메시지 (별도 스타일)

### 5.2 백엔드 API 추가

```
GET  /api/chat/messages?limit=100&offset=0&agent=<name>
     → 전체 또는 특정 에이전트 관련 메시지
     → 응답: { messages: [...], total: N }

GET  /api/chat/messages?since=<ISO8601>
     → 특정 시각 이후 메시지 (실시간 폴링용)
```

### 5.3 채팅 뷰 레이아웃

```
+---채팅 채널 목록---+-------메시지 스트림---------+
| [전체]             | [planner → backend] 15:05   |
| [manager]          | 📋 planner                  |
| [planner]     (2)  | "specs/feature-xxx.md       |
| [backend]          |  작성 완료. 확인 후 구현     |
| [frontend]         |  시작하세요"                 |
| [reviewer]         |                              |
| [tester]           | [backend → planner] 15:07   |
|                    |                 backend ⚙️  |
|                    | "확인했습니다. 구현 시작"    |
+--------------------+------------------------------+
```

왼쪽: 채널 목록 (160px 고정)
오른쪽: 메시지 스트림

### 5.4 메시지 버블 스펙

#### 발신 방향별 정렬

- 선택한 채널이 `from=planner` → 오른쪽 정렬 (내가 보낸 메시지)
- 선택한 채널이 `to=planner` → 왼쪽 정렬 (받은 메시지)
- "전체" 채널: from 기준으로 색상 구분 (항상 왼쪽 정렬)

#### 버블 구조

```
발신자 아바타 (sm, 24px)
발신자 이름  [HH:MM] → to: 수신자명
+----------------------------------+
|  메시지 본문                      |
+----------------------------------+
```

#### 시스템 메시지 스타일

```
────────── [시스템] 15:05 ──────────
소통 방식 업데이트! ...
────────────────────────────────────
```
색상: 회색 / 이탤릭체 / 가운데 정렬

### 5.5 실시간 업데이트

- 3초마다 `/api/chat/messages?since=<lastTs>` 폴링
- 새 메시지 도착 시 스크롤 자동 하단 이동 (사용자가 수동 스크롤 중이면 중단)
- 새 메시지 알림 뱃지: 사이드바 에이전트 옆에 미읽 카운트 표시

---

## 6. 작업 목록 v2 (TaskList)

### 6.1 필터 바

```
[전체] [pending] [in_progress] [completed] [failed]
담당자: [전체 ▼]   우선순위: [전체 ▼]
```

### 6.2 작업 카드

```
+------------------------------------------+
|  #3  새 대시보드 설계 명세       [high]   |
|  담당: planner           [in_progress]    |
|  "기존 대시보드 개선, 채팅 뷰 추가"      |
+------------------------------------------+
```

- 우선순위 색상: high=빨강 / medium=노랑 / low=초록
- 클릭 시 상세 모달 (설명, 히스토리)

---

## 7. 개요 탭 (Overview)

### 7.1 상단 통계 카드 (4개)

```
[활성 에이전트 N/6]  [작업중 N]  [진행중 태스크 N]  [오늘 메시지 N]
```

### 7.2 에이전트 그리드

- 6개 에이전트 카드 (3열 x 2행)
- 카드 크기: 축소 버전 (아바타 + 이름 + 상태 + 현재 작업)

### 7.3 최근 채팅 미리보기

- 최신 5개 메시지 표시
- "채팅 더보기" 링크 → 채팅 탭으로 이동

### 7.4 진행중 작업 목록

- in_progress 상태 작업만 표시
- 최대 5개

---

## 8. 백엔드 API 명세

### 8.1 기존 API (유지)

```
GET  /api/agents                          — 전체 에이전트 상태
GET  /api/agents/:name                    — 특정 에이전트 상태
POST /api/agents/:name/command            — 명령 전송
GET  /api/tasks                           — 작업 목록
GET  /api/logs/:name?lines=50             — 에이전트 로그
```

### 8.2 신규 API

```
GET  /api/chat/messages
     쿼리 파라미터:
       limit  : number  (기본값 100, 최대 500)
       offset : number  (기본값 0)
       agent  : string  (선택, from 또는 to에 해당하는 에이전트 필터)
       since  : string  (ISO8601, 해당 시각 이후 메시지만)
     응답:
       {
         "messages": [
           {
             "ts": "2026-03-25T15:56:13Z",
             "from": "planner",
             "to": "backend",
             "message": "..."
           }
         ],
         "total": 42
       }
```

### 8.3 데이터 읽기 구현 (backend/src/routes/chat.js)

```javascript
// JSONL 파일 파싱
const lines = fs.readFileSync(CHAT_FILE, 'utf8').trim().split('\n');
const messages = lines
  .filter(l => l.trim())
  .map(l => JSON.parse(l));

// agent 필터
if (agent) {
  filtered = messages.filter(m => m.from === agent || m.to === agent);
}

// since 필터
if (since) {
  const sinceTs = new Date(since);
  filtered = filtered.filter(m => new Date(m.ts) > sinceTs);
}

// pagination
const paginated = filtered.slice(offset, offset + limit);
```

---

## 9. 프론트엔드 컴포넌트 구조

```
frontend/src/
  App.jsx                    — 사이드바 + 탭 레이아웃 (수정)
  constants/
    agents.js                — 에이전트 메타 (아바타, 색상, 역할, 모델)
  components/
    Sidebar.jsx              — 사이드바 (에이전트 목록, 통계)
    AgentAvatar.jsx          — 캐릭터 아바타 컴포넌트 (크기별)
    AgentCard.jsx            — 에이전트 카드 v2 (수정)
    CommandModal.jsx         — 명령 전송 모달
    overview/
      Overview.jsx           — 개요 탭
      StatCard.jsx           — 통계 카드
      RecentChat.jsx         — 최근 채팅 미리보기
    chat/
      ChatView.jsx           — 채팅 탭 메인
      ChannelList.jsx        — 채널 목록 (왼쪽 패널)
      MessageStream.jsx      — 메시지 스트림 (오른쪽 패널)
      MessageBubble.jsx      — 메시지 버블 컴포넌트
      SystemMessage.jsx      — 시스템 메시지 컴포넌트
    tasks/
      TaskList.jsx           — 작업 목록 v2 (수정)
      TaskFilter.jsx         — 필터 바
      TaskCard.jsx           — 작업 카드
    logs/
      LogViewer.jsx          — 로그 뷰어 (수정 최소화)
  hooks/
    useAgents.js             — 에이전트 데이터 폴링 (5초)
    useTasks.js              — 태스크 데이터 폴링 (5초)
    useChat.js               — 채팅 데이터 폴링 (3초)
  styles.css                 — 전체 스타일 (수정)
```

---

## 10. 스타일 가이드

### 10.1 색상 팔레트

```css
--bg-primary:   #0F172A;   /* 메인 배경 (짙은 남색) */
--bg-secondary: #1E293B;   /* 카드/패널 배경 */
--bg-tertiary:  #334155;   /* 입력창/버튼 배경 */
--text-primary: #F1F5F9;   /* 주요 텍스트 */
--text-secondary:#94A3B8;  /* 보조 텍스트 */
--border:       #334155;   /* 구분선 */
--accent:       #6366F1;   /* 강조색 (인디고) */
```

### 10.2 메시지 버블 스타일

```css
/* 받은 메시지 (왼쪽) */
.bubble-received {
  background: var(--bg-tertiary);
  border-radius: 4px 16px 16px 16px;
  max-width: 70%;
  align-self: flex-start;
}

/* 보낸 메시지 (오른쪽) */
.bubble-sent {
  background: var(--accent);        /* 에이전트 색상으로 오버라이드 가능 */
  border-radius: 16px 4px 16px 16px;
  max-width: 70%;
  align-self: flex-end;
}
```

### 10.3 아바타 상태 인디케이터 (깜빡임)

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
.status-dot.working { animation: pulse 1.5s infinite; }
```

---

## 11. 구현 우선순위

| 우선순위 | 항목 | 담당 |
|---------|------|------|
| P0 | 백엔드: /api/chat/messages API | backend |
| P0 | AgentAvatar 컴포넌트 + agents.js 상수 | frontend |
| P0 | ChatView + MessageBubble 컴포넌트 | frontend |
| P1 | 레이아웃 변경 (사이드바 + 탭) | frontend |
| P1 | AgentCard v2 업데이트 | frontend |
| P1 | Overview 탭 | frontend |
| P2 | TaskList v2 (필터) | frontend |
| P2 | CommandModal | frontend |
| P3 | 미읽 메시지 뱃지 | frontend |

---

## 12. 보안 요구사항

- POST /api/agents/:name/command: 명령 인젝션 방지 (쉘 특수문자 이스케이프 처리)
- 명령 길이 제한: 최대 500자
- 에이전트 이름 화이트리스트 검증: `['manager','planner','backend','frontend','reviewer','tester']`
- 채팅 파일 읽기 전용 (write 없음)

---

## 13. 비기능 요구사항

- 폴링 주기: 에이전트/태스크 5초, 채팅 3초
- 초기 로딩 시간: 1초 이내
- 번들 크기: React + 순수 CSS (외부 UI 라이브러리 없음, 기존 방식 유지)
- 브라우저 지원: Chrome 최신, Safari 최신
- 반응형: 모바일 고려하지 않음 (데스크톱 전용)
