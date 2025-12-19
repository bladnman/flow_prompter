'use client';

import { useExecutionPanel } from './hooks/useExecutionPanel';
import { OutputCard } from './features/OutputCard/OutputCard';
import { SentPromptCard } from './features/SentPromptCard/SentPromptCard';
import { Loader2 } from 'lucide-react';

export function ExecutionPanel() {
  const { runs, isExecuting, hasRuns, lastSentPrompt } = useExecutionPanel();

  if (!hasRuns && !isExecuting) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Outputs</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
          <p className="text-center">
            Select models and run your prompt to see outputs here.
            <br />
            <span className="text-sm">
              Press <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded text-xs">Cmd+Enter</kbd> to run
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Outputs</h2>
        {isExecuting && (
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Running...</span>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        <div className="max-w-xl space-y-4 pl-1 pb-4">
          <SentPromptCard prompt={lastSentPrompt} />
          <div className="space-y-5">
            {runs.map((run) => (
              <OutputCard key={run.modelId} run={run} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
