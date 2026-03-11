/**
 * POST /api/transcribe
 * Transcribes an audio file using smallest.ai STT.
 *
 * Body: FormData with "audio" field (audio blob)
 * Returns: { segments, fullText }
 */

import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/services/transcriptionService";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio");

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json({ error: "audio file is required" }, { status: 400 });
    }

    const mimeType = audioFile.type || "audio/wav";
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await transcribeAudio(buffer, mimeType);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed";
    console.error("[/api/transcribe]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Allow large audio uploads
export const config = {
  api: { bodyParser: false },
};
