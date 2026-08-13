from collections import defaultdict
from datetime import datetime

from db import get_supabase_client
from time_utils import is_today_in_india, today_in_india


def _events_for_date(target_date: str):
    response = (
        get_supabase_client()
        .table("employee_access")
        .select("emp_id, is_check_in, floor, time")
        .eq("date", target_date)
        .execute()
    )
    return sorted(response.data or [], key=lambda item: item.get("time") or "")


def get_occupancy_data(target_date: str = None):
    """Calculate current and floor-wise occupancy from the latest event per employee."""
    target_date = target_date or today_in_india()
    is_live = is_today_in_india(target_date)

    try:
        records = _events_for_date(target_date)
        if not records:
            return {
                "status": "success",
                "date": target_date,
                "total_occupancy": 0,
                "floor_occupancy": {},
                "message": "No access logs for this date",
                "is_live": is_live,
                "snapshot_label": "Live now" if is_live else "End-of-day snapshot",
                "as_of_time": None,
            }

        latest_status = {}
        for record in records:
            latest_status[record["emp_id"]] = record

        current_in = [record for record in latest_status.values() if record.get("is_check_in")]
        floor_occupancy = defaultdict(int)
        for record in current_in:
            floor_occupancy[f"Floor {record.get('floor')}"] += 1

        return {
            "status": "success",
            "date": target_date,
            "total_occupancy": len(current_in),
            "floor_occupancy": dict(floor_occupancy),
            "is_live": is_live,
            "snapshot_label": "Live now" if is_live else "End-of-day snapshot",
            "as_of_time": records[-1].get("time") if records else None,
        }
    except Exception as exc:
        return {"status": "failed", "message": str(exc)}


def get_peak_occupancy(target_date: str):
    """Calculate peak occupancy time and count for a specific date."""
    try:
        records = _events_for_date(target_date)
        current_count = 0
        peak_count = 0
        peak_time = None

        for record in records:
            current_count += 1 if record.get("is_check_in") else -1
            if current_count > peak_count:
                peak_count = current_count
                peak_time = record.get("time")

        return {
            "status": "success",
            "date": target_date,
            "peak_count": peak_count,
            "peak_time": peak_time,
            "is_live": is_today_in_india(target_date),
        }
    except Exception as exc:
        return {"status": "failed", "message": str(exc)}


if __name__ == "__main__":
    test_date = "2026-08-13"
    print(get_occupancy_data(test_date))
    print(get_peak_occupancy(test_date))
