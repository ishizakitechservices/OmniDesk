/**
 * School AI — Central Conversational Canvas
 * Core conversational interface featuring natural streaming responses, voice STT input,
 * ambient action chips, and full knowledge provenance citations.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Message, AmbientSuggestion, KnowledgeRetrievalItem } from '../types/index.ts';

interface ChatCanvasProps {
  messages: Message[];
  onSendMessage: (prompt: string) => void;
  isLoading: boolean;
  onSelectAmbientSuggestion: (suggestion: AmbientSuggestion) => void;
  onOpenCitation: (citation: KnowledgeRetrievalItem) => void;
  onOpenConfirmationCard: () => void;
  hasPendingConfirmation?: boolean;
  onOpenKnowledgeModal?: () => void;
}

export const ChatCanvas: React.FC<ChatCanvasProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onSelectAmbientSuggestion,
  onOpenCitation,
  onOpenConfirmationCard,
  hasPendingConfirmation,
  onOpenKnowledgeModal,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [composerNotice, setComposerNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const showNotice = (msg: string) => {
    setComposerNotice(msg);
    setTimeout(() => setComposerNotice(null), 3500);
  };

  // Voice Speech-to-Text via Web Speech API
  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showNotice('Voice dictation is supported in modern browsers (Chrome, Edge, Safari).');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-GB';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputPrompt(transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsRecording(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;
    const promptToSend = inputPrompt.trim();
    setInputPrompt('');
    onSendMessage(promptToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden relative">
      {/* Messages Timeline */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {/* Message Bubble */}
              <div
                className={`max-w-[88%] md:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                {/* Formatted Message Content */}
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Grounding Source Citation Badges */}
                {msg.sourceCitations && msg.sourceCitations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-indigo-500" />
                      Cited Sources:
                    </span>
                    {msg.sourceCitations.map((cite, idx) => (
                      <button
                        key={idx}
                        onClick={() => onOpenCitation(cite)}
                        className="text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-2 py-0.5 rounded transition-colors"
                      >
                        {cite.sourceName} · {cite.section || 'Sec 4'} (p.{cite.pageNumber || 12})
                      </button>
                    ))}
                  </div>
                )}

                {/* Confirmation Alert Gate Trigger (If message requires confirmation) */}
                {msg.requiresConfirmation && (
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/70 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                      <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                        Action Confirmation Gate Active
                      </span>
                    </div>
                    <button
                      onClick={onOpenConfirmationCard}
                      className="px-3 py-1 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                    >
                      Review & Approve
                    </button>
                  </div>
                )}
              </div>

              {/* Ambient Suggestion Chips */}
              {msg.ambientSuggestions && msg.ambientSuggestions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 max-w-[85%]">
                  {msg.ambientSuggestions.map((sug) => (
                    <button
                      key={sug.id}
                      onClick={() => onSelectAmbientSuggestion(sug)}
                      className="group flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-900 dark:hover:text-sky-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 transition-all"
                    >
                      <Sparkles className="w-3 h-3 text-slate-400 group-hover:text-blue-700 dark:group-hover:text-sky-400 shrink-0" />
                      <span>{sug.label}</span>
                      <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-700 dark:group-hover:text-sky-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Thinking / Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono py-2">
              <div className="w-2 h-2 rounded-full bg-blue-700 animate-pulse" />
              <span>Thinking & compiling administrative response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Persistent Bottom Action Composer */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 md:px-8 py-3 shrink-0">
        <form onSubmit={handleFormSubmit} className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl p-2 focus-within:border-blue-900 dark:focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-blue-900 dark:focus-within:ring-sky-500 transition-all">
            {/* Attachment Button */}
            <button
              type="button"
              title="Attach or inspect school policy documents"
              onClick={() => {
                if (onOpenKnowledgeModal) {
                  onOpenKnowledgeModal();
                } else {
                  showNotice('Access and ingest documents in the School Knowledge repository.');
                }
              }}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Input Textarea */}
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask School AI to draft letters, analyze budgets, make presentations, or schedule meetings..."
              rows={1}
              className="flex-1 max-h-32 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none resize-none py-1.5 px-1 leading-relaxed"
            />

            {/* Voice Dictation STT Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              title={isRecording ? 'Stop recording' : 'Voice dictation'}
              className={`p-2 rounded-lg transition-colors shrink-0 ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className={`p-2 rounded-lg text-white transition-all shrink-0 ${
                inputPrompt.trim() && !isLoading
                  ? 'bg-blue-900 hover:bg-blue-800 shadow-sm'
                  : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {composerNotice && (
            <div className="mb-2 py-1 px-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-900 dark:text-sky-300 animate-in fade-in flex items-center justify-between">
              <span>{composerNotice}</span>
              <button type="button" onClick={() => setComposerNotice(null)} className="text-blue-500 hover:text-blue-800 font-bold ml-2">×</button>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1 mt-1.5 select-none">
            <span>Natural language school administration · Press Enter to submit</span>
            {hasPendingConfirmation && (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Action confirmation pending approval
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
