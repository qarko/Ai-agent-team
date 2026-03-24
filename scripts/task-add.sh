#!/bin/bash
# 작업 추가
# Usage: task-add.sh <title> <assigned_to> [priority] [description]

TITLE=$1
ASSIGNED_TO=$2
PRIORITY=${3:-medium}
DESCRIPTION=${4:-""}
TASKS_FILE="/home/claude/shared/tasks.json"

if [ -z "$TITLE" ] || [ -z "$ASSIGNED_TO" ]; then
    echo "Usage: $0 <title> <assigned_to> [priority] [description]"
    exit 1
fi

TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)

tmp=$(mktemp)
jq --arg title "$TITLE" \
   --arg assigned "$ASSIGNED_TO" \
   --arg priority "$PRIORITY" \
   --arg desc "$DESCRIPTION" \
   --arg ts "$TS" \
   '.next_id as $id |
    .next_id += 1 |
    .tasks += [{
      id: $id,
      title: $title,
      description: $desc,
      assigned_to: $assigned,
      priority: $priority,
      status: "pending",
      created_at: $ts,
      updated_at: $ts
    }]' \
   "$TASKS_FILE" > "$tmp" && mv "$tmp" "$TASKS_FILE"

echo "Task added: $TITLE → $ASSIGNED_TO"
