#!/bin/bash
# 모든 에이전트 tmux 세션 시작
# Usage: start-all.sh [agent_name]  — 특정 에이전트만 시작 가능

REQUESTED=${1:-"all"}
ALL_AGENTS=("manager" "planner" "backend" "frontend" "reviewer" "tester")
PROJECT_DIR="/home/claude"
AGENTS_DIR="$PROJECT_DIR/agents"
STATE_FILE="$PROJECT_DIR/shared/state.json"

# 에이전트별 모델 배정
# - Opus 4.6: 복잡한 판단이 필요한 핵심 역할
# - Sonnet 4.6: 코드 생성/분석에 강한 범용 역할
# - Haiku 4.5: 정형화된 반복 작업
declare -A AGENT_MODELS
AGENT_MODELS=(
    ["manager"]="claude-sonnet-4-6"      # 조율/분배 — Sonnet이면 충분
    ["planner"]="claude-sonnet-4-6"      # 명세 작성 — Sonnet 분석력 활용
    ["backend"]="claude-sonnet-4-6"      # 코드 생성 — Sonnet 코딩 성능 우수
    ["frontend"]="claude-sonnet-4-6"     # UI 코드 — Sonnet 코딩 성능 우수
    ["reviewer"]="claude-opus-4-6"       # 코드 리뷰 — 깊은 분석 필요, 품질 게이트
    ["tester"]="claude-haiku-4-5"        # 테스트 작성 — 정형화된 패턴, 빠른 실행
)

if [ "$REQUESTED" = "all" ]; then
    AGENTS=("${ALL_AGENTS[@]}")
else
    AGENTS=("$REQUESTED")
fi

echo "=== AI Agent Team 시작 ==="

for agent in "${AGENTS[@]}"; do
    SESSION_NAME="agent-$agent"
    AGENT_DIR="$AGENTS_DIR/$agent"
    MODEL="${AGENT_MODELS[$agent]}"

    if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
        echo "[$agent] 이미 실행 중: $SESSION_NAME"
        continue
    fi

    # 에이전트 디렉토리에서 tmux 세션 시작 (CLAUDE.md 자동 인식)
    tmux new-session -d -s "$SESSION_NAME" -c "$AGENT_DIR"

    # 세션에서 Claude Code 실행 (에이전트별 모델 지정)
    tmux send-keys -t "$SESSION_NAME" "cd $AGENT_DIR && claude --model $MODEL --dangerously-skip-permissions" Enter

    echo "[$agent] 시작: $SESSION_NAME (model: $MODEL)"

    # 상태 업데이트
    tmp=$(mktemp)
    jq --arg agent "$agent" \
       --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
       --arg model "$MODEL" \
       '.agents[$agent].status = "idle" | .agents[$agent].last_updated = $ts | .agents[$agent].model = $model' \
       "$STATE_FILE" > "$tmp" && mv "$tmp" "$STATE_FILE"
done

echo ""
echo "=== 모델 배정 ==="
for agent in "${ALL_AGENTS[@]}"; do
    printf "  %-12s → %s\n" "$agent" "${AGENT_MODELS[$agent]}"
done

echo ""
echo "=== 세션 목록 ==="
tmux list-sessions 2>/dev/null | grep "^agent-" || echo "(실행 중인 에이전트 세션 없음)"
echo ""
echo "세션 접속: tmux attach -t agent-<이름>"
