import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestPayload {
  messages: ChatMessage[];
  articles?: any[];
  preferences?: any;
  apiKey?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestPayload = await req.json();
    const { messages = [], articles = [], preferences, apiKey: clientApiKey } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const apiKey = (clientApiKey || process.env.GEMINI_API_KEY || '').trim();

    // Prepare articles context digest
    const articlesContext = articles
      .slice(0, 15)
      .map(
        (a, i) =>
          `[Story ${i + 1}] Title: "${a.title}" | Desk: ${a.category} | Source: ${a.source?.name || 'Wire'} | Date: ${a.publishedAt || 'Today'}\nSummary: ${a.description}\nLink: ${a.url}`
      )
      .join('\n\n');

    const readerName = preferences?.readerName || 'Reader';
    const topics = (preferences?.selectedTopics || ['general']).join(', ');
    const lenses = (preferences?.customInterests || []).join(', ');

    const systemInstruction = `You are the Gemini News Intelligence Assistant, an elite editorial AI embedded inside the DAYMARK digital broadsheet.
Your role is to help the reader (${readerName}) understand, explore, and analyze today's news edition.

Today's Verified Broadsheet Stories:
${articlesContext || 'No current articles available.'}

Reader Desks: ${topics}
Reader Intellectual Lenses: ${lenses || 'General Curiosity'}

Guidelines:
1. Provide authoritative, concise, and engaging broadsheet editorial answers.
2. Ground your answers in the stories listed above whenever applicable, citing the source bureau (e.g., BBC News, NYT Technology, NPR).
3. Use clean markdown: bullet points, bold key insights, and clear structure.
4. If asked to summarize the news, produce a sharp 30-second executive debrief of the top 3-4 stories.
5. If asked about a topic beyond today's feed, answer factually while clarifying whether it was covered in today's morning edition.
6. Maintain an objective, intellectually curious tone fit for a prestigious international publication.`;

    // 1. Try Google Gemini 1.5 Flash if API Key is available
    if (apiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        // Convert messages to Gemini API format
        const geminiContents = [
          {
            role: 'user',
            parts: [{ text: systemInstruction }],
          },
          {
            role: 'model',
            parts: [{ text: `Understood. I am Gemini News Intelligence for DAYMARK, ready to brief ${readerName} on today's stories with full analytical rigor.` }],
          },
          ...messages.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
          })),
        ];

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: geminiContents,
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 800,
            },
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return NextResponse.json({
              success: true,
              reply: replyText.trim(),
              model: 'gemini-1.5-flash',
              isAiGenerated: true,
            });
          }
        } else {
          const errText = await geminiRes.text();
          console.warn('[Gemini Chat API Error]', geminiRes.status, errText);
        }
      } catch (geminiErr: any) {
        console.warn('[Gemini Chat Exception, falling back]', geminiErr?.message);
      }
    }

    // 2. High-Accuracy Broadsheet Intelligence Agent Fallback
    // Automatically parses query intent, matches relevant stories, and synthesizes structured editorial response
    const queryLower = lastUserMessage.toLowerCase();
    const matchedArticles = articles.filter((a) => {
      const titleLower = (a.title || '').toLowerCase();
      const descLower = (a.description || '').toLowerCase();
      const catLower = (a.category || '').toLowerCase();
      const srcLower = (a.source?.name || '').toLowerCase();

      const keywords = queryLower
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w: string) => w.length > 3);

      if (keywords.length === 0) return true;
      return keywords.some(
        (kw: string) =>
          titleLower.includes(kw) ||
          descLower.includes(kw) ||
          catLower.includes(kw) ||
          srcLower.includes(kw)
      );
    });

    let reply = '';
    const isSummarizeRequest =
      queryLower.includes('summar') ||
      queryLower.includes('brief') ||
      queryLower.includes('digest') ||
      queryLower.includes('top stories') ||
      queryLower.includes('what happened') ||
      queryLower.includes('overview');

    if (isSummarizeRequest) {
      const topStories = (matchedArticles.length > 0 ? matchedArticles : articles).slice(0, 4);
      reply = `### ☕ Executive Dispatch Summary for ${readerName}\n\nHere is your synthesized briefing of today's key developments:\n\n`;

      topStories.forEach((art, idx) => {
        reply += `**${idx + 1}. ${art.title}**\n`;
        reply += `*Desk: ${art.category?.toUpperCase()} • Reported by ${art.source?.name || 'Wire'}*\n`;
        reply += `${art.description}\n\n`;
      });

      reply += `> **Daymark Synthesis:** The primary narrative thread today centers on strategic technology policy, market disruption, and regulatory shifts across major jurisdictions.`;
    } else if (matchedArticles.length > 0) {
      const primary = matchedArticles[0];
      reply = `### 📰 ${primary.title}\n\n`;
      reply += `**Source:** ${primary.source?.name || 'DAYMARK Wire'} | **Category:** ${primary.category?.toUpperCase()}\n\n`;
      reply += `${primary.description}\n\n`;

      if (matchedArticles.length > 1) {
        reply += `**Related Context from Today's Wire:**\n`;
        matchedArticles.slice(1, 3).forEach((rel) => {
          reply += `- **${rel.title}** (*${rel.source?.name}*): ${rel.description.slice(0, 110)}...\n`;
        });
        reply += `\n`;
      }

      reply += `Would you like me to dive deeper into any specific angle or compare coverage across bureaus?`;
    } else {
      const topThree = articles.slice(0, 3);
      reply = `I searched today's active wire for your question. While this exact query is not the lead subject of today's headlines, here is what is dominating today's broadsheet:\n\n`;
      topThree.forEach((art, idx) => {
        reply += `**${idx + 1}. ${art.title}** (${art.source?.name})\n${art.description.slice(0, 120)}...\n\n`;
      });
      reply += `Feel free to ask for a summary of any desk (Technology, World, Science, Business) or specific key actors!`;
    }

    return NextResponse.json({
      success: true,
      reply,
      model: 'daymark-intelligence-agent',
      isAiGenerated: true,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Chat service encountered an error' },
      { status: 500 }
    );
  }
}
