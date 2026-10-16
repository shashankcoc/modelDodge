import type {
  Benchmark,
  Model,
  LeaderboardEntry,
  SourceRef,
  PerformancePoint,
  CapabilityCategory,
} from "@/types";
import benchmarksRaw from "@/data/benchmarks.json";
import modelsRaw from "@/data/models.json";

// ── Source reference ──────────────────────────────────────────────
const BENCHMARK_REF: SourceRef = {
  source: "benchwiki",
  source_url: "https://benchwiki.vercel.app/api/benchmarks.json",
  source_type: "api",
  retrieved_at: new Date().toISOString(),
  evaluation_date: null,
  methodology: "benchmark snapshot",
  version: "1.0",
};

// ── Capability mapping ────────────────────────────────────────────
const CAPABILITY_MAP: Record<string, CapabilityCategory> = {
  reasoning: "reasoning",
  "logical-reasoning": "reasoning",
  "commonsense-reasoning": "reasoning",
  "multi-step-reasoning": "reasoning",
  coding: "coding",
  "code-generation": "coding",
  "code-reasoning": "coding",
  "software-engineering": "coding",
  agentic: "agentic",
  "agentic-tool-use": "agentic",
  "tool-use": "agentic",
  "function-calling": "agentic",
  math: "math",
  "mathematical-reasoning": "math",
  "math-reasoning": "math",
  "formal-math": "math",
  competition: "math",
  vision: "vision",
  "visual-qa": "vision",
  "visual-reasoning": "vision",
  "chart-understanding": "vision",
  "document-understanding": "vision",
  multimodal: "vision",
  "long-context": "long-context",
  "long-context-understanding": "long-context",
  "retrieval-augmented-generation": "long-context",
  safety: "safety",
  language: "language",
  "language-understanding": "language",
  "multilingual": "language",
  "instruction-following": "instruction-following",
  knowledge: "knowledge",
  "knowledge-qa": "knowledge",
  "science-qa": "knowledge",
  "medical-qa": "knowledge",
};

export function mapCapability(rawCapability: string): CapabilityCategory {
  const lower = rawCapability.toLowerCase().trim();
  return CAPABILITY_MAP[lower] || "other";
}

