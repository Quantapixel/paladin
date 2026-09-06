import { useState } from "react";
import { PageHeader } from "../../components/ui";

const mono = "'JetBrains Mono', monospace";

export default function Settings() {
  const [protection,    setProtection]    = useState(true);
  const [autoBlock,     setAutoBlock]     = useState(true);
  const [humanApproval, setHumanApproval] = useState(true);
  const [lowMax,        setLowMax]        = useState(40);
  const [highMin,       setHighMin]       = useState(76);

  return (
    <div style={{ padding: "28px 28px 48px", maxWidth: 640 }}>
      <PageHeader title="Settings" subtitle="Configure AgentShield protection and integrations." />

      <Section label="Security">
        <ToggleRow label="Protection"         sub="Enable AgentShield interception"              value={protection}    onChange={setProtection}    />
        <ToggleRow label="Automatic blocking" sub="Block high-risk actions without prompting"    value={autoBlock}     onChange={setAutoBlock}     />
        <ToggleRow label="Human approval"     sub="Route uncertain actions to the approval queue" value={humanApproval} onChange={setHumanApproval} />
      </Section>

      <Section label="Risk Thresholds">
        <div style={{ background: "var(--bg-0)", border: "1px solid var(--border)", borderRadius: 7, overflow: "hidden" }}>
          <ThresholdRow label="Low"    range={`0–${lowMax}`}              outcome="allow"  color="var(--green)" value={lowMax}  onChange={setLowMax}  min={10} max={60} />
          <div style={{ borderTop: "1px solid var(--border)" }} />
          <ThresholdRow label="Medium" range={`${lowMax+1}–${highMin-1}`} outcome="review" color="var(--amber)" value={highMin} onChange={setHighMin} min={lowMax+10} max={95} />
          <div style={{ borderTop: "1px solid var(--border)" }} />
          <ThresholdRow label="High"   range={`${highMin}–100`}           outcome="block"  color="var(--red)"   readonly />
        </div>
      </Section>

      <Section label="Integrations">
        <IntegrationRow label="Kiro CLI"  version="v0.9.4"        status="CONNECTED"    />
        <IntegrationRow label="Reka AI"   version="Flash 21B"     status="CONNECTED"    />
        <IntegrationRow label="Database"  version="SQLite local"  status="CONNECTED"    />
        <IntegrationRow label="Webhook"   version="Outbound events" status="DISCONNECTED" />
      </Section>

      <Section label="About">
        <div style={{ background: "var(--bg-0)", border: "1px solid var(--border)", borderRadius: 7, overflow: "hidden" }}>
          {[
            { label: "Paladin",     value: "v0.1.0-hackathon" },
            { label: "AgentShield", value: "v0.1.0" },
            { label: "Build",       value: "2026-08-27" },
            { label: "Node",        value: "v22.0.0" },
          ].map(({ label, value }, i, arr) => (
            <div key={label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 14px",
              borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <span style={{ fontSize: 12, color: "var(--text-1)" }}>{label}</span>
              <code style={{ fontFamily: mono, fontSize: 11, color: "var(--text-2)" }}>{value}</code>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: "var(--text-2)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, sub, value, onChange }: { label: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 7,
      padding: "11px 14px", marginBottom: 6,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-0)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--text-2)" }}>{sub}</div>
      </div>
      <Toggle value={value} onChange={onChange} label={label} />
    </div>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      onClick={() => onChange(!value)} role="switch" aria-checked={value} aria-label={label}
      style={{
        width: 38, height: 20, borderRadius: 10, flexShrink: 0,
        background: value ? "var(--green-dim)" : "var(--bg-3)",
        border: `1px solid ${value ? "var(--green-border)" : "var(--border)"}`,
        cursor: "pointer", position: "relative",
      }}
    >
      <div style={{
        position: "absolute", top: 2, left: value ? 18 : 2,
        width: 14, height: 14, borderRadius: "50%",
        background: value ? "var(--green)" : "var(--text-2)",
        opacity: value ? 0.85 : 0.4,
        transition: "left 0.2s, background 0.2s",
      }} />
    </button>
  );
}

function ThresholdRow({ label, range, outcome, color, value, onChange, min, max, readonly }: {
  label: string; range: string; outcome: string; color: string;
  value?: number; onChange?: (v: number) => void; min?: number; max?: number; readonly?: boolean;
}) {
  return (
    <div style={{ padding: "11px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: readonly ? 0 : 8 }}>
        <span style={{ fontFamily: mono, fontSize: 10, color, minWidth: 48, letterSpacing: "0.03em" }}>{label}</span>
        <span style={{ fontFamily: mono, fontSize: 11, color: "var(--text-2)" }}>{range}</span>
        <span style={{ marginLeft: "auto", fontFamily: mono, fontSize: 10, color: "var(--text-2)" }}>→ {outcome}</span>
      </div>
      {!readonly && value !== undefined && onChange && (
        <input
          type="range" min={min} max={max} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={`${label} threshold`}
          style={{ width: "100%", accentColor: color }}
        />
      )}
    </div>
  );
}

function IntegrationRow({ label, version, status }: { label: string; version: string; status: "CONNECTED" | "DISCONNECTED" }) {
  const ok = status === "CONNECTED";
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 7,
      padding: "10px 14px", marginBottom: 6,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-0)", marginBottom: 1 }}>{label}</div>
        <code style={{ fontFamily: mono, fontSize: 10, color: "var(--text-2)" }}>{version}</code>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: ok ? "var(--green)" : "var(--red)", opacity: 0.75, display: "inline-block" }} />
        <span style={{ fontFamily: mono, fontSize: 10, color: "var(--text-2)", letterSpacing: "0.04em" }}>{ok ? "connected" : "disconnected"}</span>
      </div>
    </div>
  );
}
