import argparse
import base64
import hashlib
import json
import mimetypes
import re
import sys
import time
from pathlib import Path

import requests

ACCOUNT_ID = "1ca5d7fd25075504cf40fe5ca95f6380"
API_BASE = "https://api.cloudflare.com/client/v4"
RUNTIME_FILES = [
    ".open-next/.build/durable-objects/bucket-cache-purge.js",
    ".open-next/.build/durable-objects/queue.js",
    ".open-next/.build/durable-objects/sharded-tag-cache.js",
    ".open-next/cloudflare/images.js",
    ".open-next/cloudflare/init.js",
    ".open-next/cloudflare/next-env.mjs",
    ".open-next/cloudflare/skew-protection.js",
    ".open-next/middleware/handler.mjs",
    ".open-next/middleware/open-next.config.mjs",
    ".open-next/server-functions/default/handler.mjs",
    ".open-next/server-functions/default/index.mjs",
    ".open-next/server-functions/default/open-next.config.mjs",
    ".open-next/worker.js",
]


WORKER_REQUIRE_SHIM = r'''var __flickscopeRequire = globalThis.__flickscopeRequire || ((id) => {
  const name = String(id).replace(/^node:/, "");
  const webCrypto = globalThis.crypto;
  const crypto = webCrypto ? {
    ...webCrypto,
    randomUUID: webCrypto.randomUUID ? webCrypto.randomUUID.bind(webCrypto) : (() => "00000000-0000-4000-8000-000000000000"),
    randomBytes(size, callback) {
      const value = new Uint8Array(size);
      webCrypto.getRandomValues(value);
      if (typeof callback === "function") { callback(null, value); return; }
      return value;
    },
    randomFillSync(value) { return webCrypto.getRandomValues(value); },
  } : {};
  const normalizePath = (value) => String(value).split("\\\\").join("/").split("//").join("/");
  const path = {
    sep: "/", delimiter: ":",
    join: (...parts) => normalizePath(parts.filter(Boolean).join("/")),
    resolve: (...parts) => normalizePath(parts.filter(Boolean).join("/")),
    dirname: (value) => { const p = normalizePath(value).replace(/\/+$/, ""); const i = p.lastIndexOf("/"); return i <= 0 ? "/" : p.slice(0, i); },
    basename: (value) => normalizePath(value).split("/").pop() || "",
    extname: (value) => { const b = normalizePath(value).split("/").pop() || ""; const i = b.lastIndexOf("."); return i > 0 ? b.slice(i) : ""; },
    parse: (value) => { const normalized = normalizePath(value); const base = normalized.split("/").pop() || ""; const dir = normalized.slice(0, Math.max(0, normalized.length - base.length)).replace(/\/$/, ""); const dot = base.lastIndexOf("."); const ext = dot > 0 ? base.slice(dot) : ""; return { root: normalized.startsWith("/") ? "/" : "", dir, base, ext, name: ext ? base.slice(0, -ext.length) : base }; },
    format: (value) => normalizePath([value?.dir || value?.root || "", value?.base || ((value?.name || "") + (value?.ext || ""))].filter(Boolean).join("/")),
    normalize: (value) => normalizePath(value),
    isAbsolute: (value) => normalizePath(value).startsWith("/"),
    relative: (from, to) => normalizePath(to).replace(normalizePath(from).replace(/\/+$/, "") + "/", ""),
  };
  path.posix = path;
  path.win32 = path;
  const fs = {
    existsSync: () => false,
    readFileSync: () => { throw Object.assign(new Error("filesystem access is unavailable in the Worker runtime"), { code: "ENOENT" }); },
    statSync: () => ({ isFile: () => false, isDirectory: () => false }),
    promises: {},
  };
  const events = { EventEmitter: class { constructor() { this._listeners = {}; } on(name, fn) { (this._listeners[name] ||= []).push(fn); return this; } once(name, fn) { const once = (...args) => { this.off(name, once); fn(...args); }; return this.on(name, once); } off(name, fn) { this._listeners[name] = (this._listeners[name] || []).filter((item) => item !== fn); return this; } removeListener(name, fn) { return this.off(name, fn); } emit(name, ...args) { for (const fn of this._listeners[name] || []) fn(...args); return (this._listeners[name] || []).length > 0; } } };
  const NodeStreamBase = class extends events.EventEmitter { constructor() { super(); this.destroyed = false; } destroy(error) { this.destroyed = true; if (error) this.emit("error", error); this.emit("close"); return this; } pipe(destination) { this.on("data", (chunk) => destination.write(chunk)); this.on("end", () => destination.end()); return destination; } };
  const streams = { Stream: NodeStreamBase, Readable: class extends NodeStreamBase { _read() {} }, Writable: class extends NodeStreamBase { write() { return true; } end() { this.emit("finish"); return this; } }, Duplex: class extends NodeStreamBase {}, Transform: class extends NodeStreamBase {}, PassThrough: class extends NodeStreamBase {} };
  const util = { inspect: (value) => String(value), types: {}, promisify: (fn) => fn, deprecate: (fn) => fn, inherits: (ctor, superCtor) => { Object.setPrototypeOf(ctor.prototype, superCtor.prototype); return ctor; }, TextEncoder: globalThis.TextEncoder, TextDecoder: globalThis.TextDecoder };
  const asyncHooks = { AsyncLocalStorage: globalThis.AsyncLocalStorage || class { run(_store, callback, ...args) { return callback(...args); } getStore() { return undefined; } enterWith() {} } };
  const os = { cpus: () => [], homedir: () => "/", tmpdir: () => "/tmp", platform: () => "linux", arch: () => "x64", EOL: "\\n", endianness: () => "LE", hostname: () => "flickscope-worker" };
  const tty = { isatty: () => false };
  const zlib = { constants: { Z_SYNC_FLUSH: 2, BROTLI_OPERATION_FLUSH: 1, ZSTD_e_flush: 1 } };
  const http = { Agent: class { constructor(options = {}) { this.options = options; } destroy() {} }, ClientRequest: class {}, IncomingMessage: class {}, ServerResponse: class {}, request: () => { throw new Error("HTTP request is unavailable in the Worker runtime"); }, get: () => { throw new Error("HTTP get is unavailable in the Worker runtime"); } };
  if (name === "crypto") return crypto;
  if (name === "path") return path;
  if (name === "fs" || name === "fs/promises") return fs;
  if (name === "events") return events;
  if (name === "util") return util;
  if (name === "async_hooks") return asyncHooks;
  if (name === "os") return os;
  if (name === "tty") return tty;
  if (name === "zlib") return zlib;
  if (name === "buffer") return { Buffer: globalThis.Buffer || Uint8Array, SlowBuffer: Uint8Array };
  if (name === "http" || name === "https" || name === "_http" || name === "_http_agent" || name === "_https" || name === "node:http" || name === "node:https") return http;
  if (name === "url" || name === "node:url") return { URL: globalThis.URL, URLSearchParams: globalThis.URLSearchParams, parse: (value) => { const raw = String(value); const u = new URL(raw, "http://localhost"); return { href: raw, protocol: u.protocol, slashes: raw.includes("://"), auth: null, host: u.host, port: u.port || null, hostname: u.hostname, hash: u.hash || null, search: u.search || null, query: u.search ? u.search.slice(1) : null, pathname: u.pathname, path: u.pathname + u.search }; }, format: (value) => typeof value === "string" ? value : (value?.href || ""), resolve: (from, to) => new URL(to, from).toString(), pathToFileURL: (value) => new URL("file://" + value), fileURLToPath: (value) => new URL(value).pathname };
  if (name === "module" || name === "node:module") return { createRequire: () => __flickscopeRequire, require: __flickscopeRequire, builtinModules: [] };
  if (name === "stream") return streams;
  if (name === "stream/web" || name === "stream/promises") return { ReadableStream: globalThis.ReadableStream, WritableStream: globalThis.WritableStream, TransformStream: globalThis.TransformStream };
  if (name === "vm") return { runInNewContext: () => undefined, Script: class {} };
  return {};
});
var require = __flickscopeRequire;
// Next.js server initialization checks these globals before constructing node:http Agents.
globalThis.__NEXT_HTTP_AGENT = globalThis.__NEXT_HTTP_AGENT || {};
globalThis.__NEXT_HTTPS_AGENT = globalThis.__NEXT_HTTPS_AGENT || {};
'''

