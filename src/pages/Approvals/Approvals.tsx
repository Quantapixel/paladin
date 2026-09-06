import { useState } from "react";
import { useApprovals } from "../../hooks/useApprovals";
import { PageHeader, RiskScore, SeverityBadge, TextArea, Timestamp, ToolChip } from "../../components/ui";
import type { Approval } from "../../types";

const mono = "'JetBrains Mono', monospace";

export default function Approvals() {
  const { pending, resolved, loading, error, submitDecision } = useApprovals();
  const [expandedId, setExpandedId] = useState<string | null>(pending[0]?.id ?? null);
  const [instructions, setInstructions] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const resolve = async (id: string, status: "approved" | "denied") => {
    setSubmitting(id);
    try {
      await submitDecision(id, status, instructions[id] || undefined);
      setExpandedId(null);
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <Msg>Loading…</Msg>;
  if (error)   return <Msg color="var(--red)">{error}</Msg>;

  return (
    <div style={{ padding: "28px 28px 48px" }}>
      <PageHeader
        title="Approvals"
        subtitle="Review pending actions and resolve past decisions."
        right={
          pending.length > 0 ? (
            <span style={{
              background: "var(--amber-dim)", border: "1px solid var(--amber-border)",
              borderRadius: 4, padding: "5px 10px",
              fontFamily: mono, fontSize: 10, fontWeight: 500, color: "var(--amber)",
              letterSpacing: "0.06em",
            }}>
              {pending.length} pending
            </span>
          ) : null
        }
      />

      <SectionLabel>Pending</SectionLabel>
      {pending.length === 0 && <EmptyRow>No pending approvals.</EmptyRow>}
      {pending.map((appr) => (
        <ApprovalCard
          key={appr.id}
          approval={appr}
          expanded={expandedId === appr.id}
          onToggle={() => setExpandedId(expandedId === appr.id ? null : appr.id)}
          instruction={instructions[appr.id] ?? ""}
          onInstruction={(v) => setInstructions((p) => ({ ...p, [appr.id]: v }))}
          onApprove={() => resolve(appr.id, "approved")}
          onDeny={() => resolve(appr.id, "denied")}
          submitting={submitting === appr.id}
        />
      ))}

      <SectionLabel style={{ marginTop: 32 }}>Resolved</SectionLabel>
      {resolved.length === 0 && <EmptyRow>No resolved approvals.</EmptyRow>}
      {resolved.map((appr) => <ResolvedRow key={appr.id} approval={appr} />)}
    </div>
  );
}

function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 10, color: "var(--text-2)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8, ...style }}>
      {children}
    </div>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "14px 16px", color: "var(--text-2)", fontSize: 12, background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 6, marginBottom: 8 }}>
      {children}
    </div>
  );
}

