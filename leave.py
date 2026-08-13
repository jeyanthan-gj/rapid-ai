from datetime import datetime
from db import get_supabase_client

def apply_leave(emp_id: str, leave_type: str, from_date: str, to_date: str, reason: str):
    """
    Creates a new leave request in Supabase.
    """
    supabase = get_supabase_client()
    
    try:
        # 1. Calculate number of days
        d1 = datetime.strptime(from_date, "%Y-%m-%d")
        d2 = datetime.strptime(to_date, "%Y-%m-%d")
        # Including both start and end date (+1)
        leave_days = (d2 - d1).days + 1
        
        if leave_days <= 0:
            return {"status": "failed", "message": "Invalid date range"}

        # 2. Prepare data for Supabase
        data = {
            "emp_id": emp_id,
            "leave_type": leave_type,
            "from_date": from_date,
            "to_date": to_date,
            "reason": reason,
            "status": "Pending"
        }
        
        # 3. Insert into leave_requests table
        response = supabase.table("leave_requests").insert(data).execute()
        
        if response.data:
            result = response.data[0]
            result["leave_days"] = leave_days
            return {"status": "success", "data": result}
        else:
            return {"status": "failed", "message": "Failed to create leave request"}
            
    except Exception as e:
        return {"status": "failed", "message": str(e)}

def get_leave_status(emp_id: str):
    """
    Retrieves all leave requests for a specific employee.
    """
    supabase = get_supabase_client()
    
    try:
        response = supabase.table("leave_requests").select("*").eq("emp_id", emp_id).order("from_date", desc=True).execute()
        
        if response.data:
            # Calculate leave days for each record in the result
            for record in response.data:
                d1 = datetime.strptime(record["from_date"], "%Y-%m-%d")
                d2 = datetime.strptime(record["to_date"], "%Y-%m-%d")
                record["leave_days"] = (d2 - d1).days + 1
            
            return {"status": "success", "data": response.data}
        else:
            return {"status": "success", "data": [], "message": "No leave requests found"}
            
    except Exception as e:
        return {"status": "failed", "message": str(e)}

if __name__ == "__main__":
    # Example usage
    print("Applying for leave for EMP001...")
    apply_res = apply_leave(
        emp_id="EMP001",
        leave_type="Casual Leave",
        from_date="2026-08-20",
        to_date="2026-08-21",
        reason="Personal work"
    )
    print(f"Apply Result: {apply_res}")
    
    print("\nChecking leave status for EMP001...")
    status_res = get_leave_status("EMP001")
    print(f"Status Result: {status_res}")
