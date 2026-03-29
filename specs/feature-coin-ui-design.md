# 코인 자동매매 봇 UI 화면 설계 명세

**작성일**: 2026-03-26
**버전**: v1.0
**작성자**: Planner Agent
**참조**: /home/claude/coin-bot/docs/planning_v2.md

---

## 공통 디자인 시스템

### 색상 팔레트 (다크 테마)

```python
COLORS = {
    # 배경
    "bg_primary":    "#0D0D0D",   # 메인 배경
    "bg_secondary":  "#141414",   # 패널 배경
    "bg_tertiary":   "#1C1C1C",   # 카드/위젯 배경
    "bg_hover":      "#242424",   # 호버 상태
    "bg_input":      "#1A1A1A",   # 입력 필드

    # 테두리
    "border":        "#2A2A2A",   # 기본 테두리
    "border_active": "#3D3D3D",   # 활성 테두리

    # 텍스트
    "text_primary":  "#EAEAEA",   # 기본 텍스트
    "text_secondary":"#8A8A8A",   # 보조 텍스트
    "text_muted":    "#555555",   # 흐린 텍스트
    "text_label":    "#6B6B6B",   # 레이블

    # 상태 색상
    "positive":      "#00C48C",   # 상승/수익 (그린)
    "negative":      "#FF4757",   # 하락/손실 (레드)
    "warning":       "#FFB800",   # 경고 (옐로우)
    "info":          "#5B7FFF",   # 정보 (블루)
    "neutral":       "#8A8A8A",   # 중립

    # 포지션
    "long":          "#00C48C",   # 롱 포지션
    "short":         "#FF4757",   # 숏 포지션

    # 상품 등급
    "stable":        "#5B7FFF",   # 안정형 (블루)
    "balanced":      "#FFB800",   # 균형형 (골드)
    "aggressive":    "#FF4757",   # 수익형 (레드)

    # 액션 버튼
    "btn_primary":   "#5B7FFF",   # 기본 버튼
    "btn_danger":    "#FF4757",   # 위험 버튼
    "btn_success":   "#00C48C",   # 성공 버튼
    "btn_stop":      "#FF1744",   # 비상정지 (밝은 레드)
}
```

### 폰트 설정

```python
FONTS = {
    "family":       "Pretendard",       # 한글 지원, fallback: "Noto Sans KR"
    "mono":         "JetBrains Mono",   # 숫자/코드용
    "size_xs":      10,
    "size_sm":      11,
    "size_md":      13,
    "size_lg":      16,
    "size_xl":      20,
    "size_2xl":     24,
    "size_3xl":     32,
}
```

### 공통 위젯 스타일 (QSS)

```css
/* 메인 윈도우 */
QMainWindow {
    background-color: #0D0D0D;
}

/* 카드 위젯 */
.Card {
    background-color: #1C1C1C;
    border: 1px solid #2A2A2A;
    border-radius: 8px;
    padding: 16px;
}

/* 기본 버튼 */
QPushButton {
    background-color: #5B7FFF;
    color: #EAEAEA;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
}
QPushButton:hover { background-color: #7090FF; }
QPushButton:pressed { background-color: #4A6FEE; }
QPushButton:disabled { background-color: #2A2A2A; color: #555555; }

/* 위험 버튼 */
QPushButton.danger {
    background-color: #FF4757;
}
QPushButton.danger:hover { background-color: #FF6B7A; }

/* 입력 필드 */
QLineEdit, QSpinBox, QDoubleSpinBox, QComboBox {
    background-color: #1A1A1A;
    color: #EAEAEA;
    border: 1px solid #2A2A2A;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 13px;
}
QLineEdit:focus, QSpinBox:focus {
    border-color: #5B7FFF;
}

/* 테이블 */
QTableWidget {
    background-color: #141414;
    color: #EAEAEA;
    gridline-color: #1C1C1C;
    border: none;
}
QTableWidget::item:selected {
    background-color: #242424;
}
QHeaderView::section {
    background-color: #1C1C1C;
    color: #8A8A8A;
    border: none;
    padding: 8px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
}

/* 탭 위젯 */
QTabBar::tab {
    background-color: transparent;
    color: #8A8A8A;
    border-bottom: 2px solid transparent;
    padding: 10px 20px;
    font-size: 13px;
}
QTabBar::tab:selected {
    color: #EAEAEA;
    border-bottom-color: #5B7FFF;
}
```

