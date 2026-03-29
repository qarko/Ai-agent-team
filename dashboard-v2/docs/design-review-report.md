# Design Review Report — Dashboard v2 Frontend

**대상:** `/home/claude/dashboard-v2/frontend/src/`
**검토일:** 2026-03-28
**분류:** APP UI (워크스페이스 기반, 데이터 밀도 높음, 작업 중심)
**검토자:** Frontend Agent (design-review)

---

## 종합 평가

| 항목 | 점수 | 메모 |
|------|------|------|
| 다크 테마 일관성 | **A** | 색상 계층 명확, color-scheme 설정 |
| 모바일 반응형 | **B** | 구조는 좋으나 safe area·모달 처리 개선 필요 |
| 터치 영역 | **C** | 일부 인터랙티브 요소 44px 미달 |
| 접근성 (A11y) | **D** | ARIA 부재, 키보드 내비게이션 미흡 |
| 타이포그래피 | **B** | 체계적이나 font stack이 generic |
| 인터랙션 상태 | **B** | hover/loading 처리 양호, focus-visible 누락 |
| 빈 상태 처리 | **A** | 모든 빈 상태에 메시지 + 아이콘 |
| **종합** | **B−** | 기능적으로 탄탄, 접근성 보완 필요 |

---

## First Impression

이 대시보드는 **전문 도구**로 읽힌다. 거래소 스타일의 다크 테마, 에이전트별 컬러 코딩, 컴팩트한 정보 밀도가 일관성 있게 구성되어 있다. Slate 색상 계층(`#0F172A → #1E293B → #334155`)이 깊이감을 준다.

처음 눈에 들어오는 것: (1) 상단 헤더의 AI 로고 뱃지, (2) 통계 카드 4개, (3) 에이전트 상태 목록. 이 순서는 의도적이고 올바르다.

한 단어로: **functional** — 좋은 의미에서.

---

## 1. 다크 테마 일관성 — A

### 잘 된 점
- `color-scheme: dark` 선언 (`index.css:5`) — 브라우저 기본 UI(스크롤바, 폼 컨트롤)도 다크로
- 텍스트 계층 일관: `#F1F5F9` > `#CBD5E1` > `#94A3B8` > `#64748B` > `#475569` — Tailwind Slate 팔레트 정석적 사용
- 다크 모드 텍스트가 순수 흰색(`#FFFFFF`)이 아닌 `#F1F5F9` — 눈부심 방지, 올바른 선택
- 배경 3계층: `#0F172A`(앱 배경) → `#1E293B`(카드) → `#334155`(경계/입력) — 명확한 elevation
- 액센트 색상 `#6366F1`(Indigo-500) 전역 일관 사용

### 개선점
- `App.css`에 `var(--accent)`, `var(--accent-bg)` 등 CSS 변수 참조가 있으나 어디에도 정의되지 않음 (`App.css:6,7,15`). Vite scaffold 잔재로 보임 — 파일을 정리하거나 변수를 정의해야 함
- 색상이 모두 하드코딩됨. CSS 변수 시스템 없음. 테마 변경 시 전체 파일 수정 필요

---

## 2. 모바일 반응형 — B

### 잘 된 점
- 모바일 하단 탭바 / 데스크톱 상단 탭 분리 (`App.jsx:103, 200`) — 각 폼팩터에 맞는 네비게이션 패턴
- `pb-16 md:pb-0` — 하단 탭바 공간 확보 정확
- `overflow-x: hidden` 전역 처리 (`index.css:15`)
- 그리드 패턴: `grid-cols-2 sm:grid-cols-4`, `grid-cols-1 sm:grid-cols-2` — 올바른 모바일 우선 접근
- `MessageBubble`: `maxWidth: 'min(95%, 520px)'` — 반응형 말풍선 처리 우수

### 문제점

**FINDING-001 [Medium] — CommandModal 모바일 넘침**
`CommandModal.jsx:47` — `w-[480px]` 고정 너비. 375px 화면에서 가로 스크롤 발생.

