import type { ToolAction } from "./action";

export type ApprovalStatus = "pending" | "approved" | "denied";

export interface Approval {
  id: string;
  action_id: string;
  /** Embedded full action object for display purposes */
  action: ToolAction;
  status: ApprovalStatus;
  /** Optional message / instruction the user provided when approving/denying */
  user_message?: string;
  created_at: string;
  resolved_at?: string;
}

export interface ApprovalDecision {
  approval_id: string;
  status: "approved" | "denied";
  user_message?: string;
}
