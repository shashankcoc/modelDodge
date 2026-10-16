import { NextResponse } from "next/server";
import { syncLiveOpenRouterModels } from "@/lib/data";

export async function GET() {
  try {
    const result = await syncLiveOpenRouterModels();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync models", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
