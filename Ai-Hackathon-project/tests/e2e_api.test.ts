import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Live E2E API Verification Suite', () => {
  const testEmail = `e2e_user_${Date.now()}@daymark-test.com`;
  const testPassword = 'DaymarkSecure2026!';
  let testArticleId = '';

  it('GET /api/news returns live parsed RSS news stories with valid schema', async () => {
    const res = await fetch(`${BASE_URL}/api/news`);
    assert.equal(res.status, 200, 'GET /api/news must respond with 200 OK');

    const data = await res.json();
    assert.ok(data.articles, 'Response must contain articles array');
    assert.ok(Array.isArray(data.articles), 'Articles must be an array');
    assert.ok(data.articles.length > 0, 'Feed must return active news articles');

    const firstArticle = data.articles[0];
    assert.ok(firstArticle.id, 'Article must have unique ID');
    assert.ok(firstArticle.title, 'Article must have title');
    assert.ok(firstArticle.category, 'Article must have category');
    assert.ok(firstArticle.url, 'Article must have link URL');

    testArticleId = firstArticle.id;
  });

  it('POST /api/auth/register registers a new subscriber account', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Eleanor Vance',
        email: testEmail,
        password: testPassword,
        paperTitle: 'THE DISPATCH HERALD',
      }),
    });

    assert.equal(res.status, 200, 'Registration should return 200');
    const data = await res.json();
    assert.equal(data.success, true, 'Registration must report success');
    assert.equal(data.email?.toLowerCase(), testEmail.toLowerCase());
  });

  it('POST /api/auth/otp/send generates OTP code for newly registered subscriber', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    const otpCode = data.demoOtpCode || data.devOtpCode;
    assert.ok(otpCode, 'OTP code should be provided in dev/test environment');
    assert.equal(otpCode.length, 6, 'OTP must be 6 digits');
  });

  it('POST /api/auth/otp/verify verifies the account and activates subscription', async () => {
    // Generate fresh OTP code
    const sendRes = await fetch(`${BASE_URL}/api/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    const sendData = await sendRes.json();
    const otp = sendData.demoOtpCode || sendData.devOtpCode;

    const verifyRes = await fetch(`${BASE_URL}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, code: otp }),
    });

    assert.equal(verifyRes.status, 200);
    const verifyData = await verifyRes.json();
    assert.equal(verifyData.success, true, 'Valid OTP must succeed');
    assert.equal(verifyData.user?.isVerified, true, 'Account must be verified');
  });

  it('POST /api/auth/login authenticates verified subscriber credentials', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user?.email.toLowerCase(), testEmail.toLowerCase());

    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie, 'Login must issue session cookie');
  });

  it('POST /api/articles/like records like action and increments like count', async () => {
    const articleId = testArticleId || 'art_sample_test';
    const res = await fetch(`${BASE_URL}/api/articles/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        articleId,
        userEmail: testEmail,
        isLiked: true,
        articleTitle: 'Test Intelligence Report',
        category: 'technology',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.isLiked, true);
    assert.ok(typeof data.likesCount === 'number');
  });

  it('GET /api/articles/like returns like counts for specified articles', async () => {
    const articleId = testArticleId || 'art_sample_test';
    const res = await fetch(`${BASE_URL}/api/articles/like?ids=${articleId}`);

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.likes);
    assert.ok(data.likes[articleId] !== undefined);
  });

  it('POST /api/ai/chat delivers structured editorial debrief and news intelligence', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Please summarize the top developments in technology today.' }],
        articles: [
          {
            id: 'art_1',
            title: 'New Generation Quantum Accelerator Revealed',
            description: 'Leading researchers have announced a scalable qubit array operating at room temperature.',
            category: 'technology',
            source: { name: 'BBC News', domain: 'bbc.com' },
            publishedAt: new Date().toISOString(),
          },
        ],
        preferences: {
          readerName: 'Eleanor',
          selectedTopics: ['technology', 'science'],
        },
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.reply, 'Chatbot must return structured response');
    assert.ok(data.reply.length > 50, 'Response must be substantial');
  });

  it('POST /api/ai/learn records subscriber reading telemetry and generates topic suggestions', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/learn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testEmail,
        articleId: testArticleId || 'art_sample_test',
        articleTitle: 'Advanced Semiconductor Sovereignty',
        category: 'technology',
        readDurationSeconds: 180,
        scrollDepthPercent: 95,
        action: 'upvote',
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.suggestions, 'AI learning pipeline must produce interest recommendations');
    assert.ok(Array.isArray(data.suggestions));
  });
});
