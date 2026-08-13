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
- [ ] Save a checkpoint and push the usability improvements to GitHub.
