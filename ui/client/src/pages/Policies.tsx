/* Editorial Control Room: policies are live operational settings, edited in place and never invented by the UI. */
import { useEffect, useState } from "react";
import { Check, Pencil, Settings2, X } from "lucide-react";
import { AppShell, EmptyState, ErrorState, LoadingState, SectionIntro, SectionRule } from "@/components/AppShell";
import { api, Policy, errorMessage } from "@/lib/api";

const supportedPolicies = ["Minimum Working Hours", "Late Threshold", "Half Day Threshold", "Casual Leave Limit", "Sick Leave Limit", "Maximum Leave Limit"];

function unitForPolicy(name: string) {
  if (name.toLowerCase().includes("threshold") && name.toLowerCase().includes("late")) return "minutes";
  if (name.toLowerCase().includes("hours")) return "hours";
  return "days / year";
}

export default function Policies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = async () => { setLoading(true); setError(null); try { setPolicies(await api.getPolicies()); } catch (err) { setError(errorMessage(err)); setPolicies([]); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);

  const beginEdit = (policy: Policy) => { setEditing(policy.id); setDraft(String(policy.policy_value)); setNotice(null); };
  const cancelEdit = () => { setEditing(null); setDraft(""); };
  const save = async (policy: Policy) => { const value = Number(draft); if (!Number.isFinite(value)) { setError("Enter a valid numeric policy value."); return; } setSaving(policy.id); setError(null); setNotice(null); try { await api.updatePolicy(policy.id, value); setNotice(`${policy.policy_name} updated. Refreshing live policy values.`); cancelEdit(); await load(); } catch (err) { setError(errorMessage(err)); } finally { setSaving(null); } };
  const policySkeleton = <div className="policy-list policy-skeleton">{supportedPolicies.map((name, index) => <div className="policy-row missing" key={name}><div className="policy-name"><span className="policy-index">{String(index + 1).padStart(2, "0")}</span><div><strong>{name}</strong><span>Awaiting live value from Supabase</span></div></div><div className="policy-value"><strong>—</strong><span>{unitForPolicy(name)}</span></div></div>)}<ErrorState message={error ?? "Policy source is waiting."} onRetry={() => void load()} compact /></div>;

  return <AppShell>
    <SectionIntro eyebrow="POLICIES / LIVE SETTINGS" title="Keep the rules adjustable." description="These predefined values are read from the backend and can be edited by HR without changing application code." />
    <SectionRule label="PREDEFINED HR POLICIES" />
    {loading ? <LoadingState label="Loading policies" /> : error && policies.length === 0 ? policySkeleton : policies.length === 0 ? <EmptyState title="No policy records returned" description="The policy endpoint is not available yet, or Supabase has no predefined values." /> : <div className="policy-list">{supportedPolicies.map((name) => { const policy = policies.find((item) => item.policy_name === name); if (!policy) return <div className="policy-row missing" key={name}><div className="policy-name"><span className="policy-index">—</span><div><strong>{name}</strong><span>Not returned by backend</span></div></div></div>; const isEditing = editing === policy.id; return <div className={`policy-row ${isEditing ? "is-editing" : ""}`} key={policy.id}><div className="policy-name"><span className="policy-index">{String(policy.id).padStart(2, "0")}</span><div><strong>{policy.policy_name}</strong><span>{policy.description || "Editable operational policy"}</span></div></div><div className="policy-value">{isEditing ? <div className="policy-edit"><input autoFocus type="number" step="0.5" value={draft} onChange={(event) => setDraft(event.target.value)} aria-label={`New value for ${policy.policy_name}`} /><span>{unitForPolicy(policy.policy_name)}</span><button className="save-button" onClick={() => void save(policy)} disabled={saving === policy.id}><Check size={15} />{saving === policy.id ? "Saving" : "Save"}</button><button className="cancel-button" onClick={cancelEdit} aria-label="Cancel edit"><X size={15} /></button></div> : <><strong>{policy.policy_value}</strong><span>{unitForPolicy(policy.policy_name)}</span><button className="edit-button" onClick={() => beginEdit(policy)}><Pencil size={14} />Edit</button></>}</div></div>; })}</div>}
    {notice && <div className="inline-note success">{notice}</div>}
    {error && policies.length > 0 && <div className="inline-note warning">{error}</div>}
    <div className="policy-explainer"><Settings2 size={18} /><div><strong>One source of truth.</strong><p>Attendance and leave logic read these values directly from Supabase. The interface only edits existing policies; it does not create new ones.</p></div></div>
  </AppShell>;
}