// ── Helper: Canonical Model Key for Merging ────────────────────────
function toCanonicalKey(str: string): string {
  return str
    .toLowerCase()
    .replace(/^[^/]+\//, "") // remove provider prefix if like 'openai/gpt-4o'
    .replace(/[^a-z0-9]/g, ""); // remove dashes, colons, dots, spaces
}

// ── Benchmarks ────────────────────────────────────────────────────
let _benchmarksCache: Benchmark[] | null = null;

export function getBenchmarks(): Benchmark[] {
  if (_benchmarksCache) return _benchmarksCache;
  _benchmarksCache = (benchmarksRaw as unknown as Benchmark[]).map((b) => ({
    ...b,
    last_updated: b.last_updated || BENCHMARK_REF.retrieved_at,
  }));
  return _benchmarksCache;
}

export function getBenchmarkBySlug(slug: string): Benchmark | undefined {
  return getBenchmarks().find((b) => b.slug === slug);
}

export function getPerformancePoints(slug: string): PerformancePoint[] {
  const bench = getBenchmarkBySlug(slug);
  if (!bench || !bench.performance_timeline) return [];
  return bench.performance_timeline as PerformancePoint[];
}

export function getBenchmarkCapabilities(): string[] {
  const caps = new Set<string>();
  for (const b of getBenchmarks()) {
    caps.add(b.capability);
    if (b.secondary_capabilities) {
      for (const sc of b.secondary_capabilities) caps.add(sc);
    }
  }
  return Array.from(caps).sort();
}

// ── Live Model Registry & Cache ────────────────────────────────────
let _liveModels: Model[] = (modelsRaw as unknown as Model[]) || [];
let _modelsCache: Model[] | null = null;

export async function syncLiveOpenRouterModels(): Promise<{ count: number; updated_at: string }> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "HTTP-Referer": "https://modeldodge.app",
        "X-Title": "ModelDodge",
      },
    });

    if (!res.ok) {
      throw new Error(`OpenRouter API response: ${res.status}`);
    }

    const json = await res.json();
    const list = json.data || [];

    const normalized: Model[] = list.map((m: any) => {
      const modelId = m.id || "";
      const name = m.name || modelId;
      const lowerId = modelId.toLowerCase();
      const lowerName = name.toLowerCase();

      const isReasoning =
        lowerId.includes("reasoning") ||
        lowerName.includes("reasoning") ||
        lowerId.includes("r1") ||
        lowerId.includes("o1") ||
        lowerId.includes("o3") ||
        lowerId.includes("thinking");

      const inputMods = m.architecture?.input_modalities || [];
      const hasVision =
        inputMods.includes("image") ||
        lowerId.includes("vision") ||
        m.architecture?.modality?.includes("image");

      const isToolCapable =
        m.supported_parameters?.includes("tools") ||
        inputMods.includes("tools") ||
        lowerId.includes("instruct") ||
        !lowerId.includes("base");

      const parsePrice = (priceString: string | undefined): number | null => {
        if (!priceString || priceString === "free" || priceString === "$0") return 0;
        const val = parseFloat(priceString);
        return isNaN(val) ? null : Math.round(val * 1_000_000 * 1000) / 1000;
      };

      const rawProv = modelId.includes("/") ? modelId.split("/")[0] : "";
      const provMap: Record<string, string> = {
        anthropic: "Anthropic",
        openai: "OpenAI",
        google: "Google",
        meta: "Meta",
        "meta-llama": "Meta",
        mistralai: "Mistral",
        deepseek: "DeepSeek",
        qwen: "Qwen / Alibaba",
        cohere: "Cohere",
        xai: "xAI",
        "01-ai": "01.AI",
        amazon: "Amazon AWS",
        microsoft: "Microsoft",
        nvidia: "NVIDIA",
      };
      const provider = provMap[rawProv] || (rawProv ? rawProv.charAt(0).toUpperCase() + rawProv.slice(1) : "Unknown");

      const slug = modelId
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      return {
        id: modelId,
        slug,
        name,
        provider,
        provider_id: rawProv || "unknown",
        created_date: m.created ? new Date(m.created * 1000).toISOString() : new Date().toISOString(),
        context_length: m.context_length || null,
        pricing: m.pricing ? {
          input_per_mtok: parsePrice(m.pricing.prompt),
          output_per_mtok: parsePrice(m.pricing.completion),
          cached_input_per_mtok: parsePrice(m.pricing.input_cache_read),
          source: {
            source: "openrouter",
            source_url: `https://openrouter.ai/models/${modelId}`,
            source_type: "api" as const,
            retrieved_at: new Date().toISOString(),
            evaluation_date: null,
            methodology: "OpenRouter public models API",
            version: "1.0",
          },
        } : null,
        parameters: m.supported_parameters || [],
        modalities: inputMods.length > 0 ? inputMods : ["text"],
        tool_support: isToolCapable,
        reasoning: isReasoning,
        description: m.description || null,
        architecture: m.architecture?.modality || null,
        top_provider: m.top_provider?.name || null,
        canonical_name: name,
        source: {
          source: "openrouter",
          source_url: "https://openrouter.ai/api/v1/models",
          source_type: "api" as const,
          retrieved_at: new Date().toISOString(),
          evaluation_date: null,
          methodology: "OpenRouter public models API",
          version: "1.0",
        },
        overall_score: null,
        reasoning_score: null,
        coding_score: null,
        agentic_score: null,
        math_score: null,
        long_context_score: null,
        vision_score: null,
        speed_score: null,
        cost_score: null,
      };
    });

    _liveModels = normalized;
    _modelsCache = null; // Bust cache
    return { count: normalized.length, updated_at: new Date().toISOString() };
  } catch (e) {
    console.error("syncLiveOpenRouterModels error:", e);
    return { count: _liveModels.length, updated_at: new Date().toISOString() };
  }
}

// ── Models (Fused benchmark scores + OpenRouter live catalog) ───────
interface ModelAccumulator {
  name: string;
  vendor: string;
  scores: Map<CapabilityCategory, number[]>;
  allScores: number[];
  benchmarkCount: number;
  latestDate: string | null;
}

