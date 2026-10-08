# School AI (V0.1) — Final Architecture & Implementation Plan

> **Architectural Source of Truth — Locked for V0.1 Implementation**  
> *Core Principle: "The user talks. The AI understands. The interface quietly adapts."*

---

## 1. Final Architecture Summary

School AI is an AI-first school administration workspace engineered to make complex administrative workflows completely straightforward for ordinary school staff (administrators, bursars, department heads, registrars, and teachers).

The system adheres strictly to the core principle:
- **The user talks**: Natural conversation is the primary interaction medium for queries, generation, and updates.
- **The AI understands**: The system classifies administrative intent, retrieves verified institutional context, selects appropriate deterministic and generative tools, and plans execution.
- **The interface quietly adapts**: Screen real estate is preserved through a debloated conversational layout; an adaptive inspector glides open only when documents, spreadsheets, presentations, emails, or standards require inspection, editing, or confirmation.

### Architectural Invariants
1. **Model & Provider Independence**: The platform is decoupled from specific model names or vendors. Capabilities are requested by capability class (`AI_MODEL_FAST`, `AI_MODEL_REASONING`, etc.) and resolved strictly via deployment configuration. Model IDs are never hardcoded in application logic.
2. **Canonical Internal Ownership**: School AI owns its relational database (Supabase PostgreSQL with `pgvector`), storage, and canonical artifact representation. Google Workspace is a connected external workspace, not the sole source of truth.
3. **Decoupled Identity & Permissions**: Job titles and departmental contexts are metadata; permissions are governed by explicit authorization levels (`owner`, `admin`, `member`, `restricted_member`, `viewer`) and evaluated through a multi-factor policy engine.
4. **Defense-in-Depth Authorization**: The AI model is never the final authority on permissions or execution. The backend security gateway independently validates every data access and tool invocation before database operations take place. Supabase Row Level Security (RLS) acts as database-level defense-in-depth.
5. **Payload-Bound Single-Use Confirmation**: Autonomous execution is permitted only for safe, non-destructive actions. Irreversible or externally visible actions (sending emails, deleting records, overwriting standards) require a cryptographically secure, payload-bound confirmation challenge stored only as a secure hash in the database.
6. **Separation of Temporal Entities**: Calendar events (scheduled appointments), tasks (actionable work items with statuses), and reminders (alerts/notifications) are distinct, first-class domain models.
7. **Clean Artifact Sectors**: Canonical artifacts strictly encompass `document`, `spreadsheet`, `presentation`, and `email`. PDF is an export/projection format, while calendar, tasks, and reminders are dedicated domain entities.
8. **Controlled External Sync in V0.1**: Google Drive and Google Calendar operate under explicit, user-triggered import/export and update workflows with external version tracking and visual conflict surfacing. Continuous background two-way synchronization is reserved for future versions.
9. **Full Knowledge Provenance**: Knowledge retrieval preserves exact source, version, page, section, and approval status metadata from ingestion through to conversational citation.

---