### 레이아웃 구조

```
QMainWindow (1280 x 800, 최소 1024 x 640)
├── TitleBar (커스텀, 높이 40px)
│   ├── Logo + 앱명 (좌측)
│   ├── 가격 티커 (중앙, 실시간)
│   └── 창 컨트롤 + 유저 뱃지 (우측)
├── LeftNav (너비 60px, 아이콘 전용)
│   └── NavItem × 8 (아이콘 + 툴팁)
└── ContentArea (나머지 영역)
    └── StackedWidget (화면별 페이지)
```

---

## 화면 1: 로그인 (LoginScreen)

### 레이아웃

```
QWidget (배경: bg_primary, 중앙 정렬)
├── LogoSection (상단 1/3)
│   ├── QLabel: 앱 로고 이미지 (80×80px)
│   ├── QLabel: "BYBIT AUTO TRADER" (font_size: 2xl, bold)
│   └── QLabel: "바이비트 선물 자동매매" (font_size: sm, text_secondary)
│
├── LoginCard (중앙, 너비 400px, Card 스타일)
│   ├── QLabel: "로그인" (font_size: xl, bold, 상단 여백 16px)
│   ├── ApiKeySection
│   │   ├── QLabel: "API Key" (text_label, font_size: sm)
│   │   └── QLineEdit: placeholder="바이비트 API Key 입력"
│   ├── ApiSecretSection
│   │   ├── QLabel: "API Secret" (text_label, font_size: sm)
│   │   └── QLineEdit: echoMode=Password, placeholder="API Secret 입력"
│   │       └── QToolButton: 👁 (패스워드 토글, 우측 내부)
│   ├── RememberCheck: QCheckBox "API 키 저장 (암호화 보관)"
│   ├── LoginButton: QPushButton "로그인" (btn_primary, 너비 100%, 높이 44px)
│   ├── Divider: 구분선
│   └── ReferralSection
│       ├── QLabel: "바이비트 계정이 없으신가요?" (text_muted, font_size: sm)
│       └── QPushButton "레퍼럴 링크로 가입하기" (텍스트 버튼, info 색상)
│
└── FooterSection (하단)
    ├── QLabel: 버전 정보 (text_muted, font_size: xs)
    └── QLabel: "API 키는 로컬에서만 사용됩니다" (text_muted, font_size: xs)
```

### 동작 명세

| 이벤트 | 동작 |
|--------|------|
| 로그인 버튼 클릭 | API 키 유효성 검증 → Bybit 연결 테스트 → 성공 시 메인화면 이동 |
| API 키 저장 체크 | keyring (DPAPI) 암호화 저장 |
| 앱 재시작 | 저장된 키 자동 로드 후 자동 로그인 시도 |
| 연결 실패 | 에러 토스트 표시 (ex: "API 키가 올바르지 않습니다") |
| 레퍼럴 링크 | 기본 브라우저로 레퍼럴 URL 오픈 |

### 유효성 검사

- API Key: 비어있으면 로그인 버튼 비활성화
- API Secret: 비어있으면 로그인 버튼 비활성화
- 로그인 중: 버튼 `QMovie` 스피너로 교체, 비활성화

---

## 화면 2: 메인 대시보드 (DashboardScreen)

### 레이아웃

