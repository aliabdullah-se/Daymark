'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Article, UserPreferences, UserFeedback, SavedEdition, NewsTopic, DEFAULT_PREFERENCES, AVAILABLE_TOPICS, UserAccount } from '@/types/news';
import { rankArticles, ScoredArticle } from '@/lib/ranking';
import {
  getStoredPreferences,
  saveStoredPreferences,
  getStoredFeedback,
  saveStoredFeedback,
  getStoredEditions,
  saveCurrentEdition,
  deleteStoredEdition,
  INITIAL_FEEDBACK,
  getCurrentUser,
  logoutUser,
  addLearningSignal,
} from '@/lib/storage';
import Masthead from '@/components/Masthead';
import ArticleCard from '@/components/ArticleCard';
import SectionBlock from '@/components/SectionBlock';
import OnboardingModal from '@/components/OnboardingModal';
import WhyThisModal from '@/components/WhyThisModal';
import SavedEditionsDrawer from '@/components/SavedEditionsDrawer';
import PrintPreviewModal from '@/components/PrintPreviewBanner';
import { LoadingNewspaper, EmptyState, ErrorState } from '@/components/StatusStates';
import { Sparkles, Bookmark, Search, RotateCcw, Clock, Quote, Printer, ShieldCheck, Compass, ExternalLink } from 'lucide-react';

