#!/bin/bash
# 작업 상태 업데이트
# Usage: task-update.sh <task_id> <status>
# status: pending, in_progress, completed, failed

TASK_ID=$1
STATUS=$2
TASKS_FILE="/home/claude/shared/tasks.json"

if [ -z "$TASK_ID" ] || [ -z "$STATUS" ]; then
    echo "Usage: $0 <task_id> <status>"
    exit 1
fi

TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

tmp=$(mktemp)
jq --argjson id "$TASK_ID" --arg status "$STATUS" --arg ts "$TS" \
   '(.tasks[] | select(.id == $id)) |= (.status = $status | .updated_at = $ts)' \
   "$TASKS_FILE" > "$tmp" && mv "$tmp" "$TASKS_FILE"

echo "Task #$TASK_ID updated: $STATUS"
