'use client';

import { useState } from 'react';
import { StreamingText } from '@/components';
import type { RunDisplay } from '../../hooks/useExecutionPanel';
import {
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Brain,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { getProviderCardColors } from '@/config/providers';
import { ApiKeyErrorContent } from './features/ApiKeyErrorContent/ApiKeyErrorContent';

// ============================================
// ADJUST THIS VALUE TO CHANGE COLLAPSED HEIGHT
// Approximate lines: 120px ~= 5 lines of text
// ============================================
const COLLAPSED_CONTENT_HEIGHT = 120;

interface OutputCardProps {
  run: RunDisplay;
}

export function OutputCard({ run }: OutputCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(run.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleThinkingToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowThinking(!showThinking);
  };

  const colors = getProviderCardColors(run.provider as 'openai' | 'anthropic' | 'google');

  const isLoading = run.status === 'streaming';
  const hasContent = run.content && run.content.length > 0;

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="bg-white rounded-xl overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-lg shadow-md"
      style={{
        border: `2px solid ${colors.border}`,
      }}
    >
      {/* Header - always visible */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-neutral-400" />
          )}
          <h3
            className="font-semibold text-base"
            style={{ color: colors.title }}
          >
            {run.modelName}
          </h3>
          {isLoading && (
            <Loader2
              className="h-4 w-4 animate-spin"
              style={{ color: colors.accent }}
            />
          )}
          {run.status === 'completed' && run.latencyMs && (
            <span className="text-xs text-neutral-400">
              {(run.latencyMs / 1000).toFixed(1)}s
            </span>
          )}
          {run.status === 'error' && (
            <span className="flex items-center gap-1 text-xs">
              {run.errorType === 'missing_api_key' ? (
                <>
                  <KeyRound className="h-3 w-3 text-amber-500" />
                  <span className="text-amber-600">Missing Key</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">Error</span>
                </>
              )}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {run.thinking && (
            <button
              onClick={handleThinkingToggle}
              className="p-1.5 rounded-lg transition-colors hover:bg-neutral-100"
              style={{
                backgroundColor: showThinking ? colors.tint : 'transparent',
                color: colors.accent,
              }}
              title="Toggle thinking"
            >
              <Brain className="h-4 w-4" />
            </button>
          )}
          {hasContent && (
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg transition-colors hover:bg-neutral-100 text-neutral-400"
              title="Copy output"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <>
          {/* Thinking section */}
          {run.thinking && showThinking && (
            <div
              className="px-4 py-3 border-t border-neutral-100"
              style={{ backgroundColor: colors.tint }}
            >
              <div
                className="text-xs font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: colors.accent }}
              >
                Thinking
              </div>
              <div className="text-sm text-neutral-600 font-mono whitespace-pre-wrap">
                {run.thinking}
              </div>
            </div>
          )}

          {/* Content */}
          <div
            className="px-4 py-3 border-t border-neutral-100"
            style={{ minHeight: COLLAPSED_CONTENT_HEIGHT }}
          >
            {run.status === 'error' ? (
              run.errorType === 'missing_api_key' ? (
                <ApiKeyErrorContent
                  errorMessage={run.errorMessage || 'API key not configured'}
                />
              ) : (
                <div className="text-red-500 text-sm">
                  {run.errorMessage || 'An error occurred'}
                </div>
              )
            ) : hasContent ? (
              <div className="text-neutral-700 text-sm leading-relaxed">
                <StreamingText
                  content={run.content}
                  isStreaming={run.status === 'streaming'}
                />
              </div>
            ) : isLoading ? (
              <div className="text-neutral-400 text-sm italic">
                Waiting for response...
              </div>
            ) : null}
          </div>
        </>
      )}

      {/* Collapsed preview - fixed height content area */}
      {!expanded && (
        <div
          className="px-4 pb-3 overflow-hidden"
          style={{ height: COLLAPSED_CONTENT_HEIGHT }}
        >
          {run.status === 'error' ? (
            run.errorType === 'missing_api_key' ? (
              <ApiKeyErrorContent
                errorMessage={run.errorMessage || 'API key not configured'}
              />
            ) : (
              <div className="text-red-500 text-sm">
                {run.errorMessage || 'An error occurred'}
              </div>
            )
          ) : hasContent ? (
            <div className="text-neutral-600 text-sm leading-relaxed">
              <StreamingText
                content={run.content}
                isStreaming={run.status === 'streaming'}
              />
            </div>
          ) : isLoading ? (
            <div className="text-neutral-400 text-sm italic">
              Waiting for response...
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
