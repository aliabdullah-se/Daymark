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
  Menu,
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
import AppSidebar from '@/components/AppSidebar';

export default function ProfileLearningPage() {
  const [preferences, setPreferences] = useState<UserPreferences>(getStoredPreferences);
  const [feedback, setFeedback] = useState<UserFeedback>(getStoredFeedback);
  const [signals, setSignals] = useState<LearningSignal[]>([]);
  const [userTitle, setUserTitle] = useState('DAYMARK');
  const [userName, setUserName] = useState('Reader');
  const [suggestedInterests, setSuggestedInterests] = useState<SuggestedInterest[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const prefs = getStoredPreferences();
    const fb = getStoredFeedback();
    const sigs = getLearningSignals();
    const user = getCurrentUser();

    setPreferences(prefs);
    setFeedback(fb);
    setSignals(sigs);
    const rawTitle = user?.paperTitle || prefs.newspaperTitle || 'DAYMARK';
    setUserTitle(
      rawTitle.toUpperCase().includes('BROADSIDE') ||
        rawTitle.toUpperCase().includes('DISPATCH') ||
        rawTitle.toUpperCase().includes('MORNING CHRONICLE')
        ? 'DAYMARK'
        : rawTitle
    );
    setUserName(user?.name || prefs.readerName || 'Reader');

    // Fetch live AI suggested interests from server database
    fetch(`/api/ai/learn?userId=${user?.id || 'demo-reader'}`)
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
      articleTitle: `Added Inferred Lens: ${topic}`,
      topic: category,
      impactDescription: `Expanded morning reading lenses to prioritize "${topic}" across tomorrow's front page.`,
    });

    setFeedbackMsg(`Added "${topic}" to your morning desks!`);
    setTimeout(() => setFeedbackMsg(null), 3000);

    try {
      const activeUser = getCurrentUser();
      await fetch('/api/ai/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'accept',
          userId: activeUser?.id || 'demo-reader',
          topic,
        }),
      });
    } catch (e) {
      console.warn('Sync suggestion accept error:', e);
    }
  };

  const handleDismissSuggestion = async (topic: string) => {
    setSuggestedInterests((prev) =>
      prev.map((s) => (s.topic.toLowerCase() === topic.toLowerCase() ? { ...s, dismissed: true } : s))
    );

    setFeedbackMsg(`Dismissed recommendation for "${topic}".`);
    setTimeout(() => setFeedbackMsg(null), 3000);

    try {
      const activeUser = getCurrentUser();
      await fetch('/api/ai/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'dismiss',
          userId: activeUser?.id || 'demo-reader',
          topic,
        }),
      });
    } catch (e) {
      console.warn('Sync suggestion dismiss error:', e);
    }
  };

  // Compute live algorithmic weights for each of the 8 desks
  const topicWeights = AVAILABLE_TOPICS.map((topic) => {
    const isSelected = preferences.selectedTopics.includes(topic.id);
    const affinity = feedback.topicAffinities[topic.id] || 0;
    const baseWeight = isSelected ? 65 : 15;
    const computed = Math.min(Math.max(Math.round(baseWeight + affinity * 7), 5), 100);

    return {
      ...topic,
      isSelected,
      affinity,
      weightPct: computed,
    };
  }).sort((a, b) => b.weightPct - a.weightPct);

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex font-sans transition-colors duration-200">
      {/* Persistent Left Sidebar for Desktop & Mobile Slide-over Drawer */}
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex-1 min-w-0 flex flex-col justify-between lg:pl-64">
        {/* Top Hairline */}
        <div className="h-1 bg-[var(--accent-primary)] w-full" />

        {/* Header */}
        <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
                aria-label="Open sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>
              <Link href="/" className="flex items-center space-x-2 group">
                <Newspaper className="w-5 h-5 text-[var(--accent-primary)] transition-transform group-hover:scale-105" />
                <span className="font-headline text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  {userTitle}
                </span>
              </Link>
            <span className="text-[var(--border-subtle)]">•</span>
            <span className="text-xs font-serif italic text-[var(--text-secondary)]">
              The Learning Brain & Recommendation Profile
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-sans">
            <Link
              href="/"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Today&apos;s Edition</span>
            </Link>
            <Link
              href="/onboarding"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[var(--accent-primary)] hover:opacity-90 text-white transition-opacity font-bold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Calibrate Lenses</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Strip */}
      <div className="bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[var(--accent-primary)] mb-1">
              <Brain className="w-4 h-4" />
              <span>Algorithmic Transparency Engine</span>
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              Editorial Learning Brain for {userName}
            </h1>
            <p className="font-serif italic text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
              Daymark uses a transparent, deterministic ranking model. Every thumbs-up, skip, and clipping directly adjusts tomorrow&apos;s broadsheet without black-box tracking.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-3">
            <div className="text-center px-3 border-r border-[var(--border-subtle)]">
              <span className="text-xl font-headline font-bold text-[var(--accent-primary)] block">
                {feedback.likedArticleIds?.length || 0}
              </span>
              <span className="text-[10px] font-sans text-[var(--text-muted)] uppercase tracking-wider">
                Upvoted
              </span>
            </div>
            <div className="text-center px-3 border-r border-[var(--border-subtle)]">
              <span className="text-xl font-headline font-bold text-red-500 block">
                {feedback.skippedArticleIds?.length || 0}
              </span>
              <span className="text-[10px] font-sans text-[var(--text-muted)] uppercase tracking-wider">
                Skipped
              </span>
            </div>
            <div className="text-center px-3">
              <span className="text-xl font-headline font-bold text-[var(--text-primary)] block">
                {feedback.savedArticleIds?.length || 0}
              </span>
              <span className="text-[10px] font-sans text-[var(--text-muted)] uppercase tracking-wider">
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
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-5">
                <div>
                  <h2 className="font-headline text-xl font-bold text-[var(--text-primary)] flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-[var(--accent-primary)]" />
                    <span>Dynamic Topic Weights</span>
                  </h2>
                  <p className="text-xs font-serif italic text-[var(--text-muted)] mt-0.5">
                    How likely each desk is to appear on your front page.
                  </p>
                </div>
                <Link
                  href="/onboarding"
                  className="text-xs font-sans text-[var(--accent-primary)] hover:underline font-semibold"
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
                        <span className="font-bold text-[var(--text-primary)]">
                          {topic.label}
                        </span>
                        {topic.isSelected && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-[var(--accent-subtle)] text-[var(--accent-text)] rounded border border-[var(--accent-border)] font-medium">
                            Core Desk
                          </span>
                        )}
                        {topic.affinity > 0 && (
                          <span className="text-[10px] text-[var(--accent-primary)] font-serif italic">
                            +{topic.affinity * 10}% boost
                          </span>
                        )}
                        {topic.affinity < 0 && (
                          <span className="text-[10px] text-red-500 font-serif italic">
                            {topic.affinity * 10}% penalty
                          </span>
                        )}
                      </div>
                      <span className="font-headline font-bold text-[var(--text-primary)]">
                        {topic.weightPct}%
                      </span>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full bg-[var(--border-subtle)] h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-[var(--accent-primary)]"
                        style={{ width: `${topic.weightPct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TOMORROW'S FORECAST BOX */}
            <div className="bg-[var(--accent-subtle)] border border-[var(--accent-border)] rounded-lg p-6">
              <div className="flex items-center space-x-2 text-xs font-sans font-bold uppercase tracking-wider text-[var(--accent-text)] mb-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Tomorrow&apos;s Broadsheet Forecast</span>
              </div>
              <p className="font-serif text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                Based on your {feedback.likedArticleIds?.length || 0} upvotes and {feedback.skippedArticleIds?.length || 0} skipped stories, tomorrow&apos;s morning wire will allocate prime front-page positioning to <span className="font-bold text-[var(--text-primary)]">{topicWeights[0]?.label}</span> and <span className="font-bold text-[var(--text-primary)]">{topicWeights[1]?.label}</span>, while reducing secondary lifestyle and opinion stories.
              </p>
              <div className="flex items-center text-xs font-sans text-[var(--accent-text)] font-medium space-x-1">
                <span>Next morning broadsheet ready at:</span>
                <span className="font-bold">6:00 AM Local Time</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE LENSES & SIGNALS TIMELINE */}
          <div className="lg:col-span-5 space-y-6">
            {/* REAL-TIME AI INFERRED INTERESTS */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
                <h3 className="font-headline text-lg font-bold text-[var(--text-primary)] flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span>Real-Time AI Inferred Desks</span>
                </h3>
                <span className="text-[10px] font-mono bg-[var(--accent-subtle)] text-[var(--accent-text)] px-2 py-0.5 rounded font-semibold border border-[var(--accent-border)]">
                  Live Adaptive Matrix
                </span>
              </div>

              {feedbackMsg && (
                <div className="mb-4 p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs rounded flex items-center gap-1.5 font-sans font-medium">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{feedbackMsg}</span>
                </div>
              )}

              {suggestedInterests.filter((s) => !s.dismissed).length === 0 ? (
                <p className="text-xs font-serif italic text-[var(--text-muted)] py-3 text-center">
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
                        className={`p-3 border rounded-lg transition-colors ${
                          sug.accepted
                            ? 'bg-[var(--accent-subtle)] border-[var(--accent-border)]'
                            : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-sans mb-1">
                          <span className="font-mono font-bold text-[var(--accent-primary)] bg-[var(--bg-surface)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                            {sug.confidence}% Match
                          </span>
                          <span className="text-[var(--text-muted)] font-serif italic">{sug.category}</span>
                        </div>
                        <h4 className="font-headline text-sm font-bold text-[var(--text-primary)] mb-1">
                          {sug.topic}
                        </h4>
                        <p className="font-serif text-xs text-[var(--text-secondary)] leading-relaxed mb-2.5">
                          {sug.reason}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs font-sans">
                          {sug.accepted ? (
                            <span className="text-[var(--accent-primary)] font-bold flex items-center gap-1 text-[11px]">
                              <Check className="w-3.5 h-3.5" />
                              Active in Your Morning Paper
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAcceptSuggestion(sug.topic, sug.category)}
                                className="px-2.5 py-1 bg-[var(--accent-primary)] hover:opacity-90 text-white rounded font-bold text-[11px] flex items-center gap-1 transition-opacity cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                Add to Daily Paper
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDismissSuggestion(sug.topic)}
                                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[11px] transition-colors cursor-pointer"
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
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
                <h3 className="font-headline text-lg font-bold text-[var(--text-primary)] flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span>Prioritized Keyword Lenses</span>
                </h3>
                <Link
                  href="/onboarding"
                  className="text-xs font-sans text-[var(--accent-primary)] hover:underline font-semibold"
                >
                  Edit
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {preferences.customInterests.length === 0 ? (
                  <p className="text-xs font-serif italic text-[var(--text-muted)]">
                    No custom keywords active.
                  </p>
                ) : (
                  preferences.customInterests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center px-2.5 py-1 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-serif italic"
                    >
                      #{interest}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* REAL-TIME LEARNING SIGNALS LOG */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
                <h3 className="font-headline text-lg font-bold text-[var(--text-primary)] flex items-center space-x-1.5">
                  <Activity className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span>Recent Learning Signals</span>
                </h3>
                <span className="text-[10px] font-sans uppercase tracking-wider text-[var(--text-muted)] font-medium">
                  Deterministic Log
                </span>
              </div>

              {signals.length === 0 ? (
                <p className="text-xs font-serif italic text-[var(--text-muted)] py-4 text-center">
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
                        className="p-3 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] font-sans">
                          <span
                            className={`font-bold uppercase tracking-wider ${
                              sig.type === 'upvote'
                                ? 'text-[var(--accent-primary)]'
                                : sig.type === 'skip' || sig.type === 'downvote'
                                ? 'text-red-500'
                                : sig.type === 'save'
                                ? 'text-amber-500'
                                : 'text-[var(--accent-primary)]'
                            }`}
                          >
                            {sig.type === 'upvote' && '▲ Upvoted'}
                            {sig.type === 'skip' && '✕ Skipped Story'}
                            {sig.type === 'downvote' && '▼ Downvoted'}
                            {sig.type === 'save' && '🔖 Saved Clipping'}
                            {sig.type === 'calibrate' && '⚙️ Calibrated'}
                          </span>
                          <span className="text-[var(--text-muted)] font-serif italic">{timeStr}</span>
                        </div>
                        <p className="font-headline font-semibold text-[var(--text-primary)] text-xs line-clamp-1">
                          {sig.articleTitle}
                        </p>
                        <p className="font-serif text-[11px] text-[var(--text-secondary)] leading-snug">
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
      <footer className="border-t border-[var(--border-subtle)] py-4 bg-[var(--bg-surface)] text-center text-xs font-serif text-[var(--text-muted)]">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center items-center gap-4 text-xs">
          <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">
            Page Directory
          </Link>
          <span>•</span>
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
            Today&apos;s Broadsheet
          </Link>
          <span>•</span>
          <Link href="/archive" className="hover:text-[var(--text-primary)] transition-colors">
            Archive
          </Link>
          <span>•</span>
          <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">
            About Us
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
            Privacy Policy
          </Link>
        </div>
        <p className="mt-2 text-[11px] text-[var(--text-muted)]">
          Daymark — Zero Black-Box Tracking • 100% Deterministic Curation
        </p>
      </footer>
      </div>
    </div>
  );
}
