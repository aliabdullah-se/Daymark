'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  BookOpen,
  Brain,
  SlidersHorizontal,
  KeyRound,
  UserPlus,
  ShieldCheck,
  Info,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Sliders,
  CheckCircle2,
  Clock,
  Compass,
  ArrowLeft,
  Laptop,
  Moon,
  Sun,
  LayoutGrid,
  Menu,
} from 'lucide-react';
import { getCurrentUser, getStoredPreferences, getStoredEditions } from '@/lib/storage';
import { useSettings } from '@/components/ThemeProvider';
import SettingsModal from '@/components/SettingsModal';
import AppSidebar from '@/components/AppSidebar';

interface PageDestination {
  title: string;
  route: string;
  category: 'Editorial' | 'Account' | 'Governance' | 'Tools';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  status: 'Live & Active' | 'Ready' | 'Configurable';
  isExternal?: boolean;
}

export default function DashboardPage() {
  const { settings, resolvedTheme, toggleTheme, openSettings } = useSettings();
  const [userName, setUserName] = useState<string>('Reader');
  const [paperTitle, setPaperTitle] = useState<string>('DAYMARK');
  const [editionsCount, setEditionsCount] = useState<number>(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    const user = getCurrentUser();
    const prefs = getStoredPreferences();
    const editions = getStoredEditions();

    if (user?.name || prefs.readerName) {
      setUserName(user?.name || prefs.readerName);
    }
    if (user?.paperTitle || prefs.newspaperTitle) {
      setPaperTitle(user?.paperTitle || prefs.newspaperTitle);
    }
    setEditionsCount(editions.length);
  }, []);

  const headlineFontClass =
    settings.headlineFont === 'sans'
      ? 'font-headline-sans'
      : settings.headlineFont === 'classic'
      ? 'font-headline-classic'
      : 'font-headline-serif';

  const destinations: PageDestination[] = [
    {
      title: "Today's Morning Broadsheet",
      route: '/',
      category: 'Editorial',
      description:
        "The primary personalized morning newspaper. Curated from verified RSS feeds (BBC, NYT, Ars Technica, NPR), featuring an executive 3-takeaway intelligence box, lead cover story, wire digest, and audio briefing.",
      icon: Newspaper,
      badge: 'Main Destination',
      status: 'Live & Active',
    },
    {
      title: 'Historical Edition Archive',
      route: '/archive',
      category: 'Editorial',
      description:
        "Browse, inspect, and reprint past daily broadsheets preserved locally. Access past editions by date with article counts, executive takeaways, and an interactive full-edition reader modal.",
      icon: BookOpen,
      badge: `${editionsCount} Saved Issues`,
      status: 'Live & Active',
    },
    {
      title: 'Recommendation Brain & Profile',
      route: '/profile',
      category: 'Editorial',
      description:
        "Transparent algorithmic telemetry dashboard. View dynamic topic affinity gauges (0-100%), reader interaction logs, AI-inferred keyword suggestions, and engagement analytics.",
      icon: Brain,
      badge: 'Telemetry & Signals',
      status: 'Live & Active',
    },
    {
      title: 'Editorial Calibration Desk',
      route: '/onboarding',
      category: 'Account',
      description:
        "3-step setup to calibrate your morning paper: select focus desks (Tech, World, Science, Business, Culture, Politics), configure custom intellectual keyword lenses, and calibrate reading pace.",
      icon: SlidersHorizontal,
      badge: 'Preferences Desk',
      status: 'Ready',
    },
    {
      title: 'Subscriber Press Room Sign-In',
      route: '/login',
      category: 'Account',
      description:
        "Authenticate into your personal broadsheet press room using email credentials or instant 1-click sample subscriber session with local cookie verification.",
      icon: KeyRound,
      badge: 'Authentication',
      status: 'Ready',
    },
    {
      title: 'New Subscription Desk',
      route: '/signup',
      category: 'Account',
      description:
        "Create a new subscriber profile with a customized newspaper title (e.g., 'DAYMARK'), subscriber email, and initial desk selection.",
      icon: UserPlus,
      badge: 'Registration',
      status: 'Ready',
    },
    {
      title: 'Press Identity OTP Verification',
      route: '/verify-otp',
      category: 'Account',
      description:
        "Cryptographic 6-digit one-time password verification desk for secure, private reader sessions with automatic digit advancement and paste support.",
      icon: ShieldCheck,
      badge: 'Security Desk',
      status: 'Ready',
    },
    {
      title: 'About Daymark',
      route: '/about',
      category: 'Governance',
      description:
        "Learn about Daymark's mission: restoring intentionality and calm to morning news through finite broadsheets, transparent ranking algorithms, and zero advertisement clutter.",
      icon: Info,
      badge: 'Product Mission',
      status: 'Live & Active',
    },
    {
      title: 'Verified Privacy Policy',
      route: '/privacy',
      category: 'Governance',
      description:
        "Verified architectural privacy guarantees: 100% client-side localStorage, zero commercial tracking pixels, local Web Speech API synthesis, and sovereign reader control.",
      icon: ShieldAlert,
      badge: 'Data Sovereignty',
      status: 'Live & Active',
    },
  ];

  const filteredDestinations =
    activeCategory === 'all'
      ? destinations
      : destinations.filter((d) => d.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex font-serif transition-colors duration-200">
      {/* Persistent Left Sidebar for Desktop & Mobile Slide-over Drawer */}
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col justify-between lg:pl-64">
        {/* Top Broadsheet Hairline */}
        <div className="h-1 bg-[var(--accent-primary)] w-full" />

        {/* Header */}
        <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
                aria-label="Open sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>
              <Link
                href="/"
                className="flex items-center space-x-2 group text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-[var(--accent-primary)] group-hover:-translate-x-1 transition-transform" />
                <span className="font-serif italic text-xs font-semibold">Back to Today&apos;s Paper</span>
              </Link>
              <span className="text-[var(--border-subtle)]">|</span>
              <span className="text-xs uppercase font-mono tracking-widest text-[var(--text-muted)]">
                Directory &amp; Navigation
              </span>
            </div>

          <div className="flex items-center space-x-2">
            {/* Quick Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center space-x-1 px-2.5 py-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] text-xs font-sans transition-all cursor-pointer"
              title={`Theme: ${settings.theme}. Click to toggle.`}
            >
              {settings.theme === 'system' ? (
                <Laptop className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              ) : resolvedTheme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              )}
              <span className="capitalize">{settings.theme}</span>
            </button>

            {/* In-Dashboard Settings Trigger */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center space-x-1 px-3 py-1 bg-[var(--accent-primary)] text-white hover:opacity-90 rounded text-xs font-sans font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Customize Broadsheet</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {/* Banner Section */}
        <div className="mb-8 pb-6 border-b border-[var(--border-subtle)] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-1 text-xs font-sans font-bold uppercase tracking-[0.2em] text-[var(--accent-primary)] mb-2">
              <Compass className="w-4 h-4" />
              <span>Full Website Directory</span>
            </div>
            <h1 className={`${headlineFontClass} text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight`}>
              Page Directory &amp; Navigation
            </h1>
            <p className="font-serif italic text-sm sm:text-base text-[var(--text-secondary)] mt-2 max-w-2xl leading-relaxed">
              Complete index of all implemented pages, reader tools, calibration desks, and governance resources in Daymark.
            </p>
          </div>

          {/* Quick Reader Badge */}
          <div className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded p-4 text-xs font-sans space-y-1 text-left min-w-[240px]">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)]">
              Active Session Status
            </div>
            <div className="font-bold text-[var(--text-primary)] text-sm">{userName}</div>
            <div className="text-[var(--text-secondary)] font-serif italic text-xs">{paperTitle}</div>
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--accent-primary)] font-semibold">
              <span>Theme: {settings.theme}</span>
              <span>Density: {settings.density}</span>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8 text-xs font-sans">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mr-1">
            Filter Desks:
          </span>
          {[
            { id: 'all', label: 'All Destinations (9)' },
            { id: 'editorial', label: 'Editorial & Broadsheet (3)' },
            { id: 'account', label: 'Accounts & Calibration (4)' },
            { id: 'governance', label: 'Product & Policies (2)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded border transition-all cursor-pointer font-medium ${
                activeCategory === cat.id
                  ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] font-bold shadow-xs'
                  : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest) => {
            const Icon = dest.icon;
            return (
              <div
                key={dest.route}
                className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded shadow-xs p-6 flex flex-col justify-between hover:border-[var(--accent-primary)] transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-semibold">
                      {dest.badge}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-[var(--accent-primary)] font-semibold mb-1">
                    {dest.route}
                  </div>

                  <h3 className={`${headlineFontClass} text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-primary)] transition-colors`}>
                    {dest.title}
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)] font-serif leading-relaxed mb-6">
                    {dest.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {dest.status}
                  </span>

                  <Link
                    href={dest.route}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded bg-[var(--text-primary)] text-[var(--bg-page)] hover:bg-[var(--accent-primary)] hover:text-white text-xs font-sans font-semibold transition-colors cursor-pointer"
                  >
                    <span>Open Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* In-Page Quick Tools Section */}
        <div className="mt-12 p-6 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className={`${headlineFontClass} text-2xl font-bold text-[var(--text-primary)]`}>
                Appearance &amp; Reading Customization
              </h2>
              <p className="font-serif italic text-xs text-[var(--text-secondary)] mt-1">
                Customize typography, density, accent palettes, canvas width, and story thumbnails.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2 bg-[var(--accent-primary)] text-white font-sans text-xs font-semibold rounded hover:opacity-90 transition-opacity flex items-center space-x-2 cursor-pointer shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Launch Settings Modal</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-6 bg-[var(--bg-surface)] text-center text-xs font-serif text-[var(--text-muted)]">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center items-center gap-4 text-xs">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
            Today&apos;s Broadsheet
          </Link>
          <span>•</span>
          <Link href="/archive" className="hover:text-[var(--text-primary)] transition-colors">
            Archive
          </Link>
          <span>•</span>
          <Link href="/profile" className="hover:text-[var(--text-primary)] transition-colors">
            Reader Profile
          </Link>
          <span>•</span>
          <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">
            About Us
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
            Privacy Policy
          </Link>
        </div>
        <p className="mt-2 text-[11px] text-[var(--text-muted)]">
          DAYMARK — Your world, clearly delivered. Zero tracking, client-side sovereignty.
        </p>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      </div>
    </div>
  );
}
