/**
 * Transcription service — smallest.ai Speech-to-Text integration.
 * Sends audio chunks to the Waves STT API and returns transcript segments.
 */

export interface TranscriptionSegment {
  text: string;
  speaker?: string;
  startTime: number;
  endTime: number;
  confidence: number;
  words?: Array<{ text: string; start: number; end: number; confidence: number }>;
}

export interface TranscriptionResponse {
  segments: TranscriptionSegment[];
  fullText: string;
  language?: string;
}

/**
 * Transcribe an audio buffer using smallest.ai Waves STT.
 * Accepts WAV/WebM/Ogg audio data.
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType = "audio/wav"
): Promise<TranscriptionResponse> {
  const apiKey = process.env.SMALLEST_API_KEY;
  if (!apiKey) throw new Error("SMALLEST_API_KEY is not set");

  const formData = new FormData();
  const blob = new Blob([audioBuffer.buffer as ArrayBuffer], { type: mimeType });
  formData.append("file", blob, "audio.wav");
  formData.append("language", "en");
  formData.append("diarize", "true"); // speaker diarization

  const response = await fetch("https://waves-api.smallest.ai/api/v1/asr/transcribe", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`smallest.ai STT error ${response.status}: ${error}`);
  }

  const data = await response.json();

  // Normalize response to our internal format
  const segments: TranscriptionSegment[] = (data.segments ?? []).map(
    (seg: {
      text: string;
      speaker?: string;
      start: number;
      end: number;
      confidence?: number;
      words?: Array<{ word: string; start: number; end: number; probability: number }>;
    }) => ({
      text: seg.text.trim(),
      speaker: seg.speaker,
      startTime: seg.start,
      endTime: seg.end,
      confidence: seg.confidence ?? 0.9,
      words: seg.words?.map((w) => ({
        text: w.word,
        start: w.start,
        end: w.end,
        confidence: w.probability,
      })),
    })
  );

  return {
    segments,
    fullText: data.text ?? segments.map((s) => s.text).join(" "),
    language: data.language,
  };
}