def patch_node_runtime_modules(root):
    path = root / ".open-next/server-functions/default/handler.mjs"
    text = path.read_text()
    commonjs_record = 'mod3={exports:{}}'
    readable_commonjs_record = 'mod3 = { exports: {} }'
    if commonjs_record in text:
        text = text.replace(commonjs_record, 'mod3={exports:{},require:__flickscopeRequire}')
        minified_handler = True
    elif readable_commonjs_record in text:
        text = text.replace(readable_commonjs_record, 'mod3 = { exports: {}, require: __flickscopeRequire }')
        minified_handler = False
    elif 'mod3 = { exports: {}, require: __flickscopeRequire }' in text:
        minified_handler = False
    elif 'mod3={exports:{},require:__flickscopeRequire}' in text:
        minified_handler = True
    else:
        raise RuntimeError("Generated CommonJS wrapper record was not found")

    if not text.startswith("var __flickscopeRequire"):
        text = WORKER_REQUIRE_SHIM + text
    if not minified_handler:
        jwt_start = 'var require_jsonwebtoken = __commonJS({'
        jwt_end = '\n// .open-next/server-functions/default/node_modules/next/dist/server/app-render/cache-signal.js'
        jwt_pos = text.find(jwt_start)
        jwt_end_pos = text.find(jwt_end, jwt_pos)
        if jwt_pos >= 0 and jwt_end_pos >= 0:
            text = text[:jwt_pos] + 'var require_jsonwebtoken = __commonJS({".open-next/server-functions/default/node_modules/next/dist/compiled/jsonwebtoken/index.js"(exports){exports.default={};exports.__esModule=true}});' + text[jwt_end_pos:]
        hook_start = 'var require_require_hook = __commonJS({'
        hook_end = '\n// .open-next/server-functions/default/node_modules/next/dist/shared/lib/deep-freeze.js'
        hook_pos = text.find(hook_start)
        hook_end_pos = text.find(hook_end, hook_pos)
        if hook_pos >= 0 and hook_end_pos >= 0:
            text = text[:hook_pos] + 'var require_require_hook = __commonJS({".open-next/server-functions/default/node_modules/next/dist/server/require-hook.js"(exports){exports.addHookAliases=()=>{};exports.defaultOverrides={};exports.hookPropertyMap=new Map}});' + text[hook_end_pos:]
        path.write_text(text)
        return

    def replace_module(start_marker, end_marker, replacement, label):
        nonlocal text
        start = text.find(start_marker)
        if start < 0:
            return
        end = text.find(end_marker, start)
        if end < 0:
            raise RuntimeError(f"{label} module boundary was not found")
        text = text[:start] + replacement + text[end + len(end_marker):]

    replace_module(
        'var require_require_hook=__commonJS({".open-next/server-functions/default/node_modules/next/dist/server/require-hook.js"(exports)',
        "});var require_setup_node_env_external",
        'var require_require_hook=__commonJS({".open-next/server-functions/default/node_modules/next/dist/server/require-hook.js"(exports){"use strict";exports.addHookAliases=()=>{};exports.defaultOverrides={};exports.hookPropertyMap=new Map}});var require_setup_node_env_external',
        "Next require hook",
    )

    if 'var require_jsonwebtoken=__commonJS({".open-next/server-functions/default/node_modules/next/dist/compiled/jsonwebtoken/index.js"(exports,module)' in text:
        replace_module(
            'var require_jsonwebtoken=__commonJS({".open-next/server-functions/default/node_modules/next/dist/compiled/jsonwebtoken/index.js"(exports,module)',
            "});var require_cache_signal",
            'var require_jsonwebtoken=__commonJS({".open-next/server-functions/default/node_modules/next/dist/compiled/jsonwebtoken/index.js"(exports){"use strict";exports.default={};exports.__esModule=true}});var require_cache_signal',
            "Next bundled jsonwebtoken",
        )

    replace_module(
        'var require_file_logger=__commonJS({".open-next/server-functions/default/node_modules/next/dist/server/dev/browser-logs/file-logger.js"(exports)',
        "});var require_interop_require_default",
        'var require_file_logger=__commonJS({".open-next/server-functions/default/node_modules/next/dist/server/dev/browser-logs/file-logger.js"(exports){"use strict";function getFileLogger(){return{logServer(){},logBrowser(){},initialize(){},destroy(){}}}exports.getFileLogger=getFileLogger}});var require_interop_require_default',
        "Next file logger",
    )
    replace_module(
        'var require_console_dim_external=__commonJS({".open-next/server-functions/default/node_modules/next/dist/server/node-environment-extensions/console-dim.external.js"(exports)',
        "});var require_unhandled_rejection_external",
        'var require_console_dim_external=__commonJS({".open-next/server-functions/default/node_modules/next/dist/server/node-environment-extensions/console-dim.external.js"(exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});function setAbortedLogsStyle(){}exports.setAbortedLogsStyle=setAbortedLogsStyle}});var require_unhandled_rejection_external',
        "Next console dim extension",
    )
    replace_module(
        'var require_node_crypto=__commonJS({".open-next/server-functions/default/node_modules/next/dist/server/node-environment-extensions/node-crypto.js"(exports)',
        "});var require_fast_set_immediate_external",
        'var require_node_crypto=__commonJS({".open-next/server-functions/default/node_modules/next/dist/server/node-environment-extensions/node-crypto.js"(exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0})}});var require_fast_set_immediate_external',
        "Next node crypto extension",
    )
    replace_module(
        'var require_fast_set_immediate_external=__commonJS({".open-next/server-functions/default/node_modules/next/dist/server/node-environment-extensions/fast-set-immediate.external.js"(exports)',
        "});var require_node_environment",
        'var require_fast_set_immediate_external=__commonJS({".open-next/server-functions/default/node_modules/next/dist/server/node-environment-extensions/fast-set-immediate.external.js"(exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const originalSetImmediate=globalThis.setImmediate??((callback,...args)=>setTimeout(callback,0,...args));function DANGEROUSLY_runPendingImmediatesAfterCurrentTask(){}function expectNoPendingImmediates(){}exports.DANGEROUSLY_runPendingImmediatesAfterCurrentTask=DANGEROUSLY_runPendingImmediatesAfterCurrentTask;exports.expectNoPendingImmediates=expectNoPendingImmediates;exports.unpatchedSetImmediate=originalSetImmediate}});var require_node_environment',
        "Next fast setImmediate extension",
    )
    replace_module(
        'var require_setup_http_agent_env=__commonJS({".open-next/server-functions/default/node_modules/next/dist/server/setup-http-agent-env.js"(exports)',
        "});var require_pages_api_route_match",
        'var require_setup_http_agent_env=__commonJS({".open-next/server-functions/default/node_modules/next/dist/server/setup-http-agent-env.js"(exports){"use strict";Object.defineProperty(exports,"__esModule",{value:!0});function setHttpClientAndAgentOptions(){}exports.setHttpClientAndAgentOptions=setHttpClientAndAgentOptions}});var require_pages_api_route_match',
        "Next setup HTTP agent environment",
    )
    cache_handler_start = 'async loadCustomCacheHandlers(){let handlersSymbol=Symbol.for("@next/cache-handlers")'
    cache_handler_end = '}async getIncrementalCache('
    cache_handler_pos = text.find(cache_handler_start)
    if cache_handler_pos < 0:
        if 'async loadCustomCacheHandlers(){}' in text:
            path.write_text(text)
            return
        path.write_text(text)
        return
    cache_handler_end_pos = text.find(cache_handler_end, cache_handler_pos)
    if cache_handler_end_pos < 0:
        raise RuntimeError("Next loadCustomCacheHandlers method boundary was not found")
    text = text[:cache_handler_pos] + 'async loadCustomCacheHandlers(){}' + text[cache_handler_end_pos + 1:]
    path.write_text(text)


