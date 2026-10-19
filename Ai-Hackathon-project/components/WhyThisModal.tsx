'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, Clock, ThumbsUp, Compass, Target, BrainCircuit } from 'lucide-react';
import { ScoredArticle } from '@/lib/ranking';
import { UserPreferences } from '@/types/news';
import { fetchGeminiExplanation, getGeminiApiKey } from '@/lib/gemini';

interface WhyThisModalProps {
  article: ScoredArticle | null;
  onClose: () => void;
  preferences: UserPreferences;
}

export default function WhyThisModal({ article, onClose, preferences }: WhyThisModalProps) {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  useEffect(() => {
    if (article) {
      setAiAnalysis(null);
      setIsAiLoading(true);

      fetchGeminiExplanation(article, preferences)
        .then((res) => {
          setAiAnalysis(res.text);
          setIsAiGenerated(res.isAiGenerated);
        })
        .finally(() => {
          setIsAiLoading(false);
        });
    }
  }, [article, preferences]);

  if (!article) return null;

  const breakdown = article.scoreBreakdown || {
    topicScore: 20,
    keywordScore: 16,
    recencyScore: 16,
    paceScore: 10,
    feedbackScore: 0,
    total: article.relevanceScore || 85,
  };

  const hasKey = !!getGeminiApiKey();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 no-print">
      <div 
        className="bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg shadow-2xl max-w-lg w-full p-6 sm:p-7 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="why-this-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center space-x-1.5 text-[var(--accent-primary)] font-sans font-semibold text-[11px] uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Transparent Curation Logic</span>
            </div>
            <h3 id="why-this-title" className="text-xl font-headline font-bold text-[var(--text-primary)] mt-1">
              Why this story was ranked for you
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Article Summary */}
        <div className="py-3 border-b border-[var(--border-subtle)]">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[var(--accent-primary)]">
            {article.source.name} • {article.category.toUpperCase()}
          </span>
          <h4 className="text-sm font-serif font-bold text-[var(--text-primary)] leading-snug mt-0.5">
            {article.title}
          </h4>
        </div>

        {/* AI Editorial Analysis Banner */}
        <div className="my-3.5 p-3.5 bg-[var(--accent-subtle)] border border-[var(--accent-border)] rounded text-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-sans font-bold uppercase tracking-wider text-[var(--accent-text)]">
            <span className="flex items-center space-x-1">
              <BrainCircuit className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>{isAiGenerated ? 'Gemini 1.5 Flash Editorial Lens' : 'Editorial Curator Analysis'}</span>
            </span>
            {hasKey && (
              <span className="text-[10px] bg-[var(--accent-border)] text-[var(--accent-text)] px-1.5 py-0.2 rounded font-mono font-bold">
                AI Active
              </span>
            )}
          </div>
          <p className="font-serif text-[var(--text-primary)] italic leading-relaxed">
            {isAiLoading ? 'Analyzing intellectual alignment...' : aiAnalysis}
          </p>
        </div>

        {/* Big Score Header */}
        <div className="my-3 p-4 bg-[var(--bg-surface-elevated)] rounded-md border border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <span className="text-xs font-sans text-[var(--text-muted)] block">Personal Relevance Score</span>
            <span className="text-sm font-serif italic text-[var(--text-secondary)]">{article.rankingReason}</span>
          </div>
          <div className="text-right">
            <span className="text-3xl font-headline font-black text-[var(--accent-primary)]">
              {breakdown.total}%
            </span>
            <span className="text-[10px] font-mono text-[var(--text-muted)] block uppercase">Match Quality</span>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="space-y-3 py-2 text-xs font-sans">
          {/* Topic Match */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-[var(--accent-primary)]" />
              <div>
                <span className="font-semibold text-[var(--text-primary)]">Topic Alignment ({article.category})</span>
                <span className="text-[11px] text-[var(--text-muted)] block">
                  {preferences.selectedTopics.includes(article.category)
                    ? 'Active focus desk in your preferences'
                    : 'Discovered from general editorial wire'}
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-[var(--text-primary)]">+{breakdown.topicScore} pts</span>
          </div>

          {/* Keywords Match */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-[var(--accent-primary)]" />
              <div>
                <span className="font-semibold text-[var(--text-primary)]">Custom Intellectual Lenses</span>
                <span className="text-[11px] text-[var(--text-muted)] block">
                  {article.matchedKeywords && article.matchedKeywords.length > 0
                    ? `Matched: ${article.matchedKeywords.join(', ')}`
                    : 'No specific keywords matched; scored by topic'}
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-[var(--text-primary)]">+{breakdown.keywordScore} pts</span>
          </div>

          {/* Recency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[var(--accent-primary)]" />
              <div>
                <span className="font-semibold text-[var(--text-primary)]">Morning Freshness Decay</span>
                <span className="text-[11px] text-[var(--text-muted)] block">
                  Published {new Date(article.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-[var(--text-primary)]">+{breakdown.recencyScore} pts</span>
          </div>

          {/* Reading Pace */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[var(--accent-primary)]" />
              <div>
                <span className="font-semibold text-[var(--text-primary)]">Reading Pace Alignment</span>
                <span className="text-[11px] text-[var(--text-muted)] block">
                  {article.readTimeMinutes} min read fits your &quot;{preferences.readingPace}&quot; pacing
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-[var(--text-primary)]">+{breakdown.paceScore} pts</span>
          </div>

          {/* Feedback adjustment */}
          {breakdown.feedbackScore !== 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ThumbsUp className="w-4 h-4 text-[var(--text-muted)]" />
                <div>
                  <span className="font-semibold text-[var(--text-primary)]">User Interaction Affinity</span>
                  <span className="text-[11px] text-[var(--text-muted)] block">Feedback from your previous votes</span>
                </div>
              </div>
              <span className={`font-mono font-bold ${breakdown.feedbackScore > 0 ? 'text-[var(--accent-primary)]' : 'text-red-500'}`}>
                {breakdown.feedbackScore > 0 ? `+${breakdown.feedbackScore}` : breakdown.feedbackScore} pts
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[var(--border-subtle)] mt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-page)] rounded text-xs font-sans font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
