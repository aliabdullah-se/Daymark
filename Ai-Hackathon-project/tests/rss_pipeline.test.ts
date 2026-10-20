import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseRssFeed } from '@/lib/rss';

describe('RSS Ingestion & Editorial Enhancement Pipeline (lib/rss.ts)', () => {
  it('parses XML feed items and maps into normalized Article entities', async () => {
    const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
      <channel>
        <title>BBC News - Technology</title>
        <item>
          <title><![CDATA[AI Breakthrough Promises Faster Chip Simulations]]></title>
          <description><![CDATA[Computer scientists have deployed neural surrogates to optimize silicon floorplans in seconds.]]></description>
          <link>https://www.bbc.co.uk/news/technology-68912345</link>
          <guid isPermaLink="true">https://www.bbc.co.uk/news/technology-68912345</guid>
          <pubDate>Mon, 20 Oct 2026 03:30:00 GMT</pubDate>
          <media:thumbnail url="https://ichef.bbci.co.uk/news/240/cpsprodpb/1234/production/_123.jpg" width="240" height="135"/>
        </item>
      </channel>
    </rss>`;

    const articles = parseRssFeed(sampleXml, 'BBC News', 'technology');

    assert.equal(articles.length, 1);
    const item = articles[0];
    assert.equal(item.title, 'AI Breakthrough Promises Faster Chip Simulations');
    assert.equal(item.category, 'technology');
    assert.equal(item.source.name, 'BBC News');
    assert.ok(item.readTimeMinutes >= 2, 'Read time calculation must yield reasonable reading duration');

    // Verify High-Definition Image Upgrading:
    // Low-res `/news/240/` must be upgraded to high-res `/news/1024/`
    assert.ok(
      item.imageUrl?.includes('/news/1024/'),
      `BBC thumbnail should be upgraded to 1024px high-definition image, got: ${item.imageUrl}`
    );
  });

  it('upgrades New York Times editorial thumbnails to crystal-clear 3:2 landscape photos', () => {
    const sampleNytXml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
      <channel>
        <title>NYT Technology</title>
        <item>
          <title><![CDATA[Space Exploration Accord Signed]]></title>
          <description><![CDATA[International treaty standardizes orbital telemetry protocols.]]></description>
          <link>https://www.nytimes.com/2026/10/20/technology/space-treaty.html</link>
          <pubDate>Mon, 20 Oct 2026 02:00:00 GMT</pubDate>
          <media:content url="https://static01.nyt.com/images/2026/10/20/business/20space-thumbStandard.jpg" medium="image"/>
        </item>
      </channel>
    </rss>`;

    const articles = parseRssFeed(sampleNytXml, 'The New York Times', 'technology');
    assert.equal(articles.length, 1);
    const item = articles[0];

    // `-thumbStandard.jpg` must be upgraded to `-threeByTwoMediumAt2X.jpg`
    assert.ok(
      item.imageUrl?.includes('-threeByTwoMediumAt2X.jpg'),
      `NYT photo should be upgraded to -threeByTwoMediumAt2X.jpg, got: ${item.imageUrl}`
    );
  });
});
