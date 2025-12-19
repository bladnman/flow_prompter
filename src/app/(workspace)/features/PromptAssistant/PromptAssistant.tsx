'use client';

import { useRef, useEffect, useState } from 'react';
import { usePromptAssistant } from './hooks/usePromptAssistant';
import { Button, MarkdownRenderer } from '@/components';
import { Send, Plus, Sparkles, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { parseAssistantResponse } from './utils/parseAssistantResponse';
import { SuggestionCard } from './features/SuggestionCard/SuggestionCard';

interface PromptAssistantProps {
  isOpen?: boolean;
  modelId?: string;
}

export function PromptAssistant({ isOpen, modelId }: PromptAssistantProps) {
  const {
    conversation,
    currentInput,
    isGenerating,
    streamingContent,
    setCurrentInput,
    sendMessage,
    clearConversation,
    hasExecutionContext,
    applySuggestion,
    applyingId,
    currentPromptContent,
  } = usePromptAssistant({ modelId });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  // State for collapsible streaming preview (collapsed by default)
  const [isStreamingExpanded, setIsStreamingExpanded] = useState(false);

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
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
        <div className="flex items-center gap-2">
          {!hasExecutionContext && (
            <span className="text-xs text-amber-600">
              Run a prompt first for context
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearConversation}
            disabled={conversation.length === 0 || isGenerating}
            icon={<Plus className="h-3 w-3" />}
            title="New chat"
          >
            New Chat
          </Button>
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
                        className="rounded-lg px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
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

        {/* Streaming response - collapsible thinking block */}
        {streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 overflow-hidden">
              {/* Header - always visible */}
              <button
                onClick={() => setIsStreamingExpanded(!isStreamingExpanded)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <Loader2 className="h-3 w-3 animate-spin text-violet-600 dark:text-violet-400" />
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Replying...</span>
                {isStreamingExpanded ? (
                  <ChevronDown className="h-3 w-3 text-neutral-400 ml-auto" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-neutral-400 ml-auto" />
                )}
              </button>
              {/* Expandable content */}
              {isStreamingExpanded && (
                <div className="px-3 pb-2 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="max-h-48 overflow-y-auto mt-2">
                    <pre className="text-xs font-mono text-neutral-500 dark:text-neutral-400 whitespace-pre-wrap break-words">
                      {streamingContent}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-700">
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
                       bg-white text-neutral-900
                       dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100
                       focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                       disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed
                       dark:disabled:bg-neutral-700 dark:disabled:text-neutral-400
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
