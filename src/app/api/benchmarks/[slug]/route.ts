import { NextResponse } from "next/server";
import { getBenchmarkBySlug, getPerformancePoints } from "@/lib/data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const benchmark = getBenchmarkBySlug(slug);
    if (!benchmark) {
      return NextResponse.json(
        { error: "Benchmark not found" },
        { status: 404 }
      );
    }
    const timeline = getPerformancePoints(slug);
    return NextResponse.json({ benchmark, timeline });
  } catch (error) {
    console.error("Error fetching benchmark:", error);
    return NextResponse.json(
      { error: "Failed to fetch benchmark" },
      { status: 500 }
    );
  }
}
