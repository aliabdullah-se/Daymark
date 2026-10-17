'use client';

import React from 'react';
import { X, Calendar, Newspaper, Trash2, ArrowRight, BookOpen } from 'lucide-react';
import { SavedEdition } from '@/types/news';

interface SavedEditionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editions: SavedEdition[];
  onSelectEdition: (edition: SavedEdition) => void;
  onDeleteEdition: (id: string) => void;
  onSaveCurrent: () => void;
  activeEditionId?: string | null;
  onResetToLive: () => void;
}

export default function SavedEditionsDrawer({
  isOpen,
  onClose,
  editions,
  onSelectEdition,
  onDeleteEdition,
  onSaveCurrent,
  activeEditionId,
  onResetToLive,
}: SavedEditionsDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-charcoal-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-ivory-100 h-full shadow-2xl border-l border-ivory-300 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-drawer-title"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-ivory-300 flex items-center justify-between bg-ivory-50">
          <div className="flex items-center space-x-2">
            <Newspaper className="w-5 h-5 text-forest-700" />
            <h3 id="archive-drawer-title" className="font-headline text-lg font-bold text-charcoal-900">
              Daymark Editions Archive
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-charcoal-400 hover:text-charcoal-800 transition-colors"
            aria-label="Close archive"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status bar */}
        <div className="px-5 py-3 bg-ivory-200/60 border-b border-ivory-300 flex items-center justify-between text-xs font-sans">
          {activeEditionId ? (
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse" />
              <span className="font-semibold text-charcoal-900">Archived Edition Loaded</span>
              <button
                onClick={onResetToLive}
                className="text-forest-700 underline ml-1 hover:text-forest-900 font-medium"
              >
                Return to Live Wire
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-forest-600" />
              <span className="font-medium text-charcoal-700">Currently viewing Live Edition</span>
            </div>
          )}
          <button
            onClick={onSaveCurrent}
            className="px-2.5 py-1 bg-charcoal-900 hover:bg-black text-ivory-50 rounded text-[11px] font-medium transition-colors"
          >
            + Save Issue
          </button>
        </div>

        {/* Editions List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {editions.length === 0 ? (
            <div className="text-center py-12 text-charcoal-500 font-serif">
              <BookOpen className="w-10 h-10 mx-auto text-ivory-400 mb-2" />
              <p className="font-bold text-charcoal-800">No saved editions yet</p>
              <p className="text-xs text-charcoal-500 mt-1 max-w-xs mx-auto">
                Snapshot today&apos;s morning paper to revisit headlines, articles, and your reading list later.
              </p>
              <button
                onClick={onSaveCurrent}
                className="mt-4 px-4 py-2 bg-charcoal-900 text-ivory-50 rounded text-xs font-sans font-medium"
              >
                Save Today&apos;s Edition
              </button>
            </div>
          ) : (
            editions.map((ed) => {
              const isSelected = activeEditionId === ed.id;
              return (
                <div
                  key={ed.id}
                  className={`p-3.5 rounded border transition-all ${
                    isSelected
                      ? 'bg-forest-50 border-forest-600 shadow-2xs'
                      : 'bg-ivory-50/80 border-ivory-300 hover:border-ivory-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-sans text-charcoal-500 mb-1">
                    <span className="flex items-center font-medium text-forest-700">
                      <Calendar className="w-3 h-3 mr-1" />
                      {ed.dateStr}
                    </span>
                    <span>{ed.articlesCount} stories</span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-charcoal-900 line-clamp-2 leading-snug mb-1">
                    {ed.leadHeadline || 'Morning Edition Headlines'}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-ivory-200 text-xs font-sans mt-2">
                    <button
                      onClick={() => {
                        onSelectEdition(ed);
                        onClose();
                      }}
                      className="inline-flex items-center space-x-1 text-forest-700 font-semibold hover:underline"
                    >
                      <span>{isSelected ? 'Currently Viewing' : 'Read Edition'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteEdition(ed.id)}
                      className="text-charcoal-400 hover:text-terracotta-600 p-1 transition-colors"
                      title="Delete saved edition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-ivory-300 bg-ivory-50 text-center text-xs font-serif text-charcoal-500">
          Saved offline to browser storage
        </div>
      </div>
    </div>
  );
}
