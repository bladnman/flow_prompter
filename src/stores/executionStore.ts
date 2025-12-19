// Execution store - manages prompt execution state
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import type { Prompt, RunParameters, ExecutionSnapshot, PromptVersion, PromptExample, ExampleType, PromptSnapshot, ChangedPart, ExecutionErrorType } from '@/types/models';
import type { StreamingState } from '@/types/streaming';
import { initialStreamingState } from '@/types/streaming';
import { ModelConfig, getModelById, ProviderType } from '@/config/providers';

// Enable Map/Set support for Immer
enableMapSet();

interface ActiveRun {
  id: string;
  modelId: string;
  state: StreamingState;
}

interface CompletedRun {
  id: string;
  modelId: string;
  output: string;
  thinking?: string;
  status: 'completed' | 'error';
  errorMessage?: string;
  errorType?: ExecutionErrorType;
  errorProvider?: ProviderType;
  latencyMs?: number;
}

interface ExecutionState {
  // Current prompt being edited
  currentPrompt: Prompt | null;

  // Selected models for execution
  selectedModelIds: string[];

  // Active streaming runs (in progress)
  activeRuns: Map<string, ActiveRun>;

  // Completed runs from most recent execution
  completedRuns: Map<string, CompletedRun>;

  // Execution parameters
  parameters: RunParameters;

  // Is any execution currently running
  isExecuting: boolean;

  // Prompt version history
  promptHistory: PromptVersion[];

  // Index of currently viewed version (-1 means latest/live)
  historyViewIndex: number;

  // Prompt intent - meta-goal/intention behind the prompt
  promptIntent: string;

  // Prompt examples - positive/negative output examples
  promptExamples: PromptExample[];

  // Prompt guardrails - rules and constraints the model must follow
  promptGuardrails: string;

  // The last prompt that was actually sent to the models (combined with intent/examples/guardrails)
  lastSentPrompt: string | null;
}

interface ExecutionActions {
  // Prompt management
  setCurrentPrompt: (prompt: Prompt | null) => void;
  updatePromptContent: (content: string) => void;
  updatePromptName: (name: string) => void;

  // Model selection
  selectModel: (modelId: string) => void;
  deselectModel: (modelId: string) => void;
  toggleModel: (modelId: string) => void;
  setSelectedModels: (modelIds: string[]) => void;

  // Parameters
  setParameters: (params: Partial<RunParameters>) => void;
  setTemperature: (value: number | undefined) => void;
  setMaxTokens: (value: number | undefined) => void;
  setThinking: (enabled: boolean, budget?: number) => void;
  setSystemPrompt: (prompt: string | undefined) => void;

  // Execution state management
  startExecution: (modelId: string, runId: string) => void;
  updateExecution: (modelId: string, chunk: { content?: string; thinking?: string }) => void;
  completeExecution: (
    modelId: string,
    result: { output: string; thinking?: string; latencyMs?: number }
  ) => void;
  failExecution: (modelId: string, error: string, errorType?: ExecutionErrorType, errorProvider?: ProviderType) => void;
  clearExecutions: () => void;

  // Snapshot for assistant context
  getExecutionSnapshot: () => ExecutionSnapshot;

  // History management
  pushHistory: (source: 'user' | 'assistant', label?: string, changedPart?: ChangedPart) => void;
  viewHistoryVersion: (index: number) => void;
  restoreHistoryVersion: (index: number) => void;
  clearHistory: () => void;

  // Intent management
  updateIntent: (content: string) => void;
  setIntent: (content: string) => void;

  // Guardrails management
  updateGuardrails: (content: string) => void;
  setGuardrails: (content: string) => void;

  // Examples management
  addExample: (type: ExampleType) => void;
  updateExample: (id: string, content: string) => void;
  removeExample: (id: string) => void;
  toggleExampleType: (id: string) => void;
  setExamples: (examples: PromptExample[]) => void;

  // Last sent prompt tracking
  setLastSentPrompt: (prompt: string) => void;

  // Reset
  reset: () => void;
}

const initialState: ExecutionState = {
  currentPrompt: null,
  selectedModelIds: [],
  activeRuns: new Map(),
  completedRuns: new Map(),
  parameters: {},
  isExecuting: false,
  promptHistory: [],
  historyViewIndex: -1,
  promptIntent: '',
  promptExamples: [],
  promptGuardrails: '',
  lastSentPrompt: null,
};

