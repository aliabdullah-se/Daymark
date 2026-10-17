'use client';

import React from 'react';
import { X, Sparkles, CheckCircle2, Clock, ThumbsUp, Compass, Target } from 'lucide-react';
import { ScoredArticle } from '@/lib/ranking';
import { UserPreferences } from '@/types/news';

interface WhyThisModalProps {
  article: ScoredArticle | null;
  onClose: () => void;
  preferences: UserPreferences;
}

export default function WhyThisModal({ article, onClose, preferences }: WhyThisModalProps) {
  if (!article) return null;

  const breakdown = article.scoreBreakdown || {
    topicScore: 20,
    keywordScore: 16,
    recencyScore: 16,
    paceScore: 10,
    feedbackScore: 0,
    total: article.relevanceScore || 85,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-paper-50 border-2 border-ink-900 rounded-lg shadow-2xl max-w-lg w-full p-6 md:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="why-this-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-paper-300">
          <div>
            <div className="flex items-center space-x-2 text-editorial-crimson font-serif font-bold text-xs uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Transparent Curation Logic</span>
            </div>
            <h3 id="why-this-title" className="text-xl font-headline font-bold text-ink-900 mt-1">
              Why this story was ranked for you
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-ink-500 hover:text-ink-900 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Article Summary */}
        <div className="py-3 border-b border-paper-200">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-editorial-navy">
            {article.source.name} • {article.category.toUpperCase()}
          </span>
          <h4 className="text-sm font-serif font-bold text-ink-900 leading-snug mt-0.5">
            {article.title}
          </h4>
        </div>

        {/* Big Score Header */}
        <div className="my-4 p-4 bg-paper-100 rounded-md border border-paper-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-sans text-ink-600 block">Personal Relevance Score</span>
            <span className="text-sm font-serif italic text-ink-800">{article.rankingReason}</span>
          </div>
          <div className="text-right">
            <span className="text-3xl font-headline font-black text-editorial-crimson">
              {breakdown.total}%
            </span>
            <span className="text-[10px] font-mono text-ink-500 block uppercase">Match Quality</span>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="space-y-3 py-2 text-xs font-sans">
          {/* Topic Match */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-editorial-navy" />
              <div>
                <span className="font-semibold text-ink-900">Topic Alignment ({article.category})</span>
                <span className="text-[11px] text-ink-500 block">
                  {preferences.selectedTopics.includes(article.category)
                    ? 'Active subscription in your preferences'
                    : 'Discovered from general editorial wire'}
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-ink-900">+{breakdown.topicScore} pts</span>
          </div>

          {/* Keywords Match */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-editorial-crimson" />
              <div>
                <span className="font-semibold text-ink-900">Custom Interests Match</span>
                <span className="text-[11px] text-ink-500 block">
                  {article.matchedKeywords && article.matchedKeywords.length > 0
                    ? `Matched: "${article.matchedKeywords.join('", "')}"`
                    : 'No specific keyword match; broad topic relevancy'}
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-ink-900">+{breakdown.keywordScore} pts</span>
          </div>

          {/* Recency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-700" />
              <div>
                <span className="font-semibold text-ink-900">Morning Freshness (Recency)</span>
                <span className="text-[11px] text-ink-500 block">
                  Published {new Date(article.publishedAt).toLocaleDateString()} at{' '}
                  {new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-ink-900">+{breakdown.recencyScore} pts</span>
          </div>

          {/* Pace Alignment */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-editorial-olive" />
              <div>
                <span className="font-semibold text-ink-900">Reading Pace Alignment</span>
                <span className="text-[11px] text-ink-500 block">
                  {article.readTimeMinutes} min read fits your &quot;{preferences.readingPace}&quot; pacing
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-ink-900">+{breakdown.paceScore} pts</span>
          </div>

          {/* Feedback adjustment */}
          {breakdown.feedbackScore !== 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ThumbsUp className="w-4 h-4 text-ink-700" />
                <div>
                  <span className="font-semibold text-ink-900">User Interaction Affinity</span>
                  <span className="text-[11px] text-ink-500 block">Feedback from your previous votes</span>
                </div>
              </div>
              <span className={`font-mono font-bold ${breakdown.feedbackScore > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {breakdown.feedbackScore > 0 ? `+${breakdown.feedbackScore}` : breakdown.feedbackScore} pts
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-paper-300 mt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-ink-900 text-white rounded text-xs font-sans font-medium hover:bg-black transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
