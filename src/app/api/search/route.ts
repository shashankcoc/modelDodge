import { NextResponse } from "next/server";
import { searchAll } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";
    const results = searchAll(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
