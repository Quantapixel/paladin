/**
 * useApprovals — manages the approval queue.
 *
 * Loads approvals from the service layer and provides submitDecision
 * which calls the real API (or mock) and updates local state.
 */

import { useState, useEffect, useCallback } from "react";
import { getApprovals, submitApprovalDecision } from "../services/approvals";
import type { Approval } from "../types";

export interface UseApprovalsReturn {
  approvals: Approval[];
  pending: Approval[];
  resolved: Approval[];
  loading: boolean;
  error: string | null;
  submitDecision: (
    approvalId: string,
    status: "approved" | "denied",
    userMessage?: string,
  ) => Promise<void>;
}

export function useApprovals(): UseApprovalsReturn {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getApprovals();
        if (!cancelled) setApprovals(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load approvals");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const submitDecision = useCallback(
    async (approvalId: string, status: "approved" | "denied", userMessage?: string) => {
      const updated = await submitApprovalDecision(approvalId, status, userMessage);
      setApprovals((prev) => prev.map((a) => (a.id === approvalId ? updated : a)));
    },
    [],
  );

  return {
    approvals,
    pending: approvals.filter((a) => a.status === "pending"),
    resolved: approvals.filter((a) => a.status !== "pending"),
    loading,
    error,
    submitDecision,
  };
}
