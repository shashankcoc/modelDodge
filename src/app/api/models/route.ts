import { NextResponse } from "next/server";
import { getModelsFromBenchmarks } from "@/lib/data";

export async function GET() {
  try {
    const models = getModelsFromBenchmarks();
    return NextResponse.json(models);
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}