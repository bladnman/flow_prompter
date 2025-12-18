'use client';

import { useMemo } from 'react';
import { useExecutionStore } from '@/stores';
import { getModelById, MODELS } from '@/config/providers';

export interface RunDisplay {
  modelId: string;
  modelName: string;
  provider: string;
  status: 'streaming' | 'completed' | 'error';
  content: string;
  thinking?: string;
  errorMessage?: string;
  latencyMs?: number;
}

export function useExecutionPanel() {
  const {
    activeRuns,
    completedRuns,
    isExecuting,
    selectedModelIds,
    lastSentPrompt,
    historyViewIndex,
    promptHistory,
  } = useExecutionStore();

  // Check if we're viewing a historical version
  const isViewingHistory = historyViewIndex >= 0 && historyViewIndex < promptHistory.length;
  const historicalSnapshot = isViewingHistory ? promptHistory[historyViewIndex].snapshot : null;

  // Combine active and completed runs into a display list, sorted by selectedModelIds order
  const runs = useMemo(() => {
    const result: RunDisplay[] = [];

    // If viewing history, use the historical snapshot data
    if (historicalSnapshot) {
      historicalSnapshot.completedRuns.forEach((run) => {
        const model = getModelById(run.modelId);
        result.push({
          modelId: run.modelId,
          modelName: model?.displayName ?? run.modelId,
          provider: model?.provider ?? 'unknown',
          status: run.status,
          content: run.output,
          thinking: run.thinking,
          errorMessage: run.errorMessage,
          latencyMs: run.latencyMs,
        });
      });

      // Sort by the canonical order in MODELS config (provider grouping)
      result.sort((a, b) => {
        const indexA = MODELS.findIndex((m) => m.id === a.modelId);
        const indexB = MODELS.findIndex((m) => m.id === b.modelId);
        const orderA = indexA === -1 ? Infinity : indexA;
        const orderB = indexB === -1 ? Infinity : indexB;
        return orderA - orderB;
      });

      return result;
    }

    // Otherwise, use live data
    // Add active (streaming) runs
    activeRuns.forEach((run, modelId) => {
      const model = getModelById(modelId);
      result.push({
        modelId,
        modelName: model?.displayName ?? modelId,
        provider: model?.provider ?? 'unknown',
        status: 'streaming',
        content: run.state.content,
        thinking: run.state.thinking || undefined,
      });
    });

    // Add completed runs
    completedRuns.forEach((run, modelId) => {
      const model = getModelById(modelId);
      result.push({
        modelId,
        modelName: model?.displayName ?? modelId,
        provider: model?.provider ?? 'unknown',
        status: run.status,
        content: run.output,
        thinking: run.thinking,
        errorMessage: run.errorMessage,
        latencyMs: run.latencyMs,
      });
    });

    // Sort by the canonical order in MODELS config (provider grouping)
    result.sort((a, b) => {
      const indexA = MODELS.findIndex((m) => m.id === a.modelId);
      const indexB = MODELS.findIndex((m) => m.id === b.modelId);
      const orderA = indexA === -1 ? Infinity : indexA;
      const orderB = indexB === -1 ? Infinity : indexB;
      return orderA - orderB;
    });

    return result;
  }, [activeRuns, completedRuns, historicalSnapshot]);

  const hasRuns = runs.length > 0;

  return {
    runs,
    isExecuting,
    hasRuns,
    selectedModelIds,
    lastSentPrompt,
    isViewingHistory,
  };
}
