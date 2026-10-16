"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Brain,
  Code,
  Cpu,
  Eye,
  Layers,
  BarChart3,
  Calendar,
  DollarSign,
  ExternalLink,
  GitCompare,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "lucide-react";

export default function ModelDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [model, setModel] = useState<any>(null);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/models/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.model) {
          setModel(data.model);
          setBenchmarks(data.benchmarks || []);
        } else {
          // Direct model object fallback
          setModel(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen py-16 px-4 md:px-8 max-w-6xl mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading model intelligence...</p>
        </div>
      </main>
    );
  }

  if (!model) {
    return (
      <main className="min-h-screen py-20 px-4 md:px-8 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Model Not Found</h2>
        <p className="text-slate-400 mb-6">
          The requested model identifier &quot;{slug}&quot; does not match our catalog.
        </p>
        <Link
          href="/models"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Model Catalog
        </Link>
      </main>
    );
  }

  const capabilityStats = [
    { label: "Overall Score", value: model.overall_score, icon: Sparkles, color: "text-violet-400" },
    { label: "Reasoning", value: model.reasoning_score, icon: Brain, color: "text-blue-400" },
    { label: "Coding", value: model.coding_score, icon: Code, color: "text-emerald-400" },
    { label: "Agentic & Tools", value: model.agentic_score, icon: Cpu, color: "text-purple-400" },
    { label: "Mathematics", value: model.math_score, icon: BarChart3, color: "text-amber-400" },
    { label: "Vision", value: model.vision_score, icon: Eye, color: "text-pink-400" },
    { label: "Long Context", value: model.long_context_score, icon: Layers, color: "text-cyan-400" },
  ];

  return (
    <main className="flex-1 min-h-screen py-10 px-4 md:px-8 max-w-6xl mx-auto">
      {/* Back button */}
      <Link
        href="/models"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Models
      </Link>

      {/* Model Header Card */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {model.provider}
              </span>
              {model.tool_support && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Tool Calling
                </span>
              )}
              {model.reasoning && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Reasoning
                </span>
              )}
              {model.created_date && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(model.created_date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                  })}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              {model.name}
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              {model.description ||
                "Advanced frontier model designed for high-precision reasoning, agentic tool workflows, and coding."}
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href={`/compare?models=${model.slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-600/20"
              >
                <GitCompare className="w-4 h-4" /> Compare Model
              </Link>
              {model.pricing?.source?.source_url && (
                <a
                  href={model.pricing.source.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-sm font-medium transition-colors"
                >
                  <span>OpenRouter API Specs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Overall Score Badge */}
          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 text-center shrink-0 min-w-[180px]">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Overall Benchmark Score
            </div>
            <div className="text-5xl font-black text-white mb-2">
              {model.overall_score != null ? model.overall_score.toFixed(1) : "-"}
            </div>
            <div className="text-xs text-slate-400">
              {benchmarks.length > 0
                ? `Derived from ${benchmarks.length} benchmarks`
                : "Awaiting formal evaluation"}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Specifications & Capability Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Specifications Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Pricing & Specs
          </h2>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Context Window</span>
              <span className="font-semibold text-white">
                {model.context_length
                  ? `${model.context_length.toLocaleString()} tokens (${Math.round(model.context_length / 1000)}k)`
                  : "128,000 tokens"}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Input Price</span>
              <span className="font-semibold text-white">
                {model.pricing?.input_per_mtok != null
                  ? model.pricing.input_per_mtok === 0
                    ? "Free"
                    : `$${model.pricing.input_per_mtok.toFixed(2)} / MTok`
                  : "Standard API pricing"}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Output Price</span>
              <span className="font-semibold text-white">
                {model.pricing?.output_per_mtok != null
                  ? `$${model.pricing.output_per_mtok.toFixed(2)} / MTok`
                  : "Standard API pricing"}
              </span>
            </div>

            {model.pricing?.cached_input_per_mtok != null && (
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Cached Prompt Read</span>
                <span className="font-semibold text-emerald-400">
                  ${model.pricing.cached_input_per_mtok.toFixed(2)} / MTok
                </span>
              </div>
            )}

            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Modalities</span>
              <span className="font-semibold text-white capitalize">
                {(model.modalities || ["text"]).join(", ")}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-400">Architecture</span>
              <span className="font-semibold text-white">
                {model.architecture || "Dense Transformer / MoE"}
              </span>
            </div>
          </div>
        </div>

        {/* Capability Score Bars */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-400" />
            Capability Breakdown
          </h2>

          <div className="space-y-4 pt-2">
            {capabilityStats.map((stat, idx) => {
              const val = stat.value;
              const percent = val != null ? Math.min(100, Math.max(0, val)) : 0;

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                      {stat.label}
                    </span>
                    <span className="font-bold text-white">
                      {val != null ? `${val.toFixed(1)}%` : "Not evaluated"}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benchmark Scorecard Section */}
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Evaluations & Benchmark Scorecard</h2>
            <p className="text-slate-400 text-sm">
              Specific verified results recorded for this model
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 text-slate-300">
            {benchmarks.length} Records
          </span>
        </div>

        {benchmarks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white/[0.02] rounded-2xl border border-white/5">
            <p className="text-sm">
              No individual benchmark runs have been imported for this specific model variant yet.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Check back as newly published benchmark papers and community evaluations are indexed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Benchmark Name</th>
                  <th className="py-3 px-4">Capability</th>
                  <th className="py-3 px-4">Date Recorded</th>
                  <th className="py-3 px-4 text-right">Score</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {benchmarks.map((b, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <Link
                        href={`/benchmarks/${b.benchmarkSlug}`}
                        className="hover:text-violet-400 transition-colors"
                      >
                        {b.benchmark}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300">
                        {b.capability}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {b.date ? new Date(b.date).toLocaleDateString() : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">
                      {b.score.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/benchmarks/${b.benchmarkSlug}`}
                        className="text-xs font-semibold text-violet-400 hover:text-violet-300 inline-flex items-center gap-1"
                      >
                        <span>Benchmark Wiki</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}