## 2. Complete System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER (REACT 19 + VITE)                                │
│                                                                                                 │
│   ┌─────────────────────┐  ┌─────────────────────────────────────┐  ┌────────────────────────┐  │
│   │  Debloated Sidebar  │  │      Central Conversation Canvas    │  │   Adaptive Inspector   │  │
│   │  - Chats            │  │      - Natural Language Stream      │  │   (On-Demand Drawer)   │  │
│   │  - Previous Work    │  │      - Audio / Voice Input          │  │   - Canonical Preview  │  │
│   │  - School Knowledge │  │      - Ambient Suggestion Chips     │  │   - Grid Spreadsheet   │  │
│   │  - Standards        │  │      - Action Confirmation Cards    │  │   - Slide Deck Viewer  │  │
│   │  - Calendar & Tasks │  │      - Document & File Dropper      │  │   - Email Staging Card │  │
│   │  - Dynamic Settings │  │      - Source Citation Popovers     │  │   - Conflict Diff View │  │
│   └──────────┬──────────┘  └──────────────────┬──────────────────┘  └───────────┬────────────┘  │
│              │                                │                                 │               │
│              └────────────────────────────────┼─────────────────────────────────┘               │
│                                               ▼                                                 │
│                                 API Client & Supabase Session                                   │
└───────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                │ HTTPS / SSE / WebSockets
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              APPLICATION SERVER (NODE.JS + EXPRESS + TSX)                       │
│                                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                    Security Gateway & Multi-Tenant Authorization Middleware               │  │
│  │                    - Supabase JWT Session Validation                                      │  │
│  │                    - Multi-Factor Policy Engine (Ownership, Visibility, Department, Role) │  │
│  │                    - Payload-Bound Challenge-Hash Token Verification                      │  │
│  └────────────────────────────────────────────┬──────────────────────────────────────────────┘  │
│                                               │                                                 │
│       ┌───────────────────────────────────────┼──────────────────────────────────────┐          │
│       ▼                                       ▼                                      ▼          │
│  ┌──────────────────────────┐   ┌──────────────────────────┐   ┌─────────────────────────────┐  │
│  │     AI Orchestrator      │   │   Deterministic Engines  │   │  External Integrations Hub  │  │
│  │  - Intent Understanding  │   │   - Canonical Doc Parser │   │  - Google OAuth Manager     │  │
│  │  - Config-Driven Router  │   │   - DOCX Export (`docx`) │   │  - Google Drive / Docs /    │  │
│  │  - Context Assembler     │   │   - XLSX Export (`excel`)│   │    Sheets / Slides Client   │  │
│  │  - Provenance Preserver  │   │   - PPTX Export (`pptx`) │   │  - Controlled Calendar Sync │  │
│  │  - Machine Tool Registry │   │   - PDF Generator        │   │  - Gmail Staging / Send Gate│  │
│  │  - Risk Classifier Guard │   │   - Chunk & Hash Parser  │   │  - School AI Sandbox Mode   │  │
│  └────────────┬─────────────┘   └─────────────┬────────────┘   │  - Conflict Detector        │  │
│               │                               │                └──────────────┬──────────────┘  │
│               └───────────────────────────────┼───────────────────────────────┘                 │
│                                               ▼                                                 │
│                             Drizzle ORM Repository Layer (Type-Safe)                            │
└───────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                │ Direct PostgreSQL Connection Pool
                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SUPABASE PLATFORM (DATA & AUTH LAYER)                           │
│                                                                                                 │
│   ┌────────────────────────┐  ┌───────────────────────────────┐  ┌──────────────────────────┐   │
│   │     Supabase Auth      │  │     PostgreSQL Database       │  │     Supabase Storage     │   │
│   │  - Email / Password    │  │  - Multi-Tenant Domain Schema │  │  - Knowledge Source Files│   │
│   │  - Google Sign-In      │  │  - pgvector Semantic Search   │  │  - Standards Exemplars   │   │
│   │  - JWT Session Issuance│  │  - Row Level Security (RLS)   │  │  - Generated Artifacts   │   │
│   │  - Token Refresh Flow  │  │  - Immutable Audit Logging    │  │  - School Brand Assets   │   │
│   └────────────────────────┘  └───────────────────────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Final Technology Stack

| Component | Technology | Role & Design Rationale |
| :--- | :--- | :--- |
| **Frontend Core** | React 19 + TypeScript + Vite | Modern reactive client with functional style, strict typing, and zero unnecessary re-renders. |
| **Styling & UI Tokens** | Tailwind CSS v4 | Utility-first styling (`@import "tailwindcss";`), custom CSS tokens, strict anti-AI slop compliance. |
| **Motion & Micro-interactions** | Motion (`motion/react`) | Fluid, compositor-only animations for drawer reveals and startup visual identity. |
| **Icons** | Lucide React | Clean, functional, accessible iconography. |
| **Backend Runtime** | Node.js + Express + TSX | Full-stack server proxy mounting Vite middlewares in dev; server-side secret isolation. |
| **Primary Backend & DB**| Supabase (PostgreSQL 15+) | Unified relational engine, Supabase Auth, Row Level Security, and Supabase Storage. |
| **Vector Engine** | PostgreSQL `pgvector` Extension | Native vector column storage and HNSW indexing for semantic knowledge retrieval. |
| **ORM & Migrations** | Drizzle ORM + Drizzle Kit | Compile-time SQL type safety, automated migrations, zero raw SQL injection risks. |
| **AI Provider Abstraction**| Pluggable Provider Interface | Capability-based adapter architecture supporting any provider through runtime configuration. |
| **Document Engines** | `docx`, `exceljs`, `pptxgenjs` | Deterministic generation of Microsoft Office & PDF binaries preserving exact formulas. |
| **Workspace Integration**| Google APIs Node.js Client | Modular client for Drive, Docs, Sheets, Slides, Gmail, and Calendar with server-side OAuth. |
| **Voice Processing** | Web Speech API + Server Fallback | Instant zero-latency STT in browser with fallback to configurable server-side transcription. |

