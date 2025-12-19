// Theme store - manages theme state and persistence
import { create } from 'zustand';
import { STORAGE_KEYS } from '@/config/constants';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  isInitialized: boolean;
}

interface ThemeActions {
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  loadFromStorage: () => void;
}

// Helper to safely get from localStorage
function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// Helper to safely set localStorage
function setStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors
  }
}

// Apply theme to document
function applyTheme(theme: Theme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export const useThemeStore = create<ThemeState & ThemeActions>((set, get) => ({
  theme: 'light',
  isInitialized: false,

  setTheme: (theme) => {
    set({ theme });
    setStorageItem(STORAGE_KEYS.THEME, theme);
    applyTheme(theme);
  },

  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'light' ? 'dark' : 'light';
    get().setTheme(next);
  },

  loadFromStorage: () => {
    if (get().isInitialized) return;
    const stored = getStorageItem(STORAGE_KEYS.THEME) as Theme | null;
    const theme = stored ?? 'light';
    set({ theme, isInitialized: true });
    applyTheme(theme);
  },
}));
