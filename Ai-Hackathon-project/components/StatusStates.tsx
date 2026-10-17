'use client';

import React from 'react';
import { RotateCw, AlertTriangle, FilterX } from 'lucide-react';

export function LoadingNewspaper() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <RotateCw className="w-7 h-7 mx-auto text-forest-600 animate-spin mb-3" />
        <h3 className="font-headline text-2xl font-normal italic text-charcoal-900">
          Curating Your Morning Dispatch...
        </h3>
        <p className="font-serif italic text-xs sm:text-sm text-charcoal-600 mt-1 max-w-md mx-auto">
          Gathering live reporting from BBC News, The New York Times, Ars Technica, and NPR, calibrated to your personal lenses.
        </p>
      </div>

      {/* Broadsheet Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
        {/* Main Column Skeleton */}
        <div className="lg:col-span-8 space-y-6">
          <div className="h-4 bg-ivory-300 rounded w-1/4"></div>
          <div className="h-14 bg-ivory-300 rounded w-4/5"></div>
          <div className="h-72 bg-ivory-300 rounded"></div>
          <div className="space-y-2">
            <div className="h-3.5 bg-ivory-300 rounded w-full"></div>
            <div className="h-3.5 bg-ivory-300 rounded w-5/6"></div>
            <div className="h-3.5 bg-ivory-300 rounded w-3/4"></div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="lg:col-span-4 space-y-4">
          <div className="h-4 bg-ivory-300 rounded w-1/2"></div>
          <div className="h-28 bg-ivory-300 rounded"></div>
          <div className="h-28 bg-ivory-300 rounded"></div>
          <div className="h-28 bg-ivory-300 rounded"></div>
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
    <div className="max-w-md mx-auto my-16 p-8 text-center bg-ivory-100 border border-ivory-300 rounded-lg shadow-xs">
      <FilterX className="w-10 h-10 mx-auto text-charcoal-400 mb-3" />
      <h3 className="font-headline text-xl font-bold text-charcoal-900 mb-2">
        No Stories In This Section
      </h3>
      <p className="font-serif italic text-xs text-charcoal-600 mb-5 leading-relaxed">
        All stories for this section may have been read or dismissed, or your custom interest lenses may be overly restrictive.
      </p>
      <div className="flex items-center justify-center space-x-3">
        <button
          onClick={onResetFilters}
          className="px-4 py-2 bg-ivory-200 hover:bg-ivory-300 text-charcoal-800 rounded text-xs font-sans font-medium transition-colors"
        >
          View All Topics
        </button>
        <button
          onClick={onOpenPreferences}
          className="px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white rounded text-xs font-sans font-medium transition-colors"
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
    <div className="max-w-md mx-auto my-16 p-8 text-center bg-ivory-100 border border-terracotta-500/30 rounded-lg shadow-xs">
      <AlertTriangle className="w-10 h-10 mx-auto text-terracotta-600 mb-3" />
      <h3 className="font-headline text-xl font-bold text-charcoal-900 mb-2">
        Live Wire Interruption
      </h3>
      <p className="font-serif italic text-xs text-charcoal-700 mb-5 leading-relaxed">
        {error || 'Unable to retrieve live public feeds at this moment. The wire connection timed out or is unreachable.'}
      </p>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 bg-forest-600 hover:bg-forest-700 text-white rounded text-xs font-sans font-medium transition-colors inline-flex items-center space-x-2"
      >
        <RotateCw className="w-3.5 h-3.5" />
        <span>Reconnect Wire Service</span>
      </button>
    </div>
  );
}
