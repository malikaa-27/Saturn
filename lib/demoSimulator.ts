/**
 * Demo simulator — plays back mock meeting data with realistic timing.
 * In production, replace with real WebSocket + smallest.ai STT integration.
 */
import {
  MOCK_TRANSCRIPT,
  MOCK_INSIGHTS,
  MOCK_ACTION_ITEMS,
  MOCK_TOPICS,
} from "./mockData";
import { useMeetingStore } from "@/store/meetingStore";

let timeouts: ReturnType<typeof setTimeout>[] = [];

export function startDemoSimulation() {
  const store = useMeetingStore.getState();
  clearAllTimeouts();

  // Add transcript segments with typing delay
  MOCK_TRANSCRIPT.forEach((segment, i) => {
    const delay = i * 3500 + 800;

    const t = setTimeout(() => {
      store.addTranscriptSegment({ ...segment, text: "" });

      // Simulate word-by-word typing
      const words = segment.text.split(" ");
      words.forEach((word, wi) => {
        const wt = setTimeout(() => {
          const currentState = useMeetingStore.getState();
          const existing = currentState.transcript.find((s) => s.id === segment.id);
          if (existing) {
            useMeetingStore.getState().updateTranscriptSegment(segment.id, {
              text: words.slice(0, wi + 1).join(" "),
            });
          }
        }, wi * 80);
        timeouts.push(wt);
      });

      // If it's a question, start research after typing completes
      if (segment.isQuestion) {
        const researchDelay = words.length * 80 + 500;
        const rt = setTimeout(() => {
          store.incrementResearch();
          store.updateCreditBalance(-2);
        }, researchDelay);
        timeouts.push(rt);
      }
    }, delay);

    timeouts.push(t);
  });

  // Add insights with delay (after research)
  MOCK_INSIGHTS.forEach((insight, i) => {
    // Start as "researching"
    const startDelay = i * 7000 + 6000;
    const st = setTimeout(() => {
      store.addInsight({ ...insight, status: "researching" });
    }, startDelay);
    timeouts.push(st);

    // Complete research after 3s
    const endDelay = startDelay + 3000;
    const et = setTimeout(() => {
      store.updateInsight(insight.id, { status: "ready" });
      store.decrementResearch();
      if (i === 0) store.setActiveInsight(insight.id);
    }, endDelay);
    timeouts.push(et);
  });

  // Add action items
  MOCK_ACTION_ITEMS.forEach((item, i) => {
    const t = setTimeout(() => {
      store.addActionItem(item);
    }, 14000 + i * 2000);
    timeouts.push(t);
  });

  // Add topics
  MOCK_TOPICS.forEach((topic, i) => {
    const t = setTimeout(() => {
      store.addTopic(topic);
    }, i * 4000 + 1000);
    timeouts.push(t);
  });
}

export function stopDemoSimulation() {
  clearAllTimeouts();
}

function clearAllTimeouts() {
  timeouts.forEach(clearTimeout);
  timeouts = [];
}
