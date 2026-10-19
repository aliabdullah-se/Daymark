'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Calendar,
  Printer,
  Trash2,
  ArrowRight,
  Sparkles,
  BookOpen,
  ArrowLeft,
  X,
  ExternalLink,
  Clock,
  Menu,
} from 'lucide-react';
import { SavedEdition, Article } from '@/types/news';
import { getStoredEditions, deleteStoredEdition, getCurrentUser, getStoredPreferences } from '@/lib/storage';
import AppSidebar from '@/components/AppSidebar';

export default function ArchivePage() {
  const [editions, setEditions] = useState<SavedEdition[]>([]);
  const [selectedEdition, setSelectedEdition] = useState<SavedEdition | null>(null);
  const [userTitle, setUserTitle] = useState('DAYMARK');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loaded = getStoredEditions();
    setEditions(loaded);
    const prefs = getStoredPreferences();
    const user = getCurrentUser();
    const rawTitle = user?.paperTitle || prefs.newspaperTitle || 'DAYMARK';
    setUserTitle(
      rawTitle.toUpperCase().includes('BROADSIDE') ||
        rawTitle.toUpperCase().includes('DISPATCH') ||
        rawTitle.toUpperCase().includes('MORNING CHRONICLE')
        ? 'DAYMARK'
        : rawTitle
    );
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Remove this edition from your historical archive?')) {
      deleteStoredEdition(id);
      setEditions((prev) => prev.filter((item) => item.id !== id));
      if (selectedEdition?.id === id) {
        setSelectedEdition(null);
      }
    }
  };

  const handlePrintEdition = (e: React.MouseEvent, edition?: SavedEdition) => {
    e.stopPropagation();
    const ed = edition || selectedEdition;
    if (ed) {
      setSelectedEdition(ed);
      const originalTitle = document.title;
      document.title = `DAYMARK - ${ed.title || userTitle} - ${ed.dateStr}`;
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          document.title = originalTitle;
        }, 1500);
      }, 200);
    } else {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex font-sans transition-colors duration-200">
      {/* Persistent Left Sidebar for Desktop & Mobile Slide-over Drawer */}
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex-1 min-w-0 flex flex-col justify-between lg:pl-64">
        {/* Top Hairline */}
        <div className="h-1 bg-[var(--accent-primary)] w-full" />

        {/* Header */}
        <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
                aria-label="Open sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>
              <Link href="/" className="flex items-center space-x-2 group">
                <Newspaper className="w-5 h-5 text-[var(--accent-primary)] transition-transform group-hover:scale-105" />
                <span className="font-headline text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  {userTitle}
                </span>
              </Link>
            <span className="text-[var(--border-subtle)]">•</span>
            <span className="text-xs font-serif italic text-[var(--text-secondary)]">
              The Historical Editions Archive
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-sans">
            <Link
              href="/"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Today&apos;s Edition</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[var(--accent-subtle)] hover:opacity-90 text-[var(--accent-text)] border border-[var(--accent-border)] transition-colors font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Learning Brain</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] py-8 px-4 sm:px-6 no-print">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-[var(--accent-primary)]">
            Broadsheet Registry • {editions.length} Archived Issues
          </span>
          <h1 className="font-headline text-4xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight mt-1 mb-2">
            The Morning Archives
          </h1>
          <p className="font-serif italic text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto">
            Every daily broadsheet is preserved with its original wire headlines, takeaways, and intellectual calibration.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full ${selectedEdition ? 'no-print' : ''}`}>
        {editions.length === 0 ? (
          <div className="text-center py-16 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-8">
            <BookOpen className="w-12 h-12 text-[var(--accent-primary)] mx-auto mb-3" />
            <h2 className="font-headline text-2xl font-bold text-[var(--text-primary)]">
              Your Archive is Currently Empty
            </h2>
            <p className="font-serif text-[var(--text-muted)] mt-2 max-w-md mx-auto text-sm">
              Snapshot today&apos;s morning edition from the front page to build your permanent historical library.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 bg-[var(--accent-primary)] hover:opacity-90 text-white rounded text-xs font-bold"
            >
              <span>Go to Today&apos;s Live Edition</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {editions.map((edition) => (
              <div
                key={edition.id}
                onClick={() => setSelectedEdition(edition)}
                className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] rounded-lg transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-xs cursor-pointer p-6 group"
              >
                <div>
                  {/* Edition & Date Bar */}
                  <div className="flex items-center justify-between text-xs font-sans pb-3 border-b border-[var(--border-subtle)] mb-4">
                    <span className="font-bold text-[var(--text-primary)] tracking-wider">
                      {edition.editionNumber || 'DAILY BROADSHEET'}
                    </span>
                    <span className="text-[var(--text-muted)] font-serif italic">
                      {edition.dateStr}
                    </span>
                  </div>

                  {/* Title & Masthead Name */}
                  <div className="text-[10px] font-sans uppercase tracking-[0.2em] text-[var(--accent-primary)] font-bold mb-1">
                    {edition.title || userTitle}
                  </div>
                  <h3 className="font-headline text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-tight mb-3 group-hover:text-[var(--accent-primary)] transition-colors">
                    {edition.leadHeadline || (edition.articles[0] ? edition.articles[0].title : 'Morning Edition')}
                  </h3>

                  {/* 3 Key Takeaways preview if available */}
                  {edition.takeaways && edition.takeaways.length > 0 && (
                    <div className="my-3 p-3 bg-[var(--bg-surface-elevated)] border-l-2 border-[var(--accent-primary)] rounded-r text-xs font-serif text-[var(--text-secondary)] space-y-1.5">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[var(--accent-primary)] block">
                        Key Takeaways:
                      </span>
                      {edition.takeaways.slice(0, 2).map((takeaway, idx) => (
                        <p key={idx} className="line-clamp-2">
                          • {takeaway}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Articles count & topics */}
                  <div className="flex items-center space-x-2 text-xs font-sans text-[var(--text-muted)] mt-2">
                    <span className="font-medium text-[var(--text-primary)]">
                      {edition.articlesCount || edition.articles?.length || 0} stories
                    </span>
                    <span>•</span>
                    <span className="capitalize">
                      {edition.preferencesSnapshot?.selectedTopics?.slice(0, 2).join(', ')}
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-[var(--border-subtle)] mt-5 flex items-center justify-between">
                  <span className="text-xs font-sans font-semibold text-[var(--accent-primary)] flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Read Issue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => handlePrintEdition(e, edition)}
                      className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors"
                      title="Print or Save PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(edition.id, e)}
                      className="p-1.5 rounded text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Delete from archive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FULL READ MODAL */}
      {selectedEdition && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 print:relative print:p-0 print:bg-white print:overflow-visible">
          <div className="bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:max-w-none print:text-black">
            {/* Modal Top Bar */}
            <div className="p-4 sm:p-6 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-elevated)] no-print">
              <div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[var(--accent-primary)]">
                  {selectedEdition.editionNumber || 'HISTORICAL EDITION'} • {selectedEdition.dateStr}
                </span>
                <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-0.5">
                  {selectedEdition.title || userTitle}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={(e) => handlePrintEdition(e, selectedEdition)}
                  className="px-3 py-1.5 bg-[var(--text-primary)] text-[var(--bg-page)] hover:opacity-90 rounded text-xs font-sans font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Broadsheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEdition(null)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print-Only Archival Broadsheet Masthead */}
            <div className="print-only hidden print:block mb-6 pb-4 border-b-2 border-black font-serif p-4">
              <div className="flex items-center justify-between border-b border-black pb-1 mb-2 text-xs font-sans font-bold uppercase tracking-widest text-black">
                <span>DAYMARK HISTORICAL ARCHIVE</span>
                <span>{selectedEdition.dateStr}</span>
                <span>{selectedEdition.editionNumber || 'DAILY BROADSHEET'}</span>
              </div>
              <div className="text-center py-2">
                <h1 className="font-headline text-4xl font-black uppercase tracking-tight text-black">
                  {selectedEdition.title || userTitle}
                </h1>
                <p className="text-sm font-serif italic text-black mt-1">
                  {selectedEdition.leadHeadline || 'Preserved Edition'}
                </p>
                <div className="text-xs font-mono text-black mt-2">
                  {selectedEdition.articles?.length || 0} Archived Stories Preserved
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Takeaways banner if present */}
              {selectedEdition.takeaways && selectedEdition.takeaways.length > 0 && (
                <div className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] p-5 rounded">
                  <h3 className="font-headline text-base font-bold text-[var(--text-primary)] mb-2 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
                    <span>Executive Summary & Takeaways</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-serif text-[var(--text-secondary)]">
                    {selectedEdition.takeaways.map((item, idx) => (
                      <div key={idx} className="p-3 bg-[var(--bg-surface)] rounded border border-[var(--border-subtle)]">
                        <span className="font-bold text-[var(--accent-primary)] block mb-1">
                          Takeaway #{idx + 1}
                        </span>
                        <p className="leading-snug">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Articles Grid */}
              <div className="space-y-4">
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-1">
                  Preserved Wire Reports ({selectedEdition.articles?.length || 0})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedEdition.articles?.map((article, idx) => (
                    <div
                      key={article.id || idx}
                      className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-sans text-[var(--text-muted)] mb-1">
                          <span className="uppercase font-semibold text-[var(--accent-primary)]">
                            {article.category}
                          </span>
                          <span>Via {article.source?.name}</span>
                        </div>
                        <h4 className="font-headline text-lg font-bold text-[var(--text-primary)] leading-snug mb-2">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--accent-primary)] transition-colors"
                          >
                            {article.title}
                          </a>
                        </h4>
                        <p className="font-serif text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                          {article.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[var(--border-subtle)] mt-3 flex items-center justify-between text-[11px] font-sans">
                        <span className="text-[var(--text-muted)]">
                          {article.readTimeMinutes} min read
                        </span>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent-primary)] font-semibold flex items-center space-x-1 hover:underline"
                        >
                          <span>Original Source</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-4 bg-[var(--bg-surface)] text-center text-xs font-serif text-[var(--text-muted)] no-print">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center items-center gap-4 text-xs">
          <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">
            Page Directory
          </Link>
          <span>•</span>
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
            Today&apos;s Broadsheet
          </Link>
          <span>•</span>
          <Link href="/archive" className="hover:text-[var(--text-primary)] transition-colors font-bold text-[var(--accent-primary)]">
            Archive
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
          Daymark — Historical Archives Preserved Locally • Client-Side Sovereignty
        </p>
      </footer>
      </div>
    </div>
  );
}
