"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMeetingStore } from "@/store/meetingStore";
import { X, CheckSquare, Lightbulb, List, Download } from "lucide-react";
import { MeetingSummary } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function MeetingSummaryModal({ isOpen, onClose }: Props) {
  const { summary, actionItems } = useMeetingStore();

  if (!summary) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-base font-semibold text-white">{summary.title}</h2>
                  <p className="text-xs text-white/40 mt-0.5">
                    Duration: {summary.duration}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/70 text-xs transition-all">
                    <Download className="w-3.5 h-3.5" />
                    Export
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white/60 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* Summary */}
                <Section icon={<List className="w-4 h-4 text-violet-400" />} title="Summary">
                  <p className="text-sm text-white/70 leading-relaxed">{summary.summary}</p>
                </Section>

                {/* Topics */}
                <Section icon={<Lightbulb className="w-4 h-4 text-amber-400" />} title="Topics Discussed">
                  <div className="flex flex-wrap gap-2">
                    {summary.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white/60"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </Section>

                {/* Key decisions */}
                <Section icon={<CheckSquare className="w-4 h-4 text-emerald-400" />} title="Key Decisions">
                  <ul className="space-y-2">
                    {summary.decisions.map((decision, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex gap-2.5"
                      >
                        <div className="w-1 h-1 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                        <span className="text-sm text-white/70">{decision}</span>
                      </motion.li>
                    ))}
                  </ul>
                </Section>

                {/* Action items */}
                <Section icon={<CheckSquare className="w-4 h-4 text-blue-400" />} title="Action Items">
                  <div className="space-y-2">
                    {actionItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]"
                      >
                        <div className="w-4 h-4 rounded border border-white/20 flex-shrink-0" />
                        <span className="text-sm text-white/70 flex-1">{item.text}</span>
                        {item.assignee && (
                          <span className="text-xs text-white/40 bg-white/[0.04] px-2 py-0.5 rounded-full">
                            {item.assignee}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-white/80">{title}</h3>
      </div>
      {children}
    </div>
  );
}
