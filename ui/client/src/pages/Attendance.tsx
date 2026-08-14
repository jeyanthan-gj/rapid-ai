/* Editorial Control Room: attendance is a lookup instrument; the backend remains the only calculator. */
import { useEffect, useState } from "react";
import { CalendarDays, Check, Clock3, Search, TimerReset } from "lucide-react";
import { AppShell, EmptyState, ErrorState, LoadingState, SectionIntro, SectionRule, StatusPill } from "@/components/AppShell";
import { api, AttendanceData, Employee, errorMessage } from "@/lib/api";
import { useActivePolling } from "@/hooks/useActivePolling";
import { todayInIndia } from "@/lib/date";

const today = todayInIndia();

export default function Attendance() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empId, setEmpId] = useState(() => new URLSearchParams(window.location.search).get("employee") || "EMP001");
  const [fromDirectory] = useState(() => new URLSearchParams(window.location.search).has("employee"));
  const [date, setDate] = useState(today);
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeeError, setEmployeeError] = useState<string | null>(null);

  useEffect(() => {
    api.getEmployees().then((result) => { setEmployees(result); if (result[0] && !result.find((employee) => employee.emp_id === empId)) setEmpId(result[0].emp_id); }).catch((err) => setEmployeeError(errorMessage(err))).finally(() => setLoadingEmployees(false));
  }, []);

  const lookup = async (event?: React.FormEvent, silent = false) => {
    event?.preventDefault();
    if (!empId || !date) return;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      setData(await api.getAttendance(empId, date));
    } catch (err) {
      if (!silent || !data) setError(errorMessage(err));
      if (!silent) setData(null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingEmployees && fromDirectory) void lookup();
  }, [loadingEmployees]);

  useActivePolling(() => lookup(undefined, true), Boolean(data && !loading && empId && date));

  return <AppShell>
    <SectionIntro eyebrow="ATTENDANCE / DAILY LOOKUP" title="Read the day, employee by employee." description="Select a person and date. Working hours, lateness, and status follow the latest HR rules saved in Policies." />
    <form className="lookup-strip" onSubmit={lookup}>
      <div className="field-group"><label htmlFor="attendance-employee">Employee</label>{employees.length ? <select id="attendance-employee" value={empId} onChange={(event) => setEmpId(event.target.value)}>{employees.map((employee) => <option key={employee.emp_id} value={employee.emp_id}>{employee.emp_id} · {employee.emp_name}</option>)}</select> : <input id="attendance-employee" value={empId} onChange={(event) => setEmpId(event.target.value)} placeholder="EMP001" />}</div>
      <div className="field-group"><label htmlFor="attendance-date">Date</label><div className="input-with-icon"><CalendarDays size={16} /><input id="attendance-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></div></div>
      <button className="primary-button" type="submit" disabled={loading || loadingEmployees}><Search size={16} />{loading ? "Reading…" : "Read attendance"}</button>
    </form>
    {employeeError && <div className="inline-note warning">We could not load the employee list. You can enter an employee ID manually or try again later.</div>}
    <SectionRule label="ATTENDANCE RESULT" />
    {loading ? <LoadingState label="Loading attendance" /> : error ? <ErrorState message={error} onRetry={() => void lookup()} /> : !data ? <EmptyState title="Choose a person and date" description="The selected attendance record will appear here." action={<span className="empty-hint"><TimerReset size={15} />Results follow the saved HR rules</span>} /> : <div className="attendance-result">
      <div className="result-head"><div><div className="mono-overline">{data.emp_id} / {data.date}</div><h2>{data.emp_name || data.emp_id}</h2></div><StatusPill status={data.attendance_status || "Unknown"} /></div>
      <div className="attendance-kpis"><div className="result-kpi"><span><Clock3 size={15} />Check-in</span><strong>{data.check_in || "—"}</strong></div><div className="result-kpi"><span><Clock3 size={15} />Check-out</span><strong>{data.check_out || "—"}</strong></div><div className="result-kpi"><span><TimerReset size={15} />Working hours</span><strong>{data.total_hours ?? 0}h</strong></div><div className="result-kpi"><span><Check size={15} />Late minutes</span><strong>{data.late_minutes ?? 0}m</strong></div></div>
      <div className="policy-readout"><span>Applied policy thresholds</span><span>Minimum {data.policy_applied?.min_hours ?? "—"}h</span><span>Half day {data.policy_applied?.half_day_threshold ?? "—"}h</span><span>Late {data.policy_applied?.late_threshold ?? "—"}m</span></div>
    </div>}
  </AppShell>;
}

