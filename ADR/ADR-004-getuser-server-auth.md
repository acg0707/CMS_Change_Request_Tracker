# ADR-004 — Use getUser() for All Server-Side Auth Validation

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-04-17 |
| **Affects** | lib/auth.ts, all API routes, middleware.ts |

---

## Context

All server-side auth checks previously used `supabase.auth.getSession()`, which validates the JWT signature **locally** using the cached session. A forged or replayed session cookie passes this check without any server-side verification. Every downstream role check (clinic vs. internal) and RLS policy evaluation is built on this identity — if the identity is unverified, the entire access control stack is compromised.

---

## Decision

Use **`supabase.auth.getUser()`** for all server-side identity validation. `getUser()` validates the token against the Supabase Auth server on every call, not just locally.

Additionally, `middleware.ts` must call `getUser()` on every request to refresh the session cookie before it expires, following the Supabase SSR docs template exactly.

---

## Rationale

- `getSession()` only verifies the JWT signature locally — it does not confirm the session is still valid with the Auth server.
- `getUser()` makes a network call to Supabase Auth on every invocation, ensuring tokens cannot be forged or replayed.
- All role-based guards (`requireClinic`, `requireInternal`) and RLS policies depend on a verified `user.id` — this fix makes that identity trustworthy.

---

## Consequences

- **Good**: Forged or replayed session tokens are rejected at the Auth server.
- **Good**: Session cookies are refreshed proactively on every request via middleware, preventing premature logout.
- **Constraint**: `getUser()` makes a network call on every server-side auth check — this is acceptable overhead for the security guarantee it provides.
- **Rule for future work**:
  - Never use `supabase.auth.getSession()` in server-side code (API routes, Server Components, middleware).
  - Always destructure as `data: { user }` and check `if (!user)` for the unauthorized case.
  - `getSession()` may still be used on the client side where local JWT validation is acceptable.
  - The exported `getAuthUser()` helper in `lib/auth.ts` is the canonical way to get the verified user in Server Components — use it instead of calling `supabase.auth.getUser()` directly.
