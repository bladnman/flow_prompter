// Application constants

export const APP_NAME = 'Flow Prompter';
export const APP_DESCRIPTION = 'A prompt engineering playground for iterating on prompts with multi-model testing and AI-assisted refinement';

// Static user ID for now (auth-ready structure)
export const STATIC_USER_ID = '00000000-0000-0000-0000-000000000001';

// LocalStorage keys (all prefixed with flowprompt:)
export const STORAGE_KEYS = {
  SELECTED_MODEL_IDS: 'flowprompt:selectedModelIds',
  ASSISTANT_PANEL_OPEN: 'flowprompt:assistantPanelOpen',
  API_KEY_OPENAI: 'flowprompt:apiKey:openai',
  API_KEY_ANTHROPIC: 'flowprompt:apiKey:anthropic',
  API_KEY_GOOGLE: 'flowprompt:apiKey:google',
  ONBOARDING_COMPLETE: 'flowprompt:onboardingComplete',
  THEME: 'flowprompt:theme',
} as const;

// Keyboard shortcuts
export const SHORTCUTS = {
  RUN_PROMPT: 'mod+enter',
  SAVE_PROMPT: 'mod+s',
  NEW_PROMPT: 'mod+n',
} as const;

// UI Constants
export const LAYOUT = {
  SIDEBAR_WIDTH: 280,
  ASSISTANT_HEIGHT: 300,
  OUTPUT_CARD_MIN_WIDTH: 320,
} as const;

// Streaming
export const STREAMING = {
  CHUNK_TIMEOUT_MS: 30000,
  MAX_RETRIES: 3,
} as const;

// Run history
export const HISTORY = {
  MAX_RUNS_DISPLAYED: 50,
  MAX_RUNS_PER_PROMPT: 100,
} as const;
