// Core data model types

import type { ProviderType } from '@/config/providers';

// Execution error types for distinguishing API key errors from other errors
export type ExecutionErrorType = 'missing_api_key' | 'api_error' | 'network_error' | 'unknown';

// Example types for prompt examples
export type ExampleType = 'positive' | 'negative';

export interface PromptExample {
  id: string;
  content: string;
  type: ExampleType;
}

// Suggestion target types for assistant multi-target updates
export type SuggestionTarget = 'prompt' | 'intent' | 'examples' | 'guardrails';

// Completed run snapshot for history (serializable version)
export interface CompletedRunSnapshot {
  modelId: string;
  output: string;
  thinking?: string;
  status: 'completed' | 'error';
  errorMessage?: string;
  errorType?: ExecutionErrorType;
  errorProvider?: ProviderType;
  latencyMs?: number;
}

// Unified snapshot of all prompt parts for history tracking
export interface PromptSnapshot {
  content: string;
  intent: string;
  examples: PromptExample[];
  guardrails: string;
  selectedModelIds: string[];
  completedRuns: CompletedRunSnapshot[];
}

// Which part of the prompt changed
export type ChangedPart = 'content' | 'intent' | 'examples' | 'guardrails';

export interface Project {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prompt {
  id: string;
  projectId: string;
  name: string;
  contentMarkdown: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptRun {
  id: string;
  promptId: string;
  promptSnapshot: string; // Snapshot of prompt at run time
  provider: string;
  model: string;
  parametersJson: RunParameters;
  outputMarkdown: string;
  thinkingOutput?: string;
  usageJson?: UsageMetrics;
  latencyMs?: number;
  status: RunStatus;
  errorMessage?: string;
  createdAt: Date;
}

export interface RunParameters {
  temperature?: number;
  maxTokens?: number;
  thinking?: {
    enabled: boolean;
    budget?: number;
  };
  systemPrompt?: string;
}

export interface UsageMetrics {
  inputTokens: number;
  outputTokens: number;
  thinkingTokens?: number;
  totalTokens: number;
}

export type RunStatus = 'pending' | 'running' | 'completed' | 'error';

// Assistant conversation types (separate from prompt runs)
export interface AssistantConversation {
  id: string;
  promptId: string;
  createdAt: Date;
}

export interface AssistantMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  suggestionsJson?: PromptSuggestion[];
  executionSnapshotJson?: ExecutionSnapshot;
  createdAt: Date;
}

// Example operation for when suggestion targets examples
export interface ExampleOperation {
  action: 'add' | 'update' | 'remove';
  exampleId?: string; // For update/remove
  exampleType?: ExampleType; // For add
}

export interface PromptSuggestion {
  id: string;
  type: 'full_rewrite' | 'patch' | 'structural';
  target: SuggestionTarget; // Which part to update
  proposedPrompt: string;
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
  exampleOperation?: ExampleOperation; // For examples target
}

// Execution snapshot - read-only view for assistant context
export interface ExecutionSnapshot {
  promptContent: string;
  promptName: string;
  promptIntent?: string;
  promptGuardrails?: string;
  promptExamples?: { id: string; content: string; type: ExampleType }[];
  selectedModels: { id: string; name: string; provider: string }[];
  latestRuns: {
    model: string;
    provider: string;
    output: string;
    status: RunStatus;
  }[];
}

// Prompt version for history tracking (unified snapshot)
export interface PromptVersion {
  id: string;
  snapshot: PromptSnapshot; // Full snapshot of all parts
  timestamp: number;
  source: 'user' | 'assistant';
  label?: string;
  changedPart?: ChangedPart; // Which part triggered this version
}

// Create/update types
export type CreateProject = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProject = Partial<Pick<Project, 'name'>>;

export type CreatePrompt = Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePrompt = Partial<Pick<Prompt, 'name' | 'contentMarkdown'>>;

export type CreatePromptRun = Omit<PromptRun, 'id' | 'createdAt'>;

// Export/Import schema for sharing prompts
export interface PromptExportData {
  version: string; // Schema version (e.g., "1.1")
  exportedAt: string; // ISO date string
  prompt: {
    name: string;
    content: string;
    intent?: string;
    guardrails?: string;
    examples?: PromptExample[];
  };
  executionHistory?: {
    modelId: string;
    output: string;
    thinking?: string;
    status: string;
    latencyMs?: number;
  }[];
}