```jsx
// 현재
<div className="w-[480px] rounded-xl border" ...>

// 권장
<div className="w-full max-w-[480px] mx-4 sm:mx-0 rounded-xl border" ...>
```

**FINDING-002 [Medium] — iOS Safe Area 미반영**
`ChatView.jsx:22`, `LogViewer.jsx:64` — `height: 'calc(100vh - 60px)'` 사용. iPhone 노치/홈 인디케이터 영역이 콘텐츠와 겹침.

```jsx
// 권장
height: 'calc(100svh - 60px)'  // svh = small viewport height, 키보드 고려

// 하단 탭바도
paddingBottom: 'calc(6px + env(safe-area-inset-bottom))'
```

**FINDING-003 [Polish] — 채팅 입력창 모바일 키보드 처리**
`ChatInput.jsx:64` — `type="text"` 입력창이 포커스되면 모바일 키보드가 올라오면서 ChatView 레이아웃 재계산. `height: calc(100vh - 60px)`와 조합 시 메시지 영역이 키보드 아래로 밀릴 수 있음.

---

## 3. 터치 영역 — C

**기준: 최소 44×44px (Apple HIG / WCAG 2.5.5)**

| 컴포넌트 | 위치 | 예상 높이 | 상태 |
|---------|------|----------|------|
| 하단 탭바 버튼 | `App.jsx:213` | 56px (`minHeight: 56`) | ✅ |
| 에이전트 명령 버튼 | `AgentCard.jsx:159` | 44px (`minHeight: 44`) | ✅ |
| LogViewer 에이전트 탭 | `LogViewer.jsx:75` | 44px (`minHeight: 44`) | ✅ |
| ChannelList 채널 버튼 | `ChannelList.jsx:20` | ~32px (`py-1.5`) | ❌ |
| CommandModal 취소/전송 | `CommandModal.jsx:84,91` | ~32px (`py-1.5`) | ❌ |
| Overview "전체 보기" | `Overview.jsx:62` | ~28px (`py-1.5`) | ❌ |
| 상단 탭 버튼 (데스크톱) | `App.jsx:110` | ~32px (`py-1.5`) | ⚠️ 데스크톱 전용 |

**FINDING-004 [High] — ChannelList 채널 탭 터치 영역 부족**
채팅 탭에서 가장 자주 사용하는 컨트롤인데 `py-1.5` (~32px)로 44px 미달.

```jsx
// 현재
className="... px-3 py-1.5 rounded-lg ..."

// 권장
className="... px-3 py-2.5 rounded-lg ..."  // 또는 minHeight: 44 추가
```

**FINDING-005 [High] — CommandModal 버튼 터치 영역 부족**
모달의 취소/전송 버튼이 `py-1.5`로 44px 미달. 모바일에서 오조작 가능성 높음.

```jsx
// 현재
className="px-4 py-1.5 rounded-lg text-sm"

// 권장
className="px-4 py-2.5 rounded-lg text-sm" // minHeight: 44 명시 권장
```

---

## 4. 접근성 (A11y) — D

이 부분이 가장 취약한 영역. 기능은 동작하지만 스크린리더 사용자나 키보드 사용자는 대부분의 기능에 접근하기 어렵다.

### FINDING-006 [High] — 모달 ARIA 미구현

`CommandModal.jsx:47` — `role="dialog"`, `aria-modal="true"`, `aria-labelledby` 없음. 스크린리더가 모달을 인식하지 못함.

```jsx
// 권장
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  className="w-[480px] ..."
>
  <span id="modal-title" ...>{meta?.emoji} {agent} 에게 명령 전송</span>
```

닫기 버튼 `✕`도 aria-label 필요:
```jsx
<button onClick={onClose} aria-label="모달 닫기" ...>✕</button>
```

### FINDING-007 [High] — TaskCard 키보드 접근 불가

