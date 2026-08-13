/* Editorial Control Room: the leave view is a decision ledger—clear status, explicit actions, refreshed source data. */
import { useEffect, useState } from "react";
import { CalendarDays, Check, FilePlus2, X } from "lucide-react";
import { AppShell, EmptyState, ErrorState, LoadingState, SectionIntro, SectionRule, StatusPill } from "@/components/AppShell";
import { api, Employee, LeaveRequest, errorMessage } from "@/lib/api";

const blankForm = { emp_id: "EMP001", leave_type: "Casual Leave", from_date: "", to_date: "", reason: "" };

export default function Leave() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empId, setEmpId] = useState("EMP001");
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => { api.getEmployees().then((result) => { setEmployees(result); if (result[0]) { setEmpId(result[0].emp_id); setForm((current) => ({ ...current, emp_id: result[0].emp_id })); } }).catch(() => undefined).finally(() => setLoadingEmployees(false)); }, []);

  const load = async (id = empId) => {
    if (!id) return;
    setLoading(true); setError(null);
    try { const result = await api.getLeave(id); setRequests(result.data || []); } catch (err) { setError(errorMessage(err)); setRequests([]); } finally { setLoading(false); }
  };

  useEffect(() => { if (!loadingEmployees) void load(); }, [loadingEmployees]);

  const apply = async (event: React.FormEvent) => {
    event.preventDefault(); setNotice(null); setError(null);
    try { await api.applyLeave(form); setNotice("Leave request saved. Refreshing the ledger."); await load(form.emp_id); setForm((current) => ({ ...current, from_date: "", to_date: "", reason: "" })); } catch (err) { setError(errorMessage(err)); }
  };

  const updateStatus = async (id: number, nextStatus: "approve" | "reject") => {
    setActionId(id); setError(null); setNotice(null);
    try { if (nextStatus === "approve") await api.approveLeave(id); else await api.rejectLeave(id); setNotice(`Leave request ${nextStatus === "approve" ? "approved" : "rejected"}. Refreshing the ledger.`); await load(); } catch (err) { setError(errorMessage(err)); } finally { setActionId(null); }
  };

  return <AppShell>
    <SectionIntro eyebrow="LEAVE / DECISION LEDGER" title="Keep leave decisions visible." description="Review requests, make a decision, and keep the source-of-truth ledger current." />
    <div className="leave-layout">
      <section className="form-panel"><div className="panel-heading"><div><span className="eyebrow"><span className="eyebrow-mark">01</span>NEW REQUEST</span><h2>Apply for leave</h2></div><FilePlus2 size={20} className="panel-icon" /></div><form className="stack-form" onSubmit={apply}><div className="field-group"><label htmlFor="leave-employee">Employee</label>{employees.length ? <select id="leave-employee" value={form.emp_id} onChange={(event) => { setForm({ ...form, emp_id: event.target.value }); setEmpId(event.target.value); }} disabled={loadingEmployees}>{employees.map((employee) => <option key={employee.emp_id} value={employee.emp_id}>{employee.emp_id} · {employee.emp_name}</option>)}</select> : <input id="leave-employee" value={form.emp_id} onChange={(event) => setForm({ ...form, emp_id: event.target.value })} />}</div><div className="form-row"><div className="field-group"><label htmlFor="leave-type">Leave type</label><select id="leave-type" value={form.leave_type} onChange={(event) => setForm({ ...form, leave_type: event.target.value })}><option>Casual Leave</option><option>Sick Leave</option></select></div><div className="field-group"><label htmlFor="leave-from">From</label><input id="leave-from" type="date" required value={form.from_date} onChange={(event) => setForm({ ...form, from_date: event.target.value })} /></div></div><div className="form-row"><div className="field-group"><label htmlFor="leave-to">To</label><input id="leave-to" type="date" required value={form.to_date} onChange={(event) => setForm({ ...form, to_date: event.target.value })} /></div><div className="field-group"><label htmlFor="leave-reason">Reason</label><input id="leave-reason" required value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Personal work" /></div></div><button className="primary-button" type="submit"><FilePlus2 size={16} />Submit request</button></form></section>
      <section className="data-panel leave-list-panel"><div className="panel-heading"><div><span className="eyebrow"><span className="eyebrow-mark">02</span>EMPLOYEE HISTORY</span><h2>Request status</h2></div><div className="employee-picker"><label htmlFor="leave-history-employee">Read</label><select id="leave-history-employee" value={empId} onChange={(event) => { setEmpId(event.target.value); void load(event.target.value); }}>{employees.length ? employees.map((employee) => <option key={employee.emp_id} value={employee.emp_id}>{employee.emp_id}</option>) : <option value={empId}>{empId}</option>}</select></div></div>{loading ? <LoadingState label="Loading leave requests" /> : error ? <ErrorState message={error} onRetry={() => void load()} /> : requests.length === 0 ? <EmptyState title="No leave requests" description="This employee has no leave requests in the backend ledger." /> : <div className="leave-table">{requests.map((request) => <div className="leave-row" key={request.id}><div><div className="mono-overline">#{request.id} · {request.emp_id}</div><strong>{request.leave_type}</strong><span className="leave-dates"><CalendarDays size={14} />{request.from_date} → {request.to_date} · {request.leave_days ?? "—"} days</span></div><div className="leave-row-end"><StatusPill status={request.status} /><span className="leave-reason">{request.reason}</span>{request.status === "Pending" && <div className="action-group"><button className="approve-button" disabled={actionId === request.id} onClick={() => void updateStatus(request.id, "approve")}><Check size={14} />Approve</button><button className="reject-button" disabled={actionId === request.id} onClick={() => void updateStatus(request.id, "reject")}><X size={14} />Reject</button></div>}</div></div>)}</div>}</section>
    </div>
    {notice && <div className="inline-note success">{notice}</div>}
    {error && requests.length > 0 && <div className="inline-note warning">{error}</div>}
    <SectionRule label="POLICY NOTE" /><div className="text-block">Approval checks are performed by the backend against live policy values. This view only submits actions and re-reads the source data.</div>
  </AppShell>;
}

