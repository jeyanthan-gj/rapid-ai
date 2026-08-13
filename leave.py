from datetime import datetime
from db import get_supabase_client

def get_leave_days(from_date: str, to_date: str) -> int:
    """Calculates the number of days between two dates, inclusive."""
    d1 = datetime.strptime(from_date, "%Y-%m-%d")
    d2 = datetime.strptime(to_date, "%Y-%m-%d")
    return (d2 - d1).days + 1

def apply_leave(emp_id: str, leave_type: str, from_date: str, to_date: str, reason: str):
    """
    Creates a new leave request in Supabase after validating against policies.
    """
    supabase = get_supabase_client()
    
    try:
        # 1. Calculate requested days
        requested_days = get_leave_days(from_date, to_date)
        if requested_days <= 0:
            return {"status": "failed", "message": "Invalid date range"}

        # 2. Fetch policy limit for the leave type
        policy_res = supabase.table("policies").select("policy_value").eq("policy_name", leave_type).single().execute()
        if not policy_res.data:
            return {"status": "failed", "message": f"Policy for '{leave_type}' not found"}
        
        policy_limit = float(policy_res.data["policy_value"])

        # 3. Fetch all APPROVED leave requests for this employee and type
        approved_res = supabase.table("leave_requests").select("from_date", "to_date").eq("emp_id", emp_id).eq("leave_type", leave_type).eq("status", "Approved").execute()
        
        used_days = 0
        if approved_res.data:
            for record in approved_res.data:
                used_days += get_leave_days(record["from_date"], record["to_date"])

        # 4. Check balance
        remaining = policy_limit - used_days
        if requested_days > remaining:
            return {
                "status": "failed", 
                "message": f"Insufficient leave balance. Requested: {requested_days}, Remaining: {remaining} (Policy: {policy_limit}, Used: {used_days})"
            }

        # 5. Prepare data for Supabase
        data = {
            "emp_id": emp_id,
            "leave_type": leave_type,
            "from_date": from_date,
            "to_date": to_date,
            "reason": reason,
            "status": "Pending"
        }
        
        # 6. Insert into leave_requests table
        response = supabase.table("leave_requests").insert(data).execute()
        
        if response.data:
            result = response.data[0]
            result["leave_days"] = requested_days
            result["remaining_after_approval"] = remaining - requested_days
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
            for record in response.data:
                record["leave_days"] = get_leave_days(record["from_date"], record["to_date"])
            return {"status": "success", "data": response.data}
        else:
            return {"status": "success", "data": [], "message": "No leave requests found"}
            
    except Exception as e:
        return {"status": "failed", "message": str(e)}

if __name__ == "__main__":
    # Example usage
    print("Checking leave status for EMP001...")
    status_res = get_leave_status("EMP001")
    print(f"Status Result: {status_res}")
