/**
 * School AI — Debloated Adaptive Sidebar
 * Clean, minimal navigation for Chats, Standards, Knowledge, and Archives.
 */

import React from 'react';
import {
  MessageSquare,
  Plus,
  BookOpen,
  FileCheck,
  History,
  Calendar,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { Conversation, Standard, KnowledgeSource, PreviousWork, Artifact } from '../types/index.ts';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: number;
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
  standards: Standard[];
  knowledgeSources: KnowledgeSource[];
  previousWork: PreviousWork[];
  onOpenArtifact: (artifact: Artifact) => void;
  onOpenStandard: (std: Standard) => void;
  onOpenKnowledge: (source: KnowledgeSource) => void;
  onOpenCalendar: () => void;
  onOpenUiSettings: () => void;
  density?: 'compact' | 'comfortable' | 'spacious';
  visibleSections?: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  standards,
  knowledgeSources,
  previousWork,
  onOpenArtifact,
  onOpenStandard,
  onOpenKnowledge,
  onOpenCalendar,
  onOpenUiSettings,
  density = 'comfortable',
  visibleSections = ['chats', 'standards', 'knowledge', 'calendar'],
}) => {
  const itemPadding = density === 'compact' ? 'py-1 px-2' : density === 'spacious' ? 'py-2.5 px-3' : 'py-1.5 px-2.5';

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex flex-col shrink-0 select-none overflow-y-auto">
      {/* Top Action: New Administrative Conversation */}
      <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Workspace Chat</span>
        </button>
      </div>

      <div className="flex-1 px-2 py-3 space-y-5 overflow-y-auto">
        {/* Section: Recent Conversations */}
        <div>
          <div className="px-2 mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Recent Chats
            </span>
          </div>
          <div className="space-y-0.5">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectConversation(c.id)}
                className={`w-full flex items-center gap-2 text-left rounded-md text-xs font-medium transition-colors ${itemPadding} ${
                  c.id === activeConversationId
                    ? 'bg-blue-100/70 dark:bg-blue-950/80 text-blue-900 dark:text-sky-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{c.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section: Official School Standards */}
        <div>
          <div className="px-2 mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Approved Standards
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{standards.length}</span>
          </div>
          <div className="space-y-0.5">
            {standards.map((s) => (
              <button
                key={s.id}
                onClick={() => onOpenStandard(s)}
                className={`w-full flex items-center justify-between text-left rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors ${itemPadding}`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="truncate">{s.name}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Section: School Knowledge Base */}
        <div>
          <div className="px-2 mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              School Knowledge
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{knowledgeSources.length}</span>
          </div>
          <div className="space-y-0.5">
            {knowledgeSources.map((k) => (
              <button
                key={k.id}
                onClick={() => onOpenKnowledge(k)}
                className={`w-full flex items-center justify-between text-left rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors ${itemPadding}`}
              >
                <div className="flex items-center gap-2 truncate">
                  <BookOpen className="w-3.5 h-3.5 shrink-0 text-indigo-500 dark:text-indigo-400" />
                  <span className="truncate">{k.sourceName}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Section: Calendar Shortcut */}
        <div>
          <div className="px-2 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Calendar & Tasks
            </span>
          </div>
          <div className="space-y-0.5">
            <button
              onClick={onOpenCalendar}
              className={`w-full flex items-center gap-2 text-left rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors ${itemPadding}`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400 shrink-0" />
              <span>Calendar & Reminders</span>
            </button>
          </div>
        </div>

        {/* Section: Previous Work Archive */}
        <div>
          <div className="px-2 mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Previous Work Archive
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{previousWork.length}</span>
          </div>
          <div className="space-y-0.5">
            {previousWork.map((pw) => (
              <button
                key={pw.id}
                onClick={() => pw.artifact && onOpenArtifact(pw.artifact)}
                className={`w-full flex items-center justify-between text-left rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors ${itemPadding}`}
                title={pw.summary || pw.artifact?.title}
              >
                <div className="flex items-center gap-2 truncate">
                  <History className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{pw.artifact?.title || pw.summary}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer: Dynamic UI Config Trigger */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40">
        <button
          onClick={onOpenUiSettings}
          className="w-full flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1 px-1.5"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Workspace Layout</span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase font-mono">{density}</span>
        </button>
      </div>
    </aside>
  );
};
