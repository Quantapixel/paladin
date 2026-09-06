/**
 * Policies service — wraps all policy-related API calls.
 */

import { USE_MOCK, get, post, patch } from "./api";
import type { Policy, PolicyAction, PolicyUpdate } from "../types";
import { mockPolicies } from "../mock";

let mockStore = [...mockPolicies];

export async function getPolicies(): Promise<Policy[]> {
  if (USE_MOCK) return [...mockStore];
  return get<Policy[]>("/policies");
}

export async function updatePolicy(update: PolicyUpdate): Promise<Policy> {
  if (USE_MOCK) {
    const idx = mockStore.findIndex((p) => p.id === update.id);
    if (idx === -1) throw new Error(`Policy ${update.id} not found`);
    const updated = { ...mockStore[idx], ...update };
    mockStore = mockStore.map((p) => (p.id === update.id ? updated : p));
    return updated;
  }
  return patch<Policy>(`/policies/${update.id}`, update);
}

export async function togglePolicy(id: string, enabled: boolean): Promise<Policy> {
  return updatePolicy({ id, enabled });
}

export async function setPolicyAction(id: string, action: PolicyAction): Promise<Policy> {
  return updatePolicy({ id, action });
}

export async function createPolicy(policy: Omit<Policy, "id">): Promise<Policy> {
  if (USE_MOCK) {
    const created: Policy = { ...policy, id: `pol-${Date.now()}` };
    mockStore = [...mockStore, created];
    return created;
  }
  return post<Policy>("/policies", policy);
}
