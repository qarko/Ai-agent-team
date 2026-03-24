#!/bin/bash
# 에이전트 상태 확인

PROJECT_DIR="/home/claude"
STATE_FILE="$PROJECT_DIR/shared/state.json"

echo "=== AI Agent Team 상태 ==="
echo ""

printf "%-12s %-10s %-12s %s\n" "에이전트" "상태" "tmux" "현재 작업"
printf "%-12s %-10s %-12s %s\n" "--------" "------" "--------" "--------"

AGENTS=("manager" "planner" "backend" "frontend" "reviewer" "tester")

for agent in "${AGENTS[@]}"; do
    SESSION_NAME="agent-$agent"

    # tmux 세션 확인
    if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
        tmux_status="active"
    else
        tmux_status="inactive"
    fi

    # state.json에서 상태 읽기
    agent_status=$(jq -r --arg a "$agent" '.agents[$a].status // "unknown"' "$STATE_FILE" 2>/dev/null)
    current_task=$(jq -r --arg a "$agent" '.agents[$a].current_task // "-"' "$STATE_FILE" 2>/dev/null)

    printf "%-12s %-10s %-12s %s\n" "$agent" "$agent_status" "$tmux_status" "$current_task"
done

echo ""
echo "=== 작업 큐 ==="
task_count=$(jq '.tasks | length' "$PROJECT_DIR/shared/tasks.json" 2>/dev/null || echo 0)
echo "대기 중인 작업: $task_count개"

if [ "$task_count" -gt 0 ]; then
    echo ""
    jq -r '.tasks[] | "  [\(.status)] \(.title) → \(.assigned_to // "미배정")"' "$PROJECT_DIR/shared/tasks.json" 2>/dev/null
fi
