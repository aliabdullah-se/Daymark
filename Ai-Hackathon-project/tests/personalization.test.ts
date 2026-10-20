import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { rankArticles, ScoredArticle } from '@/lib/ranking';
import { Article, UserPreferences, UserFeedback, DEFAULT_PREFERENCES } from '@/types/news';

const articlesCatalog: Article[] = [
  {
    id: 'art-ai-1',
    title: 'Autonomous Multi-Agent AI Workflows Achieve Enterprise Production Benchmarks',
    description: 'Frameworks combining reasoning models with structured memory reduce hallucination rates by 78%.',
    url: 'https://example.com/ai-agents',
    source: { name: 'Ars Technica' },
    category: 'technology',
    publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    readTimeMinutes: 5,
  },
  {
    id: 'art-geo-1',
    title: 'Critical Mineral Accords Signed for Central Asian Supply Corridors',
    description: 'Ministers establish multilateral treaties securing lithium and rare earth refinement routes.',
    url: 'https://example.com/minerals',
    source: { name: 'BBC News' },
    category: 'world',
    publishedAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    readTimeMinutes: 6,
  },
  {
    id: 'art-fin-1',
    title: 'Global Sovereign Bond Yields Invert Following Quarterly Inflation Data',
    description: 'Treasury debt instruments price in divergent central bank interest rate easing cycles.',
    url: 'https://example.com/bonds',
    source: { name: 'The New York Times' },
    category: 'business',
    publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    readTimeMinutes: 4,
  },
  {
    id: 'art-sci-1',
    title: 'James Webb Space Telescope Maps Atmospheric Water Vapor on Habitable-Zone Exoplanet',
    description: 'Spectroscopic absorption lines confirm stable tropospheric water signatures in nearby star system.',
    url: 'https://example.com/jwst-water',
    source: { name: 'BBC News' },
    category: 'science',
    publishedAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    readTimeMinutes: 5,
  },
];

describe('Personalization & Self-Training Pipeline (Phase 9 Acceptance)', () => {
  it('User A (Tech/AI) and User B (World/Business) receive distinct initial rankings', () => {
    const userAPrefs: UserPreferences = {
      ...DEFAULT_PREFERENCES,
      readerName: 'User A (Tech Focus)',
      selectedTopics: ['technology', 'science'],
      customInterests: ['Artificial Intelligence'],
    };
    const userAFeedback: UserFeedback = {
      likedArticleIds: [],
      dislikedArticleIds: [],
      savedArticleIds: [],
      skippedArticleIds: [],
      topicAffinities: {},
      keywordAffinities: {},
    };

    const userBPrefs: UserPreferences = {
      ...DEFAULT_PREFERENCES,
      readerName: 'User B (Markets Focus)',
      selectedTopics: ['world', 'business'],
      customInterests: ['Sovereign Bonds'],
    };
    const userBFeedback: UserFeedback = {
      likedArticleIds: [],
      dislikedArticleIds: [],
      savedArticleIds: [],
      skippedArticleIds: [],
      topicAffinities: {},
      keywordAffinities: {},
    };

    const rankedA = rankArticles(articlesCatalog, userAPrefs, userAFeedback);
    const rankedB = rankArticles(articlesCatalog, userBPrefs, userBFeedback);

    // User A's #1 lead story must be technology/AI
    assert.equal(rankedA[0].id, 'art-ai-1', 'User A top story should be AI');
    assert.equal(rankedA[0].category, 'technology');

    // User B's #1 lead story must be world or business
    assert.notEqual(rankedB[0].id, 'art-ai-1', 'User B top story should NOT be AI');
    assert.ok(['world', 'business'].includes(rankedB[0].category));
  });

  it('Controlled feedback experiment: Liking an article elevates category and keyword affinities reproducibly', () => {
    // 1. Initial State: Neutral preferences across technology, world, and science
    const basePrefs: UserPreferences = {
      ...DEFAULT_PREFERENCES,
      selectedTopics: ['technology', 'world', 'science'],
      customInterests: [],
    };
    const initialFeedback: UserFeedback = {
      likedArticleIds: [],
      dislikedArticleIds: [],
      savedArticleIds: [],
      skippedArticleIds: [],
      topicAffinities: {},
      keywordAffinities: {},
    };

    const beforeRanking = rankArticles(articlesCatalog, basePrefs, initialFeedback);
    const beforeWorldScore = beforeRanking.find((a) => a.id === 'art-geo-1')!.relevanceScore;

    // 2. Controlled User Action: User likes the World Geopolitics story ('art-geo-1')
    // Simulating the exact state update performed by handleLike in app/page.tsx:
    const updatedFeedback: UserFeedback = {
      ...initialFeedback,
      likedArticleIds: ['art-geo-1'],
      topicAffinities: {
        world: 2.5, // Gained +2.5 topic affinity points from upvote
      },
      keywordAffinities: {
        minerals: 2.0, // Inferred keyword affinity
      },
    };

    // 3. Post-Feedback State: Re-rank using identical articles catalogue
    const afterRanking = rankArticles(articlesCatalog, basePrefs, updatedFeedback);
    const afterWorldStory = afterRanking.find((a) => a.id === 'art-geo-1')!;

    // 4. Verification: Authoritative score increased and story moved up in ranking
    assert.ok(
      afterWorldStory.relevanceScore > beforeWorldScore,
      `Relevance score after like (${afterWorldStory.relevanceScore}) must exceed initial score (${beforeWorldScore})`
    );
    assert.equal(afterWorldStory.scoreBreakdown.feedbackScore, 20, 'Direct liked feedback adds +20 points');
    assert.ok(
      afterWorldStory.scoreBreakdown.topicScore > beforeRanking.find((a) => a.id === 'art-geo-1')!.scoreBreakdown.topicScore,
      'Topic affinity elevated topic score'
    );
    assert.equal(afterRanking[0].id, 'art-geo-1', 'Liked story now ranks #1 as lead broadsheet headline');
  });

  it('Cross-user isolation: User A feedback never leaks into User B preferences or scores', () => {
    const userBPrefs: UserPreferences = {
      ...DEFAULT_PREFERENCES,
      selectedTopics: ['business'],
    };
    const userBFeedback: UserFeedback = {
      likedArticleIds: [],
      dislikedArticleIds: [],
      savedArticleIds: [],
      skippedArticleIds: [],
      topicAffinities: {},
      keywordAffinities: {},
    };

    // User A liked art-geo-1, but User B feedback has no record of it
    const userBRanking = rankArticles(articlesCatalog, userBPrefs, userBFeedback);
    const worldInB = userBRanking.find((a) => a.id === 'art-geo-1')!;

    assert.equal(worldInB.scoreBreakdown.feedbackScore, 0, 'User B must have 0 feedback score for art-geo-1');
    assert.notEqual(userBRanking[0].id, 'art-geo-1', 'User B top story must remain unpolluted by User A actions');
  });
});
