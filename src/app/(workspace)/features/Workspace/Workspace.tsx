'use client';

import Image from 'next/image';
import { useWorkspace } from './hooks/useWorkspace';
import { PromptEditor } from '../PromptEditor/PromptEditor';
import { ModelSelector } from '../ModelSelector/ModelSelector';
import { IntentPanel } from '../IntentPanel/IntentPanel';
import { ExamplesPanel } from '../ExamplesPanel/ExamplesPanel';
import { GuardrailsPanel } from '../GuardrailsPanel/GuardrailsPanel';
import { ExecutionPanel } from '../ExecutionPanel/ExecutionPanel';
import { PromptAssistant } from '../PromptAssistant/PromptAssistant';
import { NavActions } from './features/NavActions/NavActions';
import { Button, SlideOverPanel, SettingsModal } from '@/components';
import { Wand2 } from 'lucide-react';

export function Workspace() {
  const { handleKeyDown, isAssistantOpen, toggleAssistant, closeAssistant } =
    useWorkspace();

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
              variant={isAssistantOpen ? 'primary' : 'ghost'}
              size="sm"
              onClick={toggleAssistant}
              icon={<Wand2 className="h-4 w-4" />}
              className={isAssistantOpen ? '' : 'text-violet-600 hover:text-violet-700 hover:bg-violet-50'}
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

      {/* Prompt Assistant Flyout */}
      <SlideOverPanel
        isOpen={isAssistantOpen}
        onClose={closeAssistant}
        title="Prompt Assistant"
        width="40%"
      >
        <PromptAssistant isOpen={isAssistantOpen} />
      </SlideOverPanel>
    </div>
  );
}
