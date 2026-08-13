from collections import defaultdict
from datetime import datetime

from db import get_supabase_client


def _minutes_late(check_in: str | None, shift_start: str | None) -> int:
    if not check_in or not shift_start:
        return 0
    check_in_time = datetime.strptime(check_in, "%H:%M:%S")
    shift_time = datetime.strptime(shift_start, "%H:%M:%S")
    if check_in_time <= shift_time:
        return 0
    return int((check_in_time - shift_time).total_seconds() / 60)


def _hours_between(check_in: str | None, check_out: str | None) -> float:
    if not check_in or not check_out:
        return 0.0
    start = datetime.strptime(check_in, "%H:%M:%S")
    end = datetime.strptime(check_out, "%H:%M:%S")
    return round((end - start).total_seconds() / 3600, 2)


def _peak_occupancy(records: list[dict]) -> tuple[int, str | None]:
    current_count = 0
    peak_count = 0
    peak_time = None
    for record in sorted(records, key=lambda item: item.get("time") or ""):
        current_count += 1 if record.get("is_check_in") else -1
        if current_count > peak_count:
            peak_count = current_count
            peak_time = record.get("time")
    return peak_count, peak_time


def get_dashboard_summary(target_date: str = None):
    """Return the HR dashboard using batched reads instead of one query per employee."""
    supabase = get_supabase_client()
    target_date = target_date or datetime.now().strftime("%Y-%m-%d")

    try:
        # Four bounded reads replace the previous 3N+ queries for N employees.
        employees_response = (
            supabase.table("employees")
            .select("emp_id, emp_name, shift_start")
            .order("emp_name")
            .execute()
        )
        employees = employees_response.data or []
        employee_ids = {employee["emp_id"] for employee in employees}

        policies_response = (
            supabase.table("policies")
            .select("policy_name, policy_value")
            .in_("policy_name", ["Minimum Working Hours", "Late Threshold", "Half Day Threshold"])
            .execute()
        )
        policies = {
            policy["policy_name"]: float(policy["policy_value"])
            for policy in (policies_response.data or [])
        }
        minimum_hours = policies.get("Minimum Working Hours", 8.0)
        late_threshold = policies.get("Late Threshold", 15.0)
        half_day_threshold = policies.get("Half Day Threshold", 4.0)

        leave_response = (
            supabase.table("leave_requests")
            .select("emp_id")
            .eq("status", "Approved")
            .lte("from_date", target_date)
            .gte("to_date", target_date)
            .execute()
        )
        employees_on_leave = {
            row["emp_id"] for row in (leave_response.data or []) if row.get("emp_id") in employee_ids
        }

        access_response = (
            supabase.table("employee_access")
            .select("emp_id, is_check_in, time, floor")
            .eq("date", target_date)
            .order("time")
            .execute()
        )
        access_records = access_response.data or []
        records_by_employee = defaultdict(list)
        for record in access_records:
            records_by_employee[record["emp_id"]].append(record)

        attendance_counts = {
            "Present": 0,
            "Late": 0,
            "Half Day": 0,
            "Absent": 0,
            "On Leave": 0,
            "Incomplete": 0,
        }
        total_working_hours = 0.0
        employees_with_hours = 0

        for employee in employees:
            emp_id = employee["emp_id"]
            records = sorted(records_by_employee.get(emp_id, []), key=lambda item: item.get("time") or "")
            if not records:
                status = "On Leave" if emp_id in employees_on_leave else "Absent"
                attendance_counts[status] += 1
                continue

            check_in_record = next((record for record in records if record.get("is_check_in")), None)
            check_out_record = next((record for record in reversed(records) if not record.get("is_check_in")), None)
            check_in = check_in_record.get("time") if check_in_record else None
            check_out = check_out_record.get("time") if check_out_record else None

            if not check_in or not check_out:
                status = "Incomplete"
                total_hours = 0.0
            else:
                total_hours = _hours_between(check_in, check_out)
                late_minutes = _minutes_late(check_in, employee.get("shift_start"))
                if total_hours < half_day_threshold:
                    status = "Absent"
                elif total_hours < minimum_hours:
                    status = "Half Day"
                elif late_minutes > late_threshold:
                    status = "Late"
                else:
                    status = "Present"

            attendance_counts[status] += 1
            if total_hours > 0:
                total_working_hours += total_hours
                employees_with_hours += 1

        latest_status = {}
        for record in access_records:
            latest_status[record["emp_id"]] = record
        current_in = [record for record in latest_status.values() if record.get("is_check_in")]
        floor_breakdown = defaultdict(int)
        for record in current_in:
            floor_breakdown[f"Floor {record.get('floor')}"] += 1

        peak_count, peak_time = _peak_occupancy(access_records)
        average_hours = total_working_hours / employees_with_hours if employees_with_hours else 0.0
        average_hours_int = int(average_hours)
        average_minutes = int(round((average_hours - average_hours_int) * 60))
        if average_minutes == 60:
            average_hours_int += 1
            average_minutes = 0

        return {
            "status": "success",
            "date": target_date,
            "attendance_summary": {
                "total_employees": len(employees),
                "present": attendance_counts["Present"] + attendance_counts["Late"],
                "late": attendance_counts["Late"],
                "half_day": attendance_counts["Half Day"],
                "absent": attendance_counts["Absent"],
                "on_leave": attendance_counts["On Leave"],
                "incomplete": attendance_counts["Incomplete"],
            },
            "occupancy_summary": {
                "inside_office": len(current_in),
                "floor_breakdown": dict(floor_breakdown),
            },
            "peak_summary": {
                "peak_time": peak_time,
                "peak_employees": peak_count,
            },
            "average_time_in_office": f"{average_hours_int}h {average_minutes}m",
        }
    except Exception as exc:
        return {"status": "failed", "message": str(exc)}


if __name__ == "__main__":
    import json

    print(json.dumps(get_dashboard_summary("2026-08-13"), indent=2))
