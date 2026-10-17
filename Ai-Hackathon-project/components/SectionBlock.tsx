'use client';

import React from 'react';
import { ScoredArticle } from '@/lib/ranking';
import ArticleCard from './ArticleCard';

interface SectionBlockProps {
  title: string;
  sectionCode?: string;
  articles: ScoredArticle[];
  onLike: (article: ScoredArticle) => void;
  onDislike: (article: ScoredArticle) => void;
  onSkip: (article: ScoredArticle) => void;
  onBookmark: (article: ScoredArticle) => void;
  onWhyThis: (article: ScoredArticle) => void;
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
  likedIds,
  dislikedIds,
  bookmarkedIds,
}: SectionBlockProps) {
  if (articles.length === 0) return null;

  return (
    <section className="my-10 print-break-inside-avoid">
      {/* Section Header Rule */}
      <div className="flex items-center space-x-3 mb-5">
        <span className="font-sans font-bold text-[10px] uppercase tracking-[0.25em] text-forest-700 bg-forest-50 px-2 py-0.5 rounded border border-forest-100">
          {sectionCode}
        </span>
        <h3 className="font-headline text-xl sm:text-2xl font-bold tracking-tight text-charcoal-900">
          {title}
        </h3>
        <div className="flex-1 h-px bg-ivory-300"></div>
      </div>

      {/* Grid of Section Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            isLiked={likedIds.includes(article.id)}
            isDisliked={dislikedIds.includes(article.id)}
            isBookmarked={bookmarkedIds.includes(article.id)}
          />
        ))}
      </div>
    </section>
  );
}
