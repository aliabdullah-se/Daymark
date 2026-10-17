# System Architecture: Daymark

> **"Your world, clearly delivered."**  
> Official Submission for NaSCon '26 Challenge: Build a Personal Morning Paper (Eynvision)

---

## 1. High-Level Architectural Diagram

```mermaid
graph TD
    classDef ingestion fill:#EAE7DC,stroke:#D8C3A5,stroke-width:1.5px,color:#20211F;
    classDef server fill:#D8C3A5,stroke:#8E8D8A,stroke-width:1.5px,color:#20211F;
    classDef ai fill:#E0E5DF,stroke:#496653,stroke-width:2px,color:#20211F;
    classDef client fill:#F7F5EF,stroke:#496653,stroke-width:2px,color:#20211F;
    classDef pages fill:#FFFFFF,stroke:#20211F,stroke-width:1.5px,color:#20211F;
    classDef storage fill:#EFECE6,stroke:#B5A38C,stroke-width:1.5px,color:#20211F;

    subgraph INGESTION["1. Live News Wire Ingestion Layer"]
        BBC["BBC News RSS Feeds<br/>(World, Tech, Business, Science, Health)"]:::ingestion
        NYT["The New York Times RSS<br/>(World, Tech, Science, Business, Climate)"]:::ingestion
        ARS["Ars Technica & NPR RSS<br/>(Deep Technology, Cosmos, Culture)"]:::ingestion
    end

    subgraph SERVER["2. Next.js 14 Server & API Gateway Layer"]
        MW["middleware.ts<br/>Route Protection & Session Verification"]:::server
        RSS_LIB["lib/rss.ts<br/>Parallel Multi-Feed Fetcher<br/>6s Timeout & Resilient Fallbacks"]:::server
        PARSER["fast-xml-parser<br/>XML Normalizer & Thumbnail Extractor"]:::server
        NEWS_API["/api/news<br/>Live Aggregated News Endpoint"]:::server
        AUTH_API["/api/auth (me, otp/send, otp/verify)<br/>Passwordless Auth & Verification"]:::server
        AI_LEARN["/api/ai/learn<br/>Adaptive Feedback & Learning Signals"]:::server
        GEMINI_API["/api/ai/gemini<br/>Google Gemini 1.5 Flash REST Integration"]:::ai
        DB["lib/db.ts<br/>data/daymark_db.json<br/>Persistent Server Store"]:::storage
    end

    subgraph CLIENT_BRAIN["3. Client-Side Deterministic Brain & Scoring Engine"]
        RANKER["lib/ranking.ts - Explainable Scoring Engine (0-99%)<br/>• Topic Match (+20)<br/>• Keyword Lenses (+35)<br/>• Freshness / Recency (+20)<br/>• Reading Pace Fit (+10)<br/>• Dynamic Feedback Affinity (-12.5 to +12.5)"]:::client
        STORE["lib/storage.ts<br/>Browser LocalStorage Engine<br/>• Users & 1-Click Judge Access<br/>• Calibrated Desks & Keywords<br/>• Learning Signals & Feedback Log<br/>• Saved Daily Broadsheet Editions"]:::storage
        AUDIO["Web Speech API (SpeechSynthesis)<br/>1-Click Spoken Morning Briefing Dispatch"]:::client
    end

    subgraph EDITORIAL_PAGES["4. Editorial Multi-Page Broadsheet UI (Tide / Reflecta Design)"]
        LOGIN["/login & /signup & /verify-otp<br/>• 1-Click Instant Demo Judge Login<br/>• In-Browser / OTP Auth"]:::pages
        ONB["/onboarding<br/>3-Step Desks, Custom Keyword Lenses & Reading Pace"]:::pages
        HOME["/ (Today's Live Broadsheet)<br/>• Today's 3 Key Takeaways (Executive AI Briefing)<br/>• Tide-Inspired 2-Column Lead Cover Story<br/>• Outside Your Bubble (Blindspot Echo Breaker)<br/>• Transparent 'Why This?' Explainable Modal<br/>• Interactive Upvote, Downvote, Skip & Save"]:::pages
        ARCHIVE["/archive<br/>Historical Editions Registry & Full Reader Modal"]:::pages
        PROFILE["/profile<br/>Recommendation Learning Brain & Dynamic Topic Weights"]:::pages
        PRINT["Print Engine / Save as PDF<br/>Standardized @media print Broadsheet CSS Engine"]:::pages
    end

    %% Ingestion Flow
    BBC --> RSS_LIB
    NYT --> RSS_LIB
    ARS --> RSS_LIB
    RSS_LIB --> PARSER
    PARSER --> NEWS_API

    %% Server & Auth Flow
    MW --> AUTH_API
    AUTH_API <--> DB
    AI_LEARN <--> DB
    GEMINI_API -.->|AI Executive Synthesis| HOME

    %% UI to API Connections
    NEWS_API -->|Live Normalized Articles| HOME
    LOGIN --> ONB
    ONB --> HOME
    HOME <--> RANKER
    HOME <--> STORE
    HOME --> AUDIO
    HOME --> PRINT
    HOME <--> ARCHIVE
    HOME <--> PROFILE
    HOME -.->|Feedback Signal| AI_LEARN
```

---

## 2. ASCII Architectural Schematic

