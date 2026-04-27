# ADR-002 — Client-Side Storage Upload with Authenticated Session

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-04-12 |
| **Affects** | Attachment upload flow on `/clinic/tickets/new` and `/clinic/tickets/[id]` |

---

## Context

The app uses a private Supabase Storage bucket (`attachments`) for file uploads. Storage RLS policies restrict uploads to users who can access the relevant ticket (`can_access_ticket` helper function). Two approaches were considered:

**Option A — Server-side upload via API route**: The client sends the file to a Next.js API route, which uploads to Supabase Storage using the service role key.

**Option B — Client-side upload using the browser Supabase client**: The browser uploads directly to Supabase Storage using the user's authenticated session token, which satisfies the storage RLS policy.

---

## Decision

Use **Option B** — client-side upload with the authenticated browser Supabase client.

---

## Rationale

- Supabase Storage RLS policies evaluate the user's JWT. The service role key bypasses RLS (Option A would work but removes the RLS protection layer on storage).
- Direct-to-storage upload avoids routing large files through the Next.js server, reducing memory pressure and latency.
- The user's session is already available in the browser client; no additional auth plumbing is needed.

---

## Consequences

- **Good**: Storage RLS enforces access control on uploads without extra server logic.
- **Good**: Files are not buffered through the app server.
- **Constraint**: Uploads must be initiated from a client component (not a server component) because they require the browser's authenticated session.
- **Known edge case**: If the upload succeeds but the `attachments` row insert fails (or vice versa), the state can become inconsistent. The current mitigation is: if upload fails on ticket create, redirect with `?upload_failed=1` and offer retry on the ticket detail page.
- **Rule for future work**: Do not move file uploads to server-side API routes unless there is a specific reason. If you do, the storage RLS implications must be re-evaluated.

---

## Security note — RLS is the sole protection on the direct upload path

`app/api/attachments/route.ts` was created early in development as a server-side upload handler (Option A). When the implementation was switched to direct client uploads (Option B), the route was never cleaned up. It has been removed (2026-04-26).

With the API route gone, **storage bucket RLS and `attachments` table RLS are the only enforcement layer** ensuring a clinic user can only upload to their own tickets. The `can_access_ticket` RLS helper function on the `attachments` bucket covers this ownership check. Any future change to storage or table RLS policies must be audited against this guarantee.