```
DashboardScreen (QWidget)
├── TopRow (높이 120px, HBox)
│   ├── AccountCard (너비 25%, Card)
│   │   ├── QLabel: "총 자산" (text_label, font_size: sm)
│   │   ├── QLabel: "$12,450.23" (font_size: 2xl, bold, mono)
│   │   └── QLabel: "≈ ₩16,823,450" (text_secondary, font_size: sm)
│   ├── PnlCard (너비 25%, Card)
│   │   ├── QLabel: "오늘 수익" (text_label, font_size: sm)
│   │   ├── QLabel: "+$234.50" (font_size: 2xl, bold, positive/negative)
│   │   └── QLabel: "+1.92%" (text_secondary, font_size: sm)
│   ├── TotalPnlCard (너비 25%, Card)
│   │   ├── QLabel: "누적 수익" (text_label, font_size: sm)
│   │   ├── QLabel: "+$1,892.30" (font_size: 2xl, bold, positive)
│   │   └── QLabel: "이번 달 +15.2%" (text_secondary, font_size: sm)
│   └── StatusCard (너비 25%, Card)
│       ├── QLabel: "매매 상태" (text_label, font_size: sm)
│       ├── StatusBadge: ● RUNNING / ● STOPPED (positive/negative)
│       └── QLabel: "안정형 운용 중" (text_secondary, font_size: sm)
│
├── MiddleRow (높이 220px, HBox)
│   ├── PositionsPanel (너비 60%, Card)
│   │   ├── Header: "활성 포지션" + 포지션 수 뱃지
│   │   └── PositionTable (QTableWidget)
│   │       컬럼: 심볼 | 방향 | 수량 | 진입가 | 현재가 | 미실현PnL | 레버리지 | 작업
│   │       행 높이: 44px
│   │       방향: LONG(positive), SHORT(negative) 색상 배지
│   │       작업: "청산" 버튼 (위험 버튼, 소형)
│   └── QuickStatsPanel (너비 40%, VBox)
│       ├── StatRow: 오늘 거래 수 / 승률
│       ├── StatRow: 평균 수익 / 평균 손실
│       ├── StatRow: 최대 낙폭 (MDD) / 샤프 비율
│       └── WinLossBar: 시각적 승/패 비율 바
│
└── BottomRow (나머지 높이, HBox)
    ├── RecentTradesPanel (너비 55%, Card)
    │   ├── Header: "최근 거래" + "전체 보기" 링크
    │   └── TradeTable (QTableWidget, 최대 10행)
    │       컬럼: 시간 | 심볼 | 방향 | 체결가 | 수량 | 수익 | 수수료
    └── TelegramPanel (너비 45%, Card)
        ├── Header: "텔레그램 알림"
        ├── TelegramStatus: 연결 상태 표시
        ├── NotificationLog: QListWidget (최근 알림 5개)
        └── QuickSettings: 알림 켜기/끄기 토글
```

### 포지션 테이블 행 스타일

```python
# 롱 포지션 행
ROW_LONG = {
    "direction_text": "LONG",
    "direction_bg": "#00C48C22",  # 반투명 그린
    "direction_color": "#00C48C",
}
# 숏 포지션 행
ROW_SHORT = {
    "direction_text": "SHORT",
    "direction_bg": "#FF475722",  # 반투명 레드
    "direction_color": "#FF4757",
}
# PnL 양수/음수 색상 자동 적용
```

---

## 화면 3: 차트 (ChartScreen)

### 레이아웃

```
ChartScreen (QWidget)
├── ChartToolbar (높이 48px, HBox)
│   ├── SymbolSelector: QComboBox (BTC/USDT, ETH/USDT, SOL/USDT ...)
│   │   → 검색 가능한 콤보박스 (QCompleter 적용)
│   ├── TimeframeButtons: QButtonGroup (토글)
│   │   버튼: 1m | 5m | 15m | 1h | 4h | 1D
│   ├── ChartTypeButtons: QButtonGroup
│   │   버튼: 캔들 | 라인
│   ├── Spacer
│   ├── PriceLabel: "$95,234.50" (font_size: xl, mono, bold)
│   ├── ChangeLabel: "+2.34% ↑" (positive/negative)
│   └── IndicatorButton: "지표 설정" (아이콘 버튼)
│
├── ChartArea (QSplitter, 수직)
│   ├── MainChart (높이 70%)
│   │   → pyqtgraph PlotWidget 기반 캔들스틱 차트
│   │   레이어:
│   │   - 캔들스틱 (OHLC)
│   │   - MA 라인 (MA7: 노랑, MA25: 주황, MA99: 보라)
│   │   - 볼린저 밴드 (반투명 채널)
│   │   - 진입가 수평선 (entry_price, 점선, info)
│   │   - 손절선 (stop_loss, 점선, negative)
│   │   - 익절선 (take_profit, 점선, positive)
│   │   - 체결 마커 (▲ 롱진입, ▼ 숏진입, ✕ 청산)
│   │   우측: 현재가 플로팅 레이블
│   │
│   └── VolumeChart (높이 30%)
│       → 거래량 바 차트
│       → 상승 봉: positive, 하락 봉: negative
│
└── PositionOverlay (차트 우측 패널, 너비 220px, Card)
    ├── Header: "현재 포지션"
    ├── PositionInfo (없으면 "포지션 없음")
    │   ├── Symbol + Direction 뱃지
    │   ├── EntryPrice: "진입가: $94,100"
    │   ├── CurrentPnl: "+$234.50 (+1.2%)" (실시간 업데이트)
    │   ├── StopLoss: "손절: $92,000"
    │   └── TakeProfit: "익절: $97,000"
    └── ActionButtons
        ├── QPushButton "포지션 청산" (danger)
        └── QPushButton "손절/익절 수정" (secondary)
```

