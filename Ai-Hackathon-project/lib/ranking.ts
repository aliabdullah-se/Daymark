import { Article, UserPreferences, UserFeedback } from '@/types/news';

export interface ScoredArticle extends Article {
  relevanceScore: number;
  rankingReason: string;
  matchedKeywords: string[];
  scoreBreakdown: {
    topicScore: number;
    keywordScore: number;
    recencyScore: number;
    paceScore: number;
    feedbackScore: number;
    total: number;
  };
}

export function rankArticles(
  articles: Article[],
  preferences: UserPreferences,
  feedback: UserFeedback,
  includeSkipped: boolean = false
): ScoredArticle[] {
  const scored = articles
    .filter((art) => {
      if (!includeSkipped && feedback.skippedArticleIds.includes(art.id)) {
        return false;
      }
      return true;
    })
    .map((article) => {
      let topicScore = 0;
      let keywordScore = 0;
      let recencyScore = 0;
      let paceScore = 0;
      let feedbackScore = 0;
      const matchedKeywords: string[] = [];
      const reasons: string[] = [];

      const textToSearch = `${article.title} ${article.description}`.toLowerCase();

      // 1. Topic Score (Base 0 - 30)
      const isSelectedTopic = preferences.selectedTopics.includes(article.category);
      if (isSelectedTopic) {
        topicScore += 20;
        reasons.push(`Selected topic (${article.category})`);
      } else {
        topicScore += 5; // general discovery
      }

      // Add dynamic topic affinity from feedback
      const affinity = feedback.topicAffinities[article.category] || 0;
      const topicAffinityScore = affinity * 2.5; // -12.5 to +12.5
      topicScore += topicAffinityScore;
      if (affinity > 0) {
        reasons.push(`High engagement with ${article.category}`);
      }

      // 2. Custom Interests Match (0 - 35)
      for (const interest of preferences.customInterests) {
        const cleanInterest = interest.trim().toLowerCase();
        if (!cleanInterest) continue;

        // Exact phrase match
        if (textToSearch.includes(cleanInterest)) {
          keywordScore += 16;
          matchedKeywords.push(interest);
        } else {
          // Token matches
          const tokens = cleanInterest.split(/\s+/).filter((t) => t.length > 3);
          const hasTokenMatch = tokens.some((token) => textToSearch.includes(token));
          if (hasTokenMatch) {
            keywordScore += 8;
            matchedKeywords.push(interest);
          }
        }
      }

      // Keyword affinities from feedback
      for (const [kw, aff] of Object.entries(feedback.keywordAffinities)) {
        if (textToSearch.includes(kw.toLowerCase())) {
          keywordScore += aff * 3;
        }
      }
      keywordScore = Math.min(Math.max(keywordScore, 0), 35);
      if (matchedKeywords.length > 0) {
        reasons.push(`Matches interest: "${matchedKeywords.slice(0, 2).join('", "')}"`);
      }

      // 3. Recency Score (0 - 20)
      const pubDate = new Date(article.publishedAt);
      const hoursAgo = Math.max(0, (Date.now() - pubDate.getTime()) / (1000 * 60 * 60));
      if (hoursAgo <= 3) {
        recencyScore = 20;
        reasons.push('Just in (under 3h ago)');
      } else if (hoursAgo <= 6) {
        recencyScore = 16;
        reasons.push('Fresh (under 6h ago)');
      } else if (hoursAgo <= 12) {
        recencyScore = 12;
      } else if (hoursAgo <= 24) {
        recencyScore = 8;
      } else {
        recencyScore = 4;
      }

      // 4. Reading Pace Alignment (0 - 10)
      if (preferences.readingPace === 'quick') {
        paceScore = article.readTimeMinutes <= 3 ? 10 : article.readTimeMinutes <= 5 ? 6 : 2;
      } else if (preferences.readingPace === 'deep') {
        paceScore = article.readTimeMinutes >= 5 ? 10 : 5;
      } else {
        // standard
        paceScore = article.readTimeMinutes >= 3 && article.readTimeMinutes <= 6 ? 10 : 6;
      }

      // 5. Direct Feedback (Likes / Dislikes)
      if (feedback.likedArticleIds.includes(article.id)) {
        feedbackScore += 20;
        reasons.push('You liked this');
      }
      if (feedback.dislikedArticleIds.includes(article.id)) {
        feedbackScore -= 45;
        reasons.push('Previously downvoted');
      }

      const totalRaw = topicScore + keywordScore + recencyScore + paceScore + feedbackScore;
      // Clamp 5 to 99 for a polished percentage display
      const total = Math.min(Math.max(Math.round(totalRaw), 5), 99);

      let rankingReason = '';
      if (reasons.length > 0) {
        rankingReason = reasons.slice(0, 2).join(' • ');
      } else {
        rankingReason = 'Curated general interest from morning wire';
      }

      return {
        ...article,
        relevanceScore: total,
        rankingReason,
        matchedKeywords: Array.from(new Set(matchedKeywords)),
        scoreBreakdown: {
          topicScore: Math.round(topicScore),
          keywordScore: Math.round(keywordScore),
          recencyScore: Math.round(recencyScore),
          paceScore: Math.round(paceScore),
          feedbackScore: Math.round(feedbackScore),
          total,
        },
      };
    });

  // Sort by relevance score descending
  return scored.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
}
