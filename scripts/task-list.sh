#!/bin/bash
# 작업 목록 조회
# Usage: task-list.sh [agent_name] [status]

AGENT=${1:-""}
STATUS=${2:-""}
TASKS_FILE="/home/claude/shared/tasks.json"

echo "=== 작업 목록 ==="

if [ -n "$AGENT" ] && [ -n "$STATUS" ]; then
    jq -r --arg a "$AGENT" --arg s "$STATUS" \
       '.tasks[] | select(.assigned_to == $a and .status == $s) | "#\(.id) [\(.status)] \(.title) → \(.assigned_to) (\(.priority))"' \
       "$TASKS_FILE"
elif [ -n "$AGENT" ]; then
    jq -r --arg a "$AGENT" \
       '.tasks[] | select(.assigned_to == $a) | "#\(.id) [\(.status)] \(.title) (\(.priority))"' \
       "$TASKS_FILE"
elif [ -n "$STATUS" ]; then
    jq -r --arg s "$STATUS" \
       '.tasks[] | select(.status == $s) | "#\(.id) [\(.status)] \(.title) → \(.assigned_to) (\(.priority))"' \
       "$TASKS_FILE"
else
    jq -r '.tasks[] | "#\(.id) [\(.status)] \(.title) → \(.assigned_to) (\(.priority))"' \
       "$TASKS_FILE"
fi
