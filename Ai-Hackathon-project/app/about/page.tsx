'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  Volume2,
  Printer,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Moon,
  Sun,
  Laptop,
  Menu,
} from 'lucide-react';
import { useSettings } from '@/components/ThemeProvider';
import AppSidebar from '@/components/AppSidebar';

export default function AboutPage() {
  const { settings, resolvedTheme, toggleTheme } = useSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const headlineFontClass =
    settings.headlineFont === 'sans'
      ? 'font-headline-sans'
      : settings.headlineFont === 'classic'
      ? 'font-headline-classic'
      : 'font-headline-serif';

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex font-serif transition-colors duration-200">
      {/* Persistent Left Sidebar for Desktop & Mobile Slide-over Drawer */}
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex-1 min-w-0 flex flex-col justify-between lg:pl-64">
        {/* Top Broadsheet Hairline */}
        <div className="h-1.5 bg-[var(--accent-primary)] w-full" />

        {/* Header */}
        <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
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
                <span className="font-serif italic text-xs font-semibold">Today&apos;s Broadsheet</span>
              </Link>
            <span className="text-[var(--border-subtle)]">|</span>
            <Link
              href="/dashboard"
              className="text-xs font-sans text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Directory
            </Link>
          </div>

          <div className="flex items-center space-x-3 text-xs font-sans">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Masthead Banner */}
        <div className="text-center mb-12 pb-8 border-b border-[var(--border-subtle)]">
          <div className="inline-flex items-center space-x-1 text-xs font-sans font-bold uppercase tracking-[0.2em] text-[var(--accent-primary)] mb-2">
            <Newspaper className="w-4 h-4" />
            <span>Editorial Manifesto &amp; Purpose</span>
          </div>
          <h1 className={`${headlineFontClass} text-4xl sm:text-6xl font-black text-[var(--text-primary)] tracking-tight`}>
            About Daymark
          </h1>
          <p className="font-serif italic text-base sm:text-xl text-[var(--text-secondary)] mt-3 max-w-2xl mx-auto leading-relaxed">
            Your world, clearly delivered. Reimagining the digital morning newspaper as a calm, finite, high-signal publication.
          </p>
        </div>

        {/* Narrative Section */}
        <article className="space-y-10 text-sm sm:text-base font-serif leading-relaxed text-[var(--text-secondary)]">
          {/* Section 1: The Problem */}
          <section className="space-y-4">
            <h2 className={`${headlineFontClass} text-2xl sm:text-3xl font-bold text-[var(--text-primary)]`}>
              The Problem with Infinite Feeds
            </h2>
            <p>
              Contemporary digital news consumption has become fundamentally misaligned with human well-being.
              Modern algorithmic feeds are engineered to maximize engagement through agitation, novelty, and sensationalism.
              Instead of receiving an informed, structured perspective on the day&apos;s events, readers are confronted with
              bottomless feeds, intrusive popups, commercial tracking beacons, and polarizing echo chambers.
            </p>
            <p>
              The result is informational fatigue: hours spent scrolling through endless updates, yet concluding the morning feeling
              less informed and more anxious than when the day began.
            </p>
          </section>

          {/* Section 2: The Daymark Solution */}
          <section className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className={`${headlineFontClass} text-2xl sm:text-3xl font-bold text-[var(--text-primary)]`}>
              The Daymark Approach: Finite &amp; Intentional
            </h2>
            <p>
              Daymark revives the enduring wisdom of the traditional printed broadsheet. A real newspaper has a front page,
              organized editorial sections, and most importantly, a final page. It delivers what you need to know, contextualizes the
              world, and then lets you begin your day in peace.
            </p>
            <p>
              Daymark is built on four core principles:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 font-sans not-italic">
              <div className="p-5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center space-x-2 text-[var(--accent-primary)] font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>1. Finite Daily Editions</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-normal">
                  Delivered once each morning according to your chosen pace (5, 15, or 30 minutes). Once you reach the end, your morning briefing is complete.
                </p>
              </div>

              <div className="p-5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center space-x-2 text-[var(--accent-primary)] font-bold text-sm">
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>2. Explainable Curation</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-normal">
                  No black-box algorithms. Every story features an explicit &ldquo;Why this?&rdquo; breakdown showing exactly how your focus desks and keywords influenced its ranking.
                </p>
              </div>

              <div className="p-5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center space-x-2 text-[var(--accent-primary)] font-bold text-sm">
                  <Compass className="w-4 h-4 shrink-0" />
                  <span>3. Bubble Detection</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-normal">
                  A dedicated &ldquo;Outside Your Bubble&rdquo; section intentionally presents important global developments outside your primary interests to challenge echo chambers.
                </p>
              </div>

              <div className="p-5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center space-x-2 text-[var(--accent-primary)] font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>4. Sovereign Privacy</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-normal">
                  100% client-side storage. Your reading habits, topic weights, bookmarks, and preferences never leave your browser. Zero tracking cookies, zero sold data.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Verified Feature Set */}
          <section className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className={`${headlineFontClass} text-2xl sm:text-3xl font-bold text-[var(--text-primary)]`}>
              What Daymark Delivers Every Morning
            </h2>
            <ul className="space-y-3 pl-1 font-sans text-xs sm:text-sm">
              <li className="flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                <span>
                  <strong>Executive 3-Point Intelligence Box:</strong> A concise synthesis of critical global developments before exploring individual reporting desks.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <Volume2 className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                <span>
                  <strong>Local In-Browser Audio Briefing:</strong> Hands-free listening powered natively by your browser&apos;s Web Speech API without sending voice telemetry to external servers.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <Printer className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                <span>
                  <strong>Ink-Saving Print &amp; PDF Broadsheet:</strong> Independent print stylesheets that format your daily edition into clean newspaper columns on standard A4 paper without dark ink waste.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                <span>
                  <strong>Customizable Reading Experience:</strong> Personalize your masthead, select from 4 accent palettes, adjust interface density, select headline typography, and scale body font sizes.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 4: News Sources */}
          <section className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className={`${headlineFontClass} text-2xl sm:text-3xl font-bold text-[var(--text-primary)]`}>
              Editorial News Sources
            </h2>
            <p>
              Daymark ingests live, publicly available RSS feeds directly from world-class news organizations with established editorial standards, including:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans text-xs text-center">
              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded font-semibold text-[var(--text-primary)]">
                BBC News
              </div>
              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded font-semibold text-[var(--text-primary)]">
                The New York Times
              </div>
              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded font-semibold text-[var(--text-primary)]">
                Ars Technica
              </div>
              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded font-semibold text-[var(--text-primary)]">
                NPR News
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] italic">
              All stories are attributed directly to their original publications with links to the full articles. Daymark aggregates public RSS headlines under fair-use principles to construct personalized broadsheet issues.
            </p>
          </section>
        </article>

        {/* Action Callout */}
        <div className="mt-12 p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className={`${headlineFontClass} text-xl font-bold text-[var(--text-primary)]`}>
              Ready to explore your morning edition?
            </h3>
            <p className="font-serif italic text-xs text-[var(--text-secondary)] mt-1">
              Read today&apos;s curated front page or explore all destinations in the directory.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-elevated)] rounded text-xs font-sans font-semibold text-[var(--text-primary)] transition-colors"
            >
              Page Directory
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-[var(--accent-primary)] hover:opacity-90 text-white rounded text-xs font-sans font-semibold transition-opacity flex items-center space-x-1"
            >
              <span>Open Broadsheet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-6 bg-[var(--bg-surface)] text-center text-xs font-serif text-[var(--text-muted)]">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center items-center gap-4 text-xs">
          <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">
            Page Directory
          </Link>
          <span>•</span>
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
            Today&apos;s Broadsheet
          </Link>
          <span>•</span>
          <Link href="/archive" className="hover:text-[var(--text-primary)] transition-colors">
            Archive
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
            Privacy Policy
          </Link>
        </div>
        <p className="mt-2 text-[11px] text-[var(--text-muted)]">
          DAYMARK — Your world, clearly delivered. Independent, private digital broadsheet.
        </p>
      </footer>
      </div>
    </div>
  );
}
