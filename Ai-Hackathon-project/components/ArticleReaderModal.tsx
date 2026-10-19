'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
} from 'lucide-react';
import { ScoredArticle } from '@/lib/ranking';
import { useSettings } from './ThemeProvider';

interface ArticleReaderModalProps {
  article: ScoredArticle | null;
  onClose: () => void;
  onLike?: (article: ScoredArticle) => void;
  onDislike?: (article: ScoredArticle) => void;
  onBookmark?: (article: ScoredArticle) => void;
  onWhyThis?: (article: ScoredArticle) => void;
  onSelectRelated?: (article: ScoredArticle) => void;
  allArticles?: ScoredArticle[];
  isLiked?: boolean;
  isDisliked?: boolean;
  isBookmarked?: boolean;
  onShowToast?: (msg: string) => void;
}

export default function ArticleReaderModal({
  article,
  onClose,
  onLike,
  onDislike,
  onBookmark,
  onWhyThis,
  onSelectRelated,
  allArticles = [],
  isLiked = false,
  isDisliked = false,
  isBookmarked = false,
  onShowToast,
}: ArticleReaderModalProps) {
  const { settings } = useSettings();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [onClose]);

  if (!article) return null;

  const pubDate = new Date(article.publishedAt);
  const formattedDate = pubDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = pubDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Related articles from the same category
  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  // Audio Speech for this article
  const toggleArticleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onShowToast) onShowToast('Audio speech is not supported in this browser');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const narrationText = `${article.title}. Reported by ${article.source.name}. ${article.description || ''}`;
    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    if (onShowToast) onShowToast('Narrating article audio...');
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(article.url);
        setCopied(true);
        if (onShowToast) onShowToast('Article link copied to clipboard!');
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      if (onShowToast) onShowToast('Could not copy link');
    }
  };

  const headlineFontClass =
    settings.headlineFont === 'sans'
      ? 'font-headline-sans'
      : settings.headlineFont === 'classic'
      ? 'font-headline-classic'
      : 'font-headline-serif';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-article-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex justify-center items-start p-3 sm:p-6 md:p-8 animate-in fade-in duration-200 no-print"
    >
      <div className="relative w-full max-w-4xl bg-[#0D1B2C] border border-[#20344B] rounded-xl shadow-2xl text-[#F1F5FA] my-auto overflow-hidden">
        {/* Top Control Bar */}
        <header className="sticky top-0 z-20 bg-[#081321]/95 backdrop-blur-sm border-b border-[#20344B] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                setIsSpeaking(false);
                onClose();
              }}
              className="flex items-center space-x-1.5 text-xs font-sans text-[#A4B3C7] hover:text-[#F1F5FA] px-2.5 py-1 rounded-md bg-[#0D1B2C] border border-[#20344B] hover:border-[#526BFF] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Broadsheet</span>
            </button>

            <span className="hidden sm:inline-block text-xs font-sans uppercase tracking-widest text-[#526BFF] font-bold px-2 py-0.5 rounded bg-[#526BFF]/10 border border-[#526BFF]/20">
              {article.category}
            </span>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-2">
            {/* Audio Read Aloud */}
            <button
              onClick={toggleArticleSpeech}
              className={`p-2 rounded-lg border text-xs font-sans flex items-center space-x-1.5 transition-colors cursor-pointer ${
                isSpeaking
                  ? 'bg-[#526BFF] text-white border-[#526BFF]'
                  : 'bg-[#0D1B2C] text-[#A4B3C7] border-[#20344B] hover:text-[#F1F5FA] hover:border-[#526BFF]'
              }`}
              title={isSpeaking ? 'Stop narration' : 'Listen to audio briefing'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden md:inline">{isSpeaking ? 'Stop' : 'Listen'}</span>
            </button>

            {/* Bookmark */}
            {onBookmark && (
              <button
                onClick={() => onBookmark(article)}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  isBookmarked
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                    : 'bg-[#0D1B2C] text-[#A4B3C7] border-[#20344B] hover:text-[#F1F5FA]'
                }`}
                title={isBookmarked ? 'Saved to clippings' : 'Save story'}
                aria-label="Bookmark"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            )}

            {/* Like */}
            {onLike && (
              <button
                onClick={() => onLike(article)}
                className={`p-2 rounded-lg border text-xs font-sans flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  isLiked
                    ? 'bg-[#526BFF]/20 text-[#526BFF] border-[#526BFF]/40 font-bold'
                    : 'bg-[#0D1B2C] text-[#A4B3C7] border-[#20344B] hover:text-[#F1F5FA]'
                }`}
                title={isLiked ? 'You liked this story' : 'Like story'}
                aria-label="Like"
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="font-mono text-xs font-semibold">{article.likesCount ?? 24}</span>
              </button>
            )}

            {/* Dislike */}
            {onDislike && (
              <button
                onClick={() => onDislike(article)}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  isDisliked
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : 'bg-[#0D1B2C] text-[#A4B3C7] border-[#20344B] hover:text-[#F1F5FA]'
                }`}
                title="Dislike story"
                aria-label="Dislike"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            )}

            {/* Share Link */}
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-[#0D1B2C] text-[#A4B3C7] border border-[#20344B] hover:text-[#F1F5FA] hover:border-[#526BFF] transition-colors cursor-pointer"
              title="Copy link"
              aria-label="Share article"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                setIsSpeaking(false);
                onClose();
              }}
              className="p-2 rounded-lg bg-[#0D1B2C] text-[#A4B3C7] border border-[#20344B] hover:text-[#F1F5FA] hover:bg-red-500/10 hover:border-red-500/30 transition-colors cursor-pointer"
              aria-label="Close reader"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Article Body Content */}
        <div className="p-6 sm:p-8 md:p-12 max-w-3xl mx-auto">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-sans text-[#A4B3C7] mb-4 pb-4 border-b border-[#20344B]">
            <span className="font-semibold text-[#F1F5FA] bg-[#12243A] px-2.5 py-1 rounded border border-[#20344B]">
              {article.source.name}
            </span>
            <span>•</span>
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-[#526BFF]" />
              {formattedDate} at {formattedTime}
            </span>
            <span>•</span>
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-[#4DB8E8]" />
              {article.readTimeMinutes} min read
            </span>

            {onWhyThis && (
              <button
                onClick={() => onWhyThis(article)}
                className="ml-auto inline-flex items-center space-x-1 text-[11px] font-sans px-2.5 py-1 rounded bg-[#526BFF]/10 text-[#526BFF] hover:bg-[#526BFF]/20 border border-[#526BFF]/30 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>{article.relevanceScore}% Relevance Match</span>
              </button>
            )}
          </div>

          {/* Headline */}
          <h1
            id="reader-article-title"
            className={`${headlineFontClass} text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#F1F5FA] leading-[1.15] mb-6`}
          >
            {article.title}
          </h1>

          {/* Author Byline */}
          {article.author && (
            <div className="text-xs font-sans text-[#A4B3C7] mb-6 italic">
              By <span className="font-semibold text-[#F1F5FA] not-italic">{article.author}</span>
            </div>
          )}

          {/* Hero Editorial Image */}
          {article.imageUrl && (
            <figure className="mb-8 overflow-hidden rounded-lg border border-[#20344B] bg-[#12243A]">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full max-h-[460px] object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <figcaption className="px-4 py-2 text-xs font-sans text-[#A4B3C7] bg-[#081321]/60 flex items-center justify-between border-t border-[#20344B]">
                <span>Photograph via {article.source.name}</span>
                <span className="text-[10px] uppercase tracking-wider text-[#526BFF]">{article.category}</span>
              </figcaption>
            </figure>
          )}

          {/* Narrative Body */}
          <div className="font-serif text-[#F1F5FA]/90 text-lg sm:text-xl leading-relaxed space-y-6">
            {article.description && (
              <p className="editorial-dropcap text-lg sm:text-xl text-[#F1F5FA] leading-relaxed font-serif">
                {article.description}
              </p>
            )}

            {/* Editorial Analysis Callout */}
            <div className="my-8 p-5 rounded-lg bg-[#12243A] border-l-4 border-[#526BFF] text-sm font-sans text-[#A4B3C7]">
              <div className="font-bold text-[#F1F5FA] uppercase tracking-wider text-xs mb-1 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#526BFF]" />
                <span>Daymark Editorial Context</span>
              </div>
              <p className="leading-relaxed">
                This report was scored at <strong className="text-[#F1F5FA]">{article.relevanceScore}% match</strong> based
                on your reader topic calibration for <strong className="text-[#526BFF]">{article.category}</strong>. Daymark
                preserves zero client tracking while tailoring your daily broadsheet locally.
              </p>
            </div>
          </div>

          {/* External Full Feature Link & Likes Counter */}
          <div className="mt-10 pt-6 border-t border-[#20344B] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              {onLike && (
                <button
                  type="button"
                  onClick={() => onLike(article)}
                  className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg border text-xs font-sans font-medium transition-all cursor-pointer ${
                    isLiked
                      ? 'bg-[#526BFF] text-white border-[#526BFF] font-bold shadow-sm'
                      : 'bg-[#12243A] text-[#F1F5FA] border-[#20344B] hover:border-[#526BFF]'
                  }`}
                  title={isLiked ? 'You liked this post' : 'Like this post'}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{isLiked ? 'Liked' : 'Like Post'}</span>
                  <span className="font-mono bg-white/20 px-1.5 py-0.5 rounded text-[11px] font-bold">
                    {article.likesCount ?? 24}
                  </span>
                </button>
              )}
              <div className="text-xs font-sans text-[#A4B3C7]">
                Original reporting hosted by <strong className="text-[#F1F5FA]">{article.source.name}</strong>
              </div>
            </div>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#526BFF] hover:bg-[#3B54E6] text-white font-sans text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <span>Read Original on {article.source.name}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <div className="mt-12 pt-8 border-t border-[#20344B]">
              <div className="flex items-center space-x-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#526BFF]" />
                <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-[#F1F5FA]">
                  Related {article.category.toUpperCase()} Coverage
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedArticles.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      if (onSelectRelated) onSelectRelated(rel);
                    }}
                    className="p-3.5 rounded-lg bg-[#12243A] border border-[#20344B] hover:border-[#526BFF] transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {rel.imageUrl && (
                        <div className="h-24 w-full rounded overflow-hidden mb-2.5 bg-[#0D1B2C]">
                          <img
                            src={rel.imageUrl}
                            alt={rel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <h4 className="font-serif text-xs font-bold text-[#F1F5FA] group-hover:text-[#526BFF] transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#20344B] flex items-center justify-between text-[10px] font-sans text-[#A4B3C7]">
                      <span>{rel.source.name}</span>
                      <span className="text-[#526BFF] font-semibold">Read →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
