import { NextRequest, NextResponse } from 'next/server';
import {
  dbLogInteraction,
  dbSaveSuggestedInterests,
  dbGetSuggestedInterests,
  dbAcceptSuggestedInterest,
  dbDismissSuggestedInterest,
  dbGetUserInteractions,
} from '@/lib/db';
import { SuggestedInterest, NewsTopic } from '@/types/news';

// Knowledge Graph of curated editorial discovery topics per domain
const DOMAIN_DISCOVERY_GRAPH: Record<string, Array<{ topic: string; category: NewsTopic; reason: string }>> = {
  technology: [
    {
      topic: 'Agentic AI & Tool-Use Systems',
      category: 'technology',
      reason: 'Inferred from high engagement with autonomous software systems and developer tooling.',
    },
    {
      topic: 'Silicon Sovereignty & Advanced Packaging',
      category: 'technology',
      reason: 'Detected interest in semiconductor fabrication, TSMC nodes, and chip export policies.',
    },
    {
      topic: 'Local & Edge Inference Models',
      category: 'technology',
      reason: 'Aligns with preferences for private, low-latency machine learning architectures.',
    },
  ],
  world: [
    {
      topic: 'Critical Mineral Supply Chains',
      category: 'world',
      reason: 'Triggered by attention to international resource competition and trade treaties.',
    },
    {
      topic: 'Maritime Straits & Global Shipping Chokepoints',
      category: 'world',
      reason: 'Reflects interest in geopolitical maritime corridors and global economic flow.',
    },
    {
      topic: 'Space Treaties & Orbital Sovereignty',
      category: 'world',
      reason: 'Inferred from reading defense, aerospace, and multinational space accords.',
    },
  ],
  business: [
    {
      topic: 'AI Infrastructure Capital Expenditures',
      category: 'business',
      reason: 'Derived from reading corporate balance sheets and cloud data center buildouts.',
    },
    {
      topic: 'Decentralized Energy Grid Markets',
      category: 'business',
      reason: 'Matches economic interest in utility-scale renewables and energy deregulation.',
    },
    {
      topic: 'Private Equity & Venture Liquidity Cycles',
      category: 'business',
      reason: 'Inferred from focus on capital markets, IPO windows, and startup financing.',
    },
  ],
  science: [
    {
      topic: 'Fault-Tolerant Quantum Computing',
      category: 'science',
      reason: 'Derived from high curiosity in physics breakthroughs and topological qubits.',
    },
    {
      topic: 'In-Vivo CRISPR & Epigenetic Reprogramming',
      category: 'science',
      reason: 'Inferred from attention to biotechnology, cellular therapy, and longevity research.',
    },
    {
      topic: 'Deep-Field James Webb Astrophysics',
      category: 'science',
      reason: 'Matches curiosity in early galaxy formation and cosmological observations.',
    },
  ],
  environment: [
    {
      topic: 'Next-Gen Small Modular Reactors (SMRs)',
      category: 'environment',
      reason: 'Inferred from interest in baseload clean nuclear power for data centers.',
    },
    {
      topic: 'Grid-Scale Sodium-Ion Storage',
      category: 'environment',
      reason: 'Matches focus on earth-abundant energy storage and battery chemistry.',
    },
  ],
  health: [
    {
      topic: 'Metabolic Health & GLP-1 Therapeutics',
      category: 'health',
      reason: 'Inferred from interest in systemic preventative medicine and clinical trials.',
    },
  ],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type, // 'interaction' | 'accept' | 'dismiss' | 'get_suggestions'
      userId = 'default',
      action, // 'upvote' | 'downvote' | 'skip' | 'save' | 'read'
      articleId,
      articleTitle,
      category = 'technology',
      customInterests = [],
      topic,
    } = body;

    // 1. Handle user accepting a suggested interest
    if (type === 'accept' && topic) {
      dbAcceptSuggestedInterest(userId, topic);
      const suggestions = dbGetSuggestedInterests(userId);
      return NextResponse.json({
        success: true,
        message: `Added "${topic}" to your morning paper desks!`,
        suggestions,
      });
    }

    // 2. Handle user dismissing a suggestion
    if (type === 'dismiss' && topic) {
      dbDismissSuggestedInterest(userId, topic);
      const suggestions = dbGetSuggestedInterests(userId);
      return NextResponse.json({
        success: true,
        message: `Dismissed "${topic}".`,
        suggestions,
      });
    }

    // 3. Handle fetching suggestions only
    if (type === 'get_suggestions') {
      const suggestions = dbGetSuggestedInterests(userId);
      return NextResponse.json({ success: true, suggestions });
    }

    // 4. Real-time interaction learning
    if (action && articleTitle) {
      // Log to persistent database
      dbLogInteraction({
        userId,
        articleId: articleId || `art_${Date.now()}`,
        articleTitle,
        category,
        action,
        timestamp: new Date().toISOString(),
      });

      // Get past interactions to compute trajectory
      const pastInteractions = dbGetUserInteractions(userId).slice(0, 10);
      const geminiApiKey = process.env.GEMINI_API_KEY || body.geminiApiKey;

      let generatedSuggestions: SuggestedInterest[] = [];

      // Try AI Generation with Gemini if API Key is available
      if (geminiApiKey) {
        try {
          const prompt = `You are the Chief Editorial Intelligence Architect of "Daymark", a personalized morning broadsheet newspaper.
A subscriber just performed action "${action}" on article "${articleTitle}" in category "${category}".
Recent subscriber interactions: ${pastInteractions.map((p) => `${p.action} on "${p.articleTitle}"`).join('; ')}.
Current subscriber interests: ${customInterests.join(', ')}.

Based on this real-time signal, synthesize exactly 2 or 3 high-value, emerging intellectual interest topics they should add to their daily paper.
Rules:
- Be highly specific and intellectually serious (e.g. "Silicon Sovereignty & Advanced Packaging", not just "Tech").
- Confidence score between 75 and 96.
- Write 1 concise editorial sentence explaining why Daymark AI discovered this for them.
- Valid JSON array only, strictly following this structure:
[
  { "topic": "...", "confidence": 92, "reason": "...", "category": "${category}" }
]`;

          const aiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.3,
                },
              }),
              signal: AbortSignal.timeout(6000),
            }
          );

          if (aiRes.ok) {
            const data = await aiRes.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text);
              if (Array.isArray(parsed)) {
                generatedSuggestions = parsed.map((item, idx) => ({
                  id: `sug_${Date.now()}_${idx}`,
                  topic: item.topic,
                  confidence: item.confidence || 88,
                  reason: item.reason || `Inferred from your interest in ${category}.`,
                  category: (item.category as NewsTopic) || category,
                  suggestedAt: new Date().toISOString(),
                }));
              }
            }
          }
        } catch (aiErr) {
          console.warn('Gemini AI suggestions failed or timed out, falling back to discovery graph:', aiErr);
        }
      }

      // If Gemini wasn't available or errored, use deterministic editorial discovery graph
      if (generatedSuggestions.length === 0) {
        const pool = DOMAIN_DISCOVERY_GRAPH[category] || DOMAIN_DISCOVERY_GRAPH.technology;
        const available = pool.filter(
          (p) => !customInterests.some((ci: string) => ci.toLowerCase() === p.topic.toLowerCase())
        );

        generatedSuggestions = (available.length > 0 ? available : pool).slice(0, 2).map((item, idx) => ({
          id: `sug_graph_${Date.now()}_${idx}`,
          topic: item.topic,
          confidence: Math.min(95, 80 + Math.floor(Math.random() * 15)),
          reason: item.reason,
          category: item.category,
          suggestedAt: new Date().toISOString(),
        }));
      }

      // Save to database
      if (generatedSuggestions.length > 0) {
        dbSaveSuggestedInterests(userId, generatedSuggestions);
      }

      const allSuggestions = dbGetSuggestedInterests(userId);

      return NextResponse.json({
        success: true,
        message: `Real-time interaction logged. Editorial AI adapted weights.`,
        action,
        articleTitle,
        category,
        suggestions: allSuggestions,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in /api/ai/learn:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId') || 'default';
  const suggestions = dbGetSuggestedInterests(userId);
  return NextResponse.json({ success: true, suggestions });
}
