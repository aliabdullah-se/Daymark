import { UserPreferences, UserFeedback, SavedEdition, DEFAULT_PREFERENCES, Article } from '@/types/news';

const PREFS_KEY = 'morning_chronicle_preferences';
const FEEDBACK_KEY = 'morning_chronicle_feedback';
const EDITIONS_KEY = 'morning_chronicle_saved_editions';

export const INITIAL_FEEDBACK: UserFeedback = {
  likedArticleIds: [],
  dislikedArticleIds: [],
  skippedArticleIds: [],
  savedArticleIds: [],
  topicAffinities: {},
  keywordAffinities: {},
};

export function getStoredPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load preferences from storage:', e);
    return DEFAULT_PREFERENCES;
  }
}

export function saveStoredPreferences(prefs: UserPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences to storage:', e);
  }
}

export function getStoredFeedback(): UserFeedback {
  if (typeof window === 'undefined') return INITIAL_FEEDBACK;
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    if (!raw) return INITIAL_FEEDBACK;
    return { ...INITIAL_FEEDBACK, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load feedback from storage:', e);
    return INITIAL_FEEDBACK;
  }
}

export function saveStoredFeedback(feedback: UserFeedback): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback));
  } catch (e) {
    console.error('Failed to save feedback to storage:', e);
  }
}

export function getStoredEditions(): SavedEdition[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EDITIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved editions:', e);
    return [];
  }
}

export function saveCurrentEdition(edition: SavedEdition): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredEditions();
    // Keep max 20 saved editions
    const filtered = existing.filter((e) => e.id !== edition.id);
    const updated = [edition, ...filtered].slice(0, 20);
    localStorage.setItem(EDITIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save edition to storage:', e);
  }
}

export function deleteStoredEdition(editionId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredEditions();
    const updated = existing.filter((e) => e.id !== editionId);
    localStorage.setItem(EDITIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete edition from storage:', e);
  }
}
