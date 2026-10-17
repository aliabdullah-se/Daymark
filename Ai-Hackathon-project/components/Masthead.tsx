'use client';

import React from 'react';
import { SlidersHorizontal, Printer, Archive, RotateCw, Sparkles, Sun, Newspaper } from 'lucide-react';
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
}: MastheadProps) {
  // Format current date in classic broadsheet style
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="w-full pt-4 pb-2 border-b border-paper-300">
      {/* Top Meta Line: Weather & Issue Tagline */}
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between text-xs text-ink-600 font-sans uppercase tracking-wider pb-2 border-b border-paper-200">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-amber-800 font-medium">
            <Sun className="w-3.5 h-3.5 mr-1" />
            68°F • Crisp Morning
          </span>
          <span className="text-paper-300">|</span>
          <span>Vol. CXXVI — No. 42</span>
          <span className="text-paper-300">|</span>
          <span className="text-editorial-navy font-semibold">Late City Edition</span>
        </div>

        <div className="flex items-center space-x-2 mt-1 sm:mt-0">
          <span className="text-ink-500">Edition Prepared For:</span>
          <span className="font-semibold text-ink-900 border-b border-dotted border-ink-600">
            {preferences.readerName || 'Distinguished Reader'}
          </span>
          <span className="bg-editorial-crimson text-white px-1.5 py-0.5 rounded text-[10px] font-bold tracking-normal">
            LIVE WIRE
          </span>
        </div>
      </div>

      {/* Main Newspaper Masthead Title */}
      <div className="max-w-7xl mx-auto px-4 py-4 text-center">
        <div className="flex items-center justify-center space-x-4 mb-1">
          <div className="hidden md:block h-px bg-ink-900 flex-1 max-w-[120px]"></div>
          <span className="text-[11px] font-serif uppercase tracking-[0.25em] text-ink-700 italic">
            Veritas et Sapientia • Curated Global Intelligence
          </span>
          <div className="hidden md:block h-px bg-ink-900 flex-1 max-w-[120px]"></div>
        </div>

        <h1 
          id="newspaper-main-title" 
          className="font-headline text-3xl sm:text-5xl md:text-6xl font-black text-ink-900 tracking-tight cursor-pointer hover:opacity-95 transition-opacity"
          onClick={onOpenPreferences}
          title="Click to customize newspaper name and preferences"
        >
          {preferences.newspaperTitle || 'THE MORNING CHRONICLE'}
        </h1>

        <p className="mt-1 text-xs md:text-sm font-serif italic text-ink-600">
          Personalized Digital Morning Broadsheet • Issue of {dateFormatted}
        </p>
      </div>

      {/* Classic Double Rules */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="newspaper-rule-double my-1"></div>
      </div>

      {/* Controls & Topic Bar (Hidden on print) */}
      <div className="max-w-7xl mx-auto px-4 py-2 no-print">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Section Navigation Tabs */}
          <nav className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs font-sans font-medium" aria-label="Section Navigation">
            <button
              id="filter-all-topics"
              onClick={() => onSelectTopicFilter('all')}
              className={`px-3 py-1 rounded transition-colors ${
                selectedTopicFilter === 'all'
                  ? 'bg-ink-900 text-white font-semibold shadow-sm'
                  : 'bg-paper-100 text-ink-700 hover:bg-paper-200'
              }`}
            >
              Front Page (All)
            </button>
            {AVAILABLE_TOPICS.map((t) => {
              const isSelected = selectedTopicFilter === t.id;
              const isUserInterested = preferences.selectedTopics.includes(t.id);
              return (
                <button
                  key={t.id}
                  id={`filter-${t.id}`}
                  onClick={() => onSelectTopicFilter(t.id)}
                  className={`px-2.5 py-1 rounded transition-colors flex items-center space-x-1 ${
                    isSelected
                      ? 'bg-ink-900 text-white font-semibold shadow-sm'
                      : isUserInterested
                      ? 'bg-paper-200 text-ink-900 hover:bg-paper-300 font-medium'
                      : 'bg-paper-100 text-ink-500 hover:bg-paper-200'
                  }`}
                >
                  <span>{t.label}</span>
                  {isUserInterested && (
                    <span className="w-1.5 h-1.5 rounded-full bg-editorial-crimson" title="In your preferences" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-sans">
            <button
              id="btn-open-preferences"
              onClick={onOpenPreferences}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-paper-100 hover:bg-paper-200 text-ink-800 rounded border border-paper-300 transition-colors font-medium"
              title="Change news topics and custom interests"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-editorial-navy" />
              <span>Preferences</span>
            </button>

            <button
              id="btn-refresh-wire"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-paper-100 hover:bg-paper-200 text-ink-800 rounded border border-paper-300 transition-colors disabled:opacity-50"
              title="Fetch latest updates from RSS feeds"
            >
              <RotateCw className={`w-3.5 h-3.5 text-ink-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Updating...' : 'Sync Wire'}</span>
            </button>

            <button
              id="btn-save-today-edition"
              onClick={onSaveCurrentEdition}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-paper-100 hover:bg-paper-200 text-ink-800 rounded border border-paper-300 transition-colors"
              title="Save today's edition to personal archive"
            >
              <Newspaper className="w-3.5 h-3.5 text-editorial-amber" />
              <span>Save Today</span>
            </button>

            <button
              id="btn-open-editions-archive"
              onClick={onOpenEditions}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-paper-100 hover:bg-paper-200 text-ink-800 rounded border border-paper-300 transition-colors"
              title="Browse past saved editions"
            >
              <Archive className="w-3.5 h-3.5 text-ink-600" />
              <span>Archive ({savedEditionsCount})</span>
            </button>

            <button
              id="btn-print-newspaper"
              onClick={onPrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-ink-900 hover:bg-black text-white rounded shadow-sm transition-all font-medium"
              title="Download clean newspaper PDF via browser print"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>Print / Save PDF</span>
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="newspaper-rule-single my-1"></div>
      </div>
    </header>
  );
}