def api_request(token, method, path, **kwargs):
    headers = kwargs.pop("headers", {})
    headers["Authorization"] = f"Bearer {token}"
    headers.setdefault("Accept", "application/json")
    response = requests.request(method, API_BASE + path, headers=headers, timeout=180, **kwargs)
    try:
        payload = response.json()
    except ValueError:
        payload = {"success": False, "errors": [{"message": response.text[:1000]}]}
    if not response.ok or payload.get("success") is False:
        raise RuntimeError(f"{method} {path} failed HTTP {response.status_code}: {payload.get('errors', payload)}")
    return payload


def asset_hash(raw, extension):
    encoded = base64.b64encode(raw).decode()
    return hashlib.sha256((encoded + extension).encode()).hexdigest()[:32]


def build_asset_manifest(asset_root):
    manifest = {}
    values = {}
    for path in sorted(asset_root.rglob("*")):
        if not path.is_file():
            continue
        raw = path.read_bytes()
        rel = "/" + path.relative_to(asset_root).as_posix()
        extension = path.suffix.lstrip(".")
        digest = asset_hash(raw, extension)
        content_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        if path.suffix == ".ico":
            content_type = "image/x-icon"
        manifest[rel] = {"hash": digest, "size": len(raw)}
        values[digest] = {"type": content_type, "value": base64.b64encode(raw).decode()}
    return manifest, values


