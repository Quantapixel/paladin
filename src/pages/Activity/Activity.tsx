import { useState } from "react";
import { useActivity } from "../../hooks/useActivity";
import { PageHeader, RiskScore, ToolChip, Timestamp } from "../../components/ui";
import type { AuditEvent } from "../../types";

const mono = "'JetBrains Mono', monospace";

const ACTOR_CFG = {
  USER:        { color: "var(--text-1)", label: "user"   },
  KIRO:        { color: "var(--text-1)", label: "kiro"   },
  AGENTSHIELD: { color: "var(--text-2)", label: "shield" },
};

const decisionFromSummary = (s: string) => {
  if (s.includes("BLOCKED")) return "blocked";
  if (s.includes("ALLOWED")) return "allowed";
  if (s.includes("APPROVAL")) return "review";
  return null;
};

const FILTERS = ["ALL", "USER", "KIRO", "SHIELD"];

export default function Activity() {
  const { filteredEvents, activeFilter, setFilter, loading, error } = useActivity();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  if (loading) return <Msg>Loading…</Msg>;
  if (error)   return <Msg color="var(--red)">{error}</Msg>;

  return (
    <div style={{ padding: "28px 28px 48px" }}>
      <PageHeader
        title="Activity"
        subtitle="Full audit trail for this session."
        right={
          <div style={{ display: "flex", gap: 4 }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={activeFilter === f}
                style={{
                  padding: "4px 10px",
                  background: activeFilter === f ? "var(--bg-3)" : "transparent",
                  border: `1px solid ${activeFilter === f ? "var(--border-subtle)" : "var(--border)"}`,
                  borderRadius: 4,
                  color: activeFilter === f ? "var(--text-1)" : "var(--text-2)",
                  fontFamily: mono, fontSize: 10, cursor: "pointer",
                  letterSpacing: "0.05em",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      <div style={{ position: "relative" }}>
        {/* Spine */}
        <div style={{ position: "absolute", left: 80, top: 0, bottom: 0, width: 1, background: "var(--border)" }} />

        {filteredEvents.length === 0 && (
          <div style={{ paddingLeft: 100, color: "var(--text-2)", fontFamily: mono, fontSize: 12 }}>
            No events match this filter.
          </div>
        )}

        {filteredEvents.map((evt, idx) => (
          <TimelineRow
            key={evt.id}
            event={evt}
            isLast={idx === filteredEvents.length - 1}
            expanded={expanded.has(evt.id)}
            onToggle={() => toggle(evt.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TimelineRow({ event, expanded, onToggle }: {
  event: AuditEvent; isLast: boolean; expanded: boolean; onToggle: () => void;
}) {
  const actor    = ACTOR_CFG[event.actor];
  const decision = decisionFromSummary(event.summary);
  const dotColor = decision === "blocked" ? "var(--red)"
    : decision === "allowed" ? "var(--green)"
    : decision === "review"  ? "var(--amber)"
    : "var(--text-2)";
  const meta = event.metadata;

  return (
    <div style={{ display: "flex", marginBottom: 0 }}>
      {/* Timestamp */}
      <div style={{ width: 74, flexShrink: 0, paddingTop: 10, paddingRight: 10, textAlign: "right" }}>
        <Timestamp iso={event.timestamp} />
      </div>

      {/* Dot */}
      <div style={{ width: 15, flexShrink: 0, display: "flex", alignItems: "flex-start", paddingTop: 13, position: "relative", zIndex: 1 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor, opacity: 0.75, border: "1.5px solid var(--bg-1)", marginLeft: 4 }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingLeft: 10, paddingBottom: 0 }}>
        <div
          onClick={onToggle}
          role="button" tabIndex={0} aria-expanded={expanded}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onToggle(); }}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 8px", borderRadius: 5, cursor: "pointer",
            background: expanded ? "var(--bg-2)" : "transparent",
          }}
          onMouseEnter={(e) => { if (!expanded) e.currentTarget.style.background = "var(--bg-2)"; }}
          onMouseLeave={(e) => { if (!expanded) e.currentTarget.style.background = "transparent"; }}
        >
          <span style={{ fontFamily: mono, fontSize: 10, color: actor.color, minWidth: 44, letterSpacing: "0.04em" }}>
            {actor.label}
          </span>

          {decision && (
            <span style={{
              fontFamily: mono, fontSize: 10, flexShrink: 0,
              color: decision === "blocked" ? "var(--red)" : decision === "allowed" ? "var(--green)" : "var(--amber)",
            }}>
              {decision}
            </span>
          )}

          <span style={{
            fontSize: 12, color: "var(--text-1)", flex: 1,
            fontFamily: event.event_type === "tool_request" ? mono : undefined,
          }}>
            {event.summary}
          </span>

          {event.event_type === "shield_decision" && typeof meta.risk_score === "number" && (
            <RiskScore score={meta.risk_score as number} size="sm" />
          )}

          <span style={{ fontSize: 10, color: "var(--text-2)" }}>{expanded ? "↑" : "↓"}</span>
        </div>

        {expanded && (
          <div style={{
            margin: "2px 0 6px", padding: "12px 14px",
            background: "var(--bg-0)", border: "1px solid var(--border)",
            borderRadius: 6, fontSize: 12,
          }}>
            {event.event_type === "tool_request" && (
              <>
                <DR label="Tool" value={<ToolChip name={String(meta.tool ?? "")} />} />
                <DR label="Args" value={<code style={{ fontFamily: mono, fontSize: 11, color: "var(--text-2)" }}>{JSON.stringify(meta.args)}</code>} />
              </>
            )}
            {event.event_type === "shield_decision" && (
              <>
                <DR label="Decision" value={<span style={{ fontFamily: mono, fontSize: 11, color: "var(--text-1)" }}>{String(meta.decision ?? "")}</span>} />
                <DR label="Risk"     value={typeof meta.risk_score === "number" ? <RiskScore score={meta.risk_score as number} /> : "—"} />
                <DR label="Policy"   value={<code style={{ fontFamily: mono, fontSize: 11, color: "var(--text-2)" }}>{String(meta.policy ?? "—")}</code>} />
                {Array.isArray(meta.risk_factors) && meta.risk_factors.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontFamily: mono, fontSize: 10, color: "var(--text-2)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Risk Factors</div>
                    {(meta.risk_factors as string[]).map((f, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, color: "var(--text-1)", marginBottom: 3, fontSize: 12 }}>
                        <span style={{ color: "var(--text-2)" }}>—</span>{f}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {event.event_type === "agent_feedback" && (
              <p style={{ color: "var(--text-1)", lineHeight: 1.6, margin: 0 }}>{String(meta.feedback ?? "")}</p>
            )}
            {(event.event_type === "user_message" || event.event_type === "agent_message") && (
              <p style={{ color: "var(--text-0)", lineHeight: 1.6, margin: 0 }}>&ldquo;{String(meta.message ?? "")}&rdquo;</p>
            )}
            {event.event_type === "user_approval" && (
              <>
                <DR label="Decision" value={<span style={{ fontFamily: mono, fontSize: 11, color: "var(--text-1)" }}>{String(meta.decision ?? "").toLowerCase()}</span>} />
                {meta.user_message != null && (
                  <DR label="Note" value={<span style={{ color: "var(--text-1)", fontStyle: "italic" }}>&ldquo;{String(meta.user_message)}&rdquo;</span>} />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DR({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <span style={{ fontFamily: mono, fontSize: 10, color: "var(--text-2)", minWidth: 64, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Msg({ color = "var(--text-2)", children }: { color?: string; children: React.ReactNode }) {
  return <div style={{ padding: 28, color, fontFamily: mono, fontSize: 12 }}>{children}</div>;
}
