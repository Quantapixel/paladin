/**
 * Actions service — wraps ToolAction-related API calls.
 */

import { USE_MOCK, get } from "./api";
import type { ToolAction } from "../types";
import { mockActions } from "../mock";

export async function getActions(sessionId: string): Promise<ToolAction[]> {
  if (USE_MOCK) return mockActions.filter((a) => a.session_id === sessionId);
  return get<ToolAction[]>(`/sessions/${sessionId}/actions`);
}

export async function getAction(actionId: string): Promise<ToolAction> {
  if (USE_MOCK) {
    const action = mockActions.find((a) => a.id === actionId);
    if (!action) throw new Error(`Action ${actionId} not found`);
    return action;
  }
  return get<ToolAction>(`/actions/${actionId}`);
}
