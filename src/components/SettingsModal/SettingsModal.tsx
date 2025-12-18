'use client';

import { useEffect, useRef } from 'react';
import { useSettingsModal } from './hooks/useSettingsModal';
import { Button } from '@/components';
import { Eye, EyeOff, X } from 'lucide-react';
import type { ProviderType } from '@/config/providers';

export function SettingsModal() {
  const {
    isOpen,
    isWelcomeMode,
    fields,
    updateFormKey,
    toggleVisibility,
    handleSave,
    handleCancel,
  } = useSettingsModal();

  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleCancel]);

  // Focus trap and scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={handleCancel}
      />

      {/* Modal content */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 id="settings-modal-title" className="text-lg font-semibold text-neutral-900">
            {isWelcomeMode ? 'Welcome to Flow Prompter' : 'Settings'}
          </h2>
          {!isWelcomeMode && (
            <button
              onClick={handleCancel}
              className="p-1 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-label="Close settings"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Trust message */}
          <p className="text-sm text-neutral-600">
            {isWelcomeMode
              ? 'Enter any API keys you have for the following providers. These are stored in this browser only (local storage) for your own use.'
              : 'Manage your API keys for each provider. Keys are stored locally in your browser.'}
          </p>

          {/* API Key fields */}
          <div className="space-y-4">
            {fields.map((field) => (
              <ApiKeyInput
                key={field.provider}
                provider={field.provider}
                label={field.label}
                placeholder={field.placeholder}
                value={field.value}
                visible={field.visible}
                onChange={(value) => updateFormKey(field.provider, value)}
                onToggleVisibility={() => toggleVisibility(field.provider)}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-neutral-50">
          {!isWelcomeMode && (
            <Button variant="ghost" size="md" onClick={handleCancel}>
              Cancel
            </Button>
          )}
          <Button variant="primary" size="md" onClick={handleSave}>
            {isWelcomeMode ? 'Get Started' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ApiKeyInputProps {
  provider: ProviderType;
  label: string;
  placeholder: string;
  value: string;
  visible: boolean;
  onChange: (value: string) => void;
  onToggleVisibility: () => void;
}

function ApiKeyInput({
  provider,
  label,
  placeholder,
  value,
  visible,
  onChange,
  onToggleVisibility,
}: ApiKeyInputProps) {
  const inputId = `api-key-${provider}`;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-neutral-700 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full px-3 py-2 pr-10
            border border-neutral-300 rounded-md
            text-sm text-neutral-900
            placeholder:text-neutral-400
            focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500
            transition-colors
          "
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="
            absolute right-2 top-1/2 -translate-y-1/2
            p-1 rounded text-neutral-500 hover:text-neutral-700
            transition-colors
          "
          aria-label={visible ? 'Hide API key' : 'Show API key'}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
