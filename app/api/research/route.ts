/**
 * POST /api/research
 * Runs a research job: searches Exa and summarizes with OpenAI.
 *
 * Body: { query: string, segmentId?: string }
 * Returns: Insight object
 */

import { NextRequest, NextResponse } from "next/server";
import { runResearch, buildInsight } from "@/services/researchAgent";

export async function POST(req: NextRequest) {
  try {
    const { query, segmentId } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    const result = await runResearch(query.trim());
    const insight = buildInsight(result, query, segmentId);

    return NextResponse.json({
      insight: {
        ...insight,
        id: `insight-${Date.now()}`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Research failed";
    console.error("[/api/research]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
