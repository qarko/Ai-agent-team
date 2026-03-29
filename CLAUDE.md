# AI Agent Team & Cleaning Bot Project

## 프로젝트 구성
1. **에이전트 팀** - tmux 기반 멀티 에이전트 (agents/, scripts/, shared/)
2. **에이전트 대시보드** - React 미니앱 (backend/, frontend/) → Railway 배포
3. **청소사업 봇** - FastAPI + python-telegram-bot (cleaning-bot/) → Railway 별도 배포

## 에이전트 (6개)
| 에이전트 | tmux 세션 | 모델 | 역할 |
|----------|-----------|------|------|
| manager | agent-manager | Sonnet 4.6 | 작업 분배/조율 |
| planner | agent-planner | Sonnet 4.6 | 기획/명세 |
| backend | agent-backend | Sonnet 4.6 | API/서버 구현 |
| frontend | agent-frontend | Sonnet 4.6 | UI/미니앱 |
| reviewer | agent-reviewer | Opus 4.6 | 코드 리뷰 |
| tester | agent-tester | Haiku 4.5 | 테스트 |

## 주요 스크립트
- `scripts/start-all.sh [agent]` — 에이전트 시작
- `scripts/stop-all.sh [agent]` — 에이전트 중지
- `scripts/status.sh` — 상태 확인
- `scripts/send-to-agent.sh <agent> <msg>` — 명령 전송

## 청소사업 봇 (cleaning-bot/)
- 기술: FastAPI + python-telegram-bot + PostgreSQL
- 기능: 예약등록, 업무처리(수거/세척/배송), 정산, 견적, 고객DB
- GitHub: qarko/Cleaning-bot
- Railway: 별도 프로젝트

## 코인 자동매매 봇 (coin-bot/)
- 기술: Python + PyQt6 (데스크톱) + FastAPI (라이선스서버) + pybit (바이비트)
- 기능: 바이비트 선물 자동매매, 3단계 상품(안정/균형/수익형), AI 분석, 텔레그램 알림
- 수익 모델: 레퍼럴 + 월 구독(3~5만원)
- 보안: keyring(DPAPI) + cryptography(Fernet) API키 암호화, Nuitka/PyArmor 코드 보호
- 배포: Nuitka 또는 PyInstaller → exe

## 배포
- 대시보드: ai-agent-team-production-a7cf.up.railway.app
- 청소봇: Railway 별도 프로젝트
- 코인봇 라이선스서버: Railway (예정)

## 규칙
- 한국어로 소통
- 인라인 버튼 적극 활용
- 결제: 현금(계좌이체) / 카드 / 네이버예약
- 코인봇: 보안 최우선, API키는 절대 서버 전송 금지, 모든 수익 계산에 수수료 포함
