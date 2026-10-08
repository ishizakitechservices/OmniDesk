/**
 * School AI — Complete PostgreSQL Schema with Drizzle ORM and pgvector
 * Multi-tenant isolation, clean canonical artifacts, decoupled permission levels,
 * temporal domain models (Calendar, Tasks, Reminders), and hardened challenge hash tokens.
 */

import { pgTable, text, serial, timestamp, boolean, jsonb, integer, index, pgEnum, customType } from 'drizzle-orm/pg-core';

// Enums
export const permissionLevelEnum = pgEnum('permission_level', [
  'owner',
  'admin',
  'member',
  'restricted_member',
  'viewer',
]);

export const visibilityEnum = pgEnum('visibility_level', [
  'private',
  'department',
  'school_wide',
  'restricted',
]);

export const sectorEnum = pgEnum('sector_type', [
  'document',
  'spreadsheet',
  'presentation',
  'email',
]);

export const processingStatusEnum = pgEnum('processing_status', [
  'pending',
  'processing',
  'ready',
  'failed',
  'superseded',
]);

export const standardStatusEnum = pgEnum('standard_status', [
  'draft',
  'approved',
  'superseded',
  'archived',
]);

export const confirmationStatusEnum = pgEnum('confirmation_status', [
  'pending',
  'confirmed',
  'rejected',
  'expired',
]);

export const syncStatusEnum = pgEnum('sync_status', [
  'synced',
  'pending_upload',
  'pending_download',
  'conflict',
  'disconnected',
]);

export const taskStatusEnum = pgEnum('task_status', [
  'pending',
  'in_progress',
  'completed',
  'cancelled',
]);

