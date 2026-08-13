# Connection debugging checklist

- [x] Check the Render backend health and CORS response.
- [x] Confirm the frontend production API base URL.
- [x] Apply the minimal cross-origin/deployment fix.
- [x] Build and verify the UI and backend configuration.
- [ ] Commit and push the fix.

## HR-only UI refactor
- [x] Inspect current UI pages, shell, routes, and API client.
- [x] Remove employee self-service leave application UI and copy.
- [x] Align navigation to Dashboard, Employees, Attendance, Leave, Occupancy, Policies, Reports.
- [x] Ensure Employees, Attendance, Policies, Leave, Occupancy, and Reports are HR administrative views.
- [x] Build and verify the frontend.
- [x] Sync the updated frontend source into the repository ui/ folder.
- [ ] Commit and push the HR-only UI changes.

## Style Decisions
- [x] Preserve the existing Editorial Control Room aesthetic while simplifying the demo flows.
- [x] Keep the interface HR-only; no employee-facing actions such as Apply for Leave.
- [x] Use functional demo states and API-backed data where available, with clear empty/loading/error states.

## Delivery
- [ ] Save a project checkpoint after the UI changes.
- [ ] Deliver the latest project version and GitHub commit reference.