export function getModelsFromBenchmarks(): Model[] {
  if (_modelsCache) return _modelsCache;

  const all = getBenchmarks();
  const accumulators = new Map<string, ModelAccumulator>();

  for (const bench of all) {
    const points = bench.performance_timeline || [];
    const category = mapCapability(bench.capability);

    for (const pt of points) {
      if (!pt.model || pt.score == null) continue;
      const modelStr = pt.model.toString();
      // Skip refusal and ablation prompt variations
      if (
        modelStr.toLowerCase().includes("refusal") ||
        modelStr.toLowerCase().includes("unsafe total") ||
        modelStr.toLowerCase().includes("baseline-only")
      ) {
        continue;
      }
      const key = toCanonicalKey(modelStr);

      let acc = accumulators.get(key);
      if (!acc) {
        acc = {
          name: pt.model,
          vendor: pt.vendor || "Unknown",
          scores: new Map(),
          allScores: [],
          benchmarkCount: 0,
          latestDate: null,
        };
        accumulators.set(key, acc);
      }

      if (!acc.scores.has(category)) acc.scores.set(category, []);
      acc.scores.get(category)!.push(pt.score);
      acc.allScores.push(pt.score);
      acc.benchmarkCount++;

      if (pt.date && (!acc.latestDate || pt.date > acc.latestDate)) {
        acc.latestDate = pt.date;
      }
    }
  }

  // Index OpenRouter models by canonical key and id
  const openRouterByKey = new Map<string, Model>();
  for (const om of _liveModels) {
    openRouterByKey.set(toCanonicalKey(om.name), om);
    openRouterByKey.set(toCanonicalKey(om.id), om);
    openRouterByKey.set(toCanonicalKey(om.slug), om);
  }

  const models: Model[] = [];
  const processedKeys = new Set<string>();

  // 1. First populate models that have benchmark scores
  for (const [key, acc] of accumulators) {
    processedKeys.add(key);

    const avg = (arr: number[] | undefined) =>
      arr && arr.length > 0
        ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
        : null;

    const matchedOpenRouter = openRouterByKey.get(key);

    const slug = matchedOpenRouter ? matchedOpenRouter.slug : key;
    const provider =
      matchedOpenRouter?.provider && matchedOpenRouter.provider !== "Unknown"
        ? matchedOpenRouter.provider
        : acc.vendor;

    models.push({
      id: matchedOpenRouter ? matchedOpenRouter.id : key,
      slug: slug,
      name: matchedOpenRouter ? matchedOpenRouter.name : acc.name,
      provider: provider,
      provider_id: matchedOpenRouter?.provider_id || key,
      created_date: acc.latestDate || matchedOpenRouter?.created_date || null,
      context_length: matchedOpenRouter?.context_length ?? null,
      pricing: matchedOpenRouter?.pricing ?? null,
      parameters: matchedOpenRouter?.parameters ?? [],
      modalities: matchedOpenRouter?.modalities ?? ["text"],
      tool_support: matchedOpenRouter?.tool_support ?? true,
      reasoning: (acc.scores.get("reasoning")?.length ?? 0) > 0 || !!matchedOpenRouter?.reasoning,
      description: matchedOpenRouter?.description ?? `Advanced AI model evaluated across ${acc.benchmarkCount} benchmarks.`,
      architecture: matchedOpenRouter?.architecture ?? null,
      top_provider: matchedOpenRouter?.top_provider ?? null,
      canonical_name: matchedOpenRouter ? matchedOpenRouter.name : acc.name,
      source: matchedOpenRouter ? matchedOpenRouter.source : BENCHMARK_REF,
      overall_score: avg(acc.allScores),
      reasoning_score: avg(acc.scores.get("reasoning")),
      coding_score: avg(acc.scores.get("coding")),
      agentic_score: avg(acc.scores.get("agentic")),
      math_score: avg(acc.scores.get("math")),
      long_context_score: avg(acc.scores.get("long-context")),
      vision_score: avg(acc.scores.get("vision")),
      speed_score: null,
      cost_score: null,
    });
  }

  // 2. Include all other models from OpenRouter catalog (newly released models!)
  for (const om of _liveModels) {
    const k1 = toCanonicalKey(om.name);
    const k2 = toCanonicalKey(om.id);
    const k3 = toCanonicalKey(om.slug);

    if (processedKeys.has(k1) || processedKeys.has(k2) || processedKeys.has(k3)) {
      continue;
    }
    processedKeys.add(k1);
    processedKeys.add(k2);
    processedKeys.add(k3);

    models.push(om);
  }

  // Sort by overall score descending, models without score sorted by newest release date
  models.sort((a, b) => {
    if (a.overall_score != null && b.overall_score != null) {
      return b.overall_score - a.overall_score;
    }
    if (a.overall_score != null) return -1;
    if (b.overall_score != null) return 1;
    const dateA = a.created_date ? new Date(a.created_date).getTime() : 0;
    const dateB = b.created_date ? new Date(b.created_date).getTime() : 0;
    return dateB - dateA;
  });

  _modelsCache = models;
  return models;
}

export function getModelBySlug(slug: string): Model | undefined {
  const all = getModelsFromBenchmarks();
  const direct = all.find((m) => m.slug === slug || m.id === slug);
  if (direct) return direct;
  const canonical = toCanonicalKey(slug);
  return all.find((m) => toCanonicalKey(m.slug) === canonical || toCanonicalKey(m.name) === canonical);
}

