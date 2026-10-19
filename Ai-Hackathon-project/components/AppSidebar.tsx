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

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#081321] text-[#F1F5FA] border-r border-[#20344B] w-64 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#20344B] flex items-center justify-between">
        <a
          href="/"
          className="flex items-center space-x-2.5 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-[#526BFF] flex items-center justify-center text-white shadow-md shadow-[#526BFF]/20 group-hover:scale-105 transition-transform">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <div className="font-headline font-black text-lg tracking-tight leading-none text-[#F1F5FA]">
              DAYMARK
            </div>
            <div className="text-[10px] font-mono text-[#4DB8E8] uppercase tracking-wider mt-0.5">
              Midnight Editorial
            </div>
          </div>
        </a>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1 text-[#A4B3C7] hover:text-[#F1F5FA] rounded hover:bg-[#12243A] transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Input (Inspired by Reference Image 1) */}
      <div className="p-3 border-b border-[#20344B]">
        <div className="relative">
          <Search className="w-4 h-4 text-[#A4B3C7] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search broadsheet..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#0D1B2C] border border-[#20344B] rounded-md text-xs text-[#F1F5FA] placeholder-[#6C829D] focus:outline-hidden focus:border-[#526BFF] focus:ring-1 focus:ring-[#526BFF] font-sans transition-all"
          />
        </div>
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {/* Section 1: Main Destinations */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#6C829D]">
            Main Broadsheet
          </div>
          <nav className="space-y-1 text-xs font-sans">
            <a
              href="/"
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                isHome && selectedTopicFilter === 'all'
                  ? 'bg-[#12243A] text-[#F1F5FA] border border-[#526BFF]/40 font-semibold shadow-xs'
                  : 'text-[#A4B3C7] hover:bg-[#0D1B2C] hover:text-[#F1F5FA]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Newspaper className={`w-4 h-4 ${isHome ? 'text-[#526BFF]' : 'text-[#A4B3C7]'}`} />
                <span>Today&apos;s Paper</span>
              </div>
              {isHome && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#526BFF] shadow-xs shadow-[#526BFF]" />
              )}
            </a>

            <a
              href="/dashboard"
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                isDashboard
                  ? 'bg-[#12243A] text-[#F1F5FA] border border-[#526BFF]/40 font-semibold shadow-xs'
                  : 'text-[#A4B3C7] hover:bg-[#0D1B2C] hover:text-[#F1F5FA]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <LayoutGrid className={`w-4 h-4 ${isDashboard ? 'text-[#526BFF]' : 'text-[#A4B3C7]'}`} />
                <span>Page Directory</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0D1B2C] text-[#4DB8E8] border border-[#20344B]">
                9 Pages
              </span>
            </a>

            <a
              href="/archive"
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                isArchive
                  ? 'bg-[#12243A] text-[#F1F5FA] border border-[#526BFF]/40 font-semibold shadow-xs'
                  : 'text-[#A4B3C7] hover:bg-[#0D1B2C] hover:text-[#F1F5FA]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <BookOpen className={`w-4 h-4 ${isArchive ? 'text-[#526BFF]' : 'text-[#A4B3C7]'}`} />
                <span>Edition Archive</span>
              </div>
            </a>

            <a
              href="/profile"
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                isProfile
                  ? 'bg-[#12243A] text-[#F1F5FA] border border-[#526BFF]/40 font-semibold shadow-xs'
                  : 'text-[#A4B3C7] hover:bg-[#0D1B2C] hover:text-[#F1F5FA]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Brain className={`w-4 h-4 ${isProfile ? 'text-[#526BFF]' : 'text-[#A4B3C7]'}`} />
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
                  ? 'bg-[#12243A] text-[#F1F5FA] border border-[#526BFF]/40 font-semibold shadow-xs'
                  : 'text-[#A4B3C7] hover:bg-[#0D1B2C] hover:text-[#F1F5FA]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Bookmark className="w-4 h-4 text-[#A4B3C7]" />
                <span>Saved Clippings</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0D1B2C] text-[#A4B3C7] border border-[#20344B]">
                {savedCount}
              </span>
            </button>
          </nav>
        </div>

        {/* Section 2: Editorial Desks */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#6C829D] flex items-center justify-between">
            <span>Editorial Desks</span>
            <span className="text-[9px] text-[#4DB8E8]">8 Focus Areas</span>
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
                      ? 'bg-[#12243A] text-[#526BFF] font-bold border-l-2 border-[#526BFF]'
                      : 'text-[#A4B3C7] hover:bg-[#0D1B2C] hover:text-[#F1F5FA]'
                  }`}
                >
                  <span className="truncate">{topic.label}</span>
                  {isSelected && <ChevronRight className="w-3.5 h-3.5 text-[#526BFF]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Section 3: Governance & Information */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#6C829D]">
            Product &amp; Governance
          </div>
          <nav className="space-y-1 text-xs font-sans">
            <a
              href="/about"
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                isAbout
                  ? 'bg-[#12243A] text-[#F1F5FA] border border-[#526BFF]/40 font-semibold shadow-xs'
                  : 'text-[#A4B3C7] hover:bg-[#0D1B2C] hover:text-[#F1F5FA]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Info className="w-4 h-4 text-[#A4B3C7]" />
                <span>About Daymark</span>
              </div>
            </a>

            <a
              href="/privacy"
              className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all ${
                isPrivacy
                  ? 'bg-[#12243A] text-[#F1F5FA] border border-[#526BFF]/40 font-semibold shadow-xs'
                  : 'text-[#A4B3C7] hover:bg-[#0D1B2C] hover:text-[#F1F5FA]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-[#A4B3C7]" />
                <span>Privacy Policy</span>
              </div>
            </a>

            <button
              type="button"
              onClick={handleOpenSettingsModal}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-[#A4B3C7] hover:bg-[#0D1B2C] hover:text-[#F1F5FA] transition-all cursor-pointer text-left"
            >
              <div className="flex items-center space-x-2.5">
                <SlidersHorizontal className="w-4 h-4 text-[#A4B3C7]" />
                <span>Customize Broadsheet</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* User Footer Account Card (Inspired by Image 1) */}
      <div className="p-3 border-t border-[#20344B] bg-[#0D1B2C]/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#12243A] border border-[#20344B] text-[#526BFF] flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'D'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#F1F5FA] truncate">
                {user?.name || 'Arthur Vance'}
              </div>
              <div className="text-[10px] text-[#A4B3C7] font-serif italic truncate">
                {user?.paperTitle || 'DAYMARK'}
              </div>
            </div>
          </div>

          {/* Quick theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-md hover:bg-[#12243A] text-[#A4B3C7] hover:text-[#F1F5FA] transition-colors cursor-pointer"
            title={`Toggle Theme (Active: ${settings.theme})`}
            aria-label="Toggle theme"
          >
            {settings.theme === 'system' ? (
              <Laptop className="w-4 h-4 text-[#4DB8E8]" />
            ) : resolvedTheme === 'dark' ? (
              <Moon className="w-4 h-4 text-[#526BFF]" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#20344B]/60 text-[11px] font-sans">
          <a
            href="/login"
            className="text-[#A4B3C7] hover:text-[#F1F5FA] transition-colors flex items-center space-x-1"
          >
            <LogIn className="w-3 h-3" />
            <span>Switch Account</span>
          </a>
          <button
            type="button"
            onClick={handleOpenSettingsModal}
            className="text-[#526BFF] hover:underline font-semibold"
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
