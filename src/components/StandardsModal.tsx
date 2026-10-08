/**
 * School AI — Official Standards Modal
 * Displays approved institutional formatting and structural standards with version tracking.
 */

import React, { useState } from 'react';
import { X, FileCheck, CheckCircle2, Copy } from 'lucide-react';
import { Standard } from '../types/index.ts';
import { schoolRepository } from '../lib/storage.ts';

interface StandardsModalProps {
  standards: Standard[];
  onClose: () => void;
  onApplyStandardPrompt: (prompt: string) => void;
}

export const StandardsModal: React.FC<StandardsModalProps> = ({
  standards,
  onClose,
  onApplyStandardPrompt,
}) => {
  const [selectedStandardId, setSelectedStandardId] = useState<number>(standards[0]?.id || 1);
  const selectedStandard = standards.find((s) => s.id === selectedStandardId) || standards[0];
  const version = selectedStandard
    ? (schoolRepository.standardVersions.get(selectedStandard.id) || [])[0]
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Approved Institutional Standards
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Left Standard List, Right Detail */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Standard List */}
          <div className="w-64 border-r border-slate-200 dark:border-slate-800 p-3 space-y-1.5 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
            {standards.map((std) => (
              <button
                key={std.id}
                onClick={() => setSelectedStandardId(std.id)}
                className={`w-full text-left p-2.5 rounded-lg text-xs font-medium transition-colors ${
                  std.id === selectedStandardId
                    ? 'bg-blue-100/80 dark:bg-blue-950 text-blue-950 dark:text-sky-300 font-bold border border-blue-200 dark:border-blue-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="font-semibold">{std.name}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">
                  {std.sector} · v{std.currentVersionNumber}.0
                </div>
              </button>
            ))}
          </div>

          {/* Right Detail Pane */}
          {selectedStandard && version && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedStandard.name}
                  </h4>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Approved Official Standard
                  </span>
                </div>
                <p className="text-slate-500 mt-1">{selectedStandard.description}</p>
              </div>

              {/* Required Sections */}
              <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                <h5 className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                  Required Structural Sections
                </h5>
                <div className="space-y-1.5">
                  {version.structureSpec.sections.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-between">
                        <span>{sec.title}</span>
                        {sec.required && (
                          <span className="text-[10px] text-blue-900 dark:text-sky-400 font-mono">Mandatory</span>
                        )}
                      </div>
                      {sec.guidance && <p className="text-slate-500 text-[11px] mt-0.5">{sec.guidance}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulas or Disclaimers */}
              {version.structureSpec.formulas && (
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                  <h5 className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                    Preserved Mathematical Formulas
                  </h5>
                  <div className="space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {version.structureSpec.formulas.map((f, fIdx) => (
                      <div key={fIdx} className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                        <span className="font-bold text-blue-900 dark:text-sky-300">{f.cellTarget}</span>: {f.formulaExpression} ({f.description})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    onApplyStandardPrompt(`Create a new ${selectedStandard.sector} following our official ${selectedStandard.name}.`);
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Generate New Work Following This Standard</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
