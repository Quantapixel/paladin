export type PolicyAction = "allow" | "ask" | "block";

export interface Policy {
  id: string;
  name: string;
  description: string;
  action: PolicyAction;
  threshold: number;
  enabled: boolean;
  match_patterns?: string[];
}

export interface PolicyUpdate {
  id: string;
  action?: PolicyAction;
  enabled?: boolean;
  threshold?: number;
}
