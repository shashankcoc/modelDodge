"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Zap,
  BarChart3,
  GitCompare,
  BookOpen,
  Sparkles,
  Layers,
  Menu,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/models", label: "Models", icon: Layers },
  { href: "/benchmarks", label: "Benchmarks", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/recommend", label: "Recommend", icon: Sparkles },
];

export function Header() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setResults([]);
  };

  return (
    <header className="glass sticky top-0 z-50 border-b border-[var(--border-secondary)]">
      <div className="max-w-[1360px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center transition-transform group-hover:scale-110">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Model<span className="gradient-text">Dodge</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[0.8125rem] font-medium transition-all ${
                    isActive
                      ? "text-[var(--accent-blue-hover)] bg-[var(--accent-blue-muted)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="btn-ghost rounded-lg p-2"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden btn-ghost rounded-lg p-2"
              aria-label="Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "text-[var(--accent-blue-hover)] bg-[var(--accent-blue-muted)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.04)]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="max-w-2xl mx-auto pt-20 px-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-secondary)]">
                <Search className="w-5 h-5 text-[var(--text-tertiary)]" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search models, benchmarks, providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
                />
                <button
                  onClick={handleSearchClose}
                  className="p-1 rounded hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                >
                  <X className="w-4 h-4 text-[var(--text-tertiary)]" />
                </button>
              </div>

              {results.length > 0 && (
                <div className="max-h-80 overflow-y-auto">
                  {results.map((result, i) => (
                    <Link
                      key={i}
                      href={`/${result.type === "model" ? "models" : "benchmarks"}/${result.slug}`}
                      onClick={handleSearchClose}
                      className="flex items-center justify-between px-5 py-3 hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-[var(--text-primary)]">
                          {result.name}
                        </div>
                        <div className="text-xs text-[var(--text-tertiary)]">
                          {result.description}
                        </div>
                      </div>
                      <span
                        className={`badge ${
                          result.type === "model"
                            ? "badge-blue"
                            : "badge-purple"
                        }`}
                      >
                        {result.type}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && results.length === 0 && (
                <div className="px-5 py-8 text-center text-[var(--text-muted)] text-sm">
                  No results found for &ldquo;{searchQuery}&rdquo;
                </div>
              )}

              {searchQuery.length < 2 && (
                <div className="px-5 py-6 text-center text-[var(--text-muted)] text-xs">
                  Type at least 2 characters to search
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
