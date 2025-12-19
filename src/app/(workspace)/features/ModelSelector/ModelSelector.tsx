'use client';

import { useModelSelector } from './hooks/useModelSelector';
import { Panel } from '@/components';
import { Check, Sparkles } from 'lucide-react';
import { getModelById, ProviderType } from '@/config/providers';

export function ModelSelector() {
  const { modelsByProvider, selectedModelIds, toggleModel, isProviderDisabled, onAddApiKey } = useModelSelector();

  const selectedModelNames = selectedModelIds
    .map((id) => getModelById(id)?.displayName)
    .filter(Boolean)
    .join(', ');

  return (
    <Panel
      title="Models"
      subtitle={selectedModelNames || 'None selected'}
      collapsible
      defaultCollapsed={true}
    >
      <div className="space-y-4">
        {Object.entries(modelsByProvider).map(([provider, models]) => {
          const providerKey = provider as ProviderType;
          const disabled = isProviderDisabled(providerKey);

          return (
            <div key={provider}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  {provider}
                </h4>
                {disabled && (
                  <button
                    onClick={onAddApiKey}
                    className="text-xs text-violet-600 hover:text-violet-700 hover:underline"
                  >
                    Add key
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {models.map((model) => {
                  const isSelected = selectedModelIds.includes(model.id);
                  return (
                    <button
                      key={model.id}
                      onClick={() => toggleModel(model.id)}
                      disabled={disabled}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-md text-left
                        transition-colors duration-150
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        ${
                          isSelected && !disabled
                            ? 'bg-violet-500/15 border border-violet-400/50'
                            : 'bg-black/5 border border-transparent'
                        }
                        ${!disabled && !isSelected ? 'hover:bg-black/10' : ''}
                      `}
                    >
                      <div
                        className={`
                          w-4 h-4 rounded border flex items-center justify-center
                          ${
                            isSelected && !disabled
                              ? 'bg-violet-600 border-violet-600'
                              : 'border-neutral-300'
                          }
                        `}
                      >
                        {isSelected && !disabled && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-neutral-900">
                          {model.displayName}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {model.capabilities.supportsThinking && (
                          <span title="Supports thinking/reasoning">
                            <Sparkles className="h-3 w-3 text-purple-500" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
