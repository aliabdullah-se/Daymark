export type NewsTopic = 
  | 'world'
  | 'technology'
  | 'business'
  | 'science'
  | 'culture'
  | 'health'
  | 'environment'
  | 'opinion';

export interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  source: {
    name: string;
    domain?: string;
  };
  category: NewsTopic;
  publishedAt: string;
  imageUrl?: string;
  author?: string;
  readTimeMinutes: number;
  relevanceScore?: number;
  rankingReason?: string;
  matchedKeywords?: string[];
}

export interface UserPreferences {
  readerName: string;
  newspaperTitle: string;
  selectedTopics: NewsTopic[];
  customInterests: string[];
  readingPace: 'quick' | 'standard' | 'deep'; // quick: 5min, standard: 15min, deep: 30min
  onboarded: boolean;
  theme?: 'vintage' | 'modern' | 'sepia' | 'dark';
}

export interface UserFeedback {
  likedArticleIds: string[];
  dislikedArticleIds: string[];
  skippedArticleIds: string[];
  savedArticleIds: string[];
  topicAffinities: Record<string, number>; // -5 to +5
  keywordAffinities: Record<string, number>; // -5 to +5
}

export interface SavedEdition {
  id: string;
  dateStr: string;
  savedAt: string;
  title: string;
  leadHeadline: string;
  articlesCount: number;
  articles: Article[];
  preferencesSnapshot: UserPreferences;
}

export interface TopicMeta {
  id: NewsTopic;
  label: string;
  description: string;
  iconName: string;
}

export const AVAILABLE_TOPICS: TopicMeta[] = [
  { id: 'technology', label: 'Technology & AI', description: 'Computing, artificial intelligence, startups & software', iconName: 'Cpu' },
  { id: 'world', label: 'World Affairs', description: 'Global geopolitics, international relations & diplomatic affairs', iconName: 'Globe' },
  { id: 'business', label: 'Markets & Economy', description: 'Finance, macroeconomics, industry analysis & enterprise', iconName: 'TrendingUp' },
  { id: 'science', label: 'Science & Discovery', description: 'Space exploration, physics, biotechnology & fundamental research', iconName: 'Atom' },
  { id: 'culture', label: 'Arts & Culture', description: 'Literature, cinema, architecture, music & essays', iconName: 'BookOpen' },
  { id: 'health', label: 'Health & Medicine', description: 'Public health, medical research, wellness & longevity', iconName: 'HeartPulse' },
  { id: 'environment', label: 'Climate & Earth', description: 'Renewable energy, ecology, planetary sciences & sustainability', iconName: 'Leaf' },
  { id: 'opinion', label: 'Commentary & Ideas', description: 'In-depth perspectives, essays & editorial analysis', iconName: 'PenTool' },
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  readerName: 'Morning Reader',
  newspaperTitle: 'THE MORNING CHRONICLE',
  selectedTopics: ['technology', 'world', 'business', 'science'],
  customInterests: ['Artificial Intelligence', 'Space Exploration', 'Clean Energy'],
  readingPace: 'standard',
  onboarded: false,
  theme: 'vintage',
};
