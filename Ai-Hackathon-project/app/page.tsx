'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Article,
  UserPreferences,
  UserFeedback,
  SavedEdition,
  NewsTopic,
  DEFAULT_PREFERENCES,
  AVAILABLE_TOPICS,
  UserAccount,
  SuggestedInterest,
} from '@/types/news';
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
  setCurrentUser,
  saveStoredUser,
  DEMO_JUDGE_USER,
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
import GeminiKeyModal from '@/components/GeminiKeyModal';
import SettingsModal from '@/components/SettingsModal';
import AppSidebar from '@/components/AppSidebar';
import ArticleReaderModal from '@/components/ArticleReaderModal';
import StickyAudioPlayer from '@/components/StickyAudioPlayer';
import { useSettings } from '@/components/ThemeProvider';
import { LoadingNewspaper, EmptyState, ErrorState } from '@/components/StatusStates';
import { getGeminiApiKey, fetchGeminiTakeaways } from '@/lib/gemini';
import {
  Sparkles,
  Bookmark,
  Search,
  RotateCcw,
  Clock,
  Printer,
  Newspaper,
  ShieldCheck,
  Compass,
  ExternalLink,
  BrainCircuit,
  Plus,
  X,
  Sliders,
} from 'lucide-react';

export default function DaymarkBroadsheetPage() {
  const { settings, isSettingsOpen, setIsSettingsOpen, openSettings, closeSettings } = useSettings();

  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [feedback, setFeedback] = useState<UserFeedback>(INITIAL_FEEDBACK);
  const [savedEditions, setSavedEditions] = useState<SavedEdition[]>([]);
  const [rawArticles, setRawArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [suggestedInterests, setSuggestedInterests] = useState<SuggestedInterest[]>([]);

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
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [aiTakeaways, setAiTakeaways] = useState<any[] | null>(null);
  const [isAiTakeawaysLoading, setIsAiTakeawaysLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [readingArticle, setReadingArticle] = useState<ScoredArticle | null>(null);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'appearance' | 'reading' | 'editorial' | 'ai'>('appearance');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Load persisted user state on mount
  useEffect(() => {
    let user = getCurrentUser();

    // Support instant demo via URL param (?demo=reader, ?demo=true, ?demo=judge)
    const demoVal = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('demo') : null;
    const isDemoParam = demoVal === 'judge' || demoVal === 'reader' || demoVal === 'true';
    if (!user && isDemoParam) {
      saveStoredUser(DEMO_JUDGE_USER);
      setCurrentUser(DEMO_JUDGE_USER);
      user = DEMO_JUDGE_USER;
      document.cookie = `daymark_token=${btoa(
        JSON.stringify({ id: DEMO_JUDGE_USER.id, email: DEMO_JUDGE_USER.email, name: DEMO_JUDGE_USER.name })
      )}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `daymark_otp_verified=true; path=/; max-age=604800; SameSite=Lax`;
    }

    // Must be logged in before viewing broadsheet or triggering onboarding
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const loadedPrefs = getStoredPreferences();
    if (
      loadedPrefs.newspaperTitle &&
      (loadedPrefs.newspaperTitle.toUpperCase().includes('BROADSIDE') ||
        loadedPrefs.newspaperTitle.toUpperCase().includes('DISPATCH') ||
        loadedPrefs.newspaperTitle.toUpperCase().includes('MORNING CHRONICLE'))
    ) {
      loadedPrefs.newspaperTitle = 'DAYMARK';
      saveStoredPreferences(loadedPrefs);
    }
    if (
      user &&
      user.paperTitle &&
      (user.paperTitle.toUpperCase().includes('BROADSIDE') ||
        user.paperTitle.toUpperCase().includes('DISPATCH') ||
        user.paperTitle.toUpperCase().includes('MORNING CHRONICLE'))
    ) {
      user.paperTitle = 'DAYMARK';
      saveStoredUser(user);
    }

    const loadedFeedback = getStoredFeedback();
    const loadedEditions = getStoredEditions();

    setPreferences(loadedPrefs);
    setFeedback(loadedFeedback);
    setSavedEditions(loadedEditions);
    setCurrentUser(user);
    setHasGeminiKey(!!getGeminiApiKey());

    // Fetch real-time AI personalized suggested interests
    fetch(`/api/ai/learn?userId=${user.id || 'demo-reader'}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.suggestions) {
          setSuggestedInterests(data.suggestions);
        }
      })
      .catch(() => {});

    // If authenticated user has never onboarded, show onboarding prompt
    if (!loadedPrefs.onboarded) {
      setIsOnboardingOpen(true);
    }
  }, []);

  // Reactive sync with localStorage for user sessions & Gemini key
  useEffect(() => {
    const syncSession = () => {
      setCurrentUser(getCurrentUser());
      setPreferences(getStoredPreferences());
      setHasGeminiKey(!!getGeminiApiKey());
    };
    window.addEventListener('storage', syncSession);
    return () => window.removeEventListener('storage', syncSession);
  }, []);

  const handleSignOut = () => {
    logoutUser();
    setCurrentUser(null);
    showToast('Signed out of subscriber account');
    setTimeout(() => {
      window.location.href = '/login';
    }, 400);
  };

  const handleSynthesizeWithGemini = async () => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      setSettingsInitialTab('ai');
      openSettings();
      showToast('Please configure your free Gemini API key in Settings');
      return;
    }

    setIsAiTakeawaysLoading(true);
    showToast('Synthesizing with Google Gemini 1.5 Flash...');
    try {
      const res = await fetchGeminiTakeaways(rankedArticles, preferences);
      if (res.success && Array.isArray(res.takeaways) && res.takeaways.length > 0) {
        setAiTakeaways(res.takeaways);
        showToast('Generated fresh executive takeaways via Gemini AI!');
      } else {
        showToast('Using algorithmic broadsheet synthesis');
      }
    } catch (e) {
      showToast('AI synthesis unavailable, using broadsheet engine');
    } finally {
      setIsAiTakeawaysLoading(false);
    }
  };

  // Fetch live articles from API
  const fetchNews = useCallback(async (topicsToFetch?: NewsTopic[]) => {
    try {
      setError(null);
      const url =
        topicsToFetch && topicsToFetch.length > 0
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

  // Contextual Edition Metadata for the currently viewed newspaper edition
  const currentEditionMeta = useMemo(() => {
    if (activeEdition) {
      return {
        id: activeEdition.id,
        title: activeEdition.title || preferences.newspaperTitle || 'DAYMARK',
        editionName: `${activeEdition.editionNumber || 'Archived Edition'} (${activeEdition.dateStr})`,
        editionSubhead: 'Historical Broadsheet Snapshot',
        date: activeEdition.dateStr,
        count: rankedArticles.length,
        isArchive: true,
      };
    }
    if (showBookmarksOnly) {
      return {
        id: 'bookmarks',
        title: preferences.newspaperTitle || 'DAYMARK',
        editionName: 'Saved Clippings Edition',
        editionSubhead: 'Curated Personal Reader Archive',
        date: new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        count: rankedArticles.length,
        isArchive: false,
      };
    }
    const topicLabels: Record<NewsTopic, { name: string; subhead: string }> = {
      technology: { name: 'Technology & AI Edition', subhead: 'Frontiers in Computing, Intelligence & Engineering' },
      world: { name: 'World Affairs Edition', subhead: 'Global Geopolitics, Diplomacy & International Reports' },
      business: { name: 'Markets & Business Edition', subhead: 'Global Finance, Economics, Commerce & Enterprise' },
      science: { name: 'Science & Discovery Edition', subhead: 'Astrophysics, Biology, Exploration & Research' },
      health: { name: 'Health & Medicine Edition', subhead: 'Public Health, Clinical Medicine & Longevity' },
      environment: { name: 'Climate & Environment Edition', subhead: 'Ecosystems, Energy Transition & Earth Systems' },
      culture: { name: 'Culture & Arts Edition', subhead: 'Criticism, Literature, Media & Modern Society' },
      opinion: { name: 'Commentary & Opinion Edition', subhead: 'Perspectives, Analysis & Editorial Essays' },
    };

    const todayDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    if (selectedTopicFilter !== 'all' && topicLabels[selectedTopicFilter]) {
      return {
        id: selectedTopicFilter,
        title: preferences.newspaperTitle || 'DAYMARK',
        editionName: topicLabels[selectedTopicFilter].name,
        editionSubhead: topicLabels[selectedTopicFilter].subhead,
        date: todayDate,
        count: rankedArticles.length,
        isArchive: false,
      };
    }

    return {
      id: 'all',
      title: preferences.newspaperTitle || 'DAYMARK',
      editionName: 'Cover & Daily Broadsheet Edition',
      editionSubhead: 'Comprehensive Morning Wire & Algorithmic Synthesis',
      date: todayDate,
      count: rankedArticles.length,
      isArchive: false,
    };
  }, [activeEdition, showBookmarksOnly, selectedTopicFilter, rankedArticles.length, preferences.newspaperTitle]);

  const handleTriggerEditionPrint = () => {
    if (rankedArticles.length === 0) {
      showToast('This edition contains no articles to export');
      return;
    }
    setIsPrintModalOpen(true);
  };

  // Lead, Secondary, and Wire splits
  const leadArticle = rankedArticles[0] || null;
  const secondaryArticles = rankedArticles.slice(1, 5);
  const wireBriefs = rankedArticles.slice(5, 12);

  // Synthesize Today's 3 Key Takeaways
  const keyTakeaways = useMemo(() => {
    return rankedArticles.slice(0, 3).map((art, idx) => {
      const shortSummary =
        art.description.length > 130 ? art.description.slice(0, 125).trim() + '...' : art.description;
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
          editionNumber: todayDateStr,
          leadHeadline: rankedArticles[0]?.title || 'Daily Broadsheet Edition',
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
    () =>
      rankedArticles.filter(
        (a) => !['technology', 'world', 'business', 'science'].includes(a.category) && a.id !== leadArticle?.id
      ),
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
      triggerRealtimeAiLearning('upvote', article);
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
      triggerRealtimeAiLearning('downvote', article);
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
    triggerRealtimeAiLearning('skip', article);

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
      triggerRealtimeAiLearning('save', article);
    }

    showToast(isSaved ? 'Removed from saved clippings' : 'Saved to personal morning clippings');
  };

  // Real-time AI learning signal & personalized suggestions
  const triggerRealtimeAiLearning = async (
    action: 'upvote' | 'downvote' | 'skip' | 'save',
    article: ScoredArticle
  ) => {
    try {
      const res = await fetch('/api/ai/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || 'demo-reader',
          action,
          articleId: article.id,
          articleTitle: article.title,
          category: article.category,
          customInterests: preferences.customInterests,
          geminiApiKey: getGeminiApiKey() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.suggestions) {
        setSuggestedInterests(data.suggestions);
      }
    } catch (err) {
      console.warn('Real-time AI learning signal sync error:', err);
    }
  };

  const handleAcceptSuggestedInterest = async (topic: string, category: NewsTopic | string = 'technology') => {
    const currentCustom = preferences.customInterests || [];
    if (!currentCustom.includes(topic)) {
      const updatedPrefs: UserPreferences = {
        ...preferences,
        customInterests: [...currentCustom, topic],
      };
      setPreferences(updatedPrefs);
      saveStoredPreferences(updatedPrefs);
    }

    // Mark as accepted locally
    setSuggestedInterests((prev) =>
      prev.map((s) => (s.topic.toLowerCase() === topic.toLowerCase() ? { ...s, accepted: true } : s))
    );

    addLearningSignal({
      type: 'calibrate',
      articleTitle: `Added Inferred Interest: ${topic}`,
      topic: category,
      impactDescription: `Real-time AI expanded reader interest lens to include "${topic}". Re-ranking edition now.`,
    });

    showToast(`Added "${topic}" to your morning desks! Broadsheet re-ranked.`);

    // Inform backend DB
    try {
      await fetch('/api/ai/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'accept',
          userId: currentUser?.id || 'demo-reader',
          topic,
        }),
      });
    } catch (err) {
      console.warn('Failed to sync accepted interest:', err);
    }
  };

  const handleDismissSuggestedInterest = async (topic: string) => {
    setSuggestedInterests((prev) =>
      prev.map((s) => (s.topic.toLowerCase() === topic.toLowerCase() ? { ...s, dismissed: true } : s))
    );

    showToast(`Dismissed recommendation for "${topic}".`);

    try {
      await fetch('/api/ai/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'dismiss',
          userId: currentUser?.id || 'demo-reader',
          topic,
        }),
      });
    } catch (err) {
      console.warn('Failed to sync dismissed interest:', err);
    }
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
      editionNumber: dateFormatted,
      leadHeadline: rankedArticles[0]?.title || 'Morning Edition',
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
      showToast('No articles ready for audio briefing');
      return;
    }

    const readerGreeting = preferences.readerName || 'Reader';
    const paperName = 'DAYMARK';
    const textToSpeak =
      `Good morning, ${readerGreeting}. Here is your ${paperName} morning audio briefing. Top stories today: ` +
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

  // Contextual Print execution
  const executePrint = () => {
    if (typeof window === 'undefined') return;
    const originalTitle = document.title;
    // Set document title so browser's "Save as PDF" suggests a clean edition-specific filename
    document.title = `DAYMARK - ${currentEditionMeta.editionName} - ${currentEditionMeta.date}`;
    window.print();
    // Restore title after print dialog closes
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  // Dynamic layout & width calculation from settings
  const readingWidthClass =
    settings.readingWidth === 'narrow'
      ? 'max-w-4xl'
      : settings.readingWidth === 'wide'
      ? 'max-w-7xl'
      : 'max-w-6xl';

  const secondaryLayoutClass =
    settings.articleLayout === 'single'
      ? 'grid grid-cols-1 gap-6'
      : settings.articleLayout === 'three'
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
      : 'grid grid-cols-1 md:grid-cols-2 gap-6';

  const headlineFontClass =
    settings.headlineFont === 'sans'
      ? 'font-headline-sans'
      : settings.headlineFont === 'classic'
      ? 'font-headline-classic'
      : 'font-headline-serif';

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex font-serif transition-colors duration-200">
      {/* Persistent Left Sidebar for Desktop & Mobile Slide-over Drawer */}
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenSettings={openSettings}
        onSearch={(q) => setSearchQuery(q)}
        selectedTopicFilter={selectedTopicFilter}
        onSelectTopicFilter={(t) => setSelectedTopicFilter(t as any)}
      />

      {/* Main Broadsheet Content Area */}
      <div className="flex-1 min-w-0 flex flex-col lg:pl-64">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs font-sans px-4 py-2.5 rounded shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 no-print border border-[var(--border-strong)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
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
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          selectedTopicFilter={selectedTopicFilter}
          onSelectTopicFilter={(topic) => {
            setSelectedTopicFilter(topic);
            if (showBookmarksOnly) setShowBookmarksOnly(false);
          }}
          onSaveCurrentEdition={handleSaveTodayEdition}
          savedEditionsCount={savedEditions.length}
          isPlayingAudio={isPlayingAudio}
          onToggleAudio={handleToggleAudio}
          onOpenGeminiKey={() => {
            setSettingsInitialTab('ai');
            openSettings();
          }}
          hasGeminiKey={hasGeminiKey}
          onOpenSettings={openSettings}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          showBookmarksOnly={showBookmarksOnly}
          onToggleBookmarks={() => setShowBookmarksOnly((prev) => !prev)}
          savedArticlesCount={feedback.savedArticleIds?.length || 0}
          onScrollToDiscover={() => {
            setSelectedTopicFilter('all');
            if (showBookmarksOnly) setShowBookmarksOnly(false);
            setTimeout(() => {
              const el = document.getElementById('outside-your-bubble');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          }}
        />

      {/* Secondary Search & Filter Bar (Screen only) */}
      <div className={`${readingWidthClass} mx-auto px-4 sm:px-6 w-full py-2.5 no-print`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--bg-surface-elevated)] p-2.5 rounded border border-[var(--border-subtle)]">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
            <input
              id="search-articles-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter stories by subject or keyword..."
              className="w-full pl-8 pr-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-sans text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-primary)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs cursor-pointer"
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
                  ? 'bg-[var(--accent-subtle)] border-[var(--accent-primary)] text-[var(--accent-text)] font-bold'
                  : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-subtle)]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Saved Clippings ({feedback.savedArticleIds.length})</span>
            </button>

            {activeEdition && (
              <button
                onClick={handleResetToLive}
                className="flex items-center space-x-1 px-2.5 py-1 bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--accent-border)] rounded hover:opacity-90 font-medium cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Exit Archive</span>
              </button>
            )}

            <span className="text-[var(--text-muted)] hidden md:inline">
              Showing <strong>{rankedArticles.length}</strong> curated reports
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Broadsheet */}
      <main className={`${readingWidthClass} mx-auto px-4 sm:px-6 w-full flex-1 py-4 print-broadsheet`}>
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
            {/* =========================================================================
                EDITION-SPECIFIC MASTHEAD BAR & CONTEXTUAL PRINT / PDF CONTROL
                Belongs to the specific newspaper edition currently being viewed.
                ========================================================================= */}
            <div className="no-print mb-6 pb-3 border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-surface)] p-3 sm:p-4 rounded-lg border">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-md bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
                  <Newspaper className="w-5 h-5 text-[var(--accent-primary)]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent-text)] font-semibold border border-[var(--accent-border)]">
                      {currentEditionMeta.isArchive ? 'Archived Edition' : 'Active Edition'}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-serif italic truncate hidden sm:inline">
                      {currentEditionMeta.date}
                    </span>
                  </div>
                  <h2 className="font-headline text-lg sm:text-xl font-bold text-[var(--text-primary)] leading-tight truncate mt-0.5">
                    {currentEditionMeta.editionName}
                  </h2>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-xs font-sans text-[var(--text-muted)] hidden md:inline">
                  {rankedArticles.length} {rankedArticles.length === 1 ? 'story' : 'stories'}
                </span>
                {/* Contextual Edition Print / PDF Button */}
                <button
                  type="button"
                  id="btn-print-edition"
                  data-edition-id={currentEditionMeta.id}
                  data-edition-name={currentEditionMeta.editionName}
                  onClick={handleTriggerEditionPrint}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-page)] text-[var(--text-primary)] transition-all text-xs font-sans font-bold cursor-pointer shadow-xs group"
                  title={`Print or Save PDF: ${currentEditionMeta.editionName}`}
                >
                  <Printer className="w-3.5 h-3.5 text-[var(--accent-primary)] group-hover:text-inherit shrink-0" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            {/* =========================================================================
                PRINT-ONLY BROADSHEET MASTHEAD
                Rendered strictly during browser print / PDF export of this edition.
                ========================================================================= */}
            <div className="print-only hidden print:block mb-8 pb-4 border-b-2 border-black font-serif">
              <div className="flex items-center justify-between border-b border-black pb-1.5 mb-3 text-[10pt] font-sans font-bold uppercase tracking-widest text-black">
                <span>DAYMARK</span>
                <span>{currentEditionMeta.date}</span>
                <span>{currentEditionMeta.editionName}</span>
              </div>
              <div className="text-center py-2">
                <h1 className="font-headline text-5xl font-black uppercase tracking-tight text-black leading-none">
                  DAYMARK
                </h1>
                <div className="text-sm italic font-serif text-black mt-1">
                  Your world, clearly delivered.
                </div>
                <div className="mt-3 inline-block border-y border-black py-1 px-6 text-xs font-sans font-bold uppercase tracking-[0.2em] text-black">
                  {currentEditionMeta.editionName} • {rankedArticles.length} Stories Included
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-black pt-1.5 mt-3 text-[8pt] font-mono uppercase tracking-wider text-black">
                <span>Subscriber: {preferences.readerName || 'Personal Broadsheet'}</span>
                <span>Desks: {preferences.selectedTopics.join(', ')}</span>
                <span>Format: Broadsheet Archival PDF</span>
              </div>
            </div>
            {/* 1. TODAY'S 3 KEY TAKEAWAYS — THE MORNING BRIEFING BOX */}
            {keyTakeaways.length > 0 && selectedTopicFilter === 'all' && (
              <section className="mb-8 p-5 sm:p-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded shadow-2xs print-break-inside-avoid">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4 flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
                    <span className="font-sans font-bold text-[11px] uppercase tracking-[0.25em] text-[var(--accent-primary)]">
                      Executive Intelligence • 30-Second Morning Briefing
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleSynthesizeWithGemini}
                      disabled={isAiTakeawaysLoading}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[var(--accent-subtle)] hover:opacity-90 text-[var(--accent-text)] border border-[var(--accent-border)] text-xs font-sans font-semibold transition-colors cursor-pointer disabled:opacity-50"
                      title={hasGeminiKey ? 'Synthesize with Google Gemini 1.5 Flash' : 'Configure Free Gemini AI Key'}
                    >
                      <Sparkles className={`w-3.5 h-3.5 text-[var(--accent-primary)] ${isAiTakeawaysLoading ? 'animate-spin' : ''}`} />
                      <span>{isAiTakeawaysLoading ? 'Synthesizing...' : aiTakeaways ? 'Regenerate with Gemini' : 'Synthesize with Gemini AI'}</span>
                    </button>
                    {aiTakeaways && (
                      <span className="text-[10px] bg-[var(--accent-border)] text-[var(--accent-text)] px-2 py-0.5 rounded font-mono font-medium">
                        Gemini 1.5 Flash
                      </span>
                    )}
                  </div>
                </div>

                <h2 className={`${headlineFontClass} text-2xl font-bold text-[var(--text-primary)] mb-4`}>
                  Today&apos;s 3 Key Takeaways
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(aiTakeaways || keyTakeaways).map((item) => (
                    <div
                      key={item.number}
                      className="p-4 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-sans text-[var(--accent-primary)] uppercase tracking-wider font-bold mb-1.5">
                          <span>Takeaway #{item.number}</span>
                          <span className="text-[var(--text-muted)] font-normal">[{item.category}]</span>
                        </div>
                        <h4 className={`${headlineFontClass} text-sm font-bold text-[var(--text-primary)] leading-snug mb-2 hover:text-[var(--accent-primary)] transition-colors`}>
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            {item.title}
                          </a>
                        </h4>
                        <p className="font-serif text-xs text-[var(--text-secondary)] leading-relaxed">
                          {item.takeaway}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-sans text-[var(--text-muted)]">
                        <span>Via {item.source}</span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent-primary)] font-semibold hover:underline"
                        >
                          Read Source →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 2. REAL-TIME AI INTEREST DISCOVERY & ADAPTIVE SUGGESTIONS BANNER */}
            {suggestedInterests.filter((s) => !s.dismissed && !s.accepted).length > 0 && selectedTopicFilter === 'all' && (
              <section className="mb-8 p-5 sm:p-6 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded shadow-2xs print-break-inside-avoid">
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-3 flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <BrainCircuit className="w-4 h-4 text-[var(--accent-primary)] animate-pulse" />
                    <span className="font-sans font-bold text-[11px] uppercase tracking-[0.2em] text-[var(--accent-primary)]">
                      Real-Time AI Interest Discovery • Adaptive Editorial Engine
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-[var(--accent-subtle)] text-[var(--accent-text)] px-2 py-0.5 rounded font-semibold border border-[var(--accent-border)]">
                    Learns in real-time as you read
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1">
                  <h3 className={`${headlineFontClass} text-xl font-bold text-[var(--text-primary)]`}>
                    Emerging Curiosities Tailored to Your Live Reading Signals
                  </h3>
                  <span className="text-xs text-[var(--text-muted)] font-serif italic">
                    Click + to adopt into your daily newspaper desks
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {suggestedInterests
                    .filter((s) => !s.dismissed && !s.accepted)
                    .slice(0, 3)
                    .map((sug) => (
                      <div
                        key={sug.id}
                        className="p-3.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded flex flex-col justify-between hover:border-[var(--accent-primary)] transition-colors shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-sans uppercase tracking-wider mb-1.5">
                            <span className="font-mono font-bold text-[var(--accent-primary)] bg-[var(--accent-subtle)] px-1.5 py-0.5 rounded">
                              {sug.confidence}% Match
                            </span>
                            <span className="text-[var(--text-muted)] font-serif italic">{sug.category}</span>
                          </div>
                          <h4 className={`${headlineFontClass} text-sm font-bold text-[var(--text-primary)] leading-snug mb-1`}>
                            {sug.topic}
                          </h4>
                          <p className="font-serif text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
                            {sug.reason}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 pt-2 border-t border-[var(--border-subtle)]">
                          <button
                            type="button"
                            onClick={() => handleAcceptSuggestedInterest(sug.topic, sug.category)}
                            className="flex-1 py-1.5 px-2 bg-[var(--accent-primary)] hover:opacity-90 text-white rounded text-xs font-sans font-bold flex items-center justify-center space-x-1 transition-opacity cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Desks</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDismissSuggestedInterest(sug.topic)}
                            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
                            title="Dismiss suggestion"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* FRONT PAGE BROADSHEET LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8 border-b border-[var(--border-subtle)]">
              {/* PRIMARY BROADSHEET COLUMN (Cols 1-8) */}
              <div className="lg:col-span-8 lg:border-r lg:border-[var(--border-subtle)] lg:pr-8">
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
                    onRead={(a) => setReadingArticle(a)}
                    isLiked={feedback.likedArticleIds.includes(leadArticle.id)}
                    isDisliked={feedback.dislikedArticleIds.includes(leadArticle.id)}
                    isBookmarked={feedback.savedArticleIds.includes(leadArticle.id)}
                  />
                )}

                {/* 2. Secondary Stories */}
                {secondaryArticles.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-[var(--accent-primary)]">
                        Front Page Reports
                      </span>
                      <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                    </div>

                    <div className={secondaryLayoutClass}>
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
                          onRead={(a) => setReadingArticle(a)}
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
                <div className="bg-[var(--bg-surface)] p-5 rounded border border-[var(--border-subtle)] shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 mb-4">
                    <span className="font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-[var(--text-primary)] flex items-center">
                      <span className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full mr-1.5 animate-pulse" />
                      The Morning Wire
                    </span>
                    <span className="text-[10px] font-sans text-[var(--text-muted)]">Live Wire Reports</span>
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
                        onRead={(a) => setReadingArticle(a)}
                        isLiked={feedback.likedArticleIds.includes(article.id)}
                        isDisliked={feedback.dislikedArticleIds.includes(article.id)}
                        isBookmarked={feedback.savedArticleIds.includes(article.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Daily Reflection Box */}
                <div className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] p-5 rounded shadow-2xs text-center">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[var(--accent-primary)] block mb-2">
                    Daily Reflection
                  </span>
                  <blockquote className="font-serif italic text-sm text-[var(--text-primary)] leading-relaxed">
                    &ldquo;Knowledge becomes wisdom only when balanced by diverse perspectives and quiet contemplation.&rdquo;
                  </blockquote>
                  <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-sans text-[var(--text-muted)]">
                    <span>DAYMARK Editorial Desk</span>
                    <span className="font-serif italic text-[11px] text-[var(--text-muted)]">Daily Edition</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. OUTSIDE YOUR BUBBLE (BLINDSPOT SECTION) */}
            {blindspotArticle && selectedTopicFilter === 'all' && (
              <section id="outside-your-bubble" className="my-10 p-6 bg-[var(--accent-subtle)] border border-[var(--accent-border)] rounded-lg print-break-inside-avoid">
                <div className="flex flex-wrap items-center justify-between border-b border-[var(--accent-border)] pb-3 mb-4 gap-2">
                  <div className="flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-[var(--accent-primary)]" />
                    <span className="font-sans font-bold text-[11px] uppercase tracking-[0.2em] text-[var(--accent-text)]">
                      Outside Your Bubble • Intellectual Blindspot Breaker
                    </span>
                  </div>
                  <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--accent-primary)] font-bold border border-[var(--accent-border)]">
                    Uncurated Desk: {blindspotArticle.category.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8">
                    <span className="text-xs font-serif italic text-[var(--text-muted)] mb-1 block">
                      Curated outside your primary {preferences.selectedTopics.length} selected focus areas to challenge intellectual complacency:
                    </span>
                    <h3 className={`${headlineFontClass} text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-tight mb-2 hover:text-[var(--accent-primary)] transition-colors`}>
                      <button
                        type="button"
                        onClick={() => setReadingArticle(blindspotArticle)}
                        className="text-left cursor-pointer hover:text-[var(--accent-primary)]"
                      >
                        {blindspotArticle.title}
                      </button>
                    </h3>
                    <p className="font-serif text-sm text-[var(--text-secondary)] leading-relaxed">
                      {blindspotArticle.description}
                    </p>
                    <div className="flex items-center space-x-3 text-xs font-sans text-[var(--text-muted)] mt-3">
                      <span className="font-medium text-[var(--text-primary)]">Reporting by {blindspotArticle.source.name}</span>
                      <span>•</span>
                      <span>{blindspotArticle.readTimeMinutes} min read</span>
                    </div>
                  </div>
                  <div className="md:col-span-4 flex flex-col items-start md:items-end justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReadingArticle(blindspotArticle)}
                      className="px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-page)] text-xs font-sans font-bold rounded flex items-center space-x-1.5 transition-opacity hover:opacity-90 cursor-pointer"
                    >
                      <span>Read Outside Perspective</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-serif italic text-[var(--text-muted)]">
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
                  onRead={(a) => setReadingArticle(a)}
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
                  onRead={(a) => setReadingArticle(a)}
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
                  onRead={(a) => setReadingArticle(a)}
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
                  onRead={(a) => setReadingArticle(a)}
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
                    onRead={(a) => setReadingArticle(a)}
                    likedIds={feedback.likedArticleIds}
                    dislikedIds={feedback.dislikedArticleIds}
                    bookmarkedIds={feedback.savedArticleIds}
                  />
                )}
              </div>
            )}

            {/* Edition Bottom Bar with Contextual Print / PDF Button */}
            <div className="no-print mt-12 pt-6 pb-2 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans text-[var(--text-secondary)]">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[var(--text-primary)]">{currentEditionMeta.editionName}</span>
                <span>•</span>
                <span>End of Edition ({rankedArticles.length} stories)</span>
              </div>
              <button
                type="button"
                id="btn-print-edition-bottom"
                data-edition-id={currentEditionMeta.id}
                onClick={handleTriggerEditionPrint}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all text-xs font-sans font-medium cursor-pointer shadow-xs"
                title={`Print or Save PDF: ${currentEditionMeta.editionName}`}
              >
                <Printer className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                <span>Print / PDF — {currentEditionMeta.editionName}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* DAYMARK COLOPHON & FOOTER */}
      <footer className="w-full bg-[var(--bg-surface-elevated)] border-t border-[var(--border-subtle)] py-10 mt-16 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h4 className={`${headlineFontClass} text-2xl font-black text-[var(--text-primary)] tracking-tight`}>
            {preferences.newspaperTitle || 'DAYMARK'}
          </h4>
          <p className="text-xs font-serif italic text-[var(--text-secondary)] mt-1 max-w-lg mx-auto leading-relaxed">
            Your world, clearly delivered. Personalized daily for {currentUser?.name || preferences.readerName || 'our readers'} • Sourced from BBC News, The New York Times, Ars Technica, and NPR.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-serif text-[var(--text-muted)]">
            <Link href="/dashboard" className="text-[var(--accent-primary)] font-bold hover:underline">
              Page Directory
            </Link>
            <span>•</span>
            <Link href="/archive" className="hover:text-[var(--text-primary)] transition-colors">
              Archive
            </Link>
            <span>•</span>
            <Link href="/profile" className="hover:text-[var(--text-primary)] transition-colors">
              Reader Profile
            </Link>
            <span>•</span>
            <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">
              About Us
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <span>Zero Tracking</span>
            <span>•</span>
            <span>100% Client-Side Sovereignty</span>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] font-sans no-print flex items-center justify-center space-x-3">
            <span>Click &ldquo;Print / PDF&rdquo; to download an archival broadsheet or save as PDF.</span>
            <span>•</span>
            <button
              onClick={openSettings}
              className="text-[var(--accent-primary)] hover:underline font-bold cursor-pointer inline-flex items-center space-x-1"
            >
              <Sliders className="w-3 h-3 mr-0.5" />
              <span>Customize Daymark</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Customizable Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          closeSettings();
          setSettingsInitialTab('appearance');
        }}
        preferences={preferences}
        onSavePreferences={handleSavePreferences}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onShowToast={showToast}
        initialTab={settingsInitialTab}
        onKeySaved={() => {
          setHasGeminiKey(!!getGeminiApiKey());
        }}
      />

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
        newspaperTitle={preferences.newspaperTitle || 'DAYMARK'}
        editionName={currentEditionMeta.editionName}
        editionDate={currentEditionMeta.date}
        articleCount={rankedArticles.length}
      />

      {/* Gemini AI Key Configuration Modal */}
      <GeminiKeyModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        onKeySaved={() => {
          setHasGeminiKey(!!getGeminiApiKey());
          showToast('Google Gemini API Key saved!');
        }}
      />

      {/* Sticky Audio Briefing Player Bar */}
      <StickyAudioPlayer
        isPlaying={isPlayingAudio}
        onTogglePlay={handleToggleAudio}
        onStop={() => {
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          setIsPlayingAudio(false);
        }}
        currentStoryTitle={rankedArticles[0]?.title || 'Morning Audio Briefing'}
        sourceName={rankedArticles[0]?.source.name || 'DAYMARK Audio Wire'}
      />

      {/* Distraction-Free Editorial Article Reader Modal */}
      <ArticleReaderModal
        article={readingArticle}
        onClose={() => setReadingArticle(null)}
        onLike={handleLike}
        onDislike={handleDislike}
        onBookmark={handleBookmark}
        onWhyThis={(a) => setWhyThisArticle(a)}
        onSelectRelated={(a) => setReadingArticle(a)}
        allArticles={rankedArticles}
        isLiked={readingArticle ? feedback.likedArticleIds.includes(readingArticle.id) : false}
        isDisliked={readingArticle ? feedback.dislikedArticleIds.includes(readingArticle.id) : false}
        isBookmarked={readingArticle ? feedback.savedArticleIds.includes(readingArticle.id) : false}
        onShowToast={showToast}
      />
      </div>
    </div>
  );
}
