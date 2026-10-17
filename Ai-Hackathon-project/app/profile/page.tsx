'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Brain,
  Sparkles,
  ArrowLeft,
  SlidersHorizontal,
  ThumbsUp,
  ThumbsDown,
  X,
  Bookmark,
  Calendar,
  Activity,
  Layers,
  Compass,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Newspaper,
  Plus,
  Check,
} from 'lucide-react';
import { AVAILABLE_TOPICS, NewsTopic, UserFeedback, UserPreferences, LearningSignal, SuggestedInterest } from '@/types/news';
import {
  getStoredPreferences,
  getStoredFeedback,
  getLearningSignals,
  getCurrentUser,
  saveStoredFeedback,
  saveStoredPreferences,
  addLearningSignal,
} from '@/lib/storage';

export default function ProfileLearningPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(getStoredPreferences);
  const [feedback, setFeedback] = useState<UserFeedback>(getStoredFeedback);
  const [signals, setSignals] = useState<LearningSignal[]>([]);
  const [userTitle, setUserTitle] = useState('DAYMARK');
  const [userName, setUserName] = useState('Reader');
  const [suggestedInterests, setSuggestedInterests] = useState<SuggestedInterest[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    const prefs = getStoredPreferences();
    const fb = getStoredFeedback();
    const sigs = getLearningSignals();
    const user = getCurrentUser();

    setPreferences(prefs);
    setFeedback(fb);
    setSignals(sigs);
    setUserTitle(user?.paperTitle || prefs.newspaperTitle || 'DAYMARK');
    setUserName(user?.name || prefs.readerName || 'Reader');

    // Fetch live AI suggested interests from server database
    fetch(`/api/ai/learn?userId=${user?.id || 'judge-nascon-2026'}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.suggestions) {
          setSuggestedInterests(data.suggestions);
        }
      })
      .catch(() => {});
  }, []);

  const handleAcceptSuggestion = async (topic: string, category: NewsTopic | string = 'technology') => {
    const current = preferences.customInterests || [];
    if (!current.includes(topic)) {
      const updatedPrefs = { ...preferences, customInterests: [...current, topic] };
      setPreferences(updatedPrefs);
      saveStoredPreferences(updatedPrefs);
    }

    setSuggestedInterests((prev) =>
      prev.map((s) => (s.topic.toLowerCase() === topic.toLowerCase() ? { ...s, accepted: true } : s))
    );

    addLearningSignal({
      type: 'calibrate',
      articleTitle: `Adopted AI Topic: ${topic}`,
      topic: category,
      impactDescription: `Integrated AI-discovered interest "${topic}" into morning paper desks.`,
    });

    setFeedbackMsg(`Added "${topic}" to your morning paper desks!`);
    setTimeout(() => setFeedbackMsg(null), 3000);

    try {
      await fetch('/api/ai/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'accept', topic }),
      });
    } catch {}
  };

  const handleDismissSuggestion = async (topic: string) => {
    setSuggestedInterests((prev) =>
      prev.map((s) => (s.topic.toLowerCase() === topic.toLowerCase() ? { ...s, dismissed: true } : s))
    );

    try {
      await fetch('/api/ai/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'dismiss', topic }),
      });
    } catch {}
  };

  // Compute calculated topic weights (0 - 100%)
  const topicWeights = AVAILABLE_TOPICS.map((topic) => {
    const isSelected = preferences.selectedTopics.includes(topic.id);
    const affinity = feedback.topicAffinities[topic.id] || 0; // -5 to +5
    // Base 50% for selected, 15% for unselected, +/- affinity * 8%
    const base = isSelected ? 60 : 20;
    const computed = Math.min(Math.max(Math.round(base + affinity * 8), 5), 98);

    return {
      ...topic,
      isSelected,
      affinity,
      weightPct: computed,
    };
  }).sort((a, b) => b.weightPct - a.weightPct);

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
              The Learning Brain & Recommendation Profile
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
              href="/onboarding"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-forest-700 hover:bg-forest-800 text-white transition-colors font-semibold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Calibrate Lenses</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Strip */}
      <div className="bg-ivory-50 border-b border-ivory-200 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-forest-700 mb-1">
              <Brain className="w-4 h-4" />
              <span>Algorithmic Transparency Engine</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-charcoal-900">
              Editorial Learning Brain for {userName}
            </h1>
            <p className="font-serif italic text-xs sm:text-sm text-charcoal-600 mt-1 max-w-2xl">
              Daymark uses a transparent, deterministic ranking model. Every thumbs-up, skip, and clipping directly adjusts tomorrow&apos;s broadsheet without black-box tracking.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white border border-ivory-300 rounded p-3">
            <div className="text-center px-3 border-r border-ivory-200">
              <span className="text-xl font-headline font-bold text-forest-800 block">
                {feedback.likedArticleIds?.length || 0}
              </span>
              <span className="text-[10px] font-sans text-charcoal-500 uppercase tracking-wider">
                Upvoted
              </span>
            </div>
            <div className="text-center px-3 border-r border-ivory-200">
              <span className="text-xl font-headline font-bold text-red-700 block">
                {feedback.skippedArticleIds?.length || 0}
              </span>
              <span className="text-[10px] font-sans text-charcoal-500 uppercase tracking-wider">
                Skipped
              </span>
            </div>
            <div className="text-center px-3">
              <span className="text-xl font-headline font-bold text-charcoal-900 block">
                {feedback.savedArticleIds?.length || 0}
              </span>
              <span className="text-[10px] font-sans text-charcoal-500 uppercase tracking-wider">
                Clippings
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: DYNAMIC TOPIC WEIGHTS */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-ivory-300 rounded p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-ivory-200 pb-3 mb-5">
                <div>
                  <h2 className="font-headline text-xl font-bold text-charcoal-900 flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-forest-700" />
                    <span>Dynamic Topic Weights</span>
                  </h2>
                  <p className="text-xs font-serif italic text-charcoal-500 mt-0.5">
                    How likely each desk is to appear on your front page.
                  </p>
                </div>
                <Link
                  href="/onboarding"
                  className="text-xs font-sans text-forest-700 hover:underline font-semibold"
                >
                  Adjust Sections →
                </Link>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4">
                {topicWeights.map((topic) => (
                  <div key={topic.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-charcoal-900">
                          {topic.label}
                        </span>
                        {topic.isSelected && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-forest-50 text-forest-700 rounded border border-forest-100 font-medium">
                            Core Desk
                          </span>
                        )}
                        {topic.affinity > 0 && (
                          <span className="text-[10px] text-forest-700 font-serif italic">
                            +{topic.affinity * 10}% boost
                          </span>
                        )}
                        {topic.affinity < 0 && (
                          <span className="text-[10px] text-red-600 font-serif italic">
                            {topic.affinity * 10}% penalty
                          </span>
                        )}
                      </div>
                      <span className="font-headline font-bold text-charcoal-900">
                        {topic.weightPct}%
                      </span>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full bg-ivory-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          topic.weightPct > 70
                            ? 'bg-forest-600'
                            : topic.weightPct > 40
                            ? 'bg-charcoal-700'
                            : 'bg-ivory-400'
                        }`}
                        style={{ width: `${topic.weightPct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TOMORROW'S FORECAST BOX */}
            <div className="bg-forest-50/70 border border-forest-200 rounded p-6">
              <div className="flex items-center space-x-2 text-xs font-sans font-bold uppercase tracking-wider text-forest-900 mb-2">
                <Sparkles className="w-4 h-4 text-forest-700" />
                <span>Tomorrow&apos;s Broadsheet Forecast</span>
              </div>
              <p className="font-serif text-sm text-charcoal-800 leading-relaxed mb-3">
                Based on your {feedback.likedArticleIds?.length || 0} upvotes and {feedback.skippedArticleIds?.length || 0} skipped stories, tomorrow&apos;s morning wire will allocate prime front-page positioning to <span className="font-bold">{topicWeights[0]?.label}</span> and <span className="font-bold">{topicWeights[1]?.label}</span>, while reducing lifestyle and opinion dispatches.
              </p>
              <div className="flex items-center text-xs font-sans text-forest-800 font-medium space-x-1">
                <span>Next morning broadsheet ready at:</span>
                <span className="font-bold">6:00 AM Local Time</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE LENSES & SIGNALS TIMELINE */}
          <div className="lg:col-span-5 space-y-6">
            {/* REAL-TIME AI INFERRED INTERESTS */}
            <div className="bg-white border border-ivory-300 rounded p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-ivory-200 pb-3 mb-4">
                <h3 className="font-headline text-lg font-bold text-charcoal-900 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-forest-700" />
                  <span>Real-Time AI Inferred Desks</span>
                </h3>
                <span className="text-[10px] font-mono bg-forest-100 text-forest-800 px-2 py-0.5 rounded font-semibold">
                  Live Adaptive Matrix
                </span>
              </div>

              {feedbackMsg && (
                <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-1.5 font-sans font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{feedbackMsg}</span>
                </div>
              )}

              {suggestedInterests.filter((s) => !s.dismissed).length === 0 ? (
                <p className="text-xs font-serif italic text-charcoal-400 py-3 text-center">
                  All AI recommendations processed. Interact with more stories to trigger new discoveries!
                </p>
              ) : (
                <div className="space-y-3">
                  {suggestedInterests
                    .filter((s) => !s.dismissed)
                    .slice(0, 4)
                    .map((sug) => (
                      <div
                        key={sug.id}
                        className={`p-3 border rounded transition-colors ${
                          sug.accepted
                            ? 'bg-forest-50/60 border-forest-300'
                            : 'bg-ivory-50/70 border-ivory-200 hover:border-ivory-400'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-sans mb-1">
                          <span className="font-mono font-bold text-forest-700 bg-white px-1.5 py-0.5 rounded border border-ivory-200">
                            {sug.confidence}% Match
                          </span>
                          <span className="text-charcoal-500 font-serif italic">{sug.category}</span>
                        </div>
                        <h4 className="font-headline text-sm font-bold text-charcoal-900 mb-1">
                          {sug.topic}
                        </h4>
                        <p className="font-serif text-xs text-charcoal-600 leading-relaxed mb-2.5">
                          {sug.reason}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-ivory-200 text-xs font-sans">
                          {sug.accepted ? (
                            <span className="text-forest-700 font-bold flex items-center gap-1 text-[11px]">
                              <Check className="w-3.5 h-3.5" />
                              Active in Your Morning Paper
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAcceptSuggestion(sug.topic, sug.category)}
                                className="px-2.5 py-1 bg-forest-700 hover:bg-forest-800 text-white rounded font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                Add to Daily Paper
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDismissSuggestion(sug.topic)}
                                className="text-charcoal-400 hover:text-charcoal-700 text-[11px] transition-colors cursor-pointer"
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Active Keywords */}
            <div className="bg-white border border-ivory-300 rounded p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-ivory-200 pb-3 mb-4">
                <h3 className="font-headline text-lg font-bold text-charcoal-900 flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-forest-700" />
                  <span>Prioritized Keyword Lenses</span>
                </h3>
                <Link
                  href="/onboarding"
                  className="text-xs font-sans text-forest-700 hover:underline font-semibold"
                >
                  Edit
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {preferences.customInterests.length === 0 ? (
                  <p className="text-xs font-serif italic text-charcoal-400">
                    No custom keywords active.
                  </p>
                ) : (
                  preferences.customInterests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center px-2.5 py-1 rounded bg-ivory-100 border border-ivory-300 text-charcoal-800 text-xs font-serif italic"
                    >
                      #{interest}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* REAL-TIME LEARNING SIGNALS LOG */}
            <div className="bg-white border border-ivory-300 rounded p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-ivory-200 pb-3 mb-4">
                <h3 className="font-headline text-lg font-bold text-charcoal-900 flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-forest-700" />
                  <span>Recent Learning Signals</span>
                </h3>
                <span className="text-[10px] font-sans uppercase tracking-wider text-charcoal-400 font-medium">
                  Deterministic Log
                </span>
              </div>

              {signals.length === 0 ? (
                <p className="text-xs font-serif italic text-charcoal-400 py-4 text-center">
                  No interaction signals captured yet. Like or skip articles on the front page to generate signals!
                </p>
              ) : (
                <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                  {signals.slice(0, 10).map((sig) => {
                    const date = new Date(sig.timestamp);
                    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div
                        key={sig.id}
                        className="p-3 bg-ivory-50/80 border border-ivory-200 rounded text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] font-sans">
                          <span
                            className={`font-bold uppercase tracking-wider ${
                              sig.type === 'upvote'
                                ? 'text-forest-700'
                                : sig.type === 'skip' || sig.type === 'downvote'
                                ? 'text-red-700'
                                : sig.type === 'save'
                                ? 'text-charcoal-900'
                                : 'text-blue-700'
                            }`}
                          >
                            {sig.type === 'upvote' && '▲ Upvoted'}
                            {sig.type === 'skip' && '✕ Skipped Story'}
                            {sig.type === 'downvote' && '▼ Downvoted'}
                            {sig.type === 'save' && '🔖 Saved Clipping'}
                            {sig.type === 'calibrate' && '⚙️ Calibrated'}
                          </span>
                          <span className="text-charcoal-400 font-serif italic">{timeStr}</span>
                        </div>
                        <p className="font-headline font-semibold text-charcoal-900 text-xs line-clamp-1">
                          {sig.articleTitle}
                        </p>
                        <p className="font-serif text-[11px] text-charcoal-600 leading-snug">
                          {sig.impactDescription}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-ivory-300 py-4 bg-ivory-50 text-center text-[11px] font-sans text-charcoal-500">
        <p>Daymark — Zero Black-Box Tracking • 100% Deterministic Curation • NaSCon &apos;26</p>
      </footer>
    </div>
  );
}
