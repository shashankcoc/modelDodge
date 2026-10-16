"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Globe,
  BookOpen,
  Trophy,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function BenchmarkDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [benchmark, setBenchmark] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/benchmarks/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.benchmark) {
          setBenchmark(data.benchmark);
          setTimeline(data.performance_timeline || []);
        } else {
          setBenchmark(data);
          setTimeline(data.performance_timeline || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen py-20 px-4 max-w-5xl mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading benchmark intelligence...</p>
        </div>
      </main>
    );
  }

  if (!benchmark) {
    return (
      <main className="min-h-screen py-20 px-4 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Benchmark Not Found</h2>
        <Link
          href="/benchmarks"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Benchmarks
        </Link>
      </main>
    );
  }

  const sortedTimeline = [...timeline].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return (
    <main className="flex-1 min-h-screen py-10 px-4 md:px-8 max-w-6xl mx-auto">
      {/* Back button */}
      <Link
        href="/benchmarks"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Benchmark Wiki
      </Link>

      {/* Header Card */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono">
                {benchmark.capability}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {benchmark.status || "Active"}
              </span>
              {benchmark.launch_date && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {benchmark.launch_date}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              {benchmark.name}
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              {benchmark.short_description}
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              {benchmark.paper?.url && (
                <a
                  href={benchmark.paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> Read Original Paper
                </a>
              )}
              {benchmark.dataset?.url && (
                <a
                  href={benchmark.dataset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-medium transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" /> Dataset Repository
                </a>
              )}
            </div>
          </div>

          {/* Stats Badge */}
          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 text-center shrink-0 min-w-[180px]">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Top Model Score
            </div>
            <div className="text-5xl font-black text-white mb-2">
              {sortedTimeline.length > 0 ? `${sortedTimeline[0].score.toFixed(1)}%` : "-"}
            </div>
            <div className="text-xs text-slate-400">
              {sortedTimeline.length > 0
                ? `Leading: ${sortedTimeline[0].model}`
                : "No runs yet"}
            </div>
          </div>
        </div>
      </div>

      {/* Methodology & Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            Evaluation Methodology
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-500 uppercase block">Primary Metric</span>
              <span className="font-semibold text-slate-200">
                {benchmark.metric?.primary || "Accuracy (Pass@1)"}
              </span>
            </div>
            {benchmark.metric?.scoring && (
              <div>
                <span className="text-xs text-slate-500 uppercase block">Scoring Details</span>
                <span className="text-slate-300 text-xs">{benchmark.metric.scoring}</span>
              </div>
            )}
            <div>
              <span className="text-xs text-slate-500 uppercase block">Secondary Domains</span>
              <span className="text-slate-300 text-xs">
                {benchmark.secondary_capabilities?.join(", ") || "None specified"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Dataset & Authors
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-500 uppercase block">Dataset Size</span>
              <span className="font-semibold text-slate-200">
                {benchmark.dataset?.size ? `${benchmark.dataset.size.toLocaleString()} examples` : "Standard test split"}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase block">Authors / Affiliation</span>
              <span className="text-slate-300 text-xs">
                {benchmark.authors && benchmark.authors.length > 0
                  ? benchmark.authors.map((a: any) => a.name).join(", ")
                  : benchmark.maintainer || "Academic / Lab Consortium"}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 uppercase block">License</span>
              <span className="text-slate-300 text-xs">{benchmark.license || "Open Source / Permissive"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Leaderboard Table */}
      <div className="rounded-3xl bg-slate-900/70 border border-white/10 overflow-hidden shadow-2xl mb-12">
        <div className="p-6 border-b border-white/10 bg-slate-950/60 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Verified Results Leaderboard ({sortedTimeline.length} Models)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked in descending order of performance
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400 bg-white/[0.01]">
                <th className="py-4 px-6 text-center w-16">Rank</th>
                <th className="py-4 px-6">Model</th>
                <th className="py-4 px-6">Lab / Vendor</th>
                <th className="py-4 px-6">Evaluation Date</th>
                <th className="py-4 px-6 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedTimeline.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No evaluated runs recorded yet for this benchmark.
                  </td>
                </tr>
              ) : (
                sortedTimeline.map((item, idx) => {
                  const rank = idx + 1;
                  const isWinner = rank === 1;

                  return (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`w-7 h-7 rounded-full text-xs font-bold inline-flex items-center justify-center border ${
                            rank === 1
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : rank === 2
                              ? "bg-slate-300/20 text-slate-200 border-slate-300/30"
                              : rank === 3
                              ? "bg-amber-700/20 text-amber-400 border-amber-700/30"
                              : "bg-white/5 text-slate-400 border-white/5"
                          }`}
                        >
                          {rank}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-white">
                        <Link
                          href={`/models/${item.model.toLowerCase().replace(/\s+/g, "-")}`}
                          className="hover:text-violet-300 transition-colors"
                        >
                          {item.model}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-slate-400 capitalize">
                        {item.vendor || "Unknown"}
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-xs font-mono">
                        {item.date ? new Date(item.date).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-4 px-6 text-right font-black text-base text-white">
                        <span
                          className={
                            isWinner
                              ? "text-emerald-400 font-extrabold"
                              : "text-slate-100"
                          }
                        >
                          {item.score != null ? `${item.score.toFixed(1)}%` : "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