### 차트 인터랙션

| 제스처/이벤트 | 동작 |
|--------------|------|
| 마우스 휠 | 줌 인/아웃 (X축 시간 범위) |
| 우클릭 드래그 | 패닝 (좌우 이동) |
| 마우스 오버 | 크로스헤어 + OHLCV 툴팁 표시 |
| 진입가 라인 드래그 | 해당 없음 (표시 전용) |

---

## 화면 4: 자동매매 설정 (AutoTradeScreen)

### 레이아웃

```
AutoTradeScreen (QWidget, QScrollArea 래핑)
│
├── ProductSelector (상단 카드)
│   ├── Header: "상품 선택" (font_size: lg, bold)
│   └── ProductCards (HBox, 3개 카드 동등 분할)
│       ├── StableCard (Card, 선택 시 border: stable 색상)
│       │   ├── 뱃지: "안정형" (bg: stable)
│       │   ├── Target: "월 5~7%"
│       │   ├── Symbols: "BTC / ETH"
│       │   ├── Leverage: "3~5배"
│       │   ├── Risk: ★☆☆ (낮음)
│       │   └── Description: "큰 자금, 안정 추구 투자자"
│       ├── BalancedCard (Card, 선택 시 border: balanced 색상)
│       │   ├── 뱃지: "균형형" + "인기" 뱃지 (warning)
│       │   ├── Target: "월 10~15%"
│       │   ├── Symbols: "BTC/ETH + 알트"
│       │   ├── Leverage: "5~7배"
│       │   ├── Risk: ★★☆ (중간)
│       │   └── Description: "안정과 수익의 균형"
│       └── AggressiveCard (Card, 선택 시 border: aggressive 색상)
│           ├── 뱃지: "수익형"
│           ├── Target: "일 1~3%"
│           ├── Symbols: "고거래량 알트"
│           ├── Leverage: "7~15배"
│           ├── Risk: ★★★ (높음)
│           └── RiskWarning: "⚠ 원금 손실 가능" (warning)
│
├── RiskSettings (Card)
│   ├── Header: "리스크 관리 설정"
│   ├── CapitalSection
│   │   ├── QLabel: "운용 자금 ($)"
│   │   ├── QDoubleSpinBox: 최소 100, 최대 계좌잔고
│   │   └── QLabel: "전체 잔고의 XX%" (실시간 계산)
│   ├── StopLossSection
│   │   ├── QLabel: "손절 비율 (%)"
│   │   ├── QSlider (1~10%) + QDoubleSpinBox (연동)
│   │   └── QLabel: "예시: $500 운용 시 손절 $XX"
│   ├── TakeProfitSection
│   │   ├── QLabel: "익절 비율 (%)"
│   │   └── QSlider (1~30%) + QDoubleSpinBox (연동)
│   ├── MaxDailyLossSection
│   │   ├── QLabel: "일일 최대 손실 한도 ($)"
│   │   └── QDoubleSpinBox
│   └── CooldownSection
│       ├── QLabel: "연속 손실 후 쿨다운"
│       ├── QSpinBox: "연속 X회 손실 시" (기본 3회)
│       └── QSpinBox: "쿨다운 X분" (기본 30분)
│
├── ScheduleSettings (Card)
│   ├── Header: "운영 시간 설정"
│   ├── QCheckBox: "24시간 운영"
│   └── TimeRange (24시간 미선택 시 활성화)
│       ├── QTimeEdit: 시작 시간
│       └── QTimeEdit: 종료 시간
│
└── ActionSection (하단 고정 바, 높이 72px)
    ├── StatusInfo: "현재: 매매 중지 상태"
    ├── QPushButton "자동매매 시작" (btn_success, 너비 200px, 높이 48px)
    │   → 실행 중일 때: "자동매매 중지" (btn_danger)
    └── QPushButton "설정 저장" (secondary)
```

