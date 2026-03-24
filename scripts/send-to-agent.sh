#!/bin/bash
# 특정 에이전트에게 메시지/명령 전송
# Usage: send-to-agent.sh <agent_name> <message>

AGENT=$1
shift
MESSAGE="$*"

if [ -z "$AGENT" ] || [ -z "$MESSAGE" ]; then
    echo "Usage: $0 <agent_name> <message>"
    echo "Agents: manager, planner, backend, frontend, reviewer, tester"
    exit 1
fi

SESSION_NAME="agent-$AGENT"

if ! tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    echo "Error: 세션 '$SESSION_NAME'이 실행 중이 아닙니다."
    echo "먼저 실행하세요: ./scripts/start-all.sh $AGENT"
    exit 1
fi

# Claude Code 세션에 메시지 전송
tmux send-keys -t "$SESSION_NAME" "$MESSAGE" Enter

echo "[$AGENT] 메시지 전송 완료: $MESSAGE"

# 로그 기록
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
echo "[$TS] [→$AGENT] $MESSAGE" >> "/home/claude/shared/logs/${AGENT}.log"
