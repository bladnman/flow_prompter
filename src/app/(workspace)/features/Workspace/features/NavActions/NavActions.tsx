'use client';

import { useNavActions } from './hooks/useNavActions';
import { Button, ThemeToggle } from '@/components';
import { Download, Upload, Settings, FilePlus } from 'lucide-react';

export function NavActions() {
  const {
    onExport,
    canExport,
    onImportClick,
    onFileSelect,
    isImporting,
    importError,
    fileInputRef,
    onOpenSettings,
    onNewPrompt,
  } = useNavActions();

  return (
    <div className="flex items-center gap-2">
      {/* New Prompt button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onNewPrompt}
        icon={<FilePlus className="h-4 w-4" />}
        title="Start a new prompt"
      >
        New
      </Button>

      {/* Export button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onExport}
        disabled={!canExport}
        icon={<Download className="h-4 w-4" />}
        title="Export prompt as JSON"
      >
        Export
      </Button>

      {/* Import button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onImportClick}
        loading={isImporting}
        icon={<Upload className="h-4 w-4" />}
        title="Import prompt from JSON"
      >
        Import
      </Button>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={onFileSelect}
        className="hidden"
        aria-label="Import file input"
      />

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Settings button */}
      <button
        onClick={onOpenSettings}
        className="p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        title="Settings"
        aria-label="Open settings"
      >
        <Settings className="h-5 w-5" />
      </button>

      {/* Import error toast - simple inline display */}
      {importError && (
        <span className="text-xs text-red-600 ml-2">{importError}</span>
      )}
    </div>
  );
}
