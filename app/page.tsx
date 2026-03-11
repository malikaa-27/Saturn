"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/components/layout/TopBar";
import { BottomBar } from "@/components/controls/BottomBar";
import { TranscriptPanel } from "@/components/transcript/TranscriptPanel";
import { InsightPanel } from "@/components/insights/InsightPanel";
import { TopicTimeline } from "@/components/timeline/TopicTimeline";
import { MeetingSummaryModal } from "@/components/insights/MeetingSummaryModal";
import { useMeetingStore } from "@/store/meetingStore";
import { startDemoSimulation, stopDemoSimulation } from "@/lib/demoSimulator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FileText } from "lucide-react";

export default function Home() {
  const { status, startMeeting, setSummary, actionItems } = useMeetingStore();
  const [showSummary, setShowSummary] = useState(false);

  // Kick off demo simulation when meeting starts
  useEffect(() => {
    if (status === "listening") {
      startDemoSimulation();
    } else {
      stopDemoSimulation();
    }
    return () => stopDemoSimulation();
  }, [status]);

  // Auto-generate summary when meeting ends
  useEffect(() => {
    if (status === "ended") {
      setSummary({
        title: useMeetingStore.getState().title,
        duration: "18 min 24 sec",
        summary:
          "The team discussed Q2 strategy and reviewed AI tooling priorities. Key topics included voice AI market sizing, competitive landscape analysis, and strategic positioning. The group identified several research areas requiring follow-up and agreed on next steps with the product team.",
        topics: ["Q2 Strategy", "Voice AI Market", "Competitive Landscape", "AI Tooling"],
        decisions: [
          "Proceed with voice AI integration as a core Q2 initiative",
          "Conduct deeper competitive analysis before finalizing positioning",
          "Schedule follow-up with product team on market sizing data",
        ],
        actionItems: actionItems,
      });
      setShowSummary(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-zinc-950 text-white overflow-hidden relative">
        {/* Ambient background gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/[0.07] rounded-full blur-3xl" />
          <div className="absolute -top-20 right-20 w-80 h-80 bg-indigo-600/[0.05] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-40 w-72 h-72 bg-violet-800/[0.06] rounded-full blur-3xl" />
        </div>

        {/* Top bar */}
        <TopBar />

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden relative">
          {status === "idle" ? (
            <LandingView onStart={() => startMeeting()} />
          ) : (
            <>
              {/* Left: Transcript */}
              <div className="flex-1 flex flex-col min-w-0 border-r border-white/[0.06]">
                <TranscriptPanel />
              </div>

              {/* Right: Insights */}
              <div className="w-[380px] flex-shrink-0 flex flex-col">
                <InsightPanel />
              </div>
            </>
          )}
        </div>

        {/* Topic timeline (shown when meeting active) */}
        <AnimatePresence>
          {status !== "idle" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TopicTimeline />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom bar */}
        <BottomBar />

        {/* View summary button (after meeting ends) */}
        <AnimatePresence>
          {status === "ended" && !showSummary && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => setShowSummary(true)}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium shadow-lg shadow-violet-500/30 transition-all z-30"
            >
              <FileText className="w-4 h-4" />
              View Meeting Summary
            </motion.button>
          )}
        </AnimatePresence>

        {/* Summary modal */}
        <MeetingSummaryModal
          isOpen={showSummary}
          onClose={() => setShowSummary(false)}
        />
      </div>
    </TooltipProvider>
  );
}

function LandingView({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
      {/* Logo mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center shadow-2xl shadow-violet-500/30">
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
          </motion.div>
        </div>
        {/* Orbiting dot */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-3"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50" />
        </motion.div>
      </motion.div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="text-center space-y-3"
      >
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Jarvis for Meetings
        </h1>
        <p className="text-base text-white/50 max-w-md leading-relaxed">
          Your AI-powered meeting copilot. Transcribes in real time, detects questions,
          and researches the web so you never miss a beat.
        </p>
      </motion.div>

      {/* Feature pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="flex flex-wrap justify-center gap-2"
      >
        {[
          "Live transcription",
          "Question detection",
          "Web research",
          "AI insights",
          "Voice responses",
          "Action items",
        ].map((feature) => (
          <span
            key={feature}
            className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-white/50"
          >
            {feature}
          </span>
        ))}
      </motion.div>

      {/* Start button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        className="relative group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-base shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/40 transition-shadow overflow-hidden"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2.5 h-2.5 rounded-full bg-white/80"
        />
        Start Demo Meeting
        {/* Shimmer */}
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
        </motion.div>
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-white/20"
      >
        Demo mode — simulates a real meeting with live transcription and research
      </motion.p>
    </div>
  );
}
