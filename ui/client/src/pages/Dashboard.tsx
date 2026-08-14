/* Editorial Control Room: today's read begins with signal, then opens into human-readable detail. */
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Clock3, RadioTower, RefreshCw, UsersRound } from "lucide-react";
import { AppShell, ErrorState, LoadingState, MetricCard, SectionIntro, SectionRule, StatusPill } from "@/components/AppShell";
import { api, DashboardData, errorMessage } from "@/lib/api";
import { useActivePolling } from "@/hooks/useActivePolling";
import { todayInIndia } from "@/lib/date";

const today = todayInIndia();

function formatPeakTime(value?: string | null) {
  if (!value) return "—";
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours)) return value;
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function maxFloorValue(breakdown: Record<string, number> = {}) {
  return Math.max(...Object.values(breakdown), 1);
}

function safeCount(value?: number) {
  return Math.max(Number(value ?? 0), 0);
}

function percentageOf(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function DashboardSkeleton({ error, onRetry }: { error: string; onRetry: () => void }) {
  return <>
    <div className="hero-summary dashboard-skeleton-hero">
      <div className="hero-summary-copy"><div className="eyebrow"><span className="eyebrow-mark">01</span>AT A GLANCE</div><div className="hero-number">—</div><div className="hero-label">Employee total is not available yet</div></div>
      <div className="hero-summary-aside"><div className="hero-aside-label">Office occupancy</div><div className="hero-aside-value">—<span> not available</span></div><div className="hero-aside-rule" /><div className="hero-aside-label">Busiest time</div><div className="hero-aside-value small">— <span>not available</span></div></div>
    </div>
    <SectionRule label="ATTENDANCE / STATUS MIX" />
    <div className="metric-grid attendance-metrics">{["Present", "Half day", "Absent", "On leave"].map((label, index) => <MetricCard key={label} label={label} value="—" meta="Not available yet" tone={["cobalt", "amber", "coral", "cyan"][index]} />)}</div>
    <div className="dashboard-grid">
      <section className="data-panel occupancy-panel"><div className="panel-heading"><div><span className="eyebrow"><span className="eyebrow-mark">02</span>LIVE FOOTPRINT</span><h2>Where people are now</h2></div><StatusPill status="Live" /></div><div className="skeleton-bars">{["Floor 1", "Floor 2", "Floor 3"].map((floor) => <div className="floor-row" key={floor}><div className="floor-row-top"><span>{floor}</span><strong>—</strong></div><div className="bar-track"><div className="bar-fill" style={{ width: "34%" }} /></div></div>)}</div><ErrorState message={error} onRetry={onRetry} compact /></section>
      <section className="data-panel rhythm-panel"><div className="panel-heading"><div><span className="eyebrow"><span className="eyebrow-mark">03</span>WORKING RHYTHM</span><h2>The day in motion</h2></div><Clock3 size={20} className="panel-icon" /></div><div className="rhythm-stat"><span>Average time in office</span><strong>—</strong></div><div className="peak-card"><div className="peak-card-top"><span>Peak occupancy</span><RadioTower size={17} /></div><strong>—</strong><span className="peak-time">No occupancy data yet</span></div><div className="rhythm-note">The dashboard will fill in when the daily information is available.</div></section>
    </div>
  </>;
}

export default function Dashboard() {
  const [date, setDate] = useState(today);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      setData(await api.getDashboard(date));
    } catch (err) {
      if (!silent || !data) setError(errorMessage(err));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [date]);
  useActivePolling(() => load(true), Boolean(data && !loading));

  const attendance = data?.attendance_summary ?? {};
  const occupancy = data?.occupancy_summary ?? {};
  const peak = data?.peak_summary ?? {};
  const isLive = occupancy.is_live ?? date === today;
  const floorBreakdown = occupancy.floor_breakdown ?? {};
  const floorMax = useMemo(() => maxFloorValue(floorBreakdown), [floorBreakdown]);
  const totalEmployees = safeCount(attendance.total_employees);
  const late = safeCount(attendance.late);
  // The backend's `present` count includes late arrivals for compatibility. Split it here so the HR status mix is mutually exclusive.
  const present = Math.max(safeCount(attendance.present) - late, 0);
  const statusRows = [
    { label: "Present", value: present, tone: "cobalt" },
    { label: "Late", value: late, tone: "amber" },
    { label: "Half day", value: safeCount(attendance.half_day), tone: "cyan" },
    { label: "Absent", value: safeCount(attendance.absent), tone: "coral" },
    { label: "On leave", value: safeCount(attendance.on_leave), tone: "ink" },
    { label: "Incomplete", value: safeCount(attendance.incomplete), tone: "amber" },
  ];

  return <AppShell>
    <SectionIntro
      eyebrow={`DAILY CONTROL ROOM / ${date} / ${isLive ? "LIVE IST" : "HISTORICAL SNAPSHOT"}`}
      title="Today, in one clear read."
      description={isLive ? "A live view of today’s people flow in India Standard Time, attendance, and the decisions waiting for HR." : "A historical view of people flow, attendance, and the decisions recorded on the selected date."}
      action={<div className="date-control"><label htmlFor="dashboard-date">Report date</label><input id="dashboard-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} /><button className="icon-button" onClick={() => void load()} aria-label="Refresh dashboard"><RefreshCw size={16} /></button></div>}
    />

    {loading ? <LoadingState label="Loading dashboard" /> : error ? <DashboardSkeleton error={error} onRetry={() => void load()} /> : <>
      <div className="hero-summary">
        <div className="hero-summary-copy">
          <div className="eyebrow"><span className="eyebrow-mark">01</span>AT A GLANCE</div>
          <div className="hero-number">{attendance.total_employees ?? 0}</div>
          <div className="hero-label">Employees on the selected date</div>
          <div className="hero-note"><span className="signal-dot tone-cyan" /> {isLive ? `Live today in IST · ${date}` : `Historical snapshot · ${date}`}</div>
        </div>
        <div className="hero-summary-aside">
          <div className="hero-aside-label">{isLive ? "Office occupancy now" : "Last recorded occupancy"}</div>
          <div className="hero-aside-value">{occupancy.inside_office ?? 0}<span>{isLive ? " inside now" : " inside at day end"}</span></div>
          <div className="hero-aside-rule" />
          <div className="hero-aside-label">Busiest time</div>
          <div className="hero-aside-value small">{peak.peak_employees ?? 0} <span>at {formatPeakTime(peak.peak_time)}</span></div>
        </div>
      </div>

      <SectionRule label="ATTENDANCE / STATUS MIX" />
      <div className="metric-grid attendance-metrics">
        {statusRows.map((row) => <MetricCard key={row.label} label={row.label} value={row.value} meta={`${percentageOf(row.value, totalEmployees)}% of employees`} tone={row.tone} />)}
      </div>

      <div className="dashboard-grid">
        <section className="data-panel occupancy-panel">
          <div className="panel-heading"><div><span className="eyebrow"><span className="eyebrow-mark">02</span>{isLive ? "LIVE FOOTPRINT" : "HISTORICAL FOOTPRINT"}</span><h2>{isLive ? "Where people are now" : "Where people were last recorded"}</h2></div><StatusPill status={isLive ? "Live" : "Snapshot"} /></div>
          <div className="occupancy-total"><UsersRound size={19} /><strong>{occupancy.inside_office ?? 0}</strong><span>{isLive ? "inside the office now" : "inside at the end of the selected day"}</span></div>
          <div className="floor-bars">
            {Object.keys(floorBreakdown).length ? Object.entries(floorBreakdown).map(([floor, value]) => <div className="floor-row" key={floor}><div className="floor-row-top"><span>{floor}</span><strong>{value}</strong></div><div className="bar-track"><div className="bar-fill" style={{ width: `${(value / floorMax) * 100}%` }} /></div></div>) : <div className="panel-empty">No occupancy records for this date.</div>}
          </div>
          <a href="/occupancy" className="panel-link">Open occupancy view <ArrowUpRight size={15} /></a>
        </section>

        <section className="data-panel rhythm-panel">
          <div className="panel-heading"><div><span className="eyebrow"><span className="eyebrow-mark">03</span>WORKING RHYTHM</span><h2>The day in motion</h2></div><Clock3 size={20} className="panel-icon" /></div>
          <div className="rhythm-stat"><span>Average time in office</span><strong>{data?.average_time_in_office ?? "—"}</strong></div>
          <div className="peak-card"><div className="peak-card-top"><span>Peak occupancy</span><RadioTower size={17} /></div><strong>{peak.peak_employees ?? 0}</strong><span className="peak-time">employees · {formatPeakTime(peak.peak_time)}</span></div>
          <div className="rhythm-note">{isLive ? "Use this live summary to spot attendance or occupancy items that need attention today." : "Use this historical snapshot to review what was recorded on the selected date."}</div>
        </section>
      </div>

      <div className="dashboard-footer-note"><span className="registration-mark">+</span><div><strong>Attendance follows your HR rules.</strong><span>Attendance results use the latest values saved on the Policies page.</span></div><a href="/policies">Review policies <ArrowUpRight size={14} /></a></div>
    </>}
  </AppShell>;
}

