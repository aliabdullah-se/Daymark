'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  Archive,
  RotateCw,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowUpRight,
  LogOut,
  LogIn,
  Brain,
  BookOpen,
  Settings,
  Sun,
  Moon,
  Laptop,
  Menu,
  X,
  LayoutGrid,
  Newspaper,
  Compass,
  Cpu,
  Globe,
  TrendingUp,
  Atom,
  HeartPulse,
  Leaf,
  Bookmark,
  ChevronDown,
} from 'lucide-react';
import { UserPreferences, NewsTopic, AVAILABLE_TOPICS, UserAccount } from '@/types/news';
import { useSettings } from './ThemeProvider';

export interface MastheadProps {
  preferences: UserPreferences;
  currentUser?: UserAccount | null;
  onSignOut?: () => void;
  onOpenPreferences: () => void;
  onOpenEditions: () => void;
  onPrint?: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  selectedTopicFilter: NewsTopic | 'all';
  onSelectTopicFilter: (topic: NewsTopic | 'all') => void;
  onSaveCurrentEdition: () => void;
  savedEditionsCount: number;
  isPlayingAudio?: boolean;
  onToggleAudio?: () => void;
  onOpenGeminiKey?: () => void;
  hasGeminiKey?: boolean;
  onOpenSettings?: () => void;
  onToggleSidebar?: () => void;
  showBookmarksOnly?: boolean;
  onToggleBookmarks?: () => void;
  savedArticlesCount?: number;
  onScrollToDiscover?: () => void;
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
  onOpenGeminiKey,
  hasGeminiKey = false,
  onOpenSettings,
  onToggleSidebar,
  showBookmarksOnly = false,
  onToggleBookmarks,
  savedArticlesCount = 0,
  onScrollToDiscover,
}: MastheadProps) {
  const { settings, resolvedTheme, toggleTheme, openSettings } = useSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const readerName = currentUser?.name || preferences.readerName || 'Reader';

  const headlineFontClass =
    settings.headlineFont === 'sans'
      ? 'font-headline-sans'
      : settings.headlineFont === 'classic'
      ? 'font-headline-classic'
      : 'font-headline-serif';

  const handleOpenSettings = onOpenSettings || openSettings;

  const handleNavHome = () => {
    if (showBookmarksOnly && onToggleBookmarks) {
      onToggleBookmarks();
    }
    onSelectTopicFilter('all');
  };

  const handleNavTopic = (topic: NewsTopic) => {
    if (showBookmarksOnly && onToggleBookmarks) {
      onToggleBookmarks();
    }
    onSelectTopicFilter(topic);
  };

  const handleNavDiscover = () => {
    if (onScrollToDiscover) {
      onScrollToDiscover();
    } else {
      if (showBookmarksOnly && onToggleBookmarks) {
        onToggleBookmarks();
      }
      onSelectTopicFilter('all');
      setTimeout(() => {
        const el = document.getElementById('outside-your-bubble');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Consistent control style for Section A utility controls
  const utilityControlClass =
    'inline-flex items-center justify-center gap-1.5 h-7 px-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all cursor-pointer text-xs font-sans font-medium select-none shadow-xs';

  // Navigation sections supported by the application
  const primarySections: {
    id: NewsTopic | 'all' | 'discover' | 'bookmarks';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
    onClick: () => void;
  }[] = [
    {
      id: 'all',
      label: 'Home',
      icon: Newspaper,
      isActive: selectedTopicFilter === 'all' && !showBookmarksOnly,
      onClick: handleNavHome,
    },
    {
      id: 'discover',
      label: 'Discover',
      icon: Compass,
      isActive: false,
      onClick: handleNavDiscover,
    },
    {
      id: 'technology',
      label: 'Technology',
      icon: Cpu,
      isActive: selectedTopicFilter === 'technology' && !showBookmarksOnly,
      onClick: () => handleNavTopic('technology'),
    },
    {
      id: 'world',
      label: 'World',
      icon: Globe,
      isActive: selectedTopicFilter === 'world' && !showBookmarksOnly,
      onClick: () => handleNavTopic('world'),
    },
    {
      id: 'business',
      label: 'Markets',
      icon: TrendingUp,
      isActive: selectedTopicFilter === 'business' && !showBookmarksOnly,
      onClick: () => handleNavTopic('business'),
    },
    {
      id: 'science',
      label: 'Science',
      icon: Atom,
      isActive: selectedTopicFilter === 'science' && !showBookmarksOnly,
      onClick: () => handleNavTopic('science'),
    },
    {
      id: 'health',
      label: 'Health',
      icon: HeartPulse,
      isActive: selectedTopicFilter === 'health' && !showBookmarksOnly,
      onClick: () => handleNavTopic('health'),
    },
    {
      id: 'environment',
      label: 'Climate',
      icon: Leaf,
      isActive: selectedTopicFilter === 'environment' && !showBookmarksOnly,
      onClick: () => handleNavTopic('environment'),
    },
    {
      id: 'culture',
      label: 'Culture',
      icon: BookOpen,
      isActive: selectedTopicFilter === 'culture' && !showBookmarksOnly,
      onClick: () => handleNavTopic('culture'),
    },
  ];

  return (
    <header className="w-full bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] transition-colors duration-200 no-print">
      {/* =========================================================================
          SECTION A: COMPACT UTILITY BAR
          Secondary information & utility actions in a compact top bar
          ========================================================================= */}
      <div className="w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs font-sans text-[var(--text-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3">
          {/* Left Side: Brand Wordmark, Current Date Info, Subscriber Greeting */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            {/* Sidebar Drawer Toggle (Mobile / Tablet) */}
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-1 rounded-md bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors cursor-pointer shrink-0"
                aria-label="Open sidebar drawer"
                title="Open sidebar navigation"
              >
                <Menu className="w-3.5 h-3.5" />
              </button>
            )}

            {/* DAYMARK Brand Wordmark / Compact Label */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 group select-none shrink-0"
              title="DAYMARK — Front Page"
            >
              <span className="font-headline font-black text-xs uppercase tracking-[0.2em] text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                DAYMARK
              </span>
              <span className="hidden sm:inline-flex items-center text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] font-semibold">
                Daily Edition
              </span>
            </Link>

            <span className="text-[var(--border-subtle)] hidden sm:inline">•</span>

            {/* Current Real Edition Date (No Fake Issue Numbers) */}
            <span className="hidden sm:inline text-[var(--text-secondary)] font-serif italic text-xs truncate">
              {dateFormatted}
            </span>

            {/* Subscriber Greeting & Session Info */}
            {currentUser ? (
              <div className="hidden md:flex items-center space-x-1.5 text-xs text-[var(--text-secondary)] pl-1 border-l border-[var(--border-subtle)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse shrink-0" />
                <span className="font-medium text-[var(--text-primary)] truncate max-w-[120px]">
                  {readerName}
                </span>
                <Link
                  href="/profile"
                  className="text-[10px] text-[var(--accent-primary)] hover:underline font-mono uppercase tracking-wider"
                  title="View recommendation weights & learning telemetry"
                >
                  (Brain)
                </Link>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="text-[var(--text-muted)] hover:text-red-500 p-0.5 transition-colors cursor-pointer ml-0.5"
                    title="Sign Out"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2 text-xs pl-1 border-l border-[var(--border-subtle)]">
                <Link
                  href="/login"
                  className="text-[var(--accent-primary)] font-medium hover:underline flex items-center gap-1"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Sign In</span>
                </Link>
                <span className="text-[var(--border-subtle)]">/</span>
                <Link
                  href="/signup"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium hover:underline"
                >
                  Subscribe
                </Link>
              </div>
            )}
          </div>

          {/* Right Side: Consistent Utility Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Quick Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={utilityControlClass}
              title={`Theme: ${settings.theme} (${resolvedTheme}). Click to toggle theme.`}
              aria-label="Toggle color theme"
              id="btn-toggle-theme"
            >
              {settings.theme === 'system' ? (
                <Laptop className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
              ) : resolvedTheme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
              )}
              <span className="capitalize hidden sm:inline">
                {settings.theme === 'system' ? 'System' : resolvedTheme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </button>

            {/* Settings Modal Button */}
            <button
              type="button"
              onClick={handleOpenSettings}
              className={utilityControlClass}
              title="Open broadsheet settings & customize layout"
              id="btn-open-settings"
            >
              <Settings className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* Page Directory Button */}
            <Link
              href="/dashboard"
              className={utilityControlClass}
              title="Open complete page & feature directory"
              id="btn-masthead-directory"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
              <span className="hidden sm:inline">Directory</span>
            </Link>

            {/* Audio Briefing Button (if supported) */}
            {onToggleAudio && (
              <button
                type="button"
                id="btn-toggle-audio"
                onClick={onToggleAudio}
                className={`inline-flex items-center justify-center gap-1.5 h-7 px-2 sm:px-2.5 rounded-md border text-xs font-sans font-medium transition-all cursor-pointer shadow-xs ${
                  isPlayingAudio
                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] font-semibold'
                    : 'bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                }`}
                title={isPlayingAudio ? 'Pause Audio Briefing' : 'Play Spoken Morning Audio Briefing (Web Speech API)'}
              >
                {isPlayingAudio ? (
                  <VolumeX className="w-3.5 h-3.5 text-white shrink-0 animate-pulse" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                )}
                <span className="hidden sm:inline">{isPlayingAudio ? 'Listening...' : 'Audio Brief'}</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION B: MAIN MASTHEAD
          Spacious, centered editorial masthead displaying DAYMARK and tagline
          ========================================================================= */}
      <div className="w-full bg-[var(--bg-surface)] py-6 sm:py-8 md:py-10 border-b border-[var(--border-subtle)] text-center relative select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div
            className="inline-block cursor-pointer group"
            onClick={handleOpenSettings}
            title="DAYMARK — Click to customize edition and font styles"
          >
            <h1
              id="newspaper-main-title"
              className={`${headlineFontClass} text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-[var(--text-primary)] tracking-[-0.03em] leading-none transition-colors group-hover:text-[var(--accent-primary)]`}
            >
              DAYMARK
            </h1>
            <p className="font-serif italic text-sm sm:text-base md:text-lg text-[var(--text-secondary)] mt-2.5 sm:mt-3 tracking-normal">
              Your world, clearly delivered.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION C: PRIMARY NAVIGATION ROW
          Boxed navigation items with consistent heights, padding, border radius,
          borders, and active state accent styling.
          ========================================================================= */}
      <div className="w-full bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] no-print sticky top-0 z-30 backdrop-blur-md bg-[var(--bg-surface-elevated)]/95 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-2 gap-3">
            {/* Boxed Primary Section Links (Horizontal Scroll on Tablet & Mobile) */}
            <nav
              aria-label="Primary Broadsheet Sections"
              className="flex-1 overflow-x-auto scrollbar-none py-1 flex items-center gap-1.5 sm:gap-2"
            >
              {primarySections.map((sec) => {
                const IconComponent = sec.icon;
                const active = sec.isActive;
                return (
                  <button
                    key={sec.id}
                    id={sec.id === 'all' ? 'filter-all-topics' : `filter-${sec.id}`}
                    type="button"
                    onClick={sec.onClick}
                    className={`inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-md text-xs font-sans transition-all cursor-pointer select-none whitespace-nowrap shrink-0 border ${
                      active
                        ? 'border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent-text)] font-semibold shadow-xs ring-1 ring-[var(--accent-border)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-subtle)] font-medium'
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                    <span>{sec.label}</span>
                  </button>
                );
              })}

              {/* Saved Articles Filter Toggle */}
              {onToggleBookmarks && (
                <button
                  id="btn-nav-saved"
                  type="button"
                  onClick={onToggleBookmarks}
                  className={`inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-md text-xs font-sans transition-all cursor-pointer select-none whitespace-nowrap shrink-0 border ${
                    showBookmarksOnly
                      ? 'border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent-text)] font-semibold shadow-xs ring-1 ring-[var(--accent-border)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-subtle)] font-medium'
                  }`}
                  title="Toggle Saved Stories Filter"
                >
                  <Bookmark className={`w-3.5 h-3.5 shrink-0 ${showBookmarksOnly ? 'text-[var(--accent-primary)] fill-current' : 'text-[var(--text-muted)]'}`} />
                  <span>Saved</span>
                  {savedArticlesCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                      {savedArticlesCount}
                    </span>
                  )}
                </button>
              )}

              {/* Historical Archive Link */}
              <Link
                href="/archive"
                id="link-archive-page"
                className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-md text-xs font-sans border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-subtle)] font-medium transition-all select-none whitespace-nowrap shrink-0"
                title="View full historical editions archive"
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0 text-[var(--accent-primary)]" />
                <span>Archive</span>
                {savedEditionsCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                    {savedEditionsCount}
                  </span>
                )}
              </Link>
            </nav>

            {/* Quick Action Tools on Right of Navigation Row */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 pl-1 border-l border-[var(--border-subtle)]">
              {/* Sync Live Wire Refresh */}
              <button
                id="btn-refresh-wire"
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-sans font-medium transition-all disabled:opacity-50 cursor-pointer shadow-xs select-none"
                title="Fetch latest reporting from live RSS feeds"
              >
                <RotateCw className={`w-3.5 h-3.5 shrink-0 text-[var(--accent-primary)] ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync Wire'}</span>
              </button>

              {/* Save Current Edition Snapshot */}
              <button
                id="btn-save-today-edition"
                type="button"
                onClick={onSaveCurrentEdition}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-sans font-medium transition-all cursor-pointer shadow-xs select-none"
                title="Save today's edition snapshot to offline local archive"
              >
                <Archive className="w-3.5 h-3.5 shrink-0 text-[var(--accent-primary)]" />
                <span className="hidden sm:inline">Save Issue</span>
              </button>

              {/* Curate / Settings Trigger */}
              <button
                type="button"
                onClick={handleOpenSettings}
                id="link-masthead-settings"
                className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-sans font-medium transition-all cursor-pointer shadow-xs select-none"
                title="Curate editorial lenses and broadsheet settings"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 shrink-0 text-[var(--accent-primary)]" />
                <span className="hidden sm:inline">Curate</span>
              </button>

              {/* Mobile Drawer Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center h-8 w-8 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all cursor-pointer"
                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-xl space-y-4 animate-in slide-in-from-top-2 duration-150">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)] font-bold mb-2">
                Editorial Sections
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                {primarySections.map((sec) => {
                  const IconComponent = sec.icon;
                  const active = sec.isActive;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => {
                        sec.onClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 p-2 rounded-md border transition-all text-left ${
                        active
                          ? 'border-[var(--accent-border)] bg-[var(--accent-subtle)] text-[var(--accent-text)] font-semibold'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 shrink-0 ${active ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                      <span>{sec.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)]">
              <div className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)] font-bold mb-2">
                Reader Tools &amp; Navigation
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <LayoutGrid className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                  <span>Page Directory</span>
                </Link>

                <Link
                  href="/archive"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <BookOpen className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                  <span>Archive ({savedEditionsCount})</span>
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <Brain className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                  <span>Learning Brain</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    handleOpenSettings();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-left cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                  <span>Theme &amp; Settings</span>
                </button>
              </div>
            </div>

            {/* Quick Subscriber Info on Mobile */}
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>{readerName}</span>
              <div className="flex items-center space-x-3">
                <Link href="/about" className="hover:underline">About</Link>
                <span>•</span>
                <Link href="/privacy" className="hover:underline">Privacy</Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          ACTIVE CURATED LENSES STRIP
          Subtle editorial telemetry showing the active intellectual lenses
          ========================================================================= */}
      {preferences.selectedTopics.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between text-xs font-sans text-[var(--text-secondary)] border-b border-[var(--border-subtle)]/70 no-print gap-2">
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center shrink-0">
              <Sparkles className="w-3 h-3 text-[var(--accent-primary)] mr-1 shrink-0" />
              Curated Lenses:
            </span>
            {preferences.selectedTopics.map((topicId) => {
              const meta = AVAILABLE_TOPICS.find((t) => t.id === topicId);
              return (
                <span
                  key={topicId}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-text)] text-[11px] font-medium border border-[var(--accent-border)] select-none"
                >
                  {meta ? meta.label.split('&')[0].trim() : topicId}
                </span>
              );
            })}
            {preferences.customInterests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] text-[11px] font-serif italic border border-[var(--border-subtle)] select-none"
              >
                #{interest}
              </span>
            ))}
            {preferences.customInterests.length > 3 && (
              <span className="text-[10px] text-[var(--text-muted)] font-sans">
                +{preferences.customInterests.length - 3} more
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenSettings}
            className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent-primary)] font-sans font-medium transition-colors hidden sm:inline-flex items-center space-x-0.5 cursor-pointer"
          >
            <span>Adjust Lenses</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </header>
  );
}
