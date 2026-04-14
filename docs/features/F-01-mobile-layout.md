# F-01 — Mobile-Friendly Layout

| Field | Value |
|-------|-------|
| **ID** | F-01 |
| **Status** | 🟡 Planned |
| **Priority** | High |
| **Created** | 2026-04-12 |
| **Last updated** | 2026-04-12 |

---

## Goal

Make the full CMS-CRT UI usable on mobile devices (phones and tablets) for both the `clinic` and `internal` portals without degrading the desktop experience.

---

## Problem

The current layout uses a fixed top bar and collapsible sidebar with data-dense tables and forms. On small screens:
- The sidebar either overlaps content or pushes it off-screen
- Ticket list tables overflow horizontally and become unreadable
- Forms (create ticket, comments, filters) are difficult to interact with on touch
- Clinic users in particular are likely to check ticket status from a phone

---

## Users Affected

- **Clinic users** — primary. Likely to check status and read comments on mobile.
- **Internal users** — secondary. May need to update ticket status or add a comment while away from desk.

---

## User Stories

**Clinic**
- As a clinic user on my phone, I can view my ticket list without horizontal scrolling.
- As a clinic user on my phone, I can tap into a ticket and read its details, status, and comments clearly.
- As a clinic user on my phone, I can add a comment and submit the form without the keyboard obscuring input fields.
- As a clinic user on my phone, I can navigate between sections (tickets, notifications, profile) via a mobile-friendly nav.

**Internal**
- As an internal user on a tablet, I can view the ticket list and apply filters without the UI breaking.
- As an internal user on my phone, I can open a ticket, read it, and update the status.
- As an internal user, my desktop experience is unchanged after this work.

---

## Acceptance Criteria

> This is the QA checklist. Every item must pass before this feature is marked Done and SPEC.md is updated.

**Layout & Navigation**
- [ ] On screens < 768px, the sidebar collapses and a bottom nav bar or hamburger menu replaces it
- [ ] No horizontal overflow or cut-off content on any page at 375px viewport width (iPhone SE baseline)
- [ ] Desktop layout (≥ 1024px) is visually unchanged

**Ticket List (both portals)**
- [ ] On mobile, the ticket table switches to a card/list layout or shows a prioritized column subset (status, page, date — hide assignee/ID)
- [ ] Each row/card is tappable and navigates to the ticket detail

**Ticket Detail**
- [ ] All ticket metadata, comments, and attachments are readable without horizontal scrolling
- [ ] Comment form input and submit button are accessible when the mobile keyboard is open
- [ ] Attachment upload works on mobile (drag-and-drop degrades gracefully; tap-to-upload works)

**Create Ticket Form**
- [ ] All form fields, dropdowns, and the submit button are usable on mobile
- [ ] The iframe preview is hidden on mobile and replaced by an "Open in browser" link

**Filters (Internal)**
- [ ] Filter popover/panel is accessible and closeable on mobile
- [ ] All filter inputs are usable on touch

**Notifications**
- [ ] Notification list is readable and mark-all-read works on mobile

**General**
- [ ] No Tailwind classes are overridden with inline styles to force desktop-only sizing
- [ ] Touch targets (buttons, links) are at least 44×44px

---

## Out of Scope

- Native mobile app or PWA wrapper
- Any new functionality — layout changes only
- Performance optimizations
- Dark mode

---

## Design Notes

> Update this section once Figma mockups are created.

**Screens to design in Figma:**
- Clinic ticket list (mobile, 390×844)
- Clinic ticket detail (mobile, 390×844)
- Internal ticket list (mobile, 390×844)
- Mobile nav pattern (bottom bar vs hamburger)

**Visual reference from current app:**
- Dark-blue sidebar (`#1e3a5f` approx)
- Status chips: colored badges per status value (see `SPEC.md` for status list)
- White content background

---

## Claude Code Implementation Notes

> Paste this section (plus the relevant SPEC.md sections) at the start of each Claude Code session for this feature.

**Approach:**
- Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) exclusively — no new CSS files or libraries
- Start with the clinic portal (fewer pages, simpler flows) and validate before touching internal
- Changes are layout-only — do not touch data fetching, API routes, RLS logic, or business logic
- Preserve all server component / data-fetching logic exactly as-is

**Key constraints:**
- The iframe on `/clinic/tickets/new` must be hidden on mobile with a fallback "Open in browser" link (iframes are unusable on small screens)
- Do not introduce any new npm packages
- Run `npm run lint` after each file to stay clean
- Keep the app runnable at each step — do not refactor multiple files in one pass

**Suggested implementation order:**
1. Shared layout components (top bar, sidebar → mobile nav)
2. Clinic ticket list → card layout on mobile
3. Clinic ticket detail → stacked layout, comment form
4. Create ticket form → hide iframe, stack fields
5. Internal ticket list → card layout, filter panel
6. Internal ticket detail
7. Notifications pages
8. Final pass: touch targets, overflow audit

---

## Changelog

| Date | Update |
|------|--------|
| 2026-04-12 | Feature doc created |
