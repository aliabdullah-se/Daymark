'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Database,
  Lock,
  Cookie,
  Rss,
  Mic,
  Key,
  Trash2,
  ArrowLeft,
  Moon,
  Sun,
  Laptop,
  CheckCircle2,
  Menu,
} from 'lucide-react';
import { useSettings } from '@/components/ThemeProvider';
import AppSidebar from '@/components/AppSidebar';

export default function PrivacyPolicyPage() {
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
            <ShieldAlert className="w-4 h-4" />
            <span>Architecture &amp; Data Governance</span>
          </div>
          <h1 className={`${headlineFontClass} text-4xl sm:text-6xl font-black text-[var(--text-primary)] tracking-tight`}>
            Privacy Policy
          </h1>
          <p className="font-serif italic text-base sm:text-xl text-[var(--text-secondary)] mt-3 max-w-2xl mx-auto leading-relaxed">
            Verified architectural data handling. Daymark is designed around client-side data sovereignty, zero commercial tracking, and complete reader privacy.
          </p>
          <div className="mt-4 text-xs font-mono text-[var(--text-muted)]">
            Effective Date: October 2026 • Version 1.2
          </div>
        </div>

        {/* Policy Content */}
        <article className="space-y-10 text-sm sm:text-base font-serif leading-relaxed text-[var(--text-secondary)]">
          {/* Summary Box */}
          <div className="p-6 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-sans not-italic space-y-3">
            <h3 className="font-bold text-[var(--text-primary)] text-base flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-[var(--accent-primary)]" />
              <span>Executive Privacy Summary</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Daymark does not track your identity across the web, does not sell your personal reading habits, does not serve advertisements, and does not require third-party analytics. All your curation preferences, saved clippings, and custom lenses reside directly on your own device.
            </p>
          </div>

          {/* Section 1: Storage */}
          <section className="space-y-4">
            <h2 className={`${headlineFontClass} text-2xl font-bold text-[var(--text-primary)] flex items-center space-x-2`}>
              <Database className="w-5 h-5 text-[var(--accent-primary)]" />
              <span>1. Browser Local Storage (localStorage)</span>
            </h2>
            <p>
              Daymark utilizes standard HTML5 browser <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">localStorage</code> to maintain your personalized reading configuration without external database profiles. Specifically:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-xs sm:text-sm font-sans">
              <li>
                <strong className="text-[var(--text-primary)]">daymark_preferences:</strong> Stores your chosen reader name, customized masthead title, active focus desks, custom keyword lenses, reading pace, and onboarding status.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">daymark_feedback:</strong> Stores identifiers of articles you have liked, disliked, or dismissed to dynamically recalculate topic weights.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">daymark_saved_editions:</strong> Stores snapshots of archived broadsheet editions and saved clippings you choose to preserve.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">daymark_appearance_settings:</strong> Stores your theme (Light, Dark, System), accent palette, interface density, headline typography, and reading width.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">daymark_learning_signals:</strong> Stores a chronological audit log of your reading interactions so you can inspect how your topic affinity scores evolve.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">daymark_gemini_api_key:</strong> Stores an optional user-provided Google Gemini API key if you configure one for executive summaries.
              </li>
            </ul>
            <p className="text-xs text-[var(--text-muted)] italic">
              All of this data is strictly confined to your browser&apos;s origin and is never transmitted to any third-party marketing services.
            </p>
          </section>

          {/* Section 2: Cookies */}
          <section className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className={`${headlineFontClass} text-2xl font-bold text-[var(--text-primary)] flex items-center space-x-2`}>
              <Cookie className="w-5 h-5 text-[var(--accent-primary)]" />
              <span>2. Cookies &amp; Session Tokens</span>
            </h2>
            <p>
              Daymark uses minimal, functional first-party cookies solely to support Next.js edge route protection:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-xs sm:text-sm font-sans">
              <li>
                <strong className="text-[var(--text-primary)]">daymark_token:</strong> A locally generated session token containing your subscriber ID and display name, enabling server-side rendering without external auth providers.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">daymark_otp_verified:</strong> A security flag indicating that your 6-digit Press Verification OTP was confirmed.
              </li>
            </ul>
            <p>
              Daymark does not deploy tracking cookies, advertising identifiers, cross-site beacons, or persistent fingerprinting techniques.
            </p>
          </section>

          {/* Section 3: RSS Feeds */}
          <section className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className={`${headlineFontClass} text-2xl font-bold text-[var(--text-primary)] flex items-center space-x-2`}>
              <Rss className="w-5 h-5 text-[var(--accent-primary)]" />
              <span>3. External RSS News Ingestion</span>
            </h2>
            <p>
              Daymark fetches public news feeds directly from established news publishers:
            </p>
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono">
              BBC News • The New York Times • Ars Technica • NPR News
            </div>
            <p>
              Feed requests are initiated server-side through cached HTTP requests. Your IP address, device fingerprints, and personal reading preferences are never forwarded to the news publishers when stories are retrieved.
            </p>
          </section>

          {/* Section 4: Audio Speech Synthesis */}
          <section className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className={`${headlineFontClass} text-2xl font-bold text-[var(--text-primary)] flex items-center space-x-2`}>
              <Mic className="w-5 h-5 text-[var(--accent-primary)]" />
              <span>4. Web Speech API (Audio Briefing)</span>
            </h2>
            <p>
              The Audio Briefing feature utilizes your browser&apos;s native <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">window.speechSynthesis</code> API.
              Speech synthesis runs entirely within your device&apos;s operating system speech engine. No audio is recorded, and no voice telemetry or transcription is transmitted across the network.
            </p>
          </section>

          {/* Section 5: AI & Gemini API */}
          <section className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className={`${headlineFontClass} text-2xl font-bold text-[var(--text-primary)] flex items-center space-x-2`}>
              <Key className="w-5 h-5 text-[var(--accent-primary)]" />
              <span>5. Optional Google Gemini API Keys</span>
            </h2>
            <p>
              If you choose to configure a free Google Gemini API key to generate customized 3-point takeaways, the key is saved exclusively in your browser&apos;s local storage.
              When generating a summary, the key is communicated securely over HTTPS directly to Google&apos;s official API endpoint.
              If you do not configure an API key, Daymark executes a deterministic local summarization engine that performs 100% of its work offline with zero external AI calls.
            </p>
          </section>

          {/* Section 6: Deletion Rights */}
          <section className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className={`${headlineFontClass} text-2xl font-bold text-[var(--text-primary)] flex items-center space-x-2`}>
              <Trash2 className="w-5 h-5 text-[var(--accent-primary)]" />
              <span>6. Data Sovereignty &amp; Right to Erasure</span>
            </h2>
            <p>
              You maintain total sovereign control over your data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-xs sm:text-sm font-sans">
              <li>
                <strong className="text-[var(--text-primary)]">Reset Appearance Settings:</strong> You can restore default visual themes, typography, and canvas widths anytime in the Settings modal with 1 click.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Complete Data Removal:</strong> Clearing your browser&apos;s local storage and cookies for the Daymark domain instantaneously and permanently erases all stored preferences, saved editions, interaction telemetry, and API keys.
              </li>
            </ul>
          </section>

          {/* Section 7: Contact */}
          <section className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className={`${headlineFontClass} text-2xl font-bold text-[var(--text-primary)]`}>
              7. Governance &amp; Contact
            </h2>
            <p>
              Daymark is operated as an independent software product with a strict privacy-first architecture. If you have questions regarding this policy or its architectural implementation, please review the complete source code or consult the project documentation.
            </p>
          </section>
        </article>

        {/* Back navigation banner */}
        <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
          <Link
            href="/dashboard"
            className="text-[var(--accent-primary)] hover:underline font-bold"
          >
            ← Return to Page Directory
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-page)] rounded hover:bg-[var(--accent-primary)] hover:text-white transition-colors font-semibold"
          >
            Open Today&apos;s Broadsheet →
          </Link>
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
          <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">
            About Us
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors font-bold text-[var(--accent-primary)]">
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
