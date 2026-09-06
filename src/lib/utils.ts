/**
 * Shared utility helpers.
 *
 * Pure functions only — no React imports, no side effects.
 */

import type { Decision, Severity, PolicyAction } from "../types";

// ─── Class name helper ────────────────────────────────────────────────────────

/** Concatenate truthy class names (lightweight cn utility). */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ─── Risk score ───────────────────────────────────────────────────────────────

/**
 * Returns the hex color for a given 0–100 risk score.
 *
 *   0–40   → green  (low)
 *  41–75   → amber  (medium)
 *  76–100  → red    (high/critical)
 */
export function riskColor(score: number): string {
  if (score >= 76) return "#ef4444";
  if (score >= 41) return "#f59e0b";
  return "#22c55e";
}

export type RiskLevel = "low" | "medium" | "high" | "critical";

/** Map a 0–100 risk score to a human-readable label. */
export function riskLevel(score: number): RiskLevel {
  if (score >= 90) return "critical";
  if (score >= 76) return "high";
  if (score >= 41) return "medium";
  return "low";
}

// ─── Decision ─────────────────────────────────────────────────────────────────

const DECISION_LABELS: Record<Decision, string> = {
  allowed: "Allowed",
  approval_required: "Approval Required",
  blocked: "Blocked",
  pending: "Pending",
  analyzing: "Analyzing",
};

export function decisionLabel(decision: Decision): string {
  return DECISION_LABELS[decision] ?? decision;
}

// ─── Severity ─────────────────────────────────────────────────────────────────

const SEVERITY_LABELS: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export function severityLabel(severity: Severity): string {
  return SEVERITY_LABELS[severity] ?? severity;
}

// ─── Policy action ────────────────────────────────────────────────────────────

const POLICY_ACTION_LABELS: Record<PolicyAction, string> = {
  allow: "Allow",
  ask: "Ask",
  block: "Block",
};

export function policyActionLabel(action: PolicyAction): string {
  return POLICY_ACTION_LABELS[action] ?? action;
}

// ─── Timestamp ────────────────────────────────────────────────────────────────

/**
 * Format an ISO timestamp for display.
 * @param iso   ISO 8601 string
 * @param mode  "time" (HH:MM:SS) | "date" (YYYY-MM-DD) | "datetime" (both)
 */
export function formatTimestamp(iso: string, mode: "time" | "date" | "datetime" = "time"): string {
  const d = new Date(iso);
  const date = d.toISOString().slice(0, 10);
  const time = d.toISOString().slice(11, 19);
  if (mode === "date") return date;
  if (mode === "datetime") return `${date} ${time}`;
  return time;
}

/** Relative time string, e.g. "3 minutes ago". */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Tool input ───────────────────────────────────────────────────────────────

/** Return a short human-readable summary of a tool's input arguments. */
export function toolInputSummary(input: Record<string, unknown>): string {
  const values = Object.values(input);
  if (values.length === 0) return "";
  return values
    .map((v) => String(v))
    .join(" ")
    .slice(0, 80);
}

/** Format tool input as a CLI-style command string. */
export function toolInputCommand(toolName: string, input: Record<string, unknown>): string {
  const args = Object.entries(input)
    .map(([k, v]) => `--${k}=${String(v)}`)
    .join(" ");
  return args ? `${toolName} ${args}` : toolName;
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

/** Pluralise a word. */
export function plural(count: number, word: string, plural?: string): string {
  if (count === 1) return `${count} ${word}`;
  return `${count} ${plural ?? word + "s"}`;
}

/** Truncate a string to maxLen characters. */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "…";
}
