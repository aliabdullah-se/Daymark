'use client';

import React, { useState } from 'react';
import {
  X,
  Sliders,
  Sun,
  Moon,
  Laptop,
  Check,
  RotateCcw,
  Sparkles,
  Type,
  Layout,
  Maximize2,
  Image as ImageIcon,
  Eye,
  SlidersHorizontal,
  Compass,
  Plus,
  Tag,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  ExternalLink,
  EyeOff,
} from 'lucide-react';
import { getGeminiApiKey, saveGeminiApiKey } from '@/lib/gemini';
import { useSettings } from './ThemeProvider';
import {
  ThemeMode,
  AccentColor,
  InterfaceDensity,
  HeadlineFont,
  ReadingWidth,
  ArticleLayout,
  ACCENT_CONFIGS,
} from '@/types/settings';
import { UserPreferences, NewsTopic, AVAILABLE_TOPICS } from '@/types/news';
import { getStoredPreferences, saveStoredPreferences } from '@/lib/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences?: UserPreferences;
  onSavePreferences?: (newPrefs: UserPreferences) => void;
  onOpenOnboarding?: () => void;
  onShowToast?: (msg: string) => void;
  initialTab?: 'appearance' | 'reading' | 'editorial' | 'ai';
  onKeySaved?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  preferences: propPreferences,
  onSavePreferences,
  onOpenOnboarding = () => {},
  onShowToast = () => {},
  initialTab = 'appearance',
  onKeySaved,
}: SettingsModalProps) {
  const { settings, updateSettings, resetSettings, resolvedTheme } = useSettings();
  const preferences = propPreferences || getStoredPreferences();

  const handleSavePref = (newPrefs: UserPreferences) => {
    if (onSavePreferences) {
      onSavePreferences(newPrefs);
    } else {
      saveStoredPreferences(newPrefs);
    }
  };

  const handleToast = (msg: string) => {
    if (onShowToast) onShowToast(msg);
  };

  const [activeTab, setActiveTab] = useState<'appearance' | 'reading' | 'editorial' | 'ai'>(initialTab);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  // Load API key whenever modal opens or mounts
  React.useEffect(() => {
    if (isOpen) {
      setApiKey(getGeminiApiKey());
      setKeySaved(false);
      setTestStatus('idle');
      setTestMessage('');
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, initialTab]);

  // Local state for editorial preferences
  const [readerName, setReaderName] = useState(preferences.readerName || 'Reader');
  const rawInitialTitle = preferences.newspaperTitle || 'DAYMARK';
  const sanitizedInitialTitle =
    rawInitialTitle.toUpperCase().includes('BROADSIDE') ||
    rawInitialTitle.toUpperCase().includes('DISPATCH') ||
    rawInitialTitle.toUpperCase().includes('MORNING CHRONICLE')
      ? 'DAYMARK'
      : rawInitialTitle;
  const [newspaperTitle, setNewspaperTitle] = useState(sanitizedInitialTitle);
  const [selectedTopics, setSelectedTopics] = useState<NewsTopic[]>(preferences.selectedTopics || ['technology', 'world']);
  const [customInterests, setCustomInterests] = useState<string[]>(preferences.customInterests || []);
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [readingPace, setReadingPace] = useState<'quick' | 'standard' | 'deep'>(preferences.readingPace || 'standard');

  if (!isOpen) return null;

  const handleSaveEditorial = () => {
    handleSavePref({
      ...preferences,
      readerName: readerName.trim() || 'Reader',
      newspaperTitle: newspaperTitle.trim() || 'DAYMARK',
      selectedTopics,
      customInterests,
      readingPace,
    });
    handleToast('Editorial preferences updated and broadsheet re-ranked');
  };

  const toggleTopic = (topic: NewsTopic) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length > 1) {
        const next = selectedTopics.filter((t) => t !== topic);
        setSelectedTopics(next);
        handleSavePref({ ...preferences, selectedTopics: next });
      }
    } else {
      const next = [...selectedTopics, topic];
      setSelectedTopics(next);
      handleSavePref({ ...preferences, selectedTopics: next });
    }
  };

  const addKeyword = () => {
    const trimmed = newKeywordInput.trim();
    if (trimmed && !customInterests.some((k) => k.toLowerCase() === trimmed.toLowerCase())) {
      const next = [...customInterests, trimmed];
      setCustomInterests(next);
      setNewKeywordInput('');
      handleSavePref({ ...preferences, customInterests: next });
    }
  };

  const removeKeyword = (kw: string) => {
    const next = customInterests.filter((k) => k !== kw);
    setCustomInterests(next);
    handleSavePref({ ...preferences, customInterests: next });
  };

  const handleSaveApiKey = () => {
    saveGeminiApiKey(apiKey);
    setKeySaved(true);
    handleToast(apiKey.trim() ? 'Google Gemini API key saved!' : 'Google Gemini API key removed');
    if (onKeySaved) onKeySaved();
    setTimeout(() => setKeySaved(false), 2500);
  };

  const handleClearApiKey = () => {
    saveGeminiApiKey('');
    setApiKey('');
    setKeySaved(true);
    setTestStatus('idle');
    setTestMessage('');
    handleToast('Google Gemini API key removed');
    if (onKeySaved) onKeySaved();
    setTimeout(() => setKeySaved(false), 2500);
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter an API key first.');
      return;
    }

    setTestStatus('testing');
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Respond with OK.' }] }],
          }),
        }
      );

      if (res.ok) {
        setTestStatus('success');
        setTestMessage('Key verified! Google Gemini 1.5 Flash is active and responding.');
        saveGeminiApiKey(apiKey);
        setKeySaved(true);
        if (onKeySaved) onKeySaved();
      } else {
        setTestStatus('error');
        setTestMessage(`Verification failed: HTTP ${res.status}. Check key permissions at Google AI Studio.`);
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(`Network connection error: ${e?.message || 'Could not reach Google Gemini API'}`);
    }
  };

  const handleResetAppearance = () => {
    resetSettings();
    setShowResetConfirm(false);
    onShowToast('Appearance settings restored to defaults');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
    >
      <div className="bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-[var(--accent-subtle)] text-[var(--accent-primary)]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 id="settings-dialog-title" className="font-headline text-lg sm:text-xl font-bold tracking-tight">
                Broadsheet Customization & Settings
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-sans">
                Tailor theme, typography, reading density, and editorial focus
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--border-subtle)] px-5 bg-[var(--bg-surface)] text-xs font-sans font-medium">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'appearance'
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] font-bold'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Theme & Colors</span>
          </button>

          <button
            onClick={() => setActiveTab('reading')}
            className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'reading'
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] font-bold'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Reading & Layout</span>
          </button>

          <button
            onClick={() => setActiveTab('editorial')}
            className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'editorial'
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] font-bold'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Editorial Lenses</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-3 border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'ai'
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] font-bold'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            id="tab-settings-ai"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>AI Intelligence</span>
            {apiKey.trim() ? (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                Active
              </span>
            ) : (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                Key
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm">
          {/* TAB 1: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <label className="block text-xs uppercase font-sans font-bold tracking-wider text-[var(--text-muted)] mb-2.5">
                  Color Mode
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(
                    [
                      { id: 'light', label: 'Ivory Broadsheet', icon: Sun, desc: 'Warm paper texture (#F7F5EF)' },
                      { id: 'dark', label: 'Midnight Editorial', icon: Moon, desc: 'Deep ink charcoal (#171A19)' },
                      { id: 'system', label: 'Follow System', icon: Laptop, desc: 'Syncs with device mode' },
                    ] as const
                  ).map((m) => {
                    const isSelected = settings.theme === m.id;
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          updateSettings({ theme: m.id });
                          onShowToast(`Theme switched to ${m.label}`);
                        }}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)] text-[var(--text-primary)] ring-1 ring-[var(--accent-primary)]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-primary)]" />}
                        </div>
                        <span className="font-sans font-bold text-xs block mb-0.5">{m.label}</span>
                        <span className="text-[10px] text-[var(--text-muted)] font-serif italic">{m.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Palette */}
              <div>
                <label className="block text-xs uppercase font-sans font-bold tracking-wider text-[var(--text-muted)] mb-2.5">
                  Accent Color
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(
                    [
                      { id: 'sage', label: 'Sage Forest', light: '#496653', dark: '#8EAE91' },
                      { id: 'blue', label: 'Oxford Blue', light: '#2B5B84', dark: '#7BA5C4' },
                      { id: 'amber', label: 'Vintage Amber', light: '#9E6B1F', dark: '#D8A856' },
                      { id: 'violet', label: 'Editorial Plum', light: '#6B4785', dark: '#B598CC' },
                    ] as const
                  ).map((acc) => {
                    const isSelected = settings.accent === acc.id;
                    const previewColor = resolvedTheme === 'dark' ? acc.dark : acc.light;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          updateSettings({ accent: acc.id });
                          onShowToast(`Accent changed to ${acc.label}`);
                        }}
                        className={`p-3 rounded-lg border flex items-center space-x-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-primary)]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-subtle)]'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: previewColor }}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </span>
                        <span className="text-xs font-sans font-medium">{acc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interface Density */}
              <div>
                <label className="block text-xs uppercase font-sans font-bold tracking-wider text-[var(--text-muted)] mb-2.5">
                  Interface Density
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(
                    [
                      { id: 'compact', label: 'Compact', desc: 'Dense broadsheet wire spacing' },
                      { id: 'comfortable', label: 'Comfortable', desc: 'Standard editorial rhythm' },
                      { id: 'spacious', label: 'Spacious', desc: 'Generous whitespace & margins' },
                    ] as const
                  ).map((den) => {
                    const isSelected = settings.density === den.id;
                    return (
                      <button
                        key={den.id}
                        type="button"
                        onClick={() => {
                          updateSettings({ density: den.id });
                          onShowToast(`Density set to ${den.label}`);
                        }}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-primary)]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-subtle)]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-sans font-bold text-xs">{den.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-primary)]" />}
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] font-serif italic block">
                          {den.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reduced Motion Toggle */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-xs font-sans font-bold block">Reduced Motion</span>
                  <span className="text-xs text-[var(--text-muted)] font-serif italic">
                    Minimizes transitions and micro-animations for accessibility
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !settings.reducedMotion;
                    updateSettings({ reducedMotion: nextVal });
                    onShowToast(nextVal ? 'Reduced motion enabled' : 'Smooth animations restored');
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.reducedMotion ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border-subtle)]'
                  }`}
                  role="switch"
                  aria-checked={settings.reducedMotion}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: READING & LAYOUT */}
          {activeTab === 'reading' && (
            <div className="space-y-6">
              {/* Headline Typography */}
              <div>
                <label className="block text-xs uppercase font-sans font-bold tracking-wider text-[var(--text-muted)] mb-2.5">
                  Headline Typography
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {(
                    [
                      { id: 'serif', label: 'Editorial Serif', fontClass: 'font-headline-serif', sample: 'Newsreader' },
                      { id: 'classic', label: 'Classic Broadsheet', fontClass: 'font-headline-classic', sample: 'Playfair Display' },
                      { id: 'sans', label: 'Modern Sans', fontClass: 'font-headline-sans', sample: 'Inter Display' },
                    ] as const
                  ).map((hf) => {
                    const isSelected = settings.headlineFont === hf.id;
                    return (
                      <button
                        key={hf.id}
                        type="button"
                        onClick={() => {
                          updateSettings({ headlineFont: hf.id });
                          onShowToast(`Headline font: ${hf.label}`);
                        }}
                        className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-primary)]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-subtle)]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-sans font-semibold text-[var(--text-muted)]">{hf.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-primary)]" />}
                        </div>
                        <span className={`text-xl block font-bold ${hf.fontClass}`}>
                          {hf.sample}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Body Text Size Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase font-sans font-bold tracking-wider text-[var(--text-muted)]">
                    Article Body Text Size
                  </label>
                  <span className="font-mono text-xs font-bold text-[var(--accent-primary)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded">
                    {settings.bodyFontSize}px
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-sans text-[var(--text-muted)]">A</span>
                  <input
                    type="range"
                    min={14}
                    max={22}
                    step={1}
                    value={settings.bodyFontSize}
                    onChange={(e) => updateSettings({ bodyFontSize: parseInt(e.target.value, 10) })}
                    className="flex-1 accent-[var(--accent-primary)] cursor-pointer"
                  />
                  <span className="text-base font-sans font-bold text-[var(--text-primary)]">A</span>
                </div>
                <div className="p-3 mt-2 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-serif italic text-xs leading-relaxed">
                  Preview: &ldquo;Autonomous distributed energy networks and next-generation storage systems achieved commercial parity across industrial grids this quarter.&rdquo;
                </div>
              </div>

              {/* Reading Width */}
              <div>
                <label className="block text-xs uppercase font-sans font-bold tracking-wider text-[var(--text-muted)] mb-2.5">
                  Reading Canvas Width
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(
                    [
                      { id: 'narrow', label: 'Narrow', desc: 'Focus / single column (max 960px)' },
                      { id: 'standard', label: 'Standard', desc: 'Broadsheet classic (max 1152px)' },
                      { id: 'wide', label: 'Wide', desc: 'Panoramic layout (max 1280px)' },
                    ] as const
                  ).map((w) => {
                    const isSelected = settings.readingWidth === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => updateSettings({ readingWidth: w.id })}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-primary)]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-subtle)]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-sans font-bold text-xs">{w.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-primary)]" />}
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] font-serif italic block">
                          {w.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Article Layout Columns */}
              <div>
                <label className="block text-xs uppercase font-sans font-bold tracking-wider text-[var(--text-muted)] mb-2.5">
                  Front Page Column Layout
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(
                    [
                      { id: 'single', label: 'Single Column', desc: 'Narrative stream reading' },
                      { id: 'two', label: 'Two Columns', desc: 'Classic newspaper split' },
                      { id: 'three', label: 'Three Columns', desc: 'Broadsheet multi-column' },
                    ] as const
                  ).map((col) => {
                    const isSelected = settings.articleLayout === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => updateSettings({ articleLayout: col.id })}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-primary)]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-subtle)]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-sans font-bold text-xs">{col.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-primary)]" />}
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] font-serif italic block">
                          {col.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[var(--text-muted)] font-serif italic mt-1.5">
                  *On mobile and tablets, multi-column automatically collapses to a single readable column.
                </p>
              </div>

              {/* Show/Hide Thumbnails */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-xs font-sans font-bold block">Story Thumbnails</span>
                  <span className="text-xs text-[var(--text-muted)] font-serif italic">
                    Display editorial photojournalism and reportage graphics
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !settings.showImages;
                    updateSettings({ showImages: nextVal });
                    onShowToast(nextVal ? 'Thumbnails enabled' : 'Text-only minimal mode enabled');
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.showImages ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border-subtle)]'
                  }`}
                  role="switch"
                  aria-checked={settings.showImages}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.showImages ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: EDITORIAL LENSES & PERSONALIZATION */}
          {activeTab === 'editorial' && (
            <div className="space-y-6">
              {/* Reader Identity & Newspaper Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-sans font-bold tracking-wider text-[var(--text-muted)] mb-1">
                    Subscriber Greeting Name
                  </label>
                  <input
                    type="text"
                    value={readerName}
                    onChange={(e) => setReaderName(e.target.value)}
                    onBlur={handleSaveEditorial}
                    placeholder="e.g. Judge Vance"
                    className="w-full px-3 py-2 text-xs font-sans bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded text-[var(--text-primary)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-sans font-bold tracking-wider text-[var(--text-muted)] mb-1">
                    Custom Broadsheet Masthead Title
                  </label>
                  <input
                    type="text"
                    value={newspaperTitle}
                    onChange={(e) => setNewspaperTitle(e.target.value)}
                    onBlur={handleSaveEditorial}
                    placeholder="e.g. DAYMARK"
                    className="w-full px-3 py-2 text-xs font-headline font-bold uppercase bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded text-[var(--text-primary)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-primary)]"
                  />
                </div>
              </div>

              {/* Reading Pace */}
              <div>
                <label className="block text-xs uppercase font-sans font-bold tracking-wider text-[var(--text-muted)] mb-2">
                  Morning Reading Pace
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(
                    [
                      { id: 'quick', label: 'Quick 5m', desc: 'Brevity & fast executive summaries' },
                      { id: 'standard', label: 'Standard 15m', desc: 'Balanced morning broadsheet' },
                      { id: 'deep', label: 'Deep 30m', desc: 'Long-form investigations & analysis' },
                    ] as const
                  ).map((p) => {
                    const isSelected = readingPace === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setReadingPace(p.id);
                          handleSavePref({ ...preferences, readingPace: p.id });
                          handleToast(`Reading pace set to ${p.label}`);
                        }}
                        className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)] ring-1 ring-[var(--accent-primary)]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-subtle)]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-sans font-bold text-xs">{p.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-primary)]" />}
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] font-serif italic block">
                          {p.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Core Editorial Desks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase font-sans font-bold tracking-wider text-[var(--text-muted)]">
                    Primary Editorial Desks ({selectedTopics.length} active)
                  </label>
                  <span className="text-[10px] text-[var(--text-muted)] font-serif italic">
                    Select at least 1 desk
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AVAILABLE_TOPICS.map((topic) => {
                    const isSelected = selectedTopics.includes(topic.id);
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => toggleTopic(topic.id)}
                        className={`p-2.5 rounded border text-left text-xs font-sans transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-bold'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <span className="truncate">{topic.label.split(' ')[0]}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1 text-[var(--accent-primary)]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Keyword Lenses */}
              <div>
                <label className="block text-xs uppercase font-sans font-bold tracking-wider text-[var(--text-muted)] mb-1.5">
                  Intellectual Keywords & Specialist Interests
                </label>
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={newKeywordInput}
                    onChange={(e) => setNewKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                    placeholder="Add lens (e.g. Quantum Computing, Clean Energy)..."
                    className="flex-1 px-3 py-1.5 text-xs font-sans bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded text-[var(--text-primary)] focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-primary)]"
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-3 py-1.5 bg-[var(--accent-primary)] text-white hover:opacity-90 rounded text-xs font-sans font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {customInterests.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-serif italic bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)]"
                    >
                      <span>{kw.replace(/^#+/, '')}</span>
                      <button
                        type="button"
                        onClick={() => removeKeyword(kw)}
                        className="text-[var(--text-muted)] hover:text-red-500 transition-colors ml-0.5 cursor-pointer"
                        title={`Remove ${kw}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {customInterests.length === 0 && (
                    <span className="text-xs text-[var(--text-muted)] font-serif italic">
                      No custom keyword lenses calibrated.
                    </span>
                  )}
                </div>
              </div>

              {/* Full Onboarding Calibration Button */}
              <div className="p-3 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded flex items-center justify-between">
                <div>
                  <span className="text-xs font-sans font-bold block">Editorial Calibration Desk</span>
                  <span className="text-xs text-[var(--text-muted)] font-serif italic">
                    Re-launch the 3-step broadsheet setup wizard
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenOnboarding();
                  }}
                  className="px-3 py-1.5 border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-subtle)] rounded text-xs font-sans font-semibold transition-colors cursor-pointer"
                >
                  Launch Wizard
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: AI INTELLIGENCE */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="p-4 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-md bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent-primary)] shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-headline text-base font-bold text-[var(--text-primary)] leading-tight">
                        Google Gemini 1.5 Flash
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] font-sans">
                        Powers 30-second morning briefings, key takeaways, and interest discovery
                      </p>
                    </div>
                  </div>
                  {apiKey.trim() ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-sans font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" />
                      <span>Key Configured &amp; Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-sans font-medium bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                      <span>Using Local Algorithmic Engine</span>
                    </span>
                  )}
                </div>

                {/* Free Key Tutorial Banner */}
                <div className="my-3 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md text-xs font-sans text-[var(--text-secondary)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      <span>100% Free Google AI Studio API Key</span>
                    </div>
                    <p className="text-[var(--text-muted)]">
                      Zero credit card required. Free tier includes up to 15 requests per minute.
                    </p>
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[var(--accent-subtle)] hover:opacity-90 text-[var(--accent-text)] border border-[var(--accent-border)] text-xs font-semibold whitespace-nowrap cursor-pointer transition-opacity"
                  >
                    <span>Get Free Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* API Key Input */}
                <div className="space-y-2 mt-4">
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Enter Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-3 py-2 pr-10 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2.5 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      title={showApiKey ? 'Hide key' : 'Show key'}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Verification Feedback Banner */}
                {testStatus !== 'idle' && (
                  <div
                    className={`mt-3 p-3 rounded text-xs font-sans flex items-start space-x-2 animate-in fade-in ${
                      testStatus === 'success'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : testStatus === 'error'
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30'
                        : 'bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent-border)]'
                    }`}
                  >
                    {testStatus === 'testing' ? (
                      <Sparkles className="w-4 h-4 shrink-0 animate-spin mt-0.5 text-[var(--accent-primary)]" />
                    ) : testStatus === 'success' ? (
                      <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    )}
                    <span>
                      {testStatus === 'testing'
                        ? 'Connecting to Google Gemini API & verifying key...'
                        : testMessage}
                    </span>
                  </div>
                )}

                {/* Key Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 mt-4 pt-3 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleSaveApiKey}
                      className="px-4 py-1.5 bg-[var(--accent-primary)] text-white hover:opacity-90 rounded text-xs font-sans font-bold shadow-2xs transition-opacity cursor-pointer flex items-center space-x-1.5"
                    >
                      {keySaved ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>{keySaved ? 'Saved!' : 'Save Key'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleTestApiKey}
                      disabled={testStatus === 'testing' || !apiKey.trim()}
                      className="px-3.5 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded text-xs font-sans font-medium transition-colors cursor-pointer disabled:opacity-40"
                    >
                      {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                    </button>
                  </div>
                  {apiKey.trim() && (
                    <button
                      type="button"
                      onClick={handleClearApiKey}
                      className="text-xs font-sans text-red-500 hover:text-red-600 hover:underline cursor-pointer"
                    >
                      Clear / Remove Key
                    </button>
                  )}
                </div>

                {/* Sovereign Data Guarantee */}
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center space-x-2 text-[11px] font-sans text-[var(--text-muted)]">
                  <ShieldCheck className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                  <span>
                    Client-Side Sovereignty: Your key is stored exclusively in your browser&apos;s localStorage and is never transmitted or saved to our servers.
                  </span>
                </div>
              </div>

              {/* What Gemini Powers */}
              <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg space-y-3">
                <h4 className="text-xs uppercase font-sans font-bold tracking-wider text-[var(--text-muted)]">
                  What Google Gemini Powers in Daymark
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sans text-[var(--text-secondary)]">
                  <div className="p-2.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
                    <span className="font-bold text-[var(--text-primary)] block">Executive Intelligence</span>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Synthesizes a 30-second morning briefing with 3 actionable takeaways from top reports.
                    </p>
                  </div>
                  <div className="p-2.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
                    <span className="font-bold text-[var(--text-primary)] block">Adaptive AI Lenses</span>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Infers topic interests from your reading behavior and recommends emerging focus areas.
                    </p>
                  </div>
                  <div className="p-2.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
                    <span className="font-bold text-[var(--text-primary)] block">Zero-Latency Fallback</span>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      If offline or without a key, algorithmic broadsheet ranking operates with zero delay.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] flex flex-wrap items-center justify-between gap-3">
          {/* Reset Appearance Confirmation */}
          {showResetConfirm ? (
            <div className="flex items-center space-x-2 animate-in fade-in">
              <span className="text-xs text-red-600 font-sans font-medium flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                Reset appearance to defaults?
              </span>
              <button
                type="button"
                onClick={handleResetAppearance}
                className="px-2.5 py-1 bg-red-600 text-white rounded text-xs font-sans font-bold hover:bg-red-700 cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-2 py-1 text-xs font-sans text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-xs font-sans text-[var(--text-muted)] hover:text-red-600 flex items-center space-x-1 transition-colors cursor-pointer"
              title="Restores theme, density, and layout defaults without deleting saved articles or feedback"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Appearance</span>
            </button>
          )}

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[var(--accent-primary)] text-white hover:opacity-90 rounded text-xs font-sans font-bold shadow-xs transition-opacity cursor-pointer flex items-center space-x-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done & Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
