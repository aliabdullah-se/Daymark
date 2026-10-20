'use client';

import React from 'react';
import { Volume2, VolumeX, Play, Pause, Square, Radio, X, Sparkles, Gauge } from 'lucide-react';

interface StickyAudioPlayerProps {
  isOpen: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  currentStoryTitle?: string;
  sourceName?: string;
  playbackRate?: number;
  onChangeRate?: (rate: number) => void;
}

export default function StickyAudioPlayer({
  isOpen,
  isPlaying,
  onTogglePlay,
  onStop,
  currentStoryTitle = 'Executive Audio Briefing',
  sourceName = 'Gemini Broadsheet Synthesis',
  playbackRate = 1.0,
  onChangeRate,
}: StickyAudioPlayerProps) {
  if (!isOpen) return null;

  const cycleSpeed = () => {
    if (!onChangeRate) return;
    if (playbackRate === 1.0) onChangeRate(1.25);
    else if (playbackRate === 1.25) onChangeRate(1.5);
    else onChangeRate(1.0);
  };

  return (
    <aside
      aria-label="Audio briefing player"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-[#0D1B2C]/95 backdrop-blur-md border border-[#20344B] rounded-2xl shadow-2xl p-3 sm:p-4 text-[#F1F5FA] animate-in slide-in-from-bottom-4 duration-300 no-print"
      id="daymark-sticky-audio-player"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Animated Soundwave & Status */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#526BFF]/20 to-[#4DB8E8]/20 border border-[#526BFF]/40 shrink-0">
            <Radio className={`w-5 h-5 text-[#526BFF] ${isPlaying ? 'animate-pulse' : 'opacity-60'}`} />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#4DB8E8] animate-ping" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2 text-[10px] font-sans uppercase tracking-widest text-[#4DB8E8] font-bold">
              <span>Daymark Audio Wire</span>
              <span className="text-[#20344B]">•</span>
              <span className="text-[#A4B3C7] font-normal normal-case">{sourceName}</span>
              {isPlaying ? (
                <span className="text-emerald-400 font-semibold">• Live</span>
              ) : (
                <span className="text-amber-400 font-semibold">• Paused</span>
              )}
            </div>
            <div className="font-serif text-xs sm:text-sm font-medium text-[#F1F5FA] truncate max-w-xs sm:max-w-md">
              {currentStoryTitle}
            </div>
          </div>
        </div>

        {/* Audio Equalizer Bars Animation */}
        <div className="hidden sm:flex items-center space-x-1 px-2 shrink-0">
          <span
            className={`w-1 bg-[#526BFF] rounded-full h-4 ${
              isPlaying ? 'animate-bounce [animation-delay:0ms]' : 'opacity-40'
            }`}
          />
          <span
            className={`w-1 bg-[#4DB8E8] rounded-full h-6 ${
              isPlaying ? 'animate-bounce [animation-delay:150ms]' : 'opacity-40'
            }`}
          />
          <span
            className={`w-1 bg-[#526BFF] rounded-full h-3 ${
              isPlaying ? 'animate-bounce [animation-delay:300ms]' : 'opacity-40'
            }`}
          />
          <span
            className={`w-1 bg-[#4DB8E8] rounded-full h-5 ${
              isPlaying ? 'animate-bounce [animation-delay:450ms]' : 'opacity-40'
            }`}
          />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Speed Toggle */}
          {onChangeRate && (
            <button
              onClick={cycleSpeed}
              className="px-2 py-1 rounded-lg bg-[#12243A] hover:bg-[#20344B] text-[#A4B3C7] hover:text-[#F1F5FA] border border-[#20344B] text-[11px] font-mono font-semibold transition-colors cursor-pointer"
              title="Change audio playback speed"
            >
              {playbackRate}x
            </button>
          )}

          {/* Play / Pause Toggle */}
          <button
            onClick={onTogglePlay}
            className="p-2 rounded-xl bg-[#526BFF] hover:bg-[#3B54E6] text-white transition-all cursor-pointer shadow-md"
            title={isPlaying ? 'Pause briefing' : 'Resume briefing'}
            aria-label={isPlaying ? 'Pause audio briefing' : 'Resume audio briefing'}
            id="btn-player-play-pause"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Stop Button */}
          <button
            onClick={onStop}
            className="p-2 rounded-xl bg-[#12243A] hover:bg-[#20344B] text-[#A4B3C7] hover:text-[#F1F5FA] border border-[#20344B] transition-colors cursor-pointer"
            title="Stop audio briefing"
            aria-label="Stop audio briefing"
            id="btn-player-stop"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          {/* Dismiss Button */}
          <button
            onClick={onStop}
            className="p-1.5 text-[#A4B3C7] hover:text-[#F1F5FA] transition-colors cursor-pointer"
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
