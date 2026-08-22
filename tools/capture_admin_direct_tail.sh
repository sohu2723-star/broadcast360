#!/usr/bin/env bash
set -u
cd /home/ubuntu/flickscope-working
ACCOUNT_ID="1ca5d7fd25075504cf40fe5ca95f6380"
API="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}"
WORKER="hxu-movie-admin"
CANDIDATE="5f95130e-23e5-43c1-bcbf-17113ed80c20"
PREVIOUS="30ed4cd7-ede0-47a6-9daf-0db9967dfd26"
TAIL_LOG="/tmp/flickscope-admin-direct-tail-client.log"
PROMOTE_LOG="/tmp/flickscope-admin-direct-tail-promote.json"
ROLLBACK_LOG="/tmp/flickscope-admin-direct-tail-rollback.json"
REQUEST_LOG="/tmp/flickscope-admin-direct-tail-request.log"
RESPONSE_BODY="/tmp/flickscope-admin-direct-tail-response.body"
REQUEST_PATH="${1:-/api/config/public}"
rm -f "$TAIL_LOG" "$PROMOTE_LOG" "$ROLLBACK_LOG" "$REQUEST_LOG" "$RESPONSE_BODY" /tmp/flickscope-admin-cloudflare-live-tail.jsonl
rollback() {
  curl -sS --max-time 120 -X POST "$API/workers/scripts/$WORKER/deployments" \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H 'Content-Type: application/json' \
    --data "{\"strategy\":\"percentage\",\"versions\":[{\"version_id\":\"$PREVIOUS\",\"percentage\":100}],\"annotations\":{\"workers/message\":\"Restore Admin after direct tail diagnostic\"}}" > "$ROLLBACK_LOG" 2>&1 || true
}
trap rollback EXIT
python3 tools/capture_cloudflare_live_tail.py > "$TAIL_LOG" 2>&1 &
TAIL_PID=$!
sleep 5
curl -sS --max-time 120 -X POST "$API/workers/scripts/$WORKER/deployments" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H 'Content-Type: application/json' \
  --data "{\"strategy\":\"percentage\",\"versions\":[{\"version_id\":\"$CANDIDATE\",\"percentage\":100}],\"annotations\":{\"workers/message\":\"Controlled direct tail Admin diagnostic\"}}" > "$PROMOTE_LOG" 2>&1
sleep 15
curl -sS -o "$RESPONSE_BODY" -w 'request_status=%{http_code}\n' --max-time 30 "https://hxu-movie-admin.sohu2723.workers.dev${REQUEST_PATH}" > "$REQUEST_LOG" 2>&1
sleep 8
kill "$TAIL_PID" 2>/dev/null || true
wait "$TAIL_PID" 2>/dev/null || true
printf '%s\n' '--- request ---'
cat "$REQUEST_LOG"
printf '%s\n' '--- response ---'
head -c 400 "$RESPONSE_BODY"; printf '\n'
printf '%s\n' '--- client ---'
cat "$TAIL_LOG"
printf '%s\n' '--- captured tail ---'
tail -80 /tmp/flickscope-admin-cloudflare-live-tail.jsonl 2>/dev/null || true
printf '%s\n' '--- rollback ---'
grep -o '"success"[^,]*' "$ROLLBACK_LOG" | head -1 || true
