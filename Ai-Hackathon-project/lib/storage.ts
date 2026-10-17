import {
  UserPreferences,
  UserFeedback,
  SavedEdition,
  DEFAULT_PREFERENCES,
  Article,
  UserAccount,
  LearningSignal,
  DEMO_JUDGE_USER,
} from '@/types/news';

export { DEMO_JUDGE_USER };

const USERS_KEY = 'daymark_users';
const CURRENT_USER_KEY = 'daymark_current_user';
const PREFS_KEY = 'daymark_preferences';
const LEGACY_PREFS_KEY = 'morning_chronicle_preferences';
const FEEDBACK_KEY = 'daymark_feedback';
const LEGACY_FEEDBACK_KEY = 'morning_chronicle_feedback';
const EDITIONS_KEY = 'daymark_saved_editions';
const LEGACY_EDITIONS_KEY = 'morning_chronicle_saved_editions';
const SIGNALS_KEY = 'daymark_signals';

export const INITIAL_FEEDBACK: UserFeedback = {
  likedArticleIds: [],
  dislikedArticleIds: [],
  skippedArticleIds: [],
  savedArticleIds: [],
  topicAffinities: {
    technology: 1.5,
    world: 1.0,
    science: 1.2,
    business: 0.8,
  },
  keywordAffinities: {
    'Artificial Intelligence': 2,
    'Clean Energy': 1.5,
    'Space Exploration': 1.5,
  },
};

// 1. USER ACCOUNT & AUTHENTICATION
export function getStoredUsers(): UserAccount[] {
  if (typeof window === 'undefined') return [DEMO_JUDGE_USER];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      // Seed with demo judge user so instant judge login always works
      const initial = [DEMO_JUDGE_USER];
      localStorage.setItem(USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed: UserAccount[] = JSON.parse(raw);
    if (!parsed.some((u) => u.email.toLowerCase() === DEMO_JUDGE_USER.email.toLowerCase())) {
      parsed.push(DEMO_JUDGE_USER);
      localStorage.setItem(USERS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load users from storage:', e);
    return [DEMO_JUDGE_USER];
  }
}

export function saveStoredUser(user: UserAccount): void {
  if (typeof window === 'undefined') return;
  try {
    const users = getStoredUsers();
    const existingIndex = users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save user:', e);
  }
}

export function getCurrentUser(): UserAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get current user:', e);
    return null;
  }
}

export function setCurrentUser(user: UserAccount | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to set current user:', e);
  }
}

export function logoutUser(): void {
  setCurrentUser(null);
}

// 2. PREFERENCES STORAGE
export function getStoredPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(PREFS_KEY) || localStorage.getItem(LEGACY_PREFS_KEY);
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

// 3. FEEDBACK & LEARNING AFFINITIES
export function getStoredFeedback(): UserFeedback {
  if (typeof window === 'undefined') return INITIAL_FEEDBACK;
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY) || localStorage.getItem(LEGACY_FEEDBACK_KEY);
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

// 4. LEARNING SIGNALS LOG
export const SEED_SIGNALS: LearningSignal[] = [
  {
    id: 'sig-seed-1',
    type: 'calibrate',
    articleTitle: 'Initial Morning Broadsheet Onboarding',
    topic: 'technology',
    timestamp: new Date(Date.now() - 3600 * 1000 * 16).toISOString(),
    impactDescription: 'Calibrated base intellectual lenses across Tech (+20 pts) and Science (+20 pts).',
  },
  {
    id: 'sig-seed-2',
    type: 'upvote',
    articleTitle: 'Solid-State Electrolyte Breakthrough Extends Grid Storage Longevity',
    topic: 'technology',
    timestamp: new Date(Date.now() - 3600 * 1000 * 9).toISOString(),
    impactDescription: 'Boosted Clean Energy and Battery Technology keyword weights (+15% affinity).',
  },
  {
    id: 'sig-seed-3',
    type: 'save',
    articleTitle: 'Global Treaty on Subsea Infrastructure Protection Approved in Geneva',
    topic: 'world',
    timestamp: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    impactDescription: 'Saved to clippings; elevated Geopolitics and Critical Infrastructure relevance.',
  },
  {
    id: 'sig-seed-4',
    type: 'skip',
    articleTitle: 'Speculative Social Trend Analysis in High Fashion Brands',
    topic: 'culture',
    timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    impactDescription: 'Dismissed from paper; deprioritized lifestyle and fashion coverage (-10% penalty).',
  },
];

