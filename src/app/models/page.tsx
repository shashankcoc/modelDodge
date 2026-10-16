"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Brain,
  Code,
  Cpu,
  Layers,
  Eye,
  BarChart3,
  Filter,
  DollarSign,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
  GitCompare,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

export default function ModelsPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [capability, setCapability] = useState("all");
  const [provider, setProvider] = useState("all");
  const [pricingTier, setPricingTier] = useState("all");
  const [hasVision, setHasVision] = useState(false);
  const [hasTools, setHasTools] = useState(false);
  const [sortBy, setSortBy] = useState("score"); // 'score', 'context', 'price_asc', 'price_desc', 'newest'
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data) => {
        setModels(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetch("/api/sync", { method: "POST" });
      const res = await fetch("/api/models");
      const data = await res.json();
      setModels(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const providers = useMemo(() => {
    const set = new Set<string>();
    models.forEach((m) => {
      if (m.provider && m.provider !== "Unknown") set.add(m.provider);
    });
    return Array.from(set).sort();
  }, [models]);

  const filteredModels = useMemo(() => {
    return models
      .filter((m) => {
        // Search
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          m.name.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q);

        if (!matchesSearch) return false;

        // Provider
        if (provider !== "all" && m.provider.toLowerCase() !== provider.toLowerCase()) {
          return false;
        }

        // Capability
        if (capability !== "all") {
          const scoreKey = `${capability.replace("-", "_")}_score`;
          if (m[scoreKey] == null && m[capability] == null) {
            return false;
          }
        }

        // Pricing tier
        if (pricingTier !== "all") {
          const inputCost = m.pricing?.input_per_mtok;
          if (pricingTier === "free") {
            if (inputCost !== 0) return false;
          } else if (pricingTier === "budget") {
            if (inputCost == null || inputCost > 1.0) return false;
          } else if (pricingTier === "mid") {
            if (inputCost == null || inputCost <= 1.0 || inputCost > 5.0) return false;
          } else if (pricingTier === "flagship") {
            if (inputCost == null || inputCost <= 5.0) return false;
          }
        }

        // Features
        if (hasVision && !m.modalities?.includes("image") && !m.vision_score) {
          return false;
        }
        if (hasTools && !m.tool_support) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "score") {
          return (b.overall_score ?? 0) - (a.overall_score ?? 0);
        }
        if (sortBy === "context") {
          return (b.context_length ?? 0) - (a.context_length ?? 0);
        }
        if (sortBy === "price_asc") {
          const pA = a.pricing?.input_per_mtok ?? 999;
          const pB = b.pricing?.input_per_mtok ?? 999;
          return pA - pB;
        }
        if (sortBy === "price_desc") {
          const pA = a.pricing?.input_per_mtok ?? -1;
          const pB = b.pricing?.input_per_mtok ?? -1;
          return pB - pA;
        }
        if (sortBy === "newest") {
          const dA = a.created_date ? new Date(a.created_date).getTime() : 0;
          const dB = b.created_date ? new Date(b.created_date).getTime() : 0;
          return dB - dA;
        }
        return 0;
      });
  }, [models, search, capability, provider, pricingTier, hasVision, hasTools, sortBy]);

  return (
    <main className="flex-1 min-h-screen py-10 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
            Model Explorer
          </h1>
          <p className="text-slate-400 text-sm">
            Browse, filter, and analyze {models.length} AI models from leading labs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-sm font-medium transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-violet-400" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync Latest Models"}</span>
          </button>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare Models</span>
          </Link>
        </div>
      </div>

      {/* Search & Quick Filters */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-xl mb-8 space-y-4">
        {/* Top search line */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by model name, provider (e.g. OpenAI, DeepSeek, Claude)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="all">All Providers ({providers.length})</option>
              {providers.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="score">Sort by Overall Score</option>
              <option value="context">Sort by Context Length</option>
              <option value="price_asc">Price: Lowest to Highest</option>
              <option value="price_desc">Price: Highest to Lowest</option>
              <option value="newest">Sort by Release Date (Newest)</option>
            </select>
          </div>
        </div>

        {/* Capability chips & pricing pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium mr-1">
              Capability:
            </span>
            {[
              { id: "all", label: "All" },
              { id: "reasoning", label: "Reasoning" },
              { id: "coding", label: "Coding" },
              { id: "agentic", label: "Agentic" },
              { id: "math", label: "Math" },
              { id: "vision", label: "Vision" },
              { id: "long-context", label: "Long Context" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setCapability(c.id)}
                className={`cursor-pointer px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  capability === c.id
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium mr-1">
              Pricing:
            </span>
            {[
              { id: "all", label: "Any Price" },
              { id: "free", label: "Free" },
              { id: "budget", label: "<$1/M" },
              { id: "mid", label: "$1-$5/M" },
              { id: "flagship", label: ">$5/M" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPricingTier(p.id)}
                className={`cursor-pointer px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  pricingTier === p.id
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model Count & Result Summary */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
        <span>
          Showing <strong className="text-white">{filteredModels.length}</strong> models
        </span>
        {(search || capability !== "all" || provider !== "all" || pricingTier !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setCapability("all");
              setProvider("all");
              setPricingTier("all");
            }}
            className="cursor-pointer text-violet-400 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Models Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-2xl bg-slate-900/40 border border-white/5">
          <p className="text-slate-400 text-base mb-2">No models found matching your criteria.</p>
          <p className="text-xs text-slate-500">Try broadening your search or resetting filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModels.map((model) => {
            const hasScore = model.overall_score != null;
            const inputPrice = model.pricing?.input_per_mtok;
            const outputPrice = model.pricing?.output_per_mtok;

            return (
              <div
                key={model.slug || model.id}
                className="group p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-violet-500/40 hover:bg-slate-850/60 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top tags line */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5">
                      {model.provider}
                    </span>
                    <div className="text-right">
                      {hasScore ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-300 font-bold text-sm">
                          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                          <span>{model.overall_score.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Live OpenRouter
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <Link href={`/models/${model.slug}`}>
                    <h2 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors mb-2 line-clamp-1">
                      {model.name}
                    </h2>
                  </Link>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {model.description || "High-performance multimodal language model."}
                  </p>

                  {/* Specs Pill Grid */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-black/20 border border-white/5 text-xs mb-4">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Context Window</span>
                      <span className="font-semibold text-slate-200">
                        {model.context_length
                          ? `${Math.round(model.context_length / 1000)}k tokens`
                          : "128k tokens"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Pricing / MTok</span>
                      <span className="font-semibold text-slate-200">
                        {inputPrice != null
                          ? inputPrice === 0
                            ? "Free"
                            : `$${inputPrice} in / $${outputPrice ?? "-"} out`
                          : "Pricing on request"}
                      </span>
                    </div>
                  </div>

                  {/* Capability mini-scores if available */}
                  {hasScore && (
                    <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-t border-white/5">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Reasoning</span>
                        <span className="font-semibold text-slate-300">
                          {model.reasoning_score != null ? model.reasoning_score.toFixed(1) : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Coding</span>
                        <span className="font-semibold text-slate-300">
                          {model.coding_score != null ? model.coding_score.toFixed(1) : "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Agentic</span>
                        <span className="font-semibold text-slate-300">
                          {model.agentic_score != null ? model.agentic_score.toFixed(1) : "-"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2">
                  <Link
                    href={`/compare?models=${model.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>Compare</span>
                  </Link>

                  <Link
                    href={`/models/${model.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <span>Full Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