// Custom pgvector type for PostgreSQL pgvector extension
export const vector = customType<{ data: number[]; driverData: string | number[]; config: { dimensions: number } }>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 1536})`;
  },
  fromDriver(value: unknown): number[] {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return [];
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
});

// 1. Schools (Multi-Tenant Root)
export const schools = pgTable('schools', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  motto: text('motto'),
  address: text('address'),
  timezone: text('timezone').default('UTC').notNull(),
  academicYear: text('academic_year').default('2026-2027').notNull(),
  branding: jsonb('branding').$type<{ logoUrl?: string; primaryColor?: string; letterheadTemplate?: string }>(),
  settings: jsonb('settings').$type<{ defaultDocFormat?: 'docx' | 'gdoc'; sandboxEnabled?: boolean }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Users (Synced from Supabase Auth)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  supabaseUid: text('supabase_uid').notNull().unique(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Departments
export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  code: text('code'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. School Memberships (Separating Permission Level from Job Title)
export const schoolMemberships = pgTable('school_memberships', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  permissionLevel: permissionLevelEnum('permission_level').default('member').notNull(),
  jobTitle: text('job_title'), // Contextual attribute (e.g. "Bursar", "Head of Science")
  departmentId: integer('department_id').references(() => departments.id, { onDelete: 'set null' }),
  responsibilities: text('responsibilities'), // Informational context learned by onboarding
  workingContext: jsonb('working_context').$type<Record<string, any>>(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// 5. Conversations
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  pinned: boolean('pinned').default(false).notNull(),
  sectorContext: sectorEnum('sector_context').default('document').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 6. Messages
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull(), // 'user', 'assistant', 'system'
  content: text('content').notNull(),
  providerUsed: text('provider_used'),
  modelCapabilityUsed: text('model_capability_used'),
  toolInvocations: jsonb('tool_invocations').$type<any[]>(),
  requiresConfirmation: boolean('requires_confirmation').default(false).notNull(),
  confirmationId: integer('confirmation_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 7. Canonical Artifacts (Core representation of user work)
export const artifacts = pgTable('artifacts', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  creatorUserId: integer('creator_user_id').references(() => users.id).notNull(),
  departmentId: integer('department_id').references(() => departments.id),
  title: text('title').notNull(),
  sector: sectorEnum('sector').notNull(), // 'document', 'spreadsheet', 'presentation', 'email'
  currentVersionNumber: integer('current_version_number').default(1).notNull(),
  visibility: visibilityEnum('visibility').default('private').notNull(),
  standardId: integer('standard_id'), // Optional standard followed
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 8. Artifact Versions (Immutable History & Canonical JSON Content)
export const artifactVersions = pgTable('artifact_versions', {
  id: serial('id').primaryKey(),
  artifactId: integer('artifact_id').references(() => artifacts.id, { onDelete: 'cascade' }).notNull(),
  versionNumber: integer('version_number').notNull(),
  canonicalContentJson: jsonb('canonical_content_json').notNull(), // Canonical JSON document tree
  changeDescription: text('change_description'),
  createdById: integer('created_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Artifact Projections (Export Formats)
export const artifactProjections = pgTable('artifact_projections', {
  id: serial('id').primaryKey(),
  artifactVersionId: integer('artifact_version_id').references(() => artifactVersions.id, { onDelete: 'cascade' }).notNull(),
  format: text('format').notNull(), // 'docx', 'xlsx', 'pptx', 'pdf', 'google_doc', 'google_sheet', 'google_slide'
  storagePath: text('storage_path'), // Supabase Storage URI if binary file
  externalResourceId: text('external_resource_id'), // Google Drive file ID if exported to Google
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. Knowledge Sources (Top-Level Provenance)
export const knowledgeSources = pgTable('knowledge_sources', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  departmentId: integer('department_id').references(() => departments.id),
  ownerUserId: integer('owner_user_id').references(() => users.id).notNull(),
  sourceName: text('source_name').notNull(),
  sourceType: text('source_type').notNull(), // 'upload_pdf', 'upload_docx', 'upload_xlsx', 'google_drive_doc', 'manual_entry', 'web_link'
  sourceUri: text('source_uri'),
  category: text('category').notNull(), // 'policy', 'handbook', 'curriculum', 'financial_fee', 'staffing'
  visibility: visibilityEnum('visibility').default('school_wide').notNull(),
  currentVersionNumber: integer('current_version_number').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 11. Knowledge Source Versions (Content Hashes & Provenance Tracking)
export const knowledgeSourceVersions = pgTable('knowledge_source_versions', {
  id: serial('id').primaryKey(),
  sourceId: integer('source_id').references(() => knowledgeSources.id, { onDelete: 'cascade' }).notNull(),
  versionNumber: integer('version_number').notNull(),
  contentHash: text('content_hash').notNull(), // SHA-256 prevents redundant re-processing
  rawStoragePath: text('raw_storage_path'),
  extractedText: text('extracted_text'),
  processingStatus: processingStatusEnum('processing_status').default('pending').notNull(),
  processingError: text('processing_error'),
  effectiveStartDate: timestamp('effective_start_date'),
  effectiveEndDate: timestamp('effective_end_date'),
  isApproved: boolean('is_approved').default(false).notNull(),
  approvedById: integer('approved_by_id').references(() => users.id),
  approvedAt: timestamp('approved_at'),
  isCurrent: boolean('is_current').default(true).notNull(),
  supersededAt: timestamp('superseded_at'),
  supersededById: integer('superseded_by_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 12. Knowledge Chunks (PostgreSQL pgvector Semantic Search)
export const knowledgeChunks = pgTable('knowledge_chunks', {
  id: serial('id').primaryKey(),
  sourceVersionId: integer('source_version_id').references(() => knowledgeSourceVersions.id, { onDelete: 'cascade' }).notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }), // pgvector column (dimension matches deployment config)
  metadata: jsonb('metadata').$type<{
    heading?: string;
    pageNumber?: number;
    section?: string;
    locationReference?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('knowledge_chunks_embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
]);

// 13. Standards (Reusable Institutional Conventions)
export const standards = pgTable('standards', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  sector: sectorEnum('sector').notNull(),
  scope: text('scope').default('school_wide').notNull(),
  departmentId: integer('department_id').references(() => departments.id),
  description: text('description'),
  currentVersionNumber: integer('current_version_number').default(1).notNull(),
  status: standardStatusEnum('status').default('approved').notNull(),
  ownerUserId: integer('owner_user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 14. Standard Versions (Reusable Structural Rules)
export const standardVersions = pgTable('standard_versions', {
  id: serial('id').primaryKey(),
  standardId: integer('standard_id').references(() => standards.id, { onDelete: 'cascade' }).notNull(),
  versionNumber: integer('version_number').notNull(),
  structureSpec: jsonb('structure_spec').$type<{
    sections: { title: string; required: boolean; guidance?: string }[];
    formatting: { font?: string; primaryColor?: string; orientation?: 'portrait' | 'landscape' };
    formulas?: { cellTarget: string; formulaExpression: string; description: string }[];
    slideCountTarget?: number;
    toneVoice?: string;
    standardDisclaimers?: string[];
  }>().notNull(),
  exemplarArtifactId: integer('exemplar_artifact_id').references(() => artifacts.id),
  changeNotes: text('change_notes'),
  approvedById: integer('approved_by_id').references(() => users.id),
  isCurrent: boolean('is_current').default(true).notNull(),
  supersededAt: timestamp('superseded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 15. Previous Work Registry (Reference & Lineage)
export const previousWork = pgTable('previous_work', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  artifactId: integer('artifact_id').references(() => artifacts.id, { onDelete: 'cascade' }).notNull(),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  summary: text('summary'),
  archived: boolean('archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 16. Calendar Events (Scheduled appointments & meetings)
export const calendarEvents = pgTable('calendar_events', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  isAllDay: boolean('is_all_day').default(false).notNull(),
  googleEventId: text('google_event_id'),
  googleCalendarId: text('google_calendar_id'),
  syncStatus: syncStatusEnum('sync_status').default('synced').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 17. Tasks (Actionable work items with statuses)
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  creatorUserId: integer('creator_user_id').references(() => users.id).notNull(),
  assigneeUserId: integer('assignee_user_id').references(() => users.id),
  departmentId: integer('department_id').references(() => departments.id),
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').default('pending').notNull(),
  priority: text('priority').default('medium').notNull(), // 'low', 'medium', 'high', 'urgent'
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  associatedArtifactId: integer('associated_artifact_id').references(() => artifacts.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 18. Reminders (Alerts & notifications bound to tasks, events, or standalone)
export const reminders = pgTable('reminders', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
  calendarEventId: integer('calendar_event_id').references(() => calendarEvents.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  triggerTime: timestamp('trigger_time').notNull(),
  deliveryStatus: text('delivery_status').default('pending').notNull(), // 'pending', 'sent', 'dismissed', 'snoozed'
  recurrenceRule: text('recurrence_rule'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 19. Google Workspace Integrations (User-Specific OAuth Credentials)
export const googleIntegrations = pgTable('google_integrations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  schoolId: integer('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  googleEmail: text('google_email').notNull(),
  encryptedRefreshToken: text('encrypted_refresh_token').notNull(),
  authorizedScopes: jsonb('authorized_scopes').$type<string[]>().notNull(),
  isConnected: boolean('is_connected').default(true).notNull(),
  lastSyncAt: timestamp('last_sync_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 20. Google Resources (Mapped External Files & Documents)
export const googleResources = pgTable('google_resources', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  googleFileId: text('google_file_id').notNull(),
  title: text('title').notNull(),
  mimeType: text('mime_type').notNull(),
  webViewLink: text('web_view_link'),
  lastKnownExternalVersion: text('last_known_external_version'),
  lastKnownModifiedTime: timestamp('last_known_modified_time'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 21. Sync Records (Groundwork for Controlled Sync & Conflict Surface)
export const syncRecords = pgTable('sync_records', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  artifactId: integer('artifact_id').references(() => artifacts.id, { onDelete: 'cascade' }).notNull(),
  googleResourceId: integer('google_resource_id').references(() => googleResources.id, { onDelete: 'cascade' }).notNull(),
  lastImportedVersion: integer('last_imported_version'),
  lastExportedVersion: integer('last_exported_version'),
  syncDirection: text('sync_direction').default('export_to_google').notNull(),
  syncStatus: syncStatusEnum('sync_status').default('synced').notNull(),
  conflictStatus: text('conflict_status').default('none').notNull(), // 'none', 'diverged', 'deleted_externally'
  conflictDetails: jsonb('conflict_details').$type<{
    internalModifiedAt: string;
    externalModifiedAt: string;
    diffSummary?: string;
  }>(),
  lastSyncedAt: timestamp('last_synced_at').defaultNow().notNull(),
});

// 22. Action Confirmations (Harden Challenge Token Storage: Store Hash Only)
export const actionConfirmations = pgTable('action_confirmations', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  actionType: text('action_type').notNull(), // 'send_email', 'delete_artifact', 'overwrite_standard', 'share_external'
  actionTargetId: text('action_target_id').notNull(),
  challengeTokenHash: text('challenge_token_hash').notNull().unique(), // Secure SHA-256 hash of random challenge
  payloadHash: text('payload_hash').notNull(), // SHA-256 of bound payload elements
  actionPayloadJson: jsonb('action_payload_json').notNull(), // Detailed params
  status: confirmationStatusEnum('status').default('pending').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  confirmedAt: timestamp('confirmed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 23. User Preferences & Personal Memory
export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  preferredDocumentFormat: text('preferred_document_format').default('docx').notNull(),
  preferredEmailTone: text('preferred_email_tone').default('formal').notNull(),
  customInstructions: text('custom_instructions'),
  ambientSuggestionsEnabled: boolean('ambient_suggestions_enabled').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 24. User Dynamic UI Configuration
export const userUiPreferences = pgTable('user_ui_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  layoutPreset: text('layout_preset').default('classic_canvas').notNull(),
  themeMode: text('theme_mode').default('light').notNull(),
  density: text('density').default('comfortable').notNull(),
  sidebarPosition: text('sidebar_position').default('left').notNull(),
  sidebarWidthPx: integer('sidebar_width_px').default(260).notNull(),
  accentPalette: text('accent_palette').default('navy').notNull(),
  typographyScale: text('typography_scale').default('standard').notNull(),
  visibleSidebarSections: jsonb('visible_sidebar_sections').$type<string[]>().default(['chats', 'standards', 'knowledge', 'calendar']).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 25. Immutable Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').references(() => schools.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  payloadDigest: text('payload_digest'),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