// ── Model benchmarks breakdown ────────────────────────────────────
export interface ModelBenchmarkResult {
  benchmark: string;
  benchmarkSlug: string;
  capability: string;
  score: number;
  date: string | null;
}

export function getModelBenchmarks(modelSlug: string): ModelBenchmarkResult[] {
  const results: ModelBenchmarkResult[] = [];
  const all = getBenchmarks();
  const canonicalSearch = toCanonicalKey(modelSlug);

  for (const bench of all) {
    const points = bench.performance_timeline || [];
    for (const pt of points) {
      if (!pt.model) continue;
      const ptCanonical = toCanonicalKey(pt.model.toString());
      if (ptCanonical === canonicalSearch && pt.score != null) {
        results.push({
          benchmark: bench.name,
          benchmarkSlug: bench.slug,
          capability: bench.capability,
          score: pt.score,
          date: pt.date || null,
        });
      }
    }
  }

  return results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

// ── Leaderboard with capability sorting ────────────────────────────
export function getLeaderboard(
  capability: string = "overall",
  provider?: string | null
): LeaderboardEntry[] {
  const models = getModelsFromBenchmarks();

  // If a specific capability is requested, prioritize models with that score
  let entries: LeaderboardEntry[] = models
    .filter((m) => {
      if (provider && provider !== "all" && m.provider.toLowerCase() !== provider.toLowerCase()) {
        return false;
      }
      return true;
    })
    .map((m) => {
      // Calculate how many benchmarks this model has
      const count = m.overall_score != null ? getModelBenchmarks(m.slug).length : 0;
      return {
        rank: 0,
        model: m.name,
        slug: m.slug,
        provider: m.provider,
        overall: m.overall_score,
        reasoning: m.reasoning_score,
        coding: m.coding_score,
        agentic: m.agentic_score,
        math: m.math_score,
        vision: m.vision_score,
        longContext: m.long_context_score,
        cost: m.pricing?.input_per_mtok ?? null,
        speed: null,
        context: m.context_length,
        benchmarkCount: count,
      };
    });

  // Sort by the relevant score
  const sortKey = capability === "overall" ? "overall" : capability;
  entries.sort((a, b) => {
    const aVal = (a as unknown as Record<string, unknown>)[sortKey];
    const bVal = (b as unknown as Record<string, unknown>)[sortKey];
    if (aVal != null && bVal != null) {
      return (bVal as number) - (aVal as number);
    }
    if (aVal != null) return -1;
    if (bVal != null) return 1;
    // Fallback sort by overall score
    return (b.overall ?? 0) - (a.overall ?? 0);
  });

  return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

// ── Search across models and benchmarks ───────────────────────────
export interface SearchResult {
  type: "model" | "benchmark";
  name: string;
  slug: string;
  description: string;
  score: number | null;
  provider?: string;
}

export function searchAll(query: string): SearchResult[] {
  if (!query || query.trim() === "") return [];
  const q = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  // Search models
  for (const m of getModelsFromBenchmarks()) {
    if (
      m.name.toLowerCase().includes(q) ||
      m.provider.toLowerCase().includes(q) ||
      m.description?.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q)
    ) {
      results.push({
        type: "model",
        name: m.name,
        slug: m.slug,
        description: `${m.provider} • ${m.context_length ? `${Math.round(m.context_length / 1000)}k ctx` : "Model"} • ${m.pricing?.input_per_mtok != null ? `$${m.pricing.input_per_mtok}/M` : "Pricing available"}`,
        score: m.overall_score,
        provider: m.provider,
      });
    }
  }

  // Search benchmarks
  for (const b of getBenchmarks()) {
    if (
      b.name.toLowerCase().includes(q) ||
      b.capability.toLowerCase().includes(q) ||
      b.short_description.toLowerCase().includes(q)
    ) {
      results.push({
        type: "benchmark",
        name: b.name,
        slug: b.slug,
        description: b.short_description || `${b.capability} benchmark`,
        score: b.performance_timeline ? b.performance_timeline.length : null,
      });
    }
  }

  return results.slice(0, 15);
}

// ── Platform Stats ────────────────────────────────────────────────
export function getStats() {
  const models = getModelsFromBenchmarks();
  const benchmarks = getBenchmarks();
  const providers = new Set(models.map((m) => m.provider));
  let totalEvaluations = 0;
  for (const b of benchmarks) {
    totalEvaluations += (b.performance_timeline || []).length;
  }

  return {
    totalModels: models.length,
    scoredModels: models.filter((m) => m.overall_score != null).length,
    totalBenchmarks: benchmarks.length,
    totalProviders: providers.size,
    totalEvaluations,
    topModel: models[0]?.name || "GPT-4o",
  };
}