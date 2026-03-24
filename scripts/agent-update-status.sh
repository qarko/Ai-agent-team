#!/bin/bash
# 에이전트 상태 업데이트
# Usage: agent-update-status.sh <agent_name> <status> [current_task]
# status: idle, working, error, stopped

AGENT=$1
STATUS=$2
CURRENT_TASK=${3:-null}
STATE_FILE="/home/claude/shared/state.json"
LOG_FILE="/home/claude/shared/logs/${AGENT}.log"

if [ -z "$AGENT" ] || [ -z "$STATUS" ]; then
    echo "Usage: $0 <agent_name> <status> [current_task]"
    exit 1
fi

TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# state.json 업데이트
tmp=$(mktemp)
if [ "$CURRENT_TASK" = "null" ]; then
    jq --arg a "$AGENT" --arg s "$STATUS" --arg ts "$TS" \
       '.agents[$a].status = $s | .agents[$a].last_updated = $ts | .agents[$a].current_task = null' \
       "$STATE_FILE" > "$tmp" && mv "$tmp" "$STATE_FILE"
else
    jq --arg a "$AGENT" --arg s "$STATUS" --arg ts "$TS" --arg task "$CURRENT_TASK" \
       '.agents[$a].status = $s | .agents[$a].last_updated = $ts | .agents[$a].current_task = $task' \
       "$STATE_FILE" > "$tmp" && mv "$tmp" "$STATE_FILE"
fi

# 로그 기록
echo "[$TS] [$AGENT] status=$STATUS task=$CURRENT_TASK" >> "$LOG_FILE"
