'use client';

import { KeyRound, Settings } from 'lucide-react';
import { useSettingsStore } from '@/stores';

interface ApiKeyErrorContentProps {
  errorMessage: string;
}

export function ApiKeyErrorContent({ errorMessage }: ApiKeyErrorContentProps) {
  const { openSettingsModal } = useSettingsStore();

  const handleOpenSettings = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card toggle
    openSettingsModal();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2 text-amber-600">
        <KeyRound className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span className="text-sm">{errorMessage}</span>
      </div>
      <button
        onClick={handleOpenSettings}
        className="
          inline-flex items-center gap-2
          text-sm text-violet-600 hover:text-violet-700
          font-medium
          transition-colors
        "
      >
        <Settings className="h-4 w-4" />
        Open Settings to add API key
      </button>
    </div>
  );
}
