#!/usr/bin/env bash
set +x
set -u
ACCOUNT_ID="1ca5d7fd25075504cf40fe5ca95f6380"
API="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}"
WORKER="hxu-movie-admin"
CANDIDATE="6961b724-12a6-40e1-a6ab-0a2fc84500ee"
PREVIOUS="30ed4cd7-ede0-47a6-9daf-0db9967dfd26"
TAIL_LOG="/tmp/flickscope-admin-1101-tail.jsonl"
: > "$TAIL_LOG"
rollback() {
  curl -sS --max-time 120 -X POST "$API/workers/scripts/$WORKER/deployments" \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H 'Content-Type: application/json' \
    --data '{"strategy":"percentage","versions":[{"version_id":"30ed4cd7-ede0-47a6-9daf-0db9967dfd26","percentage":100}],"annotations":{"workers/message":"Restore Admin after controlled 1101 diagnostic"}}' > /tmp/flickscope-admin-1101-rollback.json 2>&1 || true
}
trap rollback EXIT
if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then echo "token_injection=absent"; exit 1; fi
(timeout 75s npx wrangler tail "$WORKER" --format json --status error > "$TAIL_LOG" 2>&1) &
TAIL_PID=$!
sleep 6
curl -sS --max-time 120 -X POST "$API/workers/scripts/$WORKER/deployments" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H 'Content-Type: application/json' \
  --data '{"strategy":"percentage","versions":[{"version_id":"6961b724-12a6-40e1-a6ab-0a2fc84500ee","percentage":100}],"annotations":{"workers/message":"Controlled Admin 1101 runtime diagnostic"}}' > /tmp/flickscope-admin-1101-promote.json 2>&1
sleep 10
curl -sS -o /tmp/flickscope-admin-1101-response.body -w 'request_status=%{http_code}\n' --max-time 30 'https://hxu-movie-admin.sohu2723.workers.dev/api/config/public'
sleep 10
kill "$TAIL_PID" 2>/dev/null || true
wait "$TAIL_PID" 2>/dev/null || true
printf 'tail_bytes='; wc -c < "$TAIL_LOG"
printf 'rollback_success='; grep -o '"success"[^,]*' /tmp/flickscope-admin-1101-rollback.json | head -1 || true
cat "$TAIL_LOG" | tail -180
