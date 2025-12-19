'use client';

import { useHistoryTimeline } from './hooks/useHistoryTimeline';
import { Sparkles, User } from 'lucide-react';

export function HistoryTimeline() {
  const {
    promptHistory,
    historyViewIndex,
    isViewingHistory,
    handleSelectVersion,
    handleGoToLive,
  } = useHistoryTimeline();

  console.log('[HistoryTimeline] Rendering:', {
    historyLength: promptHistory.length,
    historyViewIndex,
    isViewingHistory,
  });

  // Don't render if no history
  if (promptHistory.length === 0) {
    return null;
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0">History:</span>

      {/* Timeline slider */}
      <div className="flex items-center flex-1 overflow-x-auto">
        <div className="flex items-center bg-neutral-200 rounded-full p-0.5">
          {promptHistory.map((version, index) => {
            const isSelected = historyViewIndex === index;

            return (
              <button
                key={version.id}
                onClick={() => {
                  console.log('[HistoryTimeline] Button clicked, index:', index);
                  handleSelectVersion(index);
                }}
                className={`
                  group relative flex-shrink-0 w-7 h-7 rounded-full
                  flex items-center justify-center
                  transition-all duration-150
                  ${
                    isSelected
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-neutral-500 hover:bg-neutral-300 hover:text-neutral-700'
                  }
                `}
                title={`${version.label || (version.source === 'assistant' ? 'Applied suggestion' : 'Manual edit')} - ${formatTime(version.timestamp)}`}
              >
                {version.source === 'assistant' ? (
                  <Sparkles className="h-3 w-3" />
                ) : (
                  <User className="h-3 w-3" />
                )}

                {/* Tooltip on hover */}
                <div
                  className={`
                    absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                    px-2 py-1 bg-neutral-900 text-white text-xs rounded
                    whitespace-nowrap opacity-0 group-hover:opacity-100
                    transition-opacity pointer-events-none z-10
                  `}
                >
                  {version.label || (version.source === 'assistant' ? 'Applied suggestion' : 'Edit')}
                  <br />
                  <span className="text-neutral-400">{formatTime(version.timestamp)}</span>
                </div>
              </button>
            );
          })}

          {/* Live button */}
          <button
            onClick={handleGoToLive}
            className={`
              flex-shrink-0 px-3 h-7 rounded-full text-xs font-medium
              transition-all duration-150
              ${
                !isViewingHistory
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-300 hover:text-neutral-700'
              }
            `}
          >
            Live
          </button>
        </div>
      </div>
    </div>
  );
}
