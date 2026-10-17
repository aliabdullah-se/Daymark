import { NextRequest, NextResponse } from 'next/server';

interface GeminiRequestPayload {
  action: 'synthesize_takeaways' | 'explain_article' | 'daily_reflection';
  articles?: any[];
  article?: any;
  preferences?: any;
  apiKey?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GeminiRequestPayload = await req.json();
    const { action, articles = [], article, preferences, apiKey: clientApiKey } = body;

    // Use client-provided key or server environment variable
    const apiKey = (clientApiKey || process.env.GEMINI_API_KEY || '').trim();

    // 1. If Gemini API key is available, call Google Gemini 1.5 Flash
    if (apiKey) {
      try {
        let systemPrompt = '';
        let userPrompt = '';

        if (action === 'synthesize_takeaways') {
          const articlesSummary = articles
            .slice(0, 5)
            .map((a, i) => `[Story ${i + 1}] (${a.category}) ${a.title}: ${a.description}`)
            .join('\n');

          systemPrompt = 'You are the Chief Editor of DAYMARK, a prestigious personalized digital broadsheet. Synthesize today\'s top stories into exactly 3 punchy, high-impact key takeaways. Return valid JSON only.';
          userPrompt = `Based on these top stories from today's wire:
${articlesSummary}

Reader Name: ${preferences?.readerName || 'Reader'}
Focus Desks: ${(preferences?.selectedTopics || []).join(', ')}
Intellectual Lenses: ${(preferences?.customInterests || []).join(', ')}

Respond ONLY with a JSON object in this exact format:
{
  "takeaways": [
    {
      "number": 1,
      "title": "Short punchy headline",
      "takeaway": "1-2 sentence executive briefing distilling the core insight.",
      "category": "technology or relevant category"
    },
    {
      "number": 2,
      "title": "Second headline",
      "takeaway": "1-2 sentence executive briefing.",
      "category": "science or relevant category"
    },
    {
      "number": 3,
      "title": "Third headline",
      "takeaway": "1-2 sentence executive briefing.",
      "category": "world or relevant category"
    }
  ]
}`;
        } else if (action === 'explain_article') {
          systemPrompt = 'You are the editorial curator of DAYMARK. Explain concisely in 2 sentences why this specific article was selected for the reader based on their intellectual lenses.';
          userPrompt = `Article: "${article?.title}"
Category: ${article?.category}
Description: ${article?.description}
Reader Name: ${preferences?.readerName || 'Reader'}
Reader Focus Topics: ${(preferences?.selectedTopics || []).join(', ')}
Custom Lenses: ${(preferences?.customInterests || []).join(', ')}

Provide an editorial explanation of why this story matters to them.`;
        } else if (action === 'daily_reflection') {
          systemPrompt = 'You are the broadsheet columnist of DAYMARK. Write an inspiring, philosophical 1-2 sentence daily reflection quote suitable for a morning broadsheet.';
          userPrompt = `Themes: Wisdom, curiosity, progress, intellectual depth. Return only the quote with attribution to Daymark Editorial Desk.`;
        }

        // Call Gemini 1.5 Flash via REST API (100% Free Tier, zero SDK dependency)
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${systemPrompt}\n\n${userPrompt}` },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 600,
            },
          }),
          signal: AbortSignal.timeout(8000), // 8s timeout
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

          if (action === 'synthesize_takeaways') {
            try {
              // Extract JSON from markdown fences if present
              const jsonMatch = rawText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed.takeaways) && parsed.takeaways.length > 0) {
                  return NextResponse.json({
                    success: true,
                    isAiGenerated: true,
                    model: 'gemini-1.5-flash',
                    takeaways: parsed.takeaways,
                  });
                }
              }
            } catch (jsonErr) {
              console.warn('Gemini JSON parse fallback:', jsonErr);
            }
          } else if (action === 'explain_article' || action === 'daily_reflection') {
            return NextResponse.json({
              success: true,
              isAiGenerated: true,
              model: 'gemini-1.5-flash',
              text: rawText.trim().replace(/^["']|["']$/g, ''),
            });
          }
        } else {
          const errData = await geminiRes.text();
          console.warn('Gemini API returned non-200:', geminiRes.status, errData);
        }
      } catch (geminiError: any) {
        console.warn('Gemini call failed, using graceful algorithmic fallback:', geminiError?.message);
      }
    }

    // 2. Deterministic Algorithmic Fallback (Ensures app NEVER breaks even without API key)
    if (action === 'synthesize_takeaways') {
      const fallbackTakeaways = articles.slice(0, 3).map((art, idx) => ({
        number: idx + 1,
        title: art.title,
        takeaway: art.description.length > 130 ? art.description.slice(0, 125).trim() + '...' : art.description,
        category: art.category,
        url: art.url,
        source: art.source?.name,
      }));

      return NextResponse.json({
        success: true,
        isAiGenerated: false,
        model: 'algorithmic-synthesis',
        takeaways: fallbackTakeaways,
      });
    }

    if (action === 'explain_article') {
      return NextResponse.json({
        success: true,
        isAiGenerated: false,
        model: 'algorithmic-synthesis',
        text: `Selected because it intersects with your focus on ${article?.category?.toUpperCase()} and matches current morning wire priorities.`,
      });
    }

    return NextResponse.json({
      success: true,
      isAiGenerated: false,
      model: 'algorithmic-synthesis',
      text: 'Knowledge becomes wisdom only when balanced by diverse perspectives and quiet contemplation.',
    });
  } catch (err: any) {
    console.error('AI synthesis route error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Synthesis failed' },
      { status: 500 }
    );
  }
}
