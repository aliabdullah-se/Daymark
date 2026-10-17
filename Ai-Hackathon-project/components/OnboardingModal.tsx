'use client';

import React, { useState } from 'react';
import { X, Check, Plus, Sparkles, BookOpen, Clock, Tag } from 'lucide-react';
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
  'Renewable Energy',
  'Quantum Computing',
  'Global Geopolitics',
  'Microchips & Hardware',
  'Biotechnology',
  'Electric Vehicles',
  'Venture Capital',
  'Cybersecurity',
  'Climate Action',
  'Macroeconomics',
];

export default function OnboardingModal({
  isOpen,
  onClose,
  preferences,
  onSave,
  isFirstVisit = false,
}: OnboardingModalProps) {
  const [readerName, setReaderName] = useState(preferences.readerName || '');
  const [newspaperTitle, setNewspaperTitle] = useState(preferences.newspaperTitle || 'THE MORNING CHRONICLE');
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
      readerName: readerName.trim() || 'Morning Reader',
      newspaperTitle: newspaperTitle.trim() || 'THE MORNING CHRONICLE',
      selectedTopics,
      customInterests,
      readingPace,
      onboarded: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-paper-50 border-2 border-ink-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 md:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-paper-300">
          <div>
            <div className="flex items-center space-x-2 text-editorial-crimson font-serif font-bold text-xs uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isFirstVisit ? 'Welcome to NaSCon’26 Morning Paper' : 'Personalize Your Broadsheet'}</span>
            </div>
            <h2 id="onboarding-title" className="text-2xl md:text-3xl font-headline font-bold text-ink-900 mt-1">
              Curate Your Morning Edition
            </h2>
            <p className="text-sm font-serif text-ink-600 mt-1">
              Choose your editorial interests and custom topics to shape your personalized daily front page.
            </p>
          </div>
          {!isFirstVisit && (
            <button
              onClick={onClose}
              className="p-1 text-ink-500 hover:text-ink-900 transition-colors"
              aria-label="Close preferences"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-6 py-4">
          {/* Section 1: Masthead Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-ink-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={readerName}
                onChange={(e) => {
                  setReaderName(e.target.value);
                  if (newspaperTitle === 'THE MORNING CHRONICLE' || newspaperTitle.includes('TIMES')) {
                    setNewspaperTitle(`THE ${e.target.value.toUpperCase() || 'MORNING'} CHRONICLE`);
                  }
                }}
                placeholder="e.g. Eleanor Vance"
                className="w-full px-3 py-2 bg-white border border-paper-300 rounded text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-ink-900 font-serif"
              />
            </div>
            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-ink-700 mb-1">
                Newspaper Masthead Name
              </label>
              <input
                type="text"
                value={newspaperTitle}
                onChange={(e) => setNewspaperTitle(e.target.value)}
                placeholder="e.g. THE DAILY DISPATCH"
                className="w-full px-3 py-2 bg-white border border-paper-300 rounded text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-ink-900 font-headline uppercase"
              />
            </div>
          </div>

          {/* Section 2: Core News Topics */}
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-ink-700 mb-2">
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
                    className={`p-2.5 rounded border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'bg-paper-200 border-ink-900 text-ink-900 shadow-sm'
                        : 'bg-white border-paper-200 text-ink-600 hover:border-paper-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-sans font-bold">{topic.label}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-editorial-crimson" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-paper-300" />
                      )}
                    </div>
                    <span className="text-[10px] text-ink-500 line-clamp-1">{topic.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Custom Interests & Keyword Boosters */}
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-ink-700 mb-1">
              Custom Topics & High-Priority Keywords
            </label>
            <p className="text-xs text-ink-500 mb-2">
              Add niche interests. Our ranking engine will search titles and abstracts to boost relevant stories.
            </p>

            {/* Input row */}
            <div className="flex gap-2 mb-2.5">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={handleKeyDownInterest}
                placeholder="e.g. Fusion Energy, Quantum Computing, Startups..."
                className="flex-1 px-3 py-2 bg-white border border-paper-300 rounded text-sm text-ink-900 focus:outline-none focus:ring-1 focus:ring-ink-900 font-serif"
              />
              <button
                type="button"
                onClick={() => addCustomInterest(interestInput)}
                className="px-4 py-2 bg-ink-900 text-white rounded text-xs font-sans font-semibold hover:bg-black transition-colors flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Active custom tags */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-paper-100 rounded border border-paper-200 mb-2">
              {customInterests.length === 0 ? (
                <span className="text-xs text-ink-400 italic">No custom interests added yet. Click suggestions below or type your own.</span>
              ) : (
                customInterests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-ink-800 rounded-full text-xs font-sans font-medium text-ink-900 shadow-2xs"
                  >
                    <span>{interest}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomInterest(interest)}
                      className="text-ink-400 hover:text-editorial-crimson ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-sans text-ink-500 mr-1 flex items-center">
                <Tag className="w-3 h-3 mr-1" /> Suggestions:
              </span>
              {INTEREST_SUGGESTIONS.filter((s) => !customInterests.includes(s)).slice(0, 6).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addCustomInterest(s)}
                  className="text-[11px] font-sans px-2 py-0.5 bg-paper-200 hover:bg-paper-300 text-ink-700 rounded transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Reading Pace */}
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-ink-700 mb-2">
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
                    className={`p-3 rounded border text-left transition-all ${
                      isSelected
                        ? 'bg-paper-200 border-ink-900 text-ink-900 shadow-sm'
                        : 'bg-white border-paper-200 text-ink-600 hover:border-paper-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-sans font-bold">{pace.label}</span>
                      <span className="text-[10px] font-mono text-editorial-amber">{pace.time}</span>
                    </div>
                    <p className="text-[11px] text-ink-500 font-serif leading-tight">{pace.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-paper-300 flex items-center justify-between">
          <span className="text-xs font-serif text-ink-500 italic">
            Ranked deterministically • Preferences saved to your device
          </span>
          <div className="flex items-center space-x-3">
            {!isFirstVisit && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-sans font-medium text-ink-600 hover:text-ink-900"
              >
                Cancel
              </button>
            )}
            <button
              id="btn-save-preferences-confirm"
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-ink-900 hover:bg-black text-white rounded text-sm font-sans font-bold tracking-wide shadow transition-colors flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isFirstVisit ? 'Generate My Morning Edition' : 'Update & Re-Rank Newspaper'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
