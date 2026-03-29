# Review: Dashboard v2 (백엔드 + 프론트엔드)

- 날짜: 2026-03-26
- 리뷰어: reviewer (Opus 4.6)
- 대상: /home/claude/dashboard-v2/backend/app/ + /home/claude/dashboard-v2/frontend/src/
- 명세: /home/claude/specs/feature-dashboard-v2.md
- 결과: **PASS**

---

## 1차 리뷰 (NEEDS_FIX) → 2차 리뷰 (PASS)

### 필수 수정 7건 — 모두 해결됨

| # | 심각도 | 이슈 | 수정 확인 |
|---|--------|------|-----------|
| 1 | CRITICAL | CORS 와일드카드 + credentials | ALLOWED_ORIGINS 환경변수 기반으로 변경 |
| 2 | CRITICAL | config.py 시크릿 하드코딩 | Field(...) 필수화, 기본값 제거 |
| 3 | HIGH | 명령 실행 stderr 클라이언트 노출 | 일반 메시지 반환 + logger.error 서버측 기록 |
| 4 | HIGH | 쉘 특수문자 블랙리스트 검증 | 화이트리스트 정규식 + 개행/제어문자 차단 |
| 5 | MEDIUM | MessageStream key=index | key={msg.ts-msg.from} 으로 변경 |
| 6 | MEDIUM | useChat error UI 미연동 | ChatView 헤더 오류 배지 + MessageStream 에러 화면 |
| 7 | MEDIUM | unread 추적 로직 미구현 | handleNewMessages 콜백 + activeTab/channel ref 기반 판별 |

### 권장 개선 3건 — 추가 반영됨 (백엔드)

| 항목 | 수정 확인 |
|------|-----------|
| 명령 실행 감사 로깅 | logger로 ts, agent_id, command, 결과 기록 |
| JSONL 파싱 방어 코드 | 개별 실패 시 warning 로깅 후 스킵 |
| 시스템 에이전트 삭제 방지 | DELETE → 403 반환 |

---

## 백엔드 최종 상태

### 보안 — PASS
- CORS: 환경변수 ALLOWED_ORIGINS에서 허용 출처 파싱
- 시크릿: DATABASE_URL, SECRET_KEY 필수 필드 (기본값 없음, SECRET_KEY min_length=32)
- 명령 검증: 화이트리스트 정규식 (한글/영문/숫자/기본구두점), 개행/null 바이트 차단
- 에러 응답: 일반 메시지만 반환, stderr는 서버 로그에만 기록
- 감사 로깅: 모든 명령 실행에 타임스탬프/agent_id/command/결과 기록
- 시스템 에이전트: 삭제 시 403 반환

### 코드 품질 — PASS
- JSONL 파싱 방어 코드 적용
- 에러 핸들링 적절

### 잔여 참고사항 (비차단)
- 태스크 agent_id 검증 미적용 (LOW)
- ForeignKey cascade delete 미설정 (LOW)
- 로그 API 경로가 명세와 약간 다름 (LOW, 프론트와 정합은 맞음)

---

## 프론트엔드 최종 상태

### 채팅 뷰 완성도 — PASS

| 컴포넌트 | 상태 | 비고 |
|----------|------|------|
| ChatView.jsx | PASS | 채널 전환, error 배지, 3초 폴링 |
| ChannelList.jsx | PASS | 160px, 미읽음 배지, 활성 강조 |
| MessageStream.jsx | PASS | key={ts-from}, error UI, 자동 스크롤 |
| MessageBubble.jsx | PASS | 발신/수신 구분, 아바타, 색상 |
| SystemMessage.jsx | PASS | 시스템 메시지 구분 표시 |

### 코드 품질 — PASS
- useChat: onNewMessages 콜백으로 새 메시지 전파
- App.jsx: ref 기반 activeTab/channel 추적으로 정확한 unread 판별
- 채팅 탭 전환 시 unread 클리어 동작 확인

### 스타일/UX 준수도 — PASS
- 사이드바 240px, 채널 목록 160px, 5개 탭
- 에이전트 색상 6종, AgentAvatar 3사이즈
- 상태 인디케이터 + pulse 애니메이션
- 다크 테마 색상 팔레트, 폴링 주기 준수

### 잔여 참고사항 (비차단)
- TabNav.jsx 미사용 (중복 코드, LOW)
- 폴링 간격 하드코딩 (LOW)
- CommandModal 프론트엔드 입력 검증 없음 (백엔드에서 처리, LOW)

---

## 종합 판정: PASS

모든 보안 이슈와 필수 수정 사항이 해결되었습니다. 잔여 LOW 이슈들은 머지를 차단하지 않습니다.
