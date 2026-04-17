---
name: github-issue-creator
description: Creates GitHub Issues on the CMS-CRT repo (acg0707/CMS_Change_Request_Tracker) in a consistent I-XX format. Supports single issue mode (describe a problem) and bulk mode (paste an audit report). Always checks existing issues to continue I-XX numbering and ensures required labels exist before creating issues.
---

# GitHub Issue Creator

The user wants to create one or more GitHub Issues on the CMS-CRT repository.

Their input: $ARGUMENTS

---

## Repo

Owner: `acg0707`
Repo: `CMS_Change_Request_Tracker`

Use GitHub MCP tools for all operations. Fall back to `gh` CLI only if MCP tools fail.

---

## Phase 0 — Determine mode

Read the user's input and decide:

- **Single issue mode**: The user describes one specific problem, bug, or finding.
- **Bulk mode**: The user pastes an audit report, findings list, or multiple problems at once.

If unclear, ask: "Are you creating one issue or pasting an audit with multiple findings?"

---

## Phase 1 — Setup (always run first, silently)

Run both of these in parallel before doing anything else:

### 1a. Find the current highest I-XX number

List all open and closed issues on `acg0707/CMS_Change_Request_Tracker`. Scan all titles for the pattern `[I-XX]`. Find the highest XX number. The next issue starts at XX+1. If no issues exist, start at I-01.

### 1b. Check and create labels

Check which of the following labels exist on the repo. Create any that are missing with the specified colors:

| Label | Color |
|---|---|
| security | #d73a4a |
| spec-deviation | #e4823a |
| bug | #f5c518 |
| architecture | #6f42c1 |
| tech-debt | #c0c0c0 |
| performance | #0075ca |
| pre-F01 | #b60205 |
| backlog | #e6e6e6 |

Create missing labels silently. Do not report each one to the user — only mention it if creation fails.

---

## Phase 2 — Single issue mode

### 2a. Infer labels and draft the issue

From the user's description, infer:
- **Type label** (pick exactly one): `security` / `spec-deviation` / `bug` / `architecture` / `tech-debt` / `performance`
- **Priority label** (pick exactly one): `pre-F01` (urgent, must fix before feature work) or `backlog`

Draft the issue using this exact body format:

```
## Summary
One sentence describing the problem.

## File(s) affected
Exact file paths and line numbers (or "Unknown — needs investigation" if not determinable from the description).

## Why it matters
Why this is a problem — impact on security, correctness, or maintainability.

## Suggested fix
Specific, actionable fix description.

## Claude Code context
Relevant ADRs, SPEC.md sections, or constraints to include when fixing this in a Claude Code session.
```

Title format: `[I-XX] Short description`

### 2b. Confirm with the user

Show the user:
- Proposed title
- Proposed labels
- Full body

Ask: "Does this look right? Should I adjust any labels or wording before creating?"

Wait for confirmation. Do not create the issue until the user confirms.

### 2c. Create the issue

Once confirmed, create the issue via GitHub MCP. Then respond:

`Created #[GitHub issue number] [I-XX] [Title]`

---

## Phase 3 — Bulk mode

### 3a. Parse all findings

Read the entire audit report or findings list. Extract every distinct finding. For each one, determine:
- A short title (suitable for `[I-XX] Short description` format)
- Type label
- Priority label
- I-XX ID (continuing from Phase 1a)

### 3b. Show a confirmation table

Present a table of all proposed issues before creating anything:

| I-ID | Title | Type | Priority |
|---|---|---|---|
| I-03 | RLS bypass in service route | security | pre-F01 |
| I-04 | Status field not in SPEC | spec-deviation | backlog |
| ... | ... | ... | ... |

Ask: "Ready to create all [N] issues? Any changes before I proceed?"

Wait for confirmation.

### 3c. Create issues in sequence

Create each issue one at a time, in order. For each issue, use the same body format as single issue mode — infer the content from the corresponding audit finding.

Do not batch or parallelize creation — sequence matters for I-XX ordering.

### 3d. Return a summary table

After all issues are created:

| I-ID | GitHub # | Title | Labels |
|---|---|---|---|
| I-03 | #12 | RLS bypass in service route | security, pre-F01 |
| I-04 | #13 | Status field not in SPEC | spec-deviation, backlog |

---

## Issue body rules

- **Summary**: One sentence max. Direct and specific.
- **File(s) affected**: Always include file paths when known. Add line numbers if mentioned. If unknown, write "Unknown — needs investigation."
- **Why it matters**: Focus on real impact — security risk, data integrity, SPEC contradiction, or future maintainability.
- **Suggested fix**: Be actionable. Avoid vague advice like "refactor this." Say what specifically to change.
- **Claude Code context**: Reference SPEC.md sections, ADR numbers, or table names that are relevant. If you have access to those files in this repo, read them to fill this section accurately. Do not write generic boilerplate here.

---

## Label selection guide

| Finding type | Use this label |
|---|---|
| Auth bypass, exposed secrets, RLS violation, XSS, injection | `security` |
| UI or data behavior that contradicts SPEC.md | `spec-deviation` |
| Crash, incorrect output, broken flow | `bug` |
| Structural concern (wrong layer, wrong pattern, coupling) | `architecture` |
| Messy code, duplication, dead code — not breaking | `tech-debt` |
| Slow query, large bundle, unnecessary re-render | `performance` |

Priority:
- `pre-F01`: Security issues, SPEC contradictions that block correctness, bugs affecting production data
- `backlog`: Everything else

---

## Rules

- Never reuse an I-XX ID. Always check existing issues first.
- Never create issues without user confirmation (single mode: always confirm; bulk mode: confirm the table first).
- Never invent file paths or line numbers. Write "Unknown" if not provided.
- Never skip the Claude Code context section — infer it from repo docs if possible.
- Always create labels before issues. Never create an issue with a label that doesn't exist yet.
- If GitHub MCP fails on any operation, report the error and offer to fall back to `gh` CLI.