function ApprovalCard({ approval, expanded, onToggle, instruction, onInstruction, onApprove, onDeny, submitting }: {
  approval: Approval; expanded: boolean; onToggle: () => void;
  instruction: string; onInstruction: (v: string) => void;
  onApprove: () => void; onDeny: () => void; submitting: boolean;
}) {
  const a = approval.action;
  const cmdStr = Object.entries(a.tool_input).map(([, v]) => v).join(" ");

  return (
    <div style={{ background: "var(--bg-1)", border: "1px solid var(--border)", borderRadius: 8, marginBottom: 8, overflow: "hidden" }}>
      {/* Header */}
      <div
        onClick={onToggle}
        role="button" tabIndex={0} aria-expanded={expanded}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onToggle(); }}
        style={{
          padding: "11px 16px", display: "flex", alignItems: "center", gap: 10,
          cursor: "pointer", background: expanded ? "var(--bg-2)" : "transparent",
        }}
        onMouseEnter={(e) => { if (!expanded) e.currentTarget.style.background = "var(--bg-2)"; }}
        onMouseLeave={(e) => { if (!expanded) e.currentTarget.style.background = "transparent"; }}
      >
        <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 500, color: "var(--amber)", background: "var(--amber-dim)", borderRadius: 3, padding: "2px 7px", letterSpacing: "0.05em", flexShrink: 0 }}>
          review
        </span>
        <ToolChip name={a.tool_name} />
        <code style={{ fontFamily: mono, fontSize: 11, color: "var(--text-2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {cmdStr}
        </code>
        <RiskScore score={a.risk_score} size="sm" />
        <SeverityBadge severity={a.severity} />
        <Timestamp iso={approval.created_at} />
        <span style={{ color: "var(--text-2)", fontSize: 11 }}>{expanded ? "↑" : "↓"}</span>
      </div>

      {/* Body */}
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
          <div style={{ background: "var(--bg-0)", border: "1px solid var(--border)", borderRadius: 6, padding: "14px 16px", margin: "14px 0" }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "var(--text-2)", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>Kiro wants to run</div>
            <code style={{ fontFamily: mono, fontSize: 14, color: "var(--text-0)", display: "block", marginBottom: 10 }}>
              {a.tool_name} {cmdStr}
            </code>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <RiskScore score={a.risk_score} />
              <SeverityBadge severity={a.severity} />
              {a.policy && <code style={{ fontFamily: mono, fontSize: 10, color: "var(--text-2)" }}>{a.policy}</code>}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-1)", lineHeight: 1.6 }}>{a.reason}</div>
          </div>

          {a.risk_factors.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: "var(--text-2)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Risk Factors</div>
              {a.risk_factors.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--text-1)", marginBottom: 4 }}>
                  <span style={{ color: "var(--text-2)", marginTop: 1 }}>—</span>{f}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: "var(--text-2)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Instruction for Kiro (optional)
            </div>
            <TextArea value={instruction} onChange={onInstruction} placeholder="e.g. Use a feature branch instead." rows={2} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onDeny} disabled={submitting} aria-label="Deny"
              style={{
                flex: 1, padding: "9px 0",
                background: "var(--red-dim)", border: "1px solid var(--red-border)",
                borderRadius: 5, color: "var(--red)", fontFamily: mono, fontSize: 12,
                cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.4 : 1,
              }}
            >
              {instruction ? "Deny & send" : "Deny"}
            </button>
            <button
              onClick={onApprove} disabled={submitting} aria-label="Approve"
              style={{
                flex: 1, padding: "9px 0",
                background: "var(--green-dim)", border: "1px solid var(--green-border)",
                borderRadius: 5, color: "var(--green)", fontFamily: mono, fontSize: 12,
                cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.4 : 1,
              }}
            >
              {instruction ? "Approve & send" : "Approve"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ResolvedRow({ approval }: { approval: Approval }) {
  const a = approval.action;
  const approved = approval.status === "approved";
  return (
    <div style={{
      background: "var(--bg-1)", border: "1px solid var(--border)",
      borderRadius: 6, padding: "9px 16px", marginBottom: 6,
      display: "flex", alignItems: "center", gap: 10, opacity: 0.6,
    }}>
      <span style={{
        fontFamily: mono, fontSize: 10, fontWeight: 500,
        color: approved ? "var(--green)" : "var(--red)",
        background: approved ? "var(--green-dim)" : "var(--red-dim)",
        borderRadius: 3, padding: "2px 7px", flexShrink: 0,
      }}>
        {approved ? "approved" : "denied"}
      </span>
      <ToolChip name={a.tool_name} />
      <code style={{ fontFamily: mono, fontSize: 11, color: "var(--text-2)", flex: 1 }}>{Object.values(a.tool_input)[0]}</code>
      <RiskScore score={a.risk_score} size="sm" />
      {approval.user_message && (
        <span style={{ fontSize: 11, color: "var(--text-2)", fontStyle: "italic", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          &ldquo;{approval.user_message}&rdquo;
        </span>
      )}
      {approval.resolved_at && <Timestamp iso={approval.resolved_at} />}
    </div>
  );
}

function Msg({ color = "var(--text-2)", children }: { color?: string; children: React.ReactNode }) {
  return <div style={{ padding: 28, color, fontFamily: mono, fontSize: 12 }}>{children}</div>;
}
