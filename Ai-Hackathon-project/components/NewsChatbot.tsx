'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Article, UserPreferences } from '@/types/news';
import { askGeminiNewsChat } from '@/lib/gemini';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: string;
}

interface NewsChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  preferences: UserPreferences;
  onShowToast?: (msg: string) => void;
  onSelectArticle?: (article: Article) => void;
}

const DEFAULT_SUGGESTIONS = [
  '⚡ Summarize today\'s top 3 stories',
  '🔍 What is the DeepSeek controversy about?',
  '🚀 Explain Elon Musk\'s SpaceX announcement',
  '🌍 What are the key world headlines today?',
];

export default function NewsChatbot({
  isOpen,
  onClose,
  articles,
  preferences,
  onShowToast,
  onSelectArticle,
}: NewsChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'assistant',
      content: `Good day, **${preferences.readerName || 'Reader'}**. I am **DAYMARK Intelligence**, your dedicated journalistic AI agent powered by Gemini AI.\n\nI have analyzed today's **${articles.length} verified news dispatches** across your chosen desks (${preferences.selectedTopics.join(', ')}). Ask me anything about today's headlines, request a topic debrief, or compare sources!`,
      model: 'gemini-1.5-flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const history = nextMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await askGeminiNewsChat(history, articles, preferences);

      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        role: 'assistant',
        content: res.reply,
        model: res.model || 'gemini-1.5-flash',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'ai_err_' + Date.now(),
        role: 'assistant',
        content: 'I encountered an error synthesizing the answer. Please try again or ask another question about today\'s wire.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      if (onShowToast) onShowToast('Response copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleToggleSpeak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onShowToast) onShowToast('Audio synthesis is not supported on this browser');
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown for smoother vocalization
    const cleanSpeech = text
      .replace(/[#*_`>~-]/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
    setSpeakingId(id);
    if (onShowToast) onShowToast('Reading AI response aloud...');
  };

  const handleClearHistory = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Conversation reset. I am ready to answer your questions on today's **${articles.length} active broadsheet reports**.`,
        model: 'gemini-1.5-flash',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    if (onShowToast) onShowToast('Chat conversation cleared');
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="DAYMARK Gemini News Intelligence Chatbot"
      className={`fixed z-50 transition-all duration-300 no-print flex flex-col ${
        isExpanded
          ? 'inset-3 sm:inset-6 md:inset-12 bg-[#0D1B2C]/98 backdrop-blur-xl border border-[#20344B] rounded-2xl shadow-2xl'
          : 'bottom-4 right-4 sm:right-6 w-[94vw] sm:w-[440px] md:w-[480px] h-[640px] max-h-[88vh] bg-[#0D1B2C]/95 backdrop-blur-xl border border-[#20344B] rounded-2xl shadow-2xl'
      }`}
    >
      {/* 1. CHATBOT HEADER */}
      <header className="p-4 sm:px-5 py-3.5 border-b border-[#20344B] flex items-center justify-between shrink-0 bg-[#12243A]/80 rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#526BFF] to-[#4DB8E8] shadow-md shadow-[#526BFF]/20">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0D1B2C]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#F1F5FA]">
                DAYMARK Intelligence
              </h3>
              <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-[#526BFF]/20 text-[#526BFF] border border-[#526BFF]/30">
                Gemini 1.5 Flash
              </span>
            </div>
            <div className="text-[11px] font-sans text-[#A4B3C7] flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{articles.length} verified news dispatches indexed</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg text-[#A4B3C7] hover:text-[#F1F5FA] hover:bg-[#20344B] transition-colors cursor-pointer"
            title="Clear conversation"
            aria-label="Clear chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-[#A4B3C7] hover:text-[#F1F5FA] hover:bg-[#20344B] transition-colors cursor-pointer hidden sm:inline-flex"
            title={isExpanded ? 'Minimize' : 'Expand window'}
            aria-label={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A4B3C7] hover:text-[#F1F5FA] hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer"
            title="Close chatbot"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. CONVERSATION THREAD */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 font-sans text-xs sm:text-sm">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-[#526BFF] text-white'
                    : 'bg-[#12243A] text-[#4DB8E8] border border-[#20344B]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[84%] rounded-2xl p-3.5 sm:p-4 leading-relaxed ${
                  isUser
                    ? 'bg-[#526BFF] text-white rounded-tr-xs shadow-md'
                    : 'bg-[#12243A] text-[#F1F5FA] border border-[#20344B] rounded-tl-xs shadow-sm'
                }`}
              >
                {/* Message Content rendered cleanly */}
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed break-words">
                  {msg.content}
                </div>

                {/* Footer metadata & actions */}
                <div
                  className={`mt-2 pt-1.5 flex items-center justify-between text-[10px] ${
                    isUser
                      ? 'text-white/70 border-t border-white/10'
                      : 'text-[#A4B3C7] border-t border-[#20344B]'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <span>{msg.timestamp}</span>
                    {!isUser && msg.model && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[#4DB8E8]">{msg.model}</span>
                      </>
                    )}
                  </div>

                  {!isUser && (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleToggleSpeak(msg.id, msg.content)}
                        className="p-1 rounded hover:bg-[#20344B] text-[#A4B3C7] hover:text-[#F1F5FA] transition-colors cursor-pointer"
                        title={speakingId === msg.id ? 'Stop reading' : 'Read aloud'}
                      >
                        {speakingId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-[#526BFF] animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 rounded hover:bg-[#20344B] text-[#A4B3C7] hover:text-[#F1F5FA] transition-colors cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#12243A] text-[#4DB8E8] border border-[#20344B] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#12243A] text-[#A4B3C7] border border-[#20344B] rounded-2xl rounded-tl-xs p-3.5 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#526BFF] animate-spin" />
              <span className="text-xs font-sans">Gemini AI is analyzing today&apos;s wire...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. SUGGESTIONS CHIPS */}
      <div className="px-4 py-2 border-t border-[#20344B] bg-[#0D1B2C] shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-2">
          {DEFAULT_SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(sug)}
              disabled={isLoading}
              className="text-[11px] font-sans whitespace-nowrap px-3 py-1.5 rounded-full bg-[#12243A] hover:bg-[#20344B] text-[#A4B3C7] hover:text-[#F1F5FA] border border-[#20344B] transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* 4. INPUT COMPOSER */}
      <footer className="p-3 sm:p-4 border-t border-[#20344B] bg-[#12243A]/80 rounded-b-2xl shrink-0">
        <div className="flex items-center space-x-2 bg-[#0D1B2C] border border-[#20344B] focus-within:border-[#526BFF] rounded-xl px-3 py-2 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask Gemini AI about today's news edition..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-[#F1F5FA] placeholder-[#A4B3C7] outline-none"
            id="input-news-chatbot"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-lg bg-[#526BFF] hover:bg-[#3B54E6] text-white disabled:opacity-40 disabled:hover:bg-[#526BFF] transition-all cursor-pointer shadow-sm shrink-0"
            id="btn-send-news-chat"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mt-1.5 px-1 text-[10px] font-sans text-[#A4B3C7] flex justify-between">
          <span>Grounded in verified RSS dispatches • Gemini 1.5 Flash</span>
          <span>Press Enter ↵ to send</span>
        </div>
      </footer>
    </div>
  );
}
