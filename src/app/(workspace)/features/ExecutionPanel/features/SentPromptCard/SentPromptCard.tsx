'use client';

import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import { useSentPromptCard } from './hooks/useSentPromptCard';

interface SentPromptCardProps {
  prompt: string | null;
}

export function SentPromptCard({ prompt }: SentPromptCardProps) {
  const { isExpanded, copied, toggleExpanded, copyToClipboard } = useSentPromptCard(prompt);

  if (!prompt) return null;

  return (
    <div
      className="bg-black/5 border border-neutral-200 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:bg-black/10"
      onClick={toggleExpanded}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleExpanded();
        }
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-neutral-400" />
          )}
          <span className="text-sm font-semibold text-neutral-900">Sent Prompt</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard();
          }}
          className="p-1.5 rounded-lg transition-colors hover:bg-neutral-100 text-neutral-400"
          title="Copy full prompt"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-neutral-100">
          <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono pt-3">
            {prompt}
          </pre>
        </div>
      )}
      {!isExpanded && (
        <div className="px-4 pb-3 -mt-1">
          <p className="text-neutral-500 text-sm line-clamp-1">
            {prompt.slice(0, 100)}
            {prompt.length > 100 && '...'}
          </p>
        </div>
      )}
    </div>
  );
}
