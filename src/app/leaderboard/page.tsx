"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Search,
  ChevronUp,
  ChevronDown,
  Brain,
  Code,
  Cpu,
  BarChart3,
  Eye,
  Layers,
  Sparkles,
  GitCompare,
  ArrowUpDown,
  Filter,
} from "lucide-react";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [capability, setCapability] = useState("overall");
  const [sortField, setSortField] = useState("overall");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState("all");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (capability && capability !== "overall") params.set("capability", capability);
    if (provider && provider !== "all") params.set("provider", provider);

    fetch(`/api/leaderboard?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [capability, provider]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const providers = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.provider && e.provider !== "Unknown") set.add(e.provider);
    });
    return Array.from(set).sort();
  }, [entries]);

  const sortedEntries = useMemo(() => {
    const list = [...entries].filter((e) => {
      const q = search.toLowerCase();
      return !q || e.model.toLowerCase().includes(q) || e.provider.toLowerCase().includes(q);
    });

    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "cost") {
        aVal = a.cost ?? 9999;
        bVal = b.cost ?? 9999;
      }

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      return sortDir === "asc" ? (aVal > bVal ? 1 : -1) : (bVal > aVal ? 1 : -1);
    });

    return list;
  }, [entries, search, sortField, sortDir]);

  const capabilityTabs = [
    { id: "overall", label: "Overall", icon: Sparkles },
    { id: "reasoning", label: "Reasoning", icon: Brain },
    { id: "coding", label: "Coding", icon: Code },
    { id: "agentic", label: "Agentic & Tools", icon: Cpu },
    { id: "math", label: "Math", icon: BarChart3 },
    { id: "vision", label: "Vision", icon: Eye },
    { id: "longContext", label: "Long Context", icon: Layers },
  ];

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-600 inline ml-1" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-violet-400 inline ml-1" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-violet-400 inline ml-1" />
    );
  };

  return (
    <main className="flex-1 min-h-screen py-10 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-violet-400" />
            AI Model Leaderboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Standardized evaluation rankings across 80+ academic & industry benchmarks.
          </p>
        </div>
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors self-start md:self-auto"
        >
          <GitCompare className="w-4 h-4" /> Compare Models Side-by-Side
        </Link>
      </div>

      {/* Capability Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {capabilityTabs.map((tab) => {
          const isActive = capability === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setCapability(tab.id);
                setSortField(tab.id);
                setSortDir("desc");
              }}
              className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 ${
                isActive
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter leaderboard by model or provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Providers</option>
            {providers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <span className="text-xs text-slate-400">
            <strong>{sortedEntries.length}</strong> models ranked
          </span>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-3xl bg-slate-900/70 border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4 text-center w-16">
                  <span className="cursor-pointer" onClick={() => handleSort("rank")}>
                    Rank <SortIcon field="rank" />
                  </span>
                </th>
                <th className="py-4 px-4">
                  <span className="cursor-pointer" onClick={() => handleSort("model")}>
                    Model & Lab <SortIcon field="model" />
                  </span>
                </th>
                <th className="py-4 px-4 text-right">
                  <span className="cursor-pointer" onClick={() => handleSort("overall")}>
                    Overall Score <SortIcon field="overall" />
                  </span>
                </th>
                <th className="py-4 px-4 text-right">
                  <span className="cursor-pointer" onClick={() => handleSort("reasoning")}>
                    Reasoning <SortIcon field="reasoning" />
                  </span>
                </th>
                <th className="py-4 px-4 text-right">
                  <span className="cursor-pointer" onClick={() => handleSort("coding")}>
                    Coding <SortIcon field="coding" />
                  </span>
                </th>
                <th className="py-4 px-4 text-right">
                  <span className="cursor-pointer" onClick={() => handleSort("agentic")}>
                    Agentic <SortIcon field="agentic" />
                  </span>
                </th>
                <th className="py-4 px-4 text-right">
                  <span className="cursor-pointer" onClick={() => handleSort("context")}>
                    Context <SortIcon field="context" />
                  </span>
                </th>
                <th className="py-4 px-4 text-right">
                  <span className="cursor-pointer" onClick={() => handleSort("cost")}>
                    Price / MTok <SortIcon field="cost" />
                  </span>
                </th>
                <th className="py-4 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                      <span>Computing rankings...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    No models match the selected capability or filter.
                  </td>
                </tr>
              ) : (
                sortedEntries.map((row, index) => {
                  const rank = row.rank || index + 1;
                  const isTop3 = rank <= 3;
                  const badgeColors =
                    rank === 1
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : rank === 2
                      ? "bg-slate-300/20 text-slate-200 border-slate-300/30"
                      : rank === 3
                      ? "bg-amber-700/20 text-amber-400 border-amber-700/30"
                      : "bg-white/5 text-slate-400";

                  return (
                    <tr
                      key={row.slug || index}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Rank */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`w-7 h-7 rounded-full text-xs font-bold inline-flex items-center justify-center border ${badgeColors}`}
                        >
                          {rank}
                        </span>
                      </td>

                      {/* Model & Provider */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-white group-hover:text-violet-300 transition-colors">
                          <Link href={`/models/${row.slug || row.model.toLowerCase()}`}>
                            {row.model}
                          </Link>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{row.provider}</span>
                          {row.benchmarkCount > 0 && (
                            <span className="text-[10px] text-slate-500">
                              • {row.benchmarkCount} benchmarks
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Overall Score */}
                      <td className="py-4 px-4 text-right">
                        <span className="text-base font-extrabold text-white">
                          {row.overall != null ? row.overall.toFixed(1) : "-"}
                        </span>
                      </td>

                      {/* Reasoning */}
                      <td className="py-4 px-4 text-right font-medium text-slate-300">
                        {row.reasoning != null ? `${row.reasoning.toFixed(1)}%` : "-"}
                      </td>

                      {/* Coding */}
                      <td className="py-4 px-4 text-right font-medium text-slate-300">
                        {row.coding != null ? `${row.coding.toFixed(1)}%` : "-"}
                      </td>

                      {/* Agentic */}
                      <td className="py-4 px-4 text-right font-medium text-slate-300">
                        {row.agentic != null ? `${row.agentic.toFixed(1)}%` : "-"}
                      </td>

                      {/* Context */}
                      <td className="py-4 px-4 text-right text-slate-300 text-xs font-mono">
                        {row.context ? `${Math.round(row.context / 1000)}k` : "128k"}
                      </td>

                      {/* Cost */}
                      <td className="py-4 px-4 text-right text-slate-300 text-xs">
                        {row.cost != null
                          ? row.cost === 0
                            ? "Free"
                            : `$${row.cost}/M`
                          : "Available"}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-center">
                        <Link
                          href={`/compare?models=${row.slug}`}
                          className="text-xs text-violet-400 hover:text-violet-300 font-semibold inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                          <span>Compare</span>
                        </Link>
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
