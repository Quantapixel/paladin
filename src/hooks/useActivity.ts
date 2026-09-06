/**
 * useActivity — loads and filters audit events for the Activity page.
 */

import { useState, useEffect, useCallback } from "react";
import { getAuditEvents } from "../services/activity";
import type { AuditEvent, AuditEventType } from "../types";

export interface UseActivityReturn {
  events: AuditEvent[];
  loading: boolean;
  error: string | null;
  activeFilter: string;
  setFilter: (filter: string) => void;
  filteredEvents: AuditEvent[];
}

// Maps the UI filter label to a set of event types (empty = all)
const FILTER_MAP: Record<string, AuditEventType[]> = {
  ALL: [],
  USER: ["user_message"],
  KIRO: ["agent_message", "tool_request"],
  SHIELD: ["shield_decision", "agent_feedback", "user_approval"],
};

const SESSION_ID = "A82F"; // TODO: accept as param when multi-session UI lands

export function useActivity(): UseActivityReturn {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAuditEvents(SESSION_ID);
        if (!cancelled) setEvents(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load events");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const setFilter = useCallback((filter: string) => {
    setActiveFilter(filter);
  }, []);

  const filterTypes = FILTER_MAP[activeFilter] ?? [];
  const filteredEvents =
    filterTypes.length === 0
      ? events
      : events.filter((e) => filterTypes.includes(e.event_type));

  return { events, loading, error, activeFilter, setFilter, filteredEvents };
}
