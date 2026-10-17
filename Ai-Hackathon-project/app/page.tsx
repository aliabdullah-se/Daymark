'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Article, UserPreferences, UserFeedback, SavedEdition, NewsTopic, DEFAULT_PREFERENCES, AVAILABLE_TOPICS } from '@/types/news';
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
} from '@/lib/storage';
import Masthead from '@/components/Masthead';
import ArticleCard from '@/components/ArticleCard';
import SectionBlock from '@/components/SectionBlock';
import OnboardingModal from '@/components/OnboardingModal';
import WhyThisModal from '@/components/WhyThisModal';
import SavedEditionsDrawer from '@/components/SavedEditionsDrawer';
import PrintPreviewModal from '@/components/PrintPreviewBanner';
import { LoadingNewspaper, EmptyState, ErrorState } from '@/components/StatusStates';
import { Sparkles, Bookmark, Search, RotateCcw, Clock, Quote, Printer, ShieldCheck } from 'lucide-react';

export default function MorningChroniclePage() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [feedback, setFeedback] = useState<UserFeedback>(INITIAL_FEEDBACK);
  const [savedEditions, setSavedEditions] = useState<SavedEdition[]>([]);
  const [rawArticles, setRawArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    setPreferences(loadedPrefs);
    setFeedback(loadedFeedback);
    setSavedEditions(loadedEditions);

    // If user has never onboarded, show onboarding prompt
    if (!loadedPrefs.onboarded) {
      setIsOnboardingOpen(true);
    }
  }, []);

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

  // Feedback Handlers
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
    showToast(isDisliked ? 'Removed downvote' : `Reduced frequency of ${article.category} stories`);
  };

  const handleSkip = (article: ScoredArticle) => {
    const updatedFeedback: UserFeedback = {
      ...feedback,
      skippedArticleIds: [...feedback.skippedArticleIds, article.id],
    };
    setFeedback(updatedFeedback);
    saveStoredFeedback(updatedFeedback);
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
    showToast(isSaved ? 'Removed from saved clippings' : 'Saved to personal morning clippings');
  };

  // Preference update
  const handleSavePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    saveStoredPreferences(newPrefs);
    fetchNews(newPrefs.selectedTopics);
    showToast('Preferences updated and broadsheet re-ranked');
  };

  // Save current edition to archive
  const handleSaveTodayEdition = () => {
    if (rankedArticles.length === 0) {
      showToast('No articles available to archive yet');
      return;
    }
    const todayStr = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newEdition: SavedEdition = {
      id: 'edition_' + Date.now().toString(36),
      dateStr: todayStr,
      savedAt: new Date().toISOString(),
      title: preferences.newspaperTitle,
      leadHeadline: leadArticle ? leadArticle.title : 'Morning Dispatch',
      articlesCount: rankedArticles.length,
      articles: rankedArticles,
      preferencesSnapshot: preferences,
    };

    saveCurrentEdition(newEdition);
    setSavedEditions(getStoredEditions());
    showToast(`Saved today's edition (${newEdition.articlesCount} stories) to Archive!`);
  };

  const handleDeleteEdition = (id: string) => {
    deleteStoredEdition(id);
    setSavedEditions(getStoredEditions());
    if (activeEdition?.id === id) {
      setActiveEdition(null);
    }
    showToast('Archived edition deleted');
  };

  const handleSelectEdition = (edition: SavedEdition) => {
    setActiveEdition(edition);
    showToast(`Loaded archived edition from ${edition.dateStr}`);
  };

  const handleResetToLive = () => {
    setActiveEdition(null);
    showToast('Returned to Live Wire edition');
  };

  // Print execution
  const executePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-paper-50 text-ink-900 flex flex-col font-serif selection:bg-amber-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink-900 text-white text-xs font-sans px-4 py-2.5 rounded shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 no-print">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Masthead */}
      <Masthead
        preferences={preferences}
        onOpenPreferences={() => setIsOnboardingOpen(true)}
        onOpenEditions={() => setIsEditionsOpen(true)}
        onPrint={() => setIsPrintModalOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        selectedTopicFilter={selectedTopicFilter}
        onSelectTopicFilter={setSelectedTopicFilter}
        onSaveCurrentEdition={handleSaveTodayEdition}
        savedEditionsCount={savedEditions.length}
      />

      {/* Secondary Search & Filter Bar (Screen only) */}
      <div className="max-w-7xl mx-auto px-4 w-full py-2.5 no-print">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-paper-100 p-2.5 rounded border border-paper-200">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-2.5" />
            <input
              id="search-articles-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter stories by topic or keyword..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-paper-300 rounded text-xs font-sans text-ink-900 focus:outline-none focus:ring-1 focus:ring-ink-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-ink-400 hover:text-ink-900 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick status / Filter toggles */}
          <div className="flex items-center space-x-3 text-xs font-sans">
            <button
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded border transition-colors ${
                showBookmarksOnly
                  ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
                  : 'bg-white border-paper-300 text-ink-700 hover:bg-paper-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-editorial-amber" />
              <span>Saved Clippings ({feedback.savedArticleIds.length})</span>
            </button>

            {activeEdition && (
              <button
                onClick={handleResetToLive}
                className="flex items-center space-x-1 px-2.5 py-1 bg-paper-200 text-editorial-crimson rounded hover:bg-paper-300 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Exit Archive</span>
              </button>
            )}

            <span className="text-ink-500 hidden md:inline">
              Showing <strong>{rankedArticles.length}</strong> curated reports
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Broadsheet */}
      <main className="max-w-7xl mx-auto px-4 w-full flex-1 py-4 print-broadsheet">
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
            {/* FRONT PAGE BROADSHEET LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8 border-b-2 border-ink-900">
              
              {/* PRIMARY BROADSHEET COLUMN (Cols 1-8) */}
              <div className="lg:col-span-8 lg:border-r lg:border-paper-300 lg:pr-8">
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
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="font-headline font-bold text-[11px] uppercase tracking-wider text-ink-700">
                        Front Page Reports
                      </span>
                      <div className="flex-1 h-px bg-paper-300"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

              {/* EDITORIAL SIDEBAR: THE WIRE & FAST DIGEST (Cols 9-12) */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
                <div>
                  {/* The Wire Header */}
                  <div className="p-3 bg-paper-200 border-2 border-ink-900 rounded mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline font-black text-sm uppercase tracking-widest text-ink-900">
                        The Morning Wire
                      </h3>
                      <span className="text-[10px] font-mono bg-editorial-crimson text-white px-1.5 py-0.5 rounded font-bold">
                        FAST DISPATCH
                      </span>
                    </div>
                    <p className="text-[11px] font-serif text-ink-600 mt-1 italic">
                      High-priority 2-minute developments filtered for your reading pace.
                    </p>
                  </div>

                  {/* Wire Items */}
                  <div className="space-y-1">
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

                {/* Editorial Quote of the Day & Reader Note */}
                <div className="p-4 bg-paper-100 border border-paper-300 rounded font-serif text-xs text-ink-700 italic border-l-4 border-l-editorial-navy">
                  <div className="flex items-center space-x-1.5 font-sans font-bold uppercase text-[10px] text-editorial-navy not-italic mb-1">
                    <Quote className="w-3 h-3" />
                    <span>Editorial Thought</span>
                  </div>
                  &ldquo;An authentic newspaper is not merely a recorder of events, but a lens through which an informed citizen discovers what truly matters.&rdquo;
                </div>
              </div>

            </div>

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

      {/* NEWSPAPER COLOPHON & FOOTER */}
      <footer className="w-full bg-paper-100 border-t-2 border-ink-900 py-8 mt-12 print-header">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="newspaper-rule-double-thin my-2"></div>

          <h4 className="font-headline text-lg font-black text-ink-900 tracking-wider">
            {preferences.newspaperTitle || 'THE MORNING CHRONICLE'}
          </h4>
          <p className="text-xs font-serif text-ink-600 mt-1 max-w-xl mx-auto leading-relaxed">
            Published daily for {preferences.readerName || 'our readers'} • Aggregated and verified via authentic RSS news wires (BBC News, The New York Times, Ars Technica, and NPR).
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] font-sans text-ink-500 uppercase tracking-wider">
            <span className="flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 text-editorial-olive mr-1" />
              NaSCon &apos;26 AI Challenge Entry
            </span>
            <span>•</span>
            <span>Zero Hallucination Policy</span>
            <span>•</span>
            <span>Deterministic Scoring Algorithm</span>
            <span>•</span>
            <span>Client-side Storage Enabled</span>
          </div>

          <div className="mt-4 pt-4 border-t border-paper-200 text-[10px] text-ink-400 font-mono no-print">
            Press &ldquo;Print / Save PDF&rdquo; anytime to produce an archival-grade physical or digital broadsheet edition.
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