---

## 4. Final Domain Model & Complete Database Schema

The complete relational schema (implemented via Drizzle ORM in `src/db/schema.ts`) uses domain-driven entities with PostgreSQL `pgvector`:

```typescript
import { pgTable, text, serial, timestamp, boolean, jsonb, integer, index, pgEnum, customType } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const permissionLevelEnum = pgEnum('permission_level', [
  'owner',
  'admin',
  'member',
  'restricted_member',
  'viewer'
]);

export const visibilityEnum = pgEnum('visibility_level', [
  'private',
  'department',
  'school_wide',
  'restricted'
]);

// Clean Artifact Sectors (Calendar, Tasks, Reminders are separate domain tables)
export const sectorEnum = pgEnum('sector_type', [
  'document',
  'spreadsheet',
  'presentation',
  'email'
]);

export const processingStatusEnum = pgEnum('processing_status', [
  'pending',
  'processing',
  'ready',
  'failed',
  'superseded'
]);

export const standardStatusEnum = pgEnum('standard_status', [
  'draft',
  'approved',
  'superseded',
  'archived'
]);

export const confirmationStatusEnum = pgEnum('confirmation_status', [
  'pending',
  'confirmed',
  'rejected',
  'expired'
]);

export const syncStatusEnum = pgEnum('sync_status', [
  'synced',
  'pending_upload',
  'pending_download',
  'conflict',
  'disconnected'
]);

export const taskStatusEnum = pgEnum('task_status', [
  'pending',
  'in_progress',
  'completed',
  'cancelled'
]);

// Custom pgvector type for PostgreSQL pgvector extension
export const vector = customType<{ data: number[]; config: { dimensions: number } }>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 1536})`;
  },
  fromDriver(value: string | number[]): number[] {
    if (Array.isArray(value)) return value;
    return JSON.parse(value.replace(/\[/g, '[').replace(/\]/g, ']'));
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
}, (table) => ({
  embeddingIndex: index('knowledge_chunks_embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
}));

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
```

---

## 5. Formal AI Orchestration & Tool Security Contracts

### Typed Orchestration Contracts with Provenance
```typescript
// AI Request & Context
export interface AIRequest {
  conversationId: number;
  schoolId: number;
  userId: number;
  userPermissionLevel: 'owner' | 'admin' | 'member' | 'restricted_member' | 'viewer';
  departmentId?: number;
  prompt: string;
  activeArtifactId?: number;
  sectorContext: 'document' | 'spreadsheet' | 'presentation' | 'email';
}

// Full Knowledge Provenance Item
export interface KnowledgeRetrievalItem {
  sourceId: number;
  sourceVersionId: number;
  sourceName: string;
  versionNumber: number;
  text: string;
  pageNumber?: number;
  section?: string;
  locationReference?: string;
  effectiveDate?: string;
  isApproved: boolean;
  isCurrent: boolean;
  isSuperseded: boolean;
  relevanceScore: number;
}

export interface RetrievalResult {
  knowledgeItems: KnowledgeRetrievalItem[];
  standards: { standardId: number; name: string; structureSpec: Record<string, any> }[];
  previousWork: { artifactId: number; title: string; summary: string }[];
  userPreferences: Record<string, any>;
}

export interface AIPlan {
  intent: string;
  requiredCapabilities: ('fast' | 'reasoning' | 'vision' | 'embedding')[];
  proposedTools: { toolId: string; args: Record<string, any> }[];
}

// Tool Security Definition
export interface AIToolDefinition {
  toolId: string;
  description: string;
  category: 'READ' | 'WRITE_SAFE' | 'WRITE_REQUIRES_CONFIRMATION';
  requiredPermissionLevel: 'owner' | 'admin' | 'member' | 'restricted_member' | 'viewer';
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  hasExternalSideEffects: boolean;
  auditEventType: string;
  idempotent: boolean;
}

