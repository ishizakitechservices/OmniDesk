/**
 * School AI — Dynamic UI Configuration Modal
 * Strict schema-validated configuration system for layout, theme, density, and accents.
 * Rule: No arbitrary HTML/JS regeneration; strict safe configuration options.
 */

import React from 'react';
import { X, Sliders, Check } from 'lucide-react';
import { UserUiPreference } from '../types/index.ts';

interface DynamicUiModalProps {
  preferences: UserUiPreference;
  onUpdatePreferences: (updated: Partial<UserUiPreference>) => void;
  onClose: () => void;
}

export const DynamicUiModal: React.FC<DynamicUiModalProps> = ({
  preferences,
  onUpdatePreferences,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-900 dark:text-sky-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Dynamic Workspace Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* Layout Density */}
          <div>
            <label className="block text-slate-500 font-semibold mb-2 uppercase tracking-wider text-[11px]">
              Layout Density
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
                <button
                  key={density}
                  onClick={() => onUpdatePreferences({ density })}
                  className={`py-2 px-3 rounded-lg border text-center capitalize transition-colors flex items-center justify-center gap-1.5 ${
                    preferences.density === density
                      ? 'border-blue-900 dark:border-sky-400 bg-blue-50/60 dark:bg-blue-950/60 text-blue-900 dark:text-sky-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {preferences.density === density && <Check className="w-3 h-3" />}
                  <span>{density}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Mode */}
          <div>
            <label className="block text-slate-500 font-semibold mb-2 uppercase tracking-wider text-[11px]">
              Theme Atmosphere
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['light', 'dark'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => onUpdatePreferences({ themeMode: theme })}
                  className={`py-2 px-3 rounded-lg border text-center capitalize transition-colors flex items-center justify-center gap-1.5 ${
                    preferences.themeMode === theme
                      ? 'border-blue-900 dark:border-sky-400 bg-blue-50/60 dark:bg-blue-950/60 text-blue-900 dark:text-sky-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {preferences.themeMode === theme && <Check className="w-3 h-3" />}
                  <span>{theme}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Position */}
          <div>
            <label className="block text-slate-500 font-semibold mb-2 uppercase tracking-wider text-[11px]">
              Sidebar Alignment
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['left', 'right'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => onUpdatePreferences({ sidebarPosition: pos })}
                  className={`py-2 px-3 rounded-lg border text-center capitalize transition-colors flex items-center justify-center gap-1.5 ${
                    preferences.sidebarPosition === pos
                      ? 'border-blue-900 dark:border-sky-400 bg-blue-50/60 dark:bg-blue-950/60 text-blue-900 dark:text-sky-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {preferences.sidebarPosition === pos && <Check className="w-3 h-3" />}
                  <span>{pos === 'left' ? 'Left Side' : 'Right Side'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Institutional Accent Palette */}
          <div>
            <label className="block text-slate-500 font-semibold mb-2 uppercase tracking-wider text-[11px]">
              Accent Palette
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['navy', 'slate', 'emerald', 'indigo'] as const).map((accent) => (
                <button
                  key={accent}
                  onClick={() => onUpdatePreferences({ accentPalette: accent })}
                  className={`py-2 px-2 rounded-lg border text-center capitalize transition-colors text-xs ${
                    preferences.accentPalette === accent
                      ? 'border-blue-900 dark:border-sky-400 bg-blue-50/60 dark:bg-blue-950/60 text-blue-900 dark:text-sky-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {accent}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
