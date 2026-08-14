/* Editorial Control Room: the employee directory is a calm HR worklist with plain-language filters and obvious next actions. */
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ClipboardList, ListFilter, RefreshCw, Search, UserRound } from "lucide-react";
import { AppShell, EmptyState, ErrorState, LoadingState, SectionIntro, SectionRule } from "@/components/AppShell";
import { api, Employee, errorMessage } from "@/lib/api";
import { useActivePolling } from "@/hooks/useActivePolling";

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      setEmployees(await api.getEmployees());
    } catch (err) {
      if (!silent || employees.length === 0) setError(errorMessage(err));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);
  useActivePolling(() => load(true), !loading);

  const departments = useMemo(() => Array.from(new Set(employees.map((employee) => employee.department).filter(Boolean))).sort(), [employees]);
  const filtered = employees.filter((employee) => {
    const searchText = [employee.emp_id, employee.emp_name, employee.department].join(" ").toLowerCase();
    const matchesSearch = searchText.includes(query.trim().toLowerCase());
    const matchesDepartment = department === "All departments" || employee.department === department;
    return matchesSearch && matchesDepartment;
  });

  return <AppShell>
    <SectionIntro
      eyebrow="PEOPLE / EMPLOYEE DIRECTORY"
      title="Find the right person quickly."
      description="Search the employee directory by name or employee ID, narrow it by department, then open the attendance or leave record you need."
      action={<div className="roster-actions"><div className="search-control"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or ID" aria-label="Search by employee name or ID" /></div><button className="icon-button" onClick={() => void load()} disabled={loading} aria-label="Refresh employee directory" title="Refresh employee directory"><RefreshCw size={16} /></button></div>}
    />

    <div className="roster-toolbar">
      <div className="filter-control"><ListFilter size={16} /><label htmlFor="department-filter">Department</label><select id="department-filter" value={department} onChange={(event) => setDepartment(event.target.value)}><option>All departments</option>{departments.map((name) => <option key={name}>{name}</option>)}</select></div>
      <div className="roster-summary"><strong>{filtered.length}</strong> shown of <strong>{employees.length}</strong> employees</div>
    </div>

    <SectionRule label="EMPLOYEE DIRECTORY" />
    {loading ? <LoadingState label="Loading employee directory" /> : error && employees.length === 0 ? <ErrorState message={error} onRetry={() => void load()} /> : filtered.length === 0 ? <EmptyState title="No employees match this search" description={employees.length ? "Try a different name, employee ID, or department." : "No employees have been added yet."} /> : <>
      {error && <div className="inline-note warning">We could not refresh the directory. Showing the last available list.</div>}
      <div className="table-frame"><table className="data-table roster-table"><thead><tr><th>Employee</th><th>Department</th><th>Normal working hours</th><th>What would you like to do?</th></tr></thead><tbody>{filtered.map((employee) => <tr key={employee.emp_id}><td><div className="person-cell"><span className="avatar-mark"><UserRound size={15} /></span><div><strong>{employee.emp_name}</strong><span className="employee-id">{employee.emp_id}</span></div></div></td><td>{employee.department || "Not assigned"}</td><td><span className="shift-cell">{employee.shift_start?.slice(0, 5) ?? "—"} <span>to</span> {employee.shift_end?.slice(0, 5) ?? "—"}</span></td><td><div className="row-actions"><a className="row-action" href={`/attendance?employee=${encodeURIComponent(employee.emp_id)}`}><CalendarDays size={14} />Attendance</a><a className="row-action" href={`/leave?employee=${encodeURIComponent(employee.emp_id)}`}><ClipboardList size={14} />Leave</a></div></td></tr>)}</tbody></table></div>
    </>}

    <div className="directory-help"><span className="registration-mark">+</span><div><strong>Simple rule for the directory.</strong><span>Choose a person, then choose the record you want to review. This screen does not change employee information.</span></div></div>
  </AppShell>;
}
