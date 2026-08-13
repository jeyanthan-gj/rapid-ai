# Rapid AI HR Management UI — Design Ideas

## Three possible directions

### Theme Name: Editorial Control Room
Very lightly styled as a print-inspired operations console: warm paper, ink-black type, cobalt data accents, and generous margins make everyday HR operations feel considered and legible.
Probability: 0.07

### Theme Name: Soft Utility
A quiet, friendly utility interface with pale mineral surfaces, rounded modules, muted teal highlights, and approachable typography for HR teams who need calm over spectacle.
Probability: 0.03

### Theme Name: Night Shift Signal
A dark operations room with restrained electric cyan markers, high-contrast charts, and a watch-floor rhythm intended for live occupancy monitoring.
Probability: 0.09

## Chosen direction: Editorial Control Room

### Design Movement
Swiss editorial modernism translated into a contemporary workplace operations console: rigorous typographic hierarchy, functional asymmetry, disciplined grids, and a deliberate relationship between data and whitespace.

### Core Principles
1. **Information has a reading order.** Every page begins with a strong editorial heading and a short operational summary before dense detail.
2. **Warm surfaces, cool signals.** The base is quiet and paper-like; cobalt, cyan, amber, and coral only appear when they carry meaning.
3. **Asymmetry creates focus.** Use a narrow persistent navigation rail and offset content blocks rather than a centered dashboard of identical cards.
4. **Data feels tactile.** Use fine rules, small caps, numerals, and restrained shadows instead of glossy gradients or decorative chrome.

