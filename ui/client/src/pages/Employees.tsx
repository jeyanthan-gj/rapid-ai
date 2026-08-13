/* Editorial Control Room: employee data reads like a clean operational ledger, not a generic admin grid. */
import { useEffect, useState } from "react";
import { Search, UserRound } from "lucide-react";
import { AppShell, EmptyState, ErrorState, LoadingState, SectionIntro, SectionRule } from "@/components/AppShell";
import { api, Employee, errorMessage } from "@/lib/api";

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setEmployees(await api.getEmployees());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = employees.filter((employee) => [employee.emp_id, employee.emp_name, employee.department].join(" ").toLowerCase().includes(query.toLowerCase()));

  const ledgerSkeleton = <div className="table-frame ledger-skeleton"><table className="data-table"><thead><tr><th>Employee ID</th><th>Name</th><th>Department</th><th>Shift</th><th>Record</th></tr></thead><tbody>{["EMP001", "EMP002", "EMP003"].map((id) => <tr key={id}><td><span className="mono-chip">{id}</span></td><td><div className="person-cell"><span className="avatar-mark"><UserRound size={15} /></span><span className="skeleton-text">Awaiting roster</span></div></td><td><span className="skeleton-text">—</span></td><td><span className="shift-cell">— <span>to</span> —</span></td><td><span className="table-status"><span className="status-dot" />Pending</span></td></tr>)}</tbody></table><ErrorState message={error ?? "Roster signal is waiting."} onRetry={() => void load()} compact /></div>;

  return <AppShell>
    <SectionIntro eyebrow="PEOPLE / ROSTER" title="The employee ledger." description="The current people roster, shifts, and departments from the HR system." action={<div className="search-control"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people" aria-label="Search employees" /></div>} />
    <SectionRule label={`${employees.length || "—"} EMPLOYEES / CURRENT ROSTER`} />
    {loading ? <LoadingState label="Loading employees" /> : error ? ledgerSkeleton : filtered.length === 0 ? <EmptyState title="No employees found" description={employees.length ? "Try a different search term." : "The backend did not return a roster for this view."} /> : <div className="table-frame"><table className="data-table"><thead><tr><th>Employee ID</th><th>Name</th><th>Department</th><th>Shift</th><th>Record</th></tr></thead><tbody>{filtered.map((employee) => <tr key={employee.emp_id}><td><span className="mono-chip">{employee.emp_id}</span></td><td><div className="person-cell"><span className="avatar-mark"><UserRound size={15} /></span><strong>{employee.emp_name}</strong></div></td><td>{employee.department}</td><td><span className="shift-cell">{employee.shift_start?.slice(0, 5) ?? "—"} <span>to</span> {employee.shift_end?.slice(0, 5) ?? "—"}</span></td><td><span className="table-status"><span className="status-dot status-dot-cyan" />Active roster</span></td></tr>)}</tbody></table></div>}
  </AppShell>;
}

