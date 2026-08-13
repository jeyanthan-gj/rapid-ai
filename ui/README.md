# Rapid AI HR Operations UI

This folder contains the React, TypeScript, and Tailwind frontend for the Rapid AI HR operations control room. It is intentionally kept separate from the Python backend at the repository root.

## Run locally

```bash
cd ui
pnpm install
cp .env.example .env
pnpm dev
```

The UI defaults to `http://localhost:8000` for the FastAPI backend. Set `VITE_API_BASE_URL` in `.env` when the API is hosted elsewhere.

## Available views

The dashboard includes the daily control room, employee roster, attendance lookup, leave management, occupancy and floor tracking, and editable policy settings. It calls the existing backend endpoints for dashboard, employee, attendance, leave, occupancy, and policy data; it does not create or modify database tables.

## API contract

The UI expects the FastAPI application to expose the endpoints already defined in the root backend: `POST /emp`, `GET /attendance/{emp_id}/{date}`, `POST /leave`, `GET /leave/{emp_id}`, `PUT /leave/{leave_id}/approve`, `PUT /leave/{leave_id}/reject`, `GET /occupancy`, `GET /dashboard`, plus employee and policy read/update endpoints used by the roster and settings views.

## Design direction

The interface follows the **Editorial Control Room** direction: warm ivory surfaces, a dark operational rail, cobalt signal accents, serif display headlines, mono operational labels, and ledger-like data blocks. Disconnected states preserve the same information hierarchy and clearly explain that live backend data is unavailable.
