from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import date, time
from db import get_supabase_client

app = FastAPI()

# Define the data model based on the UI JSON structure
class AccessLog(BaseModel):
    emp_id: str
    is_check_in: bool
    time: time
    date: date
    floor: int

@app.post("/access")
async def log_access(log: AccessLog):
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
