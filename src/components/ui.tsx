"use client";

import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("modeldodge-theme");
    if (stored) {
      setTheme(stored as "light" | "dark");
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("modeldodge-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return { theme, toggleTheme };
}

export function useSearch() {
  const [query, setQuery] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return { query, setQuery, handleChange };
}

export function useNavigation() {
  const items = [
    { label: "Home", href: "/", active: true },
    { label: "Models", href: "/models", active: false },
    { label: "Benchmarks", href: "/benchmarks", active: false },
    { label: "Leaderboard", href: "/leaderboard", active: false },
    { label: "Compare", href: "/compare", active: false },
    { label: "Recommend", href: "/recommend", active: false },
  ];

  return { items, setActive: (label: string) => {} };
}

export function NavigationDesktop() {
  const { items } = useNavigation();

  return (
    <nav className="flex gap-8 text-sm font-medium">
      {items.map((item) => (
        <a key={item.label} href={item.href} className={`
          text-gray-600 hover:text-primary transition-colors
          ${item.active ? "text-primary" : ""}
        `}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export function NavigationMobile() {
  const { toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={toggleTheme}
        className="p-2 rounded hover:bg-gray-100 transition-colors"
        aria-label="Toggle theme"
      >
        <Moon className="h-4 w-4 hidden dark:block" />
        <Sun className="h-4 w-4 block hidden dark:inline" />
      </button>

      <nav className="hidden md:block bg-white p-4 rounded-lg shadow-sm">
        <a href="/">BenchWiki</a>
        <div className="mt-2 flex gap-2">
          <a href="/models" className="text-sm text-gray-600 hover:text-primary transition-colors">Models</a>
          <a href="/benchmarks" className="text-sm text-gray-600 hover:text-primary transition-colors">Benchmarks</a>
          <a href="/leaderboard" className="text-sm text-gray-600 hover:text-primary transition-colors">Leaderboard</a>
          <a href="/compare" className="text-sm text-gray-600 hover:text-primary transition-colors">Compare</a>
        </div>
      </nav>
    </div>
  );
}

export function MobileNav() {
  const { toggleTheme } = useTheme();

  return (
    <nav className="flex fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg">
      <a href="/" className="flex-1 text-center text-gray-600 hover:text-primary transition-colors py-2 rounded-lg font-medium" aria-label="Home">
        Home
      </a>
      <a href="/models" className="flex-1 text-center text-gray-600 hover:text-primary transition-colors py-2 rounded-lg font-medium" aria-label="Models">
        Models
      </a>
      <a href="/benchmarks" className="flex-1 text-center text-gray-600 hover:text-primary transition-colors py-2 rounded-lg font-medium" aria-label="Benchmarks">
        Benchmarks
      </a>
      <a href="/leaderboard" className="flex-1 text-center text-gray-600 hover:text-primary transition-colors py-2 rounded-lg font-medium" aria-label="Leaderboard">
        Leaderboard
      </a>
    </nav>
  );
}