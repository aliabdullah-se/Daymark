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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150 no-print">
      <div 
        className="w-full max-w-md bg-[var(--bg-surface)] text-[var(--text-primary)] h-full shadow-2xl border-l border-[var(--border-subtle)] flex flex-col transition-colors duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-drawer-title"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-surface-elevated)]">
          <div className="flex items-center space-x-2.5">
            <Newspaper className="w-5 h-5 text-[var(--accent-primary)]" />
            <h3 id="archive-drawer-title" className="font-headline text-lg font-bold text-[var(--text-primary)]">
              Daymark Editions Archive
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
            aria-label="Close archive"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status bar */}
        <div className="px-5 py-3 bg-[var(--bg-surface-subtle)] border-b border-[var(--border-subtle)] flex items-center justify-between text-xs font-sans">
          {activeEditionId ? (
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
              <span className="font-semibold text-[var(--text-primary)]">Archived Issue Loaded</span>
              <button
                onClick={onResetToLive}
                className="text-[var(--accent-primary)] underline ml-1 hover:opacity-80 font-medium cursor-pointer"
              >
                Return to Live Wire
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
              <span className="font-medium text-[var(--text-secondary)]">Viewing Live Morning Paper</span>
            </div>
          )}
          <button
            onClick={onSaveCurrent}
            className="px-2.5 py-1 bg-[var(--text-primary)] text-[var(--bg-page)] rounded text-[11px] font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            + Save Issue
          </button>
        </div>

        {/* Editions List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {editions.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)] font-serif">
              <BookOpen className="w-10 h-10 mx-auto text-[var(--border-subtle)] mb-2" />
              <p className="font-bold text-[var(--text-primary)]">No saved editions yet</p>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
                Snapshot today&apos;s morning paper to revisit headlines, articles, and your reading list later.
              </p>
              <button
                onClick={onSaveCurrent}
                className="mt-4 px-4 py-2 bg-[var(--accent-primary)] text-white rounded text-xs font-sans font-bold hover:opacity-90 cursor-pointer"
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
                  className={`p-3.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-[var(--accent-subtle)] border-[var(--accent-primary)] shadow-xs'
                      : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-sans text-[var(--text-muted)] mb-1">
                    <span className="flex items-center font-medium text-[var(--accent-primary)]">
                      <Calendar className="w-3 h-3 mr-1" />
                      {ed.dateStr}
                    </span>
                    <span>{ed.articlesCount} stories</span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[var(--text-primary)] line-clamp-2 leading-snug mb-1">
                    {ed.leadHeadline || 'Morning Edition Headlines'}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs font-sans mt-2">
                    <button
                      onClick={() => {
                        onSelectEdition(ed);
                        onClose();
                      }}
                      className="inline-flex items-center space-x-1 text-[var(--accent-primary)] font-semibold hover:underline cursor-pointer"
                    >
                      <span>{isSelected ? 'Currently Viewing' : 'Read Edition'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteEdition(ed.id)}
                      className="text-[var(--text-muted)] hover:text-red-500 p-1 transition-colors cursor-pointer"
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
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-center text-xs font-serif text-[var(--text-muted)]">
          Saved locally in browser storage • Free PKR 0 archive
        </div>
      </div>
    </div>
  );
}
