import json
import time
from pathlib import Path

import websocket

WS_URL = "wss://tail.developers.workers.dev/1fec013ca6ab463587db9cd98d7e2817"
OUT = Path('/tmp/flickscope-admin-cloudflare-live-tail.jsonl')
OUT.write_text('')
ws = websocket.create_connection(WS_URL, timeout=55, origin="https://dash.cloudflare.com", subprotocols=["trace-v1"], header=["User-Agent: wrangler/4.125.0"])
ws.send(json.dumps({"debug": False}))
ws.settimeout(3)
start = time.time()
with OUT.open('a') as handle:
    while time.time() - start < 50:
        try:
            message = ws.recv()
        except websocket.WebSocketTimeoutException:
            continue
        if not message:
            continue
        if isinstance(message, bytes):
            message = message.decode('utf-8', errors='replace')
        handle.write(message + '\n')
        handle.flush()
ws.close()
print(f'captured_bytes={OUT.stat().st_size}')
for line in OUT.read_text().splitlines()[-12:]:
    try:
        data = json.loads(line)
        print(json.dumps(data, ensure_ascii=False)[:4000])
    except json.JSONDecodeError:
        print(line[:4000])
