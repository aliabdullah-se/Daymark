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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-ivory-100 border border-ivory-300 rounded-lg shadow-2xl max-w-lg w-full p-6 sm:p-7 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="why-this-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-ivory-300">
          <div>
            <div className="flex items-center space-x-1.5 text-forest-700 font-sans font-semibold text-[11px] uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Transparent Curation Logic</span>
            </div>
            <h3 id="why-this-title" className="text-xl font-headline font-bold text-charcoal-900 mt-1">
              Why this story was ranked for you
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-charcoal-400 hover:text-charcoal-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Article Summary */}
        <div className="py-3 border-b border-ivory-200">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-forest-700">
            {article.source.name} • {article.category.toUpperCase()}
          </span>
          <h4 className="text-sm font-serif font-bold text-charcoal-900 leading-snug mt-0.5">
            {article.title}
          </h4>
        </div>

        {/* AI Editorial Analysis Banner */}
        <div className="my-3.5 p-3.5 bg-forest-50/80 border border-forest-200 rounded text-xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-sans font-bold uppercase tracking-wider text-forest-800">
            <span className="flex items-center space-x-1">
              <BrainCircuit className="w-3.5 h-3.5 text-forest-600" />
              <span>{isAiGenerated ? 'Gemini 1.5 Flash Editorial Lens' : 'Editorial Curator Analysis'}</span>
            </span>
            {hasKey && (
              <span className="text-[10px] bg-forest-100 text-forest-700 px-1.5 py-0.2 rounded font-mono">
                AI Active
              </span>
            )}
          </div>
          <p className="font-serif text-charcoal-800 italic leading-relaxed">
            {isAiLoading ? 'Analyzing intellectual alignment...' : aiAnalysis}
          </p>
        </div>

        {/* Big Score Header */}
        <div className="my-3 p-4 bg-ivory-200/60 rounded-md border border-ivory-300 flex items-center justify-between">
          <div>
            <span className="text-xs font-sans text-charcoal-500 block">Personal Relevance Score</span>
            <span className="text-sm font-serif italic text-charcoal-800">{article.rankingReason}</span>
          </div>
          <div className="text-right">
            <span className="text-3xl font-headline font-black text-forest-700">
              {breakdown.total}%
            </span>
            <span className="text-[10px] font-mono text-charcoal-400 block uppercase">Match Quality</span>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="space-y-3 py-2 text-xs font-sans">
          {/* Topic Match */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-forest-700" />
              <div>
                <span className="font-semibold text-charcoal-900">Topic Alignment ({article.category})</span>
                <span className="text-[11px] text-charcoal-500 block">
                  {preferences.selectedTopics.includes(article.category)
                    ? 'Active focus desk in your preferences'
                    : 'Discovered from general editorial wire'}
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-charcoal-900">+{breakdown.topicScore} pts</span>
          </div>

          {/* Keywords Match */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-forest-700" />
              <div>
                <span className="font-semibold text-charcoal-900">Custom Intellectual Lenses</span>
                <span className="text-[11px] text-charcoal-500 block">
                  {article.matchedKeywords && article.matchedKeywords.length > 0
                    ? `Matched: ${article.matchedKeywords.join(', ')}`
                    : 'No specific keywords matched; scored by topic'}
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-charcoal-900">+{breakdown.keywordScore} pts</span>
          </div>

          {/* Recency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-forest-700" />
              <div>
                <span className="font-semibold text-charcoal-900">Morning Freshness Decay</span>
                <span className="text-[11px] text-charcoal-500 block">
                  Published {new Date(article.publishedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-charcoal-900">+{breakdown.recencyScore} pts</span>
          </div>

          {/* Reading Pace */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-forest-600" />
              <div>
                <span className="font-semibold text-charcoal-900">Reading Pace Alignment</span>
                <span className="text-[11px] text-charcoal-500 block">
                  {article.readTimeMinutes} min read fits your &quot;{preferences.readingPace}&quot; pacing
                </span>
              </div>
            </div>
            <span className="font-mono font-bold text-charcoal-900">+{breakdown.paceScore} pts</span>
          </div>

          {/* Feedback adjustment */}
          {breakdown.feedbackScore !== 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ThumbsUp className="w-4 h-4 text-charcoal-700" />
                <div>
                  <span className="font-semibold text-charcoal-900">User Interaction Affinity</span>
                  <span className="text-[11px] text-charcoal-500 block">Feedback from your previous votes</span>
                </div>
              </div>
              <span className={`font-mono font-bold ${breakdown.feedbackScore > 0 ? 'text-forest-700' : 'text-red-700'}`}>
                {breakdown.feedbackScore > 0 ? `+${breakdown.feedbackScore}` : breakdown.feedbackScore} pts
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-ivory-300 mt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-charcoal-900 text-ivory-50 rounded text-xs font-sans font-medium hover:bg-black transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