```
======================================================================================================
                                     DAYMARK SYSTEM TOPOLOGY
======================================================================================================

 [ LIVE WIRE SOURCES ]
   ├── BBC News (World, Tech, Business, Science, Health)
   ├── The New York Times (World, Tech, Science, Climate, Opinion)
   └── Ars Technica & NPR News (In-depth technology & discovery)
               │
               ▼ (Parallel HTTP GET with 6s AbortController)
 [ SERVER INGESTION LAYER (/api/news) ]
   ├── fast-xml-parser (Resilient XML to JSON transformation)
   ├── Media & Thumbnail Extractor (media:content, enclosures, og:image)
   └── HTML Sanitization & Timezone Normalization
               │
               ▼ (JSON Array of Normalized Articles)
 [ CLIENT-SIDE ENGINE (Next.js 14 App Router) ]
   │
   ├── [ AUTH & LOCAL STORAGE ENGINE ] (PKR 0 Cost)
   │     ├── daymark_users: Local subscriber accounts
   │     ├── daymark_current_user: Active reader session + Instant Judge Login
   │     ├── daymark_preferences: Selected desks, keywords, reading pace
   │     ├── daymark_feedback: Upvotes, downvotes, dismissed IDs, affinities
   │     ├── daymark_signals: Deterministic learning interaction log
   │     └── daymark_saved_editions: Auto-snapshots & pre-seeded past papers
   │
   ├── [ DETERMINISTIC RANKING ENGINE (lib/ranking.ts) ]
   │     Score = TopicMatch (20) + KeywordMatches (up to 35) + Recency (up to 20) 
   │             + PaceFit (10) + FeedbackAffinity (-12.5 to +12.5)
   │
   └── [ EDITORIAL MULTI-PAGE EXPERIENCE ]
         ├── /login & /signup ────> 1-Click Judge Access or custom subscriber account
         ├── /onboarding ─────────> 3-step focus desk, keyword lens & pace calibration
         ├── / ───────────────────> Today's Broadsheet
         │                           ├── "Today's 3 Key Takeaways" (30-sec briefing)
         │                           ├── Tide-inspired 2-column Cover Story
         │                           ├── "Outside Your Bubble" (Blindspot echo breaker)
         │                           ├── The Morning Wire sidebar dispatches
         │                           └── Native Web Speech Audio Briefing toggle
         ├── /archive ────────────> Historical edition registry with full Reader Modal
         ├── /profile ────────────> Learning Brain with dynamic topic weights & audit log
         └── Print Broadsheet ────> Native browser "Save as PDF" via @media print CSS
======================================================================================================
```

---

## 3. Direct Alignment with Eynvision Challenge Criteria

| Challenge Criterion | Implementation in Daymark | Location in Code |
| :--- | :--- | :--- |
| **1. Onboarding Experience** | 3-step intuitive calibration: Desks selection, dynamic custom keyword lenses with 1-click pills, reading pace (Quick 5m / Standard 15m / Deep 30m). | [`app/onboarding/page.tsx`](file:///d:/Git-Hub%20Repo/Ai-Hackathon-project/app/onboarding/page.tsx) |
| **2. Fresh Daily PDF** | Standardized broadsheet `@media print` CSS engine with editorial columns, drop caps, and physical print styling. Generates fresh daily from verified articles. | [`app/globals.css`](file:///d:/Git-Hub%20Repo/Ai-Hackathon-project/app/globals.css) & [`components/PrintPreviewBanner.tsx`](file:///d:/Git-Hub%20Repo/Ai-Hackathon-project/components/PrintPreviewBanner.tsx) |
| **3. Complete Webpage** | Asymmetric broadsheet layout inspired by *Tide* and *The Atlantic* (Ivory `#F7F5EF`, Charcoal `#20211F`, Forest Green `#496653`). Includes link-throughs, dismissal, and historical archives. | [`app/page.tsx`](file:///d:/Git-Hub%20Repo/Ai-Hackathon-project/app/page.tsx) & [`app/archive/page.tsx`](file:///d:/Git-Hub%20Repo/Ai-Hackathon-project/app/archive/page.tsx) |
| **4. Learning System** | Transparent feedback loop: Upvotes boost desk/keyword weight (+15%), Downvotes penalize (-20%), Skips dismiss stories and reduce affinity. Real-time Learning Brain visualizer. | [`lib/ranking.ts`](file:///d:/Git-Hub%20Repo/Ai-Hackathon-project/lib/ranking.ts) & [`app/profile/page.tsx`](file:///d:/Git-Hub%20Repo/Ai-Hackathon-project/app/profile/page.tsx) |
| **5. Room to Explore** | **"Today's 3 Key Takeaways"** (directly solving "can't name three things they learned"), **"Outside Your Bubble"** blindspot breaker, **Web Speech API Audio Dispatch**, and **Explainable "Why this?" Modal**. | [`app/page.tsx`](file:///d:/Git-Hub%20Repo/Ai-Hackathon-project/app/page.tsx) & [`components/WhyThisModal.tsx`](file:///d:/Git-Hub%20Repo/Ai-Hackathon-project/components/WhyThisModal.tsx) |

---

## 4. Zero-Budget & Privacy Compliance (PKR 0 Cost)
- **Zero Paid Dependencies**: 100% free open-source tools (Next.js, TypeScript, Tailwind CSS, Fast-XML-Parser, Lucide React).
- **Zero API Key Leakage / Quotas**: No third-party AI keys or paid scraper limits required.
- **Client-Side Privacy**: Reader preferences, learning signals, and archived editions remain on the user's device in `localStorage`.
