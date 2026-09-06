import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router";
import { getPendingApprovals } from "../services/approvals";
import { useTheme } from "../lib/theme";

const mono = "'JetBrains Mono', monospace";

const icons = {
  dashboard: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  session: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  approvals: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  activity: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  policies: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  settings: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  shield: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  sun: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  moon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  ),
};

export default function Sidebar() {
  const location = useLocation();
  const { theme, toggle } = useTheme();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchPending() {
      try {
        const approvals = await getPendingApprovals();
        if (!cancelled) setPendingCount(approvals.length);
      } catch { /* non-fatal */ }
    }
    fetchPending();
    const id = setInterval(fetchPending, 10_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const navItems = [
    { path: "/dashboard",    label: "Dashboard",      icon: icons.dashboard },
    { path: "/session/A82F", label: "Active Session", icon: icons.session   },
    { path: "/approvals",    label: "Approvals",      icon: icons.approvals, badge: pendingCount > 0 ? pendingCount : undefined },
    { path: "/activity",     label: "Activity",       icon: icons.activity  },
    { path: "/policies",     label: "Policies",       icon: icons.policies  },
    { path: "/settings",     label: "Settings",       icon: icons.settings  },
  ];

  return (
    <aside
      aria-label="Main navigation"
      style={{
        width: 216,
        minWidth: 216,
        background: "var(--bg-1)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "18px 16px 14px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 26, height: 26,
            background: "var(--bg-0)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-1)",
            flexShrink: 0,
          }}
        >
          {icons.shield}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-0)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            Paladin
          </div>
          <div style={{ fontSize: 10, color: "var(--text-2)", fontFamily: mono, letterSpacing: "0.03em" }}>
            AgentShield v0.1
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 8px", overflowY: "auto" }}>
        {navItems.map((item) => {
          const isActive =
            item.path.startsWith("/session/")
              ? location.pathname.startsWith("/session/")
              : location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              aria-current={isActive ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "7px 9px",
                marginBottom: 1,
                borderRadius: 5,
                textDecoration: "none",
                background: isActive ? "var(--bg-3)" : "transparent",
                color: isActive ? "var(--text-0)" : "var(--text-2)",
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                transition: "color 0.1s, background 0.1s",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-1)";
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-2)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }
              }}
            >
              <span style={{ opacity: isActive ? 0.9 : 0.45, display: "flex", flexShrink: 0 }} aria-hidden="true">
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  aria-label={`${item.badge} pending`}
                  style={{
                    background: "var(--amber)",
                    color: "var(--bg-0)",
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: mono,
                    padding: "1px 5px",
                    borderRadius: 3,
                    lineHeight: "14px",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer: status + theme toggle */}
      <div style={{ padding: "10px 14px 12px", borderTop: "1px solid var(--border)" }}>
        <StatusDot label="Kiro CLI"     ok />
        <StatusDot label="AgentShield"  ok />
        <StatusDot label="Protection"   ok />

        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          style={{
            marginTop: 10,
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "6px 8px",
            background: "var(--bg-3)",
            border: "1px solid var(--border)",
            borderRadius: 5,
            color: "var(--text-2)",
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: "0.05em",
            cursor: "pointer",
            transition: "color 0.1s, border-color 0.1s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--text-1)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          }}
        >
          <span style={{ display: "flex", opacity: 0.7 }}>
            {theme === "dark" ? icons.sun : icons.moon}
          </span>
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </aside>
  );
}

function StatusDot({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontSize: 11, color: "var(--text-2)", fontFamily: mono }}>{label}</span>
      <span
        style={{
          width: 5, height: 5, borderRadius: "50%",
          background: ok ? "var(--green)" : "var(--red)",
          display: "inline-block", opacity: 0.7,
        }}
        aria-hidden="true"
      />
    </div>
  );
}
