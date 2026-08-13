from datetime import datetime
from db import get_supabase_client
from attendance import calculate_attendance
from occupancy import get_occupancy_data, get_peak_occupancy

def get_dashboard_summary(target_date: str = None):
    """
    Combines attendance, occupancy, and peak data into a single dashboard summary.
    """
    supabase = get_supabase_client()
    if not target_date:
        target_date = datetime.now().strftime("%Y-%m-%d")
    
    try:
        # 1. Fetch all employees
        emp_res = supabase.table("employees").select("emp_id").execute()
        all_employees = [e["emp_id"] for e in emp_res.data]
        total_employees = len(all_employees)
        
        # 2. Calculate Attendance Summary
        attendance_counts = {
            "Present": 0,
            "Late": 0,
            "Half Day": 0,
            "Absent": 0,
            "On Leave": 0,
            "Incomplete": 0,
            "Short Hours": 0
        }
        
        total_working_hours = 0.0
        employees_with_hours = 0
        
        for emp_id in all_employees:
            att = calculate_attendance(emp_id, target_date)
            if att["status"] == "success":
                status = att["attendance_status"]
                if status in attendance_counts:
                    attendance_counts[status] += 1
                
                # For average calculation, only count those who have hours
                if att.get("total_hours", 0) > 0:
                    total_working_hours += att["total_hours"]
                    employees_with_hours += 1
        
        avg_working_hours = 0.0
        if employees_with_hours > 0:
            avg_working_hours = round(total_working_hours / employees_with_hours, 2)
            
        # 3. Get Occupancy Data
        occ_data = get_occupancy_data(target_date)
        peak_data = get_peak_occupancy(target_date)
        
        # Format average hours into h and m
        avg_h = int(avg_working_hours)
        avg_m = int((avg_working_hours - avg_h) * 60)
        
        return {
            "status": "success",
            "date": target_date,
            "attendance_summary": {
                "total_employees": total_employees,
                "present": attendance_counts["Present"] + attendance_counts["Late"], # Late is also Present
                "late": attendance_counts["Late"],
                "half_day": attendance_counts["Half Day"],
                "absent": attendance_counts["Absent"],
                "on_leave": attendance_counts["On Leave"],
                "incomplete": attendance_counts["Incomplete"]
            },
            "occupancy_summary": {
                "inside_office": occ_data.get("total_occupancy", 0),
                "floor_breakdown": occ_data.get("floor_occupancy", {})
            },
            "peak_summary": {
                "peak_time": peak_data.get("peak_time"),
                "peak_employees": peak_data.get("peak_count", 0)
            },
            "average_time_in_office": f"{avg_h}h {avg_m}m"
        }
        
    except Exception as e:
        return {"status": "failed", "message": str(e)}

if __name__ == "__main__":
    # Test with a known date
    test_date = "2026-08-13"
    print(f"--- Dashboard Summary for {test_date} ---")
    summary = get_dashboard_summary(test_date)
    
    import json
    print(json.dumps(summary, indent=2))