// Multi-Factor Policy Evaluation
export interface PolicyEvaluationContext {
  userId: number;
  schoolId: number;
  permissionLevel: 'owner' | 'admin' | 'member' | 'restricted_member' | 'viewer';
  userDepartmentId?: number;
  resourceOwnerId?: number;
  resourceVisibility?: 'private' | 'department' | 'school_wide' | 'restricted';
  resourceDepartmentId?: number;
  explicitGrant?: 'view' | 'comment' | 'edit';
  action: 'read' | 'write' | 'delete' | 'share' | 'confirm';
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  reason?: string;
}
```

### The Inviolable Security & Orchestration Pipeline
```
USER PROMPT
     │
     ▼
1. UNDERSTAND INTENT & CAPABILITIES
     │
     ▼
2. BUILD CONTEXT & RETRIEVE AUTHORIZED INFORMATION
   - Knowledge Sources (Filtered by Policy Engine)
   - Official Approved Standards
   - Permitted Previous Work & User Preferences
   - Preserve Provenance (sourceId, version, page, section)
     │
     ▼
3. GENERATE PLAN & PROPOSE TOOLS
     │
     ▼
4. BACKEND MULTI-FACTOR POLICY CHECK (Mandatory, Independent of LLM)
   - Evaluates: User, Membership, Permission Level, Resource Ownership,
     Visibility, Department, Target Action, Explicit Grants
     │
     ├── REJECTED ───────────► Return Natural English Error Notice
     │
     ▼
5. RISK CLASSIFICATION & SAFETY GATE
     │
     ├── WRITE_SAFE or READ ──► 6. EXECUTE DETERMINISTIC TOOL ──┐
     │                                                          │
     └── WRITE_REQUIRES_CONFIRMATION                            │
            │                                                   │
            ▼                                                   │
         Issue Bound Challenge Token (Store Hash Only)          │
         & Render Confirmation Card                             │
         (Awaiting User Explicit Click)                         │
            │                                                   │
            ▼                                                   │
         Verify Challenge Hash & Payload Hash                   │
            │                                                   │
            └───────────────────────────────────────────────────┤
                                                                ▼
                                                     7. VERIFY RESULT
                                                                │
                                                                ▼
                                                     8. PERSIST ARTIFACT
                                                        & LOG AUDIT EVENT
                                                                │
                                                                ▼
                                                     9. DELIVER STREAMED
                                                        RESPONSE TO USER
                                                        WITH PROVENANCE
