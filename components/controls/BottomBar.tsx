"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  FileText,
  Gauge,
} from "lucide-react";
import { useMeetingStore } from "@/store/meetingStore";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AudioWaveform } from "@/components/controls/AudioWaveform";

export function BottomBar() {
  const {
    status,
    isVoiceEnabled,
    isSpeaking,
    voiceSpeed,
    startMeeting,
    pauseMeeting,
    endMeeting,
    setVoiceEnabled,
    setVoiceSpeed,
    setIsSpeaking,
  } = useMeetingStore();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const isActive = status === "listening";
  const isPaused = status === "paused";
  const isEnded = status === "ended";

  const handleMainAction = () => {
    if (status === "idle" || status === "ended") startMeeting();
    else if (isActive) pauseMeeting();
    else if (isPaused) startMeeting();
  };

  return (
    <div className="h-16 border-t border-white/[0.06] bg-black/40 backdrop-blur-xl flex items-center px-5 gap-3 relative z-20">
      {/* Waveform visualization */}
      <div className="w-32 h-8 flex items-center">
        <AudioWaveform active={isActive} />
      </div>

      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Main controls */}
      <div className="flex items-center gap-2">
        {/* Primary start/pause button */}
        <Tooltip>
          <TooltipTrigger
            render={
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMainAction}
                disabled={isEnded}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? "bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30"
                    : "bg-violet-600 border border-violet-500/50 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20"
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    {status === "idle" ? "Start Meeting" : "Resume"}
                  </>
                )}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-amber-500/10"
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>
            }
          />
          <TooltipContent>
            {isActive ? "Pause transcription" : "Start transcription"}
          </TooltipContent>
        </Tooltip>

        {/* Stop button */}
        <AnimatePresence>
          {(isActive || isPaused) && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
            >
              <Tooltip>
                <TooltipTrigger
                  render={
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={endMeeting}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <Square className="w-3.5 h-3.5" />
                      End
                    </motion.button>
                  }
                />
                <TooltipContent>End meeting & generate summary</TooltipContent>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-px h-6 bg-white/10 mx-1" />

      {/* Voice controls */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                onClick={() => setVoiceEnabled(!isVoiceEnabled)}
                className={`p-2 rounded-lg transition-all ${
                  isVoiceEnabled
                    ? "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400"
                    : "bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60"
                }`}
              >
                {isVoiceEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>
            }
          />
          <TooltipContent>
            {isVoiceEnabled ? "Disable voice responses" : "Enable voice responses"}
          </TooltipContent>
        </Tooltip>

        {/* Stop speaking */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setIsSpeaking(false)}
              className="px-3 py-1.5 text-xs rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-all"
            >
              Stop Speaking
            </motion.button>
          )}
        </AnimatePresence>

        {/* Speed control */}
        <div className="relative">
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="flex items-center gap-1.5 p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60 transition-all text-xs"
                >
                  <Gauge className="w-4 h-4" />
                  <span className="font-mono">{voiceSpeed}x</span>
                </button>
              }
            />
            <TooltipContent>Voice speed</TooltipContent>
          </Tooltip>

          <AnimatePresence>
            {showSpeedMenu && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute bottom-full mb-2 left-0 bg-zinc-900 border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 min-w-[80px]"
              >
                {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      setVoiceSpeed(speed);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      voiceSpeed === speed
                        ? "bg-violet-500/20 text-violet-300"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <button className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60 transition-all">
                <FileText className="w-4 h-4" />
              </button>
            }
          />
          <TooltipContent>Export transcript</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <button className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60 transition-all">
                <Settings className="w-4 h-4" />
              </button>
            }
          />
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
