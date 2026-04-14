---
name: prd-generator
description: Generates a structured feature doc (PRD) for the CMS-CRT project. Use when the user describes a new feature idea and wants to create a feature doc in docs/features/. Interviews the user before writing anything.
---

# PRD Generator — Feature Doc Agent

The user wants to create a feature doc for the CMS Change Request Tracker (CMS-CRT).

Their feature idea: $ARGUMENTS

---

## Phase 1 — Read context files FIRST (do not skip)

Before doing anything else, read the following files silently:

1. `PRD.md` — to find the highest existing F-XX ID so you can suggest the next one
2. `docs/features/_TEMPLATE.md` — this is the exact format your output must follow
3. `SPEC.md` — to understand currently shipped behavior and constraints you must reference
4. All files in `ADR/` — to identify which architectural decisions are relevant to this feature

Do not output anything yet.

---

## Phase 2 — Interview the user (STOP here and wait)

After reading the files above, ask the user the following 5 questions in a single message. Do not generate the feature doc yet. Wait for their answers before proceeding.

Ask exactly these questions (adapt wording slightly if the feature idea makes some answers obvious, but always ask all 5):

1. **Who does this affect?** Which user role(s) does this feature touch — clinic users, internal users, or both? What specific pain or gap does it solve for them?

2. **What does "done" look like?** What are 2–4 concrete things a QA tester should be able to verify when this is complete?

3. **What's explicitly out of scope?** What related things should this feature NOT do — either now or ever?

4. **Are there any constraints I should know about?** Any specific SPEC.md behaviors this must not break, ADR patterns it must follow, or technical limitations to keep in mind?

5. **Priority and urgency?** Is this High / Medium / Low priority, and is there any timing pressure or dependency on another feature?

Wait for the user's answers. Do not proceed to Phase 3 until they respond.

---

## Phase 3 — Generate and write the feature doc

Once the user has answered your questions, do the following:

### 3a. Determine the feature ID and filename

- Look at the highest F-XX ID in `PRD.md`'s Feature Index table
- The new feature gets the next ID (e.g. if F-01 exists, suggest F-02)
- Derive a short kebab-case slug from the feature name (e.g. `mobile-layout`, `bulk-status-update`)
- Target filename: `docs/features/F-XX-feature-slug.md`

### 3b. Populate the feature doc

Fill in every section of `_TEMPLATE.md` using the user's answers and your context from Phase 1. Follow these rules per section:

**Header table**: Set ID, Status to `⚪ Backlog`, Priority from user's answer, Created and Last updated to today's date (YYYY-MM-DD format).

**Goal**: One tight sentence. What does this accomplish?

**Problem**: What is broken or painful today without this feature? Be specific to CMS-CRT's context — reference actual roles, pages, or flows from SPEC.md where relevant.

**Users Affected**: Separate bullets for clinic and internal. If one is unaffected, say so explicitly.

**User Stories**: Write 2–4 stories in `As a [role], I can [action] so that [outcome]` format. Use `clinic` and `internal` as role names (not generic "user").

**Acceptance Criteria**: Write 3–6 checkbox items that directly match what the user described as "done". Each criterion must be specific enough that a QA tester can pass or fail it without ambiguity.

**Out of Scope**: Use the user's answer. Add 1–2 items of your own if there are obvious adjacent things that should be explicitly excluded given the feature shape.

**Design Notes**: Leave the placeholder text. Do not invent mockup details.

**Claude Code Implementation Notes**: This is the most important section. Write it as if it will be pasted directly into a Claude Code session. Include:
- **Approach**: A concise description of the implementation strategy (what files/components to touch, what the data flow looks like)
- **Key constraints**: Pull *specific* items from SPEC.md and name *specific* ADRs that apply. Do not write generic boilerplate. Example: "Per ADR-001, status changes must use the service role API route — do not allow clinic-side direct updates." Reference actual route names, table names, and RLS patterns from SPEC.md.
- **Suggested implementation order**: 3–5 numbered steps, ordered so the app stays runnable at each step (per CLAUDE.md)

**Changelog**: One row: today's date + "Feature doc created".

### 3c. Write the file to disk

Once the doc is fully populated, write it to `docs/features/F-XX-feature-slug.md`.

### 3d. Update PRD.md

Add a new row to the Feature Index table in `PRD.md`:

```
| F-XX | Feature Name | ⚪ Backlog | [Priority] | [docs/features/F-XX-feature-slug.md](docs/features/F-XX-feature-slug.md) |
```

Match the existing table format exactly.

---

## Phase 4 — Confirm and summarize

After writing both files, tell the user:

- ✅ File created: `docs/features/F-XX-feature-slug.md`
- ✅ PRD.md updated: F-XX row added to Feature Index
- 📋 Remind them to add the feature to `ROADMAP.md` in the appropriate priority position (do not touch ROADMAP.md — that's the user's call)
- 💬 Ask if anything in the feature doc needs adjusting before they start building

---

## Rules

- Never write the feature doc before the user has answered the Phase 2 questions.
- Never invent behavior that contradicts SPEC.md.
- Never modify SPEC.md — it is only updated after a feature ships.
- Never expose or reference SUPABASE_SERVICE_ROLE_KEY.
- Keep changes to existing files minimal — only add the new PRD.md row, do not reformat the file.
- If the user's feature idea is ambiguous or could conflict with shipped SPEC.md behavior, flag it in Phase 2 rather than assuming.