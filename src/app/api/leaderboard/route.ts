import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const capability = url.searchParams.get("capability") || "overall";
    const entries = getLeaderboard(capability);
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}