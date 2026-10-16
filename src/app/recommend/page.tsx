"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Brain,
  Code,
  Cpu,
  Layers,
  DollarSign,
  Zap,
  CheckCircle2,
  Sliders,
  TrendingUp,
  GitCompare,
  Trophy,
  ExternalLink,
} from "lucide-react";

function RecommendContent() {
  const searchParams = useSearchParams();
  const [useCase, setUseCase] = useState("");
  const [budget, setBudget] = useState("50");
  const [priority, setPriority] = useState("balanced"); // 'quality', 'value', 'speed', 'balanced'
  const [monthlyTokens, setMonthlyTokens] = useState("5"); // Millions of tokens
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Auto-run when query param provided or default
  useEffect(() => {
    const query = searchParams.get("useCase");
    const initialText = query || "I need an autonomous coding agent with tool calling under $50/month";
    setUseCase(initialText);
    runRecommendation(initialText, parseFloat(budget), priority, parseInt(monthlyTokens));
  }, [searchParams]);

  const runRecommendation = async (
    queryText: string,
    budgetVal: number,
    prioVal: string,
    tokensM: number
  ) => {
    setLoading(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          useCase: queryText || "coding agent",
          budget: budgetVal,
          priority: prioVal,
          inputTokens: tokensM * 700000,
          outputTokens: tokensM * 300000,
        }),
      });
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error("Recommendation error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runRecommendation(useCase, parseFloat(budget), priority, parseInt(monthlyTokens));
  };

  const samplePrompts = [
    "Autonomous coding agent reading large repos with tool calling",
    "Customer support bot under $20/month with low latency",
    "High-accuracy mathematical reasoning and scientific logic",
    "Multimodal document analysis with diagrams and OCR",
    "Budget general assistant for everyday tasks",
  ];

  const topMatch = results?.recommendation || results?.bestOverall;
  const bestValue = results?.bestValue;
  const bestQuality = results?.bestQuality;
  const alternatives = results?.alternatives || [];

  return (
    <main className="flex-1 min-h-screen py-10 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-[var(--accent-cyan)]" />
          AI Model Recommender Engine
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Tell us your workload requirements, monthly budget, and priorities to compute the optimal model.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Settings Column */}
        <div className="lg:col-span-5 p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl h-fit space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Workload Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Workload & Use Case Description
              </label>
              <textarea
                rows={3}
                placeholder="e.g. I need a coding agent under $50/month with tool calling and at least 128k context..."
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-950/80 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--accent-cyan)] placeholder-slate-500 resize-none"
              />
              {/* Quick sample chips */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUseCase(prompt);
                      runRecommendation(prompt, parseFloat(budget), priority, parseInt(monthlyTokens));
                    }}
                    className="cursor-pointer text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {prompt.split(" ").slice(0, 3).join(" ")}...
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Budget Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Target Monthly Budget
                </label>
                <span className="text-sm font-bold text-emerald-400">
                  ${budget}/month
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                step="5"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Free ($0)</span>
                <span>$75</span>
                <span>$150</span>
                <span>$300+ Flagship</span>
              </div>
            </div>

            {/* Monthly Token Volume */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Expected Monthly Volume
                </label>
                <span className="text-sm font-bold text-[var(--accent-cyan)]">
                  ~{monthlyTokens}M Tokens
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={monthlyTokens}
                onChange={(e) => setMonthlyTokens(e.target.value)}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Light (1M)</span>
                <span>Moderate (15M)</span>
                <span>Heavy (50M)</span>
              </div>
            </div>

            {/* Optimization Priority */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Optimization Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "quality", label: "Max Quality" },
                  { id: "balanced", label: "Balanced" },
                  { id: "value", label: "Max Value" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`cursor-pointer py-2.5 px-3 rounded-xl text-xs font-semibold transition-all border ${
                      priority === p.id
                        ? "bg-[var(--accent-cyan)] text-black border-transparent font-bold shadow-md shadow-cyan-500/20"
                        : "bg-slate-950/60 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
            >
              {loading ? (
                <span>Computing optimal matches...</span>
              ) : (
                <>
                  <span>Compute Model Matches</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output Recommendations Column */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="p-16 rounded-3xl bg-slate-900/60 border border-white/10 text-center flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
              <p className="text-sm text-slate-300">
                Evaluating multi-benchmark fitness against budget & token parameters...
              </p>
            </div>
          ) : !topMatch ? (
            <div className="p-16 rounded-3xl bg-slate-900/40 border border-white/5 text-center text-slate-400">
              Submit your workload parameters to receive personalized recommendations.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Detected Capabilities Banner */}
              {results?.detectedCapabilities && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400">Detected Workload Focus:</span>
                  {results.detectedCapabilities.map((cap: string) => (
                    <span
                      key={cap}
                      className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 capitalize"
                    >
                      {cap.replace("_", " ")}
                    </span>
                  ))}
                </div>
              )}

              {/* #1 Top Recommended Match */}
              <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-cyan-500/40 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                    #1 Recommended Model
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-400">
                    ~${topMatch.estimatedMonthlyCost ?? topMatch.estimatedCost ?? "0.00"}/mo
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                      {topMatch.model}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Lab / Provider: <strong className="text-slate-200">{topMatch.provider}</strong>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-4xl font-black text-cyan-400">
                      {topMatch.fitness != null ? `${topMatch.fitness}%` : "95%"}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400">
                      Workload Match
                    </div>
                  </div>
                </div>

                {/* Rationale & Why bullets */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2 mb-6">
                  <strong className="text-xs uppercase tracking-wider text-cyan-300 block">
                    Why this model was chosen:
                  </strong>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {(topMatch.why || [topMatch.rationale]).map((reason: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/models/${topMatch.slug}`}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors inline-flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                  >
                    <span>Inspect Model Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/compare?models=${topMatch.slug}`}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>Compare Head-to-Head</span>
                  </Link>
                </div>
              </div>

              {/* Best Value & Best Quality Spotlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bestValue && bestValue.slug !== topMatch.slug && (
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/40 transition-all">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider mb-2 inline-block">
                      Best Value Contender
                    </span>
                    <h4 className="text-base font-bold text-white mb-1 line-clamp-1">{bestValue.model}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{bestValue.rationale}</p>
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                      <span className="text-emerald-400 font-semibold">${bestValue.estimatedMonthlyCost}/mo</span>
                      <Link href={`/models/${bestValue.slug}`} className="text-cyan-400 hover:underline">
                        Details →
                      </Link>
                    </div>
                  </div>
                )}

                {bestQuality && bestQuality.slug !== topMatch.slug && (
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-blue-500/40 transition-all">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider mb-2 inline-block">
                      Peak Quality Contender
                    </span>
                    <h4 className="text-base font-bold text-white mb-1 line-clamp-1">{bestQuality.model}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{bestQuality.rationale}</p>
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                      <span className="text-white font-semibold">Score: {bestQuality.qualityScore}%</span>
                      <Link href={`/models/${bestQuality.slug}`} className="text-cyan-400 hover:underline">
                        Details →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Runners Up List */}
              {alternatives.length > 0 && (
                <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-5">
                  <h3 className="text-sm font-bold text-white mb-3">Other Strong Alternatives</h3>
                  <div className="space-y-2">
                    {alternatives.map((alt: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white">{alt.model}</div>
                          <div className="text-slate-400 text-[11px]">
                            {alt.provider} • ~${alt.estimatedMonthlyCost}/mo
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-cyan-400">{alt.fitness}% Match</span>
                          <Link
                            href={`/models/${alt.slug}`}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function RecommendPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-20 text-center text-slate-400">
          Loading recommender...
        </div>
      }
    >
      <RecommendContent />
    </Suspense>
  );
}
