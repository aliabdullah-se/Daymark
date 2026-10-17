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
        const errText = await res.text();
        setTestStatus('error');
        setTestMessage(`Verification failed: Status ${res.status}. Check key permissions.`);
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(`Network error during test: ${e?.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-ivory-100 border border-ivory-300 rounded-lg shadow-2xl max-w-lg w-full p-6 sm:p-7 relative font-sans">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-ivory-300">
          <div>
            <div className="flex items-center space-x-1.5 text-forest-700 font-sans font-bold text-[11px] uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free AI Intelligence</span>
            </div>
            <h3 className="font-headline text-2xl font-bold text-charcoal-900 mt-1">
              Google Gemini API Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-charcoal-400 hover:text-charcoal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explanatory Box */}
        <div className="my-4 p-3.5 bg-forest-50 border border-forest-200 rounded text-xs text-charcoal-700 space-y-1.5">
          <div className="flex items-center space-x-1 font-bold text-forest-800">
            <ShieldCheck className="w-4 h-4 text-forest-600" />
            <span>100% Free Tier Supported (PKR 0 Budget)</span>
          </div>
          <p className="font-serif leading-relaxed">
            Google provides a free Gemini API tier with zero credit card requirements. When enabled, Gemini powers AI-generated morning executive takeaways and editorial explanations.
          </p>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-forest-700 hover:text-forest-900 font-semibold underline text-[11px] pt-1"
          >
            <span>Get your free Gemini Key from Google AI Studio (1-Click)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Input */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 text-sm bg-white border border-ivory-300 rounded text-charcoal-900 font-mono focus:outline-hidden focus:border-forest-600"
              />
              {apiKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2.5 top-2 text-xs text-charcoal-400 hover:text-red-700"
                  title="Clear key"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Test Status Alert */}
          {testStatus !== 'idle' && (
            <div
              className={`p-2.5 rounded text-xs flex items-start space-x-1.5 ${
                testStatus === 'testing'
                  ? 'bg-ivory-200 text-charcoal-800'
                  : testStatus === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {testStatus === 'success' ? (
                <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              ) : testStatus === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-4 h-4 animate-spin text-charcoal-600 shrink-0 mt-0.5" />
              )}
              <span>{testStatus === 'testing' ? 'Verifying with Google AI...' : testMessage}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-5 border-t border-ivory-200 mt-6">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={testStatus === 'testing'}
            className="px-3.5 py-2 bg-ivory-200 hover:bg-ivory-300 text-charcoal-800 rounded text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs text-charcoal-600 hover:text-charcoal-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded text-xs font-semibold transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved!' : 'Save Key'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
