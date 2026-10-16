import { NextResponse } from "next/server";
import { getModelBySlug, getModelBenchmarks } from "@/lib/data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const model = getModelBySlug(slug);
    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }
    const benchmarks = getModelBenchmarks(slug);
    return NextResponse.json({ model, benchmarks });
  } catch (error) {
    console.error("Error fetching model:", error);
    return NextResponse.json(
      { error: "Failed to fetch model" },
      { status: 500 }
    );
  }
}