### 상품 선택 카드 인터랙션

```python
# 선택 상태 시각 피드백
CARD_SELECTED = {
    "border": "2px solid <product_color>",
    "background": "<product_color>11",  # 5% 투명도
}
CARD_UNSELECTED = {
    "border": "1px solid #2A2A2A",
    "background": "#1C1C1C",
}
```

---

## 화면 5: 커스텀 전략 (CustomStrategyScreen)

> **무료 사용자도 접근 가능** (자동 모드는 유료 전용)

### 레이아웃

```
CustomStrategyScreen (QWidget)
│
├── StrategyHeader (HBox)
│   ├── QLabel: "커스텀 전략 설정" (font_size: xl, bold)
│   └── SavedStrategies: QComboBox "저장된 전략 불러오기"
│
├── MainContent (QSplitter, 수평)
│   │
│   ├── LeftPanel (너비 55%, VBox)
│   │   ├── EntryConditions (Card)
│   │   │   ├── Header: "진입 조건"
│   │   │   ├── DirectionRow
│   │   │   │   ├── QLabel: "방향"
│   │   │   │   └── QButtonGroup: [롱 전용 | 숏 전용 | 양방향]
│   │   │   ├── IndicatorConditions (QListWidget + 추가 버튼)
│   │   │   │   각 조건 행: [지표 선택] [연산자] [값] [삭제 버튼]
│   │   │   │   지표 목록: RSI, MACD, 볼린저밴드, EMA, SMA, 거래량
│   │   │   │   연산자: > | < | >= | <= | 크로스업 | 크로스다운
│   │   │   └── QPushButton "+ 조건 추가"
│   │   │
│   │   ├── ExitConditions (Card)
│   │   │   ├── Header: "청산 조건"
│   │   │   └── (진입 조건과 동일 구조)
│   │   │
│   │   └── PositionSettings (Card)
│   │       ├── Header: "포지션 설정"
│   │       ├── SymbolRow
│   │       │   ├── QLabel: "거래 심볼"
│   │       │   └── QComboBox (다중 선택 가능)
│   │       ├── LeverageRow
│   │       │   ├── QLabel: "레버리지"
│   │       │   └── QSlider (1x~20x) + QSpinBox (연동)
│   │       ├── PositionSizeRow
│   │       │   ├── QLabel: "포지션 크기 (%)"
│   │       │   └── QDoubleSpinBox (1~100%)
│   │       ├── StopLossRow (QDoubleSpinBox %)
│   │       ├── TakeProfitRow (QDoubleSpinBox %)
│   │       └── OrderTypeRow
│   │           └── QButtonGroup: [메이커(지정가) | 테이커(시장가)]
│   │               → 메이커 기본값 (수수료 절감)
│   │
│   └── RightPanel (너비 45%, VBox)
│       ├── BacktestSection (Card)
│       │   ├── Header: "백테스트" + QComboBox 기간 선택
│       │   │   기간: 1주 | 1개월 | 3개월 | 6개월
│       │   ├── QPushButton "백테스트 실행" (btn_primary)
│       │   └── BacktestResults (초기에는 빈 상태)
│       │       ├── 수익률: +XX%
│       │       ├── 거래 수: XX회
│       │       ├── 승률: XX%
│       │       ├── 최대 낙폭: -XX%
│       │       ├── 샤프 비율: X.XX
│       │       └── EquityCurve: pyqtgraph 라인 차트
│       │
│       └── StrategyNotes (Card)
│           ├── Header: "전략 메모"
│           └── QTextEdit (다크 스타일, placeholder: "전략 설명 입력...")
│
└── Footer (HBox)
    ├── QPushButton "전략 저장" (btn_primary)
    ├── QPushButton "전략 실행" (btn_success)
    └── QPushButton "초기화" (danger, outline)
```

---

## 화면 6: 거래 내역 (TradeHistoryScreen)

