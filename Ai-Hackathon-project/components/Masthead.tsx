'use client';

import React from 'react';
import { SlidersHorizontal, Printer, Archive, RotateCw, Volume2, VolumeX, Sparkles, Tag, ArrowUpRight } from 'lucide-react';
import { UserPreferences, NewsTopic, AVAILABLE_TOPICS } from '@/types/news';

interface MastheadProps {
  preferences: UserPreferences;
  onOpenPreferences: () => void;
  onOpenEditions: () => void;
  onPrint: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  selectedTopicFilter: NewsTopic | 'all';
  onSelectTopicFilter: (topic: NewsTopic | 'all') => void;
  onSaveCurrentEdition: () => void;
  savedEditionsCount: number;
  isPlayingAudio?: boolean;
  onToggleAudio?: () => void;
}

export default function Masthead({
  preferences,
  onOpenPreferences,
  onOpenEditions,
  onPrint,
  onRefresh,
  isRefreshing,
  selectedTopicFilter,
  onSelectTopicFilter,
  onSaveCurrentEdition,
  savedEditionsCount,
  isPlayingAudio = false,
  onToggleAudio,
}: MastheadProps) {
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const monthYearFormatted = today.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  }).toUpperCase();

  const titleText = preferences.newspaperTitle || 'DAYMARK';

  return (
    <header className="w-full bg-ivory-100 border-b border-ivory-300">
      {/* 1. TOP UTILITY STRIP */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between text-[11px] font-sans tracking-wider text-charcoal-600 border-b border-ivory-200">
        {/* Left: Volume & Issue Info */}
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-charcoal-900 tracking-widest">
            VOL. XII / NO. 42
          </span>
          <span className="text-ivory-400">•</span>
          <span className="uppercase text-charcoal-600">
            {monthYearFormatted}
          </span>
          <span className="hidden sm:inline text-ivory-400">•</span>
          <span className="hidden sm:inline text-charcoal-500 font-serif italic lowercase">
            {dateFormatted}
          </span>
        </div>

        {/* Right: Personalized Greeting & Secondary Controls */}
        <div className="flex items-center space-x-4 mt-1 sm:mt-0">
          <div className="flex items-center space-x-1.5 text-charcoal-700">
            <span className="w-1.5 h-1.5 rounded-full bg-forest-500 animate-pulse" />
            <span className="text-charcoal-500 font-sans">Curated for</span>
            <button
              onClick={onOpenPreferences}
              className="font-serif italic font-semibold text-charcoal-900 hover:text-forest-600 transition-colors underline decoration-ivory-300 underline-offset-2"
              title="Click to personalize name and topics"
            >
              {preferences.readerName || 'Reader'}
            </button>
          </div>

          <div className="flex items-center space-x-2 no-print">
            {onToggleAudio && (
              <button
                id="btn-toggle-audio"
                onClick={onToggleAudio}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-sans transition-all ${
                  isPlayingAudio
                    ? 'bg-forest-600 text-white font-medium shadow-xs'
                    : 'bg-ivory-200/80 hover:bg-ivory-200 text-charcoal-800'
                }`}
                title={isPlayingAudio ? 'Pause Audio Brief' : 'Play Audio Brief (Web Speech)'}
              >
                {isPlayingAudio ? (
                  <VolumeX className="w-3 h-3 text-white" />
                ) : (
                  <Volume2 className="w-3 h-3 text-forest-600" />
                )}
                <span>{isPlayingAudio ? 'Listening...' : 'Audio Brief'}</span>
              </button>
            )}

            <button
              id="btn-print-newspaper"
              onClick={onPrint}
              className="flex items-center space-x-1 px-3 py-1 bg-charcoal-900 hover:bg-charcoal-800 text-ivory-50 rounded text-[11px] font-medium transition-all shadow-xs"
              title="Save as PDF or Print"
            >
              <Printer className="w-3 h-3 text-ivory-300" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. GRAND MASTHEAD */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 text-center relative">
        <div className="inline-block cursor-pointer group" onClick={onOpenPreferences} title="Click to customize title">
          <h1
            id="newspaper-main-title"
            className="font-headline text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-charcoal-900 tracking-[-0.03em] leading-none transition-colors group-hover:text-forest-700"
          >
            {titleText}
          </h1>
          <p className="font-serif italic text-sm sm:text-base md:text-lg text-charcoal-600 mt-2 tracking-normal">
            Your world, clearly delivered.
          </p>
        </div>
      </div>

      {/* 3. SECTION NAVIGATION BAR (Editorial Hairlines) */}
      <div className="border-t border-b border-charcoal-900/10 bg-ivory-50/50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between py-2 gap-2">
            {/* Section Links */}
            <nav className="flex items-center flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs font-sans tracking-wider uppercase font-medium">
              <button
                id="filter-all-topics"
                onClick={() => onSelectTopicFilter('all')}
                className={`py-1 transition-all relative ${
                  selectedTopicFilter === 'all'
                    ? 'text-charcoal-900 font-bold border-b-2 border-forest-600 pb-0.5'
                    : 'text-charcoal-500 hover:text-charcoal-900'
                }`}
              >
                Cover & Front Page
              </button>
              {AVAILABLE_TOPICS.map((t) => {
                const isSelected = selectedTopicFilter === t.id;
                const isUserTopic = preferences.selectedTopics.includes(t.id);
                return (
                  <button
                    key={t.id}
                    id={`filter-${t.id}`}
                    onClick={() => onSelectTopicFilter(t.id)}
                    className={`py-1 transition-all relative flex items-center space-x-1 ${
                      isSelected
                        ? 'text-charcoal-900 font-bold border-b-2 border-forest-600 pb-0.5'
                        : isUserTopic
                        ? 'text-charcoal-800 hover:text-charcoal-900 font-medium'
                        : 'text-charcoal-400 hover:text-charcoal-700'
                    }`}
                  >
                    <span>{t.label.split(' ')[0]}</span>
                    {isUserTopic && (
                      <span className="w-1 h-1 rounded-full bg-forest-600" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Action Tools */}
            <div className="flex items-center space-x-3 text-xs font-sans text-charcoal-600">
              <button
                id="btn-refresh-wire"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-1 hover:text-charcoal-900 transition-colors disabled:opacity-50"
                title="Sync live wire"
              >
                <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-forest-600' : ''}`} />
                <span>{isRefreshing ? 'Syncing...' : 'Sync Wire'}</span>
              </button>

              <span className="text-ivory-400">|</span>

              <button
                id="btn-save-today-edition"
                onClick={onSaveCurrentEdition}
                className="hover:text-charcoal-900 transition-colors"
                title="Archive today's edition snapshot"
              >
                Save Issue
              </button>

              <span className="text-ivory-400">|</span>

              <button
                id="btn-open-editions-archive"
                onClick={onOpenEditions}
                className="hover:text-charcoal-900 transition-colors"
                title="View past editions"
              >
                Archive ({savedEditionsCount})
              </button>

              <span className="text-ivory-400">|</span>

              <button
                id="btn-open-preferences"
                onClick={onOpenPreferences}
                className="flex items-center space-x-1 hover:text-charcoal-900 transition-colors text-forest-700 font-medium"
                title="Edit reading preferences"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Curate</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE PERSONALIZED LENSES STRIP */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between text-xs font-sans text-charcoal-600 border-b border-ivory-200/80 no-print">
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider flex items-center">
            <Sparkles className="w-3 h-3 text-forest-600 mr-1" />
            Curated Lenses:
          </span>
          {preferences.selectedTopics.map((topicId) => {
            const meta = AVAILABLE_TOPICS.find((t) => t.id === topicId);
            return (
              <span
                key={topicId}
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-forest-50 text-forest-700 text-[11px] font-medium border border-forest-100"
              >
                {meta ? meta.label : topicId}
              </span>
            );
          })}
          {preferences.customInterests.slice(0, 3).map((interest) => (
            <span
              key={interest}
              className="inline-flex items-center px-2 py-0.5 rounded-full bg-ivory-200 text-charcoal-800 text-[11px] font-serif italic border border-ivory-300"
            >
              #{interest}
            </span>
          ))}
          {preferences.customInterests.length > 3 && (
            <span className="text-[10px] text-charcoal-400 font-sans">
              +{preferences.customInterests.length - 3} more
            </span>
          )}
        </div>

        <button
          onClick={onOpenPreferences}
          className="text-[11px] text-charcoal-500 hover:text-forest-700 font-sans font-medium transition-colors hidden sm:inline-flex items-center space-x-0.5"
        >
          <span>Adjust Lenses</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </header>
  );
}
