/**
 * Activity service — wraps audit event API calls.
 */

import { USE_MOCK, get } from "./api";
import type { AuditEvent, AuditEventType } from "../types";
import { mockAuditEvents } from "../mock";

export async function getAuditEvents(
  sessionId: string,
  filter?: AuditEventType[],
): Promise<AuditEvent[]> {
  if (USE_MOCK) {
    let events = mockAuditEvents.filter((e) => e.session_id === sessionId);
    if (filter && filter.length > 0) {
      events = events.filter((e) => filter.includes(e.event_type));
    }
    return events;
  }

  const params = new URLSearchParams();
  if (filter && filter.length > 0) params.set("types", filter.join(","));
  const qs = params.toString() ? `?${params}` : "";
  return get<AuditEvent[]>(`/sessions/${sessionId}/events${qs}`);
}
