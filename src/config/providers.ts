// AI Provider and Model configurations
// This is the single source of truth for all model capabilities

export type ProviderType = 'openai' | 'anthropic' | 'google';

export interface ProviderCapabilities {
  supportsStreaming: boolean;
  supportsThinking: boolean;
  supportsTemperature: boolean;
  temperatureRange?: { min: number; max: number; default: number };
  supportsSystemPrompt: boolean;
  supportsMaxTokens: boolean;
  maxOutputTokens?: number;
}

export interface ModelConfig {
  id: string;
  provider: ProviderType;
  name: string;
  displayName: string;
  contextWindow: number;
  capabilities: ProviderCapabilities;
  isDefault?: boolean;
}

export const MODELS: ModelConfig[] = [
  // OpenAI Models
  {
    id: 'gpt-5.2',
    provider: 'openai',
    name: 'gpt-5.2',
    displayName: 'GPT-5.2',
    contextWindow: 400000,
    capabilities: {
      supportsStreaming: true,
      supportsThinking: true,
      supportsTemperature: true,
      temperatureRange: { min: 0, max: 2, default: 1 },
      supportsSystemPrompt: true,
      supportsMaxTokens: true,
      maxOutputTokens: 128000,
    },
    isDefault: true,
  },
  {
    id: 'gpt-5-mini',
    provider: 'openai',
    name: 'gpt-5-mini',
    displayName: 'GPT-5 Mini',
    contextWindow: 128000,
    capabilities: {
      supportsStreaming: true,
      supportsThinking: true,
      supportsTemperature: true,
      temperatureRange: { min: 0, max: 2, default: 1 },
      supportsSystemPrompt: true,
      supportsMaxTokens: true,
      maxOutputTokens: 32000,
    },
  },
  {
    id: 'gpt-5-nano',
    provider: 'openai',
    name: 'gpt-5-nano',
    displayName: 'GPT-5 Nano',
    contextWindow: 128000,
    capabilities: {
      supportsStreaming: true,
      supportsThinking: true,
      supportsTemperature: true,
      temperatureRange: { min: 0, max: 2, default: 1 },
      supportsSystemPrompt: true,
      supportsMaxTokens: true,
      maxOutputTokens: 16000,
    },
  },

  // Anthropic Models
  {
    id: 'claude-sonnet-4-5-20250929',
    provider: 'anthropic',
    name: 'claude-sonnet-4-5-20250929',
    displayName: 'Claude Sonnet 4.5',
    contextWindow: 200000,
    capabilities: {
      supportsStreaming: true,
      supportsThinking: true,
      supportsTemperature: true,
      temperatureRange: { min: 0, max: 1, default: 1 },
      supportsSystemPrompt: true,
      supportsMaxTokens: true,
      maxOutputTokens: 64000,
    },
    isDefault: true,
  },
  {
    id: 'claude-opus-4-5-20251101',
    provider: 'anthropic',
    name: 'claude-opus-4-5-20251101',
    displayName: 'Claude Opus 4.5',
    contextWindow: 200000,
    capabilities: {
      supportsStreaming: true,
      supportsThinking: true,
      supportsTemperature: true,
      temperatureRange: { min: 0, max: 1, default: 1 },
      supportsSystemPrompt: true,
      supportsMaxTokens: true,
      maxOutputTokens: 64000,
    },
  },

  // Google Models
  {
    id: 'gemini-3-flash-preview',
    provider: 'google',
    name: 'gemini-3-flash-preview',
    displayName: 'Gemini 3 Flash',
    contextWindow: 1000000,
    capabilities: {
      supportsStreaming: true,
      supportsThinking: true,
      supportsTemperature: true,
      temperatureRange: { min: 0, max: 2, default: 1 },
      supportsSystemPrompt: true,
      supportsMaxTokens: true,
      maxOutputTokens: 65536,
    },
    isDefault: true,
  },
  {
    id: 'gemini-3-pro-preview',
    provider: 'google',
    name: 'gemini-3-pro-preview',
    displayName: 'Gemini 3 Pro',
    contextWindow: 200000,
    capabilities: {
      supportsStreaming: true,
      supportsThinking: true,
      supportsTemperature: true,
      temperatureRange: { min: 0, max: 2, default: 1 },
      supportsSystemPrompt: true,
      supportsMaxTokens: true,
      maxOutputTokens: 65536,
    },
  },
];

// Helper functions
export function getModelById(id: string): ModelConfig | undefined {
  return MODELS.find((m) => m.id === id);
}

export function getModelsByProvider(provider: ProviderType): ModelConfig[] {
  return MODELS.filter((m) => m.provider === provider);
}

export function getDefaultModels(): ModelConfig[] {
  return MODELS.filter((m) => m.isDefault);
}

export function getProviderColor(provider: ProviderType): string {
  const colors: Record<ProviderType, string> = {
    openai: 'text-green-600',
    anthropic: 'text-orange-500',
    google: 'text-blue-500',
  };
  return colors[provider];
}

export function getProviderBgColor(provider: ProviderType): string {
  const colors: Record<ProviderType, string> = {
    openai: 'bg-green-50',
    anthropic: 'bg-orange-50',
    google: 'bg-blue-50',
  };
  return colors[provider];
}

// Card color config for output cards - white cards with colored borders
export interface CardColors {
  // Border color (provider accent)
  border: string;
  // Title text color (matches border)
  title: string;
  // Icon/accent color
  accent: string;
  // Subtle background tint for thinking section
  tint: string;
}

export function getProviderCardColors(provider: ProviderType): CardColors {
  // Uses CSS variables for title and tint colors to support theme switching
  // Border and accent colors remain constant across themes
  const colors: Record<ProviderType, CardColors> = {
    openai: {
      border: '#22c55e',
      title: 'var(--provider-openai-title)',
      accent: '#22c55e',
      tint: 'var(--provider-openai-tint)',
    },
    anthropic: {
      border: '#f97316',
      title: 'var(--provider-anthropic-title)',
      accent: '#f97316',
      tint: 'var(--provider-anthropic-tint)',
    },
    google: {
      border: '#3b82f6',
      title: 'var(--provider-google-title)',
      accent: '#3b82f6',
      tint: 'var(--provider-google-tint)',
    },
  };
  return colors[provider];
}
