# System Architecture: The Morning Chronicle

## Architectural Overview

The Morning Chronicle is designed as a zero-dependency, server-aggregated editorial broadsheet built with Next.js App Router, TypeScript, and Tailwind CSS.

```mermaid
graph TD
    subgraph External Sources [Public RSS News Wires]
        BBC[BBC News RSS<br/>World, Tech, Business, Science, Health]
        NYT[New York Times RSS<br/>World, Tech, Science, Business, Climate]
        ARS[Ars Technica & NPR RSS<br/>Technology, Culture, Wire]
    end

    subgraph Server Layer [Next.js App Router Server]
        API["/api/news<br/>Route Handler"]
        FETCHER["lib/rss.ts<br/>Parallel Multi-Feed Fetcher<br/>Timeout & Graceful Fallbacks"]
        PARSER["fast-xml-parser<br/>Normalizer, Thumbnail Extractor,<br/>HTML Sanitizer"]
    end

    subgraph Client Layer [Next.js Client Application]
        STORE["lib/storage.ts<br/>LocalStorage Persistence<br/>(Preferences, Feedback, Editions)"]
        RANKER["lib/ranking.ts<br/>Explainable Scoring Engine<br/>Topic Match + Custom Keywords + Recency + Feedback"]
        PAGE["app/page.tsx<br/>Editorial Controller & BroadSheet Layout"]
        
        subgraph UI Components
            MAST["components/Masthead.tsx<br/>Woodblock Title, Date, Weather, Controls"]
            HERO["Lead Story (Hero Variant)<br/>Large Headline, Drop Cap, Actions"]
            WIRE["The Morning Wire<br/>Compact 2-min briefs sidebar"]
            SECTIONS["Categorical Section Blocks<br/>Tech, World, Business, Science"]
            MODAL_ONB["components/OnboardingModal.tsx<br/>Topic & Interest Curator"]
            MODAL_WHY["components/WhyThisModal.tsx<br/>Transparent Explainability Popover"]
            DRAWER_ARCH["components/SavedEditionsDrawer.tsx<br/>Archive & Restore Past Editions"]
            MODAL_PRINT["components/PrintPreviewBanner.tsx<br/>Print Dialog & Save as PDF Engine"]
        end
    end

    External Sources --> FETCHER
    FETCHER --> PARSER
    PARSER --> API
    API -->|Aggregated Articles| PAGE
    STORE -->|Preferences & Feedback| RANKER
    PAGE --> RANKER
    RANKER -->|Ranked & Scored Articles| HERO
    RANKER --> WIRE
    RANKER --> SECTIONS
    PAGE --> MODAL_ONB
    PAGE --> MODAL_WHY
    PAGE --> DRAWER_ARCH
    PAGE --> MODAL_PRINT
```

---

## Data Flow & Core Subsystems

### 1. Server-Side Wire Aggregation (`lib/rss.ts`, `/api/news`)
- Requests are dispatched in parallel to multiple public XML feeds using `Promise.allSettled`.
- Each feed has an independent `AbortController` timeout (6000ms), ensuring high resiliency: even if one network source hangs, the remaining sources compile seamlessly.
- XML parsing extracts article titles, descriptions, publication timestamps, authors, source metadata, and thumbnail images across `<media:content>`, `<media:thumbnail>`, and `<enclosure>`.
- Articles are deduplicated across URLs and titles and cached server-side.

### 2. Explainable Ranking Engine (`lib/ranking.ts`)
Each article is scored on a 0–99 scale via an explainable multi-factor formula:
$$\text{Score} = \text{TopicMatch} + \text{CustomInterests} + \text{Recency} + \text{Pacing} + \text{Feedback}$$

- **Topic Alignment (0–30 pts)**: Base +20 pts for user's subscribed categories + user dynamic topic affinity (-12.5 to +12.5).
- **Custom Interests Match (0–35 pts)**: Searches title and abstract for user's custom keywords and multi-token interests (+16 pts per exact phrase match, +8 pts per token match).
- **Recency Decay (0–20 pts)**:
  - $< 3\text{ hours}$: +20 pts
  - $3-6\text{ hours}$: +16 pts
  - $6-12\text{ hours}$: +12 pts
  - $12-24\text{ hours}$: +8 pts
- **Reading Pace (0–10 pts)**: Matches article length with user's reading style (Quick Scan vs Standard vs Deep Dive).
- **Feedback Adjustments**: Upvoted stories (+20 pts), downvoted stories (-45 pts), dismissed stories filtered out.

### 3. Client-Side Persistence (`lib/storage.ts`)
- Zero external database required for demo or hackathon judging.
- Fully stored in browser `localStorage`:
  - `morning_chronicle_preferences`: User name, custom title, topics, custom interest tags, reading pace.
  - `morning_chronicle_feedback`: Liked IDs, disliked IDs, skipped IDs, saved clipping IDs, dynamic topic affinities.
  - `morning_chronicle_saved_editions`: Array of historical edition snapshots with full article payloads.

### 4. Print & Broadsheet Rendering Engine (`app/globals.css`)
- Uses CSS `@media print` rules:
  - Suppresses all interactive controls, buttons, toolbars, and modals (`.no-print`).
  - Sets up authentic newspaper multi-column layouts with classic editorial typography (`font-serif`, `newspaper-rule-double`).
  - Enforces clean page breaks (`break-inside: avoid`).
