---
name: pr-review
description: Review a pull request (or the current diff) and report issues in a simple, directive format aimed at intern/OJT developers. Works for any language or framework. Use when asked to review a PR, review changes, or check code before merging. Pass a PR number as the argument (e.g. "71"); with no argument it reviews the current working diff.
---

# Pull Request Review

Review a pull request or the current diff and report problems in plain, beginner-friendly language. This skill is **language- and framework-agnostic** — infer the stack from the files in the diff and apply the general review principles below.

Keep findings **short, non-technical, and directive** — say what is wrong, why it matters in one line, and show or describe the exact fix. No pep talk, no greetings, no sign-offs.

## Step 1 — Get the diff to review

Pick the scope from the argument:

- **A PR number / URL / branch was given**: fetch that PR's diff.
  - If GitHub MCP tools are available (`mcp__github__*`), use `ToolSearch` to load `mcp__github__pull_request_read` and call it with method `get` (title, state, mergeable state, base/head), `get_diff` (the unified diff — the review scope), and `get_files` (per-file status). Get repo owner/name from `git remote -v`.
  - Otherwise, if the `gh` CLI is available, use `gh pr diff <n>` and `gh pr view <n>`.
  - Otherwise fetch the branch and diff it against the base with `git`.
- **No argument**: run `git diff <base>...HEAD` (base is usually `main`/`master`); if empty, `git diff HEAD`. Include uncommitted changes.

The diff is the only review scope. When you need surrounding context (a type/schema, a caller, an existing convention), open the relevant files in the checkout — don't guess.

## Step 2 — Check against these general failure modes

Go through the diff hunk by hunk. For each change ask: *"what input, state, or timing makes this wrong?"* These categories apply to any codebase:

**Correctness**
- Reversed or wrong conditions, off-by-one, wrong operator.
- Values used before they're ready — missing `await`/async handling, uninitialized or null/undefined values dereferenced.
- Wrong variable or wrong source object used (copy-paste bugs); a field read from the wrong place.
- Unhandled or silently swallowed errors; assuming a value exists in an error/edge path.

**Data & contracts**
- The shape a producer returns must match what the consumer expects (API response vs. UI, function return vs. caller).
- Two code paths that must stay in sync but were changed in only one (e.g. a filter used for listing vs. the matching count/total).
- Dropped, renamed, or reordered fields between layers.

**Input handling**
- Missing validation on external input (IDs, query params, request bodies, user text) and missing error/failure responses.
- Unbounded or untrusted values used directly.

**Removed / changed behavior**
- For each deleted or replaced line, name the guard, validation, or behavior it enforced and confirm it's re-established somewhere.

**Cross-file impact**
- A changed function signature, return shape, or new precondition that breaks existing callers.

**Wrong-file / misplaced code**
- A file whose contents don't match its location or purpose (a copy-paste of another module: wrong name, wrong target, wrong heading/route).

**Quality (report as minor unless it causes a bug)**
- Duplicated logic that should be shared; dead code; needless complexity.
- Repeated or wasteful work (redundant fetches/queries, work in a hot path).
- Inconsistency with existing conventions in the same project (naming, error handling, types) — check a sibling file to confirm the convention.

## Step 3 — Verify before reporting

Only report a finding you can back with a concrete failure — the specific input or state, and the resulting wrong output or crash. If a claim depends on a type, schema, or existing convention, open the file and confirm it. Drop anything you can't stand behind. Report the few issues a reviewer would actually act on; correctness bugs rank above quality/style. Prefer precision over volume.

## Step 4 — Report in this format

Bug findings first (🔴 Must fix), then 🟡 Minor. Each finding: file path, a one-line problem, a short plain explanation, and a directive fix (a corrected snippet when it helps, otherwise a one-sentence instruction). End with a checklist, and note any merge conflict. No opening greeting, no closing encouragement.

```
# Code Review — PR #<n> (<title>)

Findings sorted from most important to minor.

## 🔴 Must fix

### 1. <one-line problem>
📁 `path/to/file`

<1–2 sentence plain explanation of what's wrong and the effect>
✅ Fix: <corrected snippet or one-sentence instruction>

## 🟡 Minor (optional)
### N. <problem> — 📁 `path` — <fix in a sentence>

## ✅ Checklist
- [ ] #1 — <short reminder>
- [ ] Resolve merge conflict with base branch (if any)
```

Match code snippets to the language of the file under review. If nothing needs fixing, say so plainly and list what you checked.

## Step 5 — Offer to act (do not act automatically)

After presenting, ask whether to **post the review as a PR comment** or **apply/push the fixes**. Only do either when the user confirms.
