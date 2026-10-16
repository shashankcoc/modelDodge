"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, BookOpen, BarChart3, Sparkles } from "lucide-react";

const MOBILE_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/models", label: "Models", icon: Layers },
  { href: "/benchmarks", label: "Benchmarks", icon: BookOpen },
  { href: "/leaderboard", label: "Board", icon: BarChart3 },
  { href: "/recommend", label: "Discover", icon: Sparkles },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-[var(--border-secondary)]">
      <div className="flex items-center justify-around py-2 px-1">
        {MOBILE_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[0.625rem] font-medium transition-all ${
                isActive
                  ? "text-[var(--accent-blue-hover)]"
                  : "text-[var(--text-muted)] active:text-[var(--text-secondary)]"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-[var(--accent-blue-hover)]" : ""
                }`}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