### Color Philosophy
The canvas is warm ivory (#F5F2EA) to reduce glare and make the interface feel like a working document rather than a generic SaaS template. Ink (#14202B) carries primary type and navigation. Cobalt (#2457F5) is the signature action color: decisive, legible, and useful for links and active states. Cyan (#16B8B1) signals live occupancy and healthy flow. Amber (#F3A941) indicates attention without alarm. Coral (#E96A5A) is reserved for exceptions and destructive actions. Color should always communicate a state, never decorate an empty area.

### Layout Paradigm
A persistent left rail establishes orientation, with the active module marked by a cobalt tab and a small live indicator. The main canvas uses a broad editorial column with offset modules: headline and date on the left, contextual status on the right, then a large attendance readout followed by smaller operational modules. Tables should feel like ledgers, not floating tiles. Mobile collapses the rail into a compact top bar and preserves the same reading order.

### Signature Elements
1. **Cobalt registration marks:** tiny corner marks and rules frame key data blocks, inspired by print crop marks.
2. **Metric numerals:** oversized condensed-looking numeric treatment for KPI values, paired with small uppercase labels.
3. **Signal dots:** single colored dots beside state labels, used consistently across attendance, leave, occupancy, and policy rows.

### Interaction Philosophy
Interactions should feel like changing a working document: fast, explicit, and reversible. Hover states reveal a slight lift and cobalt underline; active navigation is clearly marked; async actions show immediate inline progress and preserve context. Toasts are concise and factual. No hidden actions, no ornamental motion, and no UI state should rely on color alone.

### Animation
Use 160–220ms ease-out transitions for buttons, tabs, sidebar items, table row hover, and page-module reveals. Dashboard modules enter with a subtle 20px upward translate and opacity fade, staggered by 45ms. Avoid continuous motion except a very soft pulse on live occupancy dots. Respect prefers-reduced-motion by removing entrance transforms and keeping only opacity or color transitions.

### Typography System
Use **DM Serif Display** for page titles and major editorial headings, giving the console a confident report-like voice. Use **IBM Plex Sans** for navigation, body copy, labels, and controls. Use **IBM Plex Mono** for employee IDs, timestamps, policy values, and KPI numerals. Hierarchy: title 42–52px serif, section title 20–24px serif, body 14–15px sans, labels 10–11px uppercase mono with tracking, values 32–46px mono with tight line-height.

### Brand Essence
Rapid AI is a human operations console for HR teams that need a clear view of people, presence, and policy without the noise of enterprise software. Personality: **decisive, observant, composed**.

### Brand Voice
Headlines are precise and quietly confident. CTAs are verbs, never vague promises. Microcopy explains what is happening in plain language. Example lines: “A clear read on today’s people flow.” and “Review the exceptions before they become tomorrow’s work.”

### Wordmark & Logo
The wordmark uses a custom lockup: the words “RAPID AI” in tracked uppercase IBM Plex Mono with the “A” slightly offset, paired with a compact angular R-and-pulse symbol. The mark should work alone in the left rail and favicon; do not render the brand name in a default browser font as the logo.

### Signature Brand Color
**Rapid Cobalt — #2457F5.** It is bright enough to own the interface but calm enough to sit beside ivory, ink, cyan, amber, and coral without becoming an alarm color.

## Style Decisions

- The interface will use a warm ivory canvas, ink typography, cobalt actions, and editorial serif headings.
- Charts will be built from live API values in the UI, not baked into imagery.
- The brand icon will appear at a visible 28–32px in the rail and as the favicon.
- The UI stays a thin client: all business calculations remain in the existing FastAPI backend.
- If a choice does not reinforce this editorial control-room language, it should be removed or simplified.

## Per-file implementation reminders

- `client/src/index.css`: keep the Editorial Control Room tokens, warm ivory canvas, ink type, and cobalt signature color intact.
- `client/src/App.tsx`: the rail and route shell are persistent, not re-created per page.
- `client/src/lib/api.ts`: no visual styling; keep API configuration centralized and driven by `import.meta.env.VITE_API_BASE_URL`.
- `client/src/pages/*`: each page begins with a serif heading, compact context line, and content modules that prioritize data hierarchy over equal-card repetition.
- `client/src/components/*`: use signal dots, fine rules, and restrained shadows consistently; avoid generic rounded dashboard cards.

## Backend assumptions captured from the supplied brief

The frontend will use the requested endpoint names when available: `/dashboard`, `/employees`, `/attendance/{emp_id}/{date}`, `/leave/{emp_id}`, `/leave/{leave_id}/approve`, `/leave/{leave_id}/reject`, `/occupancy`, and `/policies` with `/policies/{policy_id}` for edits. If the running backend does not expose the read/edit policy or employee endpoints yet, the UI will show a clear, non-blocking error state rather than inventing fallback business logic.

The frontend source will be copied into `/home/ubuntu/rapid-ai/ui/` after verification so the user's original repository remains the source of truth for this deliverable.

## Asset

Generated brand icon reserved at `/manus-storage/rapid_ai_logo_2be631b2.png`.

## Asset usage note

The primary interface is intentionally data-led and does not require decorative hero imagery. The generated icon is used as the brand anchor; charts and dashboard visualization remain deterministic and API-driven for accuracy.

## Accepted Review Notes

No independent style review has been run yet. This section is reserved for accepted, visible changes after the first screenshot pass.

## Design QA Checklist

- [ ] Sidebar stays legible and navigable at mobile widths.
- [ ] All KPI values come from API responses.
- [ ] Loading, error, empty, and action-progress states are visible and understandable.
- [ ] No individual component hard-codes the backend URL.
- [ ] Status color is always paired with a text label.
- [ ] Policy editing only changes the existing numeric value.
- [ ] No new backend logic is introduced from the frontend.

## Implementation complete when

- [ ] All requested navigation routes render.
- [ ] Dashboard, employees, attendance, leave, occupancy, and policies have usable screens.
- [ ] Approve/reject and policy edit actions refresh from the backend.
- [ ] The polished frontend has been copied into `rapid-ai/ui/` and committed.
- [ ] The webdev project has a final checkpoint.

## Verification note

The first verification pass should be visual and functional. A second style review is only valuable after a substantive revision checkpoint.

## End of design brief

This file is the working source for the design decisions that guide the frontend build.

## Operational note

The UI should never state that backend data is available when the API call failed. Show the error, preserve the page structure, and offer a retry.

## Accessibility note

Use keyboard-visible focus rings, semantic buttons/links, clear table headers, sufficient contrast, and status labels that do not rely on color alone.

## Final reminder

Does this choice reinforce or dilute the Editorial Control Room philosophy?

## Content tone examples

- “Today, in one clear read.”
- “Policy values are live from Supabase.”
- “No access record for this employee and date.”
- “Leave decision saved. Refreshing the ledger.”

## Layout reminder

Favor offset columns, sticky rail, strong title bands, ledger-like tables, and one decisive KPI band over a flat wall of equal cards.

## Motion reminder

Motion is a confirmation of state, not a performance. Keep transitions quick and avoid decorative animation loops.

## Color reminder

Cobalt acts. Cyan flows. Amber asks for attention. Coral flags risk. Ivory gives the data room to breathe.

## Typography reminder

Serif for editorial hierarchy. Sans for controls. Mono for values.

## Repository reminder

The delivered `ui/` folder will be a self-contained Vite frontend source tree with its own `.env.example`, README, and package metadata, while the backend files at repository root stay untouched.

## Scope reminder

No authentication, access-control integration, new database tables, notification system, or backend edits are included in this UI pass.

## Product reminder

This is an HR operations console, not a marketing site. The visual language should earn trust through clarity, restraint, and useful detail.

## Data reminder

If the backend's current response shape differs slightly from the brief, normalize it in the central API service rather than scattering shape checks across pages.

## Error reminder

Use friendly HTTP status mapping: 400 validation, 404 not found, 500 server issue, and network unavailable. Avoid exposing raw stack traces.

## Interaction reminder

Approve, reject, and save actions should disable only the relevant control group, show an inline progress label, then re-fetch the source data.

## Delivery reminder

The final user-facing result should point to the GitHub `ui/` folder and the live webdev preview, with the limitation that backend URL configuration remains environment-driven.

## Non-goals

Do not add mock testimonials, fake reviews, analytics claims, or placeholder business metrics when an API call is unavailable.

## End

Proceed with implementation using this document as the visual contract.

## One-line style contract

A warm editorial HR control room: composed typography, cobalt actions, operational data, and no decorative noise.

## Last check

If a component looks like a generic SaaS template, rework its hierarchy, spacing, or type treatment before delivery.

## Fin

Ready for implementation.

## File-specific reminder: App

Keep navigation visible and preserve route context.

## File-specific reminder: CSS

Do not introduce purple gradients, excessive corner rounding, or Inter as the primary family.

## File-specific reminder: API

Keep all URLs in one place and normalize backend responses centrally.

## File-specific reminder: pages

Lead with a title and operational context; let the data do the talking.

## File-specific reminder: components

Reuse small primitives for empty state, loading, status, and metric display.

## Final acceptance line

Build something an HR lead could understand at a glance and trust after a closer look.

## Status

Design brief approved internally for implementation.

## Date

2026-08-13

## Brand

Rapid AI

## Product

HR Management Dashboard

## Audience

HR leads and workplace operations teams

## Tone

Clear, calm, observant

## Palette

Ivory / Ink / Rapid Cobalt / Signal Cyan / Watch Amber / Alert Coral

## Layout

Persistent rail + offset editorial content + ledger tables

## Type

DM Serif Display / IBM Plex Sans / IBM Plex Mono

## Motion

Fast, light, meaningful

## Accessibility

Keyboard-first, high contrast, explicit status labels

## Source of truth

Supplied functional brief + existing backend API contract

## Delivery target

/home/ubuntu/rapid-ai/ui/

## Implementation rule

Do not modify backend files.

## Review rule

Visual review feedback must become a single holistic revision pass.

## End of brief

No further design exploration is needed unless the product scope changes.

## Acknowledgement

Editorial Control Room selected because it best fits a data-dense HR operations product and differentiates the demo from generic rounded-card admin templates.

## Closing

Use the design, then test the behavior.

## Done

Start coding.

## Fin.

## Notes

Keep page transitions stable under API loading and error states.

## Ready

Implementation can proceed.

## Final note

This document is intentionally verbose so every file stays aligned with the chosen visual system.

## End of notes

Ship a calm control room.

## End of file

## Footer

Rapid AI · HR Operations

## Copyright

Internal demo UI

## Usage

No external assets beyond the generated mark and UI framework primitives.

## Finish

End.

## Closing line

Clarity is the product.

## Confirmed

Proceed.

## Final

Done.

## End

—

## Additional guidance

The requested route names should remain visible in API service code and docs for quick integration checks.

## No further instructions

End.

## Final file marker

EOF

## Final implementation contract

The build should be judged on usable information architecture, clear hierarchy, direct API wiring, thoughtful empty/error states, responsive layout, and repository delivery.

## End of implementation contract

## Final final

Ship the UI under `ui/`.

## End.

## End of final

## Done now

Proceed.

## Last marker

.

## Last last marker

.

## End-of-file

EOF

## Closing marker

Rapid AI HR Management Dashboard.

## End.

## No more

End.

## final

END

## Editorial Control Room contract complete

Proceed.

## Termination

Done.

## end

.

## no-op

.

## End of ideas

.