```

---

## 6. Model & Provider Independence Architecture

### Configurable Model Capabilities
The codebase contains **zero hardcoded model IDs**. All application logic references configurable capability slots:
- `AI_PROVIDER`: Configured primary provider identifier (`gemini`, `xai`, `anthropic`, `local`).
- `AI_MODEL_FAST`: Identifier for high-throughput conversation and tool planning.
- `AI_MODEL_REASONING`: Identifier for deep policy parsing and standard extraction.
- `AI_MODEL_VISION`: Identifier for visual document or chart analysis.
- `AI_MODEL_EMBEDDING`: Identifier for semantic chunk embeddings.
- `AI_MODEL_TRANSCRIPTION`: Identifier for audio/voice memo transcription.
- `AI_MODEL_TTS`: Identifier for text-to-speech reading.

### Centralized Provider Configuration
Model IDs are defined strictly in deployment environment configuration or a central configuration file. Any IDs shown below are illustrative placeholders and must never be hardcoded into application source files:

```json
{
  "activeProvider": "gemini",
  "fallbackProvider": "xai",
  "providers": {
    "gemini": {
      "enabled": true,
      "apiKeyEnv": "GEMINI_API_KEY",
      "capabilities": {
        "fast": "CONFIG_GEMINI_FAST_MODEL_ID",
        "reasoning": "CONFIG_GEMINI_REASONING_MODEL_ID",
        "vision": "CONFIG_GEMINI_VISION_MODEL_ID",
        "embedding": "CONFIG_GEMINI_EMBEDDING_MODEL_ID",
        "transcription": "CONFIG_GEMINI_TRANSCRIPTION_MODEL_ID",
        "tts": "CONFIG_GEMINI_TTS_MODEL_ID"
      }
    },
    "xai": {
      "enabled": false,
      "apiKeyEnv": "XAI_API_KEY",
      "baseUrl": "https://api.x.ai/v1",
      "capabilities": {
        "fast": "CONFIG_GROK_FAST_MODEL_ID",
        "reasoning": "CONFIG_GROK_REASONING_MODEL_ID"
      }
    }
  }
}
```

### Provider Capability Interface
```typescript
export interface ModelProvider {
  providerId: string;
  supportedCapabilities: ('fast' | 'reasoning' | 'vision' | 'embedding' | 'transcription' | 'tts')[];
  isAvailable(): Promise<boolean>;
  generateText(capability: string, messages: any[], tools?: AIToolDefinition[]): Promise<any>;
  streamText(capability: string, messages: any[], onChunk: (chunk: string) => void): Promise<any>;
  embed(texts: string[]): Promise<number[][]>;
  transcribeAudio?(audioBuffer: Buffer, mimeType: string): Promise<string>;
  synthesizeSpeech?(text: string): Promise<Buffer>;
}
```

---

## 7. Google Workspace Integration & V0.1 Controlled Sync Strategy

### V0.1 Scope: Controlled External Workspace
Continuous background synchronization is explicitly deferred to future roadmap releases to protect data integrity and avoid sync storm complexity.

In V0.1:
- **School AI is the Primary Canonical Store**: All documents, budgets, slide decks, and drafts exist first as canonical JSON artifacts in School AI.
- **Explicit User-Triggered Actions**:
  1. *Search Drive*: Browse authorized Google Drive files.
  2. *Import to School AI*: Downloads a Drive file, extracts text/data, and stores it as a canonical artifact.
  3. *Export to Google*: Compiles a School AI artifact into a native Google Doc, Google Sheet, or Google Slide and records the mapping in `sync_records`.
  4. *Explicit Update*: Staff can deliberately push an updated School AI version to the linked Google Doc or pull an external update.
- **Controlled Google Calendar Operations in V0.1**:
  - Explicit event creation in Google Calendar upon user request.
  - Explicit update of linked Google events.
  - Tracking of external `googleEventId` and modified timestamps.
  - Manual import/refresh of calendar items.
  - **No continuous background synchronization in V0.1**.
- **Conflict Detection & Visual Surface**:
  - The system records `lastKnownExternalVersion` and compares timestamps.
  - If both sides diverge, the system marks `conflict_status = 'diverged'`, leaves both versions intact, and displays a prominent warning in the Adaptive Inspector.
- **UI Boundary Distinction**:
  - The UI clearly labels artifacts:
    - `Stored in School AI`
    - `Connected to Google Drive` / `Connected to Google Calendar`

---

## 8. Gmail Safety Architecture & Cryptographic Confirmation

### Strict Draft vs. Send Invariant
- **Draft Staging**: The AI is authorized to call `stage_email_draft` autonomously. This creates a staged draft in School AI (and optionally in Gmail drafts via `gmail.users.drafts.create`).
- **Send Execution**: The AI is **strictly forbidden** from calling `send_email` autonomously.

### Hardened Confirmation Token Architecture
1. The backend stages the email and computes a SHA-256 payload digest binding:
   $$\text{Digest} = \text{SHA256}(\text{sender} + \text{recipients} + \text{subject} + \text{body} + \text{attachments})$$
2. A cryptographically secure random challenge (32 bytes, hex-encoded) is generated:
   $$\text{ChallengeToken} \leftarrow \text{crypto.randomBytes}(32).\text{toString('hex')}$$
3. The server computes the challenge hash:
   $$\text{ChallengeTokenHash} = \text{SHA256}(\text{ChallengeToken})$$
4. The database stores **only the hash** (`challenge_token_hash`), the `payload_hash`, user ID, school ID, action type, and a 15-minute expiration timestamp in `action_confirmations`. The raw challenge is never stored in plaintext.
5. The raw `ChallengeToken` is returned over secure HTTPS to the authenticated client for presentation in the **Email Confirmation Card**.
6. When the user manually clicks `Approve & Send Email`, the client sends `ChallengeToken` back to the server.
7. The backend:
   - Hashes the incoming challenge and locates the record by `challenge_token_hash`.
   - Validates that status is `pending` and `expires_at > NOW()`.
   - Re-verifies the user and school ownership.
   - Re-computes the payload hash to guarantee the email was not altered after confirmation.
   - Marks status as `confirmed` (single-use enforcement).
8. Only upon successful verification does the backend invoke `gmail.users.messages.send`.

---

## 9. Temporal Separation: Calendar Events, Tasks, and Reminders

Calendar events, tasks, and reminders are modeled as separate domain entities with dedicated schemas and APIs:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TEMPORAL DOMAIN ENTITIES                        │
├────────────────────────────────┬───────────────────────────────────────┤
│ calendar_events                │ - start_time, end_time, location      │
│ (Appointments & Meetings)      │ - Optional explicit Google sync       │
├────────────────────────────────┼───────────────────────────────────────┤
│ tasks                          │ - title, description, priority        │
│ (Actionable Work Items)        │ - status: pending, in_progress, done  │
│                                │ - due_date, assignee, associated_id   │
├────────────────────────────────┼───────────────────────────────────────┤
│ reminders                      │ - trigger_time, delivery_status       │
│ (Alerts & Notifications)       │ - Foreign key to task_id or event_id  │
│                                │ - Standalone alerts with recurrence   │
└────────────────────────────────┴───────────────────────────────────────┘
```