### 레이아웃

```
TradeHistoryScreen (QWidget)
│
├── FilterBar (높이 56px, HBox)
│   ├── DateRangePicker
│   │   ├── QDateEdit: 시작일
│   │   ├── QLabel: "~"
│   │   └── QDateEdit: 종료일
│   ├── SymbolFilter: QComboBox "전체 심볼"
│   ├── DirectionFilter: QComboBox "전체 방향"
│   ├── QPushButton "조회" (btn_primary)
│   └── QPushButton "CSV 내보내기" (secondary, 아이콘 포함)
│
├── SummaryBar (높이 80px, HBox, 5개 통계 카드)
│   ├── TotalTrades: "총 거래 수 | 348회"
│   ├── WinRate: "승률 | 62.1%"
│   ├── TotalPnl: "총 수익 | +$3,421.50" (positive)
│   ├── AvgPnl: "평균 수익 | +$9.83"
│   └── TotalFee: "총 수수료 | $124.50" (warning)
│
├── TradeTable (QTableWidget, 나머지 높이)
│   컬럼 (너비 비율):
│   - 거래ID (8%) — 클릭 시 바이비트 링크 오픈
│   - 시간 (12%) — "2026-03-26 14:23:05"
│   - 심볼 (8%) — "BTC/USDT"
│   - 방향 (7%) — LONG/SHORT 색상 뱃지
│   - 레버리지 (6%) — "5x"
│   - 진입가 (10%) — "$94,100.00" (mono)
│   - 청산가 (10%) — "$95,500.00" (mono)
│   - 수량 (8%) — "0.05 BTC"
│   - 수익 (10%) — "+$70.00" (positive/negative)
│   - 수익률 (8%) — "+1.49%"
│   - 수수료 (7%) — "$1.04"
│   - 순수익 (6%) — "+$68.96" (positive/negative)
│   행 높이: 40px
│   정렬: 시간 내림차순 기본
│   페이지네이션: 50행씩, QLabel + QPrev/QNext 버튼
│
└── PnlChart (높이 200px, pyqtgraph)
    → 일별 수익 바 차트 (조회 기간 기준)
    → 수익 합산 라인 오버레이 (우축)
```

### 행 색상 규칙

```python
ROW_PROFIT  = "#00C48C08"   # 수익 행: 아주 연한 그린 배경
ROW_LOSS    = "#FF475708"   # 손실 행: 아주 연한 레드 배경
ROW_HOVER   = "#242424"     # 호버
ROW_SELECTED= "#2A2A2A"     # 선택
```

---

## 화면 7: 설정 (SettingsScreen)

### 레이아웃

```
SettingsScreen (QWidget)
│
├── SettingsNav (좌측, 너비 200px)
│   → QListWidget (탭 역할)
│   항목: API 설정 | 알림 설정 | 일반 설정 | 계정 정보 | 라이선스
│
└── SettingsContent (우측, QStackedWidget)
    │
    ├── ApiSettings (Panel)
    │   ├── Header: "API 설정"
    │   ├── CurrentApiKey: "현재 API Key: ****XXXX"
    │   ├── QLineEdit: 새 API Key
    │   ├── QLineEdit: 새 API Secret (password)
    │   ├── QPushButton "연결 테스트" + StatusDot
    │   ├── QPushButton "API 키 변경"
    │   └── Warning: "⚠ API 키는 로컬에 암호화 저장됩니다. 서버로 전송되지 않습니다."
    │
    ├── NotificationSettings (Panel)
    │   ├── Header: "텔레그램 알림 설정"
    │   ├── TelegramBotSection
    │   │   ├── QLineEdit: 텔레그램 챗 ID
    │   │   └── QPushButton "테스트 메시지 전송"
    │   ├── NotificationToggles (QGroupBox)
    │   │   ├── QCheckBox "포지션 진입 알림"
    │   │   ├── QCheckBox "포지션 청산 알림"
    │   │   ├── QCheckBox "수익/손실 알림"
    │   │   ├── QCheckBox "쿨다운 발동 알림"
    │   │   ├── QCheckBox "비상정지 알림"
    │   │   └── QCheckBox "일일 리포트" (유료 전용 뱃지)
    │   └── ReportTime: QTimeEdit "일일 리포트 시간"
    │
    ├── GeneralSettings (Panel)
    │   ├── Header: "일반 설정"
    │   ├── ThemeSection (현재 다크 고정, 향후 확장)
    │   ├── LanguageSection: QComboBox (한국어 고정)
    │   ├── AutoStartSection: QCheckBox "윈도우 시작 시 자동 실행"
    │   ├── MinimizeSection: QCheckBox "닫기 시 트레이로 최소화"
    │   └── LogSection
    │       ├── QLabel: "로그 레벨" + QComboBox (DEBUG/INFO/WARNING)
    │       └── QPushButton "로그 파일 열기"
    │
    ├── AccountInfo (Panel)
    │   ├── Header: "계정 정보"
    │   ├── BybitInfo (읽기 전용 카드)
    │   │   ├── UID: "12345678"
    │   │   ├── 계정 유형: "통합 마진"
    │   │   ├── 가용 잔고: "$12,450.23"
    │   │   └── 레퍼럴 상태: ✓ 연결됨 / ✗ 미연결 (warning)
    │   └── SubscriptionInfo (Card)
    │       ├── 현재 등급: "무료" / "유료 구독 중"
    │       ├── 만료일: "2026-04-26" (유료인 경우)
    │       └── QPushButton "구독 관리" (btn_primary)
    │
    └── LicenseInfo (Panel)
        ├── Header: "라이선스"
        ├── LicenseKey: "XXXX-XXXX-XXXX-XXXX" (읽기 전용)
        ├── Status: "활성화됨" (positive)
        └── Info: 버전, 빌드 날짜, 지원 이메일
```

