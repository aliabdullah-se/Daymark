'use client';

import React from 'react';
import { Volume2, VolumeX, Play, Pause, Square, Radio, X, Sparkles } from 'lucide-react';

interface StickyAudioPlayerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  currentStoryTitle?: string;
  sourceName?: string;
}

export default function StickyAudioPlayer({
  isPlaying,
  onTogglePlay,
  onStop,
  currentStoryTitle = 'Morning Audio Briefing',
  sourceName = 'Daymark Editorial Desk',
}: StickyAudioPlayerProps) {
  if (!isPlaying) return null;

  return (
    <aside
      aria-label="Audio briefing player"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl bg-[#0D1B2C]/95 backdrop-blur-md border border-[#20344B] rounded-xl shadow-2xl p-3 sm:p-4 text-[#F1F5FA] animate-in slide-in-from-bottom-4 duration-300 no-print"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Animated Soundwave & Status */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-[#526BFF]/15 border border-[#526BFF]/30 shrink-0">
            <Radio className="w-5 h-5 text-[#526BFF] animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#4DB8E8] animate-ping" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2 text-[10px] font-sans uppercase tracking-widest text-[#4DB8E8] font-bold">
              <span>Daymark Audio Wire</span>
              <span className="text-[#20344B]">•</span>
              <span className="text-[#A4B3C7] font-normal normal-case">{sourceName}</span>
            </div>
            <div className="font-serif text-xs sm:text-sm font-medium text-[#F1F5FA] truncate max-w-xs sm:max-w-md">
              {currentStoryTitle}
            </div>
          </div>
        </div>

        {/* Audio Equalizer Bars Animation */}
        <div className="hidden sm:flex items-center space-x-1 px-2 shrink-0">
          <span className="w-1 bg-[#526BFF] rounded-full animate-bounce [animation-delay:0ms] h-4" />
          <span className="w-1 bg-[#4DB8E8] rounded-full animate-bounce [animation-delay:150ms] h-6" />
          <span className="w-1 bg-[#526BFF] rounded-full animate-bounce [animation-delay:300ms] h-3" />
          <span className="w-1 bg-[#4DB8E8] rounded-full animate-bounce [animation-delay:450ms] h-5" />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onTogglePlay}
            className="p-2 rounded-lg bg-[#526BFF] hover:bg-[#3B54E6] text-white transition-all cursor-pointer shadow-md"
            title={isPlaying ? 'Pause' : 'Resume'}
            aria-label={isPlaying ? 'Pause audio briefing' : 'Resume audio briefing'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={onStop}
            className="p-2 rounded-lg bg-[#12243A] hover:bg-[#20344B] text-[#A4B3C7] hover:text-[#F1F5FA] border border-[#20344B] transition-colors cursor-pointer"
            title="Stop audio briefing"
            aria-label="Stop audio briefing"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onStop}
            className="p-1 text-[#A4B3C7] hover:text-[#F1F5FA] transition-colors cursor-pointer ml-1"
            title="Dismiss player"
            aria-label="Dismiss audio player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
