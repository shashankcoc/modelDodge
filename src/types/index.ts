// Normalized internal types for ModelDodge (MD)
// SOURCE DATA (raw) → NORMALIZED DATA (these types) → UI

export interface SourceRef {
  source: string;
  source_url: string;
  source_type: "api" | "paper" | "vendor_reported" | "community";
  retrieved_at: string;
  evaluation_date: string | null;
  methodology: string;
  version: string;
}

export interface Price {
  input_per_mtok: number | null;
  output_per_mtok: number | null;
  cached_input_per_mtok: number | null;
  source: SourceRef;
}

export interface Provider {
  id: string;
  name: string;
  openrouter_id: string | null;
}

export interface Model {
  id: string;
  slug: string;
  name: string;
  provider: string;
  provider_id: string;
  created_date: string | null;
  context_length: number | null;
  pricing: Price | null;
  parameters: string[];
  modalities: string[];
  tool_support: boolean;
  reasoning: boolean;
  description: string | null;
  architecture: string | null;
  top_provider: string | null;
  canonical_name: string;
  source: SourceRef;
  // UI-only aggregates
  overall_score: number | null;
  reasoning_score: number | null;
  coding_score: number | null;
  agentic_score: number | null;
  math_score: number | null;
  long_context_score: number | null;
  vision_score: number | null;
  speed_score: number | null;
  cost_score: number | null;
}

export interface PerformancePoint {
  model: string;
  vendor: string;
  date: string;
  score: number;
  source_url?: string;
  source: SourceRef;
}

export interface Benchmark {
  name: string;
  slug: string;
  capability: string;
  secondary_capabilities: string[];
  short_description: string;
  launch_date: string;
  status: string;
  status_evidence: string | null;
  saturated_date: string | null;
  successor: string | null;
  lineage: {
    parent: string | null;
    variants: string[];
  } | null;
  paper: {
    title: string;
    url: string;
    venue: string;
  } | null;
  authors: {
    name: string;
    affiliation: string | null;
  }[];
  maintainer: string | null;
  license: string | null;
  dataset: {
    url: string | null;
    size: number | null;
    public_test_set: boolean | null;
    gated: boolean | null;
  } | null;
  metric: {
    primary: string;
    scoring: string | null;
    judge_model: string | null;
    aggregation: string | null;
    variants: Record<string, unknown>[] | null;
  } | null;
  run_config: Record<string, unknown> | null;
  cost_estimate: Record<string, unknown> | null;
  human_baseline: Record<string, unknown> | null;
  statistical_note: string | null;
  contamination: {
    test_set_public: boolean | null;
    refresh_cycle: string | null;
    mitigation: string | null;
    risk: string | null;
    notes: string | null;
  } | null;
  languages: string[];
  leaderboards: Array<{ name: string; url: string; type: string }> | null;
  performance_timeline: PerformancePoint[];
  tags: string[];
  last_updated: string | null;
  changelog: Array<{ date: string; note?: string; message?: string }> | null;
}

export interface Evaluation {
  id: string;
  benchmark: string;
  model: string;
  provider: string;
  score: number;
  source: SourceRef;
}

export interface LeaderboardEntry {
  rank: number;
  model: string;
  slug: string;
  provider: string;
  overall: number | null;
  reasoning: number | null;
  coding: number | null;
  agentic: number | null;
  math: number | null;
  vision: number | null;
  longContext: number | null;
  cost: number | null;
  speed: number | null;
  context: number | null;
  benchmarkCount: number;
}

export interface Recommendation {
  model: string;
  provider: string;
  fitness: number;
  estimated_monthly_cost: number | null;
  best_for: string;
  why: string[];
  scores: {
    quality: number;
    cost: number;
    latency: number;
    agentic: number;
  };
}

// Capability categories for mapping benchmarks
export type CapabilityCategory =
  | "reasoning"
  | "coding"
  | "agentic"
  | "math"
  | "vision"
  | "long-context"
  | "safety"
  | "language"
  | "knowledge"
  | "instruction-following"
  | "multimodal"
  | "other";
