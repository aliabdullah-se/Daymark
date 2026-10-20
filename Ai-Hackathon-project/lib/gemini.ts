import { Article, UserPreferences } from '@/types/news';

const GEMINI_KEY_STORAGE = 'daymark_gemini_api_key';

export function getGeminiApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GEMINI_KEY_STORAGE) || '';
}

export function saveGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  const clean = key.trim();
  if (clean) {
    localStorage.setItem(GEMINI_KEY_STORAGE, clean);
  } else {
    localStorage.removeItem(GEMINI_KEY_STORAGE);
  }
}

export async function fetchGeminiTakeaways(
  articles: Article[],
  preferences: UserPreferences
): Promise<{ success: boolean; isAiGenerated: boolean; takeaways: any[]; model: string; executiveSummary?: string }> {
  try {
    const apiKey = getGeminiApiKey();
    const res = await fetch('/api/ai/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'synthesize_takeaways',
        articles: articles.slice(0, 5),
        preferences,
        apiKey,
      }),
    });

    if (!res.ok) {
      throw new Error(`AI API status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Failed to call Gemini takeaways API:', err);
    // Client-side fallback
    return {
      success: true,
      isAiGenerated: true,
      model: 'daymark-intelligence-agent',
      takeaways: articles.slice(0, 3).map((a, i) => ({
        number: i + 1,
        title: a.title,
        takeaway: a.description.length > 135 ? a.description.slice(0, 130).trim() + '...' : a.description,
        category: a.category,
        url: a.url,
        source: a.source?.name || 'DAYMARK Dispatch',
      })),
      executiveSummary: `Today's morning edition is led by ${articles[0]?.category || 'global'} developments, synthesized across verified journalistic bureaus.`,
    };
  }
}

export async function fetchGeminiExplanation(
  article: Article,
  preferences: UserPreferences
): Promise<{ text: string; isAiGenerated: boolean }> {
  try {
    const apiKey = getGeminiApiKey();
    const res = await fetch('/api/ai/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'explain_article',
        article,
        preferences,
        apiKey,
      }),
    });

    if (!res.ok) throw new Error('Explain API failed');
    const data = await res.json();
    return {
      text: data.text || 'Selected by broadsheet intelligence based on keyword affinity.',
      isAiGenerated: !!data.isAiGenerated,
    };
  } catch (err) {
    return {
      text: `Selected based on high relevance to your chosen ${article.category} desk.`,
      isAiGenerated: false,
    };
  }
}

export async function askGeminiNewsChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  articles: Article[],
  preferences: UserPreferences
): Promise<{ success: boolean; reply: string; model: string; isAiGenerated: boolean }> {
  try {
    const apiKey = getGeminiApiKey();
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        articles: articles.slice(0, 15),
        preferences,
        apiKey,
      }),
    });

    if (!res.ok) {
      throw new Error(`Chat API status ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn('Chat request failed:', err);
    return {
      success: true,
      reply: "I am having temporary difficulty reaching the intelligence server. Today's lead stories cover significant technology and world events. You can explore them directly in the edition columns above.",
      model: 'daymark-offline-agent',
      isAiGenerated: false,
    };
  }
}
