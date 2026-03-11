"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMeetingStore } from "@/store/meetingStore";
import { Insight } from "@/types";
import {
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

export function InsightPanel() {
  const { insights, activeInsightId, setActiveInsight } = useMeetingStore();

  return (
    <div className="flex flex-col h-full bg-black/20">
      {/* Panel header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
        <Sparkles className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-medium text-white/70">AI Insights</span>
        <div className="flex-1" />
        {insights.length > 0 && (
          <span className="text-xs bg-violet-500/15 border border-violet-500/25 text-violet-300 rounded-full px-2 py-0.5">
            {insights.length}
          </span>
        )}
      </div>

      {/* Insights list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {insights.length === 0 ? (
          <InsightEmptyState />
        ) : (
          <AnimatePresence initial={false}>
            {insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                isExpanded={activeInsightId === insight.id}
                onToggle={() =>
                  setActiveInsight(activeInsightId === insight.id ? null : insight.id)
                }
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function InsightEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-20">
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white/20" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 rounded-full border border-violet-500/20"
        />
      </div>
      <div>
        <p className="text-sm text-white/40 font-medium">No insights yet</p>
        <p className="text-xs text-white/20 mt-1">
          Questions in the transcript will trigger research
        </p>
      </div>
    </div>
  );
}

function InsightCard({
  insight,
  isExpanded,
  onToggle,
}: {
  insight: Insight;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const confidencePct = Math.round(insight.confidence * 100);
  const confidenceColor =
    insight.confidence > 0.85
      ? "text-emerald-400"
      : insight.confidence > 0.7
      ? "text-amber-400"
      : "text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        insight.status === "researching"
          ? "border-violet-500/30 bg-violet-500/[0.04]"
          : isExpanded
          ? "border-violet-500/25 bg-violet-500/[0.06]"
          : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
      }`}
    >
      {/* Research glow effect */}
      {insight.status === "researching" && (
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-0.5 bg-gradient-to-r from-violet-600 via-indigo-400 to-violet-600"
        />
      )}

      {/* Card header */}
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-start gap-3"
        disabled={insight.status === "researching"}
      >
        {/* Status icon */}
        <div className="mt-0.5 flex-shrink-0">
          {insight.status === "researching" ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-4 h-4 text-violet-400" />
            </motion.div>
          ) : insight.status === "ready" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Topic */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white/90 truncate">
              {insight.topic}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-white/30 font-mono">{insight.timestamp}</span>
            {insight.status === "ready" && (
              <>
                <span className="text-white/20">·</span>
                <span className={`text-[10px] font-medium ${confidenceColor}`}>
                  {confidencePct}% confidence
                </span>
                <span className="text-white/20">·</span>
                <span className="text-[10px] text-white/30">
                  {insight.sources.length} sources
                </span>
              </>
            )}
            {insight.status === "researching" && (
              <span className="text-[10px] text-violet-400">Searching the web...</span>
            )}
          </div>
        </div>

        {insight.status === "ready" && (
          <div className="text-white/30 flex-shrink-0 mt-0.5">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        )}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && insight.status === "ready" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Divider */}
              <div className="h-px bg-white/[0.06]" />

              {/* Confidence bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider">Confidence</span>
                  <span className={`text-[10px] font-semibold ${confidenceColor}`}>
                    {confidencePct}%
                  </span>
                </div>
                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidencePct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    className={`h-full rounded-full ${
                      insight.confidence > 0.85
                        ? "bg-emerald-400"
                        : insight.confidence > 0.7
                        ? "bg-amber-400"
                        : "bg-red-400"
                    }`}
                  />
                </div>
              </div>

              {/* Bullet insights */}
              <div className="space-y-2">
                {insight.bullets.map((bullet, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.25 }}
                    className="flex gap-2.5"
                  >
                    <div className="w-1 h-1 rounded-full bg-violet-400 mt-2 flex-shrink-0" />
                    <p className="text-xs text-white/75 leading-relaxed">{bullet}</p>
                  </motion.div>
                ))}
              </div>

              {/* Sources */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-white/40 uppercase tracking-wider">Sources</span>
                {insight.sources.map((source, i) => (
                  <motion.a
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.10] transition-all group"
                  >
                    <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[8px] text-white/50 font-bold">{i + 1}</span>
                    </div>
                    <span className="text-xs text-white/60 group-hover:text-white/80 truncate flex-1 transition-colors">
                      {source.title}
                    </span>
                    <ExternalLink className="w-3 h-3 text-white/30 group-hover:text-white/50 flex-shrink-0 transition-colors" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
