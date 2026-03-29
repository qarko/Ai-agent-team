# 청소사업 업무 관리 시스템 - 확정 기획서

## 프로젝트 개요
- 대상 업체: 카시트/매트리스 세척 전문 업체 (사장 1명 + 직원 1명)
- 현재 문제: 구두/카카오톡으로 예약 관리 → 비효율적
- 목표: 텔레그램 봇으로 예약/업무/정산 완전 자동화
- 배포: Railway (별도 프로젝트)

---

## 기술 스택 (확정)
- 백엔드: Python 3.11+ (FastAPI)
- 봇: python-telegram-bot v20+ (비동기)
- 프론트: React (Vite) + Telegram Mini App SDK
- DB: PostgreSQL (Railway 제공)
- 이미지: Cloudinary
- 서버: Railway

---

## 사용자 & 권한

| 역할 | 사용자 | 권한 |
|------|--------|------|
| 사장 (boss) | 1명 | 예약 등록/수정/취소, 현황 확인, 매출 통계, 설정 관리, 업무 처리 |
| 직원 (staff) | 1명 | 업무 진행 상황 업데이트, 사진 업로드, 본인 할 일 조회 |

- /start 명령어로 역할 등록
- 직원은 사장이 발급한 초대 코드로 등록

---

## 핵심 기능

### 1. 예약 등록 (인라인 버튼 대화형)

사장이 봇에서 /new 입력 시 단계별 진행:

```
1단계: 고객명 입력 (텍스트)
2단계: 연락처 입력 (텍스트)
3단계: 주소 입력 (텍스트)
4단계: 품목 선택 (인라인 버튼)
   [카시트] [매트리스] [소파] [기타]
5단계: 수량/사이즈 입력
6단계: 날짜 선택 (인라인 버튼 캘린더)
7단계: 시간 선택 (인라인 버튼)
   [오전(9-12)] [오후(12-18)] [저녁(18-21)]
8단계: 특이사항 입력 (텍스트 또는 [없음] 버튼)
9단계: 견적 자동 계산 → 확인
   [등록하기] [수정하기] [취소]
```

등록 완료 시:
- 예약번호 자동 생성 (CL-YYYYMMDD-NNN)
- 단체방에 자동 알림 발송
- 고객 DB 자동 등록 (신규) 또는 업데이트 (재방문)

### 2. 예약 관리

| 명령어 | 기능 | 권한 |
|--------|------|------|
| /new | 새 예약 등록 | 사장 |
| /today | 오늘 예약 목록 | 모두 |
| /list | 전체 예약 목록 | 모두 |
| /view CL-xxx | 예약 상세 조회 | 모두 |
| /edit CL-xxx | 예약 수정 | 사장 |
| /cancel CL-xxx | 예약 취소 | 사장 |
| /mytasks | 내 할 일 목록 | 모두 |

### 3. 업무 처리 (직원/사장 공통)

예약 조회 시 현재 상태에 따른 인라인 버튼 표시:

```
예약 CL-20260324-001
고객: 홍길동 | 카시트 2개
상태: 확정

[수거 출발] [예약 취소]
```

각 단계 클릭 시:
1. 상태 자동 변경
2. 사진 업로드 요청 (선택)
3. 메모 입력 (선택)
4. 단체방 자동 알림
5. 작업 시간 자동 기록

### 4. 상태 흐름

```
대기(pending)
  → 확정(confirmed)
  → 수거중(picking_up)
  → 수거완료(picked_up) + 사진
  → 세척중(cleaning)
  → 세척완료(cleaned) + 사진
  → 배송중(delivering)
  → 배송완료(delivered) + 사진
  → 정산완료(settled)
```

### 5. 고객 알림 (카카오 알림톡)

| 시점 | 메시지 |
|------|--------|
| 예약 확정 | "[업체명] 예약이 확정되었습니다. 일시: OO월 OO일 OO시" |
| 수거 완료 | "[업체명] 수거가 완료되었습니다. 세척 후 연락드리겠습니다." |
| 세척 완료 | "[업체명] 세척이 완료되었습니다. 배송 예정일: OO월 OO일" |
| 배송 완료 | "[업체명] 배송이 완료되었습니다. 이용해 주셔서 감사합니다." |

