'use client';

import Image from 'next/image';
import { useCallback } from 'react';
import { useWorkspace } from './hooks/useWorkspace';
import { usePanelModel } from './hooks/usePanelModel';
import { PromptEditor } from '../PromptEditor/PromptEditor';
import { ModelSelector } from '../ModelSelector/ModelSelector';
import { IntentPanel } from '../IntentPanel/IntentPanel';
import { ExamplesPanel } from '../ExamplesPanel/ExamplesPanel';
import { GuardrailsPanel } from '../GuardrailsPanel/GuardrailsPanel';
import { ExecutionPanel } from '../ExecutionPanel/ExecutionPanel';
import { PromptAssistant } from '../PromptAssistant/PromptAssistant';
import { Evaluator } from '../Evaluator/Evaluator';
import { HistoryTimeline } from '../PromptEditor/features/HistoryTimeline/HistoryTimeline';
import { NavActions } from './features/NavActions/NavActions';
import { Button, SlideOverPanel, SettingsModal } from '@/components';
import { Wand2, Play } from 'lucide-react';
import { useExecutePrompt } from '../../hooks/useExecutePrompt';
import { useExecutionStore, selectCanExecute } from '@/stores';

export function Workspace() {
  const { handleKeyDown, isAssistantOpen, toggleAssistant, closeAssistant } =
    useWorkspace();

  const {
    selectedModelId: panelModelId,
    setSelectedModelId: setPanelModelId,
    selectedModel: panelModel,
    tier1Models,
    isModelAvailable,
  } = usePanelModel();

  // Run button logic
  const { executeAll } = useExecutePrompt();
  const canExecute = useExecutionStore(selectCanExecute);
  const { isExecuting, historyViewIndex, restoreHistoryVersion } = useExecutionStore();
  const isViewingHistory = historyViewIndex >= 0;

  const handleRun = useCallback(() => {
    if (canExecute) {
      // If viewing history, restore all parts from that snapshot first
      if (isViewingHistory) {
        restoreHistoryVersion(historyViewIndex);
      }
      executeAll();
    }
  }, [canExecute, executeAll, isViewingHistory, historyViewIndex, restoreHistoryVersion]);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-neutral-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-flow-prompter-1.png"
              alt="Flow Prompter"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <h1 className="text-xl font-bold text-neutral-900">Flow Prompter</h1>
            <span className="text-sm text-neutral-500">Prompt Engineering Playground</span>
          </div>
          <div className="flex items-center gap-3">
            <NavActions />
            <div className="w-px h-6 bg-neutral-200" />
            <Button
              variant="primary"
              size="sm"
              onClick={toggleAssistant}
              icon={<Wand2 className="h-4 w-4" />}
              className={isAssistantOpen ? 'ring-2 ring-violet-300 ring-offset-2' : ''}
            >
              Assistant
            </Button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left side: Prompt Editor + Models */}
        <div className="w-1/2 border-r border-neutral-200 flex flex-col overflow-hidden">
          <div className="flex-1 p-4 flex flex-col gap-4 overflow-auto">
            {/* Action bar: History + Run */}
            <div className="flex-shrink-0 flex items-center">
              <HistoryTimeline />
              <Button
                variant="primary"
                size="sm"
                onClick={handleRun}
                loading={isExecuting}
                disabled={!canExecute}
                icon={<Play className="h-4 w-4" />}
                className="ml-auto"
              >
                Run
              </Button>
            </div>
            <div className="flex-shrink-0">
              <PromptEditor />
            </div>
            <div className="flex-shrink-0">
              <ModelSelector />
            </div>
            <div className="flex-shrink-0">
              <IntentPanel />
            </div>
            <div className="flex-shrink-0">
              <ExamplesPanel />
            </div>
            <div className="flex-shrink-0">
              <GuardrailsPanel />
            </div>
          </div>
        </div>

        {/* Right side: Execution Outputs - scrollable */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <div className="flex-1 p-4 overflow-auto">
            <ExecutionPanel />
          </div>
        </div>
      </div>

      {/* Evaluate & Assist Flyout */}
      <SlideOverPanel
        isOpen={isAssistantOpen}
        onClose={closeAssistant}
        title="Evaluate & Assist"
        width="65%"
        headerActions={
          <select
            value={panelModelId}
            onChange={(e) => setPanelModelId(e.target.value)}
            className="text-sm px-3 py-1.5 border border-neutral-200 rounded-md bg-white
                       focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                       cursor-pointer"
            title={panelModel?.displayName || 'Select model'}
          >
            {tier1Models.map((model) => {
              const available = isModelAvailable(model);
              return (
                <option
                  key={model.id}
                  value={model.id}
                  disabled={!available}
                  className={available ? '' : 'text-neutral-400'}
                >
                  {model.displayName}
                  {!available ? ' (no API key)' : ''}
                </option>
              );
            })}
          </select>
        }
      >
        <div className="flex h-full">
          {/* Left Column: Evaluator */}
          <div className="w-1/2 border-r border-neutral-200 flex flex-col">
            <div className="flex-shrink-0 px-4 py-2 bg-neutral-50 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-700">Evaluator</h3>
            </div>
            <div className="flex-1 overflow-hidden">
              <Evaluator modelId={panelModelId} />
            </div>
          </div>

          {/* Right Column: Assistant */}
          <div className="w-1/2 flex flex-col">
            <div className="flex-shrink-0 px-4 py-2 bg-neutral-50 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-700">Assistant</h3>
            </div>
            <div className="flex-1 overflow-hidden">
              <PromptAssistant isOpen={isAssistantOpen} modelId={panelModelId} />
            </div>
          </div>
        </div>
      </SlideOverPanel>
    </div>
  );
}
