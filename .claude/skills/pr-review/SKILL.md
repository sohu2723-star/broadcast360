---
name: pr-review
description: Review a Broadcast360 pull request (or the current diff) and report issues in a simple, directive format for intern/OJT developers. Use when asked to review a PR, review changes, or check code before merging. Pass a PR number as the argument (e.g. "71"); with no argument it reviews the current working diff.
---

# Broadcast360 Code Review

Review a pull request or the current diff and report problems in plain, beginner-friendly language. This project is a **Next.js (App Router) + Prisma (PostgreSQL)** app that uses a layered pattern:

```
src/app/api/**/route.ts   →  src/services/*.service.ts  →  src/repositories/*.repository.ts  →  prisma
src/app/admin/**/page.tsx  (client UI: list / search / filter / paginate / delete)
```

Keep findings **short, non-technical, and directive** — say what is wrong and show the exact fix. No pep talk, no personal greetings or sign-offs.

## Step 1 — Get the diff to review

Pick the scope from the argument:

- **A PR number was given** (e.g. `71`): fetch it with the GitHub MCP tools (the `gh` CLI is NOT available here). Use `ToolSearch` to load `mcp__github__pull_request_read`, then call:
  - method `get` → title, state, `mergeable_state`, base/head refs
  - method `get_diff` → the unified diff (this is the review scope)
  - method `get_files` → per-file status
  Repo owner/name come from `git remote -v` (currently `gw-iojt-2026/broadcast360`).
- **No argument**: run `git diff main...HEAD`; if empty, `git diff HEAD`. Include uncommitted changes.

The diff is the only review scope. When you need surrounding context (a Prisma model, a caller, an existing route's convention), `Read` the files in the checkout.

## Step 2 — Check against these common failure modes

Go hunk by hunk. For each, ask "what input or state makes this wrong?" Pay special attention to the patterns that actually break in this codebase:

**Data mapping (services)**
- A field mapped from the **wrong source object** (e.g. `p.channel?.description` when the model has its own `p.description`). Always confirm the field exists on the right model in `prisma/schema.prisma`.
- Dropped or renamed fields between the DB row and the API response the UI expects.

**API routes (`route.ts`)**
- `params` must be typed `{ params: Promise<{ id: string }> }` and `await`ed (Next.js 15 convention used across this repo). Flag the non-Promise form.
- `parseInt` results used without an `isNaN` guard; missing `400` on bad input.
- `error.message` accessed in `catch` without an `error instanceof Error` guard (throws on non-Error values).
- Filter/where logic **duplicated** between the list query and the `count()` query — they must match exactly (same fields AND same `mode: "insensitive"`), or pagination totals will be wrong. Prefer a `count()` in the repository that reuses the same `where`.

**Client pages (`page.tsx`)**
- Wrong file contents / copy-paste: component name, `fetch(...)` URL, and page heading must match the route the file lives in (e.g. an `admin/ads/page.tsx` that fetches `/api/series` and is named `SeriesPage` is a wrong-file commit).
- Fetch fired on every keystroke with no debounce (note it as minor).
- Response shape read by the UI (`result.data`, `result.pagination`, `result.meta`) must match what the route returns.

**Prisma / repository**
- `include`/`select` that omit a field the response maps.
- Deletes that must cascade to children (e.g. delete `episodes` before `series`) — confirm it's inside a `$transaction`.

**General**
- Reversed conditions, off-by-one, missing `await`, swallowed errors.
- Duplicated code that should be shared; obvious dead code.
- Missing trailing newline at end of new files (note as minor).

## Step 3 — Verify before reporting

Only report a finding you can back with a concrete failure ("filter by channel `NEWS` vs `news` → count says 2 pages, list returns 1"). If a claim depends on the schema or an existing convention, open the file and confirm it. Drop anything you can't stand behind. Aim for the few issues a reviewer would actually act on — correctness bugs rank above style.

## Step 4 — Report in this format

Use this exact structure. Bug findings first (🔴 Must fix), then 🟡 Minor. Each finding: file path, one-line problem, the offending line, and a `✅ Fix:` with the corrected code. End with a checklist and note any merge conflict (`mergeable_state: dirty`). No opening greeting, no closing encouragement.

```
# Code Review — PR #<n> (<title>)

Findings sorted from most important to minor.

## 🔴 Must fix

### 1. <one-line problem>
📁 `path/to/file`

<1–2 sentence plain explanation>
```ts
<offending line>   // ❌ what's wrong
```
✅ Fix:
```ts
<corrected line>
```

## 🟡 Minor (optional)
### N. <problem> — 📁 `path` — <fix in a sentence or short snippet>

## ✅ Checklist
- [ ] #1 — <short reminder>
- [ ] Resolve merge conflict with `main` (if dirty)
```

If nothing needs fixing, say so plainly and list what you checked.

## Step 5 — Offer to post (do not post automatically)

After presenting, ask whether to **post the review as a PR comment** (`mcp__github__add_comment_to_pending_review` / `mcp__github__pull_request_review_write` or `add_issue_comment`) or **push fixes to the branch**. Only do either when the user confirms.
