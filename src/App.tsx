/**
 * School AI (V0.1) — Application Entry & State Manager
 * Integrates Startup Animation, Top Bar Contract, Debloated Sidebar,
 * Conversational Canvas, Adaptive Inspector, and Hardened Confirmation Gate.
 */

import React, { useState, useEffect } from 'react';
import { StartupAnimation } from './components/StartupAnimation.tsx';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { ChatCanvas } from './components/ChatCanvas.tsx';
import { AdaptiveInspector } from './components/AdaptiveInspector.tsx';
import { ConfirmationCard } from './components/ConfirmationCard.tsx';
import { DynamicUiModal } from './components/DynamicUiModal.tsx';
import { StandardsModal } from './components/StandardsModal.tsx';
import { KnowledgeModal } from './components/KnowledgeModal.tsx';
import { CalendarTasksModal } from './components/CalendarTasksModal.tsx';
import { AuditLogModal } from './components/AuditLogModal.tsx';
import { CitationPopover } from './components/CitationPopover.tsx';
import { StaffProfileModal } from './components/StaffProfileModal.tsx';

import {
  Conversation,
  Message,
  Artifact,
  ArtifactVersion,
  Standard,
  KnowledgeSource,
  PreviousWork,
  CalendarEvent,
  Task,
  Reminder,
  AuditLog,
  UserUiPreference,
  AmbientSuggestion,
  KnowledgeRetrievalItem,
  ConfirmationChallengeRequest,
  User,
  SchoolMembership,
  Department,
} from './types/index.ts';

import { schoolRepository } from './lib/storage.ts';

