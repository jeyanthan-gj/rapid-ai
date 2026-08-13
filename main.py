from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import date, time
from db import get_supabase_client
from attendance import calculate_attendance

app = FastAPI()

# Define the data model based on the UI JSON structure
class AccessLog(BaseModel):
    emp_id: str
    is_check_in: bool
    time: time
    date: date
    floor: int

@app.post("/emp")
async def log_access(log: AccessLog):
    """
    Logs an employee access event (check-in or check-out).
    """
    try:
        supabase = get_supabase_client()
        
        # Prepare data for Supabase
        data = {
            "emp_id": log.emp_id,
            "is_check_in": log.is_check_in,
            "time": log.time.strftime("%H:%M:%S"),
            "date": log.date.strftime("%Y-%m-%d"),
            "floor": log.floor
        }
        
        # Insert into employee_access table
        response = supabase.table("employee_access").insert(data).execute()
        
        if response.data:
            return {"status": "success", "message": "Access logged successfully"}
        else:
            return {"status": "failed", "message": "Failed to insert record"}
            
    except Exception as e:
        return {"status": "failed", "message": str(e)}

@app.get("/attendance/{emp_id}/{access_date}")
async def get_attendance(emp_id: str, access_date: str):
    """
    Retrieves calculated attendance for an employee on a specific date.
    """
    result = calculate_attendance(emp_id, access_date)
    
    if result["status"] == "failed":
        raise HTTPException(status_code=404, detail=result["message"])
        
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