export const useExecutionStore = create<ExecutionState & ExecutionActions>()(
  immer((set, get) => ({
    ...initialState,

    // Prompt management
    setCurrentPrompt: (prompt) =>
      set((state) => {
        state.currentPrompt = prompt;
        // Clear executions when changing prompts
        state.activeRuns.clear();
        state.completedRuns.clear();
      }),

    updatePromptContent: (content) =>
      set((state) => {
        if (state.currentPrompt) {
          state.currentPrompt.contentMarkdown = content;
        }
      }),

    updatePromptName: (name) =>
      set((state) => {
        if (state.currentPrompt) {
          state.currentPrompt.name = name;
        }
      }),

    // Model selection
    selectModel: (modelId) =>
      set((state) => {
        if (!state.selectedModelIds.includes(modelId)) {
          state.selectedModelIds.push(modelId);
        }
      }),

    deselectModel: (modelId) =>
      set((state) => {
        state.selectedModelIds = state.selectedModelIds.filter((id) => id !== modelId);
        // Clear results for deselected model
        state.activeRuns.delete(modelId);
        state.completedRuns.delete(modelId);
      }),

    toggleModel: (modelId) =>
      set((state) => {
        const index = state.selectedModelIds.indexOf(modelId);
        if (index >= 0) {
          state.selectedModelIds.splice(index, 1);
          // Clear results for deselected model
          state.activeRuns.delete(modelId);
          state.completedRuns.delete(modelId);
        } else {
          state.selectedModelIds.push(modelId);
        }
      }),

    setSelectedModels: (modelIds) =>
      set((state) => {
        // Clear results for models being removed
        const removedModelIds = state.selectedModelIds.filter((id) => !modelIds.includes(id));
        removedModelIds.forEach((modelId) => {
          state.activeRuns.delete(modelId);
          state.completedRuns.delete(modelId);
        });
        state.selectedModelIds = modelIds;
      }),

    // Parameters
    setParameters: (params) =>
      set((state) => {
        state.parameters = { ...state.parameters, ...params };
      }),

    setTemperature: (value) =>
      set((state) => {
        state.parameters.temperature = value;
      }),

    setMaxTokens: (value) =>
      set((state) => {
        state.parameters.maxTokens = value;
      }),

    setThinking: (enabled, budget) =>
      set((state) => {
        state.parameters.thinking = enabled ? { enabled, budget } : undefined;
      }),

    setSystemPrompt: (prompt) =>
      set((state) => {
        state.parameters.systemPrompt = prompt;
      }),

    // Execution state management
    startExecution: (modelId, runId) =>
      set((state) => {
        state.isExecuting = true;
        state.activeRuns.set(modelId, {
          id: runId,
          modelId,
          state: { ...initialStreamingState, status: 'streaming', startTime: Date.now() },
        });
        // Remove from completed if re-running
        state.completedRuns.delete(modelId);
      }),

    updateExecution: (modelId, chunk) =>
      set((state) => {
        const run = state.activeRuns.get(modelId);
        if (run) {
          if (chunk.content) {
            run.state.content += chunk.content;
          }
          if (chunk.thinking) {
            run.state.thinking += chunk.thinking;
          }
        }
      }),

    completeExecution: (modelId, result) =>
      set((state) => {
        const run = state.activeRuns.get(modelId);
        if (run) {
          state.completedRuns.set(modelId, {
            id: run.id,
            modelId,
            output: result.output,
            thinking: result.thinking,
            status: 'completed',
            latencyMs: result.latencyMs,
          });
          state.activeRuns.delete(modelId);
        }
        // Check if all executions are done
        if (state.activeRuns.size === 0) {
          state.isExecuting = false;
        }
      }),

    failExecution: (modelId, error, errorType = 'unknown', errorProvider) =>
      set((state) => {
        const run = state.activeRuns.get(modelId);
        if (run) {
          state.completedRuns.set(modelId, {
            id: run.id,
            modelId,
            output: '',
            status: 'error',
            errorMessage: error,
            errorType,
            errorProvider,
          });
          state.activeRuns.delete(modelId);
        }
        // Check if all executions are done
        if (state.activeRuns.size === 0) {
          state.isExecuting = false;
        }
      }),

    clearExecutions: () =>
      set((state) => {
        state.activeRuns.clear();
        state.completedRuns.clear();
        state.isExecuting = false;
      }),

    // Snapshot for assistant context
    getExecutionSnapshot: (): ExecutionSnapshot => {
      const state = get();
      const selectedModels = state.selectedModelIds
        .map((id) => getModelById(id))
        .filter((m): m is ModelConfig => m !== undefined)
        .map((m) => ({ id: m.id, name: m.displayName, provider: m.provider }));

      const latestRuns = Array.from(state.completedRuns.values()).map((run) => {
        const model = getModelById(run.modelId);
        return {
          model: model?.displayName ?? run.modelId,
          provider: model?.provider ?? 'unknown',
          output: run.output,
          status: run.status,
        };
      });

      return {
        promptContent: state.currentPrompt?.contentMarkdown ?? '',
        promptName: state.currentPrompt?.name ?? '',
        promptIntent: state.promptIntent || undefined,
        promptGuardrails: state.promptGuardrails || undefined,
        promptExamples: state.promptExamples.length > 0
          ? state.promptExamples.map((ex) => ({ id: ex.id, content: ex.content, type: ex.type }))
          : undefined,
        selectedModels,
        latestRuns,
      };
    },

    // History management
    pushHistory: (source, label, changedPart) =>
      set((state) => {
        if (!state.currentPrompt) return;

        // Convert completedRuns Map to array for snapshot
        const completedRunsArray = Array.from(state.completedRuns.values()).map((run) => ({
          modelId: run.modelId,
          output: run.output,
          thinking: run.thinking,
          status: run.status,
          errorMessage: run.errorMessage,
          errorType: run.errorType,
          errorProvider: run.errorProvider,
          latencyMs: run.latencyMs,
        }));

        // Capture full snapshot of all prompt parts including execution results
        const snapshot: PromptSnapshot = {
          content: state.currentPrompt.contentMarkdown,
          intent: state.promptIntent,
          examples: state.promptExamples.map((ex) => ({ ...ex })),
          guardrails: state.promptGuardrails,
          selectedModelIds: [...state.selectedModelIds],
          completedRuns: completedRunsArray,
        };

        const newVersion: PromptVersion = {
          id: `version-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          snapshot,
          timestamp: Date.now(),
          source,
          label,
          changedPart,
        };

        state.promptHistory.push(newVersion);
        state.historyViewIndex = -1; // Reset to latest
      }),

    viewHistoryVersion: (index) =>
      set((state) => {
        console.log('[executionStore] viewHistoryVersion called:', {
          index,
          historyLength: state.promptHistory.length,
          currentHistoryViewIndex: state.historyViewIndex,
        });
        if (index >= 0 && index < state.promptHistory.length) {
          state.historyViewIndex = index;
          console.log('[executionStore] Set historyViewIndex to:', index);
        } else {
          state.historyViewIndex = -1; // View latest/live
          console.log('[executionStore] Set historyViewIndex to -1 (live)');
        }
      }),

    restoreHistoryVersion: (index) =>
      set((state) => {
        if (!state.currentPrompt) return;
        if (index < 0 || index >= state.promptHistory.length) return;

        const version = state.promptHistory[index];
        const { snapshot } = version;

        // Restore all parts from the snapshot
        state.currentPrompt.contentMarkdown = snapshot.content;
        state.promptIntent = snapshot.intent;
        state.promptExamples = snapshot.examples.map((ex) => ({ ...ex }));
        state.promptGuardrails = snapshot.guardrails;
        state.historyViewIndex = -1; // Back to live editing
      }),

    clearHistory: () =>
      set((state) => {
        state.promptHistory = [];
        state.historyViewIndex = -1;
      }),

    // Intent management
    updateIntent: (content) =>
      set((state) => {
        state.promptIntent = content;
      }),

    setIntent: (content) =>
      set((state) => {
        state.promptIntent = content;
      }),

    // Guardrails management
    updateGuardrails: (content) =>
      set((state) => {
        state.promptGuardrails = content;
      }),

    setGuardrails: (content) =>
      set((state) => {
        state.promptGuardrails = content;
      }),

    // Examples management
    addExample: (type) =>
      set((state) => {
        const newExample: PromptExample = {
          id: `example-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          content: '',
          type,
        };
        state.promptExamples.push(newExample);
      }),

    updateExample: (id, content) =>
      set((state) => {
        const example = state.promptExamples.find((ex) => ex.id === id);
        if (example) {
          example.content = content;
        }
      }),

    removeExample: (id) =>
      set((state) => {
        state.promptExamples = state.promptExamples.filter((ex) => ex.id !== id);
      }),

    toggleExampleType: (id) =>
      set((state) => {
        const example = state.promptExamples.find((ex) => ex.id === id);
        if (example) {
          example.type = example.type === 'positive' ? 'negative' : 'positive';
        }
      }),

    setExamples: (examples) =>
      set((state) => {
        state.promptExamples = examples;
      }),

    // Last sent prompt tracking
    setLastSentPrompt: (prompt) =>
      set((state) => {
        state.lastSentPrompt = prompt;
      }),

    // Reset
    reset: () => set(initialState),
  }))
);

// Selectors
export const selectIsExecuting = (state: ExecutionState) => state.isExecuting;
export const selectCanExecute = (state: ExecutionState) =>
  state.currentPrompt !== null &&
  state.currentPrompt.contentMarkdown.trim() !== '' &&
  state.selectedModelIds.length > 0 &&
  !state.isExecuting;
