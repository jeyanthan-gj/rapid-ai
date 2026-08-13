/* Editorial Control Room: occupancy is a live signal—quiet canvas, strong numerals, floor bars that carry the reading. */
import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpRight, RadioTower, RefreshCw } from "lucide-react";
import { AppShell, EmptyState, ErrorState, LoadingState, MetricCard, SectionIntro, SectionRule } from "@/components/AppShell";
import { api, OccupancyData, errorMessage } from "@/lib/api";
import { todayInIndia } from "@/lib/date";

const today = todayInIndia();

function formatPeakTime(value?: string | null) {
  if (!value) return "Not provided";
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h)) return value;
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export default function Occupancy() {
  const [date, setDate] = useState(today);
  const [data, setData] = useState<OccupancyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => { setLoading(true); setError(null); try { setData(await api.getOccupancy(date)); } catch (err) { setError(errorMessage(err)); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [date]);
  const floorBreakdown = data?.floor_occupancy ?? {};
  const floorMax = useMemo(() => Math.max(...Object.values(floorBreakdown), 1), [floorBreakdown]);
  const isLive = data?.is_live ?? date === today;
  const viewLabel = isLive ? "Live now" : "End-of-day snapshot";
  const viewDescription = isLive ? "Today’s occupancy in India Standard Time, based on the latest access events." : "A historical snapshot based on the last access events recorded for the selected date.";
  const occupancySkeleton = <><div className="metric-grid occupancy-metrics"><MetricCard label="Inside office" value="—" meta="Awaiting live signal" tone="cyan" icon={<Activity size={15} />} /><MetricCard label="Floors reporting" value="—" meta="Awaiting floor events" tone="ink" /><MetricCard label="Peak employees" value="—" meta="Peak not read" tone="amber" icon={<RadioTower size={15} />} /></div><SectionRule label="FLOOR DISTRIBUTION" /><section className="data-panel wide-panel"><div className="panel-heading"><div><span className="eyebrow"><span className="eyebrow-mark">01</span>LIVE FLOOR READ</span><h2>Where people are now</h2></div><span className="live-pulse"><span /> Source: employee access</span></div><div className="large-floor-list">{["Floor 1", "Floor 2", "Floor 3"].map((floor) => <div className="large-floor-row" key={floor}><div className="large-floor-label"><span>{floor}</span><strong>—</strong></div><div className="large-bar-track"><div className="large-bar-fill" style={{ width: "28%" }} /></div><span className="floor-share">—</span></div>)}</div><ErrorState message={error ?? "Occupancy signal is waiting."} onRetry={() => void load()} compact /></section></>;

  return <AppShell>
    <SectionIntro eyebrow={`OCCUPANCY / ${viewLabel.toUpperCase()}`} title="See the office in motion." description={viewDescription} action={<div className="date-control"><label htmlFor="occupancy-date">Report date</label><input id="occupancy-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} /><button className="icon-button" onClick={() => void load()} aria-label="Refresh occupancy"><RefreshCw size={16} /></button></div>} />
    {loading ? <LoadingState label="Loading occupancy" /> : error ? occupancySkeleton : !data ? <EmptyState title="No occupancy signal" description="The backend did not return occupancy for this date." /> : <>
      <div className="metric-grid occupancy-metrics"><MetricCard label={isLive ? "Inside office now" : "Last recorded inside"} value={data.total_occupancy ?? 0} meta={isLive ? `Live today · ${data.as_of_time ? formatPeakTime(data.as_of_time) : "latest event"}` : `End-of-day snapshot · ${data.date || date}`} tone="cyan" icon={<Activity size={15} />} /><MetricCard label="Floors reporting" value={Object.keys(floorBreakdown).length} meta={isLive ? "Active floor signals" : "Recorded floor signals"} tone="ink" /><MetricCard label="Peak employees" value={data.peak_count ?? "—"} meta={data.peak_time ? formatPeakTime(data.peak_time) : "Peak not exposed by endpoint"} tone="amber" icon={<RadioTower size={15} />} /></div>
      <SectionRule label="FLOOR DISTRIBUTION" />
      <section className="data-panel wide-panel"><div className="panel-heading"><div><span className="eyebrow"><span className="eyebrow-mark">01</span>{isLive ? "LIVE FLOOR READ" : "HISTORICAL FLOOR READ"}</span><h2>{isLive ? "Where people are now" : "Where people were last recorded"}</h2></div><span className="live-pulse"><span /> {isLive ? "Live today · employee access" : "Historical snapshot · employee access"}</span></div>{Object.keys(floorBreakdown).length ? <div className="large-floor-list">{Object.entries(floorBreakdown).map(([floor, value]) => <div className="large-floor-row" key={floor}><div className="large-floor-label"><span>{floor}</span><strong>{value}<small> employees</small></strong></div><div className="large-bar-track"><div className="large-bar-fill" style={{ width: `${(value / floorMax) * 100}%` }} /></div><span className="floor-share">{data.total_occupancy ? Math.round((value / data.total_occupancy) * 100) : 0}%</span></div>)}</div> : <EmptyState title="No floor records" description="There are no check-in records for this date." />}<div className="panel-footnote"><span className="registration-mark">+</span><span>{viewLabel}: <strong>{data.as_of_time ? formatPeakTime(data.as_of_time) : data.date || date}</strong> · Peak time: <strong>{data.peak_time ? formatPeakTime(data.peak_time) : "Not returned by /occupancy"}</strong></span><a href="/dashboard">Back to dashboard <ArrowUpRight size={14} /></a></div></section>
    </>}
  </AppShell>;
}

