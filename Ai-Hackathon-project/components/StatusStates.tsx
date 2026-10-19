'use client';

import React from 'react';
import { RotateCw, AlertTriangle, FilterX } from 'lucide-react';

export function LoadingNewspaper() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 no-print">
      <div className="text-center mb-10">
        <RotateCw className="w-7 h-7 mx-auto text-[var(--accent-primary)] animate-spin mb-3" />
        <h3 className="font-headline text-2xl font-normal italic text-[var(--text-primary)]">
          Curating Your Morning Edition...
        </h3>
        <p className="font-serif italic text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-md mx-auto">
          Gathering live reporting from BBC News, The New York Times, Ars Technica, and NPR, calibrated to your personal lenses.
        </p>
      </div>

      {/* Broadsheet Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
        {/* Main Column Skeleton */}
        <div className="lg:col-span-8 space-y-6">
          <div className="h-4 bg-[var(--border-subtle)] rounded w-1/4" />
          <div className="h-14 bg-[var(--border-subtle)] rounded w-4/5" />
          <div className="h-72 bg-[var(--border-subtle)] rounded" />
          <div className="space-y-2">
            <div className="h-3.5 bg-[var(--border-subtle)] rounded w-full" />
            <div className="h-3.5 bg-[var(--border-subtle)] rounded w-5/6" />
            <div className="h-3.5 bg-[var(--border-subtle)] rounded w-3/4" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="lg:col-span-4 space-y-4">
          <div className="h-4 bg-[var(--border-subtle)] rounded w-1/2" />
          <div className="h-28 bg-[var(--border-subtle)] rounded" />
          <div className="h-28 bg-[var(--border-subtle)] rounded" />
          <div className="h-28 bg-[var(--border-subtle)] rounded" />
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  onResetFilters: () => void;
  onOpenPreferences: () => void;
}

export function EmptyState({ onResetFilters, onOpenPreferences }: EmptyStateProps) {
  return (
    <div className="max-w-md mx-auto my-16 p-8 text-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg shadow-xs no-print">
      <FilterX className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-3" />
      <h3 className="font-headline text-xl font-bold text-[var(--text-primary)] mb-2">
        No Stories In This Section
      </h3>
      <p className="font-serif italic text-xs text-[var(--text-muted)] mb-5 leading-relaxed">
        All stories for this section may have been read or dismissed, or your custom interest lenses may be overly restrictive.
      </p>
      <div className="flex items-center justify-center space-x-3">
        <button
          onClick={onResetFilters}
          className="px-4 py-2 bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded text-xs font-sans font-medium transition-colors cursor-pointer"
        >
          View All Topics
        </button>
        <button
          onClick={onOpenPreferences}
          className="px-4 py-2 bg-[var(--accent-primary)] hover:opacity-90 text-white rounded text-xs font-sans font-bold transition-opacity cursor-pointer"
        >
          Adjust Lenses
        </button>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="max-w-md mx-auto my-16 p-8 text-center bg-[var(--bg-surface)] border border-red-500/30 rounded-lg shadow-xs no-print">
      <AlertTriangle className="w-10 h-10 mx-auto text-red-500 mb-3" />
      <h3 className="font-headline text-xl font-bold text-[var(--text-primary)] mb-2">
        Live Wire Interruption
      </h3>
      <p className="font-serif italic text-xs text-[var(--text-secondary)] mb-5 leading-relaxed">
        {error || 'Unable to retrieve live public feeds at this moment. The wire connection timed out or is unreachable.'}
      </p>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 bg-[var(--accent-primary)] hover:opacity-90 text-white rounded text-xs font-sans font-bold transition-opacity inline-flex items-center space-x-2 cursor-pointer"
      >
        <RotateCw className="w-3.5 h-3.5" />
        <span>Reconnect Wire Service</span>
      </button>
    </div>
  );
}
