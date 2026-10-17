import { XMLParser } from 'fast-xml-parser';
import { Article, NewsTopic } from '@/types/news';

interface FeedSource {
  name: string;
  url: string;
  category: NewsTopic;
  domain: string;
}

const FEED_SOURCES: FeedSource[] = [
  // Technology
  { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/technology/rss.xml', category: 'technology', domain: 'bbc.com' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'technology', domain: 'arstechnica.com' },
  { name: 'NYT Technology', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'technology', domain: 'nytimes.com' },
  
  // World Affairs
  { name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'world', domain: 'bbc.com' },
  { name: 'NYT World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'world', domain: 'nytimes.com' },
  { name: 'NPR News', url: 'https://feeds.npr.org/1004/rss.xml', category: 'world', domain: 'npr.org' },

  // Business & Markets
  { name: 'BBC Business', url: 'http://feeds.bbci.co.uk/news/business/rss.xml', category: 'business', domain: 'bbc.com' },
  { name: 'NYT Business', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', category: 'business', domain: 'nytimes.com' },

  // Science & Discovery
  { name: 'BBC Science', url: 'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml', category: 'science', domain: 'bbc.com' },
  { name: 'NYT Science', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', category: 'science', domain: 'nytimes.com' },

  // Arts & Culture
  { name: 'NYT Arts', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml', category: 'culture', domain: 'nytimes.com' },
  { name: 'BBC Arts', url: 'http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', category: 'culture', domain: 'bbc.com' },

  // Health
  { name: 'NYT Health', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml', category: 'health', domain: 'nytimes.com' },
  { name: 'BBC Health', url: 'http://feeds.bbci.co.uk/news/health/rss.xml', category: 'health', domain: 'bbc.com' },

  // Climate / Environment
  { name: 'NYT Climate', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Climate.xml', category: 'environment', domain: 'nytimes.com' },

  // Opinion / Ideas
  { name: 'NYT Opinion', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Opinion.xml', category: 'opinion', domain: 'nytimes.com' },
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  trimValues: true,
});

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractImage(item: any): string | undefined {
  // 1. Check media:content (could be array or single object)
  const mediaContent = item['media:content'];
  if (Array.isArray(mediaContent)) {
    const img = mediaContent.find((m) => m['@_medium'] === 'image' || m['@_url']);
    if (img && img['@_url']) return img['@_url'];
  } else if (mediaContent && mediaContent['@_url']) {
    return mediaContent['@_url'];
  }

  // 2. Check media:thumbnail
  const mediaThumb = item['media:thumbnail'];
  if (Array.isArray(mediaThumb)) {
    if (mediaThumb[0] && mediaThumb[0]['@_url']) return mediaThumb[0]['@_url'];
  } else if (mediaThumb && mediaThumb['@_url']) {
    return mediaThumb['@_url'];
  }

  // 3. Check enclosure
  const enclosure = item.enclosure;
  if (enclosure && enclosure['@_url'] && enclosure['@_type']?.startsWith('image/')) {
    return enclosure['@_url'];
  }

  // 4. Check HTML in description or content:encoded
  const htmlContent = item['content:encoded'] || item.description || '';
  if (typeof htmlContent === 'string') {
    const match = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1]) {
      return match[1];
    }
  }

  return undefined;
}

function generateSimpleId(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'art_' + Math.abs(hash).toString(36);
}

function estimateReadTime(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  // Estimate assuming full article is about 4x the summary
  const estimatedFullWords = Math.max(words * 4, 300);
  const minutes = Math.ceil(estimatedFullWords / 200); // 200 words per minute
  return Math.min(Math.max(minutes, 2), 10);
}

export async function fetchFeedArticles(source: FeedSource): Promise<Article[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MorningPaper/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      next: { revalidate: 300 }, // Cache server-side for 5 minutes
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[RSS] Failed to fetch ${source.name}: ${res.status}`);
      return [];
    }

    const xmlText = await res.text();
    const parsed = parser.parse(xmlText);

    let rawItems: any[] = [];
    if (parsed.rss && parsed.rss.channel && parsed.rss.channel.item) {
      rawItems = Array.isArray(parsed.rss.channel.item) ? parsed.rss.channel.item : [parsed.rss.channel.item];
    } else if (parsed.feed && parsed.feed.entry) {
      rawItems = Array.isArray(parsed.feed.entry) ? parsed.feed.entry : [parsed.feed.entry];
    }

    const articles: Article[] = [];

    for (const item of rawItems) {
      const title = stripHtml(typeof item.title === 'string' ? item.title : item.title?.['#text'] || '');
      const rawDesc = item.description || item.summary || item['content:encoded'] || '';
      const description = stripHtml(typeof rawDesc === 'string' ? rawDesc : rawDesc?.['#text'] || '');

      let link = '';
      if (typeof item.link === 'string') {
        link = item.link;
      } else if (item.link && item.link['@_href']) {
        link = item.link['@_href'];
      } else if (Array.isArray(item.link)) {
        const alt = item.link.find((l: any) => l['@_rel'] === 'alternate' || !l['@_rel']);
        link = alt ? alt['@_href'] : item.link[0]?.['@_href'] || '';
      }

      if (!title || !link) continue;

      const publishedAt = item.pubDate || item.published || item.updated || new Date().toISOString();
      const imageUrl = extractImage(item);
      const author = item['dc:creator'] || item.author?.name || undefined;
      const readTime = estimateReadTime(description);

      articles.push({
        id: generateSimpleId(link + title),
        title,
        description: description || 'No summary provided. Tap to read the full report.',
        url: link,
        source: {
          name: source.name,
          domain: source.domain,
        },
        category: source.category,
        publishedAt: new Date(publishedAt).toISOString(),
        imageUrl,
        author: author ? stripHtml(author) : undefined,
        readTimeMinutes: readTime,
      });
    }

    return articles.slice(0, 15); // Take top 15 from each feed
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.warn(`[RSS Error] ${source.name}: ${error?.message || error}`);
    return [];
  }
}

export async function fetchAllNews(selectedTopics?: NewsTopic[]): Promise<Article[]> {
  const sourcesToFetch = selectedTopics && selectedTopics.length > 0
    ? FEED_SOURCES.filter((s) => selectedTopics.includes(s.category))
    : FEED_SOURCES;

  // Run in parallel with Promise.allSettled
  const results = await Promise.allSettled(sourcesToFetch.map((src) => fetchFeedArticles(src)));

  const allArticles: Article[] = [];
  const seenUrls = new Set<string>();

  for (const res of results) {
    if (res.status === 'fulfilled') {
      for (const article of res.value) {
        // Deduplicate
        const cleanUrl = article.url.split('?')[0].toLowerCase();
        if (!seenUrls.has(cleanUrl) && !seenUrls.has(article.title.toLowerCase())) {
          seenUrls.add(cleanUrl);
          seenUrls.add(article.title.toLowerCase());
          allArticles.push(article);
        }
      }
    }
  }

  // Sort initially by publication date descending
  return allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}
