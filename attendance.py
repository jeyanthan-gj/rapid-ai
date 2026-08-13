from datetime import datetime, timedelta
from db import get_supabase_client

def calculate_attendance(emp_id: str, access_date: str):
    """
    Calculates attendance details for an employee on a specific date.
    """
    supabase = get_supabase_client()
    
    try:
        # 1. Get employee shift details
        emp_res = supabase.table("employees").select("emp_name, shift_start, shift_end").eq("emp_id", emp_id).single().execute()
        if not emp_res.data:
            return {"status": "failed", "message": "Employee not found"}
        
        emp_info = emp_res.data
        shift_start_str = emp_info.get("shift_start")
        
        # 2. Get access records for the date
        access_res = supabase.table("employee_access").select("*").eq("emp_id", emp_id).eq("date", access_date).order("time").execute()
        
        if not access_res.data:
            return {"status": "failed", "message": "No access records found for this date"}
        
        records = access_res.data
        
        # 3. Find check-in and check-out
        # Check-in is the first record where is_check_in is true
        # Check-out is the last record where is_check_in is false
        check_in_rec = next((r for r in records if r["is_check_in"]), None)
        check_out_rec = next((r for r in reversed(records) if not r["is_check_in"]), None)
        
        if not check_in_rec:
            return {"status": "failed", "message": "No check-in record found"}
        
        check_in_time_str = check_in_rec["time"]
        check_out_time_str = check_out_rec["time"] if check_out_rec else None
        
        # 4. Calculate total hours
        total_hours = 0.0
        if check_in_time_str and check_out_time_str:
            t1 = datetime.strptime(check_in_time_str, "%H:%M:%S")
            t2 = datetime.strptime(check_out_time_str, "%H:%M:%S")
            duration = t2 - t1
            total_hours = duration.total_seconds() / 3600
        
        # 5. Calculate late minutes
        late_minutes = 0
        if shift_start_str and check_in_time_str:
            s_start = datetime.strptime(shift_start_str, "%H:%M:%S")
            c_in = datetime.strptime(check_in_time_str, "%H:%M:%S")
            if c_in > s_start:
                late_diff = c_in - s_start
                late_minutes = int(late_diff.total_seconds() / 60)
        
        return {
            "status": "success",
            "emp_id": emp_id,
            "emp_name": emp_info["emp_name"],
            "date": access_date,
            "check_in": check_in_time_str,
            "check_out": check_out_time_str or "Not checked out",
            "total_hours": round(total_hours, 2),
            "late_minutes": late_minutes
        }
        
    except Exception as e:
        return {"status": "failed", "message": str(e)}

if __name__ == "__main__":
    # Example usage
    test_emp = "EMP001"
    test_date = "2026-08-13"
    print(f"Calculating attendance for {test_emp} on {test_date}...")
    result = calculate_attendance(test_emp, test_date)
    print(result)
