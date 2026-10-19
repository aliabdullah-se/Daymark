'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Newspaper,
  BookOpen,
  Brain,
  Sliders,
  Info,
  ShieldAlert,
  Search,
  Bookmark,
  Sparkles,
  Laptop,
  Moon,
  Sun,
  LogOut,
  LogIn,
  ChevronRight,
  SlidersHorizontal,
  LayoutGrid,
  Radio,
  FileText,
  X,
  Compass,
} from 'lucide-react';
import { getCurrentUser, getStoredPreferences, getStoredFeedback } from '@/lib/storage';
import { useSettings } from './ThemeProvider';
import { AVAILABLE_TOPICS, NewsTopic } from '@/types/news';

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenSettings?: () => void;
  onSearch?: (query: string) => void;
  selectedTopicFilter?: string;
  onSelectTopicFilter?: (topic: string) => void;
}

export default function AppSidebar({
  isOpen = false,
  onClose,
  onOpenSettings,
  onSearch,
  selectedTopicFilter = 'all',
  onSelectTopicFilter,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, resolvedTheme, toggleTheme, openSettings } = useSettings();
  const [user, setUser] = useState<{ name: string; email: string; paperTitle?: string } | null>(null);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    const prefs = getStoredPreferences();
    const fb = getStoredFeedback();

    if (currentUser) {
      setUser(currentUser);
    } else if (prefs.readerName) {
      setUser({
        name: prefs.readerName,
        email: 'subscriber@daymark.news',
        paperTitle: prefs.newspaperTitle,
      });
    }

    setSavedCount(fb.savedArticleIds?.length || 0);
  }, [pathname]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleOpenSettingsModal = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      openSettings();
    }
    if (onClose) onClose();
  };

  const handleTopicClick = (topicId: string) => {
    if (onSelectTopicFilter) {
      onSelectTopicFilter(topicId);
    } else {
      router.push(`/?topic=${topicId}`);
    }
    if (onClose) onClose();
  };

  const isHome = pathname === '/';
  const isDashboard = pathname === '/dashboard';
  const isArchive = pathname === '/archive';
  const isProfile = pathname === '/profile';
  const isAbout = pathname === '/about';
  const isPrivacy = pathname === '/privacy';
  const [readerDisplayName, setReaderDisplayName] = useState('Arthur Vance');

  useEffect(() => {
    const currentUser = getCurrentUser();
    const prefs = getStoredPreferences();
    const fb = getStoredFeedback();

    const resolvedName =
      prefs.readerName && prefs.readerName !== 'Reader'
        ? prefs.readerName
        : currentUser?.name && !currentUser.name.includes('Judge')
        ? currentUser.name
        : prefs.readerName || 'Arthur Vance';

    setReaderDisplayName(resolvedName);

    if (currentUser) {
      setUser({
        ...currentUser,
        name: resolvedName,
      });
    } else {
      setUser({
        name: resolvedName,
        email: 'subscriber@daymark.news',
        paperTitle: prefs.newspaperTitle || 'DAYMARK',
      });
    }

    setSavedCount(fb.savedArticleIds?.length || 0);
  }, [pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] text-[var(--text-primary)] border-r border-[var(--border-subtle)] w-64 select-none transition-colors duration-200 shadow-sm">
      {/* Brand Header */}
      <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface)]">
        <a
          href="/"
          className="flex items-center space-x-2.5 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center text-white shadow-md shadow-[var(--accent-primary)]/20 group-hover:scale-105 transition-transform">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <div className="font-headline font-black text-lg tracking-tight leading-none text-[var(--text-primary)]">
              DAYMARK
            </div>
            <div className="text-[10px] font-mono text-[var(--accent-primary)] uppercase tracking-wider mt-0.5 font-semibold">
              {resolvedTheme === 'dark' ? 'Midnight Editorial' : 'Daily Broadsheet'}
            </div>
          </div>
        </a>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search broadsheet..."
            className="w-full pl-9 pr-3 py-1.5 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-md text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] font-sans transition-all"
          />
        </div>
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {/* Section 1: Main Destinations */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)]">
            Main Broadsheet
          </div>
          <nav className="space-y-1 text-xs font-sans">
            <a
              href="/"
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                isHome && selectedTopicFilter === 'all'
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] font-semibold shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Newspaper className={`w-4 h-4 ${isHome && selectedTopicFilter === 'all' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                <span>Today&apos;s Paper</span>
              </div>
              {isHome && selectedTopicFilter === 'all' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-xs" />
              )}
            </a>

            <a
              href="/dashboard"
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                isDashboard
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] font-semibold shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <LayoutGrid className={`w-4 h-4 ${isDashboard ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                <span>Page Directory</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-surface-elevated)] text-[var(--accent-text)] border border-[var(--border-subtle)] font-medium">
                9 Pages
              </span>
            </a>

            <a
              href="/archive"
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                isArchive
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] font-semibold shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <BookOpen className={`w-4 h-4 ${isArchive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                <span>Edition Archive</span>
              </div>
            </a>

            <a
              href="/profile"
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                isProfile
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] font-semibold shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Brain className={`w-4 h-4 ${isProfile ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                <span>Reader Brain</span>
              </div>
            </a>

            <button
              type="button"
              onClick={() => {
                if (onSelectTopicFilter) onSelectTopicFilter('saved-clippings');
                else router.push('/?filter=saved-clippings');
                if (onClose) onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                selectedTopicFilter === 'saved-clippings'
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] font-semibold shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Bookmark className="w-4 h-4 text-[var(--text-muted)]" />
                <span>Saved Clippings</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                {savedCount}
              </span>
            </button>
          </nav>
        </div>

        {/* Section 2: Editorial Desks */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center justify-between">
            <span>Editorial Desks</span>
            <span className="text-[9px] text-[var(--accent-primary)] font-semibold">8 Focus Areas</span>
          </div>
          <nav className="space-y-0.5 text-xs font-sans">
            {AVAILABLE_TOPICS.map((topic) => {
              const isSelected = selectedTopicFilter === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleTopicClick(topic.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md font-medium text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-bold border-l-2 border-[var(--accent-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span className="truncate">{topic.label}</span>
                  {isSelected && <ChevronRight className="w-3.5 h-3.5 text-[var(--accent-primary)]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section 3: Governance & Information */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--text-muted)]">
            Product &amp; Governance
          </div>
          <nav className="space-y-1 text-xs font-sans">
            <a
              href="/about"
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                isAbout
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] font-semibold shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Info className="w-4 h-4 text-[var(--text-muted)]" />
                <span>About Daymark</span>
              </div>
            </a>

            <a
              href="/privacy"
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                isPrivacy
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)] font-semibold shadow-2xs'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-[var(--text-muted)]" />
                <span>Privacy Policy</span>
              </div>
            </a>

            <button
              type="button"
              onClick={handleOpenSettingsModal}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)] hover:text-[var(--text-primary)] transition-all cursor-pointer text-left"
            >
              <div className="flex items-center space-x-2.5">
                <SlidersHorizontal className="w-4 h-4 text-[var(--text-muted)]" />
                <span>Customize Broadsheet</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* User Footer Account Card */}
      <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent-border)] text-[var(--accent-primary)] flex items-center justify-center font-bold text-xs shrink-0">
              {readerDisplayName ? readerDisplayName.charAt(0).toUpperCase() : 'D'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                {readerDisplayName}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] font-serif italic truncate">
                {user?.paperTitle || 'DAYMARK'}
              </div>
            </div>
          </div>

          {/* Quick theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-md hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title={`Toggle Theme (Active: ${settings.theme})`}
            aria-label="Toggle theme"
          >
            {settings.theme === 'system' ? (
              <Laptop className="w-4 h-4 text-[var(--accent-primary)]" />
            ) : resolvedTheme === 'dark' ? (
              <Moon className="w-4 h-4 text-[var(--accent-primary)]" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[11px] font-sans">
          <a
            href="/login"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center space-x-1"
          >
            <LogIn className="w-3 h-3" />
            <span>Switch Account</span>
          </a>
          <button
            type="button"
            onClick={handleOpenSettingsModal}
            className="text-[var(--accent-primary)] hover:underline font-semibold cursor-pointer"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 z-40 no-print">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex no-print">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative z-50 flex-1 max-w-xs w-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
