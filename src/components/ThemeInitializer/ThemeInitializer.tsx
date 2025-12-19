'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores';

export function ThemeInitializer() {
  const loadFromStorage = useThemeStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return null;
}