---

## 화면 8: 비상정지 (EmergencyStopScreen / Overlay)

> **트리거**: 좌측 Nav 하단 고정 버튼 또는 단축키 `Ctrl+Shift+E`

### 구현 방식

```python
# QDialog로 구현 (모달, 최상위)
class EmergencyStopDialog(QDialog):
    # 배경 반투명 오버레이 (#000000CC)
    # 중앙 경고 패널
    pass
```

### 레이아웃

```
EmergencyStopDialog (QDialog, 모달)
배경: rgba(0, 0, 0, 0.8), 전체 화면 덮음
│
└── WarningPanel (중앙, 너비 480px, 다크 레드 테마)
    배경: #1A0505, 테두리: 2px solid #FF1744
    border-radius: 12px
    │
    ├── WarningIcon: ⚠ (크기 64px, warning 색상)
    ├── Title: "비상 정지" (font_size: 2xl, bold, negative)
    ├── Subtitle: "모든 포지션이 즉시 시장가로 청산됩니다" (text_secondary)
    │
    ├── CurrentPositions (Card, bg: #220000)
    │   ├── Header: "청산 예정 포지션"
    │   └── PositionList (QListWidget, 최대 5개 표시)
    │       각 항목: "BTC/USDT LONG x5 | $94,100 → 현재가 | +$234.50"
    │
    ├── EstimatedInfo (HBox)
    │   ├── "예상 청산 비용 (수수료)": "$12.50"
    │   └── "예상 최종 잔고": "$12,437.73"
    │
    ├── ConfirmInput (강제 확인)
    │   ├── QLabel: "'비상정지' 를 입력하세요"
    │   └── QLineEdit: placeholder="비상정지" (빨간 테두리)
    │
    └── ActionButtons (HBox)
        ├── QPushButton "취소" (secondary, 너비 45%)
        └── QPushButton "전체 청산 실행" (btn_stop, 너비 55%, 비활성화)
            → 확인 텍스트 일치 시 활성화
            → 클릭 시: 확인 다이얼로그 한 번 더 표시
```

### 비상정지 실행 흐름

```
사용자: "비상정지" 입력 → "전체 청산 실행" 버튼 활성화
→ 버튼 클릭
→ "정말 모든 포지션을 청산하시겠습니까?" QMessageBox (Yes/No)
→ Yes 선택
→ 진행 상태 표시 (QProgressDialog)
   "BTC/USDT 청산 중..." → 완료
   "ETH/USDT 청산 중..." → 완료
→ 완료 시 성공 메시지 + 텔레그램 알림 전송
→ 자동매매 엔진 중지
→ 다이얼로그 닫기
```

