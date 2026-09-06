/**
 * usePolicies — manages policy list state.
 */

import { useState, useEffect, useCallback } from "react";
import { getPolicies, togglePolicy, setPolicyAction, createPolicy } from "../services/policies";
import type { Policy, PolicyAction } from "../types";

export interface UsePoliciesReturn {
  policies: Policy[];
  loading: boolean;
  error: string | null;
  toggle: (id: string, enabled: boolean) => Promise<void>;
  setAction: (id: string, action: PolicyAction) => Promise<void>;
  addPolicy: (policy: Omit<Policy, "id">) => Promise<void>;
}

export function usePolicies(): UsePoliciesReturn {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPolicies();
        if (!cancelled) setPolicies(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load policies");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const toggle = useCallback(async (id: string, enabled: boolean) => {
    const updated = await togglePolicy(id, enabled);
    setPolicies((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }, []);

  const setAction = useCallback(async (id: string, action: PolicyAction) => {
    const updated = await setPolicyAction(id, action);
    setPolicies((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }, []);

  const addPolicy = useCallback(async (policy: Omit<Policy, "id">) => {
    const created = await createPolicy(policy);
    setPolicies((prev) => [...prev, created]);
  }, []);

  return { policies, loading, error, toggle, setAction, addPolicy };
}
