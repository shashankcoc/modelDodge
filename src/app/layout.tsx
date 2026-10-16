import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ModelDodge: AI Model & Benchmark Intelligence",
  description:
    "Explore benchmarks, compare models, track performance and find the right AI model for your workload.",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  keywords: [
    "AI models",
    "benchmark",
    "leaderboard",
    "LLM",
    "model comparison",
    "GPT",
    "Claude",
    "Gemini",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <MobileNav />
      </body>
    </html>
  );
}
