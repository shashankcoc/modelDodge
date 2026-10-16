"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Brain,
  Code,
  Cpu,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BarChart3,
  Layers,
  Shield,
  Zap,
  RefreshCw,
  Eye,
  Sliders,
  DollarSign,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalModels: 465,
    scoredModels: 80,
    totalBenchmarks: 80,
    totalProviders: 30,
    totalEvaluations: 390,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    // Load leaderboard
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => setLeaderboard(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(console.error);

    // Load benchmarks
    fetch("/api/benchmarks")
      .then((res) => res.json())
      .then((data) => setBenchmarks(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(console.error);

    // Load stats
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/recommend?useCase=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleSyncModels = async () => {
    setIsSyncing(true);
    setSyncStatus("Fetching latest models from OpenRouter...");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      setSyncStatus(`Updated! ${data.count} live models indexed.`);
      // Reload stats
      const statsRes = await fetch("/api/stats");
      const statsData = await statsRes.json();
      setStats(statsData);
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (e) {
      setSyncStatus("Sync failed. Check connection.");
      setTimeout(() => setSyncStatus(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const popularQuestions = [
    { title: "Best model for coding agents", tag: "Coding", icon: Code },
    { title: "Top reasoning model for math & science", tag: "Reasoning", icon: Brain },
    { title: "Best budget model under $1/M tokens", tag: "Value", icon: DollarSign },
    { title: "Largest context window for multi-document RAG", tag: "Context", icon: Layers },
    { title: "Best vision & multimodal understanding", tag: "Vision", icon: Eye },
    { title: "Highest scoring tool use & agentic model", tag: "Agentic", icon: Cpu },
  ];

  const capabilityCards = [
    {
      title: "Reasoning",
      id: "reasoning",
      icon: Brain,
      color: "from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30",
      description: "Complex logic, multi-step problem solving & deduction",
    },
    {
      title: "Coding",
      id: "coding",
      icon: Code,
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30",
      description: "Code generation, debugging, refactoring & SWE-bench",
    },
    {
      title: "Agentic & Tools",
      id: "agentic",
      icon: Cpu,
      color: "from-violet-500/20 to-purple-500/10 text-violet-400 border-violet-500/30",
      description: "Autonomous workflows, function calling & tool use",
    },
    {
      title: "Mathematics",
      id: "math",
      icon: BarChart3,
      color: "from-amber-500/20 to-yellow-500/10 text-amber-400 border-amber-500/30",
      description: "Competition math, formal proofs, AIME & GSM8K",
    },
    {
      title: "Vision & Multimodal",
      id: "vision",
      icon: Eye,
      color: "from-pink-500/20 to-rose-500/10 text-pink-400 border-pink-500/30",
      description: "OCR, diagram comprehension, video & image reasoning",
    },
    {
      title: "Long Context",
      id: "long-context",
      icon: Layers,
      color: "from-cyan-500/20 to-sky-500/10 text-cyan-400 border-cyan-500/30",
      description: "128k to 2M+ token retrieval & needle-in-a-haystack",
    },
  ];

  return (
    <main className="flex-1 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 md:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/20 via-blue-600/20 to-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs md:text-sm text-slate-300 mb-8 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>Objective AI Model Intelligence & Benchmark Wiki</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-semibold">Live</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          Find the <span className="text-gradient">exact AI model</span> for your workload.
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Aggregated scores from 80+ rigorous benchmarks, live pricing per million tokens, and automatic discovery of every new model release.
        </p>

        {/* Natural Language Prompt Search Bar */}
        <div className="max-w-3xl mx-auto mb-6 relative">
          <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/15 rounded-2xl p-2 shadow-2xl focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
            <div className="pl-4 pr-3 text-slate-400">
              <Search className="w-5 h-5 text-violet-400" />
            </div>
            <input
              type="text"
              placeholder="e.g. Best coding agent under $5/M tokens with 128k context and tool support..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full bg-transparent border-none text-white text-base md:text-lg focus:outline-none placeholder-slate-500 py-3"
            />
            <button
              onClick={handleSearch}
              className="cursor-pointer bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-medium px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-violet-600/20 shrink-0"
            >
              <span>Recommend</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mb-12">
          <span>Always up-to-date with new model drops</span>
          <button
            onClick={handleSyncModels}
            disabled={isSyncing}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-violet-400" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Check for New Models"}</span>
          </button>
          {syncStatus && (
            <span className="text-emerald-400 font-medium animate-fade-in">{syncStatus}</span>
          )}
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-left">
            <div className="text-3xl font-extrabold text-white mb-1">
              {stats.totalModels || 465}+
            </div>
            <div className="text-xs uppercase tracking-wider text-slate-400">Total Models Indexed</div>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-left">
            <div className="text-3xl font-extrabold text-violet-400 mb-1">
              {stats.totalBenchmarks || 80}
            </div>
            <div className="text-xs uppercase tracking-wider text-slate-400">Verified Benchmarks</div>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-left">
            <div className="text-3xl font-extrabold text-blue-400 mb-1">
              {stats.totalProviders || 30}+
            </div>
            <div className="text-xs uppercase tracking-wider text-slate-400">AI Labs & Providers</div>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-left">
            <div className="text-3xl font-extrabold text-emerald-400 mb-1">
              {stats.totalEvaluations || 390}+
            </div>
            <div className="text-xs uppercase tracking-wider text-slate-400">Score Data Points</div>
          </div>
        </div>
      </section>

      {/* Popular Workload Prompts */}
      <section className="py-10 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Popular Decision Scenarios</h2>
            <p className="text-sm text-slate-400">Quickly jump to pre-filtered model recommendations</p>
          </div>
          <Link
            href="/recommend"
            className="text-sm text-violet-400 hover:text-violet-300 font-medium inline-flex items-center gap-1"
          >
            Custom Recommender <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                window.location.href = `/recommend?useCase=${encodeURIComponent(q.title)}`;
              }}
              className="cursor-pointer group p-5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-violet-500/40 hover:bg-slate-800/40 transition-all text-left flex items-start justify-between gap-4"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/5 text-slate-300 mb-3 border border-white/5">
                  <q.icon className="w-3.5 h-3.5 text-violet-400" />
                  <span>{q.tag}</span>
                </div>
                <div className="text-base font-medium text-white group-hover:text-violet-300 transition-colors">
                  {q.title}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-violet-600/20 group-hover:text-violet-300 text-slate-400 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Capability Explorer */}
      <section className="py-14 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Explore by Core Capability</h2>
            <p className="text-sm text-slate-400">Target benchmarks by skill domain</p>
          </div>
          <Link
            href="/leaderboard"
            className="text-sm text-violet-400 hover:text-violet-300 font-medium inline-flex items-center gap-1"
          >
            Full Leaderboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {capabilityCards.map((cap) => (
            <Link
              key={cap.id}
              href={`/leaderboard?capability=${cap.id}`}
              className="group p-6 rounded-2xl bg-slate-900/50 border border-white/10 hover:border-white/20 transition-all relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${cap.color} border`}>
                  <cap.icon className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase tracking-wider text-slate-500 font-mono">
                  Domain
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors mb-1.5">
                  {cap.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{cap.description}</p>
                <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 group-hover:text-white">
                  <span>View ranked models</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Models Spotlight */}
      <section className="py-14 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Top Ranked Models</h2>
            <p className="text-sm text-slate-400">Aggregated from multi-benchmark performance</p>
          </div>
          <Link
            href="/models"
            className="text-sm text-violet-400 hover:text-violet-300 font-medium inline-flex items-center gap-1"
          >
            All 460+ Models <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {leaderboard.map((item, idx) => (
            <Link
              key={item.slug || idx}
              href={`/models/${item.slug}`}
              className="group p-6 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-violet-500/40 hover:bg-slate-850/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-violet-600/20 text-violet-400 text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5">
                      {item.provider}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-white">
                      {item.overall ? item.overall.toFixed(1) : "-"}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">Score</div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors mb-2 line-clamp-1">
                  {item.model}
                </h3>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 my-3 text-xs">
                  <div>
                    <div className="text-slate-500 text-[10px] uppercase">Reasoning</div>
                    <div className="font-semibold text-slate-200">
                      {item.reasoning != null ? item.reasoning.toFixed(1) : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px] uppercase">Coding</div>
                    <div className="font-semibold text-slate-200">
                      {item.coding != null ? item.coding.toFixed(1) : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px] uppercase">Context</div>
                    <div className="font-semibold text-slate-200">
                      {item.context ? `${Math.round(item.context / 1000)}k` : "128k"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                <span>
                  {item.cost != null ? `$${item.cost}/M in` : "Pricing available"}
                </span>
                <span className="text-violet-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1 font-medium">
                  Details <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Benchmark Wiki Highlight */}
      <section className="py-14 px-4 md:px-8 max-w-7xl mx-auto mb-16">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/10 relative overflow-hidden">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/30 uppercase tracking-wider mb-4 inline-block">
              Benchmark Wiki & Methodology
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Traceable, transparent evaluation data.
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Every score on ModelDodge links to the original paper, dataset, scoring metric, and evaluation methodology. No fabricated numbers, no hidden sponsorships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {benchmarks.map((b) => (
              <Link
                key={b.slug}
                href={`/benchmarks/${b.slug}`}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet-500/40 hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-400">
                    {b.capability}
                  </span>
                  <span className="text-xs text-slate-500">{b.status || "Active"}</span>
                </div>
                <h4 className="text-base font-bold text-white mb-1.5">{b.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {b.short_description}
                </p>
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Link
              href="/benchmarks"
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-colors inline-flex items-center gap-2"
            >
              <span>Explore all 80 Benchmarks</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/compare"
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-medium text-sm transition-colors inline-flex items-center gap-2"
            >
              <span>Side-by-Side Model Comparison</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}