def multipart_bucket(bucket, values, boundary):
    parts = []
    for digest in bucket:
        item = values[digest]
        parts.extend([
            f"--{boundary}",
            f'Content-Disposition: form-data; name="{digest}"',
            f"Content-Type: {item['type']}",
            "",
            item["value"],
        ])
    parts.extend([f"--{boundary}--", ""])
    return "\r\n".join(parts).encode()


def upload_assets(token, worker_name, asset_root):
    manifest, values = build_asset_manifest(asset_root)
    print(f"asset_count={len(manifest)}")
    session = api_request(
        token,
        "POST",
        f"/accounts/{ACCOUNT_ID}/workers/scripts/{worker_name}/assets-upload-session",
        json={"manifest": manifest},
    )
    result = session.get("result") or {}
    buckets = result.get("buckets") or []
    jwt = result.get("jwt")
    if not jwt:
        raise RuntimeError("Cloudflare did not return an asset upload JWT")
    print(f"asset_bucket_count={len(buckets)}")
    print(f"session_jwt_present={bool(jwt)}")
    if not buckets:
        return jwt
    completion_jwt = None
    for index, bucket in enumerate(buckets, start=1):
        boundary = f"FlickScopeAssets{int(time.time() * 1000)}{index}"
        body = multipart_bucket(bucket, values, boundary)
        response = requests.post(
            f"{API_BASE}/accounts/{ACCOUNT_ID}/workers/assets/upload?base64=true",
            headers={
                "Authorization": f"Bearer {jwt}",
                "Content-Type": f"multipart/form-data; boundary={boundary}",
                "Accept": "application/json",
            },
            data=body,
            timeout=300,
        )
        try:
            payload = response.json()
        except ValueError:
            payload = {"success": False, "errors": [{"message": response.text[:1000]}]}
        if not response.ok or payload.get("success") is False:
            raise RuntimeError(f"asset bucket {index} failed HTTP {response.status_code}: {payload.get('errors', payload)}")
        completion_jwt = (payload.get("result") or {}).get("jwt") or payload.get("jwt") or completion_jwt
        print(f"asset_bucket_uploaded={index}/{len(buckets)}")
    if not completion_jwt:
        raise RuntimeError("Cloudflare did not return the asset completion JWT")
    return completion_jwt


