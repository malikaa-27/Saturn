/**
 * POST /api/summary
 * Generates a structured meeting summary using OpenAI.
 *
 * Body: { transcript: string, title?: string, duration?: string }
 * Returns: MeetingSummary object
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { transcript, title = "Meeting", duration = "unknown" } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "transcript is required" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content:
            "You are a professional meeting summarizer. Analyze the meeting transcript and produce a structured JSON summary. " +
            'Respond with: { "summary": string, "decisions": string[], "actionItems": { "text": string, "assignee"?: string }[], "topics": string[] }. ' +
            "Be concise and accurate. Action items should be specific and actionable.",
        },
        {
          role: "user",
          content: `Meeting: ${title}\nDuration: ${duration}\n\nTranscript:\n${transcript.slice(0, 8000)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");

    const now = new Date().toLocaleTimeString("en-US", { hour12: false });
    const actionItems = (parsed.actionItems ?? []).map(
      (item: { text: string; assignee?: string }, i: number) => ({
        id: `action-${Date.now()}-${i}`,
        text: item.text,
        assignee: item.assignee,
        detectedAt: now,
        status: "open" as const,
      })
    );

    return NextResponse.json({
      summary: {
        title,
        duration,
        summary: parsed.summary ?? "",
        decisions: parsed.decisions ?? [],
        actionItems,
        topics: parsed.topics ?? [],
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Summary generation failed";
    console.error("[/api/summary]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
