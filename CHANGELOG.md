# Changelog

All notable changes to the CMS Change Request Tracker will be documented in this file.

## [Unreleased]

### Changed

- Documentation updates for public GitHub publishing (MSP positioning, fictional demo context, clarified setup and architecture).

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