A prompt such as:
> *"Remind me next Monday at 8 AM to inspect the science lab inventory."*

Creates:
1. `Task`: Title = "Inspect science lab inventory", Status = `pending`, DueDate = "Monday 8:00 AM".
2. `Reminder`: Title = "Inspect science lab inventory", TriggerTime = "Monday 8:00 AM", TaskId = `<task.id>`.

A prompt such as:
> *"Schedule the Governors Board Meeting for Thursday from 2 PM to 4 PM."*

Creates a `CalendarEvent`: Title = "Governors Board Meeting", Start = "Thursday 2:00 PM", End = "Thursday 4:00 PM".

---

## 10. School Knowledge Provenance & pgvector Semantic Search

### Storage & Vector Strategy
1. **Extension Setup**: `CREATE EXTENSION IF NOT EXISTS vector;` enabled on PostgreSQL.
2. **Vector Column**: `embedding vector(1536)` defined on `knowledge_chunks` (dimension matching configured embedding capability).
3. **Index Strategy**: HNSW index using cosine distance:
   ```sql
   CREATE INDEX knowledge_chunks_embedding_idx ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);
   ```
4. **Dimension Migration Strategy**: If embedding configuration changes dimensions, an automated migration adds a versioned vector column (or a new chunk partition), and documents are re-indexed based on content hashes.

### End-to-End Provenance Pipeline
```
INGESTION (PDF / DOCX / XLSX / Web)
      │
      ▼
CONTENT HASH (SHA-256 prevents duplicate parsing)
      │
      ▼
CHUNKING (Preserves: sourceId, versionNumber, heading, pageNumber, section)
      │
      ▼
EMBEDDING (Computed via AI_MODEL_EMBEDDING -> vector column)
      │
      ▼
RETRIEVAL (Policy-checked cosine similarity -> RetrievalResult)
      │
      ▼
AI CONTEXT (Context tags include exact source metadata)
      │
      ▼
RESPONSE CITATION: "According to the Staff Handbook (v2, Section 4.1, Page 12)..."
```

---

## 11. Multi-Factor Policy Engine & Defense-in-Depth Security

### The Five Basic Permission Levels
- `owner`: School account owner; full institutional control.
- `admin`: School administrator; authorized to configure standards, departments, and memberships.
- `member`: Standard school staff; creates personal artifacts, accesses school-wide and departmental knowledge.
- `restricted_member`: Staff with constrained department-only access.
- `viewer`: Read-only access to authorized school resources.

### Policy Evaluation Rules (Not a Simple Numerical Hierarchy)
The backend authorization engine evaluates multi-factor rules:
1. **School Tenant Match**: User must belong to the school matching `resource.school_id`.
2. **Resource Ownership**: The creator of a resource has full access to their own `private` resources regardless of permission level.
3. **Visibility Evaluation**:
   - `private`: Access granted only to the owner.
   - `department`: Access granted if user's department matches resource's department.
   - `school_wide`: Access granted to any active member of the school.
   - `restricted`: Access granted only if user has an explicit entry in `sharing_grants`.
4. **Tool Permission Check**: A tool marked `WRITE_REQUIRES_CONFIRMATION` or `admin`-required checks school policy and user level independently.
5. **Defense-in-Depth**:
   - **Layer 1**: Backend Express middleware validates JWT and applies the Policy Engine before calling any tool or repository.
   - **Layer 2**: Supabase Row Level Security (RLS) policies enforce database isolation.
   - **Layer 3**: Privileged service-role credentials remain strictly server-side and are never exposed to the client.

---

## 12. Cost Control Strategy

