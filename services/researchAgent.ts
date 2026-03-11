/**
 * Research agent — combines Exa search with OpenAI summarization.
 * Detects questions in transcript text and produces structured insights.
 */

import OpenAI from "openai";
import { searchExa } from "./exaSearchService";
import type { Insight, Source } from "@/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ResearchResult {
  topic: string;
  bullets: string[];
  sources: Source[];
  confidence: number;
}

/**
 * Detect whether a sentence is a question or research trigger.
 * Returns the cleaned query string, or null if not a research trigger.
 */
export async function detectQuestion(text: string): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 80,
    messages: [
      {
        role: "system",
        content:
          "You are a meeting assistant. Determine if the given text contains a question or topic that requires web research. " +
          "If yes, respond with ONLY a concise search query (under 10 words). " +
          "If no, respond with exactly: NO",
      },
      { role: "user", content: text },
    ],
  });

  const answer = completion.choices[0].message.content?.trim() ?? "NO";
  return answer === "NO" ? null : answer;
}

/**
 * Run the full research pipeline: search + summarize.
 */
export async function runResearch(query: string): Promise<ResearchResult> {
  // 1. Search Exa
  const { results } = await searchExa(query, 5);

  if (results.length === 0) {
    return {
      topic: query,
      bullets: ["No results found for this query."],
      sources: [],
      confidence: 0.1,
    };
  }

  // 2. Build context from search results
  const context = results
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.text ?? r.snippet}`)
    .join("\n\n");

  const sources: Source[] = results.map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.snippet,
  }));

  // 3. Summarize with OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 400,
    messages: [
      {
        role: "system",
        content:
          "You are a meeting research assistant. Given search results, produce a concise briefing. " +
          "Respond with JSON: { \"topic\": string, \"bullets\": string[3-5], \"confidence\": number(0-1) }. " +
          "Bullets should be crisp, factual, and useful in a meeting context.",
      },
      {
        role: "user",
        content: `Query: ${query}\n\nSearch results:\n${context}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");

  return {
    topic: parsed.topic ?? query,
    bullets: Array.isArray(parsed.bullets) ? parsed.bullets : ["No summary available."],
    sources,
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.75,
  };
}

/**
 * Build a full Insight object from a research result.
 */
export function buildInsight(
  result: ResearchResult,
  query: string,
  triggerSegmentId?: string
): Omit<Insight, "id"> {
  return {
    topic: result.topic,
    query,
    bullets: result.bullets,
    sources: result.sources,
    confidence: result.confidence,
    timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
    status: "ready",
    triggerSegmentId,
  };
}
