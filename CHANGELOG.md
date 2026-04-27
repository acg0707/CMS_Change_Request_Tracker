# Changelog

All notable changes to the CMS Change Request Tracker will be documented in this file.

## [Unreleased]

### Fixed

- **I-02** — Clinic notifications query now filters by `recipient_clinic_id`, preventing notifications for other clinics from appearing in a clinic user's feed
- **I-03** — Clinic ticket detail comments query now filters by `clinic_visible = true`, preventing internal-only comments from leaking to the clinic view
- **I-04** — Removed duplicate `.order()` call in the internal tickets query that was silently overriding the intended sort
- **I-05** — Status update and assignee change on internal ticket detail now surfaces server errors to the user instead of silently failing

### Changed

- **I-06** — Replaced hardcoded `#157145` inline style with the `bg-brand` Tailwind alias; brand color is now defined in one place
- **I-10** — Refactored `TicketTable` from a duplicated two-table frozen-header pattern to a single table with `position: sticky` on `thead`
- **I-14** — Centralized chart hex colors into `STATUS_HEX_COLORS` in `lib/constants.ts`; chart components now import directly instead of deriving colors by string-matching Tailwind class names
- Documentation updates for public GitHub publishing (MSP positioning, fictional demo context, clarified setup and architecture)

### Removed

- **I-07** — Removed dead `/api/attachments` route; attachment upload protection is enforced entirely by storage RLS (`can_access_ticket` policy)
- **I-09** — Removed unreachable `else` branch in `getTicketAnalytics` (dead code from a prior refactor)
- **I-11** — Removed always-identical conditional in `PreviewPanel.containerClasses`; replaced with a direct constant string
- **I-12** — Removed unnecessary `'use client'` directive from `KPIStatCard`; component now renders as a server component
- **I-13** — Removed `created_by_user_id` from the ticket creation POST body; the server always uses the verified session identity and the field was ignored

### Performance

- **I-08** — Parallelized `clinics` and `internalProfiles` Supabase queries on the internal tickets page with `Promise.all`, eliminating sequential round-trips

## [0.1.0] - 2026-03-18

Initial MVP suitable for demo / internal evaluation.

### Added

- Supabase client (browser + server), auth helpers (getSession, getUserWithProfile, requireAuth, requireClinic, requireInternal)
- Login page with email/password
- Role-based redirect: `/` → `/clinic/tickets` or `/internal/tickets` by profile role
- Clinic and internal layout guards enforcing role access
- Clinic ticket list page (`/clinic/tickets`)
- Clinic ticket detail page (`/clinic/tickets/[id]`) with page, issue, description, page_url, status
- Create ticket form with Page/Issue dropdowns (filtered by mapping), preview iframe
- Comments: clinic sees clinic-visible; internal sees all with visibility badge; internal can add with visibility toggle
- Attachments: file upload on ticket create; signed URLs for view/download on clinic and internal detail
- Internal filters: page, clinic, status, assignee
- Internal status update dropdown on ticket detail
- Reopen for follow-up: clinic can reopen Resolved tickets via "Request follow-up" button (uses service role API route), optionally with a comment
- Retry upload: if upload fails on ticket create, redirect with `?upload_failed=1`; retry upload section on ticket detail page
- Logout button on clinic and internal layouts
- `profiles.full_name` and `profiles.position` to support future multi-user clinics
- Clinic contact fields (address, phone, public_email, etc.) on profile page
- In-app notifications for clinic and internal users (ticket created, status changed, comment added, follow-up requested)
- Internal Clinics list with search and state filter; clinic detail with recent tickets
- Internal Analytics bar chart of ticket counts by status

### Changed

- UI redesign: top bar + collapsible sidebar, ticket views (default Open), sortable table, admin filters popover, drag-and-drop attachments
- Upload: switched to client-side upload with authenticated Supabase session (fixes storage RLS)
- Create ticket form: removed Base URL and path inputs from UI; page_url computed internally
- Page options: added "Other"; removed "About" from create form (internal filter still supports "about" for legacy tickets)
- Issue labels updated per UI/UX spec (Hero Text, Hours of Operation, Edit Staff Headshot, etc.)
- Global UI: white background, dark-blue sidebar, colored status chips

### Fixed

- Ticket creation only on explicit submit; prevent implicit submit on Enter; guard against double submit
- Reopen: status change now uses service role API route (clinic cannot update tickets via RLS)
- Hydration: date formatting uses UTC fixed format to avoid server/client mismatch
