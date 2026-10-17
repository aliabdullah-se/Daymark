# The Morning Chronicle — Personalized Digital Broadsheet

> **NaSCon '26 Official AI Challenge Submission: Personalized Digital Morning Newspaper**  
> An editorial, AI-ranked morning broadsheet delivering real, verified news tailored to your unique intellectual interests.

---

## 📰 Overview & Key Features

The Morning Chronicle reinvents the classic broadsheet experience for the digital era:

1. **Distinctive Editorial Aesthetic**:
   - Classic newspaper masthead typography (Playfair Display, Cinzel, Newsreader).
   - Authentic broadsheet column layouts, editorial drop caps, woodblock double-rules, and weather/issue metadata.
   - Distinct sections: Front Page Lead Story, Front Page Reports, The Morning Wire sidebar, and categorical sections (Technology, World Affairs, Markets, Science, and Culture).

2. **Real-Time Live Wire (Zero Hallucination)**:
   - Server-side multi-feed aggregation from premier global editorial outlets:
     - **BBC News** (World, Technology, Business, Science, Health, Entertainment)
     - **The New York Times** (World, Technology, Science, Business, Climate, Opinion)
     - **Ars Technica** & **NPR News**
   - Resilient XML parsing with `fast-xml-parser`, image thumbnail normalization, and graceful timeouts.
   - **Zero API key required** out of the box.

3. **Transparent & Explainable Ranking Engine**:
   - Calculates deterministic personal relevance scores (0–99%) for every story.
   - **Scoring breakdown**:
     - Topic alignment (+20 pts)
     - Custom keyword phrase & token matches (+16 to +35 pts)
     - Morning freshness / recency decay (+8 to +20 pts)
     - Reading pace alignment (+10 pts)
     - Interactive feedback weighting (+/- pts)
   - Every article has an inspectable **"Why this?"** modal explaining the exact scoring components.

4. **Interactive Reader Feedback & Local Learning**:
   - **Thumbs Up / Down**: Boosts or demotes categorical and keyword affinities in real-time.
   - **Skip / Dismiss (✕)**: Instantly dismisses irrelevant stories from today's paper.
   - **Clippings / Bookmarks (🔖)**: Saves articles to personal morning clippings.
   - **100% Client-Side Local Persistence**: Preferences, votes, dismissed stories, and saved editions persist in `localStorage`.

5. **Morning Editions Archive**:
   - Save today's morning paper as a standalone historical edition snapshot.
   - Browse and read past editions anytime from the slide-over Archive drawer.

6. **Archival Print & "Save as PDF" Broadsheet**:
   - Custom `@media print` CSS engine designed for physical printing and digital PDF archival.
   - Dedicated Print dialog instructing users how to choose **"Save as PDF"** and enable **"Background graphics"** for a clean multi-column physical layout.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or later (Tested on Node v24.15)
- **npm** or **yarn** / **pnpm**

### Installation

```bash
# Clone repository
git clone https://github.com/aliabdullah-se/Ai-Hackathon-Project.git
cd Ai-Hackathon-Project

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

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS with custom editorial broadsheet theme
- **Icons**: Lucide React
- **RSS Parsing**: Fast-XML-Parser (resilient, zero API key requirement)
- **State & Storage**: React 18 hooks with SSR-safe `localStorage` persistence

---

## 📖 How to Demo

1. **Onboarding / Preferences**:
   - On first visit, the onboarding modal appears automatically.
   - Enter your name and custom newspaper title (e.g. *THE VANCE DISPATCH*).
   - Select topics (e.g., Technology & AI, Science & Discovery).
   - Type custom interests (e.g. *Artificial Intelligence*, *Quantum Computing*, *Space Exploration*).
   - Click **Generate My Morning Edition**.

2. **Inspect Explainability**:
   - Click the **Relevance Score Badge** (e.g., *94% Match*) on any story to view the transparent mathematical scoring breakdown.

3. **Interact & Feedback**:
   - Click **Thumbs Up** on an interesting article.
   - Click the **✕ (Dismiss)** button on an unwanted article to see the layout adjust dynamically.
   - Click **Saved Clippings** in the top bar to view bookmarked articles.

4. **Archive Today's Edition**:
   - Click **Save Today** in the masthead.
   - Open **Archive** to see your saved edition snapshot.

5. **Print or Save as PDF**:
   - Click **Print / Save PDF** in the masthead.
   - Follow the instructions to select Destination: *Save as PDF*.