def extract_base_metadata(artifact_path):
    if not artifact_path.exists():
        return {}
    artifact = artifact_path.read_text(errors="strict")
    first_line, _ = artifact.split("\n", 1)
    boundary = first_line[2:]
    pattern = r'Content-Disposition: form-data; name="metadata"\r?\n(?:Content-Type: application/json\r?\n)?\r?\n(\{.*?\})(\r?\n)--' + re.escape(boundary)
    match = re.search(pattern, artifact, re.S)
    return json.loads(match.group(1)) if match else {}


def worker_bindings(worker_name):
    common = [
        {"name": "ADMIN_CREATOR_EMAIL", "text": "copy2723@gmail.com", "type": "plain_text"},
        {"name": "ADMIN_EMAILS", "text": "copy2723@gmail.com", "type": "plain_text"},
        {"name": "DATABASE_URL", "type": "inherit"},
        {"name": "EMAILJS_PUBLIC_KEY", "text": "lLig8IoArIt_ww48U", "type": "plain_text"},
        {"name": "EMAILJS_SERVICE_ID", "text": "service_nbmsxme", "type": "plain_text"},
        {"name": "EMAILJS_TEMPLATE_ID", "text": "template_15zrobg", "type": "plain_text"},
        {"name": "GOOGLE_CLIENT_ID", "text": "142767190785-vhj059537ornq1b1f90ln48lad6j3fja.apps.googleusercontent.com", "type": "plain_text"},
        {"name": "JWT_SECRET", "type": "inherit"},
        {"name": "JWT_SECRET_USER", "type": "inherit"},
        {"bucket_name": "hxu-movie-media", "name": "MEDIA_BUCKET", "type": "r2_bucket"},
        {"name": "NEXT_PUBLIC_GOOGLE_CLIENT_ID", "text": "142767190785-vhj059537ornq1b1f90ln48lad6j3fja.apps.googleusercontent.com", "type": "plain_text"},
        {"name": "NEXT_PUBLIC_TURNSTILE_SITE_KEY", "text": "0x4AAAAAAEXlR46DdlFf3qBG", "type": "plain_text"},
        {"name": "NEXT_PUBLIC_URL", "text": "https://hxu-movie.sohu2723.workers.dev", "type": "plain_text"},
        {"name": "R2_ACCOUNT_ID", "text": ACCOUNT_ID, "type": "plain_text"},
        {"name": "R2_BUCKET_NAME", "text": "hxu-movie-media", "type": "plain_text"},
        {"name": "R2_PUBLIC_BASE_URL", "text": "https://pub-68477285aa874ec9b203ba54f842f560.r2.dev", "type": "plain_text"},
        {"name": "SUPABASE_KEY", "type": "inherit"},
        {"name": "SUPABASE_URL", "text": "https://ygkwwzjvifnnypkjfnnw.supabase.co", "type": "plain_text"},
        {"name": "TURNSTILE_SECRET_KEY", "type": "inherit"},
        {"name": "USER_PORTAL_ORIGIN", "text": "https://hxu-movie.sohu2723.workers.dev", "type": "plain_text"},
        {"environment": "production", "name": "WORKER_SELF_REFERENCE", "service": worker_name, "type": "service"},
    ]
    if worker_name == "hxu-movie-portal":
        return [
            {"name": "WORKER_SELF_REFERENCE", "type": "service", "service": worker_name, "environment": "production"},
            {"name": "NEXT_PUBLIC_GOOGLE_CLIENT_ID", "text": "142767190785-vhj059537ornq1b1f90ln48lad6j3fja.apps.googleusercontent.com", "type": "plain_text"},
            {"name": "NEXT_PUBLIC_TURNSTILE_SITE_KEY", "text": "0x4AAAAAAEXlR46DdlFf3qBG", "type": "plain_text"},
            {"name": "NEXT_PUBLIC_URL", "text": "https://hxu-movie.sohu2723.workers.dev", "type": "plain_text"},
            {"name": "USER_PORTAL_ORIGIN", "text": "https://hxu-movie.sohu2723.workers.dev", "type": "plain_text"},
        ]
    return [{"name": "ASSETS", "type": "assets"}] + common


