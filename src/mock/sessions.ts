import type { Session, AgentMessage } from "../types";

export const mockSession: Session = {
  id: "A82F",
  status: "running",
  created_at: "2026-08-27T12:00:58Z",
  agent: "Kiro",
  user_prompt: "Fix the authentication bug in this project.",
  action_count: 17,
  risk_level: "medium",
};

export const mockMessages: AgentMessage[] = [
  // ── User kicks off the session ──────────────────────────────────────────
  {
    id: "msg-001",
    session_id: "A82F",
    role: "user",
    content: "Fix the authentication bug in this project.",
    timestamp: "2026-08-27T12:01:02Z",
  },
  // ── Kiro plans its approach (before act-001 read_file auth.py) ──────────
  {
    id: "msg-002",
    session_id: "A82F",
    role: "agent",
    content:
      "I'll start by reading the authentication module to understand the current implementation.",
    timestamp: "2026-08-27T12:01:04Z",
  },
  // ── Kiro reports what it found (after act-001, before act-002 search) ──
  {
    id: "msg-003",
    session_id: "A82F",
    role: "agent",
    content:
      "Read auth.py — 142 lines. The JWT validation logic is missing the expiry check. I'll search the codebase to confirm this is the only occurrence.",
    timestamp: "2026-08-27T12:01:06Z",
  },
  // ── Kiro narrates before edit_file ─────────────────────────────────────
  {
    id: "msg-004",
    session_id: "A82F",
    role: "agent",
    content:
      "Found 8 call sites for the auth module — all route through auth.py. I'll patch the expiry validation now.",
    timestamp: "2026-08-27T12:01:08Z",
  },
  // ── Kiro reports the edit result (after act-003) ───────────────────────
  {
    id: "msg-005",
    session_id: "A82F",
    role: "agent",
    content:
      "Patched auth.py — added expiry check on line 87 and updated the error response. Now I need to verify the environment config so I can test locally.",
    timestamp: "2026-08-27T12:01:11Z",
  },
  // ── AgentShield blocks .env read (act-005) — Kiro receives feedback ────
  {
    id: "msg-006",
    session_id: "A82F",
    role: "system",
    content:
      "AgentShield: Access to .env was denied by policy deny_secret_access. Suggested: use .env.example instead.",
    timestamp: "2026-08-27T12:01:16Z",
  },
  // ── User instructs alternative ─────────────────────────────────────────
  {
    id: "msg-007",
    session_id: "A82F",
    role: "user",
    content: "Use .env.example instead.",
    timestamp: "2026-08-27T12:01:21Z",
  },
  // ── Kiro acknowledges, reads .env.example (act-006) ───────────────────
  {
    id: "msg-008",
    session_id: "A82F",
    role: "agent",
    content:
      "Understood. Reading .env.example for the config schema — no real credentials there.",
    timestamp: "2026-08-27T12:01:22Z",
  },
  // ── Kiro wrap-up and git push request (act-004) ────────────────────────
  {
    id: "msg-009",
    session_id: "A82F",
    role: "agent",
    content:
      "Fix verified against .env.example. The authentication bug is resolved. I'll push the changes to main for review.",
    timestamp: "2026-08-27T12:01:25Z",
  },
];

export const dashboardStats = {
  actions_analyzed: 47,
  allowed: 35,
  approval_required: 5,
  blocked: 7,
  avg_risk: 31,
};

export const riskHistory = [
  { time: "12:00", risk: 4 },
  { time: "12:01", risk: 6 },
  { time: "12:02", risk: 18 },
  { time: "12:03", risk: 63 },
  { time: "12:04", risk: 94 },
  { time: "12:05", risk: 4 },
  { time: "12:06", risk: 31 },
  { time: "12:07", risk: 12 },
  { time: "12:08", risk: 45 },
  { time: "12:09", risk: 8 },
];