1. **Deterministic-First**: Document formatting, formula evaluation, slide masters, and file conversions run in pure TypeScript with zero AI token cost.
2. **Permission-Filtered Retrieval**: Chunks are pruned before prompt assembly, keeping model contexts lean.
3. **Capability-Tiered Routing**: Queries route to `AI_MODEL_FAST` by default, reserving `AI_MODEL_REASONING` for complex standard synthesis.
4. **Permanent Embedding Cache**: Knowledge chunks are hashed and stored in PostgreSQL; embeddings are generated exactly once per version.
5. **Configurable Rate Limits & Token Quotas**: Server-side request budgets per school tenant prevent accidental runaway usage.

---

## 13. Final V0.1 Scope vs. Roadmap

### V0.1 Core Capabilities (Production-Ready)
- Multi-school tenant isolation with Supabase PostgreSQL, RLS, and `pgvector`.
- Supabase Authentication (Email/Password and Google Sign-In).
- Provider-independent AI orchestration with configured capability mapping.
- Conversational workspace with streaming responses and voice STT.
- Four core canonical sectors: Documents, Spreadsheets, Presentations, Emails.
- Canonical internal artifact model with deterministic export to DOCX, XLSX, PPTX, and PDF.
- School Knowledge repository with explicit source versions, content hashes, and semantic chunk retrieval with full provenance citations.
- Institutional Standards extraction, version tracking, and reusable formatting rules.
- Previous Work archive with non-destructive versioning.
- Explicit domain entities for Calendar Events, Tasks, and Reminders with natural language date parsing.
- Modular Google Workspace connection (Drive, Docs, Sheets, Slides, Gmail, Calendar) with explicit resource mapping, controlled sync, and conflict detection.
- Cryptographic challenge-hash confirmation gate for Gmail dispatch, external sharing, and record deletions.
- Offline School AI Sandbox Mode for testing without external services.
- Dynamic AI-controlled UI layout and theme configuration via validated schemas.
- Distinctive startup and progress animation visual identity.
- Tamper-evident audit logging for all compliance and security events.

### Explicit V0.1 Exclusions (Moved to V0.2/V1 Roadmap)
- Continuous background two-way synchronization for Google Drive and Google Calendar (V0.1 provides explicit import/export, mapping, and conflict surfacing).
- Real-time multi-cursor collaborative document editing.
- Native mobile app binaries (iOS / Android store packages).
- Tuition payment processing or credit card billing gateways.
- Direct SIS database wire sync (PowerSchool / SIMS API connections).

---

## 14. Remaining Operational Decisions

> [!NOTE]
> The technical architecture is fully locked and requires no further structural design. The following operational parameters are configured at deployment:
1. **Supabase Deployment Target**: Managed Supabase Cloud project credentials vs. self-hosted Supabase instance.
2. **Google OAuth Application**: Registration of the Google Cloud OAuth client ID and secret for staff Google Workspace linking.
3. **Initial School Profile**: Seed name, slug, and initial admin account credentials for first boot.
4. **Production Model Routing**: Setting the active capability mapping (`AI_MODEL_FAST`, `AI_MODEL_REASONING`, etc.) in deployment environment variables.
5. **School Usage Limits**: Optional maximum daily request quotas per school tenant.

---

## 15. Exact Build Order

