/**
 * useSession — manages session state and real-time updates.
 *
 * Loads session, messages, and actions from the service layer.
 * Subscribes to WebSocket events to append live updates.
 */

import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";
import { getSession, getMessages } from "../services/sessions";
import { getActions } from "../services/actions";
import type { Session, AgentMessage, ToolAction, Decision } from "../types";

export interface UseSessionReturn {
  session: Session | null;
  messages: AgentMessage[];
  actions: ToolAction[];
  loading: boolean;
  error: string | null;
  selectedAction: ToolAction | null;
  selectAction: (action: ToolAction) => void;
  appendMessage: (msg: AgentMessage) => void;
  /** Update a single action's decision — called after an approval is submitted. */
  updateActionDecision: (actionId: string, decision: Decision, executionResult?: string) => void;
  wsConnected: boolean;
}

export function useSession(sessionId: string): UseSessionReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [actions, setActions] = useState<ToolAction[]>([]);
  const [selectedAction, setSelectedAction] = useState<ToolAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { connected: wsConnected, on } = useWebSocket(sessionId);

  // Initial load
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [sess, msgs, acts] = await Promise.all([
          getSession(sessionId),
          getMessages(sessionId),
          getActions(sessionId),
        ]);
        if (!cancelled) {
          setSession(sess);
          setMessages(msgs);
          setActions(acts);
          // Default selected action: first pending approval or first blocked, then first overall
          const highlight =
            acts.find((a) => a.decision === "approval_required") ??
            acts.find((a) => a.decision === "blocked") ??
            acts[acts.length - 1] ??
            null;
          setSelectedAction(highlight);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load session");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [sessionId]);

  // Real-time: new agent message
  useEffect(() => {
    return on("agent_message", (evt) => {
      const msg = evt.data as AgentMessage;
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
  }, [on]);

  // Real-time: new tool action
  useEffect(() => {
    return on("tool_requested", (evt) => {
      const action = evt.data as ToolAction;
      setActions((prev) => {
        if (prev.find((a) => a.id === action.id)) return prev;
        return [...prev, action];
      });
    });
  }, [on]);

  // Real-time: risk analysis updates an existing action's decision/score
  useEffect(() => {
    return on("risk_analysis", (evt) => {
      const analysis = evt.data as Partial<ToolAction> & { action_id: string };
      setActions((prev) =>
        prev.map((a) =>
          a.id === analysis.action_id ? { ...a, ...analysis } : a,
        ),
      );
    });
  }, [on]);

  // Real-time: approval resolved — update action decision in feed
  useEffect(() => {
    return on("approval_resolved", (evt) => {
      const approval = evt.data as { action_id: string; status: "approved" | "denied" };
      const newDecision: Decision = approval.status === "approved" ? "allowed" : "blocked";
      setActions((prev) =>
        prev.map((a) =>
          a.id === approval.action_id ? { ...a, decision: newDecision } : a,
        ),
      );
    });
  }, [on]);

  const appendMessage = useCallback((msg: AgentMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  /**
   * Update a single action's decision locally.
   * Called by the Session page after the user submits an approval/denial,
   * so the conversation feed reflects the change immediately without
   * waiting for a WebSocket event.
   */
  const updateActionDecision = useCallback(
    (actionId: string, decision: Decision, executionResult?: string) => {
      setActions((prev) =>
        prev.map((a) => {
          if (a.id !== actionId) return a;
          return {
            ...a,
            decision,
            ...(executionResult !== undefined ? { execution_result: executionResult } : {}),
          };
        }),
      );
      // Also keep selectedAction in sync
      setSelectedAction((prev) => {
        if (prev?.id !== actionId) return prev;
        return {
          ...prev,
          decision,
          ...(executionResult !== undefined ? { execution_result: executionResult } : {}),
        };
      });
    },
    [],
  );

  return {
    session,
    messages,
    actions,
    loading,
    error,
    selectedAction,
    selectAction: setSelectedAction,
    appendMessage,
    updateActionDecision,
    wsConnected,
  };
}
