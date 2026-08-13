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