The application will be constructed following this strict 13-phase implementation sequence:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 BUILD ORDER                                     │
│                                                                                 │
│  PHASE 1: Project Foundation & Core Configuration                               │
│    1. Install full-stack dependencies (`@supabase/supabase-js`, `drizzle-orm`, │
│       `drizzle-kit`, `pg`, `@types/pg`, `zod`, `docx`, `exceljs`, `pptxgenjs`). │
│    2. Configure `.env.example` and centralized environment config loaders.      │
│    3. Establish Tailwind CSS v4 design system, font tokens, and base layout.    │
│                                                                                 │
│  PHASE 2: Authentication & Multi-Tenancy Engine                                 │
│    4. Configure Supabase client and Auth listeners (Email/Password + Google).   │
│    5. Define core tenancy schema in `src/db/schema.ts` (schools, users,         │
│       departments, schoolMemberships with permissionLevel).                     │
│    6. Implement Express security gateway (`requireAuth`, `requireTenant`).      │
│    7. Seed initial school tenant and administrative test account.               │
│                                                                                 │
│  PHASE 3: Provider Abstraction & Model Configuration                            │
│    8. Configure deployment capability mapping (FAST, REASONING, EMBEDDING, etc.)│
│    9. Implement `ModelProvider` capability interface with runtime resolution.   │
│    10. Build provider adapters for configured primary and fallback engines.     │
│    11. Define conversations and messages schema.                                │
│    12. Build AI Orchestrator with streaming response pipeline.                  │
│                                                                                 │
│  PHASE 4: Database Vector Extension & Knowledge Provenance                      │
│    13. Configure PostgreSQL `pgvector` extension and HNSW index in Drizzle.     │
│    14. Implement knowledgeSources, versions, content hashing, and chunks.       │
│    15. Implement text extraction pipeline and semantic vector retrieval with    │
│        full provenance metadata (source, version, page, section).               │
│    16. Implement standards, standardVersions, and structural rule extraction.   │
│    17. Implement previousWork registry and lineage tracking.                    │
│                                                                                 │
│  PHASE 5: Deterministic Canonical Artifact Engines                              │
│    18. Define canonical artifact and artifactVersions schema (clean sectors:    │
│        document, spreadsheet, presentation, email).                             │
│    19. Build Document Engine: Canonical JSON -> `.docx` / `.pdf` / HTML preview.│
│    20. Build Spreadsheet Engine: Canonical JSON -> `.xlsx` with formula math.   │
│    21. Build Presentation Engine: Canonical JSON -> `.pptx` via `pptxgenjs`.    │
│                                                                                 │
│  PHASE 6: Multi-Factor Policy Engine & Tool Safety Registry                     │
│    22. Build Policy Evaluation Engine (Ownership, Visibility, Dept, Role).      │
│    23. Build machine-readable AIToolRegistry (READ, WRITE_SAFE, CONFIRMATION).   │
│    24. Enforce mandatory backend policy checks before any tool can execute.    │
│    25. Implement immutable auditLogs service and security logging.              │
│                                                                                 │
│  PHASE 7: Hardened Confirmation Security & Action Gate                          │
│    26. Implement actionConfirmations table storing SHA-256 challenge hash only. │
│    27. Build payload digest validator (sender, recipients, subject, body).      │
│    28. Implement Gmail draft staging and strict human confirmation sending gate.│
│                                                                                 │
│  PHASE 8: Google Workspace Integration & Controlled V0.1 Sync                   │
│    29. Build Google OAuth exchange and server-side token encryption store.      │
│    30. Build Drive, Docs, Sheets, and Slides API client connectors.             │
│    31. Implement googleResources, syncRecords, and visual conflict diff surface.│
│                                                                                 │
│  PHASE 9: Calendar Events, Tasks, and Reminders                                 │
│    32. Define calendarEvents, tasks, and reminders schema.                      │
│    33. Implement natural language date/time parser and entity dispatcher.       │
│    34. Implement controlled, explicit Google Calendar export/update handlers.   │
│                                                                                 │
│  PHASE 10: Frontend Experience & Adaptive Workspace                             │
│    35. Build original startup/loading animation with authentic milestones.      │
│    36. Build Top Bar Contract and Debloated Adaptive Sidebar.                   │
│    37. Build Central Conversation Canvas with voice input (Web Speech STT).     │
│    38. Build Adaptive Inspector (Docs, Sheets, Slides, Email Staging preview).  │
│    39. Build Action Confirmation Card component with user verification click.   │
│    40. Build Source Citation popovers displaying knowledge provenance.          │
│                                                                                 │
│  PHASE 11: Dynamic UI, Ambient AI & Sandbox Mode                                │
│    41. Implement userUiPreferences and Zod schema-validated configuration tool. │
│    42. Implement layout presets, density scales, and theme color tokens.        │
│    43. Build Ambient AI suggestion engine (contextual, non-intrusive chips).    │
│    44. Implement School AI Sandbox Mode for disconnected testing.               │
│                                                                                 │
│  PHASE 12: Security Hardening & Integration Verification                        │
│    45. Verify multi-school tenant isolation and RLS authorization boundaries.   │
│    46. Verify confirmation gate prevents any autonomous email dispatch.         │
│    47. Verify prompt injection resistance on uploaded school documents.         │
│    48. Verify responsive layout across Desktop (1440px), Tablet, and Mobile.    │
│                                                                                 │
│  PHASE 13: Compilation & Deployment Verification                                │
│    49. Run `compile_applet` and verify zero build or lint warnings.             │
│    50. Package application for production execution on Port 3000.               │
└─────────────────────────────────────────────────────────────────────────────────┘
```
