import { NextResponse } from "next/server";
import { getBenchmarks } from "@/lib/data";

export async function GET() {
  try {
    const benchmarks = getBenchmarks();
    return NextResponse.json(benchmarks);
  } catch (error) {
    console.error("Error fetching benchmarks:", error);
    return NextResponse.json(
      { error: "Failed to fetch benchmarks" },
      { status: 500 }
    );
  }
}