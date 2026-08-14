/* Editorial Control Room: a contained HR demo surface for simulating external employee events without changing the main administrative modules. */

import { FormEvent, useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, ClipboardList, LogIn, LogOut, RefreshCw, Send } from "lucide-react";
import { AppShell, EmptyState, ErrorState, LoadingState, SectionIntro, SectionRule, StatusPill } from "@/components/AppShell";
import { api, Employee, LeaveRequest, errorMessage } from "@/lib/api";
import { todayInIndia } from "@/lib/date";

const floorOptions = [1, 2, 3, 4];
const leaveTypes = ["Casual Leave", "Sick Leave"];

type Notice = { tone: "success" | "warning"; message: string };

export default function EmpCInCOut() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState("EMP001");
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [accessDate, setAccessDate] = useState(todayInIndia());
  const [accessTime, setAccessTime] = useState("09:00");
  const [floor, setFloor] = useState("1");
  const [accessAction, setAccessAction] = useState<"check-in" | "check-out">("check-in");
  const [accessSaving, setAccessSaving] = useState(false);
  const [accessNotice, setAccessNotice] = useState<Notice | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);

  const [leaveType, setLeaveType] = useState(leaveTypes[0]);
  const [leaveFrom, setLeaveFrom] = useState(todayInIndia());
  const [leaveTo, setLeaveTo] = useState(todayInIndia());
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveSaving, setLeaveSaving] = useState(false);
  const [leaveNotice, setLeaveNotice] = useState<Notice | null>(null);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    api.getEmployees()
      .then((result) => {
        setEmployees(result);
        if (!result.some((employee) => employee.emp_id === employeeId) && result[0]) {
          setEmployeeId(result[0].emp_id);
        }
      })
      .catch((error) => setAccessError(errorMessage(error)))
      .finally(() => setLoadingEmployees(false));
  }, []);

  const loadLeaveStatus = async (id = employeeId) => {
    if (!id) return;
    setLoadingRequests(true);
    setLeaveError(null);
    try {
      const result = await api.getLeave(id);
      setRequests(result.data || []);
    } catch (error) {
      setRequests([]);
      setLeaveError(errorMessage(error));
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (!loadingEmployees) void loadLeaveStatus();
  }, [loadingEmployees]);

  const handleEmployeeChange = (id: string) => {
    setEmployeeId(id);
    void loadLeaveStatus(id);
  };

  const submitAccess = async (event: FormEvent) => {
    event.preventDefault();
    setAccessSaving(true);
    setAccessNotice(null);
    setAccessError(null);
    try {
      const result = await api.logAccess({
        emp_id: employeeId,
        is_check_in: accessAction === "check-in",
        time: accessTime.length === 5 ? `${accessTime}:00` : accessTime,
        date: accessDate,
        floor: Number(floor),
      });
      setAccessNotice({ tone: "success", message: result.message || `${accessAction === "check-in" ? "Check-in" : "Check-out"} recorded for ${employeeId}.` });
    } catch (error) {
      setAccessError(errorMessage(error));
    } finally {
      setAccessSaving(false);
    }
  };

  const submitLeave = async (event: FormEvent) => {
    event.preventDefault();
    setLeaveSaving(true);
    setLeaveNotice(null);
    setLeaveError(null);
    try {
      const result = await api.applyLeave({
        emp_id: employeeId,
        leave_type: leaveType,
        from_date: leaveFrom,
        to_date: leaveTo,
        reason: leaveReason.trim(),
      });
      const days = result.data?.leave_days;
      setLeaveNotice({ tone: "success", message: `Leave request recorded for ${employeeId}${days ? ` · ${days} day${days === 1 ? "" : "s"}` : ""}.` });
      setLeaveReason("");
      await loadLeaveStatus();
    } catch (error) {
      setLeaveError(errorMessage(error));
    } finally {
      setLeaveSaving(false);
    }
  };

  const employeeLabel = employees.find((employee) => employee.emp_id === employeeId);

  return <AppShell>
    <SectionIntro
      eyebrow="LIVE DEMO / EMPLOYEE EVENTS"
      title="Record a day in the office."
      description="Use this operator page to record an employee event for a live walkthrough. The HR console will reflect it in attendance, occupancy, or leave review after the next refresh."
    />

    <div className="demo-callout">
      <div className="demo-callout-mark">01</div>
      <div><strong>Operator workstation</strong><p>This separate surface records external employee events for demonstration. The main HR navigation remains focused on review, decisions, and reporting.</p></div>
      <span className="demo-callout-note">LIVE WALKTHROUGH<br />IST / UTC+05:30</span>
    </div>

    <div className="demo-ops-grid">
    <section className="form-panel demo-form-panel demo-operation-panel">
      <div className="panel-heading">
        <div><span className="eyebrow"><span className="eyebrow-mark">///</span>ACCESS EVENT <span className="endpoint-note">POST /EMP</span></span><h2>Check-in or check-out</h2></div>
        {accessAction === "check-in" ? <LogIn size={20} className="panel-icon" /> : <LogOut size={20} className="panel-icon" />}
      </div>
      <p className="text-block demo-helper">Choose an employee, floor, date, and time to record the event. Attendance and occupancy will use it after the next refresh.</p>
      <form className="demo-form-grid" onSubmit={submitAccess}>
        <div className="field-group demo-field-wide">
          <label htmlFor="demo-access-employee">Employee</label>
          {employees.length ? <select id="demo-access-employee" value={employeeId} onChange={(event) => handleEmployeeChange(event.target.value)} disabled={loadingEmployees}>
            {employees.map((employee) => <option key={employee.emp_id} value={employee.emp_id}>{employee.emp_id} · {employee.emp_name} · {employee.department}</option>)}
          </select> : <input id="demo-access-employee" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} placeholder="EMP001" required />}
        </div>
        <div className="field-group">
          <label htmlFor="demo-access-floor">Office floor</label>
          <select id="demo-access-floor" value={floor} onChange={(event) => setFloor(event.target.value)}>{floorOptions.map((value) => <option key={value} value={value}>Floor {value}</option>)}</select>
        </div>
        <div className="field-group">
          <label htmlFor="demo-access-date">Date (IST)</label>
          <input id="demo-access-date" type="date" value={accessDate} onChange={(event) => setAccessDate(event.target.value)} required />
        </div>
        <div className="field-group">
          <label htmlFor="demo-access-time">Time (IST)</label>
          <input id="demo-access-time" type="time" value={accessTime} onChange={(event) => setAccessTime(event.target.value)} required />
        </div>
        <div className="field-group demo-action-field">
          <label>Event type</label>
          <div className="demo-choice-row" role="group" aria-label="Event type">
            <button type="button" className={`demo-choice ${accessAction === "check-in" ? "is-selected" : ""}`} onClick={() => setAccessAction("check-in")}><LogIn size={15} />Check in</button>
            <button type="button" className={`demo-choice ${accessAction === "check-out" ? "is-selected" : ""}`} onClick={() => setAccessAction("check-out")}><LogOut size={15} />Check out</button>
          </div>
        </div>
        <button className="primary-button demo-submit" type="submit" disabled={accessSaving || loadingEmployees || !employeeId}>{accessSaving ? "Saving event…" : `Record ${accessAction === "check-in" ? "check-in" : "check-out"}`}<Send size={15} /></button>
      </form>
      {accessNotice && <div className={`inline-note ${accessNotice.tone}`}>{accessNotice.message}</div>}
      {accessError && <div className="inline-note warning">{accessError}</div>}
    </section>

        <section className="form-panel demo-form-panel demo-operation-panel">
      <div className="panel-heading">
        <div><span className="eyebrow"><span className="eyebrow-mark">///</span>LEAVE REQUEST <span className="endpoint-note">POST /LEAVE</span></span><h2>Record a leave request</h2></div>
        <CalendarDays size={20} className="panel-icon" />
      </div>
      <p className="text-block demo-helper">Record a request for HR review. Policy limits are checked before the request enters the leave ledger as Pending.</p>
      <form className="demo-form-grid" onSubmit={submitLeave}>
        <div className="field-group demo-field-wide">
          <label htmlFor="demo-leave-employee">Employee</label>
          {employees.length ? <select id="demo-leave-employee" value={employeeId} onChange={(event) => handleEmployeeChange(event.target.value)} disabled={loadingEmployees}>
            {employees.map((employee) => <option key={employee.emp_id} value={employee.emp_id}>{employee.emp_id} · {employee.emp_name}</option>)}
          </select> : <input id="demo-leave-employee" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} placeholder="EMP001" required />}
        </div>
        <div className="field-group">
          <label htmlFor="demo-leave-type">Leave type</label>
          <select id="demo-leave-type" value={leaveType} onChange={(event) => setLeaveType(event.target.value)}>{leaveTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select>
        </div>
        <div className="field-group">
          <label htmlFor="demo-leave-from">From date</label>
          <input id="demo-leave-from" type="date" value={leaveFrom} onChange={(event) => setLeaveFrom(event.target.value)} required />
        </div>
        <div className="field-group">
          <label htmlFor="demo-leave-to">To date</label>
          <input id="demo-leave-to" type="date" value={leaveTo} onChange={(event) => setLeaveTo(event.target.value)} min={leaveFrom} required />
        </div>
        <div className="field-group demo-field-wide">
          <label htmlFor="demo-leave-reason">Reason</label>
          <textarea id="demo-leave-reason" value={leaveReason} onChange={(event) => setLeaveReason(event.target.value)} placeholder="For example: personal work" rows={3} required />
        </div>
        <button className="primary-button demo-submit" type="submit" disabled={leaveSaving || loadingEmployees || !employeeId || !leaveReason.trim()}>{leaveSaving ? "Sending request…" : "Send leave request"}<Send size={15} /></button>
      </form>
      {leaveNotice && <div className={`inline-note ${leaveNotice.tone}`}>{leaveNotice.message}</div>}
      {leaveError && <div className="inline-note warning">{leaveError}</div>}
    </section>
    </div>

    <SectionRule label="LEAVE STATUS" />
    <section className="data-panel demo-status-panel">
      <div className="panel-heading">
        <div><span className="eyebrow"><span className="eyebrow-mark">03</span>GET /LEAVE/{employeeId || "EMP001"}</span><h2>{employeeLabel ? `${employeeLabel.emp_name}'s requests` : `Requests for ${employeeId || "employee"}`}</h2></div>
        <button className="ghost-button" type="button" onClick={() => void loadLeaveStatus()} disabled={loadingRequests || !employeeId}><RefreshCw size={15} />Refresh</button>
      </div>
      {loadingRequests ? <LoadingState label="Reading leave status" /> : leaveError ? <ErrorState message={leaveError} onRetry={() => void loadLeaveStatus()} /> : requests.length === 0 ? <EmptyState title="No leave requests yet" description="Submit a request above and its status will appear here." /> : <div className="demo-status-list">{requests.map((request) => <div className="demo-status-row" key={request.id}>
        <div><div className="mono-overline">#{request.id} · {request.leave_type}</div><strong>{request.from_date} → {request.to_date}</strong><span>{request.reason} · {request.leave_days ?? "—"} days</span></div>
        <StatusPill status={request.status} />
      </div>)}</div>}
      <div className="demo-status-footer"><CheckCircle2 size={15} /> Status is read from the same leave ledger used by HR approval screens.</div>
    </section>
  </AppShell>;
}