def upload_version(token, worker_name, root, completion_jwt):
    metadata = extract_base_metadata(Path("/tmp/hxu-admin-single.js"))
    metadata.update({
        "main_module": "worker.js",
        "compatibility_date": "2026-08-20",
        "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
        "bindings": worker_bindings(worker_name),
        "assets": {"jwt": completion_jwt},
        "annotations": {"workers/message": "FlickScope VOD production deployment with direct static asset upload."},
    })
    parts = [("metadata", (None, json.dumps(metadata, separators=(",", ":"), ensure_ascii=False), "application/json"))]
    for relative in RUNTIME_FILES:
        path = root / relative
        if not path.exists():
            raise RuntimeError(f"missing runtime file: {path}")
        ctype = "application/javascript+module" if path.suffix in {".js", ".mjs"} else "application/octet-stream"
        module_name = relative.removeprefix(".open-next/")
        parts.append(("files", (module_name, path.read_bytes(), ctype)))
    response = requests.post(
        f"{API_BASE}/accounts/{ACCOUNT_ID}/workers/scripts/{worker_name}/versions?bindings_inherit=strict",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
        files=parts,
        timeout=900,
    )
    try:
        payload = response.json()
    except ValueError:
        payload = {"success": False, "errors": [{"message": response.text[:1000]}]}
    if not response.ok or payload.get("success") is False:
        raise RuntimeError(f"version upload failed HTTP {response.status_code}: {payload.get('errors', payload)}")
    result = payload.get("result") or {}
    version_id = result.get("id")
    if not version_id:
        raise RuntimeError(f"version upload returned no id: {payload}")
    return version_id


