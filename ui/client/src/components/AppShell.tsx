/* Editorial Control Room: persistent rail, warm surfaces, cobalt active state, and plain-language guidance for HR staff. */
import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  CalendarDays,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Network,
  Settings2,
  Users,
} from "lucide-react";

const logoSrc = "/manus-storage/rapid_ai_logo_dbf27309.png";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/attendance", label: "Attendance", icon: CalendarDays },
  { href: "/leave", label: "Leave", icon: CalendarDays },
  { href: "/occupancy", label: "Occupancy", icon: Network },
  { href: "/policies", label: "Policies", icon: Settings2 },
  { href: "/reports", label: "Reports", icon: FileText },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const activePath = location === "/" ? "/" : `/${location.split("/")[1]}`;
  const current = navItems.find((item) => item.href === activePath) ?? navItems[0];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <img className="brand-mark" src={logoSrc} alt="Rapid AI mark" />
          <div className="brand-wordmark">
            <span>RAPID</span>
            <span>AI</span>
          </div>
        </div>
        <div className="rail-caption">HR OPERATIONS / 01</div>
        <nav className="sidebar-nav" aria-label="Primary navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activePath === item.href;
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${active ? "is-active" : ""}`}>
                <Icon size={17} strokeWidth={1.8} />
                <span>{item.label}</span>
                {active && <span className="nav-active-dot" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="live-pulse"><span /> System connected</div>
          <div className="sidebar-footer-note">Information is updated<br />from Rapid AI</div>
        </div>
      </aside>

      <div className="main-frame">
        <header className="mobile-header">
          <div className="brand-lockup compact">
            <img className="brand-mark" src={logoSrc} alt="Rapid AI mark" />
            <div className="brand-wordmark"><span>RAPID AI</span></div>
          </div>
          <div className="mobile-current"><span>Current view</span><strong>{current.label}</strong></div>
        </header>
        <div className="mobile-nav" aria-label="Mobile navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activePath === item.href;
            return <Link key={item.href} href={item.href} className={`mobile-nav-item ${active ? "is-active" : ""}`}><Icon size={16} /><span>{item.label}</span></Link>;
          })}
        </div>
        <main className="page-canvas">{children}</main>
        <footer className="page-footer"><span>RAPID AI / PEOPLE OPERATIONS</span><span>CONTROL ROOM · 2026</span></footer>
      </div>
    </div>
  );
}

export function SectionIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="section-intro">
      <div>
        <div className="eyebrow"><span className="eyebrow-mark">///</span>{eyebrow}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="section-intro-action">{action}</div>}
    </div>
  );
}

export function SectionRule({ label }: { label: string }) {
  return <div className="section-rule"><span>{label}</span><span className="section-rule-line" /><ChevronRight size={15} /></div>;
}

export function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase().replace(/\s+/g, "-");
  return <span className={`status-pill status-${normalized}`}><span className="status-dot" />{status}</span>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-cross">+</div><strong>{title}</strong><p>{description}</p>{action}</div>;
}

export function LoadingState({ label = "Loading information" }: { label?: string }) {
  return <div className="loading-state"><span className="loading-bar" /><span>{label}…</span></div>;
}

export function ErrorState({ message, onRetry, compact = false }: { message: string; onRetry?: () => void; compact?: boolean }) {
  return <div className={`error-state ${compact ? "is-compact" : ""}`}><div><strong>We could not load this information</strong><p>{message}</p></div>{onRetry && <button className="text-button" onClick={onRetry}>Try again <ChevronRight size={15} /></button>}</div>;
}

export function MetricCard({ label, value, meta, tone = "ink", icon }: { label: string; value: string | number; meta?: string; tone?: string; icon?: ReactNode }) {
  return <div className={`metric-card tone-${tone}`}><div className="metric-label">{icon}{label}</div><div className="metric-value">{value}</div>{meta && <div className="metric-meta">{meta}</div>}</div>;
}

