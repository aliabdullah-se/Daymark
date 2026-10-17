# System Architecture: Daymark

> **"Your world, clearly delivered."**  
> Editorial Digital Broadsheet Architecture for NaSCon '26

```mermaid
graph TD
    subgraph External Sources [Public RSS News Wires - PKR 0]
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
        SPEECH["Web Speech API<br/>SpeechSynthesis Native Audio Brief"]
        PAGE["app/page.tsx<br/>Daymark Broadsheet Controller"]
        
        subgraph Daymark Editorial UI
            MAST["components/Masthead.tsx<br/>Daymark Masthead, Issue Meta, Navigation, Curated Lenses"]
            COVER["Cover Story (Hero Variant)<br/>Two-Column Tide-Inspired Layout"]
            WIRE["The Morning Wire<br/>Compact 2-min briefs sidebar"]
            REFLECT["Daily Reflection<br/>Reflecta-Inspired Editorial Card"]
            SECTIONS["Categorical Section Blocks<br/>Tech, World, Business, Science"]
            MODAL_ONB["components/OnboardingModal.tsx<br/>Topic & Interest Lens Curator"]
            MODAL_WHY["components/WhyThisModal.tsx<br/>Transparent Explainability Breakdown"]
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
    PAGE --> SPEECH
    RANKER -->|Ranked & Scored Articles| COVER
    RANKER --> WIRE
    RANKER --> SECTIONS
    PAGE --> MAST
    PAGE --> REFLECT
    PAGE --> MODAL_ONB
    PAGE --> MODAL_WHY
    PAGE --> DRAWER_ARCH
    PAGE --> MODAL_PRINT
```

---

## Visual Design Palette
- **Canvas / Paper**: Warm Ivory `#F7F5EF` (`bg-ivory-100`)
- **Typography**: Near-black Charcoal `#20211F` (`text-charcoal-900`)
- **Primary Accent**: Restrained Forest Green `#496653` (`text-forest-700`, `bg-forest-50`, `border-forest-600`)
- **Secondary Accent**: Terracotta `#B85D38`
- **Dividers & Rules**: Thin hairlines `#E5DFD1` (`border-ivory-300`)