- 카카오 알림톡 연동 (사업자 등록 필요)
- Phase 1에서는 수동 안내, Phase 2에서 자동화

### 6. 단체방 알림 형식

```
━━━━━━━━━━━━━━
[새 예약] CL-20260324-001
━━━━━━━━━━━━━━
고객: 홍길동
연락처: 010-1234-5678
주소: 서울시 강남구 ...
품목: 카시트 2개
일시: 2026.03.25 오전
특이사항: 가죽 시트
금액: 80,000원
━━━━━━━━━━━━━━
```

```
━━━━━━━━━━━━━━
[수거완료] CL-20260324-001
━━━━━━━━━━━━━━
고객: 홍길동 | 카시트 2개
처리: 김직원
시간: 10:30
━━━━━━━━━━━━━━
```

### 7. 매일 아침 자동 알림

매일 08:00에 단체방으로:
```
━━━━━━━━━━━━━━
[오늘의 일정] 2026.03.24
━━━━━━━━━━━━━━
1. 09:00 홍길동 - 카시트 2개 (수거)
2. 14:00 김철수 - 매트리스 1개 (배송)
3. 세척 대기: 3건
━━━━━━━━━━━━━━
```

### 8. 텔레그램 미니앱 대시보드

탭 구성:
1. **홈**: 오늘 요약 카드 (예약 수, 진행중, 완료, 매출)
2. **캘린더**: 월별 예약 현황, 날짜 클릭 → 상세
3. **매출**: 일/주/월 매출 통계, 품목별 비율 차트
4. **내역**: 완료된 예약 목록, 검색/필터
5. **갤러리**: Before/After 사진 모아보기

### 9. 견적 계산기

봇 명령어: /quote

```
품목을 선택하세요:
[카시트] [매트리스] [소파] [기타]

카시트 종류:
[일반] [가죽] [스웨이드]

수량: [1] [2] [3] [직접입력]

━━━━━━━━━━━━━━
견적: 카시트(가죽) x 2
금액: 80,000원
━━━━━━━━━━━━━━
[이 견적으로 예약하기]
```

### 10. 고객 DB

/customer 홍길동 또는 /customer 010-1234-5678

```
━━━━━━━━━━━━━━
[고객 정보] 홍길동
━━━━━━━━━━━━━━
연락처: 010-1234-5678
주소: 서울시 강남구 ...
방문 횟수: 3회
총 결제: 240,000원
━━━━━━━━━━━━━━
최근 이력:
1. 2026.03.01 카시트 2개 - 80,000원
2. 2026.01.15 매트리스 1개 - 60,000원
3. 2025.11.20 카시트 1개 - 40,000원
━━━━━━━━━━━━━━
```

---

## DB 스키마 (확정)

### employees (사용자)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL PK | |
| name | VARCHAR(50) | 이름 |
| telegram_user_id | BIGINT UNIQUE | 텔레그램 ID |
| role | VARCHAR(10) | boss / staff |
| invite_code | VARCHAR(20) | 초대 코드 (사장 발급) |
| created_at | TIMESTAMP | |

### customers (고객)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL PK | |
| name | VARCHAR(50) | 고객명 |
| phone | VARCHAR(20) | 연락처 |
| address | TEXT | 주소 |
| memo | TEXT | 메모 |
| visit_count | INT DEFAULT 0 | 방문 횟수 |
| total_paid | INT DEFAULT 0 | 총 결제 금액 |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### pricing (가격표)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL PK | |
| item_type | VARCHAR(30) | 카시트/매트리스/소파 |
| item_subtype | VARCHAR(30) | 일반/가죽/스웨이드 등 |
| price | INT | 가격 (원) |
| is_active | BOOLEAN | 활성 여부 |

