import type { ToolAction, RiskAnalysis } from "./action";
import type { AgentMessage } from "./session";
import type { Approval } from "./approval";

// ─── Audit Events ─────────────────────────────────────────────────────────────

export type AuditEventType =
  | "user_message"
  | "agent_message"
  | "tool_request"
  | "shield_decision"
  | "user_approval"
  | "agent_feedback";

export interface AuditEvent {
  id: string;
  session_id: string;
  event_type: AuditEventType;
  timestamp: string;
  actor: "USER" | "KIRO" | "AGENTSHIELD";
  summary: string;
  metadata: Record<string, unknown>;
}

// ─── WebSocket Events ─────────────────────────────────────────────────────────
// These are the event shapes the backend will emit over the WebSocket connection.
// The frontend only renders what it receives — no security logic lives here.

export type WsEventType =
  | "agent_message"
  | "tool_requested"
  | "risk_analysis"
  | "approval_request"
  | "approval_resolved"
  | "execution_started"
  | "execution_completed"
  | "execution_failed"
  | "session_started"
  | "session_ended";

export interface WsEvent<T = unknown> {
  type: WsEventType;
  session_id: string;
  timestamp: string;
  data: T;
}

export type WsAgentMessageEvent = WsEvent<AgentMessage>;
export type WsToolRequestedEvent = WsEvent<ToolAction>;
export type WsRiskAnalysisEvent = WsEvent<RiskAnalysis>;
export type WsApprovalRequestEvent = WsEvent<Approval>;
export type WsApprovalResolvedEvent = WsEvent<Approval>;
export type WsExecutionEvent = WsEvent<{ action_id: string; result?: string; error?: string }>;

export type AnyWsEvent =
  | WsAgentMessageEvent
  | WsToolRequestedEvent
  | WsRiskAnalysisEvent
  | WsApprovalRequestEvent
  | WsApprovalResolvedEvent
  | WsExecutionEvent;
