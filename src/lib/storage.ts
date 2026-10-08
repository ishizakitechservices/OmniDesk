/**
 * School AI — Unified Multi-Tenant Domain Repository & Storage Layer
 * 
 * Provides type-safe persistence for all domain models, seeds initial school data,
 * enforces multi-tenant boundaries, and manages audit logging.
 */

import {
  School,
  User,
  Department,
  SchoolMembership,
  Conversation,
  Message,
  Artifact,
  ArtifactVersion,
  KnowledgeSource,
  KnowledgeSourceVersion,
  KnowledgeChunk,
  KnowledgeRetrievalItem,
  Standard,
  StandardVersion,
  PreviousWork,
  CalendarEvent,
  Task,
  Reminder,
  UserPreference,
  UserUiPreference,
  ActionConfirmation,
  AuditLog,
  GoogleIntegration,
  GoogleResource,
  SyncRecord,
} from '../types/index.ts';

// Initial Seed School Data
const SEED_SCHOOL: School = {
  id: 1,
  slug: 'st-judes',
  name: "St. Jude's Academy",
  motto: 'Excellence through Understanding',
  address: '14 Cathedral Way, Edinburgh',
  timezone: 'GMT',
  academicYear: '2026-2027',
  branding: {
    primaryColor: '#1E3A8A',
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=128&q=80',
  },
  settings: {
    defaultDocFormat: 'docx',
    sandboxEnabled: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const SEED_DEPARTMENTS: Department[] = [
  { id: 1, schoolId: 1, name: 'Executive Leadership', code: 'EXEC', createdAt: new Date().toISOString() },
  { id: 2, schoolId: 1, name: 'Bursary & Finance', code: 'FIN', createdAt: new Date().toISOString() },
  { id: 3, schoolId: 1, name: 'Academic Affairs', code: 'ACAD', createdAt: new Date().toISOString() },
  { id: 4, schoolId: 1, name: 'Admissions & Registrar', code: 'ADM', createdAt: new Date().toISOString() },
];

const SEED_USER: User = {
  id: 1,
  supabaseUid: 'usr_staff_001',
  email: 'staff@school.internal',
  fullName: '',
  avatarUrl: '',
  isActive: true,
  createdAt: new Date().toISOString(),
};

const SEED_MEMBERSHIP: SchoolMembership = {
  id: 1,
  schoolId: 1,
  userId: 1,
  permissionLevel: 'admin',
  jobTitle: '',
  departmentId: 1,
  responsibilities: 'School administrative and academic staff duties.',
  joinedAt: new Date().toISOString(),
};

const SEED_STANDARDS: { standard: Standard; version: StandardVersion }[] = [
  {
    standard: {
      id: 1,
      schoolId: 1,
      name: 'Standard Parent Letter Format',
      sector: 'document',
      scope: 'school_wide',
      departmentId: 1,
      description: 'Official template for all institutional correspondence sent to parents and guardians.',
      currentVersionNumber: 1,
      status: 'approved',
      ownerUserId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    version: {
      id: 1,
      standardId: 1,
      versionNumber: 1,
      structureSpec: {
        sections: [
          { title: 'Salutation & Formal Header', required: true, guidance: 'Must include student reference and date' },
          { title: 'Primary Context & Event Details', required: true },
          { title: 'Required Parental Action / Reply Deadline', required: true },
          { title: 'Official Administrative Sign-Off', required: true },
        ],
        formatting: { font: 'Plus Jakarta Sans', primaryColor: '#1E3A8A' },
        standardDisclaimers: ['This message is an official communication from St. Jude\'s Academy.'],
      },
      changeNotes: 'Initial approved baseline standard',
      isCurrent: true,
      createdAt: new Date().toISOString(),
    },
  },
  {
    standard: {
      id: 2,
      schoolId: 1,
      name: 'Departmental Budget Summary Standard',
      sector: 'spreadsheet',
      scope: 'school_wide',
      departmentId: 2,
      description: 'Standard ledger layout for termly expenditures, procurement, and budget variance.',
      currentVersionNumber: 1,
      status: 'approved',
      ownerUserId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    version: {
      id: 2,
      standardId: 2,
      versionNumber: 1,
      structureSpec: {
        sections: [
          { title: 'Category & Code', required: true },
          { title: 'Approved Budget vs Actual Expenditure', required: true },
          { title: 'Variance Formula', required: true },
        ],
        formatting: { font: 'Arial', primaryColor: '#1E3A8A' },
        formulas: [
          { cellTarget: 'variance', formulaExpression: '=B2-C2', description: 'Budget minus Actual' },
          { cellTarget: 'total', formulaExpression: '=SUM(C2:C10)', description: 'Total Actual Expenditure' },
        ],
      },
      isCurrent: true,
      createdAt: new Date().toISOString(),
    },
  },
];

const SEED_KNOWLEDGE_SOURCES: { source: KnowledgeSource; version: KnowledgeSourceVersion; chunks: KnowledgeChunk[] }[] = [
  {
    source: {
      id: 1,
      schoolId: 1,
      departmentId: 1,
      ownerUserId: 1,
      sourceName: 'Staff & Parent Policy Handbook 2026-2027',
      sourceType: 'upload_pdf',
      category: 'policy',
      visibility: 'school_wide',
      currentVersionNumber: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    version: {
      id: 1,
      sourceId: 1,
      versionNumber: 3,
      contentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      processingStatus: 'ready',
      effectiveStartDate: '2026-09-01T00:00:00Z',
      effectiveEndDate: '2027-07-31T00:00:00Z',
      isApproved: true,
      isCurrent: true,
      approvedById: 1,
      approvedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    chunks: [
      {
        id: 1,
        sourceVersionId: 1,
        chunkIndex: 0,
        content: 'School Attendance Policy: All student absences must be reported to the Registrar by 8:30 AM via email or parent portal. Unexcused absences of 3 or more days trigger a formal academic welfare review with the Head of Year.',
        metadata: { heading: 'Student Attendance & Reporting', pageNumber: 12, section: 'Section 4.1' },
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        sourceVersionId: 1,
        chunkIndex: 1,
        content: 'Tuition & Ancillary Fee Schedule: Term 1 fees are due on September 15. A standard late settlement fee of 2.5% applies after 14 calendar days. Fee concession applications must be submitted directly to the Bursary by August 1.',
        metadata: { heading: 'Tuition Deadlines & Settlement', pageNumber: 28, section: 'Section 8.3' },
        createdAt: new Date().toISOString(),
      },
      {
        id: 3,
        sourceVersionId: 1,
        chunkIndex: 2,
        content: 'Extracurricular & Excursion Authorizations: Any off-campus excursion requires minimum 2 adult staff supervisors per 15 pupils. Medical consent forms and dietary manifests must be finalized 7 working days prior to departure.',
        metadata: { heading: 'Field Trips & Off-Campus Protocol', pageNumber: 45, section: 'Section 11.2' },
        createdAt: new Date().toISOString(),
      },
    ],
  },
];

const SEED_PREVIOUS_WORK: { artifact: Artifact; version: ArtifactVersion }[] = [
  {
    artifact: {
      id: 1,
      schoolId: 1,
      creatorUserId: 1,
      departmentId: 1,
      title: 'Term 1 Parent Welcome & Academic Orientation Letter',
      sector: 'document',
      currentVersionNumber: 1,
      visibility: 'school_wide',
      standardId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    version: {
      id: 1,
      artifactId: 1,
      versionNumber: 1,
      canonicalContentJson: {
        type: 'document',
        title: 'Term 1 Parent Welcome & Academic Orientation',
        subtitle: 'Dear Parents & Guardians of St. Jude\'s Academy',
        sections: [
          {
            id: 'sec_1',
            heading: 'Welcome to the New Academic Year',
            level: 1,
            paragraphs: [
              'We are delighted to welcome all returning pupils and our new Year 7 and Sixth Form entrants to St. Jude\'s Academy.',
              'Our faculty has prepared an invigorating academic and extracurricular calendar designed to inspire excellence in scholarship and character.',
            ],
          },
          {
            id: 'sec_2',
            heading: 'Key Term Dates & Attendance Notice',
            level: 2,
            paragraphs: [
              'Term classes commence promptly on Monday, September 8 at 8:30 AM.',
              'Please verify that all pupil medical records and emergency contacts are updated on the school portal prior to the start of term.',
            ],
            callout: {
              type: 'info',
              text: 'Remember to inform the school office of any prescribed medication regimens before Friday, September 5.',
            },
          },
        ],
      },
      createdById: 1,
      createdAt: new Date().toISOString(),
    },
  },
  {
    artifact: {
      id: 2,
      schoolId: 1,
      creatorUserId: 1,
      departmentId: 2,
      title: "2025-2026 Annual Bursary Financial Report & Departmental Ledger",
      sector: 'spreadsheet',
      currentVersionNumber: 1,
      visibility: 'school_wide',
      standardId: 2,
      createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 40).toISOString(),
    },
    version: {
      id: 2,
      artifactId: 2,
      versionNumber: 1,
      canonicalContentJson: {
        type: 'spreadsheet',
        title: "2025-2026 Annual Bursary Financial Report & Departmental Ledger",
        sheets: [
          {
            id: 'sh_bursary_2025',
            name: 'Annual Bursary Accounts',
            columns: [
              { key: 'code', label: 'Account Code', width: 14 },
              { key: 'item', label: 'Department / Expenditure Head', width: 32 },
              { key: 'allocated', label: 'Approved Budget (£)', width: 18, format: 'currency' },
              { key: 'spent', label: 'Actual Outturn (£)', width: 18, format: 'currency' },
              { key: 'remaining', label: 'Net Variance (£)', width: 18, format: 'currency' },
            ],
            rows: [
              { code: 'AC-101', item: 'Curriculum Textbooks & Materials', allocated: 25000, spent: 23400, remaining: 1600 },
              { code: 'SC-204', item: 'Science Laboratories & Consumables', allocated: 18500, spent: 18200, remaining: 300 },
              { code: 'IT-305', item: 'Campus Computing & Software Licences', allocated: 32000, spent: 31500, remaining: 500 },
              { code: 'SP-402', item: 'Athletics, Pitch Maintenance & Kit', allocated: 14000, spent: 12800, remaining: 1200 },
              { code: 'MU-501', item: 'Performing Arts & Music Repairs', allocated: 9500, spent: 8900, remaining: 600 },
              { code: 'EST-601', item: 'Estate Grounds & Winter Heating', allocated: 48000, spent: 46200, remaining: 1800 },
            ],
            formulas: {
              allocated: '=SUM(C2:C7)',
              spent: '=SUM(D2:D7)',
              remaining: '=C8-D8',
            },
          },
        ],
      },
      createdById: 1,
      createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
    },
  },
  {
    artifact: {
      id: 3,
      schoolId: 1,
      creatorUserId: 1,
      departmentId: 1,
      title: "Term 1 All-School Assembly & Strategic Priorities Presentation",
      sector: 'presentation',
      currentVersionNumber: 1,
      visibility: 'school_wide',
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
    version: {
      id: 3,
      artifactId: 3,
      versionNumber: 1,
      canonicalContentJson: {
        type: 'presentation',
        title: "Term 1 All-School Assembly & Strategic Priorities",
        subtitle: "St. Jude's Academy · Michaelmas Term",
        slides: [
          {
            id: 'sl_1',
            slideNumber: 1,
            title: "Term 1 All-School Assembly & Strategic Priorities",
            layout: 'title_slide',
            bulletPoints: [
              'Welcoming our 2026-2027 Pupils, Parents, and Faculty',
              'Presented by Senior Leadership',
            ],
            speakerNotes: 'Welcome everyone to the new term and outline our scholarship values.',
          },
          {
            id: 'sl_2',
            slideNumber: 2,
            title: '1. Academic Scholarship & Curriculum Milestones',
            layout: 'content_split',
            bulletPoints: [
              'Upgraded science laboratory safety workstations commissioned',
              'Digital library catalogue access expanded across all year groups',
              'Senior student academic mentoring clinics launched',
            ],
            speakerNotes: 'Highlight academic achievement milestones.',
          },
          {
            id: 'sl_3',
            slideNumber: 3,
            title: '2. Pastoral Care, Attendance & House Standards',
            layout: 'bullet_summary',
            bulletPoints: [
              'Morning 8:30 AM registration promptness protocol',
              'Inter-house academic and sports competitions commence Week 3',
              'Pupil wellbeing and mental health support ambassadors',
            ],
            speakerNotes: 'Remind form tutors of morning registration procedures.',
          },
        ],
      },
      createdById: 1,
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
  },
];

const SEED_CALENDAR: CalendarEvent[] = [
  {
    id: 1,
    schoolId: 1,
    userId: 1,
    title: 'Board of Governors Termly Review',
    description: 'Quarterly governance and financial budget review.',
    location: 'Senate Room / Virtual Conference',
    startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(),
    isAllDay: false,
    syncStatus: 'synced',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_TASKS: Task[] = [
  {
    id: 1,
    schoolId: 1,
    creatorUserId: 1,
    title: 'Review science lab equipment safety audit',
    description: 'Check chemical inventory and ventilation hood certification.',
    status: 'pending',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const SEED_REMINDERS: Reminder[] = [
  {
    id: 1,
    schoolId: 1,
    userId: 1,
    taskId: 1,
    title: 'Reminder: Review science lab equipment safety audit',
    triggerTime: new Date(Date.now() + 86400000 * 2.5).toISOString(),
    deliveryStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * In-Memory Multi-Tenant Store & Repository
 * Persists data across user interactions in the application runtime.
 */
class SchoolRepository {
  public schools: Map<number, School> = new Map();
  public departments: Map<number, Department> = new Map();
  public users: Map<number, User> = new Map();
  public memberships: Map<number, SchoolMembership> = new Map();
  public conversations: Map<number, Conversation> = new Map();
  public messages: Map<number, Message[]> = new Map();
  public artifacts: Map<number, Artifact> = new Map();
  public artifactVersions: Map<number, ArtifactVersion[]> = new Map();
  public standards: Map<number, Standard> = new Map();
  public standardVersions: Map<number, StandardVersion[]> = new Map();
  public knowledgeSources: Map<number, KnowledgeSource> = new Map();
  public knowledgeSourceVersions: Map<number, KnowledgeSourceVersion[]> = new Map();
  public knowledgeChunks: Map<number, KnowledgeChunk[]> = new Map();
  public previousWorkList: PreviousWork[] = [];
  public calendarEvents: Map<number, CalendarEvent> = new Map();
  public tasks: Map<number, Task> = new Map();
  public reminders: Map<number, Reminder> = new Map();
  public googleIntegrations: Map<number, GoogleIntegration> = new Map();
  public googleResources: Map<number, GoogleResource> = new Map();
  public syncRecords: Map<number, SyncRecord> = new Map();
  public confirmations: Map<string, ActionConfirmation> = new Map();
  public auditLogs: AuditLog[] = [];
  public userPreferences: Map<number, UserPreference> = new Map();
  public userUiPreferences: Map<number, UserUiPreference> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    this.schools.set(SEED_SCHOOL.id, SEED_SCHOOL);
    SEED_DEPARTMENTS.forEach((d) => this.departments.set(d.id, d));
    this.users.set(SEED_USER.id, SEED_USER);
    this.memberships.set(SEED_MEMBERSHIP.id, SEED_MEMBERSHIP);

    // Initial conversation
    const initialConv: Conversation = {
      id: 1,
      schoolId: 1,
      userId: 1,
      title: 'Welcome & Orientation',
      pinned: true,
      sectorContext: 'document',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.conversations.set(initialConv.id, initialConv);

    const initialMessage: Message = {
      id: 1,
      conversationId: 1,
      role: 'assistant',
      content: "Welcome to School AI. I'm ready to assist with institutional correspondence, financial spreadsheets, board presentations, and staff communications.\n\nHow can I help your school today?",
      createdAt: new Date().toISOString(),
      ambientSuggestions: [
        { id: 's1', label: 'Draft a Parent Letter', prompt: 'Create an official notice to parents about the upcoming orientation day.', type: 'action' },
        { id: 's2', label: 'Prepare Budget Spreadsheet', prompt: 'Generate our departmental budget summary spreadsheet following our school standard.', type: 'action' },
        { id: 's3', label: 'Consult School Handbook', prompt: 'What is our official attendance policy for pupil unexcused absences?', type: 'action' },
      ],
    };
    this.messages.set(initialConv.id, [initialMessage]);

    // Seed Standards
    for (const item of SEED_STANDARDS) {
      this.standards.set(item.standard.id, item.standard);
      this.standardVersions.set(item.standard.id, [item.version]);
    }

    // Seed Knowledge
    for (const item of SEED_KNOWLEDGE_SOURCES) {
      this.knowledgeSources.set(item.source.id, item.source);
      this.knowledgeSourceVersions.set(item.source.id, [item.version]);
      this.knowledgeChunks.set(item.version.id, item.chunks);
    }

    // Seed Previous Work & Artifact
    for (const item of SEED_PREVIOUS_WORK) {
      this.artifacts.set(item.artifact.id, item.artifact);
      this.artifactVersions.set(item.artifact.id, [item.version]);
      const summary =
        item.artifact.sector === 'spreadsheet'
          ? 'Audited bursary balance sheet, procurement ledgers, and department budget variance.'
          : item.artifact.sector === 'presentation'
          ? 'Michaelmas term opening assembly slides covering scholarship and pastoral discipline.'
          : 'Official welcome back letter to parents detailing term start dates and medical forms.';
      const tags =
        item.artifact.sector === 'spreadsheet'
          ? ['financial_report', 'bursary', 'budget', 'ledger', '2025-2026']
          : item.artifact.sector === 'presentation'
          ? ['assembly', 'presentation', 'slides', 'leadership']
          : ['parent_letter', 'welcome', 'term_1'];

      this.previousWorkList.push({
        id: item.artifact.id,
        schoolId: item.artifact.schoolId,
        userId: item.artifact.creatorUserId,
        artifactId: item.artifact.id,
        tags,
        summary,
        archived: false,
        createdAt: item.artifact.createdAt,
        artifact: item.artifact,
      });
    }

    // Seed Calendar, Tasks, Reminders
    SEED_CALENDAR.forEach((e) => this.calendarEvents.set(e.id, e));
    SEED_TASKS.forEach((t) => this.tasks.set(t.id, t));
    SEED_REMINDERS.forEach((r) => this.reminders.set(r.id, r));

    // Seed Preferences
    this.userPreferences.set(1, {
      id: 1,
      userId: 1,
      preferredDocumentFormat: 'docx',
      preferredEmailTone: 'formal',
      customInstructions: 'Always include the official St. Jude\'s Academy school motto in letter footers.',
      ambientSuggestionsEnabled: true,
      updatedAt: new Date().toISOString(),
    });

    this.userUiPreferences.set(1, {
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

    this.logAudit({
      id: 1,
      schoolId: 1,
      userId: 1,
      action: 'system_initialized',
      targetType: 'school',
      targetId: '1',
      metadata: { seedLoaded: true },
      timestamp: new Date().toISOString(),
    });
  }

  // Knowledge Retrieval with full Provenance Tracking
  public searchKnowledge(schoolId: number, query: string): KnowledgeRetrievalItem[] {
    const results: KnowledgeRetrievalItem[] = [];
    const queryLower = query.toLowerCase();

    for (const [sourceId, source] of this.knowledgeSources.entries()) {
      if (source.schoolId !== schoolId) continue;

      const versions = this.knowledgeSourceVersions.get(sourceId) || [];
      const currentVersion = versions.find((v) => v.isCurrent) || versions[0];
      if (!currentVersion) continue;

      const chunks = this.knowledgeChunks.get(currentVersion.id) || [];
      for (const chunk of chunks) {
        const isMatch =
          chunk.content.toLowerCase().includes(queryLower) ||
          source.sourceName.toLowerCase().includes(queryLower) ||
          (chunk.metadata?.heading && chunk.metadata.heading.toLowerCase().includes(queryLower));

        if (isMatch || query === '*') {
          results.push({
            sourceId: source.id,
            sourceVersionId: currentVersion.id,
            sourceName: source.sourceName,
            versionNumber: currentVersion.versionNumber,
            text: chunk.content,
            pageNumber: chunk.metadata?.pageNumber,
            section: chunk.metadata?.section,
            locationReference: chunk.metadata?.heading,
            effectiveDate: currentVersion.effectiveStartDate,
            isApproved: currentVersion.isApproved,
            isCurrent: currentVersion.isCurrent,
            isSuperseded: Boolean(currentVersion.supersededAt),
            relevanceScore: isMatch ? 0.92 : 0.65,
          });
        }
      }
    }

    return results;
  }

  // Find Artifact by query in Previous Work & Artifacts Store
  public findArtifactByQuery(schoolId: number, query: string): { artifact: Artifact; version: ArtifactVersion } | null {
    const queryLower = query.toLowerCase();

    // Check Previous Work and Artifacts
    for (const [artId, art] of this.artifacts.entries()) {
      if (art.schoolId !== schoolId) continue;
      const titleMatch = art.title.toLowerCase().includes(queryLower);
      const sectorMatch =
        (queryLower.includes('financial') || queryLower.includes('budget') || queryLower.includes('ledger')) &&
        art.sector === 'spreadsheet';
      const presMatch =
        (queryLower.includes('presentation') || queryLower.includes('slides') || queryLower.includes('assembly')) &&
        art.sector === 'presentation';
      const docMatch =
        (queryLower.includes('letter') || queryLower.includes('parent') || queryLower.includes('orientation')) &&
        art.sector === 'document';

      if (titleMatch || sectorMatch || presMatch || docMatch) {
        const versions = this.artifactVersions.get(artId) || [];
        const currentVersion = versions[0];
        if (currentVersion) {
          return { artifact: art, version: currentVersion };
        }
      }
    }
    return null;
  }

  // Standards Retrieval
  public getStandard(schoolId: number, sector: string, name?: string): { standard: Standard; version: StandardVersion } | null {
    for (const [standardId, standard] of this.standards.entries()) {
      if (standard.schoolId === schoolId && standard.sector === sector) {
        if (!name || standard.name.toLowerCase().includes(name.toLowerCase())) {
          const versions = this.standardVersions.get(standardId) || [];
          const current = versions.find((v) => v.isCurrent) || versions[0];
          if (current) {
            return { standard, version: current };
          }
        }
      }
    }
    return null;
  }

  // Working Context Updates (Conversational Onboarding or Voluntary Preference)
  public updateStaffWorkingContext(
    userId: number,
    updates: { fullName?: string; jobTitle?: string; departmentId?: number; responsibilities?: string }
  ): { user: User; membership: SchoolMembership } {
    const user = this.users.get(userId) || {
      id: userId,
      supabaseUid: `usr_${userId}`,
      email: 'staff@stjudes.edu',
      fullName: 'School Staff',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    if (updates.fullName) {
      user.fullName = updates.fullName;
    }
    this.users.set(userId, user);

    const membership = this.memberships.get(userId) || {
      id: userId,
      schoolId: 1,
      userId,
      permissionLevel: 'admin',
      joinedAt: new Date().toISOString(),
    };

    if (updates.jobTitle !== undefined) membership.jobTitle = updates.jobTitle;
    if (updates.departmentId !== undefined) membership.departmentId = updates.departmentId;
    if (updates.responsibilities !== undefined) membership.responsibilities = updates.responsibilities;
    this.memberships.set(userId, membership);

    this.logAudit({
      schoolId: 1,
      userId,
      action: 'working_context_updated',
      targetType: 'user_membership',
      targetId: String(membership.id),
      metadata: { jobTitle: membership.jobTitle, departmentId: membership.departmentId, fullName: user.fullName },
    });

    return { user, membership };
  }

  // Get full staff context
  public getStaffUser(userId: number): { user: User; membership?: SchoolMembership; department?: Department } {
    const user = this.users.get(userId) || {
      id: userId,
      supabaseUid: `usr_${userId}`,
      email: 'staff@stjudes.edu',
      fullName: 'School Staff',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const membership = this.memberships.get(userId);
    const department = membership?.departmentId ? this.departments.get(membership.departmentId) : undefined;
    return { user, membership, department };
  }

  // Audit Logging
  public logAudit(log: Omit<AuditLog, 'id' | 'timestamp'> & { id?: number; timestamp?: string }) {
    const record: AuditLog = {
      id: log.id || Date.now() + Math.floor(Math.random() * 1000),
      ...log,
      timestamp: log.timestamp || new Date().toISOString(),
    };
    this.auditLogs.unshift(record);
  }
}

export const schoolRepository = new SchoolRepository();
