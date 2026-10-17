'use client';

import React from 'react';
import { ThumbsUp, ThumbsDown, X, Bookmark, ExternalLink, Sparkles, Clock, Calendar } from 'lucide-react';
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
  });
  const formattedTime = pubDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. HERO LEAD STORY VARIANT
  if (variant === 'hero') {
    return (
      <article className="border-b-2 border-ink-900 pb-6 mb-6 print-break-inside-avoid">
        {/* Category & Relevance Badge Bar */}
        <div className="flex items-center justify-between text-xs font-sans mb-2 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-headline font-bold uppercase tracking-widest text-editorial-crimson text-[11px] bg-paper-200 px-2 py-0.5 rounded">
              Lead Story • {article.category}
            </span>
            <span className="text-ink-400">•</span>
            <span className="font-semibold text-ink-800">{article.source.name}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onWhyThis(article)}
              className="flex items-center space-x-1 px-2 py-0.5 bg-paper-200 hover:bg-paper-300 rounded text-ink-800 text-[11px] font-sans font-medium transition-colors no-print cursor-pointer"
              title="Click to view why this was ranked for you"
            >
              <Sparkles className="w-3 h-3 text-editorial-amber" />
              <span>{article.relevanceScore}% Match</span>
            </button>
            <span className="text-ink-400 no-print">•</span>
            <span className="flex items-center text-ink-600 text-[11px]">
              <Clock className="w-3 h-3 mr-1" />
              {article.readTimeMinutes} min read
            </span>
          </div>
        </div>

        {/* Lead Headline */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black text-ink-900 leading-[1.12] mb-3 tracking-tight hover:text-editorial-navy transition-colors">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h2>

        {/* Hero Image if available */}
        {article.imageUrl && (
          <div className="my-4 relative overflow-hidden rounded bg-paper-200 border border-paper-300">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full max-h-[380px] object-cover filter contrast-[1.02]"
              loading="eager"
              onError={(e) => {
                // hide on error
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="py-1 px-2 text-[10px] text-ink-500 font-sans italic bg-paper-100 border-t border-paper-200 flex justify-between">
              <span>Photo / Illustration via {article.source.name}</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        )}

        {/* Story Text / Abstract with Drop Cap */}
        <p className="text-base sm:text-lg font-serif text-ink-800 leading-relaxed editorial-dropcap mb-4">
          {article.description}
        </p>

        {/* Action & Feedback Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-paper-200 text-xs font-sans flex-wrap gap-2">
          <div className="flex items-center space-x-3 text-ink-500">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {formattedDate} at {formattedTime}
            </span>
            {article.author && (
              <span className="italic">By {article.author}</span>
            )}
          </div>

          <div className="flex items-center space-x-2 no-print">
            <button
              onClick={() => onLike(article)}
              className={`p-1.5 rounded transition-colors ${
                isLiked ? 'bg-green-100 text-green-800 font-bold' : 'hover:bg-paper-200 text-ink-600'
              }`}
              title="More stories like this"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDislike(article)}
              className={`p-1.5 rounded transition-colors ${
                isDisliked ? 'bg-red-100 text-red-800 font-bold' : 'hover:bg-paper-200 text-ink-600'
              }`}
              title="Less stories like this"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => onBookmark(article)}
              className={`p-1.5 rounded transition-colors ${
                isBookmarked ? 'bg-amber-100 text-amber-800' : 'hover:bg-paper-200 text-ink-600'
              }`}
              title={isBookmarked ? 'Saved in clippings' : 'Save to clippings'}
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSkip(article)}
              className="p-1.5 rounded hover:bg-paper-200 text-ink-400 hover:text-ink-800 transition-colors"
              title="Skip story (dismiss from today's paper)"
            >
              <X className="w-4 h-4" />
            </button>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-3 py-1 bg-ink-900 text-white rounded hover:bg-black transition-colors font-medium ml-1"
            >
              <span>Full Report</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </article>
    );
  }

  // 2. WIRE / SIDEBAR COMPACT VARIANT
  if (variant === 'wire') {
    return (
      <div className="py-2.5 border-b border-paper-200 last:border-b-0 print-break-inside-avoid">
        <div className="flex items-center justify-between text-[11px] font-sans text-ink-500 mb-1">
          <span className="font-semibold text-editorial-navy">{article.source.name}</span>
          <span className="font-mono text-ink-400">{formattedTime}</span>
        </div>
        <h4 className="text-sm font-serif font-bold text-ink-900 leading-snug hover:text-editorial-crimson transition-colors">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h4>
        <p className="text-xs font-serif text-ink-600 line-clamp-2 mt-1 leading-normal">
          {article.description}
        </p>
        <div className="flex items-center justify-between mt-2 pt-1 text-[11px] font-sans text-ink-500">
          <button
            onClick={() => onWhyThis(article)}
            className="flex items-center space-x-1 text-editorial-amber hover:underline no-print"
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>{article.relevanceScore}% match</span>
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-0.5 text-ink-700 hover:text-ink-900 font-medium"
          >
            <span>Read</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    );
  }

  // 3. STANDARD ARTICLE CARD (DEFAULT)
  return (
    <article className="border border-paper-300 bg-white/70 hover:bg-white rounded p-4 flex flex-col justify-between transition-shadow hover:shadow-md print-break-inside-avoid">
      <div>
        {/* Source & Meta Bar */}
        <div className="flex items-center justify-between text-xs font-sans text-ink-500 mb-2">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold uppercase tracking-wider text-[10px] text-editorial-crimson">
              {article.category}
            </span>
            <span>•</span>
            <span className="font-medium text-ink-700">{article.source.name}</span>
          </div>
          <button
            onClick={() => onWhyThis(article)}
            className="flex items-center space-x-1 px-1.5 py-0.5 bg-paper-100 hover:bg-paper-200 text-ink-800 rounded text-[10px] font-sans font-medium transition-colors no-print"
            title="Click to view why this was ranked for you"
          >
            <Sparkles className="w-2.5 h-2.5 text-editorial-amber" />
            <span>{article.relevanceScore}%</span>
          </button>
        </div>

        {/* Thumbnail if present */}
        {article.imageUrl && (
          <div className="mb-2.5 overflow-hidden rounded bg-paper-100 border border-paper-200">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-36 object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Title */}
        <h3 className="text-base sm:text-lg font-serif font-bold text-ink-900 leading-snug mb-2 hover:text-editorial-navy transition-colors">
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h3>

        {/* Summary Snippet */}
        <p className="text-xs sm:text-sm font-serif text-ink-700 line-clamp-3 leading-relaxed mb-3">
          {article.description}
        </p>
      </div>

      {/* Footer & Actions */}
      <div className="pt-2.5 border-t border-paper-200 flex items-center justify-between text-xs font-sans">
        <div className="flex items-center space-x-2 text-[11px] text-ink-500">
          <span>{formattedDate}</span>
          <span>•</span>
          <span>{article.readTimeMinutes}m read</span>
        </div>

        <div className="flex items-center space-x-1 no-print">
          <button
            onClick={() => onLike(article)}
            className={`p-1 rounded hover:bg-paper-100 transition-colors ${
              isLiked ? 'text-green-700 font-bold' : 'text-ink-400 hover:text-ink-700'
            }`}
            title="More like this"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDislike(article)}
            className={`p-1 rounded hover:bg-paper-100 transition-colors ${
              isDisliked ? 'text-red-700 font-bold' : 'text-ink-400 hover:text-ink-700'
            }`}
            title="Less like this"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onBookmark(article)}
            className={`p-1 rounded hover:bg-paper-100 transition-colors ${
              isBookmarked ? 'text-amber-700' : 'text-ink-400 hover:text-ink-700'
            }`}
            title="Save article"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSkip(article)}
            className="p-1 rounded hover:bg-paper-100 text-ink-400 hover:text-editorial-crimson transition-colors"
            title="Dismiss article"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-ink-700 hover:text-ink-900 transition-colors ml-0.5"
            title="Open original publication"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