def current_version(token, worker_name):
    payload = api_request(token, "GET", f"/accounts/{ACCOUNT_ID}/workers/scripts/{worker_name}/deployments")
    deployments = payload.get("result", {}).get("deployments", [])
    for deployment in deployments:
        versions = deployment.get("versions") or []
        if versions and versions[0].get("percentage") == 100:
            return versions[0].get("version_id")
    return None


def promote(token, worker_name, version_id, message):
    return api_request(
        token,
        "POST",
        f"/accounts/{ACCOUNT_ID}/workers/scripts/{worker_name}/deployments",
        json={"strategy": "percentage", "versions": [{"version_id": version_id, "percentage": 100}], "annotations": {"workers/message": message}},
    )


def smoke(url):
    response = requests.get(url, timeout=30)
    return response.status_code, response.headers.get("content-type", ""), response.text[:200]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--worker", required=True)
    parser.add_argument("--root", required=True)
    parser.add_argument("--url", required=True)
    parser.add_argument("--promote", action="store_true")
    args = parser.parse_args()
    token = __import__("os").environ.get("CLOUDFLARE_API_TOKEN")
    if not token:
        raise SystemExit("CLOUDFLARE_API_TOKEN is not available")
    root = Path(args.root)
    patch_node_runtime_modules(root)
    previous = current_version(token, args.worker)
    print(f"previous_version={previous or 'none'}")
    completion_jwt = upload_assets(token, args.worker, root / ".open-next/assets")
    version_id = upload_version(token, args.worker, root, completion_jwt)
    print(f"uploaded_version={version_id}")
    if not args.promote:
        return 0
    promote(token, args.worker, version_id, "FlickScope VOD production deployment")
    print("promotion=100%")
    time.sleep(8)
    status, content_type, excerpt = smoke(args.url)
    print(f"smoke_status={status}")
    print(f"smoke_content_type={content_type}")
    print(f"smoke_excerpt={excerpt.replace(chr(10), ' ')[:180]}")
    if status >= 500 and previous:
        promote(token, args.worker, previous, "Automatic rollback after FlickScope smoke-test failure")
        print(f"rollback_version={previous}")
        return 2
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"deployment_error={exc}")
        raise
