# Daymark — Your world, clearly delivered.

> **NaSCon '26 Official AI Challenge Submission: Personalized Digital Morning Newspaper**  
> An award-worthy, editorial morning broadsheet delivering real, verified reporting tailored to your intellectual focus areas.

---

## 📰 Editorial Design & Vision

**Daymark** reimagines the morning newspaper as a quiet, thoughtful, and beautifully typeset daily broadsheet inspired by modern editorial publications like *Tide* and *The Atlantic*:

1. **Award-Worthy Editorial Aesthetic**:
   - **Curated Palette**: Warm ivory canvas (`#F7F5EF`), charcoal typography (`#20211F`), and restrained forest-green accents (`#496653`).
   - **Editorial Typography**: Elegant serif display typography (Playfair Display & Newsreader) paired with crisp sans-serif body text (Inter).
   - **Asymmetric Broadsheet Layout**: High-impact Cover Story with generous photography and oversized serif headlines, balanced by two-column front-page reports, *The Morning Wire* fast dispatches, and daily editorial reflections.
   - **Thin Editorial Dividers & Generous Whitespace**: Aligned columns, subtle borders, no boxy shadows or gratuitous animations.

2. **Real-Time Live Wire (Zero Hallucination Policy)**:
   - Aggregates verified reports in parallel from world-class publications:
     - **BBC News** (World, Technology, Business, Science, Health, Culture)
     - **The New York Times** (World, Technology, Science, Business, Climate, Opinion)
     - **Ars Technica** & **NPR News**
   - Resilient XML parsing via `fast-xml-parser` with thumbnail extraction and 6-second timeout fallbacks.
   - **Zero API keys required** — 100% free and reliable.

3. **Transparent & Explainable Ranking Engine**:
   - Calculates deterministic personal relevance scores (0–99%) for every story:
     - Topic alignment (+20 pts)
     - Custom keyword phrase & token matches (+16 to +35 pts)
     - Freshness & recency decay (+8 to +20 pts)
     - Reading pace fit (+10 pts)
     - User feedback affinity adjustments (+/- pts)
   - Every story features a transparent **"Why this?"** modal explaining the exact scoring components.

4. **Interactive Reader Feedback & Local Learning**:
   - **Thumbs Up / Down**: Learns topic and keyword affinities in real-time.
   - **Skip / Dismiss (✕)**: Instantly dismisses irrelevant stories from today's edition.
   - **Clippings / Bookmarks (🔖)**: Saves articles to your personal morning clippings with a dedicated filter toggle.
   - **100% Client-Side Local Persistence**: Preferences, votes, dismissed stories, and saved editions persist in browser `localStorage`.

5. **Audio Dispatch (Web Speech API)**:
   - 1-click **Audio Brief** toggle synthesizing a spoken morning dispatch of top headlines using the browser's native Web Speech API at **PKR 0 cost**.

6. **Morning Editions Archive**:
   - Save today's morning paper as a standalone historical edition snapshot.
   - Slide-over archive drawer to browse and read past editions anytime.

7. **Archival Print & "Save as PDF" Broadsheet**:
   - Custom `@media print` CSS engine designed for physical printing and digital PDF archival.
   - Dedicated Print dialog instructing users how to choose **"Save as PDF"** and enable **"Background graphics"**.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or later
- **npm** or **yarn** / **pnpm**

### Installation

```bash
# Clone repository
git clone https://github.com/aliabdullah-se/Ai-Hackathon-Project.git
cd Ai-Hackathon-Project/Ai-Hackathon-project

# Install dependencies
npm install
```

### Running Locally

```bash
# Development server:
npm run dev

# Or Production build:
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🛠️ Tech Stack & Zero-Budget Audit (PKR 0)

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS with custom Daymark editorial theme
- **Icons**: Lucide React
- **RSS Parsing**: Fast-XML-Parser (resilient, zero API key requirement)
- **Audio Dispatch**: Native Browser Web Speech API (`SpeechSynthesis`)
- **State & Storage**: React 18 hooks with SSR-safe `localStorage` persistence
- **Total Budget**: PKR 0 (Zero paid APIs, zero credit card requirements)

---

## 📖 How to Demo Daymark

1. **Onboarding / Preferences**:
   - Enter your name and custom newspaper title (*e.g., "THE VANCE DISPATCH"*).
   - Select topics and add custom interest lenses (*e.g., Artificial Intelligence, Clean Energy*).
   - Click **Generate My Morning Edition**.

2. **Inspect Cover Story & Explainability**:
   - View the TIDE-inspired two-column Cover Story.
   - Click the **Match Badge** (*e.g., 94% Match*) to inspect the transparent scoring logic.

3. **Audio Dispatch**:
   - Click **Audio Brief** in the top bar to listen to your morning audio briefing.

4. **Archive & Print PDF**:
   - Click **Save Issue** in the masthead to snapshot today's edition.
   - Click **Print / PDF** to export an archival broadsheet PDF.
