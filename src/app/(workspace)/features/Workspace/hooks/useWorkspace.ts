'use client';

import { useCallback, useEffect, useState } from 'react';
import { useExecutionStore, useAssistantStore, useSettingsStore } from '@/stores';
import { useExecutePrompt } from '../../../hooks/useExecutePrompt';
import { STORAGE_KEYS } from '@/config/constants';

export function useWorkspace() {
  const { currentPrompt, selectedModelIds, isExecuting, getExecutionSnapshot, promptIntent, promptExamples, completedRuns } =
    useExecutionStore();
  const { updateExecutionSnapshot } = useAssistantStore();
  const {
    hasCompletedOnboarding,
    hasAnyApiKey,
    serverConfiguredProviders,
    serverProvidersLoaded,
    openSettingsModal,
    loadFromStorage,
    fetchServerProviders,
  } = useSettingsStore();
  const { executeAll } = useExecutePrompt();

  // Initialize settings from localStorage and fetch server providers on mount
  useEffect(() => {
    loadFromStorage();
    fetchServerProviders();
  }, [loadFromStorage, fetchServerProviders]);

  // Show welcome modal on first launch (no local API keys, no server providers, not onboarded)
  useEffect(() => {
    // Wait until server providers are loaded before deciding
    if (!serverProvidersLoaded) return;

    const hasLocalKeys = hasAnyApiKey();
    const hasServerKeys = serverConfiguredProviders.length > 0;

    // Only show welcome if user hasn't onboarded AND has no keys from either source
    if (!hasCompletedOnboarding && !hasLocalKeys && !hasServerKeys) {
      openSettingsModal();
    }
  }, [hasCompletedOnboarding, hasAnyApiKey, serverConfiguredProviders, serverProvidersLoaded, openSettingsModal]);

  // Assistant panel state with localStorage persistence
  // Initialize as false to avoid hydration mismatch, then sync from localStorage
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Sync assistant panel state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ASSISTANT_PANEL_OPEN);
      if (stored === 'true') {
        setIsAssistantOpen(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleAssistant = useCallback(() => {
    setIsAssistantOpen((prev) => {
      const newValue = !prev;
      try {
        localStorage.setItem(STORAGE_KEYS.ASSISTANT_PANEL_OPEN, String(newValue));
      } catch {
        // Ignore localStorage errors
      }
      return newValue;
    });
  }, []);

  const closeAssistant = useCallback(() => {
    setIsAssistantOpen(false);
    try {
      localStorage.setItem(STORAGE_KEYS.ASSISTANT_PANEL_OPEN, 'false');
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Update assistant's execution snapshot when execution state changes
  useEffect(() => {
    const snapshot = getExecutionSnapshot();
    updateExecutionSnapshot(snapshot);
  }, [
    currentPrompt?.contentMarkdown,
    selectedModelIds,
    promptIntent,
    promptExamples,
    completedRuns,
    isExecuting,
    getExecutionSnapshot,
    updateExecutionSnapshot,
  ]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Cmd/Ctrl + Enter to run
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isExecuting && selectedModelIds.length > 0) {
          executeAll();
        }
      }
    },
    [isExecuting, selectedModelIds.length, executeAll]
  );

  return {
    handleKeyDown,
    isAssistantOpen,
    toggleAssistant,
    closeAssistant,
  };
}
