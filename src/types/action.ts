export type Severity = "low" | "medium" | "high" | "critical";

/**
 * The decision made by the Paladin security engine for a given tool action.
 * "allowed"          — automatically permitted by policy
 * "approval_required"— routed to the human approval queue
 * "blocked"          — automatically denied by policy
 * "pending"          — received but not yet evaluated
 * "analyzing"        — currently being evaluated by the risk engine
 */
export type Decision =
  | "allowed"
  | "approval_required"
  | "blocked"
  | "pending"
  | "analyzing";

export interface ToolAction {
  id: string;
  session_id: string;
  tool_name: string;
  tool_input: Record<string, string>;
  risk_score: number;
  severity: Severity;
  decision: Decision;
  reason: string;
  risk_factors: string[];
  policy?: string;
  timestamp: string;
  execution_result?: string;
  agent_feedback?: string;
}

export interface RiskAnalysis {
  action_id: string;
  risk_score: number;
  severity: Severity;
  decision: Decision;
  risk_factors: string[];
  reason: string;
  policy?: string;
}
