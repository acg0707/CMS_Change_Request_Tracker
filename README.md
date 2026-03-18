# CMS Change Request Tracker

A role-based **CMS Change Request Tracker** for managed service providers (MSPs) that maintain and update client websites. Client stakeholders submit structured website/content change requests as tickets; your support team triages, collaborates in-thread, and tracks status through completion.

This repository includes a demo data model and UI that uses a **fictional clinic** context. Any sample clinics, users, websites, or URLs referenced in docs or seed examples are **fictional**.

## The problem

MSPs often receive website requests through email/IM, which makes it hard to:

- Maintain a single source of truth for what was requested and when
- Track status and SLA expectations across many client sites
- Keep client-visible communication separate from internal notes
- Centralize files/attachments related to a request

## Who it’s for

- **MSPs / web ops teams** managing multiple client websites
- **Client stakeholders** (clinic managers / marketing coordinators / office managers) who need a simple “submit + track” workflow

## What it does (current MVP)

- **Ticketing**: create and track change requests with page + issue categorization and freeform details
- **Role-based portals**:
  - **Clinic portal**: create tickets, view ticket status, add comments, upload attachments, request follow-up on resolved tickets
  - **Internal portal**: triage across all clients, filter/sort lists, update ticket status, assign ownership, write internal-only comments
- **Comments with visibility**: clinic-visible vs internal-only notes
- **Attachments**: private storage + signed URL viewing
- **Notifications**: in-app notifications for key events (ticket created, status changes, comments, follow-up)
- **Analytics (lightweight)**: basic ticket counts by status

## User roles

- **clinic**: can access only their clinic’s tickets/attachments and clinic-visible comments
- **internal**: can access all tickets/attachments/comments and can post internal-only comments

## Tech stack

- **Next.js** (App Router)
- **Supabase**: Auth + Postgres + Storage (with RLS)
- **Tailwind CSS**

## Architecture (high level)

- **App**: Next.js server components for data fetching + client components for interactive UI
- **Auth + authorization**: Supabase Auth + Postgres row-level security (RLS)
- **Privileged writes**: certain actions (e.g. status changes) are performed via API routes using a Supabase **service role** key
- **Attachments**: stored in a private bucket; the UI uses **signed URLs** for viewing/downloading

## Setup

### Prerequisites

- Node.js 18+
- A Supabase project

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Notes:

- **Do not expose** `SUPABASE_SERVICE_ROLE_KEY` to the browser. It is used only by server code/API routes.
- `.env.local` is intentionally gitignored.

### 3) Apply database migrations

Run the SQL files in `supabase/migrations/` (001–006) against your Supabase project (in order). These set up:

- Tables for tickets, comments, attachments, notifications, clinics, profiles
- RLS policies and helper functions
- Storage bucket + policies for attachments

### 4) Seed minimal data

Create:

- At least one **clinic** row
- One **clinic user** and one **internal user** in Supabase Auth
- Matching **profiles** rows that set `role` to `clinic` or `internal` (and connect the clinic user to `clinic_id`)

`SPEC.md` documents the current routes, roles, and flows.

### 5) Run locally

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Project structure

- `app/`: routes (pages + API routes)
- `components/`: UI components
- `lib/`: Supabase clients, auth helpers, shared utilities
- `supabase/migrations/`: schema, functions, RLS, storage policies

## Docs

- `SPEC.md`: current MVP behavior (implemented features only)
- `CHANGELOG.md`: notable milestones and changes

## License

Add your preferred open-source license for public publishing (e.g. MIT, Apache-2.0) or keep as “All rights reserved” if you’re not open-sourcing the code.
