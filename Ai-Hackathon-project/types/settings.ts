export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'sage' | 'blue' | 'amber' | 'violet';
export type InterfaceDensity = 'compact' | 'comfortable' | 'spacious';
export type HeadlineFont = 'serif' | 'sans' | 'classic';
export type ReadingWidth = 'narrow' | 'standard' | 'wide';
export type ArticleLayout = 'single' | 'two' | 'three';

export interface AppearanceSettings {
  theme: ThemeMode;
  accent: AccentColor;
  density: InterfaceDensity;
  headlineFont: HeadlineFont;
  bodyFontSize: number; // 14 to 20 px
  readingWidth: ReadingWidth;
  articleLayout: ArticleLayout;
  showImages: boolean;
  reducedMotion: boolean;
}

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  theme: 'system',
  accent: 'blue',
  density: 'comfortable',
  headlineFont: 'serif',
  bodyFontSize: 16,
  readingWidth: 'standard',
  articleLayout: 'two',
  showImages: true,
  reducedMotion: false,
};

export interface AccentThemeConfig {
  name: string;
  label: string;
  light: {
    primary: string;
    hover: string;
    subtle: string;
    border: string;
    text: string;
  };
  dark: {
    primary: string;
    hover: string;
    subtle: string;
    border: string;
    text: string;
  };
}

export const ACCENT_CONFIGS: Record<AccentColor, AccentThemeConfig> = {
  blue: {
    name: 'blue',
    label: 'Midnight Cobalt',
    light: {
      primary: '#3B54E6',
      hover: '#2940CA',
      subtle: '#EEF2FF',
      border: '#C7D2FE',
      text: '#1E1B4B',
    },
    dark: {
      primary: '#526BFF',
      hover: '#697EFF',
      subtle: 'rgba(82, 107, 255, 0.15)',
      border: 'rgba(82, 107, 255, 0.35)',
      text: '#EEF2FF',
    },
  },
  sage: {
    name: 'sage',
    label: 'Sage Forest',
    light: {
      primary: '#496653',
      hover: '#3D5545',
      subtle: '#E4EDE6',
      border: '#C9DBCF',
      text: '#1A251E',
    },
    dark: {
      primary: '#8EAE91',
      hover: '#A3C2A6',
      subtle: '#242F27',
      border: '#384A3D',
      text: '#E1EFE3',
    },
  },
  amber: {
    name: 'amber',
    label: 'Vintage Amber',
    light: {
      primary: '#9E6B1F',
      hover: '#825717',
      subtle: '#F7EFE1',
      border: '#E8D4B5',
      text: '#4A310B',
    },
    dark: {
      primary: '#D8A856',
      hover: '#E5BC74',
      subtle: '#332717',
      border: '#544125',
      text: '#F7ECD3',
    },
  },
  violet: {
    name: 'violet',
    label: 'Editorial Plum',
    light: {
      primary: '#6B4785',
      hover: '#55376B',
      subtle: '#EFE8F5',
      border: '#D5C4E3',
      text: '#341E44',
    },
    dark: {
      primary: '#B598CC',
      hover: '#C7AFDA',
      subtle: '#2E2238',
      border: '#4B375C',
      text: '#EFE6F7',
    },
  },
};