export default function MorningChroniclePage() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [feedback, setFeedback] = useState<UserFeedback>(INITIAL_FEEDBACK);
  const [savedEditions, setSavedEditions] = useState<SavedEdition[]>([]);
  const [rawArticles, setRawArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Modals & Navigation state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isEditionsOpen, setIsEditionsOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [whyThisArticle, setWhyThisArticle] = useState<ScoredArticle | null>(null);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<NewsTopic | 'all'>('all');
  const [activeEdition, setActiveEdition] = useState<SavedEdition | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Load persisted user state on mount
  useEffect(() => {
    const loadedPrefs = getStoredPreferences();
    const loadedFeedback = getStoredFeedback();
    const loadedEditions = getStoredEditions();
    const user = getCurrentUser();

    setPreferences(loadedPrefs);
    setFeedback(loadedFeedback);
    setSavedEditions(loadedEditions);
    setCurrentUser(user);

    // If user has never onboarded, show onboarding prompt
    if (!loadedPrefs.onboarded) {
      setIsOnboardingOpen(true);
    }
  }, []);

  const handleSignOut = () => {
    logoutUser();
    setCurrentUser(null);
    showToast('Signed out of subscriber account');
  };

  // Fetch live articles from API
  const fetchNews = useCallback(async (topicsToFetch?: NewsTopic[]) => {
    try {
      setError(null);
      const url = topicsToFetch && topicsToFetch.length > 0
        ? `/api/news?topics=${topicsToFetch.join(',')}`
        : '/api/news';

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load wire feed (status ${res.status})`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.articles)) {
        setRawArticles(data.articles);
      } else {
        throw new Error(data.error || 'Invalid wire response');
      }
    } catch (err: any) {
      console.error('Fetch news error:', err);
      setError(err?.message || 'Could not connect to live wire');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNews(preferences.selectedTopics);
  }, [fetchNews, preferences.selectedTopics]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNews(preferences.selectedTopics);
    showToast('Live wire updated with latest reports');
  };

  // Ranking calculation
  const rankedArticles: ScoredArticle[] = useMemo(() => {
    // If viewing an archived edition snapshot
    const sourceList = activeEdition ? activeEdition.articles : rawArticles;
    const ranked = rankArticles(sourceList, preferences, feedback, false);

    // Filter by topic if active
    let filtered = ranked;
    if (selectedTopicFilter !== 'all') {
      filtered = filtered.filter((a) => a.category === selectedTopicFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
      );
    }

    // Filter by bookmarks only
    if (showBookmarksOnly) {
      filtered = filtered.filter((a) => feedback.savedArticleIds.includes(a.id));
    }

    return filtered;
  }, [activeEdition, rawArticles, preferences, feedback, selectedTopicFilter, searchQuery, showBookmarksOnly]);

  // Lead, Secondary, and Wire splits
  const leadArticle = rankedArticles[0] || null;
  const secondaryArticles = rankedArticles.slice(1, 5);
  const wireBriefs = rankedArticles.slice(5, 12);
  const sectionRemaining = rankedArticles.slice(12);

  // Synthesize Today's 3 Key Takeaways
  const keyTakeaways = useMemo(() => {
    return rankedArticles.slice(0, 3).map((art, idx) => {
      const shortSummary = art.description.length > 130
        ? art.description.slice(0, 125).trim() + '...'
        : art.description;
      return {
        number: idx + 1,
        title: art.title,
        takeaway: shortSummary,
        category: art.category,
        source: art.source.name,
        url: art.url,
      };
    });
  }, [rankedArticles]);

  // "Outside Your Bubble" (Blindspot story outside user's selected desks)
  const blindspotArticle = useMemo(() => {
    const unselected = rawArticles.filter(
      (art) => !preferences.selectedTopics.includes(art.category) && !feedback.skippedArticleIds.includes(art.id)
    );
    if (unselected.length === 0) return null;
    const scoredUnselected = rankArticles(unselected, preferences, feedback, true);
    return scoredUnselected[0] || null;
  }, [rawArticles, preferences.selectedTopics, feedback]);

  // Auto-save today's edition to archive if not yet present today
  useEffect(() => {
    if (!activeEdition && rankedArticles.length > 3 && typeof window !== 'undefined') {
      const todayDateStr = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const existing = getStoredEditions();
      const alreadySaved = existing.some((e) => e.dateStr === todayDateStr);
      if (!alreadySaved) {
        const todayEdition: SavedEdition = {
          id: `edition-${new Date().toISOString().slice(0, 10)}`,
          dateStr: todayDateStr,
          savedAt: new Date().toISOString(),
          title: preferences.newspaperTitle || 'DAYMARK',
          editionNumber: 'VOL. XII / NO. 42',
          leadHeadline: rankedArticles[0]?.title || 'Daily Broadsheet Dispatch',
          articlesCount: rankedArticles.length,
          takeaways: keyTakeaways.map((t) => t.takeaway),
          articles: rankedArticles.slice(0, 15),
          preferencesSnapshot: preferences,
        };
        saveCurrentEdition(todayEdition);
        setSavedEditions(getStoredEditions());
      }
    }
  }, [activeEdition, rankedArticles, preferences, keyTakeaways]);

  // Group remaining into categorical sections
  const techArticles = useMemo(
    () => rankedArticles.filter((a) => a.category === 'technology' && a.id !== leadArticle?.id),
    [rankedArticles, leadArticle]
  );
  const worldArticles = useMemo(
    () => rankedArticles.filter((a) => a.category === 'world' && a.id !== leadArticle?.id),
    [rankedArticles, leadArticle]
  );
  const businessArticles = useMemo(
    () => rankedArticles.filter((a) => a.category === 'business' && a.id !== leadArticle?.id),
    [rankedArticles, leadArticle]
  );
  const scienceArticles = useMemo(
    () => rankedArticles.filter((a) => a.category === 'science' && a.id !== leadArticle?.id),
    [rankedArticles, leadArticle]
  );
  const otherArticles = useMemo(
    () => rankedArticles.filter((a) => !['technology', 'world', 'business', 'science'].includes(a.category) && a.id !== leadArticle?.id),
    [rankedArticles, leadArticle]
  );

  // Feedback Handlers with Learning Signals
  const handleLike = (article: ScoredArticle) => {
    const isLiked = feedback.likedArticleIds.includes(article.id);
    const newLiked = isLiked
      ? feedback.likedArticleIds.filter((id) => id !== article.id)
      : [...feedback.likedArticleIds, article.id];

    // Remove from disliked if present
    const newDisliked = feedback.dislikedArticleIds.filter((id) => id !== article.id);

    // Boost topic affinity
    const currentAffinity = feedback.topicAffinities[article.category] || 0;
    const newTopicAffinities = {
      ...feedback.topicAffinities,
      [article.category]: Math.min(currentAffinity + (isLiked ? -1 : 1.5), 5),
    };

    const updatedFeedback: UserFeedback = {
      ...feedback,
      likedArticleIds: newLiked,
      dislikedArticleIds: newDisliked,
      topicAffinities: newTopicAffinities,
    };

    setFeedback(updatedFeedback);
    saveStoredFeedback(updatedFeedback);

    if (!isLiked) {
      addLearningSignal({
        type: 'upvote',
        articleId: article.id,
        articleTitle: article.title,
        topic: article.category,
        impactDescription: `Boosted ${article.category} desk weight (+15% score) and keyword affinities.`,
      });
    }

    showToast(isLiked ? 'Removed vote' : `Rank boosted for ${article.category} stories`);
  };

  const handleDislike = (article: ScoredArticle) => {
    const isDisliked = feedback.dislikedArticleIds.includes(article.id);
    const newDisliked = isDisliked
      ? feedback.dislikedArticleIds.filter((id) => id !== article.id)
      : [...feedback.dislikedArticleIds, article.id];

    // Remove from liked if present
    const newLiked = feedback.likedArticleIds.filter((id) => id !== article.id);

    // Decrease topic affinity
    const currentAffinity = feedback.topicAffinities[article.category] || 0;
    const newTopicAffinities = {
      ...feedback.topicAffinities,
      [article.category]: Math.max(currentAffinity + (isDisliked ? 1 : -2), -5),
    };

    const updatedFeedback: UserFeedback = {
      ...feedback,
      likedArticleIds: newLiked,
      dislikedArticleIds: newDisliked,
      topicAffinities: newTopicAffinities,
    };

    setFeedback(updatedFeedback);
    saveStoredFeedback(updatedFeedback);

    if (!isDisliked) {
      addLearningSignal({
        type: 'downvote',
        articleId: article.id,
        articleTitle: article.title,
        topic: article.category,
        impactDescription: `Penalized ${article.category} frequency in future morning editions.`,
      });
    }

    showToast(isDisliked ? 'Removed downvote' : `Reduced frequency of ${article.category} stories`);
  };

  const handleSkip = (article: ScoredArticle) => {
    const currentAffinity = feedback.topicAffinities[article.category] || 0;
    const updatedFeedback: UserFeedback = {
      ...feedback,
      skippedArticleIds: [...feedback.skippedArticleIds, article.id],
      topicAffinities: {
        ...feedback.topicAffinities,
        [article.category]: Math.max(currentAffinity - 0.5, -5),
      },
    };
    setFeedback(updatedFeedback);
    saveStoredFeedback(updatedFeedback);

    addLearningSignal({
      type: 'skip',
      articleId: article.id,
      articleTitle: article.title,
      topic: article.category,
      impactDescription: `Dismissed from edition; suppressed similar headlines.`,
    });

    showToast(`Story dismissed from today's paper`);
  };

  const handleBookmark = (article: ScoredArticle) => {
    const isSaved = feedback.savedArticleIds.includes(article.id);
    const newSaved = isSaved
      ? feedback.savedArticleIds.filter((id) => id !== article.id)
      : [...feedback.savedArticleIds, article.id];

    const updatedFeedback: UserFeedback = {
      ...feedback,
      savedArticleIds: newSaved,
    };
    setFeedback(updatedFeedback);
    saveStoredFeedback(updatedFeedback);

    if (!isSaved) {
      addLearningSignal({
        type: 'save',
        articleId: article.id,
        articleTitle: article.title,
        topic: article.category,
        impactDescription: `Saved to clippings; reinforced interest in ${article.category}.`,
      });
    }

    showToast(isSaved ? 'Removed from saved clippings' : 'Saved to personal morning clippings');
  };

  // Preference update
  const handleSavePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    saveStoredPreferences(newPrefs);
    showToast('Preferences updated and calibrated');
  };

  // Editions Management
  const handleSaveTodayEdition = () => {
    if (rankedArticles.length === 0) {
      showToast('No articles available to archive');
      return;
    }
    const today = new Date();
    const dateFormatted = today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const newEdition: SavedEdition = {
      id: `edition-${Date.now()}`,
      dateStr: dateFormatted,
      savedAt: today.toISOString(),
      title: preferences.newspaperTitle || 'DAYMARK',
      editionNumber: 'VOL. XII / NO. 42',
      leadHeadline: rankedArticles[0]?.title || 'Morning Dispatch',
      articlesCount: rankedArticles.length,
      takeaways: keyTakeaways.map((t) => t.takeaway),
      articles: rankedArticles.slice(0, 18),
      preferencesSnapshot: { ...preferences },
    };

    saveCurrentEdition(newEdition);
    setSavedEditions(getStoredEditions());
    showToast(`Today's edition saved to your archive`);
  };

  const handleSelectEdition = (edition: SavedEdition) => {
    setActiveEdition(edition);
    setIsEditionsOpen(false);
    showToast(`Loaded archived edition from ${edition.dateStr}`);
  };

  const handleDeleteEdition = (id: string) => {
    deleteStoredEdition(id);
    setSavedEditions(getStoredEditions());
    if (activeEdition?.id === id) {
      setActiveEdition(null);
    }
    showToast('Archived issue removed');
  };

  const handleResetToLive = () => {
    setActiveEdition(null);
    showToast('Returned to live morning wire');
  };

  // Audio Speech synthesis
  const handleToggleAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('Speech synthesis not supported in this browser');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const topFive = rankedArticles.slice(0, 5);
    if (topFive.length === 0) {
      showToast('No articles ready for audio dispatch');
      return;
    }

    const readerGreeting = preferences.readerName || 'Reader';
    const paperName = preferences.newspaperTitle || 'Daymark';
    const textToSpeak = `Good morning, ${readerGreeting}. Here is your ${paperName} morning audio dispatch. Top stories today: ` +
      topFive
        .map((art, idx) => `Story ${idx + 1}, in ${art.category}: ${art.title}. Reporting by ${art.source.name}.`)
        .join(' ... Next story: ');

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
    showToast('Playing morning audio briefing');
  };

  // Print execution
  const executePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-ivory-100 text-charcoal-900 flex flex-col font-serif selection:bg-forest-100 selection:text-forest-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-charcoal-900 text-ivory-50 text-xs font-sans px-4 py-2.5 rounded shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 no-print border border-charcoal-700">
          <Sparkles className="w-3.5 h-3.5 text-forest-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Masthead */}
      <Masthead
        preferences={preferences}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenPreferences={() => setIsOnboardingOpen(true)}
        onOpenEditions={() => setIsEditionsOpen(true)}
        onPrint={() => setIsPrintModalOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        selectedTopicFilter={selectedTopicFilter}
        onSelectTopicFilter={setSelectedTopicFilter}
        onSaveCurrentEdition={handleSaveTodayEdition}
        savedEditionsCount={savedEditions.length}
        isPlayingAudio={isPlayingAudio}
        onToggleAudio={handleToggleAudio}
      />

      {/* Secondary Search & Filter Bar (Screen only) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-2.5 no-print">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-ivory-200/50 p-2.5 rounded border border-ivory-300">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-2.5" />
            <input
              id="search-articles-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter stories by subject or keyword..."
              className="w-full pl-8 pr-3 py-1.5 bg-ivory-50 border border-ivory-300 rounded text-xs font-sans text-charcoal-900 placeholder-charcoal-400 focus:outline-hidden focus:ring-1 focus:ring-forest-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-charcoal-400 hover:text-charcoal-900 text-xs cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick status / Filter toggles */}
          <div className="flex items-center space-x-3 text-xs font-sans">
            <button
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded border transition-colors cursor-pointer ${
                showBookmarksOnly
                  ? 'bg-forest-50 border-forest-300 text-forest-800 font-semibold'
                  : 'bg-ivory-50 border-ivory-300 text-charcoal-700 hover:bg-ivory-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-forest-600" />
              <span>Saved Clippings ({feedback.savedArticleIds.length})</span>
            </button>

            {activeEdition && (
              <button
                onClick={handleResetToLive}
                className="flex items-center space-x-1 px-2.5 py-1 bg-forest-50 text-forest-700 border border-forest-200 rounded hover:bg-forest-100 font-medium cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Exit Archive</span>
              </button>
            )}

            <span className="text-charcoal-500 hidden md:inline">
              Showing <strong>{rankedArticles.length}</strong> curated reports
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Broadsheet */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex-1 py-4 print-broadsheet">
        {isLoading ? (
          <LoadingNewspaper />
        ) : error ? (
          <ErrorState error={error} onRetry={() => fetchNews(preferences.selectedTopics)} />
        ) : rankedArticles.length === 0 ? (
          <EmptyState
            onResetFilters={() => {
              setSelectedTopicFilter('all');
              setSearchQuery('');
              setShowBookmarksOnly(false);
            }}
            onOpenPreferences={() => setIsOnboardingOpen(true)}
          />
        ) : (
          <div>
            {/* 1. TODAY'S 3 KEY TAKEAWAYS — THE MORNING BRIEFING BOX */}
            {keyTakeaways.length > 0 && selectedTopicFilter === 'all' && (
              <section className="mb-8 p-5 sm:p-6 bg-white border border-ivory-300 rounded shadow-2xs print-break-inside-avoid">
                <div className="flex items-center justify-between border-b border-ivory-200 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse" />
                    <span className="font-sans font-bold text-[11px] uppercase tracking-[0.25em] text-forest-700">
                      Executive Intelligence • 30-Second Morning Briefing
                    </span>
                  </div>
                  <span className="text-xs font-serif italic text-charcoal-500 hidden sm:inline">
                    Synthesized from today&apos;s top 3 ranked stories
                  </span>
                </div>
                <h2 className="font-headline text-2xl font-bold text-charcoal-900 mb-4">
                  Today&apos;s 3 Key Takeaways
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {keyTakeaways.map((item) => (
                    <div
                      key={item.number}
                      className="p-4 bg-ivory-50/80 border border-ivory-200 rounded flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-sans text-forest-700 uppercase tracking-wider font-bold mb-1.5">
                          <span>Takeaway #{item.number}</span>
                          <span className="text-charcoal-500 font-normal">[{item.category}]</span>
                        </div>
                        <h4 className="font-headline text-sm font-bold text-charcoal-900 leading-snug mb-2 hover:text-forest-700 transition-colors">
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            {item.title}
                          </a>
                        </h4>
                        <p className="font-serif text-xs text-charcoal-700 leading-relaxed">
                          {item.takeaway}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-ivory-200 flex items-center justify-between text-[10px] font-sans text-charcoal-500">
                        <span>Via {item.source}</span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-forest-700 font-semibold hover:underline"
                        >
                          Read Source →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FRONT PAGE BROADSHEET LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8 border-b border-ivory-300">
              {/* PRIMARY BROADSHEET COLUMN (Cols 1-8) */}
              <div className="lg:col-span-8 lg:border-r lg:border-ivory-300 lg:pr-8">
                {/* 1. Lead Story */}
                {leadArticle && (
                  <ArticleCard
                    article={leadArticle}
                    variant="hero"
                    onLike={handleLike}
                    onDislike={handleDislike}
                    onSkip={handleSkip}
                    onBookmark={handleBookmark}
                    onWhyThis={(a) => setWhyThisArticle(a)}
                    isLiked={feedback.likedArticleIds.includes(leadArticle.id)}
                    isDisliked={feedback.dislikedArticleIds.includes(leadArticle.id)}
                    isBookmarked={feedback.savedArticleIds.includes(leadArticle.id)}
                  />
                )}

                {/* 2. Secondary Stories (2-column layout above the fold) */}
                {secondaryArticles.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-forest-700">
                        Front Page Reports
                      </span>
                      <div className="flex-1 h-px bg-ivory-300" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {secondaryArticles.map((article) => (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          variant="standard"
                          onLike={handleLike}
                          onDislike={handleDislike}
                          onSkip={handleSkip}
                          onBookmark={handleBookmark}
                          onWhyThis={(a) => setWhyThisArticle(a)}
                          isLiked={feedback.likedArticleIds.includes(article.id)}
                          isDisliked={feedback.dislikedArticleIds.includes(article.id)}
                          isBookmarked={feedback.savedArticleIds.includes(article.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SIDEBAR WIRE & EDITORIAL REFLECTIONS (Cols 9-12) */}
              <div className="lg:col-span-4 space-y-6">
                {/* The Morning Wire */}
                <div className="bg-white p-5 rounded border border-ivory-300 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-ivory-300 pb-2 mb-4">
                    <span className="font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-charcoal-900 flex items-center">
                      <span className="w-1.5 h-1.5 bg-forest-600 rounded-full mr-1.5 animate-pulse" />
                      The Morning Wire
                    </span>
                    <span className="text-[10px] font-sans text-charcoal-400">
                      Live Dispatches
                    </span>
                  </div>

                  <div className="space-y-4">
                    {wireBriefs.map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        variant="wire"
                        onLike={handleLike}
                        onDislike={handleDislike}
                        onSkip={handleSkip}
                        onBookmark={handleBookmark}
                        onWhyThis={(a) => setWhyThisArticle(a)}
                        isLiked={feedback.likedArticleIds.includes(article.id)}
                        isDisliked={feedback.dislikedArticleIds.includes(article.id)}
                        isBookmarked={feedback.savedArticleIds.includes(article.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Daily Reflection Box */}
                <div className="bg-ivory-50 border border-ivory-300 p-5 rounded shadow-2xs text-center">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-forest-700 block mb-2">
                    Daily Reflection
                  </span>
                  <blockquote className="font-serif italic text-sm text-charcoal-800 leading-relaxed">
                    &ldquo;Knowledge becomes wisdom only when balanced by diverse perspectives and quiet contemplation.&rdquo;
                  </blockquote>
                  <div className="mt-3 pt-2.5 border-t border-ivory-200 flex items-center justify-between text-[11px] font-sans text-charcoal-500">
                    <span>Daymark Editorial Desk</span>
                    <span className="font-mono text-[10px]">Issue No. 42</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. OUTSIDE YOUR BUBBLE (BLINDSPOT SECTION) */}
            {blindspotArticle && selectedTopicFilter === 'all' && (
              <section className="my-10 p-6 bg-forest-50/70 border border-forest-200 rounded print-break-inside-avoid">
                <div className="flex flex-wrap items-center justify-between border-b border-forest-200/80 pb-3 mb-4 gap-2">
                  <div className="flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-forest-700" />
                    <span className="font-sans font-bold text-[11px] uppercase tracking-[0.2em] text-forest-800">
                      Outside Your Bubble • Intellectual Blindspot Breaker
                    </span>
                  </div>
                  <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 font-medium border border-forest-200">
                    Uncurated Desk: {blindspotArticle.category.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8">
                    <span className="text-xs font-serif italic text-charcoal-600 mb-1 block">
                      Curated outside your primary {preferences.selectedTopics.length} selected focus areas to challenge intellectual complacency:
                    </span>
                    <h3 className="font-headline text-xl sm:text-2xl font-bold text-charcoal-900 leading-tight mb-2 hover:text-forest-700 transition-colors">
                      <a href={blindspotArticle.url} target="_blank" rel="noopener noreferrer">
                        {blindspotArticle.title}
                      </a>
                    </h3>
                    <p className="font-serif text-sm text-charcoal-700 leading-relaxed">
                      {blindspotArticle.description}
                    </p>
                    <div className="flex items-center space-x-3 text-xs font-sans text-charcoal-500 mt-3">
                      <span className="font-medium text-charcoal-800">Reporting by {blindspotArticle.source.name}</span>
                      <span>•</span>
                      <span>{blindspotArticle.readTimeMinutes} min read</span>
                    </div>
                  </div>
                  <div className="md:col-span-4 flex flex-col items-start md:items-end justify-center gap-2">
                    <a
                      href={blindspotArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-charcoal-900 hover:bg-black text-ivory-50 text-xs font-sans font-semibold rounded flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <span>Read Outside Perspective</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <span className="text-[10px] font-serif italic text-charcoal-500">
                      Helps prevent algorithmic echo chambers
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* CATEGORICAL SECTIONS BELOW THE FOLD */}
            {selectedTopicFilter === 'all' && (
              <div className="mt-8 space-y-10">
                {/* Tech & AI Section */}
                <SectionBlock
                  title="Technology, Computation & Artificial Intelligence"
                  sectionCode="SECTION B"
                  articles={techArticles.slice(0, 3)}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  onSkip={handleSkip}
                  onBookmark={handleBookmark}
                  onWhyThis={(a) => setWhyThisArticle(a)}
                  likedIds={feedback.likedArticleIds}
                  dislikedIds={feedback.dislikedArticleIds}
                  bookmarkedIds={feedback.savedArticleIds}
                />

                {/* World Affairs Section */}
                <SectionBlock
                  title="Global Geopolitics & World Affairs"
                  sectionCode="SECTION C"
                  articles={worldArticles.slice(0, 3)}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  onSkip={handleSkip}
                  onBookmark={handleBookmark}
                  onWhyThis={(a) => setWhyThisArticle(a)}
                  likedIds={feedback.likedArticleIds}
                  dislikedIds={feedback.dislikedArticleIds}
                  bookmarkedIds={feedback.savedArticleIds}
                />

                {/* Business & Economy Section */}
                <SectionBlock
                  title="Markets, Capital & Global Commerce"
                  sectionCode="SECTION D"
                  articles={businessArticles.slice(0, 3)}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  onSkip={handleSkip}
                  onBookmark={handleBookmark}
                  onWhyThis={(a) => setWhyThisArticle(a)}
                  likedIds={feedback.likedArticleIds}
                  dislikedIds={feedback.dislikedArticleIds}
                  bookmarkedIds={feedback.savedArticleIds}
                />

                {/* Science & Nature Section */}
                <SectionBlock
                  title="Science, Cosmos & Earth Systems"
                  sectionCode="SECTION E"
                  articles={scienceArticles.slice(0, 3)}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  onSkip={handleSkip}
                  onBookmark={handleBookmark}
                  onWhyThis={(a) => setWhyThisArticle(a)}
                  likedIds={feedback.likedArticleIds}
                  dislikedIds={feedback.dislikedArticleIds}
                  bookmarkedIds={feedback.savedArticleIds}
                />

                {/* Culture & Opinion Section */}
                {otherArticles.length > 0 && (
                  <SectionBlock
                    title="Culture, Medicine & Editorial Commentary"
                    sectionCode="SECTION F"
                    articles={otherArticles.slice(0, 3)}
                    onLike={handleLike}
                    onDislike={handleDislike}
                    onSkip={handleSkip}
                    onBookmark={handleBookmark}
                    onWhyThis={(a) => setWhyThisArticle(a)}
                    likedIds={feedback.likedArticleIds}
                    dislikedIds={feedback.dislikedArticleIds}
                    bookmarkedIds={feedback.savedArticleIds}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* DAYMARK COLOPHON & FOOTER */}
      <footer className="w-full bg-ivory-200/50 border-t border-ivory-300 py-10 mt-16 print-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h4 className="font-headline text-2xl font-black text-charcoal-900 tracking-tight">
            {preferences.newspaperTitle || 'DAYMARK'}
          </h4>
          <p className="text-xs font-serif italic text-charcoal-600 mt-1 max-w-lg mx-auto leading-relaxed">
            Your world, clearly delivered. Personalized daily for {currentUser?.name || preferences.readerName || 'our readers'} • Sourced from BBC News, The New York Times, Ars Technica, and NPR.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] font-sans text-charcoal-500 uppercase tracking-wider">
            <span className="flex items-center text-forest-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-600 mr-1" />
              NaSCon &apos;26 Official Entry
            </span>
            <span>•</span>
            <span>Zero Hallucination Policy</span>
            <span>•</span>
            <span>Deterministic Scoring Algorithm</span>
            <span>•</span>
            <span>100% Client-Side Storage</span>
          </div>

          <div className="mt-4 pt-4 border-t border-ivory-300 text-[10px] text-charcoal-400 font-sans no-print">
            Click &ldquo;Print / PDF&rdquo; to download an archival broadsheet or save as PDF.
          </div>
        </div>
      </footer>

      {/* Onboarding & Preferences Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        preferences={preferences}
        onSave={handleSavePreferences}
        isFirstVisit={!preferences.onboarded}
      />

      {/* Why This Story Modal (Explainability) */}
      <WhyThisModal
        article={whyThisArticle}
        onClose={() => setWhyThisArticle(null)}
        preferences={preferences}
      />

      {/* Saved Editions Archive Drawer */}
      <SavedEditionsDrawer
        isOpen={isEditionsOpen}
        onClose={() => setIsEditionsOpen(false)}
        editions={savedEditions}
        onSelectEdition={handleSelectEdition}
        onDeleteEdition={handleDeleteEdition}
        onSaveCurrent={handleSaveTodayEdition}
        activeEditionId={activeEdition?.id}
        onResetToLive={handleResetToLive}
      />

      {/* Print / Save PDF Modal */}
      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onConfirmPrint={executePrint}
        newspaperTitle={preferences.newspaperTitle}
      />
    </div>
  );
}
