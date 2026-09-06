import type { Decision, Severity, PolicyAction } from "../types";

// All colours come from CSS custom properties defined in index.css.
// Nothing here is hardcoded — the theme switch on <html data-theme>
// handles everything automatically.

const mono = "'JetBrains Mono', 'Fira Code', monospace";

// ─── RiskScore ────────────────────────────────────────────────────────────────

export function RiskScore({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const color  = score >= 76 ? "var(--red)"   : score >= 41 ? "var(--amber)"   : "var(--green)";
  const dim    = score >= 76 ? "var(--red-dim)" : score >= 41 ? "var(--amber-dim)" : "var(--green-dim)";
  const sizes  = {
    sm: { font: 11, px: "2px 6px" },
    md: { font: 12, px: "3px 8px" },
    lg: { font: 13, px: "4px 10px" },
  };
  const s = sizes[size];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: mono,
        fontSize: s.font,
        fontWeight: 500,
        color,
        background: dim,
        borderRadius: 4,
        padding: s.px,
        letterSpacing: "0.01em",
        minWidth: size === "sm" ? 32 : size === "lg" ? 52 : 40,
      }}
    >
      {score}
    </span>
  );
}

// ─── DecisionBadge ────────────────────────────────────────────────────────────

const DECISION_CFG: Record<string, { label: string; color: string; dim: string }> = {
  allowed:           { label: "allow",    color: "var(--green)", dim: "var(--green-dim)" },
  approval_required: { label: "review",   color: "var(--amber)", dim: "var(--amber-dim)" },
  blocked:           { label: "block",    color: "var(--red)",   dim: "var(--red-dim)"   },
  pending:           { label: "pending",  color: "var(--text-2)", dim: "transparent"     },
  analyzing:         { label: "scanning", color: "var(--blue)",  dim: "var(--blue-dim)"  },
};

export function DecisionBadge({ decision, compact }: { decision: Decision; compact?: boolean }) {
  const cfg = DECISION_CFG[decision] ?? DECISION_CFG.pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: mono,
        fontSize: 10,
        fontWeight: 500,
        color: cfg.color,
        background: cfg.dim,
        borderRadius: 3,
        padding: compact ? "2px 5px" : "2px 7px",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        textTransform: "uppercase",
      }}
    >
      {cfg.label}
    </span>
  );
}

// ─── SeverityBadge ────────────────────────────────────────────────────────────

const SEV_CFG: Record<Severity, { label: string; color: string }> = {
  low:      { label: "low",      color: "var(--text-2)" },
  medium:   { label: "medium",   color: "var(--text-1)" },
  high:     { label: "high",     color: "var(--amber)"  },
  critical: { label: "critical", color: "var(--red)"    },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const cfg = SEV_CFG[severity];
  return (
    <span
      style={{
        fontFamily: mono,
        fontSize: 10,
        fontWeight: 500,
        color: cfg.color,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {cfg.label}
    </span>
  );
}

// ─── PolicyActionBadge ────────────────────────────────────────────────────────

const POLICY_CFG: Record<PolicyAction, { label: string; color: string; dim: string }> = {
  allow: { label: "allow", color: "var(--green)", dim: "var(--green-dim)" },
  ask:   { label: "ask",   color: "var(--amber)", dim: "var(--amber-dim)" },
  block: { label: "block", color: "var(--red)",   dim: "var(--red-dim)"   },
};

export function PolicyActionBadge({ action }: { action: PolicyAction }) {
  const cfg = POLICY_CFG[action];
  return (
    <span
      style={{
        fontFamily: mono,
        fontSize: 10,
        fontWeight: 500,
        color: cfg.color,
        background: cfg.dim,
        borderRadius: 3,
        padding: "2px 7px",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {cfg.label}
    </span>
  );
}

// ─── MetricCard ───────────────────────────────────────────────────────────────

export function MetricCard({
  label, value, sub, accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: "var(--bg-1)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "var(--text-2)",
          fontFamily: mono,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: accent ?? "var(--text-0)",
          lineHeight: 1,
          letterSpacing: "-0.02em",
          fontFamily: mono,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 5 }}>{sub}</div>
      )}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--bg-1)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, right }: { title: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "var(--text-1)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontFamily: mono,
        }}
      >
        {title}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "danger" | "ghost" | "outline";

export function Button({
  children, onClick, variant = "ghost", disabled, fullWidth, size = "md",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: "sm" | "md";
}) {
  const styles: Record<ButtonVariant, React.CSSProperties> = {
    primary: { background: "var(--text-0)",    color: "var(--bg-0)",   border: "1px solid var(--text-0)"   },
    danger:  { background: "var(--red-dim)",   color: "var(--red)",    border: "1px solid var(--red-border)" },
    ghost:   { background: "transparent",      color: "var(--text-1)", border: "1px solid var(--border)"   },
    outline: { background: "transparent",      color: "var(--text-0)", border: "1px solid var(--border)"   },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        fontFamily: mono,
        fontSize: size === "sm" ? 11 : 12,
        fontWeight: 500,
        letterSpacing: "0.04em",
        padding: size === "sm" ? "5px 10px" : "8px 14px",
        borderRadius: 5,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        width: fullWidth ? "100%" : undefined,
        transition: "opacity 0.1s",
      }}
    >
      {children}
    </button>
  );
}

// ─── Timestamp ────────────────────────────────────────────────────────────────

export function Timestamp({ iso }: { iso: string }) {
  const hms = new Date(iso).toISOString().slice(11, 19);
  return (
    <span style={{ fontFamily: mono, fontSize: 11, color: "var(--text-2)" }}>{hms}</span>
  );
}

// ─── ToolChip ─────────────────────────────────────────────────────────────────

export function ToolChip({ name }: { name: string }) {
  return (
    <code
      style={{
        fontFamily: mono,
        fontSize: 11,
        color: "var(--text-1)",
        background: "var(--bg-3)",
        borderRadius: 4,
        padding: "2px 7px",
      }}
    >
      {name}
    </code>
  );
}

// ─── RiskBar ──────────────────────────────────────────────────────────────────

export function RiskBar({ score }: { score: number }) {
  const color = score >= 76 ? "var(--red)" : score >= 41 ? "var(--amber)" : "var(--green)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          flex: 1,
          height: 3,
          background: "var(--bg-4)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            background: color,
            borderRadius: 2,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <RiskScore score={score} size="sm" />
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

export function PageHeader({
  title, subtitle, right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 28,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "var(--text-0)",
            margin: 0,
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: "var(--text-2)", margin: "4px 0 0", lineHeight: 1.5 }}>
            {subtitle}
          </p>
        )}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

// ─── TextArea ─────────────────────────────────────────────────────────────────

export function TextArea({
  value, onChange, placeholder, rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%",
        background: "var(--bg-3)",
        border: "1px solid var(--border)",
        borderRadius: 5,
        color: "var(--text-0)",
        fontFamily: mono,
        fontSize: 12,
        padding: "9px 11px",
        resize: "vertical",
        outline: "none",
        boxSizing: "border-box",
        lineHeight: 1.6,
      }}
    />
  );
}
