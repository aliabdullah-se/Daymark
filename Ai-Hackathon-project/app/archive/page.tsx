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
} from 'lucide-react';
import { SavedEdition, Article } from '@/types/news';
import { getStoredEditions, deleteStoredEdition, getCurrentUser, getStoredPreferences } from '@/lib/storage';

export default function ArchivePage() {
  const [editions, setEditions] = useState<SavedEdition[]>([]);
  const [selectedEdition, setSelectedEdition] = useState<SavedEdition | null>(null);
  const [userTitle, setUserTitle] = useState('DAYMARK');

  useEffect(() => {
    const loaded = getStoredEditions();
    setEditions(loaded);
    const prefs = getStoredPreferences();
    const user = getCurrentUser();
    setUserTitle(user?.paperTitle || prefs.newspaperTitle || 'DAYMARK');
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

  const handlePrintEdition = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.print();
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col justify-between text-charcoal-900 font-sans selection:bg-forest-100 selection:text-forest-900">
      {/* Top Hairline */}
      <div className="h-1.5 bg-forest-700 w-full" />

      {/* Header */}
      <header className="border-b border-ivory-300 bg-ivory-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <Newspaper className="w-5 h-5 text-forest-700 transition-transform group-hover:scale-105" />
              <span className="font-headline text-2xl font-bold tracking-tight text-charcoal-900">
                {userTitle}
              </span>
            </Link>
            <span className="text-ivory-400">•</span>
            <span className="text-xs font-serif italic text-charcoal-600">
              The Historical Editions Archive
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-sans">
            <Link
              href="/"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-ivory-200/80 hover:bg-ivory-300 text-charcoal-800 transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Today&apos;s Edition</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-200 transition-colors font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-forest-600" />
              <span>Learning Brain</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-ivory-50 border-b border-ivory-200 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-forest-700">
            Broadsheet Registry • {editions.length} Archived Issues
          </span>
          <h1 className="font-headline text-4xl sm:text-5xl font-black text-charcoal-900 tracking-tight mt-1 mb-2">
            The Morning Archives
          </h1>
          <p className="font-serif italic text-sm sm:text-base text-charcoal-600 max-w-2xl mx-auto">
            Every daily broadsheet is preserved with its original wire headlines, takeaways, and intellectual calibration.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {editions.length === 0 ? (
          <div className="text-center py-16 bg-white border border-ivory-300 rounded p-8">
            <BookOpen className="w-12 h-12 text-forest-600 mx-auto mb-3" />
            <h2 className="font-headline text-2xl font-bold text-charcoal-900">
              Your Archive is Currently Empty
            </h2>
            <p className="font-serif text-charcoal-600 mt-2 max-w-md mx-auto text-sm">
              Snapshot today&apos;s morning edition from the front page to build your permanent historical library.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded text-xs font-semibold"
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
                className="bg-white border border-ivory-300 hover:border-charcoal-400 rounded transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-xs cursor-pointer p-6 group"
              >
                <div>
                  {/* Edition & Date Bar */}
                  <div className="flex items-center justify-between text-xs font-sans pb-3 border-b border-ivory-200 mb-4">
                    <span className="font-bold text-charcoal-800 tracking-wider">
                      {edition.editionNumber || 'DAILY BROADSHEET'}
                    </span>
                    <span className="text-charcoal-500 font-serif italic">
                      {edition.dateStr}
                    </span>
                  </div>

                  {/* Title & Masthead Name */}
                  <div className="text-[10px] font-sans uppercase tracking-[0.2em] text-forest-700 font-bold mb-1">
                    {edition.title || userTitle}
                  </div>
                  <h3 className="font-headline text-xl sm:text-2xl font-bold text-charcoal-900 leading-tight mb-3 group-hover:text-forest-700 transition-colors">
                    {edition.leadHeadline || (edition.articles[0] ? edition.articles[0].title : 'Morning Dispatch')}
                  </h3>

                  {/* 3 Key Takeaways preview if available */}
                  {edition.takeaways && edition.takeaways.length > 0 && (
                    <div className="my-3 p-3 bg-ivory-50 border-l-2 border-forest-600 rounded-r text-xs font-serif text-charcoal-700 space-y-1.5">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-forest-800 block">
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
                  <div className="flex items-center space-x-2 text-xs font-sans text-charcoal-500 mt-2">
                    <span className="font-medium text-charcoal-700">
                      {edition.articlesCount || edition.articles?.length || 0} stories
                    </span>
                    <span>•</span>
                    <span className="capitalize">
                      {edition.preferencesSnapshot?.selectedTopics?.slice(0, 2).join(', ')}
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-ivory-200 mt-5 flex items-center justify-between">
                  <span className="text-xs font-sans font-semibold text-forest-700 flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Read Issue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        setSelectedEdition(edition);
                        handlePrintEdition(e);
                      }}
                      className="p-1.5 rounded text-charcoal-500 hover:text-charcoal-900 hover:bg-ivory-100 transition-colors"
                      title="Print or Save PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(edition.id, e)}
                      className="p-1.5 rounded text-charcoal-400 hover:text-red-700 hover:bg-red-50 transition-colors"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-ivory-100 border border-ivory-300 rounded shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Top Bar */}
            <div className="p-4 sm:p-6 border-b border-ivory-300 flex items-center justify-between bg-ivory-50">
              <div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-forest-700">
                  {selectedEdition.editionNumber || 'HISTORICAL EDITION'} • {selectedEdition.dateStr}
                </span>
                <h2 className="font-headline text-2xl sm:text-3xl font-bold text-charcoal-900 mt-0.5">
                  {selectedEdition.title || userTitle}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-charcoal-900 text-ivory-50 hover:bg-black rounded text-xs font-sans font-medium flex items-center space-x-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Broadsheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEdition(null)}
                  className="p-1.5 text-charcoal-400 hover:text-charcoal-900 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {/* Takeaways banner if present */}
              {selectedEdition.takeaways && selectedEdition.takeaways.length > 0 && (
                <div className="bg-white border border-ivory-300 p-5 rounded">
                  <h3 className="font-headline text-base font-bold text-charcoal-900 mb-2 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-forest-600" />
                    <span>Executive Summary & Takeaways</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-serif text-charcoal-700">
                    {selectedEdition.takeaways.map((item, idx) => (
                      <div key={idx} className="p-3 bg-ivory-50 rounded border border-ivory-200">
                        <span className="font-bold text-forest-800 block mb-1">
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
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-charcoal-500 border-b border-ivory-300 pb-1">
                  Preserved Wire Reports ({selectedEdition.articles?.length || 0})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedEdition.articles?.map((article, idx) => (
                    <div
                      key={article.id || idx}
                      className="bg-white border border-ivory-200 rounded p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-sans text-charcoal-500 mb-1">
                          <span className="uppercase font-semibold text-forest-700">
                            {article.category}
                          </span>
                          <span>Via {article.source?.name}</span>
                        </div>
                        <h4 className="font-headline text-lg font-bold text-charcoal-900 leading-snug mb-2">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-forest-700 transition-colors"
                          >
                            {article.title}
                          </a>
                        </h4>
                        <p className="font-serif text-xs text-charcoal-600 leading-relaxed line-clamp-3">
                          {article.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-ivory-100 mt-3 flex items-center justify-between text-[11px] font-sans">
                        <span className="text-charcoal-500">
                          {article.readTimeMinutes} min read
                        </span>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-forest-700 font-semibold flex items-center space-x-1 hover:underline"
                        >
                          <span>Original Source</span>
                          <ExternalLink className="w-3 h-3" />
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
      <footer className="border-t border-ivory-300 py-4 bg-ivory-50 text-center text-[11px] font-sans text-charcoal-500">
        <p>Daymark — Historical Archives Preserved Locally • NaSCon &apos;26</p>
      </footer>
    </div>
  );
}
