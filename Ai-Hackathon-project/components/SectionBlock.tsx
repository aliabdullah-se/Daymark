'use client';

import React from 'react';
import { ScoredArticle } from '@/lib/ranking';
import ArticleCard from './ArticleCard';
import { useSettings } from './ThemeProvider';

interface SectionBlockProps {
  title: string;
  sectionCode?: string;
  articles: ScoredArticle[];
  onLike: (article: ScoredArticle) => void;
  onDislike: (article: ScoredArticle) => void;
  onSkip: (article: ScoredArticle) => void;
  onBookmark: (article: ScoredArticle) => void;
  onWhyThis: (article: ScoredArticle) => void;
  onRead?: (article: ScoredArticle) => void;
  likedIds: string[];
  dislikedIds: string[];
  bookmarkedIds: string[];
}

export default function SectionBlock({
  title,
  sectionCode = 'SECTION',
  articles,
  onLike,
  onDislike,
  onSkip,
  onBookmark,
  onWhyThis,
  onRead,
  likedIds,
  dislikedIds,
  bookmarkedIds,
}: SectionBlockProps) {
  const { settings } = useSettings();

  if (articles.length === 0) return null;

  const gridClass =
    settings.articleLayout === 'single'
      ? 'grid grid-cols-1 gap-6'
      : settings.articleLayout === 'two'
      ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

  const headlineFontClass =
    settings.headlineFont === 'sans'
      ? 'font-headline-sans'
      : settings.headlineFont === 'classic'
      ? 'font-headline-classic'
      : 'font-headline-serif';

  return (
    <section className="my-10 print-break-inside-avoid">
      {/* Section Header Rule */}
      <div className="flex items-center space-x-3 mb-5">
        <span className="font-sans font-bold text-[10px] uppercase tracking-[0.25em] text-[var(--accent-primary)] bg-[var(--accent-subtle)] px-2.5 py-1 rounded border border-[var(--accent-border)]">
          {sectionCode}
        </span>
        <h3 className={`${headlineFontClass} text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]`}>
          {title}
        </h3>
        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
      </div>

      {/* Grid of Section Articles */}
      <div className={gridClass}>
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            variant="standard"
            onLike={onLike}
            onDislike={onDislike}
            onSkip={onSkip}
            onBookmark={onBookmark}
            onWhyThis={onWhyThis}
            onRead={onRead}
            isLiked={likedIds.includes(article.id)}
            isDisliked={dislikedIds.includes(article.id)}
            isBookmarked={bookmarkedIds.includes(article.id)}
          />
        ))}
      </div>
    </section>
  );
}
