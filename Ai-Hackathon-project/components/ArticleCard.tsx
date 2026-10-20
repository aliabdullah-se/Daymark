'use client';

import React from 'react';
import { ThumbsUp, ThumbsDown, X, Bookmark, ExternalLink, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { ScoredArticle } from '@/lib/ranking';
import { useSettings } from './ThemeProvider';

interface ArticleCardProps {
  article: ScoredArticle;
  variant?: 'hero' | 'standard' | 'wire';
  onLike: (article: ScoredArticle) => void;
  onDislike: (article: ScoredArticle) => void;
  onSkip: (article: ScoredArticle) => void;
  onBookmark: (article: ScoredArticle) => void;
  onWhyThis: (article: ScoredArticle) => void;
  onRead?: (article: ScoredArticle) => void;
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
  onRead,
  isLiked = false,
  isDisliked = false,
  isBookmarked = false,
}: ArticleCardProps) {
  const { settings } = useSettings();

  const pubDate = new Date(article.publishedAt);
  const formattedDate = pubDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = pubDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const headlineFontClass =
    settings.headlineFont === 'sans'
      ? 'font-headline-sans'
      : settings.headlineFont === 'classic'
      ? 'font-headline-classic'
      : 'font-headline-serif';

  // 1. HERO LEAD STORY VARIANT
  if (variant === 'hero') {
    return (
      <article className="pb-8 mb-8 border-b border-[var(--border-subtle)] print-break-inside-avoid">
        {/* Cover Story Header Tagline */}
        <div className="flex items-center justify-between text-xs font-sans mb-3 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[var(--accent-primary)]">
              Cover Story
            </span>
            <span className="text-[var(--border-subtle)]">•</span>
            <span className="text-[11px] font-sans uppercase tracking-wider text-[var(--text-secondary)]">
              {article.category}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onWhyThis(article)}
              className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[var(--accent-subtle)] hover:opacity-90 text-[var(--accent-text)] text-[11px] font-sans font-medium border border-[var(--accent-border)] transition-colors no-print cursor-pointer"
              title="Click to view why this was ranked for you"
            >
              <Sparkles className="w-3 h-3 text-[var(--accent-primary)]" />
              <span>{article.relevanceScore}% Match</span>
            </button>
            <span className="text-[var(--border-subtle)] no-print">•</span>
            <span className="flex items-center text-[var(--text-muted)] text-[11px] font-sans">
              <Clock className="w-3 h-3 mr-1" />
              {article.readTimeMinutes} min read
            </span>
          </div>
        </div>

        {/* Responsive Grid: Photo + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Hero Image (Respects settings.showImages) */}
          {settings.showImages && article.imageUrl ? (
            <div className="lg:col-span-6 w-full overflow-hidden rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-xs">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] xl:aspect-[16/10] overflow-hidden flex items-center justify-center bg-[var(--bg-surface-subtle)]">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover object-[center_25%] hover:scale-[1.02] transition-transform duration-500 ease-out"
                  loading="eager"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="py-1.5 px-3 text-[10px] text-[var(--text-muted)] font-sans italic bg-[var(--bg-surface-subtle)] border-t border-[var(--border-subtle)] flex justify-between">
                <span>Via {article.source.name}</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          ) : null}

          {/* Headline & Abstract Column */}
          <div className={settings.showImages && article.imageUrl ? 'lg:col-span-6' : 'lg:col-span-12'}>
            <h2 className={`${headlineFontClass} text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-normal sm:font-medium italic text-[var(--text-primary)] leading-[1.08] tracking-tight mb-4 hover:text-[var(--accent-primary)] transition-colors`}>
              {onRead ? (
                <button
                  type="button"
                  onClick={() => onRead(article)}
                  className="text-left cursor-pointer hover:text-[var(--accent-primary)] transition-colors"
                >
                  {article.title}
                </button>
              ) : (
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.title}
                </a>
              )}
            </h2>

            {/* Byline & Source info */}
            <div className="text-xs font-sans text-[var(--text-muted)] mb-4 flex items-center flex-wrap gap-2">
              <span className="font-medium text-[var(--text-secondary)]">Reporting by {article.source.name}</span>
              {article.author && (
                <>
                  <span className="text-[var(--border-subtle)]">•</span>
                  <span>By {article.author}</span>
                </>
              )}
              <span className="text-[var(--border-subtle)]">•</span>
              <span>{formattedDate}</span>
            </div>

            {/* Narrative text with dropcap */}
            <p className="text-base sm:text-lg font-serif text-[var(--text-secondary)] leading-relaxed editorial-dropcap mb-6">
              {article.description}
            </p>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)] text-xs font-sans flex-wrap gap-3">
              {onRead ? (
                <button
                  type="button"
                  onClick={() => onRead(article)}
                  className="inline-flex items-center space-x-1.5 text-[var(--accent-primary)] hover:underline font-semibold font-sans group transition-colors cursor-pointer"
                >
                  <span>Read the full feature</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-[var(--accent-primary)] hover:underline font-semibold font-sans group transition-colors"
                >
                  <span>Read the full feature</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              )}

              {/* Feedback controls */}
              <div className="flex items-center space-x-2 no-print">
                <button
                  onClick={() => onLike(article)}
                  className={`px-2.5 py-1 rounded text-xs font-sans flex items-center space-x-1.5 transition-all cursor-pointer ${
                    isLiked
                      ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-bold border border-[var(--accent-border)]'
                      : 'hover:bg-[var(--bg-surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-transparent'
                  }`}
                  title={isLiked ? 'You liked this post' : 'Like this post'}
                  aria-label="Like story"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="font-mono text-xs font-bold">{article.likesCount ?? 28}</span>
                </button>
                <button
                  onClick={() => onDislike(article)}
                  className={`p-1.5 rounded transition-all cursor-pointer ${
                    isDisliked
                      ? 'bg-red-500/10 text-red-500 font-bold border border-red-500/30'
                      : 'hover:bg-[var(--bg-surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                  title="Less stories like this"
                  aria-label="Dislike story"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onBookmark(article)}
                  className={`p-1.5 rounded transition-all cursor-pointer ${
                    isBookmarked
                      ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                      : 'hover:bg-[var(--bg-surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                  title={isBookmarked ? 'Saved in clippings' : 'Save story'}
                  aria-label="Bookmark story"
                >
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSkip(article)}
                  className="p-1.5 rounded hover:bg-[var(--bg-surface-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  title="Dismiss story from today's paper"
                  aria-label="Dismiss story"
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

  // 2. WIRE / SIDEBAR COMPACT REPORT VARIANT
  if (variant === 'wire') {
    return (
      <div className="py-3 border-b border-[var(--border-subtle)] last:border-b-0 print-break-inside-avoid group">
        <div className="flex items-center justify-between text-[11px] font-sans text-[var(--text-muted)] mb-1">
          <span className="font-semibold text-[var(--accent-primary)] uppercase tracking-wider text-[10px]">
            {article.source.name}
          </span>
          <span className="font-mono text-[var(--text-muted)] text-[10px]">{formattedTime}</span>
        </div>
        <h4 className={`text-sm ${headlineFontClass} font-bold text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent-primary)] transition-colors`}>
          {onRead ? (
            <button
              type="button"
              onClick={() => onRead(article)}
              className="text-left cursor-pointer hover:text-[var(--accent-primary)] transition-colors"
            >
              {article.title}
            </button>
          ) : (
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>
          )}
        </h4>
        <p className="text-xs font-serif text-[var(--text-secondary)] line-clamp-2 mt-1 leading-normal">
          {article.description}
        </p>
        <div className="flex items-center justify-between mt-2 pt-1 text-[11px] font-sans text-[var(--text-muted)]">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onLike(article)}
              className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-sans transition-colors cursor-pointer no-print ${
                isLiked
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-bold border border-[var(--accent-border)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]'
              }`}
              title={isLiked ? 'You liked this wire story' : 'Like wire story'}
            >
              <ThumbsUp className="w-2.5 h-2.5" />
              <span className="font-mono text-[10px] font-semibold">{article.likesCount ?? 16}</span>
            </button>
            <button
              onClick={() => onWhyThis(article)}
              className="flex items-center space-x-1 text-[var(--accent-primary)] hover:underline no-print text-[10px] cursor-pointer"
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>{article.relevanceScore}% match</span>
            </button>
          </div>
          {onRead ? (
            <button
              type="button"
              onClick={() => onRead(article)}
              className="inline-flex items-center space-x-0.5 text-[var(--text-primary)] hover:text-[var(--accent-primary)] font-medium text-[11px] cursor-pointer"
            >
              <span>Read</span>
              <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
            </button>
          ) : (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-0.5 text-[var(--text-primary)] hover:text-[var(--accent-primary)] font-medium text-[11px]"
            >
              <span>Read</span>
              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // 3. STANDARD EDITORIAL GRID STORY
  return (
    <article className="border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] rounded-lg p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xs group print-break-inside-avoid">
      <div>
        {/* Source & Category Header */}
        <div className="flex items-center justify-between text-xs font-sans text-[var(--text-muted)] mb-2.5">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--accent-primary)]">
              {article.category}
            </span>
            <span>•</span>
            <span className="font-medium text-[var(--text-secondary)]">{article.source.name}</span>
          </div>
          <button
            onClick={() => onWhyThis(article)}
            className="flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-[var(--bg-surface-subtle)] hover:bg-[var(--accent-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-text)] text-[10px] font-sans font-medium transition-colors no-print cursor-pointer border border-[var(--border-subtle)]"
            title="Click to view why this was ranked for you"
          >
            <Sparkles className="w-2.5 h-2.5 text-[var(--accent-primary)]" />
            <span>{article.relevanceScore}%</span>
          </button>
        </div>

        {/* Thumbnail if present and enabled */}
        {settings.showImages && article.imageUrl && (
          <div
            onClick={() => onRead && onRead(article)}
            className={`mb-3 overflow-hidden rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] relative aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center ${
              onRead ? 'cursor-pointer' : ''
            }`}
          >
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover object-[center_25%] group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Headline */}
        <h3 className={`text-lg sm:text-xl ${headlineFontClass} font-semibold text-[var(--text-primary)] leading-snug mb-2 group-hover:text-[var(--accent-primary)] transition-colors`}>
          {onRead ? (
            <button
              type="button"
              onClick={() => onRead(article)}
              className="text-left cursor-pointer hover:text-[var(--accent-primary)] transition-colors"
            >
              {article.title}
            </button>
          ) : (
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>
          )}
        </h3>

        {/* Abstract */}
        <p className="text-xs sm:text-sm font-serif text-[var(--text-secondary)] line-clamp-3 leading-relaxed mb-4">
          {article.description}
        </p>
      </div>

      {/* Footer & Feedback Actions */}
      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-sans">
        <div className="flex items-center space-x-2 text-[11px] text-[var(--text-muted)]">
          <span>{formattedDate}</span>
          <span>•</span>
          <span>{article.readTimeMinutes}m read</span>
        </div>

        <div className="flex items-center space-x-1.5 no-print">
          <button
            onClick={() => onLike(article)}
            className={`px-2 py-0.5 rounded text-xs font-sans flex items-center space-x-1 transition-all cursor-pointer ${
              isLiked
                ? 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-bold border border-[var(--accent-border)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] border border-transparent'
            }`}
            title={isLiked ? 'You liked this story' : 'Like story'}
            aria-label="Like"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px] font-bold">{article.likesCount ?? 19}</span>
          </button>
          <button
            onClick={() => onDislike(article)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isDisliked
                ? 'bg-red-500/10 text-red-500 font-bold border border-red-500/30'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]'
            }`}
            title="Less stories like this"
            aria-label="Dislike"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onBookmark(article)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isBookmarked
                ? 'bg-amber-500/15 text-amber-500 font-bold border border-amber-500/30'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)]'
            }`}
            title="Save article"
            aria-label="Bookmark"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSkip(article)}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
            title="Dismiss article"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors ml-0.5"
            title="Open original publication"
            aria-label="Open original link"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
