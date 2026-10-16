"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Brain,
  Code,
  Cpu,
  Eye,
  Layers,
  BarChart3,
  BookOpen,
  Calendar,
  ExternalLink,
  Sparkles,
  Trophy,
  ArrowRight,
} from "lucide-react";

export default function BenchmarksPage() {
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [capability, setCapability] = useState("all");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    fetch("/api/benchmarks")
      .then((res) => res.json())
      .then((data) => {
        setBenchmarks(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const capabilities = useMemo(() => {
    const set = new Set<string>();
    benchmarks.forEach((b) => {
      if (b.capability) set.add(b.capability);
    });
    return Array.from(set).sort();
  }, [benchmarks]);

  const statuses = useMemo(() => {
    const set = new Set<string>();
    benchmarks.forEach((b) => {
      if (b.status) set.add(b.status);
    });
    return Array.from(set).sort();
  }, [benchmarks]);

  const filteredBenchmarks = useMemo(() => {
    return benchmarks.filter((b) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.short_description?.toLowerCase().includes(q) ||
        b.capability.toLowerCase().includes(q);

      if (!matchSearch) return false;
      if (capability !== "all" && b.capability !== capability) return false;
      if (status !== "all" && b.status !== status) return false;

      return true;
    });
  }, [benchmarks, search, capability, status]);

  const getStatusBadge = (s: string) => {
    switch (s?.toLowerCase()) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "nearing saturation":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "saturated":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-white/5 text-slate-400 border-white/10";
    }
  };

  return (
    <main className="flex-1 min-h-screen py-10 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-violet-400" />
            AI Benchmark Wiki
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Encyclopedia of {benchmarks.length} academic & frontier evaluation datasets, metrics, and methodology.
          </p>
        </div>
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors self-start md:self-auto"
        >
          <span>View Overall Leaderboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-xl mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search benchmarks (e.g. SWE-bench, MMLU, GSM8K)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <select
              value={capability}
              onChange={(e) => setCapability(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Capabilities ({capabilities.length})</option>
              {capabilities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses ({statuses.length})</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
        <span>
          Showing <strong className="text-white">{filteredBenchmarks.length}</strong> benchmarks
        </span>
        {(search || capability !== "all" || status !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setCapability("all");
              setStatus("all");
            }}
            className="cursor-pointer text-violet-400 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Benchmarks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : filteredBenchmarks.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-2xl bg-slate-900/40 border border-white/5">
          <p className="text-slate-400 text-base mb-2">No benchmarks match your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBenchmarks.map((b) => {
            const timelineCount = b.performance_timeline?.length || 0;
            const topScore =
              b.performance_timeline && b.performance_timeline.length > 0
                ? Math.max(...b.performance_timeline.map((p: any) => p.score || 0))
                : null;

            return (
              <div
                key={b.slug}
                className="group p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-violet-500/40 hover:bg-slate-850/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {b.capability}
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                        b.status
                      )}`}
                    >
                      {b.status || "Active"}
                    </span>
                  </div>

                  <Link href={`/benchmarks/${b.slug}`}>
                    <h2 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors mb-2 line-clamp-1">
                      {b.name}
                    </h2>
                  </Link>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {b.short_description || "Comprehensive evaluation benchmark dataset."}
                  </p>

                  <div className="flex items-center justify-between text-xs py-2 border-t border-white/5 text-slate-400">
                    <span>Evaluations: <strong className="text-white">{timelineCount} models</strong></span>
                    {topScore != null && (
                      <span className="text-emerald-400 font-semibold">
                        Top: {topScore.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2">
                  <span className="text-xs text-slate-500">
                    {b.launch_date ? `Launched ${b.launch_date.split("-")[0]}` : "Benchmark Wiki"}
                  </span>
                  <Link
                    href={`/benchmarks/${b.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <span>View Benchmark</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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