# F-02 — Password Visibility Toggle

| Field | Value |
|-------|-------|
| **ID** | F-02 |
| **Status** | ⚪ Backlog |
| **Priority** | Low |
| **Created** | 2026-04-13 |
| **Last updated** | 2026-04-13 |

---

## Goal

Add a toggle button to the login page password field so users can reveal or hide their password while typing.

---

## Problem

The `/login` page's password field is a plain `type="password"` input with no way to reveal what has been typed. Users with long or complex passwords have no way to confirm their entry before submitting, which can lead to unnecessary failed login attempts and lockouts.

---

## Users Affected

- **Clinic users** — affected; they log in via `/login` and will benefit from being able to verify their password before submitting.
- **Internal users** — affected; they use the same `/login` route and face the same usability gap.

---

## User Stories

- As a clinic user, I can toggle password visibility on the login page so that I can confirm my password is correct before submitting.
- As an internal user, I can toggle password visibility on the login page so that I can verify a long or complex password without mistyping.

---

## Acceptance Criteria

> QA checklist — every item must pass before marking Done and updating SPEC.md.

- [ ] A toggle button appears flush to the right inside the password input field on the `/login` page.
- [ ] The icon is an eye-slash (eye-off) when the password is hidden, and a plain eye when the password is visible.
- [ ] Clicking the toggle switches the input between hidden (`type="password"`) and visible (`type="text"`) states.
- [ ] The password field always defaults to hidden on every page load — no stored or persisted toggle state.
- [ ] The icon color matches the "Password" label color (`text-gray-700`).
- [ ] The toggle button and icon render correctly and fit within the input on both mobile and desktop viewport sizes.
- [ ] Form submission via the "Sign in" button works correctly regardless of whether the password is currently visible or hidden.

---

## Out of Scope

- Persisting the visibility toggle state across page loads, sessions, or via cookies/localStorage.
- Applying a visibility toggle to any field other than the single password field on `/login`.
- Password strength indicators, hints, or any other password-related UI enhancement.
- A "confirm password" field — none exists in the current app.

---

## Design Notes

> Update once Figma mockups are created. Include frame sizes and links.

---

## Claude Code Implementation Notes

> Paste this section at the start of each Claude Code session for this feature.

**Approach:**
- This is a self-contained UI change in `app/login/page.tsx`. No new routes, API calls, or DB access are needed.
- Add a `showPassword` boolean state (initialized to `false`) to `LoginPage`.
- Wrap the existing password `<input>` in a `relative` container `<div>`.
- Add `pr-10` to the input's className to reserve space for the icon button.
- Place an absolutely-positioned `<button type="button">` on the right side of the container, containing an inline SVG eye or eye-off icon.
- Wire the input's `type` attribute to `showPassword ? 'text' : 'password'`.
- Wire the button's `onClick` to `() => setShowPassword(prev => !prev)`.

**Key constraints:**
- Per CLAUDE.md, do not add a new dependency for the icon. Use inline SVG (standard eye / eye-off paths) directly in the JSX.
- The button **must** be `type="button"` — omitting this defaults to `type="submit"` and will trigger form submission on click.
- Icon color must match the "Password" label: `text-gray-700` / `stroke-current` with the label's color class.
- Default state must be `false` (password hidden). Do not read from localStorage, sessionStorage, or any cookie.
- Preserve the existing `autoComplete="current-password"` attribute on the password input — do not remove it.
- Per ADR-003: this is a pure UI change; no data fetching is involved and RLS is not a consideration.
- Per ADR-001 and ADR-002: no API routes or storage access are involved.
- Per SPEC.md Known Constraints: the login form calls `supabase.auth.signInWithPassword` — the toggle must not interfere with the `password` state value or the form's `onSubmit` handler.

**Suggested implementation order:**
1. Add `const [showPassword, setShowPassword] = useState(false);` alongside the existing state in `LoginPage`.
2. Wrap the password `<input>` in a `<div className="relative">`.
3. Add `pr-10` to the input's `className` so the text does not overlap the icon.
4. Add the toggle `<button type="button">` with absolute positioning and inline SVG (eye / eye-off), colored `text-gray-700`.
5. Set the input's `type` attribute to `showPassword ? 'text' : 'password'` and wire the button's `onClick` to toggle the state.

---

## Changelog

| Date | Update |
|------|--------|
| 2026-04-13 | Feature doc created |
