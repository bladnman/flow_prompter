'use client';

import { useState } from 'react';
import { Button, MarkdownRenderer } from '@/components';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
  FileEdit,
  FileText,
  Target,
  ListChecks,
  Shield,
} from 'lucide-react';
import type { ParsedSuggestion } from '../../utils/parseAssistantResponse';
import type { SuggestionTarget } from '@/types/models';

interface SuggestionCardProps {
  suggestion: ParsedSuggestion;
  onApply: (suggestion: ParsedSuggestion) => void;
  isApplying?: boolean;
  isStale?: boolean;
}

const confidenceColors = {
  high: 'bg-green-500/15 text-green-600 border-green-500/30',
  medium: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  low: 'bg-neutral-500/15 text-neutral-500 border-neutral-500/30',
};

const typeLabels = {
  full_rewrite: 'Full Rewrite',
  patch: 'Patch',
};

// Target configuration with icons and colors
const targetConfig: Record<SuggestionTarget, { label: string; color: string; Icon: typeof FileText }> = {
  prompt: { label: 'Prompt', color: 'text-blue-600', Icon: FileText },
  intent: { label: 'Intent', color: 'text-purple-600', Icon: Target },
  examples: { label: 'Examples', color: 'text-green-600', Icon: ListChecks },
  guardrails: { label: 'Guardrails', color: 'text-amber-600', Icon: Shield },
};

export function SuggestionCard({
  suggestion,
  onApply,
  isApplying = false,
  isStale = false,
}: SuggestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRationale, setShowRationale] = useState(false);

  return (
    <div className={`border rounded-lg bg-white overflow-hidden ${isStale ? 'border-amber-200' : 'border-neutral-200'}`}>
      {/* Stale indicator */}
      {isStale && (
        <div className="px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/30 text-xs text-amber-600">
          Prompt has changed since this suggestion was made
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/5 border-b border-neutral-200">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Target indicator */}
          {(() => {
            const target = suggestion.target || 'prompt';
            const config = targetConfig[target];
            const TargetIcon = config.Icon;
            return (
              <span className={`flex items-center gap-1 text-xs font-medium ${config.color}`}>
                <TargetIcon className="h-3.5 w-3.5" />
                {config.label}
              </span>
            );
          })()}

          {/* Separator */}
          <span className="text-neutral-300">·</span>

          {/* Type indicator */}
          {suggestion.type === 'full_rewrite' ? (
            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
          ) : (
            <FileEdit className="h-3.5 w-3.5 text-blue-500" />
          )}
          <span className="text-xs text-neutral-600">
            {typeLabels[suggestion.type]}
          </span>

          {/* Example action indicator */}
          {suggestion.target === 'examples' && suggestion.exampleOperation && (
            <span className="text-xs text-neutral-500">
              ({suggestion.exampleOperation.action}
              {suggestion.exampleOperation.exampleType && ` ${suggestion.exampleOperation.exampleType}`})
            </span>
          )}

          {/* Confidence badge */}
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full border ${confidenceColors[suggestion.confidence]}`}
          >
            {suggestion.confidence}
          </span>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onApply(suggestion)}
          loading={isApplying}
          icon={<Check className="h-3 w-3" />}
        >
          Apply
        </Button>
      </div>

      {/* Proposed content preview/full */}
      <div className="p-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 mb-2"
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          {isExpanded ? 'Collapse' : 'Expand'} proposed prompt
        </button>

        <div
          className={`
            bg-black/5 rounded border border-neutral-200 p-3
            font-mono text-sm text-neutral-800
            ${isExpanded ? '' : 'max-h-24 overflow-hidden relative'}
          `}
        >
          <pre className="whitespace-pre-wrap">{suggestion.proposed}</pre>
          {!isExpanded && (
            <div
              className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.05), transparent)' }}
            />
          )}
        </div>
      </div>

      {/* Rationale (collapsible) */}
      <div className="border-t border-neutral-200">
        <button
          onClick={() => setShowRationale(!showRationale)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-neutral-600 hover:bg-black/5"
        >
          <span className="font-medium">Why this suggestion?</span>
          {showRationale ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
        {showRationale && (
          <div className="px-3 pb-3 text-sm text-neutral-600">
            <MarkdownRenderer content={suggestion.rationale} />
          </div>
        )}
      </div>
    </div>
  );
}