### 키보드 단축키 등록

```python
QShortcut(QKeySequence("Ctrl+Shift+E"), main_window, emergency_stop_dialog.show)
# ESC: 취소 (실행 전에만)
# 실행 중 ESC: 무시 (청산 취소 불가)
```

---

## 좌측 네비게이션 바 (LeftNav)

```
LeftNav (QWidget, 너비 60px, bg_secondary)
│
├── NavItem: 🏠 대시보드    → DashboardScreen
├── NavItem: 📈 차트         → ChartScreen
├── NavItem: 🤖 자동매매     → AutoTradeScreen
├── NavItem: ⚙ 커스텀전략   → CustomStrategyScreen
├── NavItem: 📋 거래내역     → TradeHistoryScreen
├── NavItem: 🔔 알림         → NotificationPanel (우측 슬라이드)
├── Spacer
├── NavItem: ⚙ 설정          → SettingsScreen
└── NavItem: 🚨 비상정지     → EmergencyStopDialog (항상 맨 아래, btn_stop 색상)
```

### NavItem 스타일

```python
# 기본 상태
NAV_NORMAL = {
    "background": "transparent",
    "icon_color": "#555555",
    "indicator": "none",  # 좌측 3px 선
}
# 활성 상태
NAV_ACTIVE = {
    "background": "#1C1C1C",
    "icon_color": "#5B7FFF",
    "indicator": "3px solid #5B7FFF",
}
# 비상정지 버튼
NAV_EMERGENCY = {
    "icon_color": "#FF1744",
    "pulse_animation": True,  # 매매 중일 때 깜빡임
}
```

---

## 시스템 트레이 (SystemTray)

```python
# 트레이 아이콘 상태
TRAY_RUNNING  = "icon_green.png"   # 매매 실행 중
TRAY_STOPPED  = "icon_gray.png"    # 중지
TRAY_ERROR    = "icon_red.png"     # 에러

# 트레이 우클릭 메뉴
tray_menu = [
    "대시보드 열기",
    "---",
    "자동매매 시작/중지",
    "비상정지",
    "---",
    "종료",
]

# 더블클릭: 창 복원
```

---

## 상태 알림 컴포넌트 (Toast Notification)

```python
# QLabel 기반 애니메이션 토스트
# 우측 하단 위치, 슬라이드인/아웃 애니메이션
# 자동 사라짐: 3~5초

TOAST_TYPES = {
    "success": {"icon": "✓", "color": "#00C48C", "bg": "#00C48C22"},
    "error":   {"icon": "✕", "color": "#FF4757", "bg": "#FF475722"},
    "warning": {"icon": "⚠", "color": "#FFB800", "bg": "#FFB80022"},
    "info":    {"icon": "ℹ", "color": "#5B7FFF", "bg": "#5B7FFF22"},
}
```

---

## PyQt6 구현 구조 (파일 레이아웃)

```
coin-bot/
├── ui/
│   ├── __init__.py
│   ├── main_window.py          # QMainWindow + LeftNav + TitleBar
│   ├── screens/
│   │   ├── login_screen.py
│   │   ├── dashboard_screen.py
│   │   ├── chart_screen.py
│   │   ├── auto_trade_screen.py
│   │   ├── custom_strategy_screen.py
│   │   ├── trade_history_screen.py
│   │   └── settings_screen.py
│   ├── dialogs/
│   │   └── emergency_stop_dialog.py
│   ├── components/
│   │   ├── nav_item.py
│   │   ├── position_table.py
│   │   ├── trade_table.py
│   │   ├── pnl_card.py
│   │   ├── product_card.py
│   │   └── toast_notification.py
│   ├── charts/
│   │   ├── candlestick_chart.py  # pyqtgraph 기반
│   │   └── volume_chart.py
│   └── styles/
│       ├── colors.py
│       ├── fonts.py
│       └── stylesheets.py       # QSS 통합 관리
└── ...
```

---

## 의존성 패키지

```
PyQt6>=6.6.0
pyqtgraph>=0.13.4    # 차트 렌더링
keyring>=24.0.0      # API 키 암호화 저장 (DPAPI)
cryptography>=42.0.0 # Fernet 추가 암호화
```

---

*작성: Planner Agent | 2026-03-26*
