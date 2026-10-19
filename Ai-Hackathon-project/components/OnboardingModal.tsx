'use client';

import React, { useState } from 'react';
import { X, Check, Plus, Sparkles, Tag, Compass } from 'lucide-react';
import { UserPreferences, NewsTopic, AVAILABLE_TOPICS } from '@/types/news';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSave: (newPrefs: UserPreferences) => void;
  isFirstVisit?: boolean;
}

const INTEREST_SUGGESTIONS = [
  'Artificial Intelligence',
  'Space Exploration',
  'Clean Energy',
  'Quantum Computing',
  'Global Geopolitics',
  'Semiconductors & Chips',
  'Biotechnology',
  'Electric Vehicles',
  'Venture Capital',
  'Cybersecurity',
  'Macroeconomics',
  'Neuroscience',
];

export default function OnboardingModal({
  isOpen,
  onClose,
  preferences,
  onSave,
  isFirstVisit = false,
}: OnboardingModalProps) {
  const [readerName, setReaderName] = useState(preferences.readerName || '');
  const [newspaperTitle, setNewspaperTitle] = useState(preferences.newspaperTitle || 'DAYMARK');
  const [selectedTopics, setSelectedTopics] = useState<NewsTopic[]>(preferences.selectedTopics || ['technology', 'world']);
  const [customInterests, setCustomInterests] = useState<string[]>(preferences.customInterests || []);
  const [interestInput, setInterestInput] = useState('');
  const [readingPace, setReadingPace] = useState<'quick' | 'standard' | 'deep'>(preferences.readingPace || 'standard');

  if (!isOpen) return null;

  const toggleTopic = (topic: NewsTopic) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length > 1) {
        setSelectedTopics(selectedTopics.filter((t) => t !== topic));
      }
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const addCustomInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (trimmed && !customInterests.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      setCustomInterests([...customInterests, trimmed]);
      setInterestInput('');
    }
  };

  const removeCustomInterest = (interestToRemove: string) => {
    setCustomInterests(customInterests.filter((i) => i !== interestToRemove));
  };

  const handleKeyDownInterest = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomInterest(interestInput);
    }
  };

  const handleSave = () => {
    onSave({
      ...preferences,
      readerName: readerName.trim() || 'Reader',
      newspaperTitle: newspaperTitle.trim() || 'DAYMARK',
      selectedTopics,
      customInterests,
      readingPace,
      onboarded: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 no-print">
      <div 
        className="bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 transition-colors duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex items-center space-x-1.5 text-[var(--accent-primary)] font-sans font-semibold text-[11px] uppercase tracking-widest">
              <Compass className="w-3.5 h-3.5" />
              <span>{isFirstVisit ? 'Welcome to DAYMARK' : 'Curate Your Morning Broadsheet'}</span>
            </div>
            <h2 id="onboarding-title" className="text-2xl sm:text-3xl font-headline font-bold text-[var(--text-primary)] mt-1">
              Personalize Your Edition
            </h2>
            <p className="text-xs sm:text-sm font-serif italic text-[var(--text-secondary)] mt-1">
              Your world, clearly delivered. Select your focus areas and topics for a tailored daily edition.
            </p>
          </div>
          {!isFirstVisit && (
            <button
              onClick={onClose}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              aria-label="Close preferences"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-6 py-4">
          {/* Section 1: Masthead Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={readerName}
                onChange={(e) => {
                  setReaderName(e.target.value);
                  if (newspaperTitle === 'DAYMARK' || newspaperTitle.includes('DAYMARK')) {
                    setNewspaperTitle(e.target.value.trim() ? `${e.target.value.trim().toUpperCase()} DAYMARK` : 'DAYMARK');
                  }
                }}
                placeholder="e.g. Eleanor Vance"
                className="w-full px-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-primary)] font-serif"
              />
            </div>
            <div>
              <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Publication Masthead Name
              </label>
              <input
                type="text"
                value={newspaperTitle}
                onChange={(e) => setNewspaperTitle(e.target.value)}
                placeholder="e.g. DAYMARK"
                className="w-full px-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-primary)] font-headline uppercase"
              />
            </div>
          </div>

          {/* Section 2: Core News Topics */}
          <div>
            <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Select Editorial Topics (At least 1)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AVAILABLE_TOPICS.map((topic) => {
                const isSelected = selectedTopics.includes(topic.id);
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => toggleTopic(topic.id)}
                    className={`p-3 rounded border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent-subtle)] border-[var(--accent-primary)] text-[var(--text-primary)] shadow-2xs'
                        : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-sans font-bold">{topic.label}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-[var(--border-subtle)]" />
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] line-clamp-1">{topic.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Custom Interests & Keyword Boosters */}
          <div>
            <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Custom Topic Lenses & Priority Keywords
            </label>
            <p className="text-xs text-[var(--text-muted)] mb-2">
              Add niche interests. Our ranking engine elevates stories matching these exact phrases and subjects.
            </p>

            {/* Input row */}
            <div className="flex gap-2 mb-2.5">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={handleKeyDownInterest}
                placeholder="e.g. Clean Energy, SpaceX, Venture Capital..."
                className="flex-1 px-3 py-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded text-sm text-[var(--text-primary)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-primary)] font-serif"
              />
              <button
                type="button"
                onClick={() => addCustomInterest(interestInput)}
                className="px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-page)] rounded text-xs font-sans font-bold hover:opacity-90 transition-opacity flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Active custom tags */}
            <div className="flex flex-wrap gap-1.5 min-h-[34px] p-2 bg-[var(--bg-surface-elevated)] rounded border border-[var(--border-subtle)] mb-2">
              {customInterests.length === 0 ? (
                <span className="text-xs text-[var(--text-muted)] font-serif italic">No custom lenses added yet. Click suggestions below or type your own.</span>
              ) : (
                customInterests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[var(--accent-subtle)] border border-[var(--accent-border)] rounded-full text-xs font-sans font-medium text-[var(--accent-text)] shadow-2xs"
                  >
                    <span>{interest}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomInterest(interest)}
                      className="text-[var(--text-muted)] hover:text-red-500 ml-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-sans text-[var(--text-muted)] mr-1 flex items-center">
                <Tag className="w-3 h-3 mr-1" /> Suggestions:
              </span>
              {INTEREST_SUGGESTIONS.filter((s) => !customInterests.includes(s)).slice(0, 6).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addCustomInterest(s)}
                  className="text-[11px] font-sans px-2.5 py-0.5 bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded transition-colors cursor-pointer"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Reading Pace */}
          <div>
            <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
              Morning Reading Pace
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'quick',
                  label: 'Quick Scan',
                  time: '~5 Minutes',
                  desc: 'Focuses on rapid wire briefs & top bullet points',
                },
                {
                  id: 'standard',
                  label: 'Standard Edition',
                  time: '~15 Minutes',
                  desc: 'A balanced broadsheet with lead stories and analysis',
                },
                {
                  id: 'deep',
                  label: 'Deep Dive',
                  time: '~30 Minutes',
                  desc: 'In-depth reporting, long reads, and commentary',
                },
              ].map((pace) => {
                const isSelected = readingPace === pace.id;
                return (
                  <button
                    key={pace.id}
                    type="button"
                    onClick={() => setReadingPace(pace.id as any)}
                    className={`p-3 rounded border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent-subtle)] border-[var(--accent-primary)] text-[var(--text-primary)] shadow-2xs'
                        : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-sans font-bold">{pace.label}</span>
                      <span className="text-[10px] font-mono text-[var(--accent-primary)] font-semibold">{pace.time}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] font-serif leading-tight">{pace.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <span className="text-xs font-serif text-[var(--text-muted)] italic">
            Deterministic rule-based ranking • Saved locally
          </span>
          <div className="flex items-center space-x-3">
            {!isFirstVisit && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-sans font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              id="btn-save-preferences-confirm"
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-[var(--accent-primary)] hover:opacity-90 text-white rounded text-sm font-sans font-bold tracking-wide shadow-xs transition-opacity flex items-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>{isFirstVisit ? 'Generate My Morning Edition' : 'Update & Re-Rank Daymark'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
