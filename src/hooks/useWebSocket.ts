/**
 * useWebSocket — real-time event hook for Paladin.
 *
 * USAGE
 * -----
 *   const { connected, lastEvent } = useWebSocket("A82F");
 *
 * ARCHITECTURE
 * ------------
 * When VITE_USE_MOCK=true (default), the hook simulates events locally.
 * When VITE_WS_URL is set, it connects to the real FastAPI WebSocket endpoint.
 *
 * The hook only delivers events — it does NOT interpret them or apply
 * security logic. All interpretation happens in the backend.
 *
 * EXPECTED EVENT SHAPES (from the backend):
 *   { type: "agent_message",     session_id, timestamp, data: AgentMessage }
 *   { type: "tool_requested",    session_id, timestamp, data: ToolAction }
 *   { type: "risk_analysis",     session_id, timestamp, data: RiskAnalysis }
 *   { type: "approval_request",  session_id, timestamp, data: Approval }
 *   { type: "approval_resolved", session_id, timestamp, data: Approval }
 *   { type: "execution_started", session_id, timestamp, data: { action_id } }
 *   { type: "execution_completed",session_id,timestamp, data: { action_id, result } }
 *   { type: "execution_failed",  session_id, timestamp, data: { action_id, error } }
 */

import { useEffect, useRef, useCallback, useState } from "react";
import type { AnyWsEvent, WsEventType } from "../types";

const WS_URL = import.meta.env.VITE_WS_URL ?? "";
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

type EventHandler<T = AnyWsEvent> = (event: T) => void;

export interface UseWebSocketReturn {
  /** Whether the WebSocket connection is open */
  connected: boolean;
  /** The most recent event received */
  lastEvent: AnyWsEvent | null;
  /** Subscribe to a specific event type */
  on: (type: WsEventType, handler: EventHandler) => () => void;
  /** Send a raw message (real mode only) */
  send: (data: unknown) => void;
}

export function useWebSocket(sessionId: string): UseWebSocketReturn {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<AnyWsEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<WsEventType, Set<EventHandler>>>(new Map());
  const mockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dispatch an event to all registered handlers + update lastEvent
  const dispatch = useCallback((event: AnyWsEvent) => {
    setLastEvent(event);
    const handlers = handlersRef.current.get(event.type);
    if (handlers) {
      handlers.forEach((h) => h(event));
    }
  }, []);

  // Register a handler for a specific event type; returns an unsubscribe fn
  const on = useCallback((type: WsEventType, handler: EventHandler) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, new Set());
    }
    handlersRef.current.get(type)!.add(handler);
    return () => {
      handlersRef.current.get(type)?.delete(handler);
    };
  }, []);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    if (USE_MOCK || !WS_URL) {
      // ── MOCK MODE ──────────────────────────────────────────────────────────
      // Simulate a couple of realistic events after a short delay so the
      // session page looks alive during development.
      setConnected(true);

      // Stagger a few demo events so the UI "updates" after load
      const demoEvents: AnyWsEvent[] = [
        {
          type: "agent_message",
          session_id: sessionId,
          timestamp: new Date().toISOString(),
          data: {
            id: `ws-msg-${Date.now()}`,
            session_id: sessionId,
            role: "agent",
            content: "Reviewing the authentication module...",
            timestamp: new Date().toISOString(),
          },
        } as AnyWsEvent,
      ];

      let i = 0;
      const fire = () => {
        if (i < demoEvents.length) {
          dispatch(demoEvents[i]);
          i++;
          mockTimerRef.current = setTimeout(fire, 3000);
        }
      };
      mockTimerRef.current = setTimeout(fire, 2000);

      return () => {
        if (mockTimerRef.current) clearTimeout(mockTimerRef.current);
        setConnected(false);
      };
    }

    // ── REAL WebSocket MODE ────────────────────────────────────────────────
    const url = `${WS_URL}/ws/${sessionId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (evt) => {
      try {
        const event = JSON.parse(evt.data) as AnyWsEvent;
        dispatch(event);
      } catch {
        console.warn("[useWebSocket] Failed to parse message:", evt.data);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setConnected(false);
    };
  }, [sessionId, dispatch]);

  return { connected, lastEvent, on, send };
}
