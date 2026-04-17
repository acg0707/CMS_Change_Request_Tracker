# ADR-001 — Service Role Key for Privileged Writes

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-04-12 |
| **Affects** | `app/api/tickets/[id]/reopen/route.ts` and any future API routes requiring elevated DB access |

---

## Context

Clinic users (`role=clinic`) cannot update ticket status directly — RLS policies on the `tickets` table restrict direct updates to internal users. However, certain server-initiated actions (e.g. the reopen flow) need to write on behalf of a clinic user in a controlled way: set status to "Follow up needed" and optionally insert a clinic-visible comment.

Supabase's Row Level Security blocks these writes if performed with the anon key or the user's session token. The service role key bypasses RLS entirely and must be handled carefully.

---

## Decision

Privileged writes (any DB operation that requires bypassing RLS on behalf of a user) are performed **only inside Next.js API routes** using the Supabase service role client (`createClient` initialized with `SUPABASE_SERVICE_ROLE_KEY`).

The service role key is:
- Stored in `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`
- Used only in server-side code (`app/api/` routes)
- Never imported into or exposed to any client component or browser bundle
- Never logged or printed

---

## Consequences

- **Good**: Clinic users can trigger controlled status transitions (reopen) without being granted broad update permissions via RLS.
- **Good**: The attack surface for privilege escalation is limited to API routes, which can validate the user's session before acting.
- **Risk**: Any API route using the service role must manually validate that the requesting user is authorized — RLS won't protect it. This validation must always be implemented explicitly.
- **Rule for future work**: Any new API route using the service role key must call `supabase.auth.getUser()` (not `getSession()`) and include an explicit authorization guard before performing the privileged write. See ADR-004 for the required server-side auth pattern.
