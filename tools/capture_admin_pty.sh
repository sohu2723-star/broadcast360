#!/usr/bin/env bash
set -u
cd /home/ubuntu/flickscope-working
ACCOUNT_ID="1ca5d7fd25075504cf40fe5ca95f6380"
API="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}"
WORKER="hxu-movie-admin"
CANDIDATE="6961b724-12a6-40e1-a6ab-0a2fc84500ee"
PREVIOUS="30ed4cd7-ede0-47a6-9daf-0db9967dfd26"
TAIL_LOG="/tmp/flickscope-admin-pty-tail.log"
SCRIPT_LOG="/tmp/flickscope-admin-pty-script.log"
REQUEST_LOG="/tmp/flickscope-admin-pty-request.log"
RESPONSE_BODY="/tmp/flickscope-admin-pty-response.body"
ROLLBACK_LOG="/tmp/flickscope-admin-pty-rollback.json"
rm -f "$TAIL_LOG" "$SCRIPT_LOG" "$REQUEST_LOG" "$RESPONSE_BODY" "$ROLLBACK_LOG"
rollback() {
  curl -sS --max-time 120 -X POST "$API/workers/scripts/$WORKER/deployments" \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H 'Content-Type: application/json' \
    --data "{\"strategy\":\"percentage\",\"versions\":[{\"version_id\":\"$PREVIOUS\",\"percentage\":100}],\"annotations\":{\"workers/message\":\"Restore Admin after pseudo-terminal diagnostic\"}}" > "$ROLLBACK_LOG" 2>&1 || true
}
trap rollback EXIT
script -q -c "npx wrangler tail $WORKER --format json --status error" "$TAIL_LOG" > "$SCRIPT_LOG" 2>&1 &
TAIL_PID=$!
sleep 12
curl -sS --max-time 120 -X POST "$API/workers/scripts/$WORKER/deployments" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H 'Content-Type: application/json' \
  --data "{\"strategy\":\"percentage\",\"versions\":[{\"version_id\":\"$CANDIDATE\",\"percentage\":100}],\"annotations\":{\"workers/message\":\"Controlled pseudo-terminal tail diagnostic\"}}" > /tmp/flickscope-admin-pty-promote.json 2>&1
sleep 15
curl -sS -o "$RESPONSE_BODY" -w 'request_status=%{http_code}\n' --max-time 30 'https://hxu-movie-admin.sohu2723.workers.dev/api/config/public' > "$REQUEST_LOG" 2>&1
sleep 8
kill "$TAIL_PID" 2>/dev/null || true
wait "$TAIL_PID" 2>/dev/null || true
printf '%s\n' '--- script ---'
cat "$SCRIPT_LOG" 2>/dev/null || true
printf '%s\n' '--- tail ---'
tail -220 "$TAIL_LOG" 2>/dev/null || true
printf '%s\n' '--- request ---'
cat "$REQUEST_LOG" 2>/dev/null || true
printf '%s\n' '--- response ---'
head -c 400 "$RESPONSE_BODY" 2>/dev/null || true
printf '\n%s\n' '--- rollback ---'
grep -o '"success"[^,]*' "$ROLLBACK_LOG" | head -1 || true
