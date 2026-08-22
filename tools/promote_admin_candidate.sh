#!/usr/bin/env bash
set +x
set -u
ACCOUNT_ID="1ca5d7fd25075504cf40fe5ca95f6380"
API="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}"
WORKER="hxu-movie-admin"
CANDIDATE="5f95130e-23e5-43c1-bcbf-17113ed80c20"
PREVIOUS="30ed4cd7-ede0-47a6-9daf-0db9967dfd26"
PROMOTE_LOG="/tmp/flickscope-admin-candidate-promote.json"
ROLLBACK_LOG="/tmp/flickscope-admin-candidate-rollback.json"

deploy_version() {
  local version="$1"
  local message="$2"
  curl -sS --max-time 120 -X POST "$API/workers/scripts/$WORKER/deployments" \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H 'Content-Type: application/json' \
    --data "{\"strategy\":\"percentage\",\"versions\":[{\"version_id\":\"$version\",\"percentage\":100}],\"annotations\":{\"workers/message\":\"$message\"}}"
}

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "token_injection=absent"
  exit 1
fi

deploy_version "$CANDIDATE" "Controlled promotion of Admin runtime-shim candidate" > "$PROMOTE_LOG"
sleep 10
check() {
  local name="$1"
  local url="$2"
  local output="/tmp/flickscope-admin-candidate-${name}.body"
  local code
  code=$(curl -sS -o "$output" -w '%{http_code}' --max-time 30 "$url")
  echo "$name=$code"
  printf '%s\n' "$code"
}
login_code=$(check login 'https://hxu-movie-admin.sohu2723.workers.dev/login' | tail -1)
admin_login_code=$(check admin_login 'https://hxu-movie-admin.sohu2723.workers.dev/admin/login' | tail -1)
config_code=$(check public_config 'https://hxu-movie-admin.sohu2723.workers.dev/api/config/public' | tail -1)
movies_code=$(check movies_api 'https://hxu-movie-admin.sohu2723.workers.dev/api/movies' | tail -1)

if [[ "$login_code" -ge 500 || "$admin_login_code" -ge 500 || "$config_code" -ge 500 || "$movies_code" -ge 500 ]]; then
  deploy_version "$PREVIOUS" "Automatic rollback after Admin candidate smoke-test failure" > "$ROLLBACK_LOG"
  echo "promotion=rolled_back"
  rollback_success=$(grep -o '"success"[^,]*' "$ROLLBACK_LOG" | head -1 || true)
  echo "rollback_success=$rollback_success"
  exit 2
fi

echo "promotion=kept"
echo "candidate=$CANDIDATE"
