'use client';

import React from 'react';
import { ThumbsUp, ThumbsDown, X, Bookmark, ExternalLink, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { ScoredArticle } from '@/lib/ranking';

interface ArticleCardProps {
  article: ScoredArticle;
  variant?: 'hero' | 'standard' | 'wire';
  onLike: (article: ScoredArticle) => void;
  onDislike: (article: ScoredArticle) => void;
  onSkip: (article: ScoredArticle) => void;
  onBookmark: (article: ScoredArticle) => void;
  onWhyThis: (article: ScoredArticle) => void;
  isLiked?: boolean;
  isDisliked?: boolean;
  isBookmarked?: boolean;
}

export default function ArticleCard({
  article,
  variant = 'standard',
  onLike,
  onDislike,
  onSkip,
  onBookmark,
  onWhyThis,
  isLiked = false,
  isDisliked = false,
  isBookmarked = false,
}: ArticleCardProps) {
  const pubDate = new Date(article.publishedAt);
  const formattedDate = pubDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = pubDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. HERO LEAD STORY VARIANT (Inspired by TIDE cover story)
  if (variant === 'hero') {
    return (
      <article className="pb-8 mb-8 border-b border-ivory-300 print-break-inside-avoid">
        {/* Cover Story Header Tagline */}
        <div className="flex items-center justify-between text-xs font-sans mb-3 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-forest-600">
              Cover Story
            </span>
            <span className="text-ivory-400">•</span>
            <span className="text-[11px] font-sans uppercase tracking-wider text-charcoal-600">
              {article.category}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onWhyThis(article)}
              className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-forest-50 hover:bg-forest-100 text-forest-700 text-[11px] font-sans font-medium border border-forest-200 transition-colors no-print cursor-pointer"
              title="Click to view why this was ranked for you"
            >
              <Sparkles className="w-3 h-3 text-forest-600" />
              <span>{article.relevanceScore}% Match</span>
            </button>
            <span className="text-ivory-400 no-print">•</span>
            <span className="flex items-center text-charcoal-500 text-[11px] font-sans">
              <Clock className="w-3 h-3 mr-1" />
              {article.readTimeMinutes} min read
            </span>
          </div>
        </div>

        {/* Responsive Grid: Photo + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Hero Image */}
          {article.imageUrl ? (
            <div className="lg:col-span-6 w-full overflow-hidden rounded bg-ivory-200 border border-ivory-300 shadow-2xs">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-[280px] sm:h-[360px] lg:h-[420px] object-cover hover:scale-[1.01] transition-transform duration-500"
                loading="eager"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="py-1.5 px-3 text-[10px] text-charcoal-500 font-sans italic bg-ivory-50 border-t border-ivory-200 flex justify-between">
                <span>Via {article.source.name}</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          ) : null}

          {/* Headline & Abstract Column */}
          <div className={article.imageUrl ? 'lg:col-span-6' : 'lg:col-span-12'}>
            <h2 className="font-headline text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-normal sm:font-medium italic text-charcoal-900 leading-[1.08] tracking-tight mb-4 hover:text-forest-700 transition-colors">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>
            </h2>

            {/* Byline & Source info */}
            <div className="text-xs font-sans text-charcoal-500 mb-4 flex items-center flex-wrap gap-2">
              <span className="font-medium text-charcoal-800">Reporting by {article.source.name}</span>
              {article.author && (
                <>
                  <span className="text-ivory-400">•</span>
                  <span>By {article.author}</span>
                </>
              )}
              <span className="text-ivory-400">•</span>
              <span>{formattedDate}</span>
            </div>

            {/* Narrative text with dropcap */}
            <p className="text-base sm:text-lg font-serif text-charcoal-700 leading-relaxed editorial-dropcap mb-6">
              {article.description}
            </p>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between pt-4 border-t border-ivory-200 text-xs font-sans flex-wrap gap-3">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-forest-700 hover:text-forest-900 font-semibold font-sans group transition-colors"
              >
                <span>Read the full feature</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </a>

              {/* Feedback controls */}
              <div className="flex items-center space-x-1 no-print">
                <button
                  onClick={() => onLike(article)}
                  className={`p-1.5 rounded transition-colors ${
                    isLiked
                      ? 'bg-forest-100 text-forest-800 font-bold'
                      : 'hover:bg-ivory-200 text-charcoal-500'
                  }`}
                  title="More stories like this"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDislike(article)}
                  className={`p-1.5 rounded transition-colors ${
                    isDisliked
                      ? 'bg-terracotta-100 text-terracotta-600 font-bold'
                      : 'hover:bg-ivory-200 text-charcoal-500'
                  }`}
                  title="Less stories like this"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onBookmark(article)}
                  className={`p-1.5 rounded transition-colors ${
                    isBookmarked
                      ? 'bg-amber-100 text-amber-800'
                      : 'hover:bg-ivory-200 text-charcoal-500'
                  }`}
                  title={isBookmarked ? 'Saved in clippings' : 'Save story'}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSkip(article)}
                  className="p-1.5 rounded hover:bg-ivory-200 text-charcoal-400 hover:text-charcoal-800 transition-colors"
                  title="Dismiss story from today's paper"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // 2. WIRE / SIDEBAR COMPACT DISPATCH VARIANT
  if (variant === 'wire') {
    return (
      <div className="py-3 border-b border-ivory-200/80 last:border-b-0 print-break-inside-avoid group">
        <div className="flex items-center justify-between text-[11px] font-sans text-charcoal-500 mb-1">
          <span className="font-semibold text-forest-700 uppercase tracking-wider text-[10px]">
            {article.source.name}
          </span>
          <span className="font-mono text-charcoal-400 text-[10px]">{formattedTime}</span>
        </div>
        <h4 className="text-sm font-serif font-bold text-charcoal-900 leading-snug group-hover:text-forest-700 transition-colors">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h4>
        <p className="text-xs font-serif text-charcoal-600 line-clamp-2 mt-1 leading-normal">
          {article.description}
        </p>
        <div className="flex items-center justify-between mt-2 pt-1 text-[11px] font-sans text-charcoal-500">
          <button
            onClick={() => onWhyThis(article)}
            className="flex items-center space-x-1 text-forest-600 hover:underline no-print text-[10px]"
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>{article.relevanceScore}% match</span>
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-0.5 text-charcoal-700 hover:text-charcoal-900 font-medium text-[11px]"
          >
            <span>Read</span>
            <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
          </a>
        </div>
      </div>
    );
  }

  // 3. STANDARD EDITORIAL GRID STORY
  return (
    <article className="border border-ivory-300 bg-ivory-50/60 hover:bg-white rounded p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xs hover:border-ivory-400 print-break-inside-avoid group">
      <div>
        {/* Source & Category Header */}
        <div className="flex items-center justify-between text-xs font-sans text-charcoal-500 mb-2.5">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold uppercase tracking-wider text-[10px] text-forest-600">
              {article.category}
            </span>
            <span>•</span>
            <span className="font-medium text-charcoal-700">{article.source.name}</span>
          </div>
          <button
            onClick={() => onWhyThis(article)}
            className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-ivory-200/80 hover:bg-ivory-300 text-charcoal-800 text-[10px] font-sans font-medium transition-colors no-print"
            title="Click to view why this was ranked for you"
          >
            <Sparkles className="w-2.5 h-2.5 text-forest-600" />
            <span>{article.relevanceScore}%</span>
          </button>
        </div>

        {/* Thumbnail if present */}
        {article.imageUrl && (
          <div className="mb-3 overflow-hidden rounded bg-ivory-200 border border-ivory-300">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-40 object-cover group-hover:scale-[1.02] transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Headline */}
        <h3 className="text-lg sm:text-xl font-headline font-semibold text-charcoal-900 leading-snug mb-2 group-hover:text-forest-700 transition-colors">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h3>

        {/* Abstract */}
        <p className="text-xs sm:text-sm font-serif text-charcoal-600 line-clamp-3 leading-relaxed mb-4">
          {article.description}
        </p>
      </div>

      {/* Footer & Feedback Actions */}
      <div className="pt-3 border-t border-ivory-200 flex items-center justify-between text-xs font-sans">
        <div className="flex items-center space-x-2 text-[11px] text-charcoal-500">
          <span>{formattedDate}</span>
          <span>•</span>
          <span>{article.readTimeMinutes}m read</span>
        </div>

        <div className="flex items-center space-x-1 no-print">
          <button
            onClick={() => onLike(article)}
            className={`p-1 rounded hover:bg-ivory-200 transition-colors ${
              isLiked ? 'text-forest-700 font-bold' : 'text-charcoal-400 hover:text-charcoal-700'
            }`}
            title="More stories like this"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDislike(article)}
            className={`p-1 rounded hover:bg-ivory-200 transition-colors ${
              isDisliked ? 'text-terracotta-600 font-bold' : 'text-charcoal-400 hover:text-charcoal-700'
            }`}
            title="Less stories like this"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onBookmark(article)}
            className={`p-1 rounded hover:bg-ivory-200 transition-colors ${
              isBookmarked ? 'text-amber-700' : 'text-charcoal-400 hover:text-charcoal-700'
            }`}
            title="Save article"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSkip(article)}
            className="p-1 rounded hover:bg-ivory-200 text-charcoal-400 hover:text-charcoal-800 transition-colors"
            title="Dismiss article"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-charcoal-700 hover:text-forest-700 transition-colors ml-0.5"
            title="Open original publication"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
