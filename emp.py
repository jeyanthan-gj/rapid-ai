from db import get_supabase_client

def log_employee_access(emp_id: str, is_check_in: bool, access_time: str, access_date: str, floor: int):
    """
    Logs an employee access event to Supabase.
    """
    supabase = get_supabase_client()
    
    try:
        data = {
            "emp_id": emp_id,
            "is_check_in": is_check_in,
            "time": access_time,
            "date": access_date,
            "floor": floor
        }
        
        response = supabase.table("employee_access").insert(data).execute()
        
        if response.data:
            return {"status": "success", "message": "Access logged successfully", "data": response.data[0]}
        else:
            return {"status": "failed", "message": "Failed to log access"}
            
    except Exception as e:
        return {"status": "failed", "message": str(e)}
