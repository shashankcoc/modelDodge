import { NextResponse } from "next/server";
import { getModelsFromBenchmarks, getModelBenchmarks } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const slugs = url.searchParams.get("models")?.split(",").filter(Boolean) || [];

    if (slugs.length < 2) {
      return NextResponse.json(
        { error: "Provide at least 2 model slugs" },
        { status: 400 }
      );
    }

    const allModels = getModelsFromBenchmarks();
    const models = slugs
      .map((slug) => allModels.find((m) => m.slug === slug))
      .filter(Boolean);

    // Find common benchmarks
    const benchmarkSets = slugs.map((slug) => {
      const benchmarks = getModelBenchmarks(slug);
      return new Map(benchmarks.map((b) => [b.benchmarkSlug, b]));
    });

    // Get all unique benchmark slugs
    const allBenchmarkSlugs = new Set<string>();
    benchmarkSets.forEach((set) => set.forEach((_, key) => allBenchmarkSlugs.add(key)));

    const comparisonData = Array.from(allBenchmarkSlugs).map((benchSlug) => {
      const row: Record<string, unknown> = { benchmark: benchSlug };
      slugs.forEach((modelSlug, i) => {
        const result = benchmarkSets[i]?.get(benchSlug);
        row[modelSlug] = result ? result.score : null;
      });
      return row;
    });

    return NextResponse.json({ models, comparisonData });
  } catch (error) {
    console.error("Error comparing models:", error);
    return NextResponse.json(
      { error: "Failed to compare models" },
      { status: 500 }
    );
  }
}