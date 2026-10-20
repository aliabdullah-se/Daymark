'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  Check,
  Plus,
  X,
  Sparkles,
  ArrowRight,
  Clock,
  BookOpen,
  Newspaper,
  TrendingUp,
  Cpu,
  Globe,
  Atom,
  HeartPulse,
  Leaf,
  PenTool,
} from 'lucide-react';
import { UserPreferences, NewsTopic, AVAILABLE_TOPICS, DEFAULT_PREFERENCES } from '@/types/news';
import { getStoredPreferences, saveStoredPreferences, getCurrentUser, addLearningSignal } from '@/lib/storage';

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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [readerName, setReaderName] = useState('');
  const [newspaperTitle, setNewspaperTitle] = useState('DAYMARK');
  const [selectedTopics, setSelectedTopics] = useState<NewsTopic[]>(['technology', 'world', 'business', 'science']);
  const [customInterests, setCustomInterests] = useState<string[]>(['Artificial Intelligence', 'Clean Energy']);
  const [interestInput, setInterestInput] = useState('');
  const [readingPace, setReadingPace] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = '/login?redirect=/onboarding';
      return;
    }
    const loaded = getStoredPreferences();
    setPreferences(loaded);
    setReaderName(user?.name || loaded.readerName || 'Reader');
    setNewspaperTitle(user?.paperTitle || loaded.newspaperTitle || 'DAYMARK');
    setSelectedTopics(loaded.selectedTopics.length > 0 ? loaded.selectedTopics : ['technology', 'world', 'business', 'science']);
    setCustomInterests(loaded.customInterests.length > 0 ? loaded.customInterests : ['Artificial Intelligence', 'Clean Energy']);
    setReadingPace(loaded.readingPace || 'standard');
  }, []);

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

  const handleFinish = () => {
    setIsSaving(true);
    const updated: UserPreferences = {
      ...preferences,
      readerName: readerName.trim() || 'Reader',
      newspaperTitle: newspaperTitle.trim().toUpperCase() || 'DAYMARK',
      selectedTopics,
      customInterests,
      readingPace,
      onboarded: true,
    };

    saveStoredPreferences(updated);

    addLearningSignal({
      type: 'calibrate',
      articleTitle: `Editorial Calibration: ${selectedTopics.length} Focus Topics, ${customInterests.length} Lenses`,
      impactDescription: `Pace set to ${readingPace.toUpperCase()} (${readingPace === 'quick' ? '5m' : readingPace === 'standard' ? '15m' : '30m'}). Ready for daily broadsheet.`,
    });

    router.push('/');
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col justify-between text-charcoal-900 font-sans selection:bg-forest-100 selection:text-forest-900">
      {/* Top Hairline */}
      <div className="h-1.5 bg-forest-700 w-full" />

      {/* Header */}
      <header className="border-b border-ivory-300 bg-ivory-50/70">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <Newspaper className="w-5 h-5 text-forest-700 transition-transform group-hover:scale-105" />
            <span className="font-headline text-2xl font-bold tracking-tight text-charcoal-900">
              DAYMARK
            </span>
          </Link>
          <div className="flex items-center space-x-4 text-xs font-sans text-charcoal-600">
            <span>Step {step} of 3</span>
            <div className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-forest-600' : 'bg-ivory-300'}`} />
              <span className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-forest-600' : 'bg-ivory-300'}`} />
              <span className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-forest-600' : 'bg-ivory-300'}`} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex items-center">
        <div className="w-full bg-white border border-ivory-300 rounded shadow-xs p-6 sm:p-10">
          {/* STEP 1: TOPICS SELECTION */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-ivory-200 pb-4">
                <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-forest-700">
                  Step 1 of 3 • Core Editorial Sections
                </span>
                <h1 className="font-headline text-3xl sm:text-4xl font-bold text-charcoal-900 mt-1">
                  Select Your Editorial Desks
                </h1>
                <p className="font-serif italic text-xs sm:text-sm text-charcoal-600 mt-1">
                  Choose the sections that form the backbone of your morning broadsheet.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {AVAILABLE_TOPICS.map((topic) => {
                  const isSelected = selectedTopics.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => toggleTopic(topic.id)}
                      className={`p-4 rounded border text-left transition-all cursor-pointer flex items-start justify-between ${
                        isSelected
                          ? 'border-forest-600 bg-forest-50/60 ring-1 ring-forest-600/30'
                          : 'border-ivory-300 bg-ivory-50/50 hover:border-charcoal-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-sans font-bold ${isSelected ? 'text-forest-900' : 'text-charcoal-900'}`}>
                            {topic.label}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-600 font-serif mt-1 leading-snug">
                          {topic.description}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-3 transition-colors ${
                          isSelected ? 'bg-forest-600 text-white' : 'border border-ivory-300 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-ivory-200">
                <span className="text-xs font-sans text-charcoal-500">
                  {selectedTopics.length} sections selected (minimum 1 required)
                </span>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-forest-700 hover:bg-forest-800 text-white font-sans text-xs font-semibold rounded tracking-wide transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
                >
                  <span>Continue to Custom Lenses</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CUSTOM KEYWORDS */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-ivory-200 pb-4">
                <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-forest-700">
                  Step 2 of 3 • Precision Ranking
                </span>
                <h1 className="font-headline text-3xl sm:text-4xl font-bold text-charcoal-900 mt-1">
                  Tailor Your Intellectual Lenses
                </h1>
                <p className="font-serif italic text-xs sm:text-sm text-charcoal-600 mt-1">
                  Articles matching these terms will be prioritized on your front page with up to +35 match score points.
                </p>
              </div>

              {/* Input row */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomInterest(interestInput);
                    }
                  }}
                  placeholder="e.g. Clean Energy, Large Language Models, Solid-State Batteries..."
                  className="flex-1 px-4 py-2.5 text-sm bg-ivory-50 border border-ivory-300 rounded text-charcoal-900 focus:outline-hidden focus:border-forest-600 focus:ring-1 focus:ring-forest-600 font-sans"
                />
                <button
                  type="button"
                  onClick={() => addCustomInterest(interestInput)}
                  className="px-4 py-2.5 bg-charcoal-900 hover:bg-black text-ivory-50 font-sans text-xs font-medium rounded flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Lens</span>
                </button>
              </div>

              {/* Active Lenses */}
              <div>
                <label className="block text-xs font-sans font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                  Active Prioritized Terms ({customInterests.length})
                </label>
                <div className="flex flex-wrap gap-2 min-h-[44px] p-3 bg-ivory-50/70 border border-ivory-200 rounded">
                  {customInterests.length === 0 ? (
                    <span className="text-xs font-serif italic text-charcoal-400">
                      No custom lenses added yet. Click suggestions below or type your own.
                    </span>
                  ) : (
                    customInterests.map((interest) => (
                      <span
                        key={interest}
                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-forest-100/70 text-forest-900 text-xs font-serif border border-forest-200"
                      >
                        <span>{interest.replace(/^#+/, '')}</span>
                        <button
                          type="button"
                          onClick={() => removeCustomInterest(interest)}
                          className="text-forest-700 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <label className="block text-xs font-sans font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
                  1-Click Suggestions
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_SUGGESTIONS.map((sug) => {
                    const isAdded = customInterests.some((i) => i.toLowerCase() === sug.toLowerCase());
                    return (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => addCustomInterest(sug)}
                        disabled={isAdded}
                        className={`text-xs px-2.5 py-1 rounded border transition-all ${
                          isAdded
                            ? 'bg-ivory-200/50 text-charcoal-400 border-ivory-200 cursor-default'
                            : 'bg-white hover:bg-forest-50 text-charcoal-700 hover:text-forest-800 border-ivory-300 cursor-pointer'
                        }`}
                      >
                        +{sug}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-sans font-medium text-charcoal-600 hover:text-charcoal-900"
                >
                  ← Back to Topics
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-forest-700 hover:bg-forest-800 text-white font-sans text-xs font-semibold rounded tracking-wide transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
                >
                  <span>Continue to Reading Pace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: READING PACE & MASTHEAD */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-ivory-200 pb-4">
                <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-forest-700">
                  Step 3 of 3 • Publication Details
                </span>
                <h1 className="font-headline text-3xl sm:text-4xl font-bold text-charcoal-900 mt-1">
                  Set Your Daily Reading Pace
                </h1>
                <p className="font-serif italic text-xs sm:text-sm text-charcoal-600 mt-1">
                  Tune article depth and length according to your morning routine.
                </p>
              </div>

              {/* Reading Pace Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'quick' as const,
                    title: 'Quick Scan',
                    time: '~5 Minutes',
                    desc: 'Tight executive summaries and breaking reports.',
                  },
                  {
                    id: 'standard' as const,
                    title: 'Standard Edition',
                    time: '~15 Minutes',
                    desc: 'Balanced broadsheet with cover story and reports.',
                  },
                  {
                    id: 'deep' as const,
                    title: 'Deep Immersion',
                    time: '~30 Minutes',
                    desc: 'In-depth essays, investigative reports, and analysis.',
                  },
                ].map((pace) => {
                  const isSelected = readingPace === pace.id;
                  return (
                    <button
                      key={pace.id}
                      type="button"
                      onClick={() => setReadingPace(pace.id)}
                      className={`p-4 rounded border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-forest-600 bg-forest-50/70 ring-1 ring-forest-600/30'
                          : 'border-ivory-300 bg-ivory-50/50 hover:border-charcoal-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-sans font-bold text-sm text-charcoal-900">
                          {pace.title}
                        </span>
                        <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-forest-600' : 'text-charcoal-400'}`} />
                      </div>
                      <span className="text-xs font-serif italic text-forest-700 block mb-1">
                        {pace.time}
                      </span>
                      <p className="text-xs text-charcoal-600 font-serif leading-snug">
                        {pace.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Name & Title Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-sans font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                    Subscriber Name
                  </label>
                  <input
                    type="text"
                    value={readerName}
                    onChange={(e) => setReaderName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full px-3 py-2 text-sm bg-ivory-50 border border-ivory-300 rounded text-charcoal-900 font-sans focus:outline-hidden focus:border-forest-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                    Newspaper Masthead Title
                  </label>
                  <input
                    type="text"
                    value={newspaperTitle}
                    onChange={(e) => setNewspaperTitle(e.target.value)}
                    placeholder="e.g. DAYMARK"
                    className="w-full px-3 py-2 text-sm bg-ivory-50 border border-ivory-300 rounded text-charcoal-900 font-sans uppercase font-bold tracking-wider focus:outline-hidden focus:border-forest-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-ivory-200">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-sans font-medium text-charcoal-600 hover:text-charcoal-900"
                >
                  ← Back to Lenses
                </button>
                <button
                  id="btn-onboarding-finish"
                  type="button"
                  onClick={handleFinish}
                  disabled={isSaving}
                  className="px-8 py-3 bg-charcoal-900 hover:bg-black text-ivory-50 font-sans text-xs font-bold rounded tracking-wide transition-all shadow-xs flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSaving ? 'Compiling Paper...' : 'Generate My Morning Edition →'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-4 bg-[var(--bg-surface)] text-center text-xs font-serif text-[var(--text-muted)]">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center items-center gap-4 text-xs">
          <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">
            Page Directory
          </Link>
          <span>•</span>
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
            Today&apos;s Broadsheet
          </Link>
          <span>•</span>
          <Link href="/archive" className="hover:text-[var(--text-primary)] transition-colors">
            Archive
          </Link>
          <span>•</span>
          <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">
            About Us
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">
            Privacy Policy
          </Link>
        </div>
        <p className="mt-2 text-[11px] text-[var(--text-muted)]">
          DAYMARK — Your world, clearly delivered. • Verified News Wire
        </p>
      </footer>
    </div>
  );
}