### reservations (예약)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL PK | |
| reservation_no | VARCHAR(20) UNIQUE | CL-YYYYMMDD-NNN |
| customer_id | FK → customers | |
| item_type | VARCHAR(30) | 품목 |
| item_subtype | VARCHAR(30) | 세부 종류 |
| quantity | INT DEFAULT 1 | 수량 |
| scheduled_date | DATE | 예약 날짜 |
| scheduled_time | VARCHAR(10) | morning/afternoon/evening |
| pickup_address | TEXT | 수거 주소 |
| delivery_address | TEXT | 배송 주소 (다를 경우) |
| special_notes | TEXT | 특이사항 |
| status | VARCHAR(20) | 상태 |
| price | INT | 견적 금액 |
| final_price | INT | 최종 금액 (할인 적용) |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### task_updates (업무 진행)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL PK | |
| reservation_id | FK → reservations | |
| stage | VARCHAR(20) | pickup/clean/delivery |
| photo_url | TEXT | 사진 URL (Cloudinary) |
| memo | TEXT | 메모 |
| updated_by | FK → employees | |
| completed_at | TIMESTAMP | |

### payments (정산)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL PK | |
| reservation_id | FK → reservations | |
| amount | INT | 금액 |
| method | VARCHAR(20) | cash/card/naver |
| paid_at | TIMESTAMP | |

### notifications (알림 로그)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | SERIAL PK | |
| reservation_id | FK → reservations | |
| type | VARCHAR(20) | kakao/telegram/sms |
| target | VARCHAR(50) | 수신 대상 |
| message | TEXT | 메시지 내용 |
| status | VARCHAR(10) | sent/failed |
| sent_at | TIMESTAMP | |

### settings (설정)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| key | VARCHAR(50) PK | 설정 키 |
| value | TEXT | 설정 값 (JSON) |

---

## 개발 단계 (확정)

### Phase 1 - MVP (핵심)
- [ ] 프로젝트 셋업 (FastAPI + PostgreSQL + Railway)
- [ ] 텔레그램 봇 생성 및 연동
- [ ] DB 마이그레이션
- [ ] /start - 역할 등록 (사장/직원)
- [ ] /new - 예약 등록 (대화형 인라인 버튼)
- [ ] /today, /list, /view - 예약 조회
- [ ] /edit, /cancel - 예약 수정/취소
- [ ] 업무 처리 (수거/세척/배송 + 사진)
- [ ] 단체방 자동 알림
- [ ] 매일 아침 일정 알림
- [ ] /mytasks - 할 일 목록
- [ ] 견적 계산기 (/quote)
- [ ] 고객 DB (/customer)

### Phase 2 - 대시보드
- [ ] 미니앱 프론트엔드 (React)
- [ ] 대시보드 API
- [ ] 캘린더 뷰
- [ ] 매출 통계
- [ ] Before/After 갤러리

### Phase 3 - 고도화
- [ ] 카카오 알림톡 연동
- [ ] 반복/정기 예약
- [ ] 엑셀 내보내기 (월별 정산서)
- [ ] 고객 만족도 조사
- [ ] 간편 결제 연동

---

## 프로젝트 구조

```
cleaning-bot/
├── app/
│   ├── main.py              # FastAPI 앱 + 봇 시작
│   ├── config.py             # 환경변수, 설정
│   ├── database.py           # DB 연결, 세션
│   ├── models/               # SQLAlchemy 모델
│   │   ├── customer.py
│   │   ├── reservation.py
│   │   ├── employee.py
│   │   ├── task_update.py
│   │   ├── payment.py
│   │   └── pricing.py
│   ├── bot/                  # 텔레그램 봇
│   │   ├── handlers/
│   │   │   ├── start.py      # /start 역할 등록
│   │   │   ├── reservation.py # 예약 등록/조회/수정
│   │   │   ├── task.py       # 업무 처리
│   │   │   ├── quote.py      # 견적 계산
│   │   │   └── customer.py   # 고객 조회
│   │   ├── keyboards.py      # 인라인 키보드 모음
│   │   ├── notifications.py  # 알림 발송
│   │   └── scheduler.py      # 스케줄 작업 (아침 알림)
│   ├── api/                  # 대시보드 API
│   │   ├── routes/
│   │   └── deps.py
│   └── services/             # 비즈니스 로직
│       ├── reservation_service.py
│       ├── customer_service.py
│       ├── payment_service.py
│       └── cloudinary_service.py
├── frontend/                 # 미니앱 (Phase 2)
├── alembic/                  # DB 마이그레이션
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```
