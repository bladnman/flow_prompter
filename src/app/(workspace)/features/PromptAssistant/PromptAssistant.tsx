'use client';

import { useRef, useEffect } from 'react';
import { usePromptAssistant } from './hooks/usePromptAssistant';
import { Button, StreamingText, MarkdownRenderer } from '@/components';
import { Send, Trash2, Sparkles } from 'lucide-react';
import { MODELS, getModelById } from '@/config/providers';
import { parseAssistantResponse } from './utils/parseAssistantResponse';
import { SuggestionCard } from './features/SuggestionCard/SuggestionCard';

interface PromptAssistantProps {
  isOpen?: boolean;
}

export function PromptAssistant({ isOpen }: PromptAssistantProps) {
  const {
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
    currentPromptContent,
  } = usePromptAssistant();

  const selectedModel = getModelById(selectedModelId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom and focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to let the panel animation complete
      const timer = setTimeout(() => {
        if (conversationRef.current) {
          conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
        }
        textareaRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto-scroll to bottom as new content streams in or messages are added
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [streamingContent, conversation.length]);

  // Auto-resize textarea as content changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [currentInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInput.trim() && !isGenerating) {
      sendMessage();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentInput.trim() && !isGenerating) {
        sendMessage();
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-neutral-200 bg-neutral-50">
        <div className="flex items-center gap-2">
          {!hasExecutionContext && (
            <span className="text-xs text-amber-600">
              Run a prompt first for context
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            disabled={isGenerating}
            className="text-xs px-2 py-1 border border-neutral-200 rounded bg-white
                       focus:outline-none focus:ring-1 focus:ring-violet-500
                       disabled:bg-neutral-50 disabled:cursor-not-allowed"
            title={selectedModel?.displayName || 'Select model'}
          >
            {MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.displayName}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearConversation}
            disabled={conversation.length === 0}
            icon={<Trash2 className="h-3 w-3" />}
          />
        </div>
      </div>

      {/* Conversation */}
      <div ref={conversationRef} className="flex-1 overflow-auto p-4 space-y-3">
        {conversation.length === 0 && !streamingContent && (
          <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
            <div className="text-center">
              <Sparkles className="h-8 w-8 mx-auto mb-3" />
              <p className="font-medium">Ask me how to improve your prompt</p>
              <p className="text-xs mt-2 text-neutral-500">
                e.g., &quot;Why is the output too verbose?&quot;
              </p>
            </div>
          </div>
        )}

        {conversation.map((message, msgIndex) => {
          // Parse assistant messages to extract suggestions
          const parsed =
            message.role === 'assistant'
              ? parseAssistantResponse(message.content)
              : null;

          // Find the original prompt from the preceding user message's execution snapshot
          let originalPrompt: string | undefined;
          if (message.role === 'assistant') {
            // Look back to find the user message that triggered this response
            for (let i = msgIndex - 1; i >= 0; i--) {
              const prevMsg = conversation[i];
              if (prevMsg.role === 'user' && prevMsg.executionSnapshotJson) {
                originalPrompt = prevMsg.executionSnapshotJson.promptContent;
                break;
              }
            }
          }

          return (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'user' ? (
                <div className="max-w-[85%] rounded-lg px-3 py-2 bg-violet-600 text-white">
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
              ) : (
                <div className="max-w-[90%] space-y-3">
                  {parsed?.segments.map((segment, idx) =>
                    segment.type === 'text' ? (
                      <div
                        key={idx}
                        className="rounded-lg px-3 py-2 bg-neutral-100 text-neutral-900"
                      >
                        <MarkdownRenderer content={segment.content} className="text-sm" />
                      </div>
                    ) : (
                      <SuggestionCard
                        key={segment.suggestion.id}
                        suggestion={segment.suggestion}
                        onApply={(s) => applySuggestion(s, originalPrompt)}
                        isApplying={applyingId === segment.suggestion.id}
                        isStale={
                          originalPrompt !== undefined &&
                          originalPrompt !== currentPromptContent
                        }
                      />
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Streaming response */}
        {streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg px-3 py-2 bg-neutral-100 text-neutral-900">
              <StreamingText content={streamingContent} isStreaming={true} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-neutral-200 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your prompt..."
            disabled={isGenerating}
            rows={1}
            className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                       disabled:bg-neutral-50 disabled:cursor-not-allowed
                       resize-none overflow-hidden"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!currentInput.trim() || isGenerating}
            loading={isGenerating}
            icon={<Send className="h-4 w-4" />}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
