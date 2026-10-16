"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  GitCompare,
  Search,
  X,
  Plus,
  Sparkles,
  Trophy,
  Brain,
  Code,
  Cpu,
  Layers,
  Eye,
  BarChart3,
  DollarSign,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

function CompareContent() {
  const searchParams = useSearchParams();
  const [allModels, setAllModels] = useState<any[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [compareData, setCompareData] = useState<{
    models: any[];
    benchmarkMatrix: any[];
  } | null>(null);
  const [modelSearch, setModelSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Load models catalog
  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setAllModels(arr);

        // Check if query params have models
        const queryModels = searchParams.get("models");
        if (queryModels) {
          const slugs = queryModels.split(",").filter(Boolean);
          setSelectedSlugs(slugs.slice(0, 4));
        } else if (arr.length >= 2) {
          // Default selection of top 2-3 models
          setSelectedSlugs([arr[0]?.slug, arr[1]?.slug, arr[2]?.slug].filter(Boolean));
        }
      })
      .catch(console.error);
  }, [searchParams]);

  // Fetch comparison data whenever selectedSlugs change
  useEffect(() => {
    if (selectedSlugs.length < 1) {
      setCompareData(null);
      return;
    }

    setLoading(true);
    fetch(`/api/compare?models=${selectedSlugs.join(",")}`)
      .then((res) => res.json())
      .then((data) => {
        setCompareData(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedSlugs]);

  const addModel = (slug: string) => {
    if (!selectedSlugs.includes(slug) && selectedSlugs.length < 4) {
      setSelectedSlugs([...selectedSlugs, slug]);
      setModelSearch("");
    }
  };

  const removeModel = (slug: string) => {
    setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
  };

  const searchResults = allModels
    .filter(
      (m) =>
        !selectedSlugs.includes(m.slug) &&
        (m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
          m.provider.toLowerCase().includes(modelSearch.toLowerCase()))
    )
    .slice(0, 6);

  const capabilityRows = [
    { label: "Overall Score", key: "overall_score", icon: Sparkles, color: "text-violet-400" },
    { label: "Reasoning", key: "reasoning_score", icon: Brain, color: "text-blue-400" },
    { label: "Coding", key: "coding_score", icon: Code, color: "text-emerald-400" },
    { label: "Agentic & Tools", key: "agentic_score", icon: Cpu, color: "text-purple-400" },
    { label: "Mathematics", key: "math_score", icon: BarChart3, color: "text-amber-400" },
    { label: "Vision", key: "vision_score", icon: Eye, color: "text-pink-400" },
    { label: "Long Context", key: "long_context_score", icon: Layers, color: "text-cyan-400" },
  ];

  const comparedModels = compareData?.models || [];
  const benchmarkMatrix = compareData?.benchmarkMatrix || [];

  return (
    <main className="flex-1 min-h-screen py-10 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <GitCompare className="w-8 h-8 text-violet-400" />
          Model Head-to-Head Comparison
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Compare up to 4 AI models side-by-side across verified benchmark scores, pricing, and context windows.
        </p>
      </div>

      {/* Selected Models Cards & Add Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-xl mb-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              Comparing ({selectedSlugs.length}/4):
            </span>
            {selectedSlugs.map((slug) => {
              const m = allModels.find((x) => x.slug === slug);
              return (
                <div
                  key={slug}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-white text-xs font-semibold"
                >
                  <span>{m?.name || slug}</span>
                  <button
                    onClick={() => removeModel(slug)}
                    className="cursor-pointer text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Presets:</span>
            <button
              onClick={() => {
                const frontier = allModels.slice(0, 3).map((m) => m.slug);
                setSelectedSlugs(frontier);
              }}
              className="cursor-pointer px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
            >
              Top Frontier
            </button>
          </div>
        </div>

        {/* Add Model Search Bar if less than 4 */}
        {selectedSlugs.length < 4 && (
          <div className="relative">
            <div className="flex items-center bg-slate-950/80 border border-white/10 rounded-2xl px-4 py-2.5">
              <Search className="w-4 h-4 text-slate-400 mr-3" />
              <input
                type="text"
                placeholder="Search models to add to comparison..."
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                className="w-full bg-transparent border-none text-white text-sm focus:outline-none placeholder-slate-500"
              />
            </div>

            {/* Dropdown search results */}
            {modelSearch.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-slate-900 border border-white/15 shadow-2xl z-30 space-y-1">
                {searchResults.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center">No matching models found.</div>
                ) : (
                  searchResults.map((m) => (
                    <button
                      key={m.slug}
                      onClick={() => addModel(m.slug)}
                      className="cursor-pointer w-full p-2.5 rounded-xl text-left hover:bg-white/5 flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-white">{m.name}</div>
                        <div className="text-slate-400 text-[11px]">{m.provider}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {m.overall_score && (
                          <span className="text-violet-400 font-bold">{m.overall_score.toFixed(1)}</span>
                        )}
                        <span className="p-1 rounded-md bg-violet-600 text-white">
                          <Plus className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <span>Building comparison matrix...</span>
        </div>
      ) : comparedModels.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900/40 border border-white/5 text-center text-slate-400">
          <p className="text-base mb-2">No models selected for comparison.</p>
          <p className="text-xs text-slate-500">
            Select 2 to 4 models from the explorer above or from the models directory.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Models Header Cards Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comparedModels.map((m, idx) => (
              <div
                key={m.slug || idx}
                className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300">
                      {m.provider}
                    </span>
                    <button
                      onClick={() => removeModel(m.slug)}
                      className="cursor-pointer text-slate-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{m.name}</h3>

                  <div className="text-3xl font-black text-white mb-1">
                    {m.overall_score ? m.overall_score.toFixed(1) : "-"}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-4">
                    Overall Benchmark Score
                  </div>
                </div>

                <Link
                  href={`/models/${m.slug}`}
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300 inline-flex items-center gap-1 pt-2 border-t border-white/5"
                >
                  <span>Full Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>

          {/* Capabilities Comparison Matrix */}
          <div className="rounded-3xl bg-slate-900/70 border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 bg-slate-950/60 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Capability Benchmarks Matrix
              </h3>
              <span className="text-xs text-slate-400">Green highlight indicates category winner</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-400 bg-white/[0.01]">
                    <th className="py-3 px-6">Domain</th>
                    {comparedModels.map((m) => (
                      <th key={m.slug} className="py-3 px-6 text-right font-bold text-white">
                        {m.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {capabilityRows.map((row) => {
                    // Find max score among models for this capability
                    let maxVal = -1;
                    comparedModels.forEach((m) => {
                      const v = m[row.key];
                      if (v != null && v > maxVal) maxVal = v;
                    });

                    return (
                      <tr key={row.key} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-200 flex items-center gap-2">
                          <row.icon className={`w-4 h-4 ${row.color}`} />
                          {row.label}
                        </td>
                        {comparedModels.map((m) => {
                          const val = m[row.key];
                          const isWinner = val != null && val === maxVal && comparedModels.length > 1;

                          return (
                            <td key={m.slug} className="py-4 px-6 text-right">
                              {val != null ? (
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-lg font-bold text-xs ${
                                    isWinner
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                      : "text-white"
                                  }`}
                                >
                                  {val.toFixed(1)}% {isWinner && "★"}
                                </span>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Technical Specs Comparison Table */}
          <div className="rounded-3xl bg-slate-900/70 border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 bg-slate-950/60">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Pricing, Context & Specs Comparison
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-white/5">
                  {/* Context Length */}
                  <tr>
                    <td className="py-4 px-6 font-medium text-slate-400">Context Window</td>
                    {comparedModels.map((m) => (
                      <td key={m.slug} className="py-4 px-6 text-right font-bold text-white">
                        {m.context_length
                          ? `${Math.round(m.context_length / 1000)}k tokens`
                          : "128k tokens"}
                      </td>
                    ))}
                  </tr>

                  {/* Input Price */}
                  <tr>
                    <td className="py-4 px-6 font-medium text-slate-400">Input Price / MTok</td>
                    {comparedModels.map((m) => {
                      const cost = m.pricing?.input_per_mtok;
                      return (
                        <td key={m.slug} className="py-4 px-6 text-right font-bold text-white">
                          {cost != null ? (cost === 0 ? "Free" : `$${cost.toFixed(2)}`) : "Available"}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Output Price */}
                  <tr>
                    <td className="py-4 px-6 font-medium text-slate-400">Output Price / MTok</td>
                    {comparedModels.map((m) => {
                      const cost = m.pricing?.output_per_mtok;
                      return (
                        <td key={m.slug} className="py-4 px-6 text-right font-bold text-white">
                          {cost != null ? `$${cost.toFixed(2)}` : "Available"}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Tool Support */}
                  <tr>
                    <td className="py-4 px-6 font-medium text-slate-400">Tool Calling & Agents</td>
                    {comparedModels.map((m) => (
                      <td key={m.slug} className="py-4 px-6 text-right font-bold">
                        <span className="text-emerald-400">Supported</span>
                      </td>
                    ))}
                  </tr>

                  {/* Modalities */}
                  <tr>
                    <td className="py-4 px-6 font-medium text-slate-400">Modalities</td>
                    {comparedModels.map((m) => (
                      <td key={m.slug} className="py-4 px-6 text-right text-xs text-slate-300 capitalize">
                        {(m.modalities || ["text"]).join(", ")}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Shared Benchmark Head-to-Head Table */}
          {benchmarkMatrix.length > 0 && (
            <div className="rounded-3xl bg-slate-900/70 border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-white/10 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Direct Benchmark-by-Benchmark Matchups ({benchmarkMatrix.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Individual test results across all verified benchmarks
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[500px] scrollbar-thin">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-slate-950 text-xs uppercase tracking-wider text-slate-400 z-10">
                    <tr className="border-b border-white/10">
                      <th className="py-3 px-6">Benchmark</th>
                      <th className="py-3 px-6">Capability</th>
                      {comparedModels.map((m) => (
                        <th key={m.slug} className="py-3 px-6 text-right">
                          {m.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {benchmarkMatrix.map((bm: any, idx: number) => {
                      // Determine max score
                      let maxScore = -1;
                      Object.values(bm.scores).forEach((s: any) => {
                        if (s != null && s > maxScore) maxScore = s;
                      });

                      return (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-3.5 px-6 font-semibold text-white">
                            <Link
                              href={`/benchmarks/${bm.benchmarkSlug}`}
                              className="hover:text-violet-400 transition-colors"
                            >
                              {bm.benchmark}
                            </Link>
                          </td>
                          <td className="py-3.5 px-6">
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                              {bm.capability}
                            </span>
                          </td>
                          {comparedModels.map((m) => {
                            const score = bm.scores[m.slug];
                            const isWin = score != null && score === maxScore;

                            return (
                              <td key={m.slug} className="py-3.5 px-6 text-right font-bold text-xs">
                                {score != null ? (
                                  <span
                                    className={
                                      isWin
                                        ? "text-emerald-400 font-extrabold"
                                        : "text-slate-300 font-medium"
                                    }
                                  >
                                    {score.toFixed(1)}% {isWin && "★"}
                                  </span>
                                ) : (
                                  <span className="text-slate-600 font-normal">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-20 text-center text-slate-400">
          Loading comparison tool...
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
