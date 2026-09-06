/**
 * Approvals service — wraps all approval-related API calls.
 *
 * The frontend never decides whether to approve or deny an action.
 * It only submits the user's decision, which the backend then
 * communicates to the Kiro CLI.
 */

import { USE_MOCK, get, post } from "./api";
import type { Approval, ApprovalDecision } from "../types";
import { mockApprovals } from "../mock";

// Internal mutable copy used by mock mode so UI state changes persist
// within the browser session (not across page refreshes).
let mockStore = [...mockApprovals];

export async function getApprovals(): Promise<Approval[]> {
  if (USE_MOCK) return [...mockStore];
  return get<Approval[]>("/approvals");
}

export async function getPendingApprovals(): Promise<Approval[]> {
  if (USE_MOCK) return mockStore.filter((a) => a.status === "pending");
  return get<Approval[]>("/approvals?status=pending");
}

/**
 * Submit an approval/denial decision.
 *
 * @param approvalId  The approval record to resolve.
 * @param status      "approved" | "denied"
 * @param userMessage Optional instruction the user included with their decision.
 */
export async function submitApprovalDecision(
  approvalId: string,
  status: "approved" | "denied",
  userMessage?: string,
): Promise<Approval> {
  if (USE_MOCK) {
    const idx = mockStore.findIndex((a) => a.id === approvalId);
    if (idx === -1) throw new Error(`Approval ${approvalId} not found`);
    const updated: Approval = {
      ...mockStore[idx],
      status,
      user_message: userMessage,
      resolved_at: new Date().toISOString(),
    };
    mockStore = mockStore.map((a) => (a.id === approvalId ? updated : a));
    return updated;
  }

  const decision: ApprovalDecision = { approval_id: approvalId, status, user_message: userMessage };
  return post<Approval>(`/approvals/${approvalId}/decision`, decision);
}

/** Reset mock store back to initial state (useful for dev/testing) */
export function resetMockApprovals() {
  mockStore = [...mockApprovals];
}
