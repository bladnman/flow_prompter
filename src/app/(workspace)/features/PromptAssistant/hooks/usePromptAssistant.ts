'use client';

import { useCallback, useState } from 'react';
import { useAssistantStore, useExecutionStore, useSettingsStore } from '@/stores';
import type { ParsedSuggestion } from '../utils/parseAssistantResponse';
import { getModelById } from '@/config/providers';

export function usePromptAssistant() {
  const {
    conversation,
    currentInput,
    isGenerating,
    streamingContent,
    executionSnapshot,
    selectedModelId,
    setCurrentInput,
    setSelectedModelId,
    addUserMessage,
    startGeneration,
    endGeneration,
    updateStreamingContent,
    finalizeStreamingMessage,
    clearConversation,
  } = useAssistantStore();

  const {
    currentPrompt,
    updatePromptContent,
    setIntent,
    setGuardrails,
    addExample,
    updateExample,
    removeExample,
  } = useExecutionStore();

  const { getApiKey } = useSettingsStore();

  // Track which suggestion is currently being applied
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  const hasExecutionContext = !!executionSnapshot?.latestRuns?.length;

  const sendMessage = useCallback(async () => {
    if (!currentInput.trim() || isGenerating) return;

    // Add user message
    addUserMessage(currentInput);
    startGeneration();

    try {
      // Build conversation history for the API
      const conversationHistory = conversation.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          modelId: selectedModelId,
          conversationHistory,
          executionSnapshot,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Handle plain text streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        updateStreamingContent(chunk);
      }

      // Finalize the message
      finalizeStreamingMessage();
    } catch (error) {
      console.error('Assistant error:', error);
      // Add error message
      finalizeStreamingMessage();
    } finally {
      endGeneration();
    }
  }, [
    currentInput,
    isGenerating,
    conversation,
    executionSnapshot,
    selectedModelId,
    addUserMessage,
    startGeneration,
    endGeneration,
    updateStreamingContent,
    finalizeStreamingMessage,
  ]);

  // Apply a suggestion to the appropriate part based on target
  const applySuggestion = useCallback(
    async (suggestion: ParsedSuggestion, originalContent?: string) => {
      if (!currentPrompt) return;

      setApplyingId(suggestion.id);
      setApplyError(null);

      try {
        const target = suggestion.target || 'prompt';

        // For simple targets (intent, guardrails), we apply directly
        // For prompt, we use the intelligent merging API
        // For examples, we handle the operation type
        // NOTE: History is NOT pushed here - history is only created on Run
        if (target === 'intent') {
          setIntent(suggestion.proposed);
        } else if (target === 'guardrails') {
          setGuardrails(suggestion.proposed);
        } else if (target === 'examples' && suggestion.exampleOperation) {
          const op = suggestion.exampleOperation;
          if (op.action === 'add' && op.exampleType) {
            // Add example and then update its content
            addExample(op.exampleType);
            // Get fresh state from store (Zustand updates are synchronous)
            const freshExamples = useExecutionStore.getState().promptExamples;
            const lastExample = freshExamples[freshExamples.length - 1];
            if (lastExample) {
              updateExample(lastExample.id, suggestion.proposed);
            }
          } else if (op.action === 'update' && op.exampleId) {
            updateExample(op.exampleId, suggestion.proposed);
          } else if (op.action === 'remove' && op.exampleId) {
            removeExample(op.exampleId);
          }
        } else {
          // For prompt target, use the intelligent merging API
          // Get the API key for the model's provider
          const modelConfig = getModelById(selectedModelId);
          const apiKey = modelConfig ? getApiKey(modelConfig.provider) : undefined;

          const response = await fetch('/api/apply-patch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              currentPrompt: currentPrompt.contentMarkdown,
              originalPrompt: originalContent,
              suggestion: {
                type: suggestion.type,
                confidence: suggestion.confidence,
                proposed: suggestion.proposed,
                rationale: suggestion.rationale,
              },
              modelId: selectedModelId,
              apiKey: apiKey || undefined, // Don't send empty string
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to apply suggestion');
          }

          const result = await response.json();

          if (result.success && result.mergedPrompt) {
            // Update with the merged result from the model
            updatePromptContent(result.mergedPrompt);
          } else {
            throw new Error(result.error || 'Unknown error');
          }
        }
      } catch (error) {
        console.error('Apply suggestion error:', error);
        setApplyError(error instanceof Error ? error.message : 'Failed to apply');
      } finally {
        setApplyingId(null);
      }
    },
    [
      currentPrompt,
      selectedModelId,
      updatePromptContent,
      setIntent,
      setGuardrails,
      addExample,
      updateExample,
      removeExample,
      getApiKey,
    ]
  );

  return {
    conversation,
    currentInput,
    isGenerating,
    streamingContent,
    selectedModelId,
    setCurrentInput,
    setSelectedModelId,
    sendMessage,
    clearConversation,
    hasExecutionContext,
    applySuggestion,
    applyingId,
    applyError,
    currentPromptContent: currentPrompt?.contentMarkdown ?? '',
  };
}