export function getLearningSignals(): LearningSignal[] {
  if (typeof window === 'undefined') return SEED_SIGNALS;
  try {
    const raw = localStorage.getItem(SIGNALS_KEY);
    if (!raw) {
      localStorage.setItem(SIGNALS_KEY, JSON.stringify(SEED_SIGNALS));
      return SEED_SIGNALS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load learning signals:', e);
    return SEED_SIGNALS;
  }
}

export function addLearningSignal(signal: Omit<LearningSignal, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLearningSignals();
    const newSignal: LearningSignal = {
      ...signal,
      id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newSignal, ...existing].slice(0, 50);
    localStorage.setItem(SIGNALS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to record learning signal:', e);
  }
}

// 5. EDITIONS ARCHIVE WITH RICH PRE-SEEDED PAST EDITIONS
export const SEED_EDITIONS: SavedEdition[] = [
  {
    id: 'edition-yesterday',
    dateStr: new Date(Date.now() - 86400000).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    savedAt: new Date(Date.now() - 86400000).toISOString(),
    title: 'DAYMARK',
    editionNumber: 'VOL. XII / NO. 41',
    leadHeadline: 'Autonomous Solar Concentrators Achieve Sustained Thermal Parity Across 5 Continents',
    articlesCount: 14,
    takeaways: [
      'Next-generation solar thermal arrays achieve 42% cost reduction in pilot industrial smelters.',
      'International maritime authority adopts real-time satellite emissions audits with zero grace periods.',
      'Open-source scientific models accelerate molecular dynamic simulations by two orders of magnitude.',
    ],
    preferencesSnapshot: {
      ...DEFAULT_PREFERENCES,
      readerName: 'Judge Vance',
      newspaperTitle: 'DAYMARK',
    },
    articles: [
      {
        id: 'seed-art-1',
        title: 'Autonomous Solar Concentrators Achieve Sustained Thermal Parity Across 5 Continents',
        description: 'Engineers report that dual-axis robotic heliostats paired with molten salt reservoirs have crossed commercial viability thresholds for round-the-clock baseload delivery.',
        url: 'https://www.bbc.com/news/science-environment',
        source: { name: 'BBC News' },
        category: 'science',
        publishedAt: new Date(Date.now() - 90000000).toISOString(),
        readTimeMinutes: 5,
        relevanceScore: 94,
        rankingReason: 'Matches interest in Clean Energy and Science focus',
      },
      {
        id: 'seed-art-2',
        title: 'Open Source Molecular Dynamics Framework Solves Enzyme Folding in Milliseconds',
        description: 'A global academic consortium has released an ultra-scalable simulation engine capable of predicting complex co-factor bindings without proprietary GPU locks.',
        url: 'https://arstechnica.com/science',
        source: { name: 'Ars Technica' },
        category: 'technology',
        publishedAt: new Date(Date.now() - 95000000).toISOString(),
        readTimeMinutes: 4,
        relevanceScore: 91,
        rankingReason: 'Selected topic Technology & AI with high keyword affinity',
      },
      {
        id: 'seed-art-3',
        title: 'Global Semiconductor Supply Chains Standardize on Recycled Ultra-Pure Water Systems',
        description: 'New manufacturing directives mandate closed-loop water treatment in advanced wafer fabs, reducing municipal water intake by 88%.',
        url: 'https://www.nytimes.com/section/technology',
        source: { name: 'The New York Times' },
        category: 'business',
        publishedAt: new Date(Date.now() - 98000000).toISOString(),
        readTimeMinutes: 6,
        relevanceScore: 88,
        rankingReason: 'Selected topic Markets & Economy with industrial impact',
      },
    ],
  },
  {
    id: 'edition-two-days-ago',
    dateStr: new Date(Date.now() - 172800000).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    savedAt: new Date(Date.now() - 172800000).toISOString(),
    title: 'DAYMARK',
    editionNumber: 'VOL. XII / NO. 40',
    leadHeadline: 'Deep-Space Spectrograph Confirms Prebiotic Molecular Signatures in Ocean World Plumes',
    articlesCount: 12,
    takeaways: [
      'High-resolution orbital mass spectrometry detects amino acid precursors in oceanic cryogenic plumes.',
      'Central banks test quantum-resistant cryptographic ledgers for cross-border wholesale settlement.',
      'Public health agencies report historic 60% decline in vector-borne infections following precision biocontrol rollout.',
    ],
    preferencesSnapshot: {
      ...DEFAULT_PREFERENCES,
      readerName: 'Judge Vance',
      newspaperTitle: 'DAYMARK',
    },
    articles: [
      {
        id: 'seed-art-4',
        title: 'Deep-Space Spectrograph Confirms Prebiotic Molecular Signatures in Ocean World Plumes',
        description: 'Scientists analyzing flyby data have verified the presence of complex organic molecules and volatile hydrogen compounds escaping subsurface hydrothermal vents.',
        url: 'https://www.npr.org/sections/science',
        source: { name: 'NPR News' },
        category: 'science',
        publishedAt: new Date(Date.now() - 180000000).toISOString(),
        readTimeMinutes: 5,
        relevanceScore: 96,
        rankingReason: 'Top match for Space Exploration interest',
      },
      {
        id: 'seed-art-5',
        title: 'Quantum-Resistant Cryptographic Standards Finalized for International Settlement',
        description: 'Financial institutions have begun deploying lattice-based digital signatures across interbank transfer rails to safeguard against future decryption threats.',
        url: 'https://arstechnica.com/information-technology',
        source: { name: 'Ars Technica' },
        category: 'technology',
        publishedAt: new Date(Date.now() - 185000000).toISOString(),
        readTimeMinutes: 4,
        relevanceScore: 89,
        rankingReason: 'Selected topic Technology & AI',
      },
    ],
  },
];

export function getStoredEditions(): SavedEdition[] {
  if (typeof window === 'undefined') return SEED_EDITIONS;
  try {
    const raw = localStorage.getItem(EDITIONS_KEY) || localStorage.getItem(LEGACY_EDITIONS_KEY);
    if (!raw) {
      // Seed rich archives immediately
      localStorage.setItem(EDITIONS_KEY, JSON.stringify(SEED_EDITIONS));
      return SEED_EDITIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(EDITIONS_KEY, JSON.stringify(SEED_EDITIONS));
      return SEED_EDITIONS;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load saved editions:', e);
    return SEED_EDITIONS;
  }
}

export function saveCurrentEdition(edition: SavedEdition): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredEditions();
    const filtered = existing.filter((e) => e.id !== edition.id);
    const updated = [edition, ...filtered].slice(0, 30);
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
