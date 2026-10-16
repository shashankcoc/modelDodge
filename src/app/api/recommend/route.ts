import { NextResponse } from "next/server";
import { getModelsFromBenchmarks, getModelBenchmarks } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      useCase = "General AI workload",
      budget = 50,
      priority = "balanced",
      latencyPreference = "balanced",
      inputTokens = 5000000,
      outputTokens = 2000000,
    } = body;

    const useCaseLower = useCase.toLowerCase();
    const models = getModelsFromBenchmarks();

    // Determine which capability the user cares about
    const capabilityKeywords: Record<string, string[]> = {
      coding: ["coding", "code", "programming", "developer", "software", "engineer", "repo", "refactor", "bug", "python", "typescript"],
      reasoning: ["reasoning", "think", "logic", "analysis", "research", "complex", "deduction", "puzzle", "cot"],
      agentic: ["agent", "agentic", "tool", "function", "autonomous", "workflow", "calling", "execution", "action"],
      math: ["math", "calculation", "numerical", "statistics", "quantitative", "aime", "algebra"],
      vision: ["vision", "image", "visual", "picture", "photo", "ocr", "chart", "diagram", "multimodal"],
      long_context: ["long context", "document", "book", "large", "100k", "million", "rag", "retrieval", "haystack"],
    };

    const detectedCapabilities: string[] = [];
    for (const [cap, keywords] of Object.entries(capabilityKeywords)) {
      if (keywords.some((kw) => useCaseLower.includes(kw))) {
        detectedCapabilities.push(cap);
      }
    }

    // If none detected, default to general reasoning and coding
    if (detectedCapabilities.length === 0) {
      detectedCapabilities.push("reasoning", "coding");
    }

    const inputMtok = inputTokens / 1_000_000;
    const outputMtok = outputTokens / 1_000_000;

    const scoredModels = models
      .filter((m) => m.overall_score != null)
      .map((m) => {
        let qualityScore = m.overall_score ?? 0;

        // Boost score for detected capabilities
        for (const cap of detectedCapabilities) {
          const scoreKey = `${cap}_score` as keyof typeof m;
          const capScore = m[scoreKey] as number | null;
          if (capScore != null) {
            qualityScore = qualityScore * 0.4 + capScore * 0.6;
          }
        }

        // Calculate estimated monthly cost
        const inputPrice = m.pricing?.input_per_mtok ?? 1.5;
        const outputPrice = m.pricing?.output_per_mtok ?? 4.0;
        const estimatedMonthlyCost =
          Math.round((inputMtok * inputPrice + outputMtok * outputPrice) * 100) / 100;

        // Cost fitness (higher score = better fit within budget)
        let costFitness = 50;
        if (budget > 0) {
          if (estimatedMonthlyCost <= budget) {
            // Reward staying under budget, with sweet spot
            costFitness = 90 - (estimatedMonthlyCost / budget) * 20;
          } else {
            // Penalize exceeding budget
            const overRatio = estimatedMonthlyCost / budget;
            costFitness = Math.max(10, 80 - overRatio * 30);
          }
        } else {
          // Free budget
          costFitness = inputPrice === 0 ? 100 : 20;
        }

        // Weights based on priority
        let qualityWeight = 0.5;
        let costWeight = 0.35;
        let latencyWeight = 0.15;

        if (priority === "quality") {
          qualityWeight = 0.7;
          costWeight = 0.15;
          latencyWeight = 0.15;
        } else if (priority === "value") {
          qualityWeight = 0.35;
          costWeight = 0.5;
          latencyWeight = 0.15;
        } else if (priority === "speed") {
          qualityWeight = 0.4;
          costWeight = 0.2;
          latencyWeight = 0.4;
        }

        const latencyScore =
          m.slug.includes("flash") || m.slug.includes("mini") || m.slug.includes("small")
            ? 90
            : 60;

        const fitness =
          qualityScore * qualityWeight +
          costFitness * costWeight +
          latencyScore * latencyWeight;

        // Formulate why bullets
        const why: string[] = [];
        if (qualityScore >= 85) {
          why.push(`Frontier-tier capability score of ${qualityScore.toFixed(1)}`);
        }
        for (const cap of detectedCapabilities) {
          const scoreKey = `${cap}_score` as keyof typeof m;
          const capScore = m[scoreKey] as number | null;
          if (capScore != null && capScore >= 70) {
            why.push(`High ${cap.replace("_", " ")} benchmark score: ${capScore.toFixed(1)}%`);
          }
        }
        if (estimatedMonthlyCost <= budget) {
          why.push(`Fits comfortably within your $${budget}/mo budget ($${estimatedMonthlyCost.toFixed(2)}/mo estimated)`);
        } else {
          why.push(`Estimated at $${estimatedMonthlyCost.toFixed(2)}/mo based on your token volume`);
        }
        if (m.context_length && m.context_length >= 128000) {
          why.push(`Generous context window of ${Math.round(m.context_length / 1000)}k tokens`);
        }

        const benchmarks = getModelBenchmarks(m.slug);

        return {
          model: m.name,
          slug: m.slug,
          provider: m.provider,
          fitness: Math.round(fitness * 10) / 10,
          qualityScore: Math.round(qualityScore * 10) / 10,
          score: Math.round(qualityScore * 10) / 10,
          estimatedMonthlyCost,
          estimatedCost: estimatedMonthlyCost,
          rationale: why.slice(0, 3).join(". ") + ".",
          why: why.length > 0 ? why : [`Strong general model with score ${qualityScore.toFixed(1)}`],
          best_for: detectedCapabilities.join(", "),
          scores: {
            quality: Math.round(qualityScore * 10) / 10,
            cost: Math.round(costFitness * 10) / 10,
            latency: latencyScore,
          },
          benchmarkCount: benchmarks.length,
          context_length: m.context_length,
        };
      });

    scoredModels.sort((a, b) => b.fitness - a.fitness);

    const top8 = scoredModels.slice(0, 8);
    const bestOverall = top8[0] || null;

    // Pick top value (best balance of cost efficiency & quality)
    const bestValue =
      [...scoredModels]
        .sort((a, b) => b.scores.cost * 0.6 + b.qualityScore * 0.4 - (a.scores.cost * 0.6 + a.qualityScore * 0.4))[0] ||
      bestOverall;

    // Pick top quality (highest benchmark score regardless of cost)
    const bestQuality =
      [...scoredModels].sort((a, b) => b.qualityScore - a.qualityScore)[0] || bestOverall;

    // Alternatives: top results excluding the primary match
    const alternatives = top8.slice(1, 5);

    return NextResponse.json({
      recommendation: bestOverall,
      bestOverall,
      bestValue,
      bestQuality,
      alternatives,
      recommendations: top8,
      detectedCapabilities,
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const useCase = url.searchParams.get("useCase") || "coding agent";
  const budget = parseFloat(url.searchParams.get("budget") || "50");
  const priority = url.searchParams.get("priority") || "balanced";

  // Delegate to POST logic
  return POST(
    new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ useCase, budget, priority }),
    })
  );
}