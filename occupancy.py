from datetime import datetime
from db import get_supabase_client
from collections import defaultdict

def get_occupancy_data(target_date: str = None):
    """
    Calculates current and floor-wise occupancy based on the latest logs.
    If target_date is None, it uses the current date.
    """
    supabase = get_supabase_client()
    if not target_date:
        target_date = datetime.now().strftime("%Y-%m-%d")
    
    try:
        # Fetch all records for the date to determine current state
        # We need to know the last event for each employee to see if they are "in"
        response = supabase.table("employee_access")\
            .select("emp_id, is_check_in, floor, time")\
            .eq("date", target_date)\
            .order("time", desc=False)\
            .execute()
        
        if not response.data:
            return {
                "status": "success",
                "date": target_date,
                "total_occupancy": 0,
                "floor_occupancy": {},
                "message": "No access logs for this date"
            }
        
        # Determine current status of each employee
        latest_status = {}
        for record in response.data:
            latest_status[record["emp_id"]] = {
                "is_in": record["is_check_in"],
                "floor": record["floor"]
            }
        
        # Calculate current counts
        current_in = [emp for emp, status in latest_status.items() if status["is_in"]]
        total_occupancy = len(current_in)
        
        floor_occupancy = defaultdict(int)
        for emp in current_in:
            floor = latest_status[emp]["floor"]
            floor_occupancy[f"Floor {floor}"] += 1
            
        return {
            "status": "success",
            "date": target_date,
            "total_occupancy": total_occupancy,
            "floor_occupancy": dict(floor_occupancy)
        }
        
    except Exception as e:
        return {"status": "failed", "message": str(e)}

def get_peak_occupancy(target_date: str):
    """
    Calculates the peak occupancy time and count for a specific date.
    """
    supabase = get_supabase_client()
    
    try:
        response = supabase.table("employee_access")\
            .select("is_check_in, time")\
            .eq("date", target_date)\
            .order("time", desc=False)\
            .execute()
            
        if not response.data:
            return {"status": "success", "peak_count": 0, "peak_time": None}
            
        current_count = 0
        peak_count = 0
        peak_time = None
        
        for record in response.data:
            if record["is_check_in"]:
                current_count += 1
            else:
                current_count -= 1
            
            if current_count > peak_count:
                peak_count = current_count
                peak_time = record["time"]
                
        return {
            "status": "success",
            "date": target_date,
            "peak_count": peak_count,
            "peak_time": peak_time
        }
        
    except Exception as e:
        return {"status": "failed", "message": str(e)}

if __name__ == "__main__":
    # Test with a known date from our previous steps
    test_date = "2026-08-13"
    print(f"--- Occupancy Report for {test_date} ---")
    
    occ = get_occupancy_data(test_date)
    print(f"Current Occupancy: {occ.get('total_occupancy')}")
    print(f"Floor Breakdown: {occ.get('floor_occupancy')}")
    
    peak = get_peak_occupancy(test_date)
    print(f"Peak Occupancy: {peak.get('peak_count')} at {peak.get('peak_time')}")