export default function App() {
  // Startup visual identity state (direct entry to workspace)
  const [isStarted, setIsStarted] = useState(true);

  // Staff Identity Context (Neutral / Learned / Voluntary)
  const [currentUser, setCurrentUser] = useState<User>(schoolRepository.users.get(1)!);
  const [currentMembership, setCurrentMembership] = useState<SchoolMembership>(schoolRepository.memberships.get(1)!);
  const [departments, setDepartments] = useState<Department[]>(Array.from(schoolRepository.departments.values()));
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Active navigation view
  const [activeTab, setActiveTab] = useState<'workspace' | 'standards' | 'knowledge' | 'calendar' | 'audit'>('workspace');

  // Google Workspace Mode: Sandbox (Simulated) vs Connected
  const [sandboxMode, setSandboxMode] = useState(true);

  // Dynamic UI Preferences state
  const [uiPrefs, setUiPrefs] = useState<UserUiPreference>({
    id: 1,
    userId: 1,
    layoutPreset: 'classic_canvas',
    themeMode: 'light',
    density: 'comfortable',
    sidebarPosition: 'left',
    sidebarWidthPx: 260,
    accentPalette: 'navy',
    typographyScale: 'standard',
    visibleSidebarSections: ['chats', 'standards', 'knowledge', 'calendar'],
    updatedAt: new Date().toISOString(),
  });

  // Conversations & Messages
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number>(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Inspector State (Active Artifact being viewed or edited)
  const [inspectedArtifact, setInspectedArtifact] = useState<Artifact | null>(null);
  const [inspectedVersion, setInspectedVersion] = useState<ArtifactVersion | null>(null);

  // Modal Dialogs
  const [showUiSettingsModal, setShowUiSettingsModal] = useState(false);
  const [showStandardsModal, setShowStandardsModal] = useState(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [activeCitation, setActiveCitation] = useState<KnowledgeRetrievalItem | null>(null);

  // Consequential Action Confirmation Challenge
  const [pendingChallenge, setPendingChallenge] = useState<ConfirmationChallengeRequest | null>(null);

  // Domain Store Data
  const [standards, setStandards] = useState<Standard[]>([]);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [previousWork, setPreviousWork] = useState<PreviousWork[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Initialize data on mount
  const refreshRepositoryData = () => {
    setConversations(Array.from(schoolRepository.conversations.values()));
    const convMsgs = schoolRepository.messages.get(activeConvId) || [];
    setMessages(convMsgs);

    setStandards(Array.from(schoolRepository.standards.values()));
    setKnowledgeSources(Array.from(schoolRepository.knowledgeSources.values()));
    setPreviousWork(schoolRepository.previousWorkList);
    setCalendarEvents(Array.from(schoolRepository.calendarEvents.values()));
    setTasks(Array.from(schoolRepository.tasks.values()));
    setReminders(Array.from(schoolRepository.reminders.values()));
    setAuditLogs(schoolRepository.auditLogs);

    const user = schoolRepository.users.get(1);
    if (user) setCurrentUser({ ...user });
    const mem = schoolRepository.memberships.get(1);
    if (mem) setCurrentMembership({ ...mem });
    setDepartments(Array.from(schoolRepository.departments.values()));

    const savedUi = schoolRepository.userUiPreferences.get(1);
    if (savedUi) setUiPrefs(savedUi);
  };

  useEffect(() => {
    refreshRepositoryData();
  }, [activeConvId]);

  // Apply dark mode class to documentElement
  useEffect(() => {
    if (uiPrefs.themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [uiPrefs.themeMode]);

  // Handle New Conversation
  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now(),
      schoolId: 1,
      userId: 1,
      title: 'New Administrative Chat',
      pinned: false,
      sectorContext: 'document',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const staffTitle = currentMembership?.jobTitle ? ` (${currentMembership.jobTitle})` : '';
    const displayName =
      currentUser?.fullName && currentUser.fullName !== 'School Staff'
        ? currentUser.fullName
        : 'Colleague';

    const welcomeMsg: Message = {
      id: Date.now() + 1,
      conversationId: newConv.id,
      role: 'assistant',
      content: `Hello ${displayName}${staffTitle}. I'm ready to assist with parent communications, financial spreadsheets, assembly slides, or staff calendars. What would you like to prepare?`,
      createdAt: new Date().toISOString(),
      ambientSuggestions: [
        { id: 's1', label: 'Draft a Parent Letter', prompt: 'Create an official notice to parents about orientation day.', type: 'action' },
        { id: 's2', label: 'Department Budget Summary', prompt: 'Generate our departmental budget summary spreadsheet following our school standard.', type: 'action' },
        { id: 's3', label: "Find Last Year's Financial Report", prompt: "Find last year's financial report.", type: 'action' },
      ],
    };

    schoolRepository.conversations.set(newConv.id, newConv);
    schoolRepository.messages.set(newConv.id, [welcomeMsg]);
    setActiveConvId(newConv.id);
    refreshRepositoryData();
  };

  // Handle User Message Submission
  const handleSendMessage = async (prompt: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          conversationId: activeConvId,
          userId: 1,
          schoolId: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Server request failed.');
      }

      const data = await response.json();

      // If an artifact was created, quietly open the Adaptive Inspector!
      if (data.createdArtifact) {
        setInspectedArtifact(data.createdArtifact.artifact);
        setInspectedVersion(data.createdArtifact.version);
      }

      // If a confirmation challenge was issued, open the confirmation modal
      if (data.confirmationChallenge) {
        setPendingChallenge(data.confirmationChallenge);
      }

      // If UI configuration was updated
      if (data.uiConfigUpdated) {
        setUiPrefs(data.uiConfigUpdated);
      }

      // If staff working context was updated via conversational onboarding
      if (data.userProfileUpdated) {
        if (data.userProfileUpdated.user) setCurrentUser({ ...data.userProfileUpdated.user });
        if (data.userProfileUpdated.membership) setCurrentMembership({ ...data.userProfileUpdated.membership });
      }

      refreshRepositoryData();
    } catch (err) {
      console.error('Chat error:', err);
      // Local fallback
      refreshRepositoryData();
    } finally {
      setIsLoading(false);
    }
  };

  // Action Confirmation Completion
  const handleConfirmSuccess = () => {
    setPendingChallenge(null);
    refreshRepositoryData();
    // Add success feedback message
    const msgs = schoolRepository.messages.get(activeConvId) || [];
    msgs.push({
      id: Date.now(),
      conversationId: activeConvId,
      role: 'assistant',
      content: `The email has been successfully authorized and dispatched to recipients via Gmail. A permanent record has been logged in the institutional audit trail.`,
      createdAt: new Date().toISOString(),
    });
    schoolRepository.messages.set(activeConvId, msgs);
    refreshRepositoryData();
  };

  // Handle Dynamic UI Preferences update
  const handleUpdatePreferences = (updated: Partial<UserUiPreference>) => {
    const newPrefs = { ...uiPrefs, ...updated, updatedAt: new Date().toISOString() };
    setUiPrefs(newPrefs);
    schoolRepository.userUiPreferences.set(1, newPrefs);
  };

  // If startup animation is still active
  if (!isStarted) {
    return <StartupAnimation onComplete={() => setIsStarted(true)} />;
  }

  return (
    <div className={`h-screen flex flex-col overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans ${uiPrefs.density === 'compact' ? 'text-xs' : ''}`}>
      {/* Top Bar Contract Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'standards') setShowStandardsModal(true);
          if (tab === 'knowledge') setShowKnowledgeModal(true);
          if (tab === 'calendar') setShowCalendarModal(true);
          if (tab === 'audit') setShowAuditModal(true);
        }}
        sandboxMode={sandboxMode}
        setSandboxMode={setSandboxMode}
        onOpenUiSettings={() => setShowUiSettingsModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        currentUser={currentUser}
        currentMembership={currentMembership}
      />

      {/* Main Workspace Frame */}
      <div className={`flex-1 flex overflow-hidden ${uiPrefs.sidebarPosition === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Debloated Adaptive Sidebar */}
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConvId}
          onSelectConversation={(id) => setActiveConvId(id)}
          onNewConversation={handleNewConversation}
          standards={standards}
          knowledgeSources={knowledgeSources}
          previousWork={previousWork}
          onOpenArtifact={(art) => {
            const versions = schoolRepository.artifactVersions.get(art.id) || [];
            setInspectedArtifact(art);
            setInspectedVersion(versions[0] || null);
          }}
          onOpenStandard={() => setShowStandardsModal(true)}
          onOpenKnowledge={() => setShowKnowledgeModal(true)}
          onOpenCalendar={() => setShowCalendarModal(true)}
          onOpenUiSettings={() => setShowUiSettingsModal(true)}
          density={uiPrefs.density}
          visibleSections={uiPrefs.visibleSidebarSections}
        />

        {/* Central Conversation Canvas */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <ChatCanvas
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onSelectAmbientSuggestion={(sug) => handleSendMessage(sug.prompt)}
            onOpenCitation={(cite) => setActiveCitation(cite)}
            onOpenConfirmationCard={() => {
              if (pendingChallenge) setPendingChallenge(pendingChallenge);
            }}
            hasPendingConfirmation={Boolean(pendingChallenge)}
            onOpenKnowledgeModal={() => setShowKnowledgeModal(true)}
          />
        </main>

        {/* Adaptive Context Inspector (Glides open when an artifact is active) */}
        {inspectedArtifact && inspectedVersion && (
          <AdaptiveInspector
            artifact={inspectedArtifact}
            artifactVersion={inspectedVersion}
            onClose={() => {
              setInspectedArtifact(null);
              setInspectedVersion(null);
            }}
            sandboxMode={sandboxMode}
            onTriggerSendConfirmation={() => {
              handleSendMessage('Confirm and send this email now.');
            }}
          />
        )}
      </div>

      {/* Modals & Overlays */}
      {showProfileModal && (
        <StaffProfileModal
          user={currentUser}
          membership={currentMembership}
          departments={departments}
          onSave={(updates) => {
            schoolRepository.updateStaffWorkingContext(1, updates);
            refreshRepositoryData();
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {showUiSettingsModal && (
        <DynamicUiModal
          preferences={uiPrefs}
          onUpdatePreferences={handleUpdatePreferences}
          onClose={() => setShowUiSettingsModal(false)}
        />
      )}

      {showStandardsModal && (
        <StandardsModal
          standards={standards}
          onClose={() => setShowStandardsModal(false)}
          onApplyStandardPrompt={(prompt) => handleSendMessage(prompt)}
        />
      )}

      {showKnowledgeModal && (
        <KnowledgeModal
          sources={knowledgeSources}
          onClose={() => setShowKnowledgeModal(false)}
          onRefresh={refreshRepositoryData}
        />
      )}

      {showCalendarModal && (
        <CalendarTasksModal
          events={calendarEvents}
          tasks={tasks}
          reminders={reminders}
          onClose={() => setShowCalendarModal(false)}
        />
      )}

      {showAuditModal && (
        <AuditLogModal
          logs={auditLogs}
          onClose={() => setShowAuditModal(false)}
        />
      )}

      {activeCitation && (
        <CitationPopover
          citation={activeCitation}
          onClose={() => setActiveCitation(null)}
        />
      )}

      {pendingChallenge && (
        <ConfirmationCard
          challenge={pendingChallenge}
          onConfirmSuccess={handleConfirmSuccess}
          onCancel={() => setPendingChallenge(null)}
        />
      )}
    </div>
  );
}
