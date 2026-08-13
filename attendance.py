from datetime import datetime, timedelta
from db import get_supabase_client

def calculate_attendance(emp_id: str, access_date: str):
    """
    Calculates attendance details for an employee on a specific date based on 
    access logs, leave requests, and dynamic policies.
    """
    supabase = get_supabase_client()
    
    try:
        # 1. Get employee shift details
        emp_res = supabase.table("employees").select("emp_name, shift_start, shift_end").eq("emp_id", emp_id).limit(1).execute()
        if not emp_res.data:
            return {"status": "failed", "message": "Employee not found"}
        
        emp_info = emp_res.data[0]
        shift_start_str = emp_info.get("shift_start")
        
        # 2. Get attendance policies
        policy_res = supabase.table("policies").select("policy_name, policy_value").in_("policy_name", [
            "Minimum Working Hours", 
            "Late Threshold",
            "Half Day Threshold"
        ]).execute()
        policies = {p["policy_name"]: float(p["policy_value"]) for p in policy_res.data}
        
        min_hours = policies.get("Minimum Working Hours", 8.0)
        late_threshold = policies.get("Late Threshold", 15.0)
        half_day_threshold = policies.get("Half Day Threshold", 4.0)
        
        # 3. Check for approved leave on this date
        leave_res = supabase.table("leave_requests")\
            .select("*")\
            .eq("emp_id", emp_id)\
            .eq("status", "Approved")\
            .lte("from_date", access_date)\
            .gte("to_date", access_date)\
            .execute()
        
        has_approved_leave = len(leave_res.data) > 0
        
        # 4. Get access records for the date
        access_res = supabase.table("employee_access").select("*").eq("emp_id", emp_id).eq("date", access_date).order("time").execute()
        records = access_res.data
        
        # --- Status Determination Logic ---
        
        # Case A: No access logs found
        if not records:
            if has_approved_leave:
                attendance_status = "On Leave"
            else:
                attendance_status = "Absent"
            
            return {
                "status": "success",
                "emp_id": emp_id,
                "emp_name": emp_info["emp_name"],
                "date": access_date,
                "attendance_status": attendance_status,
                "check_in": None,
                "check_out": None,
                "total_hours": 0.0,
                "late_minutes": 0
            }

        # Case B: Access logs exist
        check_in_rec = next((r for r in records if r["is_check_in"]), None)
        check_out_rec = next((r for r in reversed(records) if not r["is_check_in"]), None)
        
        check_in_time_str = check_in_rec["time"] if check_in_rec else None
        check_out_time_str = check_out_rec["time"] if check_out_rec else None
        
        # Calculate metrics
        total_hours = 0.0
        late_minutes = 0
        
        if check_in_time_str:
            # Calculate late minutes
            if shift_start_str:
                s_start = datetime.strptime(shift_start_str, "%H:%M:%S")
                c_in = datetime.strptime(check_in_time_str, "%H:%M:%S")
                if c_in > s_start:
                    late_diff = c_in - s_start
                    late_minutes = int(late_diff.total_seconds() / 60)
            
            # Calculate total hours if check-out exists
            if check_out_time_str:
                t1 = datetime.strptime(check_in_time_str, "%H:%M:%S")
                t2 = datetime.strptime(check_out_time_str, "%H:%M:%S")
                duration = t2 - t1
                total_hours = round(duration.total_seconds() / 3600, 2)

        # Final Status mapping
        if not check_in_time_str or not check_out_time_str:
            attendance_status = "Incomplete"
        elif total_hours < half_day_threshold:
            attendance_status = "Absent"
        elif total_hours < min_hours:
            attendance_status = "Half Day"
        elif late_minutes > late_threshold:
            attendance_status = "Late"
        else:
            attendance_status = "Present"

        return {
            "status": "success",
            "emp_id": emp_id,
            "emp_name": emp_info["emp_name"],
            "date": access_date,
            "attendance_status": attendance_status,
            "check_in": check_in_time_str,
            "check_out": check_out_time_str or "Not checked out",
            "total_hours": total_hours,
            "late_minutes": late_minutes,
            "policy_applied": {
                "min_hours": min_hours,
                "half_day_threshold": half_day_threshold,
                "late_threshold": late_threshold
            }
        }
        
    except Exception as e:
        return {"status": "failed", "message": str(e)}

if __name__ == "__main__":
    # Example usage
    test_emp = "EMP001"
    test_date = "2026-08-13"
    print(f"Calculating attendance for {test_emp} on {test_date}...")
    result = calculate_attendance(test_emp, test_date)
    import json
    print(json.dumps(result, indent=2))
