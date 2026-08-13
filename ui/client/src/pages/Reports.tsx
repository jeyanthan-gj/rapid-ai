/* Editorial Control Room: reports are a compact HR index into live operational views, not a second business-logic layer. */
import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarRange, Clock3, FileText, RadioTower, RefreshCw } from "lucide-react";
import { AppShell, ErrorState, LoadingState, MetricCard, SectionIntro, SectionRule } from "@/components/AppShell";
import { api, DashboardData, OccupancyData, errorMessage } from "@/lib/api";

const today = new Date().toISOString().slice(0, 10);

type ReportSnapshot = {
  dashboard: DashboardData;
  occupancy: OccupancyData;
};

function formatPeakTime(value?: string | null) {
  if (!value) return "—";
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours)) return value;
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export default function Reports() {
  const [date, setDate] = useState(today);
  const [snapshot, setSnapshot] = useState<ReportSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboard, occupancy] = await Promise.all([api.getDashboard(date), api.getOccupancy(date)]);
      setSnapshot({ dashboard, occupancy });
    } catch (err) {
      setSnapshot(null);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [date]);

  const attendance = snapshot?.dashboard.attendance_summary ?? {};
  const occupancy = snapshot?.dashboard.occupancy_summary ?? {};
  const peak = snapshot?.dashboard.peak_summary ?? {};

  return <AppShell>
    <SectionIntro
      eyebrow="REPORTS / HR INDEX"
      title="Turn live signals into a useful brief."
      description="Use these concise report entry points for attendance, leave, time in office, and occupancy review. Detailed records remain in their source modules."
      action={<div className="date-control"><label htmlFor="reports-date">Report date</label><input id="reports-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} /><button className="icon-button" onClick={() => void load()} aria-label="Refresh reports"><RefreshCw size={16} /></button></div>}
    />

    {loading ? <LoadingState label="Loading report snapshot" /> : error ? <ErrorState message={error} onRetry={() => void load()} /> : <>
      <SectionRule label="REPORT SNAPSHOT" />
      <div className="metric-grid report-metrics">
        <MetricCard label="Attendance records" value={attendance.total_employees ?? 0} meta={`${attendance.present ?? 0} present · ${attendance.absent ?? 0} absent`} tone="cobalt" icon={<CalendarRange size={14} />} />
        <MetricCard label="Inside office" value={occupancy.inside_office ?? snapshot?.occupancy.total_occupancy ?? 0} meta="Current occupancy" tone="cyan" icon={<RadioTower size={14} />} />
        <MetricCard label="Peak occupancy" value={peak.peak_employees ?? snapshot?.occupancy.peak_count ?? 0} meta={`At ${formatPeakTime(peak.peak_time ?? snapshot?.occupancy.peak_time)}`} tone="amber" icon={<RadioTower size={14} />} />
        <MetricCard label="Average time" value={snapshot?.dashboard.average_time_in_office ?? "—"} meta="Time in office" tone="ink" icon={<Clock3 size={14} />} />
      </div>

      <SectionRule label="REPORT ENTRY POINTS" />
      <div className="report-grid">
        <a className="report-card" href="/attendance"><div className="report-card-index">01</div><div><FileText size={18} className="report-card-icon" /><h2>Attendance report</h2><p>Review check-in, check-out, working hours, late minutes, and status by employee and date.</p></div><ArrowUpRight size={16} /></a>
        <a className="report-card" href="/leave"><div className="report-card-index">02</div><div><FileText size={18} className="report-card-icon" /><h2>Leave report</h2><p>Open the HR decision ledger to inspect request dates, reasons, status, and approval actions.</p></div><ArrowUpRight size={16} /></a>
        <a className="report-card" href="/employees"><div className="report-card-index">03</div><div><Clock3 size={18} className="report-card-icon" /><h2>Time-in-office report</h2><p>Use the employee roster and attendance lookup together to inspect working rhythm per person.</p></div><ArrowUpRight size={16} /></a>
        <a className="report-card" href="/occupancy"><div className="report-card-index">04</div><div><RadioTower size={18} className="report-card-icon" /><h2>Occupancy report</h2><p>Read current employees inside, floor-wise distribution, peak count, and peak time.</p></div><ArrowUpRight size={16} /></a>
      </div>

      <div className="dashboard-footer-note"><span className="registration-mark">+</span><div><strong>Reports stay traceable.</strong><span>Each entry point opens the underlying HR module so decisions can be reviewed against the live source.</span></div><a href="/policies">Review policies <ArrowUpRight size={14} /></a></div>
    </>}
  </AppShell>;
}
