# Connection debugging checklist

- [x] Check the Render backend health and CORS response.
- [x] Confirm the frontend production API base URL.
- [x] Apply the minimal cross-origin/deployment fix.
- [x] Build and verify the UI and backend configuration.
- [x] Commit and push the fix.

## HR-only UI refactor
- [x] Inspect current UI pages, shell, routes, and API client.
- [x] Remove employee self-service leave application UI and copy.
- [x] Align navigation to Dashboard, Employees, Attendance, Leave, Occupancy, Policies, Reports.
- [x] Ensure Employees, Attendance, Policies, Leave, Occupancy, and Reports are HR administrative views.
- [x] Build and verify the frontend.
- [x] Sync the updated frontend source into the repository ui/ folder.
- [x] Commit and push the HR-only UI changes.

## Style Decisions
- [x] Preserve the existing Editorial Control Room aesthetic while simplifying the demo flows.
- [x] Keep the interface HR-only; no employee-facing actions such as Apply for Leave.
- [x] Use functional demo states and API-backed data where available, with clear empty/loading/error states.

## Delivery
- [x] Save a project checkpoint after the UI changes.
- [x] Deliver the latest project version and GitHub commit reference.

## Non-technical HR usability improvements
- [x] Inspect the current roster screen and identify confusing labels, controls, and dead ends.
- [x] Make the Employees page an easy-to-scan roster with plain-language search, department filter, and refresh behavior.
- [x] Add an obvious employee detail workflow for attendance and leave review.
- [x] Clarify the main HR actions and supporting copy across the roster and related screens.
- [x] Preserve HR-only scope and avoid employee self-service actions.
- [x] Build and visually verify the improved UI.
- [x] Synchronize the improved source into rapid-ai/ui/.
- [x] Save a checkpoint and push the usability improvements to GitHub.

## Demo data insertion
- [x] Inspect Supabase tables, columns, constraints, and existing demo records.
- [x] Design an idempotent dataset for 100 employees and approximately two months of attendance events.
- [x] Insert only demo records without deleting or overwriting existing HR data.
- [x] Verify employee count, attendance event count, date range, and representative records.
- [x] Report the inserted dataset and any assumptions.

## Demo data visibility diagnostics
- [ ] Inspect the repository backend routes, Supabase client, frontend API client, and environment configuration.
- [ ] Reproduce the failing employees and attendance requests and identify the response mismatch.
- [ ] Apply the minimum compatibility fix in the backend and/or UI.
- [ ] Build, verify live data rendering, and synchronize the fix into ui/.
- [ ] Save a checkpoint, commit, push, and report the fix.

## HR-only API and UI contract
- [x] Audit employee check-in, check-out, and leave-application routes and frontend calls.
- [x] Keep employee self-service endpoints available for external employee systems while retaining read-only attendance calculations for HR screens.
- [x] Remove employee-facing check-in, check-out, and leave-application UI and API client actions while retaining backend APIs.
- [x] Preserve HR roster, attendance review, leave approval/rejection, occupancy, policy, dashboard, and reports workflows.
- [x] Build and scan the HR-only UI source; no UI source changes were needed for this correction.

## Employee API and HR UI separation correction
- [x] Restore employee check-in/check-out and leave-application API routes in FastAPI.
- [x] Keep employee API methods out of the HR frontend API client and UI controls.
- [x] Verify the backend compiles and the UI only calls HR endpoints.
- [x] Synchronize, commit, push, and report the corrected separation; no UI source changes were needed.

## HR UI performance investigation
- [x] Inspect bundle size, API request timing, repeated requests, and browser errors.
- [x] Reproduce the slow page and isolate the main bottleneck.
- [x] Apply the smallest safe performance fix without changing HR workflows.
- [x] Build, verify, synchronize ui/, checkpoint, commit, and push the optimization.

## IST occupancy semantics
- [x] Audit date defaults, occupancy wording, and historical report labels across backend and UI.
- [x] Use India Standard Time (UTC+05:30) for the current-day comparison.
- [x] Mark occupancy as live only for today in IST; label past dates as historical end-of-day snapshots.
- [x] Build, verify, synchronize ui/, checkpoint, commit, and push the correction.

## Demo data integrity correction
- [x] Inspect current schema, employee IDs, attendance pairs, date coverage, duplicates, and shift consistency.
- [x] Define a safe correction strategy that preserves original records and avoids destructive cleanup without evidence.
- [x] Correct only inconsistent demo records after user confirmation.
- [x] Verify employee totals, paired events, date coverage, dashboard-compatible records, and representative employees.
- [x] Report the corrected dataset and assumptions.

## Policies screen correction
- [x] Inspect the `/policies` backend response, frontend policy type, and display mapping; the backend uses `Casual Leave`, `Sick Leave`, and `Maximum leave/year`, while the UI expected different names.
- [x] Ensure all six database policies render with correct values and units.
- [x] Ensure every policy has an HR edit action without employee self-service controls.
- [x] Type-check/build the frontend and visually verify all six policy rows on mobile; the local preview needs `VITE_API_BASE_URL` to show live values.
- [x] Synchronize, checkpoint, commit, and push the policy fix; repository commit `ff0135a`.

## Employee check-in/out demo page
- [x] Inspect existing employee, leave, employee list, and policy API shapes plus shared HR shell.
- [x] Add a separate `/empcincout` route without modifying existing pages.
- [x] Add employee access form with employee, floor, date, time, and check-in/check-out selection.
- [x] Add leave application and status review using existing leave endpoints.
- [ ] Build, verify payloads and error states, and synchronize the page into `ui/`.
- [ ] Checkpoint, commit, and push the new demo page.

## Active-page live refresh
- [ ] Inspect current page fetch patterns and refresh controls.
- [ ] Add a 2-second data poll only for the currently opened, visible page.
- [ ] Avoid full browser reloads so forms and page state are not reset.
- [ ] Pause polling when the tab is hidden and resume immediately when visible.
- [ ] Build, verify, synchronize ui/, checkpoint, commit, and push the refresh change.

## Dashboard percentage correction
- [x] Trace Dashboard attendance totals, denominator, and percentage formulas against the backend response.
- [x] Correct the Dashboard percentage calculations and preserve IST/live status semantics.
- [x] Run TypeScript/build checks and verify the rendered Dashboard values with representative totals.
- [x] Report the root cause and corrected percentage behavior.
