import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { rankArticles } from '@/lib/ranking';
import { Article, UserPreferences, UserFeedback, DEFAULT_PREFERENCES } from '@/types/news';

const mockArticles: Article[] = [
  {
    id: 'art-tech-1',
    title: 'Breakthrough in Quantum Computing Processor Architecture',
    description: 'Researchers develop superconducting qubits with 99.9% gate fidelity.',
    url: 'https://example.com/quantum',
    source: { name: 'Tech Wire' },
    category: 'technology',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hr ago
    readTimeMinutes: 4,
  },
  {
    id: 'art-world-1',
    title: 'Diplomatic Summit Agrees on New Maritime Boundaries',
    description: 'Envoys sign bilateral treaty resolving deep-water economic zones.',
    url: 'https://example.com/maritime',
    source: { name: 'World Dispatch' },
    category: 'world',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hrs ago
    readTimeMinutes: 6,
  },
  {
    id: 'art-business-1',
    title: 'Central Banks Announce Coordinated Liquidity Facility',
    description: 'Monetary authorities reinforce international currency swap lines.',
    url: 'https://example.com/liquidity',
    source: { name: 'Market Times' },
    category: 'business',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hrs ago
    readTimeMinutes: 3,
  },
];

describe('Algorithm Ranking Engine (lib/ranking.ts)', () => {
  it('assigns higher topic score to selected topics', () => {
    const preferences: UserPreferences = {
      ...DEFAULT_PREFERENCES,
      selectedTopics: ['technology'],
      customInterests: [],
    };
    const feedback: UserFeedback = {
      likedArticleIds: [],
      dislikedArticleIds: [],
      savedArticleIds: [],
      skippedArticleIds: [],
      topicAffinities: {},
      keywordAffinities: {},
    };

    const scored = rankArticles(mockArticles, preferences, feedback);
    const techStory = scored.find((a) => a.id === 'art-tech-1');
    const worldStory = scored.find((a) => a.id === 'art-world-1');

    assert.ok(techStory, 'Tech story should be present');
    assert.ok(worldStory, 'World story should be present');
    assert.equal(techStory.scoreBreakdown.topicScore, 20, 'Selected topic receives 20 base points');
    assert.equal(worldStory.scoreBreakdown.topicScore, 5, 'Unselected topic receives 5 base points');
  });

  it('matches custom intellectual lenses and boosts keyword score', () => {
    const preferences: UserPreferences = {
      ...DEFAULT_PREFERENCES,
      selectedTopics: ['technology', 'world'],
      customInterests: ['Quantum Computing'],
    };
    const feedback: UserFeedback = {
      likedArticleIds: [],
      dislikedArticleIds: [],
      savedArticleIds: [],
      skippedArticleIds: [],
      topicAffinities: {},
      keywordAffinities: {},
    };

    const scored = rankArticles(mockArticles, preferences, feedback);
    const techStory = scored.find((a) => a.id === 'art-tech-1');

    assert.ok(techStory);
    assert.ok(techStory.scoreBreakdown.keywordScore >= 16, 'Exact phrase match adds >= 16 keyword points');
    assert.ok(techStory.matchedKeywords.includes('Quantum Computing'));
  });

  it('applies feedback score boost for liked articles (+20) and penalty for disliked (-45)', () => {
    const preferences: UserPreferences = { ...DEFAULT_PREFERENCES };
    const feedback: UserFeedback = {
      likedArticleIds: ['art-tech-1'],
      dislikedArticleIds: ['art-world-1'],
      savedArticleIds: [],
      skippedArticleIds: [],
      topicAffinities: {},
      keywordAffinities: {},
    };

    const scored = rankArticles(mockArticles, preferences, feedback);
    const liked = scored.find((a) => a.id === 'art-tech-1');
    const disliked = scored.find((a) => a.id === 'art-world-1');

    assert.ok(liked);
    assert.ok(disliked);
    assert.equal(liked.scoreBreakdown.feedbackScore, 20);
    assert.equal(disliked.scoreBreakdown.feedbackScore, -45);
  });

  it('filters out skipped articles when includeSkipped is false', () => {
    const preferences: UserPreferences = { ...DEFAULT_PREFERENCES };
    const feedback: UserFeedback = {
      likedArticleIds: [],
      dislikedArticleIds: [],
      savedArticleIds: [],
      skippedArticleIds: ['art-business-1'],
      topicAffinities: {},
      keywordAffinities: {},
    };

    const scored = rankArticles(mockArticles, preferences, feedback, false);
    assert.equal(scored.some((a) => a.id === 'art-business-1'), false);
  });

  it('sorts articles strictly in descending order of relevance score', () => {
    const preferences: UserPreferences = {
      ...DEFAULT_PREFERENCES,
      selectedTopics: ['technology', 'business'],
    };
    const feedback: UserFeedback = {
      likedArticleIds: [],
      dislikedArticleIds: [],
      savedArticleIds: [],
      skippedArticleIds: [],
      topicAffinities: {},
      keywordAffinities: {},
    };

    const scored = rankArticles(mockArticles, preferences, feedback);
    for (let i = 0; i < scored.length - 1; i++) {
      assert.ok(
        scored[i].relevanceScore >= scored[i + 1].relevanceScore,
        `Article at ${i} (${scored[i].relevanceScore}) should be >= Article at ${i + 1} (${scored[i + 1].relevanceScore})`
      );
    }
  });
});