`TaskCard.jsx:24-33` — 클릭 가능한 `<div>`에 `tabIndex`, `onKeyDown`, `role` 없음. 키보드 사용자는 작업 카드를 열 수 없음.

```jsx
// 현재
<div
  className="rounded-xl border cursor-pointer ..."
  onClick={() => setExpanded(v => !v)}
>

// 권장
<div
  className="rounded-xl border cursor-pointer ..."
  role="button"
  tabIndex={0}
  onClick={() => setExpanded(v => !v)}
  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setExpanded(v => !v) }}
  aria-expanded={expanded}
>
```

### FINDING-008 [High] — 상태 표시가 색상만으로 구분

`AgentCard.jsx:42-49` (컴팩트 뷰) — 에이전트 상태를 색상 dot으로만 표시. 색맹 사용자에게 상태 구분 불가.

```jsx
// 현재
<span className="w-2 h-2 rounded-full" style={{ background: statusCfg.color }} />

// 권장
<span
  className="w-2 h-2 rounded-full"
  style={{ background: statusCfg.color }}
  role="img"
  aria-label={`상태: ${statusCfg.label}`}
/>
```

### FINDING-009 [Medium] — 폼 입력 요소에 label 없음

`ChatInput.jsx:47,64` — `<select>`와 `<input>`에 `<label>` 또는 `aria-label` 없음.

```jsx
// select
<select aria-label="메시지 수신 에이전트 선택" ...>

// input
<input aria-label="메시지 입력" ...>
```

### FINDING-010 [Medium] — focus-visible 스타일 전역 미적용

`App.css:14-17`에서 `.counter`에만 `focus-visible` 있음. 실제 앱 버튼/링크에는 포커스 링 없음. 키보드 탭 내비게이션 시 현재 위치 파악 불가.

`index.css`에 전역 추가:
```css
:focus-visible {
  outline: 2px solid #6366F1;
  outline-offset: 2px;
  border-radius: 4px;
}
```

### FINDING-011 [Medium] — 이모지에 aria-hidden 없음

탭 레이블, 에이전트 이름 옆 이모지 등이 스크린리더에서 읽힘. "📊 개요 tab" 같은 식으로 중복 읽기 발생.

```jsx
// 권장
<span aria-hidden="true">{tab.icon}</span>
{tab.label}
```

### FINDING-012 [Medium] — 네비게이션 요소에 aria-current 없음

`App.jsx:107-129` — 활성 탭에 `aria-current="page"` 또는 `aria-selected="true"` 없음.

```jsx
<button
  aria-current={isActive ? 'page' : undefined}
  ...
>
```

---

## 5. 타이포그래피 — B

- 폰트: `system-ui, -apple-system, 'Segoe UI', sans-serif` — 기능적이나 generic. 대시보드 특성상 크게 문제는 아님
- 기본 크기: `14px` (데스크톱), `15px` (모바일, `@media max-width: 640px`) — 적절
- `line-height: 1.6` — 본문 텍스트 적합
- 폰트 패밀리 수: 1개 (일관성 우수)
- `font-mono` 사용처: 태스크 ID, 로그 뷰어 — 의미적으로 올바름

**FINDING-013 [Polish] — 섹션 헤더 letter-spacing 과다**
`Overview.jsx:29,56,78` — 섹션 헤더에 `letterSpacing: '0.05em'` 적용. 0.05em은 소문자에 과도하며 가독성 저하. 0.03em 또는 제거 권장.

---

## 6. 인터랙션 상태 — B

### 잘 된 점
- 로딩: `spinner` 컴포넌트 일관 사용
- 빈 상태: `LogViewer`, `Overview` 모두 메시지 + 아이콘 포함
- 에러 상태: `LogViewer`, `ChatView` 에러 표시 구현
- `working` 상태: `taskGlow` 애니메이션, 녹색 강조 — 시각적 피드백 명확
- 버튼 disabled 상태: opacity/색상 변경 + `cursor: not-allowed`

### 문제점

