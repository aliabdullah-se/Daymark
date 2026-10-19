'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AppearanceSettings,
  DEFAULT_APPEARANCE_SETTINGS,
  ThemeMode,
  AccentColor,
  InterfaceDensity,
  HeadlineFont,
  ReadingWidth,
  ArticleLayout,
} from '@/types/settings';
import {
  getStoredAppearanceSettings,
  saveStoredAppearanceSettings,
  resetStoredAppearanceSettings,
} from '@/lib/storage';

interface ThemeContextType {
  settings: AppearanceSettings;
  resolvedTheme: 'light' | 'dark';
  updateSettings: (partial: Partial<AppearanceSettings>) => void;
  resetSettings: () => void;
  toggleTheme: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  settings: DEFAULT_APPEARANCE_SETTINGS,
  resolvedTheme: 'light',
  updateSettings: () => {},
  resetSettings: () => {},
  toggleTheme: () => {},
  isSettingsOpen: false,
  setIsSettingsOpen: () => {},
  openSettings: () => {},
  closeSettings: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppearanceSettings>(DEFAULT_APPEARANCE_SETTINGS);
  const [systemIsDark, setSystemIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Read stored settings on client mount
  useEffect(() => {
    setIsMounted(true);
    const loaded = getStoredAppearanceSettings();
    setSettings(loaded);

    // Initial system dark preference
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemIsDark(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setSystemIsDark(e.matches);
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, []);

  // Listen to cross-window storage events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'daymark_appearance_settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSettings((prev) => ({ ...prev, ...parsed }));
        } catch {
          // ignore parsing error
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Calculate resolved theme
  const resolvedTheme: 'light' | 'dark' =
    settings.theme === 'system'
      ? systemIsDark
        ? 'dark'
        : 'light'
      : settings.theme === 'dark'
      ? 'dark'
      : 'light';

  // Apply resolved classes, data attributes and CSS variables
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;

    // 1. Dark class & theme attribute
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }

    // 2. Accent color attribute
    root.setAttribute('data-accent', settings.accent);

    // 3. Density attribute
    root.setAttribute('data-density', settings.density);

    // 4. Reduced motion attribute
    root.setAttribute('data-reduced-motion', settings.reducedMotion ? 'true' : 'false');

    // 5. Body font size CSS variable
    root.style.setProperty('--editorial-body-size', `${settings.bodyFontSize}px`);
  }, [resolvedTheme, settings]);

  const updateSettings = useCallback((partial: Partial<AppearanceSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveStoredAppearanceSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    const fresh = resetStoredAppearanceSettings();
    setSettings(fresh);
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => {
      let nextTheme: ThemeMode;
      if (prev.theme === 'light') nextTheme = 'dark';
      else if (prev.theme === 'dark') nextTheme = 'system';
      else nextTheme = 'light';

      const next = { ...prev, theme: nextTheme };
      saveStoredAppearanceSettings(next);
      return next;
    });
  }, []);

  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  return (
    <ThemeContext.Provider
      value={{
        settings,
        resolvedTheme,
        updateSettings,
        resetSettings,
        toggleTheme,
        isSettingsOpen,
        setIsSettingsOpen,
        openSettings,
        closeSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useSettings must be used within a ThemeProvider');
  }
  return context;
}
