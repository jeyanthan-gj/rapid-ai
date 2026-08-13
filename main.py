from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import date, time
from db import get_supabase_client
from attendance import calculate_attendance
from leave import apply_leave, get_leave_status, update_leave_status

app = FastAPI()

# --- Models ---

class AccessLog(BaseModel):
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

# --- Attendance Endpoints ---

@app.post("/emp")
async def log_access(log: AccessLog):
    """Logs an employee access event."""
    try:
        supabase = get_supabase_client()
        data = {
            "emp_id": log.emp_id,
            "is_check_in": log.is_check_in,
            "time": log.time.strftime("%H:%M:%S"),
            "date": log.date.strftime("%Y-%m-%d"),
            "floor": log.floor
        }
        response = supabase.table("employee_access").insert(data).execute()
        if response.data:
            return {"status": "success", "message": "Access logged successfully"}
        return {"status": "failed", "message": "Failed to insert record"}
    except Exception as e:
        return {"status": "failed", "message": str(e)}

@app.get("/attendance/{emp_id}/{access_date}")
async def get_attendance(emp_id: str, access_date: str):
    """Retrieves calculated attendance for an employee."""
    result = calculate_attendance(emp_id, access_date)
    if result["status"] == "failed":
        raise HTTPException(status_code=404, detail=result["message"])
    return result

# --- Leave Endpoints ---

@app.post("/leave")
async def request_leave(leave: LeaveRequest):
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
async def get_emp_leaves(emp_id: str):
    """Retrieves all leave requests for a specific employee."""
    result = get_leave_status(emp_id)
    if result["status"] == "failed":
        raise HTTPException(status_code=404, detail=result["message"])
    return result

@app.put("/leave/{leave_id}/approve")
async def approve_leave(leave_id: int):
    """Approves a leave request."""
    result = update_leave_status(leave_id, "Approved")
    if result["status"] == "failed":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

@app.put("/leave/{leave_id}/reject")
async def reject_leave(leave_id: int):
    """Rejects a leave request."""
    result = update_leave_status(leave_id, "Rejected")
    if result["status"] == "failed":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
