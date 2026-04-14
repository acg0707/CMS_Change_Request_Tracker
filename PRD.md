# CMS Change Request Tracker — PRD

> **Role of this file**: Product summary and feature index only.
> Full feature requirements live in `docs/features/`.
> For currently implemented behavior, see `SPEC.md`.
> For technical decisions, see `ADR/`.
> For build order and priorities, see `ROADMAP.md`.

---

## Product Summary

The CMS Change Request Tracker (CMS-CRT) is a role-based ticketing tool for MSPs managing website change requests from client stakeholders. Clients submit structured tickets; the internal team triages, collaborates, and tracks status through completion.

**Tech stack**: Next.js (App Router), Supabase (Auth + Postgres + RLS + Storage), Tailwind CSS
**Roles**: `clinic` (client stakeholder) and `internal` (MSP team)
**Current live state**: See `SPEC.md`

---

## Feature Index

| ID | Feature | Status | Priority | Doc |
|----|---------|--------|----------|-----|
| F-01 | Mobile-Friendly Layout | 🟡 Planned | High | [docs/features/F-01-mobile-layout.md](docs/features/F-01-mobile-layout.md) |
| F-02 | Password Visibility Toggle | ⚪ Backlog | Low | [docs/features/F-02-password-visibility-toggle.md](docs/features/F-02-password-visibility-toggle.md) |

**Status legend**:
⚪ Backlog → 🟡 Planned → 🔵 In Design → 🟠 In Development → ✅ Done → 🗄️ Archived

---

## How to add a new feature

1. Create `docs/features/F-XX-feature-name.md` using the template in `docs/features/_TEMPLATE.md`
2. Add a row to the Feature Index table above
3. Add the feature to `ROADMAP.md` in the appropriate priority position
4. When shipped: update `SPEC.md`, update status to ✅ Done, move doc to `docs/features/archived/`
