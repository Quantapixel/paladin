import { useState } from "react";
import { usePolicies } from "../../hooks/usePolicies";
import { PageHeader, PolicyActionBadge } from "../../components/ui";
import type { Policy, PolicyAction } from "../../types";

const mono = "'JetBrains Mono', monospace";

export default function Policies() {
  const { policies, loading, error, toggle, setAction, addPolicy } = usePolicies();
  const [showAdd, setShowAdd] = useState(false);
  const [newPolicy, setNewPolicy] = useState<Omit<Policy, "id">>({
    name: "", description: "", action: "ask", threshold: 50, enabled: true,
  });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newPolicy.name) return;
    setSaving(true);
    try {
      await addPolicy(newPolicy);
      setNewPolicy({ name: "", description: "", action: "ask", threshold: 50, enabled: true });
      setShowAdd(false);
    } finally { setSaving(false); }
  };

  if (loading) return <Msg>Loading…</Msg>;
  if (error)   return <Msg color="var(--red)">{error}</Msg>;

  return (
    <div style={{ padding: "28px 28px 48px" }}>
      <PageHeader
        title="Policies"
        subtitle="Define how AgentShield responds to tool actions."
        right={
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={{
              padding: "7px 14px", background: "var(--bg-3)", border: "1px solid var(--border)",
              borderRadius: 5, color: "var(--text-1)", fontFamily: mono, fontSize: 11,
              cursor: "pointer", letterSpacing: "0.04em",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-0)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-1)")}
          >
            + Add policy
          </button>
        }
      />

      {showAdd && (
        <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 8, padding: 18, marginBottom: 16 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: "var(--text-2)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 14 }}>New Policy</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="Name">
              <FInput value={newPolicy.name} onChange={(v) => setNewPolicy((p) => ({ ...p, name: v }))} placeholder="e.g. Database Access" />
            </Field>
            <Field label="Action">
              <ActionSelect value={newPolicy.action} onChange={(v) => setNewPolicy((p) => ({ ...p, action: v }))} />
            </Field>
          </div>
          <div style={{ marginBottom: 12 }}>
            <Field label="Description">
              <FInput value={newPolicy.description} onChange={(v) => setNewPolicy((p) => ({ ...p, description: v }))} placeholder="What does this policy protect?" />
            </Field>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Field label={`Risk threshold: ${newPolicy.threshold}+`}>
              <input
                type="range" min={0} max={100} value={newPolicy.threshold}
                onChange={(e) => setNewPolicy((p) => ({ ...p, threshold: Number(e.target.value) }))}
                style={{ width: "100%", accentColor: "var(--text-1)" }}
              />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleAdd} disabled={saving || !newPolicy.name}
              style={{ padding: "7px 14px", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text-1)", fontFamily: mono, fontSize: 11, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.4 : 1 }}
            >
              Create
            </button>
            <button
              onClick={() => setShowAdd(false)}
              style={{ padding: "7px 14px", background: "transparent", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text-2)", fontFamily: mono, fontSize: 11, cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {policies.map((policy) => (
          <PolicyRow
            key={policy.id}
            policy={policy}
            onToggle={() => toggle(policy.id, !policy.enabled)}
            onActionChange={(a) => setAction(policy.id, a)}
          />
        ))}
      </div>
    </div>
  );
}

function PolicyRow({ policy, onToggle, onActionChange }: {
  policy: Policy; onToggle: () => void; onActionChange: (a: PolicyAction) => void;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 7, padding: "12px 16px", opacity: policy.enabled ? 1 : 0.45, transition: "opacity 0.2s" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Toggle */}
        <button
          onClick={onToggle} role="switch" aria-checked={policy.enabled}
          aria-label={`${policy.enabled ? "Disable" : "Enable"} ${policy.name}`}
          style={{
            width: 32, height: 18, borderRadius: 9, flexShrink: 0, marginTop: 2,
            background: policy.enabled ? "var(--green-dim)" : "var(--bg-3)",
            border: `1px solid ${policy.enabled ? "var(--green-border)" : "var(--border)"}`,
            cursor: "pointer", position: "relative",
          }}
        >
          <div style={{
            position: "absolute", top: 2, left: policy.enabled ? 13 : 2,
            width: 12, height: 12, borderRadius: "50%",
            background: policy.enabled ? "var(--green)" : "var(--text-2)",
            opacity: policy.enabled ? 0.85 : 0.5,
            transition: "left 0.2s",
          }} />
        </button>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-0)" }}>{policy.name}</span>
            <PolicyActionBadge action={policy.action} />
            <span style={{ fontFamily: mono, fontSize: 10, color: "var(--text-2)" }}>
              {policy.threshold > 0 ? `≥${policy.threshold}` : "all"}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5, marginBottom: policy.match_patterns?.length ? 6 : 0 }}>
            {policy.description}
          </div>
          {policy.match_patterns && policy.match_patterns.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {policy.match_patterns.map((pat) => (
                <code key={pat} style={{ fontFamily: mono, fontSize: 10, color: "var(--text-2)", background: "var(--bg-3)", borderRadius: 3, padding: "1px 6px" }}>
                  {pat}
                </code>
              ))}
            </div>
          )}
        </div>

        {/* Edit */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          {editing && <ActionSelect value={policy.action} onChange={(a) => { onActionChange(a); setEditing(false); }} />}
          <button
            onClick={() => setEditing(!editing)}
            style={{ padding: "4px 10px", background: "transparent", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-2)", fontFamily: mono, fontSize: 10, cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-2)")}
          >
            {editing ? "Done" : "Edit"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontFamily: mono, fontSize: 10, color: "var(--text-2)", marginBottom: 5, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
      {children}
    </div>
  );
}

function FInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", background: "var(--bg-0)", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text-0)", fontFamily: mono, fontSize: 12, padding: "7px 10px", outline: "none", boxSizing: "border-box" }}
    />
  );
}

function ActionSelect({ value, onChange }: { value: PolicyAction; onChange: (v: PolicyAction) => void }) {
  return (
    <select
      value={value} onChange={(e) => onChange(e.target.value as PolicyAction)} aria-label="Policy action"
      style={{ background: "var(--bg-0)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-1)", fontFamily: mono, fontSize: 11, padding: "5px 8px", outline: "none", cursor: "pointer" }}
    >
      <option value="allow">allow</option>
      <option value="ask">ask</option>
      <option value="block">block</option>
    </select>
  );
}

function Msg({ color = "var(--text-2)", children }: { color?: string; children: React.ReactNode }) {
  return <div style={{ padding: 28, color, fontFamily: mono, fontSize: 12 }}>{children}</div>;
}
