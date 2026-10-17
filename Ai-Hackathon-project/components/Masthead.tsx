'use client';

import React from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  Printer,
  Archive,
  RotateCw,
  Volume2,
  VolumeX,
  Sparkles,
  Tag,
  ArrowUpRight,
  User,
  LogOut,
  LogIn,
  Brain,
  BookOpen,
} from 'lucide-react';
import { UserPreferences, NewsTopic, AVAILABLE_TOPICS, UserAccount } from '@/types/news';

interface MastheadProps {
  preferences: UserPreferences;
  currentUser?: UserAccount | null;
  onSignOut?: () => void;
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
  currentUser,
  onSignOut,
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
  const readerName = currentUser?.name || preferences.readerName || 'Reader';

  return (
    <header className="w-full bg-ivory-100 border-b border-ivory-300">
      {/* 1. TOP UTILITY STRIP */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between text-[11px] font-sans tracking-wider text-charcoal-600 border-b border-ivory-200">
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
        <div className="flex items-center space-x-3 sm:space-x-4 mt-1 sm:mt-0">
          {/* User Authentication Status */}
          {currentUser ? (
            <div className="flex items-center space-x-2 text-charcoal-700">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-500 animate-pulse" />
              <span className="text-charcoal-500 font-sans hidden sm:inline">Signed in as</span>
              <span className="font-serif italic font-semibold text-charcoal-900">
                {readerName}
              </span>
              <Link
                href="/profile"
                className="text-forest-700 hover:text-forest-900 text-[10px] font-sans font-semibold uppercase tracking-wider ml-1 hover:underline"
                title="View recommendation weights & learning brain"
              >
                (Brain)
              </Link>
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="text-charcoal-400 hover:text-charcoal-800 p-0.5 ml-1 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-[11px]">
              <Link
                href="/login"
                className="text-forest-700 hover:text-forest-900 font-sans font-semibold hover:underline flex items-center space-x-0.5"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </Link>
              <span className="text-ivory-400">/</span>
              <Link
                href="/signup"
                className="text-charcoal-700 hover:text-charcoal-900 font-sans font-medium hover:underline"
              >
                Subscribe
              </Link>
            </div>
          )}

          <div className="flex items-center space-x-2 no-print">
            {onToggleAudio && (
              <button
                id="btn-toggle-audio"
                onClick={onToggleAudio}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-sans transition-all cursor-pointer ${
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
              className="flex items-center space-x-1 px-3 py-1 bg-charcoal-900 hover:bg-charcoal-800 text-ivory-50 rounded text-[11px] font-medium transition-all shadow-xs cursor-pointer"
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
                className={`py-1 transition-all relative cursor-pointer ${
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
                    className={`py-1 transition-all relative flex items-center space-x-1 cursor-pointer ${
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

            {/* Quick Action Tools & Multi-Page Navigation */}
            <div className="flex items-center space-x-3 text-xs font-sans text-charcoal-600">
              <button
                id="btn-refresh-wire"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-1 hover:text-charcoal-900 transition-colors disabled:opacity-50 cursor-pointer"
                title="Sync live wire"
              >
                <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-forest-600' : ''}`} />
                <span>{isRefreshing ? 'Syncing...' : 'Sync Wire'}</span>
              </button>

              <span className="text-ivory-400">|</span>

              <button
                id="btn-save-today-edition"
                onClick={onSaveCurrentEdition}
                className="hover:text-charcoal-900 transition-colors cursor-pointer"
                title="Archive today's edition snapshot"
              >
                Save Issue
              </button>

              <span className="text-ivory-400">|</span>

              <Link
                href="/archive"
                id="link-archive-page"
                className="hover:text-charcoal-900 transition-colors flex items-center space-x-1 font-medium"
                title="View full historical editions archive"
              >
                <BookOpen className="w-3 h-3 text-forest-700" />
                <span>Archive ({savedEditionsCount})</span>
              </Link>

              <span className="text-ivory-400">|</span>

              <Link
                href="/profile"
                id="link-profile-brain"
                className="hover:text-charcoal-900 transition-colors flex items-center space-x-1 text-forest-800 font-medium"
                title="View recommendation weights & learning brain"
              >
                <Brain className="w-3 h-3 text-forest-600" />
                <span>Brain</span>
              </Link>

              <span className="text-ivory-400">|</span>

              <Link
                href="/onboarding"
                id="link-onboarding-curate"
                className="flex items-center space-x-1 hover:text-charcoal-900 transition-colors text-charcoal-800 font-medium"
                title="Edit reading preferences & topics"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Curate</span>
              </Link>
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

        <Link
          href="/onboarding"
          className="text-[11px] text-charcoal-500 hover:text-forest-700 font-sans font-medium transition-colors hidden sm:inline-flex items-center space-x-0.5"
        >
          <span>Adjust Lenses</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </header>
  );
}
