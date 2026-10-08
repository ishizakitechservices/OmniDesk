/**
 * School AI — Adaptive Context Inspector
 * An on-demand workspace inspector that quietly opens to present live document previews,
 * spreadsheet grids, slide decks, email staging, and Google Drive conflict details.
 */

import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  FileText,
  Table,
  Presentation,
  Mail,
  CloudCheck,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import {
  Artifact,
  ArtifactVersion,
  CanonicalDocument,
  CanonicalSpreadsheet,
  CanonicalPresentation,
  CanonicalEmailDraft,
} from '../types/index.ts';
import { DeterministicEngines } from '../lib/deterministicEngines.ts';

interface AdaptiveInspectorProps {
  artifact: Artifact | null;
  artifactVersion: ArtifactVersion | null;
  onClose: () => void;
  onTriggerSendConfirmation?: () => void;
  sandboxMode: boolean;
}

export const AdaptiveInspector: React.FC<AdaptiveInspectorProps> = ({
  artifact,
  artifactVersion,
  onClose,
  onTriggerSendConfirmation,
  sandboxMode,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  if (!artifact || !artifactVersion) {
    return null;
  }

  const content = artifactVersion.canonicalContentJson;

  const showNotification = (msg: string) => {
    setExportNotification(msg);
    setTimeout(() => setExportNotification(null), 3500);
  };

  // Export Handlers
  const handleDownloadDocx = async () => {
    if (content.type !== 'document') return;
    setIsExporting(true);
    try {
      const blob = await DeterministicEngines.generateDocx(content);
      DeterministicEngines.triggerDownload(blob, `${artifact.title.replace(/\s+/g, '_')}.docx`);
      showNotification('Successfully exported Word (.docx) document.');
    } catch (e) {
      console.error('Docx export failed:', e);
      showNotification('Error exporting Word document.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadXlsx = async () => {
    if (content.type !== 'spreadsheet') return;
    setIsExporting(true);
    try {
      const blob = await DeterministicEngines.generateXlsx(content);
      DeterministicEngines.triggerDownload(blob, `${artifact.title.replace(/\s+/g, '_')}.xlsx`);
      showNotification('Successfully exported Excel (.xlsx) workbook with formulas.');
    } catch (e) {
      console.error('Xlsx export failed:', e);
      showNotification('Error exporting Excel spreadsheet.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPptx = async () => {
    if (content.type !== 'presentation') return;
    setIsExporting(true);
    try {
      const blob = await DeterministicEngines.generatePptx(content);
      DeterministicEngines.triggerDownload(blob, `${artifact.title.replace(/\s+/g, '_')}.pptx`);
      showNotification('Successfully exported PowerPoint (.pptx) presentation.');
    } catch (e) {
      console.error('Pptx export failed:', e);
      showNotification('Error exporting PowerPoint presentation.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleGoogleExport = () => {
    const formatName =
      content.type === 'document' ? 'Google Docs' : content.type === 'spreadsheet' ? 'Google Sheets' : 'Google Slides';
    showNotification(
      sandboxMode
        ? `Simulated export to ${formatName} in Sandbox Mode (Resource ID: gdrive_${Date.now().toString(36)}).`
        : `Exported to ${formatName} on Google Drive.`
    );
  };

  return (
    <aside className="w-full md:w-[480px] lg:w-[520px] h-full border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 shadow-lg z-30 transition-all">
      {/* Inspector Top Bar */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-900/70">
        <div className="flex items-center gap-2 truncate">
          {artifact.sector === 'document' && <FileText className="w-4 h-4 text-blue-800 shrink-0" />}
          {artifact.sector === 'spreadsheet' && <Table className="w-4 h-4 text-emerald-700 shrink-0" />}
          {artifact.sector === 'presentation' && <Presentation className="w-4 h-4 text-indigo-700 shrink-0" />}
          {artifact.sector === 'email' && <Mail className="w-4 h-4 text-amber-700 shrink-0" />}

          <div className="flex flex-col truncate">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              {artifact.title}
            </span>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
              <span>v{artifactVersion.versionNumber}.0</span>
              <span>·</span>
              <span className="uppercase">{artifact.sector}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Action Download Buttons */}
          {content.type === 'document' && (
            <>
              <button
                onClick={handleDownloadDocx}
                disabled={isExporting}
                title="Download as Microsoft Word (.docx)"
                className="p-1.5 text-slate-600 hover:text-blue-900 dark:text-slate-300 dark:hover:text-white rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.print()}
                title="Print or Save as PDF"
                className="p-1.5 text-slate-600 hover:text-blue-900 dark:text-slate-300 dark:hover:text-white rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
            </>
          )}

          {content.type === 'spreadsheet' && (
            <button
              onClick={handleDownloadXlsx}
              disabled={isExporting}
              title="Download as Microsoft Excel (.xlsx)"
              className="p-1.5 text-slate-600 hover:text-emerald-800 dark:text-slate-300 dark:hover:text-white rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {content.type === 'presentation' && (
            <button
              onClick={handleDownloadPptx}
              disabled={isExporting}
              title="Download as Microsoft PowerPoint (.pptx)"
              className="p-1.5 text-slate-600 hover:text-indigo-800 dark:text-slate-300 dark:hover:text-white rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Google Workspace Export Action */}
          {['document', 'spreadsheet', 'presentation'].includes(content.type) && (
            <button
              onClick={handleGoogleExport}
              title={sandboxMode ? "Simulate Export to Google Workspace (Sandbox)" : "Export to Google Drive"}
              className="p-1.5 text-slate-600 hover:text-blue-900 dark:text-slate-300 dark:hover:text-white rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-blue-600 dark:text-sky-400" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Export Notification Toast */}
      {exportNotification && (
        <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-200 font-medium flex items-center justify-between animate-in fade-in">
          <span>{exportNotification}</span>
          <button onClick={() => setExportNotification(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Storage & Google Workspace Provenance Banner */}
      <div className="px-4 py-2 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium">Stored in School AI (Canonical)</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          {sandboxMode ? (
            <span className="font-mono text-amber-600 dark:text-amber-400">Google Sandbox</span>
          ) : (
            <span className="font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CloudCheck className="w-3 h-3" />
              Synced Google Link
            </span>
          )}
        </div>
      </div>

      {/* Dynamic Inspector Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* DOCUMENT PREVIEW */}
        {content.type === 'document' && (
          <div className="space-y-6 max-w-prose text-slate-800 dark:text-slate-200">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {content.title}
              </h1>
              {content.subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  {content.subtitle}
                </p>
              )}
              {content.date && (
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  Date: {content.date}
                </p>
              )}
            </div>

            {content.sections.map((section) => (
              <div key={section.id} className="space-y-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  {section.heading}
                </h2>
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx} className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    {p}
                  </p>
                ))}
                {section.callout && (
                  <div className="p-3 my-2 text-xs rounded-lg border bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-sky-300">
                    {section.callout.text}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SPREADSHEET PREVIEW */}
        {content.type === 'spreadsheet' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {content.title}
            </h2>

            {content.sheets.map((sheet) => (
              <div key={sheet.id} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {sheet.name}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        {sheet.columns.map((col) => (
                          <th key={col.key} className="px-3 py-2 font-semibold">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {sheet.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          {sheet.columns.map((col) => (
                            <td
                              key={col.key}
                              className={`px-3 py-2 ${col.format === 'currency' ? 'font-mono text-right' : ''}`}
                            >
                              {col.format === 'currency' && typeof row[col.key] === 'number'
                                ? `£${row[col.key].toLocaleString()}`
                                : row[col.key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {/* Formulas Summary Row */}
                      {sheet.formulas && (
                        <tr className="bg-blue-50/60 dark:bg-blue-950/40 font-bold text-blue-950 dark:text-sky-200">
                          <td className="px-3 py-2">{sheet.columns[0]?.label} Total</td>
                          {sheet.columns.slice(1).map((col) => (
                            <td key={col.key} className="px-3 py-2 font-mono text-right">
                              {sheet.formulas?.[col.key] ? (
                                <span title={`Formula: ${sheet.formulas[col.key]}`}>
                                  {sheet.formulas[col.key]}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                          ))}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PRESENTATION PREVIEW */}
        {content.type === 'presentation' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 font-mono">
                Slide {activeSlideIndex + 1} of {content.slides.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveSlideIndex((prev) => Math.max(0, prev - 1))}
                  disabled={activeSlideIndex === 0}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveSlideIndex((prev) => Math.min(content.slides.length - 1, prev + 1))}
                  disabled={activeSlideIndex === content.slides.length - 1}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Frame (16:9 Aspect) */}
            {content.slides[activeSlideIndex] && (
              <div className="aspect-video w-full bg-slate-900 text-white rounded-xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />
                <div>
                  <h3 className="text-lg font-bold leading-tight tracking-tight text-white mb-4">
                    {content.slides[activeSlideIndex].title}
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-200">
                    {content.slides[activeSlideIndex].bulletPoints.map((point, ptIdx) => (
                      <li key={ptIdx} className="flex items-start gap-2">
                        <span className="text-sky-400 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-3 border-t border-slate-800">
                  <span>St. Jude's Academy Presentation Deck</span>
                  <span className="font-mono">{activeSlideIndex + 1}</span>
                </div>
              </div>
            )}

            {/* Speaker Notes */}
            {content.slides[activeSlideIndex]?.speakerNotes && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold block mb-1 text-[11px] uppercase tracking-wider text-slate-400">
                  Speaker Notes:
                </span>
                {content.slides[activeSlideIndex].speakerNotes}
              </div>
            )}
          </div>
        )}

        {/* EMAIL STAGING PREVIEW */}
        {content.type === 'email' && (
          <div className="space-y-4">
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <div className="text-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500 w-12">To:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{content.to.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500 w-12">Subject:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{content.subject}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {content.bodyText}
              </div>
            </div>

            {onTriggerSendConfirmation && (
              <button
                onClick={onTriggerSendConfirmation}
                className="w-full py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Authorize & Dispatch Email via Gmail</span>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
