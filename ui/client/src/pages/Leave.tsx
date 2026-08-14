/* Editorial Control Room: HR reviews the leave decision ledger; employees do not submit requests from this console. */
import { useEffect, useState } from "react";
import { CalendarDays, Check, ClipboardList, X } from "lucide-react";
import { AppShell, EmptyState, ErrorState, LoadingState, SectionIntro, SectionRule, StatusPill } from "@/components/AppShell";
import { api, Employee, LeaveRequest, errorMessage } from "@/lib/api";
import { useActivePolling } from "@/hooks/useActivePolling";

export default function Leave() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [empId, setEmpId] = useState(() => new URLSearchParams(window.location.search).get("employee") || "EMP001");
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    api.getEmployees()
      .then((result) => {
        setEmployees(result);
        if (!result.find((employee) => employee.emp_id === empId) && result[0]) setEmpId(result[0].emp_id);
      })
      .catch(() => undefined)
      .finally(() => setLoadingEmployees(false));
  }, []);

  const load = async (id = empId, silent = false) => {
    if (!id) return;
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await api.getLeave(id);
      setRequests(result.data || []);
    } catch (err) {
      if (!silent || requests.length === 0) setError(errorMessage(err));
      if (!silent) setRequests([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingEmployees) void load();
  }, [loadingEmployees]);

  useActivePolling(() => load(empId, true), Boolean(!loadingEmployees && empId && !loading && !actionId));

  const updateStatus = async (id: number, nextStatus: "approve" | "reject") => {
    setActionId(id);
    setError(null);
    setNotice(null);
    try {
      if (nextStatus === "approve") await api.approveLeave(id);
      else await api.rejectLeave(id);
      setNotice(`Leave request ${nextStatus === "approve" ? "approved" : "rejected"}. Refreshing the ledger.`);
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  return <AppShell>
    <SectionIntro
      eyebrow="LEAVE / HR DECISION LEDGER"
      title="Review leave requests, not submissions."
      description="HR can review an employee's leave history and record an approval or rejection."
    />

    <div className="lookup-strip leave-filter-strip">
      <div className="field-group">
        <label htmlFor="leave-history-employee">Employee filter</label>
        {employees.length ? <select id="leave-history-employee" value={empId} onChange={(event) => { setEmpId(event.target.value); void load(event.target.value); }} disabled={loadingEmployees}>
          {employees.map((employee) => <option key={employee.emp_id} value={employee.emp_id}>{employee.emp_id} · {employee.emp_name}</option>)}
        </select> : <input id="leave-history-employee" value={empId} onChange={(event) => setEmpId(event.target.value)} placeholder="EMP001" />}
      </div>
      <button className="primary-button" type="button" onClick={() => void load()} disabled={loading || loadingEmployees}><ClipboardList size={16} />{loading ? "Reading…" : "Read request ledger"}</button>
    </div>

    <SectionRule label="LEAVE REQUEST LEDGER" />
    <section className="data-panel leave-list-panel">
      <div className="panel-heading">
        <div><span className="eyebrow"><span className="eyebrow-mark">01</span>HR REVIEW QUEUE</span><h2>Requests for {empId}</h2></div>
        <ClipboardList size={20} className="panel-icon" />
      </div>
      {loading ? <LoadingState label="Loading leave requests" /> : error ? <ErrorState message={error} onRetry={() => void load()} /> : requests.length === 0 ? <EmptyState title="No leave requests" description="This employee has no leave requests in the backend ledger." /> : <div className="leave-table">{requests.map((request) => <div className="leave-row" key={request.id}>
        <div><div className="mono-overline">#{request.id} · {request.emp_id}</div><strong>{request.leave_type}</strong><span className="leave-dates"><CalendarDays size={14} />{request.from_date} → {request.to_date} · {request.leave_days ?? "—"} days</span></div>
        <div className="leave-row-end"><StatusPill status={request.status} /><span className="leave-reason">{request.reason}</span>{request.status === "Pending" && <div className="action-group"><button className="approve-button" disabled={actionId === request.id} onClick={() => void updateStatus(request.id, "approve")}><Check size={14} />{actionId === request.id ? "Saving…" : "Approve"}</button><button className="reject-button" disabled={actionId === request.id} onClick={() => void updateStatus(request.id, "reject")}><X size={14} />Reject</button></div>}</div>
      </div>)}</div>}
    </section>

    {notice && <div className="inline-note success">{notice}</div>}
    {error && requests.length > 0 && <div className="inline-note warning">{error}</div>}
    <SectionRule label="POLICY NOTE" /><div className="text-block">Approval uses the current HR policy settings. This page is for HR decisions only; employees do not apply for leave here.</div>
  </AppShell>;
}
