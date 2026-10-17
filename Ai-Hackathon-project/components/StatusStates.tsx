'use client';

import React from 'react';
import { RotateCw, AlertTriangle, FilterX, Sparkles, BookOpen } from 'lucide-react';

export function LoadingNewspaper() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <RotateCw className="w-8 h-8 mx-auto text-editorial-crimson animate-spin mb-3" />
        <h3 className="font-headline text-xl font-bold text-ink-900">
          Typesetting Your Morning Edition...
        </h3>
        <p className="font-serif italic text-xs text-ink-600 mt-1">
          Fetching live wires from BBC, The New York Times, NPR, and Ars Technica, scoring by your custom interests...
        </p>
      </div>

      {/* Broadsheet Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
        {/* Main Column Skeleton */}
        <div className="lg:col-span-8 space-y-6">
          <div className="h-6 bg-paper-200 rounded w-1/4"></div>
          <div className="h-12 bg-paper-200 rounded w-3/4"></div>
          <div className="h-64 bg-paper-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-paper-200 rounded w-full"></div>
            <div className="h-4 bg-paper-200 rounded w-5/6"></div>
            <div className="h-4 bg-paper-200 rounded w-4/6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="h-48 bg-paper-200 rounded"></div>
            <div className="h-48 bg-paper-200 rounded"></div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="lg:col-span-4 space-y-4">
          <div className="h-6 bg-paper-200 rounded w-1/2"></div>
          <div className="h-24 bg-paper-200 rounded"></div>
          <div className="h-24 bg-paper-200 rounded"></div>
          <div className="h-24 bg-paper-200 rounded"></div>
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
    <div className="max-w-md mx-auto my-16 p-8 text-center bg-white/60 border border-paper-300 rounded-lg shadow-sm">
      <FilterX className="w-12 h-12 mx-auto text-ink-400 mb-3" />
      <h3 className="font-headline text-xl font-bold text-ink-900 mb-2">
        No Stories In This Section
      </h3>
      <p className="font-serif text-xs text-ink-600 mb-5 leading-relaxed">
        All stories for this filter may have been read or skipped, or your custom interest filters might be overly specific.
      </p>
      <div className="flex items-center justify-center space-x-3">
        <button
          onClick={onResetFilters}
          className="px-4 py-2 bg-paper-200 hover:bg-paper-300 text-ink-800 rounded text-xs font-sans font-medium transition-colors"
        >
          View All Topics
        </button>
        <button
          onClick={onOpenPreferences}
          className="px-4 py-2 bg-ink-900 hover:bg-black text-white rounded text-xs font-sans font-medium transition-colors"
        >
          Curate Interests
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
    <div className="max-w-md mx-auto my-16 p-8 text-center bg-red-50/70 border border-red-200 rounded-lg shadow-sm">
      <AlertTriangle className="w-12 h-12 mx-auto text-editorial-crimson mb-3" />
      <h3 className="font-headline text-xl font-bold text-ink-900 mb-2">
        Morning Wire Interruption
      </h3>
      <p className="font-serif text-xs text-ink-700 mb-5 leading-relaxed">
        {error || 'Unable to retrieve live public feeds at this moment. The wire service might be undergoing maintenance.'}
      </p>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 bg-editorial-crimson hover:bg-red-900 text-white rounded text-xs font-sans font-semibold transition-colors inline-flex items-center space-x-2"
      >
        <RotateCw className="w-3.5 h-3.5" />
        <span>Reconnect Wire Service</span>
      </button>
    </div>
  );
}
