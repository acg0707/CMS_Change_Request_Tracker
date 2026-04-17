# CMS Change Request Tracker — Spec (Current MVP)

This spec documents the **currently implemented** behavior of the CMS Change Request Tracker (an MSP-focused change request ticketing tool). It intentionally avoids future-looking ideas and only describes what exists in the repo today.

The UI and example data model may reference a **fictional clinic** context for demo purposes.

## Problem and Users

- **Problem**: Client stakeholders often email/IM website requests to the MSP support team. This is hard to track, prioritize, and audit across many client sites.
- **Solution**: A structured ticket system tied to client websites and pages. Clients submit tickets; the support team triages, updates status, and collaborates via comments/attachments.
- **Users**:
  - **Clinic**: a client stakeholder for a single client account. Can create and track tickets, comment, and upload attachments.
  - **Internal**: MSP support/ops team managing multiple client accounts. Can triage all tickets, filter/sort, update status, assign ownership, and add internal-only notes.

## Roles and Access

| Role     | Access |
|----------|--------|
| **clinic** | Only their clinic's tickets and attachments; only clinic-visible comments |
| **internal** | All tickets, all attachments, all comments; can write internal-only comments |

- RLS enforces access. The UI does not attempt to bypass it.
- Clinic users cannot update ticket status directly; status changes are performed by internal users or via server-side service-role routes where appropriate.
- All server-side identity checks use `supabase.auth.getUser()`, which validates the token against the Supabase Auth server on every call. `getSession()` is never used server-side (see ADR-004).
- `middleware.ts` runs on every request to refresh the session cookie before it expires and redirects unauthenticated users to `/login`.

## Routes (Current)

| Route | Purpose | Role |
|-------|---------|------|
| `/login` | Email/password login | Anonymous |
| `/` | Redirect to `/clinic/tickets` or `/internal/tickets` by role | Both |
| `/clinic/tickets` | Clinic ticket list | clinic |
| `/clinic/tickets/new` | Create ticket (form + preview) | clinic |
| `/clinic/tickets/[id]` | Clinic ticket detail; comments; attachments; reopen when Resolved | clinic |
| `/clinic/profile` | Clinic profile (name, position, clinic info, address/contact) | clinic |
| `/clinic/notifications` | Notifications for clinic | clinic |
| `/internal/tickets` | Internal ticket list with filters | internal |
| `/internal/tickets/[id]` | Internal ticket detail; status update; comments; attachments; Open Page | internal |
| `/internal/clinics` | Clinic list with search and state filter | internal |
| `/internal/clinics/[clinic_id]` | Clinic detail + recent tickets | internal |
| `/internal/notifications` | Notifications for internal | internal |
| `/internal/analytics` | Bar chart of ticket counts by status | internal |

## Role Guards

- Not logged in → redirect to `/login`
- `role=clinic` on `/internal/*` → redirect to `/clinic/tickets`
- `role=internal` on `/clinic/*` → redirect to `/internal/tickets`

## Ticket Schema (Fields Used)

- `ticket_id`, `clinic_id`, `created_by_user_id`, `page`, `issue`, `description`, `page_url`, `status`, `assigned_to`, `created_at`, `updated_at`
- `page`: homepage | team | services | about | banner | other (create form: homepage, team, services, banner, other; internal filter also supports `about` for legacy tickets)
- `status`: Pending | In progress | Needs dev change | Client review | Follow up needed | Resolved

## Status Values and Triggers

| Status | Trigger |
|--------|---------|
| Pending | Default when ticket is created |
| In progress | Internal sets via status dropdown |
| Needs dev change | Internal sets via status dropdown |
| Client review | Internal sets via status dropdown |
| Follow up needed | Internal sets via status dropdown; or clinic reopens a Resolved ticket |
| Resolved | Internal sets via status dropdown |

**Reopen flow**: Clinic can reopen a Resolved ticket via "Request follow-up" button. Calls `POST /api/tickets/[id]/reopen`. Server uses service role to: (1) insert optional clinic_visible comment, (2) set `status` to "Follow up needed". RLS prevents clinic from updating tickets directly.

## Attachments Flow

- **Bucket**: Private `attachments` bucket
- **Path**: `<ticket_id>/<timestamp>-<safe_filename>` (unique per upload)
- **Upload**: Client-side using browser Supabase client and authenticated session (required for storage RLS)
- **Flow**: (1) Create ticket; (2) Upload files to storage path; (3) Insert `attachments` rows with `file_url` = storage path, `file_name` = original name
- **Display**: Signed URLs generated on detail page for view/download
- **Retry**: If upload fails on create, ticket exists; user is redirected with `?upload_failed=1`. Retry upload UI on ticket detail page allows re-uploading.

## Preview Behavior

- `clinics.base_url` is stored in the DB and fetched via `profiles.clinic_id` on the create page.
- **Create page**: Right-side iframe preview of `base_url` (no path input in UI); fallback "Open in new tab" if iframe is blocked.
- **Internal ticket detail**: "Open Page" button opens `page_url` in a new tab.
- Base URL and path inputs are not shown in the create form; `page_url` is computed internally (currently base_url).

## Form Rules (Create Ticket)

### Page Dropdown

- homepage, team, services, banner, other (no "about" in create form; internal filter includes "about" for legacy tickets)

### Page → Issue Mapping

- **homepage**: hero_text, hero_image, hours_block, contact_block, rtbs, other
- **team**: team_text, add_staff, edit_staff_bio, edit_staff_headshot, remove_staff, other
- **services**: services_text, add_service, remove_service, edit_service, other
- **banner**: add_banner, edit_banner, remove_banner, other
- **other**: other only

### Issue Labels (Display)

- See `lib/constants.ts` for full mapping (e.g. Hero Text, Hours of Operation, Add Staff, etc.)

## Profiles and Clinics (Schema Additions)

- **profiles**: `full_name`, `position` (optional; for future multi-user clinics)
- **clinics**: `address_line1`, `city`, `state`, `zip`, `phone`, `public_email` (optional contact fields)
- Profile page shows full name, position, clinic name, and clinic address/contact when present.

## Notifications

- In-app only (no email)
- Created on: ticket created (→ internal), status changed (→ clinic), comment added (→ other side; internal-only comments do not notify clinic), reopen (→ internal)
- Pages: `/clinic/notifications`, `/internal/notifications`
- Mark-all-read via `PATCH /api/notifications`

## Known Constraints

- Clinic cannot update ticket status directly; RLS restricts updates to internal. Reopen uses `POST /api/tickets/[id]/reopen` with service role.
- Storage upload requires authenticated session (RLS policy checks `can_access_ticket`); uploads are done from the client with the browser Supabase client.
- Date formatting uses UTC fixed format (`lib/date.ts`) to avoid hydration mismatches between server and client.
- Server-side code must never use `supabase.auth.getSession()` — use `supabase.auth.getUser()` or the `getAuthUser()` helper from `lib/auth.ts` (see ADR-004).

## Non-goals

- Auto-approve timer
- PE approval layer
- Complex section mapping
- Screenshot capture tool (clinic uploads files manually)
