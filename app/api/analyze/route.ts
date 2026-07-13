import { NextRequest, NextResponse } from "next/server";
import type { AnalyzeResponse } from "@/types/analyze";

export async function POST(request: NextRequest) {
  let body: { query?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400 });
  }

  const query = body.query?.trim();

  if (!query) {
    return NextResponse.json(
      { detail: "query is required and must not be empty" },
      { status: 422 },
    );
  }

  if (query.length > 2000) {
    return NextResponse.json(
      { detail: "query must be at most 2000 characters" },
      { status: 422 },
    );
  }

  const response: AnalyzeResponse = {
    status: "success",
    summary: `Analysis complete for: ${query}`,
    actions: [
      "Review patient intake notes",
      "Schedule follow-up within 48 hours",
      "Flag for clinical review",
    ],
    confidence_score: 0.92,
  };

  return NextResponse.json(response);
}
