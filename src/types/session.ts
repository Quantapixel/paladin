export type SessionStatus = "running" | "completed" | "failed" | "idle" | "paused";

export interface Session {
  id: string;
  status: SessionStatus;
  created_at: string;
  agent: string;
  user_prompt: string;
  action_count: number;
  risk_level: "low" | "medium" | "high" | "critical";
}

export interface AgentMessage {
  id: string;
  session_id: string;
  role: "user" | "agent" | "system";
  content: string;
  timestamp: string;
}
