from fastapi import FastAPI, HTTPException, Query
import os

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import date, time
from typing import Optional

from db import get_supabase_client

# Import business logic modules
from emp import log_employee_access
from attendance import calculate_attendance
from leave import apply_leave, get_leave_status, update_leave_status
from occupancy import get_occupancy_data
from dashboard import get_dashboard_summary

app = FastAPI(title="Rapid AI - HR Management System")

# Allow the Netlify-hosted UI to call this public API. Set ALLOWED_ORIGINS in
# production to a comma-separated list of trusted UI origins if you want to
# restrict access, for example: https://your-site.netlify.app.
allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in allowed_origins else allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---

class AccessLogRequest(BaseModel):
    emp_id: str
    is_check_in: bool
    time: time
    date: date
    floor: int


class LeaveRequest(BaseModel):
    emp_id: str
    leave_type: str
    from_date: date
    to_date: date
    reason: str


class PolicyUpdateRequest(BaseModel):
    policy_value: float


# --- 1. HR Directory and Policy Endpoints ---

@app.get("/employees")
async def get_employees():
    """Returns the employee directory for HR screens."""
    try:
        response = (
            get_supabase_client()
            .table("employees")
            .select("id, emp_id, emp_name, department, shift_start, shift_end")
            .order("emp_name")
            .execute()
        )
        return response.data or []
    except Exception:
        raise HTTPException(status_code=500, detail="The employee directory is temporarily unavailable.")


@app.get("/policies")
async def get_policies():
    """Returns editable HR policy values."""
    try:
        response = (
            get_supabase_client()
            .table("policies")
            .select("id, policy_name, policy_value, description")
            .order("id")
            .execute()
        )
        return response.data or []
    except Exception:
        raise HTTPException(status_code=500, detail="HR policies are temporarily unavailable.")


@app.put("/policies/{policy_id}")
async def update_policy(policy_id: int, policy: PolicyUpdateRequest):
    """Updates one existing policy value from the HR policy screen."""
    if policy.policy_value < 0:
        raise HTTPException(status_code=400, detail="Policy value cannot be negative.")
    try:
        response = (
            get_supabase_client()
            .table("policies")
            .update({"policy_value": policy.policy_value})
            .eq("id", policy_id)
            .select("id, policy_name, policy_value, description")
            .single()
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="That HR policy could not be found.")
        return {"status": "success", "data": response.data}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="The HR policy could not be updated.")


# --- 2. Employee Access Endpoints (external employee system) ---

@app.post("/emp")
async def post_emp_access(log: AccessLogRequest):
    """Accepts employee check-in/check-out events from an external employee system."""
    result = log_employee_access(
        emp_id=log.emp_id,
        is_check_in=log.is_check_in,
        access_time=log.time.strftime("%H:%M:%S"),
        access_date=log.date.strftime("%Y-%m-%d"),
        floor=log.floor,
    )
    if result["status"] == "failed":
        raise HTTPException(status_code=400, detail=result["message"])
    return result


# --- 3. Attendance Endpoints (HR read-only review) ---

@app.get("/attendance/{emp_id}/{access_date}")
async def get_attendance(emp_id: str, access_date: str):
    """Retrieves calculated attendance status and metrics for an employee."""
    result = calculate_attendance(emp_id, access_date)
    if result["status"] == "failed":
        raise HTTPException(status_code=404, detail=result["message"])
    return result

# --- 3. Leave Management Endpoints ---

@app.post("/leave")
async def post_leave_request(leave: LeaveRequest):
    """Accepts leave applications from an external employee system."""
    result = apply_leave(
        emp_id=leave.emp_id,
        leave_type=leave.leave_type,
        from_date=leave.from_date.strftime("%Y-%m-%d"),
        to_date=leave.to_date.strftime("%Y-%m-%d"),
        reason=leave.reason,
    )
    if result["status"] == "failed":
        raise HTTPException(status_code=400, detail=result["message"])
    return result


@app.get("/leave/{emp_id}")
async def get_employee_leaves(emp_id: str):
    """Retrieves all leave requests for a specific employee."""
    result = get_leave_status(emp_id)
    if result["status"] == "failed":
        raise HTTPException(status_code=404, detail=result["message"])
    return result

@app.put("/leave/{leave_id}/approve")
async def put_approve_leave(leave_id: int):
    """Approves a pending leave request."""
    result = update_leave_status(leave_id, "Approved")
    if result["status"] == "failed":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

@app.put("/leave/{leave_id}/reject")
async def put_reject_leave(leave_id: int):
    """Rejects a pending leave request."""
    result = update_leave_status(leave_id, "Rejected")
    if result["status"] == "failed":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

# --- 4. Occupancy Endpoints ---

@app.get("/occupancy")
async def get_current_occupancy(date: Optional[str] = Query(None)):
    """Retrieves real-time floor-wise occupancy data."""
    result = get_occupancy_data(date)
    if result["status"] == "failed":
        raise HTTPException(status_code=500, detail=result["message"])
    return result

# --- 5. Dashboard Endpoints ---

@app.get("/dashboard")
async def get_hr_dashboard(date: Optional[str] = Query(None)):
    """Retrieves a comprehensive HR dashboard summary."""
    result = get_dashboard_summary(date)
    if result["status"] == "failed":
        raise HTTPException(status_code=500, detail=result["message"])
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