**FINDING-014 [Medium] — ChatInput 전송 실패 무음 처리**
`ChatInput.jsx:24-28` — `catch {}` 블록이 비어있어 전송 실패 시 사용자에게 아무 피드백 없음. CommandModal과 대조적.

```jsx
// 권장
} catch {
  // onToast prop 추가하거나 로컬 에러 상태로 표시
}
```

**FINDING-015 [Polish] — `prefers-reduced-motion` 미처리**
`index.css:41-66` — `taskGlow`, `agentPulse`, `spin` 애니메이션 모두 동작 감소 미디어 쿼리 무시.

```css
@media (prefers-reduced-motion: reduce) {
  .task-glow, .spinner { animation: none; }
  /* agentPulse도 동일 */
}
```

**FINDING-016 [Polish] — 호버 스타일 JS로 처리**
`AgentCard.jsx:160-168` — `onMouseEnter/onMouseLeave`로 인라인 스타일 변경. CSS hover가 더 안정적이고 선언적.

---

## 7. AI Slop 체크 — 양호

10개 패턴 중 해당 없음. 다크 거래소 스타일이라 일반적인 AI slop 패턴(보라 그라디언트, 3열 feature grid, 중앙 정렬 등)과 거리가 있다.

유일하게 주의할 점: StatCard의 `blur-2xl` 배경 blob(`StatCard.jsx:11-13`). 기능적 의미 없는 장식 요소. 현재는 opacity-10으로 절제되어 있어 통과.

---

## 빠른 수정 목록 (Quick Wins)

우선순위 순. 각각 30분 이내 처리 가능.

| # | 파일 | 수정 내용 | 임팩트 |
|---|------|----------|--------|
| 1 | `index.css` | `:focus-visible` 전역 스타일 추가 | High |
| 2 | `ChannelList.jsx:20` | `py-1.5` → `py-2.5` (터치 영역 확보) | High |
| 3 | `CommandModal.jsx:47` | `w-[480px]` → `w-full max-w-[480px] mx-4 sm:mx-0` | Medium |
| 4 | `CommandModal.jsx:53-59` | 닫기 버튼 `aria-label="모달 닫기"` 추가 | Medium |
| 5 | `TaskCard.jsx:24` | `role="button" tabIndex={0} onKeyDown` 추가 | Medium |
| 6 | `ChatInput.jsx:46,64` | `aria-label` 추가 | Medium |
| 7 | `App.jsx:104-129` | `aria-current={isActive ? 'page' : undefined}` 추가 | Medium |
| 8 | `index.css` | `prefers-reduced-motion` 미디어 쿼리 추가 | Polish |

---

## 심층 수정 목록 (Medium-term)

- **CSS 변수 시스템 도입**: 하드코딩된 색상값을 CSS 변수로 교체 (`--color-bg-base`, `--color-surface`, `--color-border`, `--color-accent` 등)
- **모달 ARIA 완성**: `role="dialog"`, `aria-modal`, `aria-labelledby`, 포커스 트랩 구현
- **iOS safe area**: `env(safe-area-inset-bottom)` ChatView/LogViewer 하단에 적용
- **ChatInput 에러 처리**: 전송 실패 사용자 피드백 추가
- **상태 표시 개선**: 색상 + 텍스트 레이블 조합 (색맹 접근성)

---

## 총평

전반적으로 **잘 설계된 App UI**다. 다크 테마는 일관성이 높고, 모바일 레이아웃 구조도 올바르다. 컴포넌트 분리도 깔끔하다.

주요 약점은 **접근성**. ARIA 속성과 키보드 내비게이션이 거의 없다. 이건 후순위처럼 보이지만 스크린리더 사용자뿐 아니라 파워 유저(키보드 중심 워크플로우)에게도 영향을 미친다.

터치 영역 문제는 `py-1.5` → `py-2.5` 몇 군데 수정으로 빠르게 해결 가능하다.

접근성 Quick Wins 먼저 처리하면 B에서 A−로 올라간다.
