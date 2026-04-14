# CMS Change Request Tracker — Roadmap

> **Role of this file**: Prioritized build order and rationale. This is for you (the PM) to read before each development session — it answers "what are we building next and why that order?"
> Feature details live in `docs/features/`. Current shipped behavior is in `SPEC.md`.

---

## Current Version: MVP 0.1.0

Shipped March 2026. See `CHANGELOG.md` for what's in it.

---

## Active — Building Now

### F-01 · Mobile-Friendly Layout
**Why now**: Clinic users are the primary client-facing audience. Checking ticket status and reading comments from a phone is a realistic use pattern. The current desktop-only layout creates friction for any real-world client adoption.
**Why before other features**: No new backend work required — purely layout. Low risk, high visibility improvement. Also a good first feature to run the full PRD → Figma → Claude Code workflow through before tackling more complex features.
**Doc**: [docs/features/F-01-mobile-layout.md](docs/features/F-01-mobile-layout.md)

---

## Up Next — Planned (not yet started)

> Add features here once F-01 is in development or done. Define each one in `docs/features/` before moving it to Active.

| Priority | Feature idea | Why it matters | Notes |
|----------|-------------|----------------|-------|
| — | *(Your next feature)* | | |
| — | *(Your next feature)* | | |

---

## Backlog — Considering (not prioritized yet)

> Ideas that are worth tracking but not yet committed to. No docs needed until they move to Planned.

- Email notifications (clinic gets email when status changes)
- Multi-user clinic accounts (multiple logins per clinic)
- Bulk ticket actions for internal users
- Better analytics / reporting dashboard
- *(Add ideas here as they come up)*

---

## Completed

| Version | Feature | Shipped |
|---------|---------|---------|
| 0.1.0 | Full MVP (ticketing, comments, attachments, notifications, analytics) | 2026-03-18 |

---

## How to use this file

- **Before a dev session**: read Active to confirm you're working on the right thing.
- **When priorities shift**: update the Up Next order and note the reason — future you will want to know why.
- **When a feature ships**: move it to Completed, update its status in `PRD.md`, update `SPEC.md`, and move its doc to `docs/features/archived/`.
- **When a new idea comes up**: add it to Backlog first. Resist moving it to Planned until F-01 is done or nearly done.
