/* Editorial Control Room: centralize API configuration and keep the UI a thin, explicit client. */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

export type ApiError = Error & { status?: number };

export type DashboardData = {
  status: string;
  date: string;
  attendance_summary?: {
    total_employees?: number;
    present?: number;
    late?: number;
    half_day?: number;
    absent?: number;
    on_leave?: number;
    incomplete?: number;
  };
  occupancy_summary?: {
    inside_office?: number;
    floor_breakdown?: Record<string, number>;
    is_live?: boolean;
    snapshot_label?: string;
    as_of_time?: string | null;
  };
  peak_summary?: {
    peak_time?: string | null;
    peak_employees?: number;
  };
  average_time_in_office?: string;
};

export type Employee = {
  id?: number;
  emp_id: string;
  emp_name: string;
  department: string;
  shift_start?: string | null;
  shift_end?: string | null;
};

export type AttendanceData = {
  status: string;
  emp_id: string;
  emp_name?: string;
  date: string;
  attendance_status?: string;
  check_in?: string | null;
  check_out?: string | null;
  total_hours?: number;
  late_minutes?: number;
  policy_applied?: {
    min_hours?: number;
    half_day_threshold?: number;
    late_threshold?: number;
  };
};

export type LeaveRequest = {
  id: number;
  emp_id: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | string;
  leave_days?: number;
};

export type OccupancyData = {
  status: string;
  date?: string;
  total_occupancy?: number;
  floor_occupancy?: Record<string, number>;
  peak_count?: number;
  peak_time?: string | null;
  is_live?: boolean;
  snapshot_label?: string;
  as_of_time?: string | null;
};

export type Policy = {
  id: number;
  policy_name: string;
  policy_value: number | string;
  description?: string | null;
};

function friendlyMessage(status: number, fallback: string) {
  if (status === 400) return fallback || "Please check the values and try again.";
  if (status === 404) return "We could not find that information.";
  if (status >= 500) return fallback || "The information service is temporarily unavailable.";
  return fallback || "We could not complete that action.";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw Object.assign(new Error("Backend URL is not configured."), { status: 0 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const backendMessage = typeof payload?.detail === "string" ? payload.detail : "";
      throw Object.assign(new Error(friendlyMessage(response.status, backendMessage)), {
        status: response.status,
      });
    }
    return payload as T;
  } catch (error) {
    if (error instanceof TypeError) {
      throw Object.assign(new Error("We could not reach the information service. Check the connection and try again."), { status: 0 });
    }
    throw error;
  }
}

export const api = {
  getDashboard: (date?: string) => request<DashboardData>(`/dashboard${date ? `?date=${encodeURIComponent(date)}` : ""}`),
  getEmployees: () => request<Employee[]>("/employees"),
  getAttendance: (empId: string, date: string) => request<AttendanceData>(`/attendance/${encodeURIComponent(empId)}/${encodeURIComponent(date)}`),
  getLeave: (empId: string) => request<{ status: string; data: LeaveRequest[] }>(`/leave/${encodeURIComponent(empId)}`),
  approveLeave: (id: number) => request<{ status: string; data: LeaveRequest }>(`/leave/${id}/approve`, { method: "PUT" }),
  rejectLeave: (id: number) => request<{ status: string; data: LeaveRequest }>(`/leave/${id}/reject`, { method: "PUT" }),
  getOccupancy: (date?: string) => request<OccupancyData>(`/occupancy${date ? `?date=${encodeURIComponent(date)}` : ""}`),
  getPolicies: () => request<Policy[]>("/policies"),
  updatePolicy: (id: number, policyValue: number) => request<{ status: string; data: Policy }>(`/policies/${id}`, {
    method: "PUT",
    body: JSON.stringify({ policy_value: policyValue }),
  }),
};

export function isUnavailable(error: unknown) {
  return Boolean((error as ApiError | undefined)?.status === 404);
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export { API_BASE_URL };

