'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, KeyRound, ExternalLink, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { getGeminiApiKey, saveGeminiApiKey } from '@/lib/gemini';

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export default function GeminiKeyModal({ isOpen, onClose, onKeySaved }: GeminiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const existing = getGeminiApiKey();
      setApiKey(existing);
      setIsSaved(false);
      setTestStatus('idle');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveGeminiApiKey(apiKey);
    setIsSaved(true);
    if (onKeySaved) onKeySaved();
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleClear = () => {
    saveGeminiApiKey('');
    setApiKey('');
    setIsSaved(true);
    if (onKeySaved) onKeySaved();
  };

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter an API key first.');
      return;
    }

    setTestStatus('testing');
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with OK.' }] }],
        }),
      });

      if (res.ok) {
        setTestStatus('success');
        setTestMessage('Key verified! Gemini 1.5 Flash is active and ready.');
      } else {
        setTestStatus('error');
        setTestMessage(`Verification failed: Status ${res.status}. Check key permissions.`);
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(`Network error during test: ${e?.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 no-print">
      <div className="bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg shadow-2xl max-w-lg w-full p-6 sm:p-7 relative font-sans transition-colors duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center space-x-1.5 text-[var(--accent-primary)] font-sans font-bold text-[11px] uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free AI Intelligence</span>
            </div>
            <h3 className="font-headline text-2xl font-bold text-[var(--text-primary)] mt-1">
              Google Gemini API Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explanatory Box */}
        <div className="my-4 p-3.5 bg-[var(--accent-subtle)] border border-[var(--accent-border)] rounded text-xs text-[var(--accent-text)] space-y-1.5">
          <div className="flex items-center space-x-1.5 font-bold">
            <ShieldCheck className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>100% Free PKR 0 Tier • Zero-Cost Guaranteed</span>
          </div>
          <p className="font-serif italic leading-relaxed text-[var(--text-secondary)]">
            Daymark uses free-tier <strong>Google Gemini 1.5 Flash</strong> tokens via Google AI Studio. Stored strictly in your browser&apos;s localStorage; never logged or transmitted to any third party.
          </p>
        </div>

        {/* Key Input */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs uppercase font-sans font-bold tracking-wider text-[var(--text-secondary)] mb-1">
              Gemini API Key
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-9 pr-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded text-xs text-[var(--text-primary)] font-mono focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>
          </div>

          {/* Test Status Messages */}
          {testStatus === 'testing' && (
            <p className="text-xs text-[var(--accent-primary)] font-serif italic animate-pulse">
              Verifying credentials with Google Generative Language API...
            </p>
          )}
          {testStatus === 'success' && (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs text-emerald-600 flex items-center space-x-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{testMessage}</span>
            </div>
          )}
          {testStatus === 'error' && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-500 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{testMessage}</span>
            </div>
          )}
        </div>

        {/* Link to get key */}
        <div className="mt-3 text-right">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-xs text-[var(--accent-primary)] hover:underline font-medium"
          >
            <span>Get a free API key from Google AI Studio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors cursor-pointer"
          >
            Clear Stored Key
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={testStatus === 'testing'}
              className="px-3 py-2 border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-subtle)] rounded text-xs font-sans text-[var(--text-secondary)] font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              Test Key
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-[var(--accent-primary)] hover:opacity-90 text-white rounded text-xs font-sans font-bold shadow-xs transition-opacity cursor-pointer flex items-center space-x-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved!' : 'Save & Close'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
