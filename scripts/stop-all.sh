#!/bin/bash
# 모든 에이전트 tmux 세션 중지
# Usage: stop-all.sh [agent_name]  — 특정 에이전트만 중지 가능

REQUESTED=${1:-"all"}
ALL_AGENTS=("manager" "planner" "backend" "frontend" "reviewer" "tester")
PROJECT_DIR="/home/claude"
STATE_FILE="$PROJECT_DIR/shared/state.json"

if [ "$REQUESTED" = "all" ]; then
    AGENTS=("${ALL_AGENTS[@]}")
else
    AGENTS=("$REQUESTED")
fi

echo "=== AI Agent Team 중지 ==="

for agent in "${AGENTS[@]}"; do
    SESSION_NAME="agent-$agent"

    if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
        # Claude Code에 /exit 전송 후 세션 종료
        tmux send-keys -t "$SESSION_NAME" "/exit" Enter
        sleep 1
        tmux kill-session -t "$SESSION_NAME" 2>/dev/null
        echo "[$agent] 세션 종료: $SESSION_NAME"

        # 상태 업데이트
        tmp=$(mktemp)
        jq --arg agent "$agent" \
           --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
           '.agents[$agent].status = "stopped" | .agents[$agent].last_updated = $ts | .agents[$agent].current_task = null' \
           "$STATE_FILE" > "$tmp" && mv "$tmp" "$STATE_FILE"
    else
        echo "[$agent] 실행 중이 아님"
    fi
done

echo ""
echo "=== 중지 완료 ==="
