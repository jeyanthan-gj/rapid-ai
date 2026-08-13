from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from datetime import date, time
from typing import Optional

# Import business logic modules
from emp import log_employee_access
from attendance import calculate_attendance
from leave import apply_leave, get_leave_status, update_leave_status
from occupancy import get_occupancy_data
from dashboard import get_dashboard_summary

app = FastAPI(title="Rapid AI - HR Management System")

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

# --- 1. Employee Access Endpoints ---

@app.post("/emp")
async def post_emp_access(log: AccessLogRequest):
    """Logs an employee access event (check-in/check-out)."""
    result = log_employee_access(
        emp_id=log.emp_id,
        is_check_in=log.is_check_in,
        access_time=log.time.strftime("%H:%M:%S"),
        access_date=log.date.strftime("%Y-%m-%d"),
        floor=log.floor
    )
    if result["status"] == "failed":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

# --- 2. Attendance Endpoints ---

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
    """Applies for a new leave request with policy validation."""
    result = apply_leave(
        emp_id=leave.emp_id,
        leave_type=leave.leave_type,
        from_date=leave.from_date.strftime("%Y-%m-%d"),
        to_date=leave.to_date.strftime("%Y-%m-%d"),
        reason=leave.reason
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
