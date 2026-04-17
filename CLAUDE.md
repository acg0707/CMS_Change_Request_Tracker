# Contributing notes (Claude Code / AI-assisted workflow)

This file is optional guidance for contributors who use Claude Code or other AI-assisted editors on this repo. It is written to be safe for a public repository.

## Source of truth

- Follow `SPEC.md`. Don’t introduce new roles, tables, or product behavior unless explicitly requested.

## Workflow

- Keep changes small and incremental.
- Prefer editing one area at a time and keeping the app in a runnable state.
- Validate changes with `npm run lint` (and `npm run dev` when doing UI work).

## Code standards

- Keep code simple and readable.
- Avoid new dependencies unless necessary.
- Centralize Supabase client setup under `lib/`.
- Extract shared UI into components when duplication is obvious and safe to reduce.

## Debugging and safety

- Don’t add debug-only telemetry, localhost logging, or secret printing.
- Assume RLS is enforcing permissions; the frontend should not attempt to bypass it.

## Auth rules (server-side)

- Never use `supabase.auth.getSession()` in server-side code (API routes, Server Components, middleware). It only validates the JWT locally and can be bypassed with a forged or replayed token.
- Always use `supabase.auth.getUser()` — or the `getAuthUser()` helper from `lib/auth.ts` — to validate identity server-side. It calls the Supabase Auth server on every request.
- Destructure as `const { data: { user } } = await supabase.auth.getUser()` and guard with `if (!user)` for the unauthorized case.
- Do not change the service role key pattern in API routes (see ADR-001). Only change session validation calls.
- See ADR-004 for the full rationale and rules.
