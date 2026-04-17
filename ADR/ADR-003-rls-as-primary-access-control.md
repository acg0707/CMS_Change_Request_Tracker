# ADR-003 — RLS as Primary Access Control (No Frontend Bypass)

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-04-12 |
| **Affects** | All data fetching, all Supabase queries throughout the app |

---

## Context

The app has two roles with meaningfully different data access: `clinic` users can only see their own clinic's tickets, attachments, and clinic-visible comments; `internal` users can see everything. This access control could be enforced at two layers:

**Option A — Frontend-only enforcement**: Fetch all data, then filter in UI code based on the user's role.

**Option B — RLS enforcement at the database layer**: Postgres Row Level Security policies restrict what each user can query, insert, update, or delete. The frontend trusts the database to return only what the user is allowed to see.

---

## Decision

Use **Option B** — RLS is the authoritative access control layer. The frontend does not implement its own access filtering as a substitute for RLS.

---

## Rationale

- Frontend filtering is trivially bypassable (browser devtools, direct API calls).
- RLS policies are evaluated on every query regardless of how the request reaches the database.
- Supabase's RLS integrates with the user's JWT, making role-based and ownership-based policies straightforward to express.

---

## Consequences

- **Good**: Access control is enforced even if the frontend has a bug or omission.
- **Good**: New queries written by Claude Code or future contributors are automatically protected as long as RLS policies cover the table.
- **Constraint**: The frontend should never be written to assume it needs to "hide" data that RLS should be hiding. If a clinic user can query it, the RLS policy is wrong — fix the policy, don't paper over it in the UI.
- **Rule for future work**:
  - Never add a `WHERE clinic_id = X` filter in a frontend query as a substitute for an RLS policy.
  - When adding a new table, always define RLS policies before writing any queries against it.
  - When Claude Code suggests a frontend filter as a security measure, reject it and fix the RLS policy instead.
  - The service role key (used in API routes) bypasses RLS — those routes must implement their own authorization checks (see ADR-001).
  - RLS policies depend on a verified `user.id` from `supabase.auth.getUser()` — never `getSession()`, which validates locally only and can be bypassed (see ADR-004).
