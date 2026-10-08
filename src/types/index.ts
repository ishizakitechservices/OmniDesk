/**
 * School AI (V0.1) — Core Domain Types and Orchestration Contracts
 * Strict type definitions for multi-tenancy, canonical artifacts, provenance,
 * policy evaluation, confirmation gates, and AI capabilities.
 */

// Basic Domain Enums
export type PermissionLevel = 'owner' | 'admin' | 'member' | 'restricted_member' | 'viewer';
export type VisibilityLevel = 'private' | 'department' | 'school_wide' | 'restricted';
export type SectorType = 'document' | 'spreadsheet' | 'presentation' | 'email';
export type ProcessingStatus = 'pending' | 'processing' | 'ready' | 'failed' | 'superseded';
export type StandardStatus = 'draft' | 'approved' | 'superseded' | 'archived';
export type ConfirmationStatus = 'pending' | 'confirmed' | 'rejected' | 'expired';
export type SyncStatus = 'synced' | 'pending_upload' | 'pending_download' | 'conflict' | 'disconnected';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// 1. Tenancy & Users
export interface School {
  id: number;
  slug: string;
  name: string;
  motto?: string;
  address?: string;
  timezone: string;
  academicYear: string;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    letterheadTemplate?: string;
  };
  settings?: {
    defaultDocFormat?: 'docx' | 'gdoc';
    sandboxEnabled?: boolean;
    dailyTokenBudget?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  supabaseUid: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Department {
  id: number;
  schoolId: number;
  name: string;
  code?: string;
  description?: string;
  createdAt: string;
}

export interface SchoolMembership {
  id: number;
  schoolId: number;
  userId: number;
  permissionLevel: PermissionLevel;
  jobTitle?: string; // Contextual attribute (e.g., "Bursar", "Head of Year 10")
  departmentId?: number;
  responsibilities?: string;
  workingContext?: Record<string, any>;
  joinedAt: string;
}

// 2. Conversations & Messaging
export interface Conversation {
  id: number;
  schoolId: number;
  userId: number;
  title: string;
  pinned: boolean;
  sectorContext: SectorType;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  conversationId: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  providerUsed?: string;
  modelCapabilityUsed?: string;
  toolInvocations?: ToolInvocationRecord[];
  requiresConfirmation?: boolean;
  confirmationId?: number;
  createdAt: string;
  ambientSuggestions?: AmbientSuggestion[];
  sourceCitations?: KnowledgeRetrievalItem[];
}

export interface ToolInvocationRecord {
  toolId: string;
  args: Record<string, any>;
  result?: any;
  status: 'executing' | 'success' | 'failed' | 'awaiting_confirmation';
}

export interface AmbientSuggestion {
  id: string;
  label: string;
  prompt: string;
  type: 'action' | 'standard' | 'calendar' | 'export';
}

// 3. Canonical Artifact Model
export interface Artifact {
  id: number;
  schoolId: number;
  creatorUserId: number;
  departmentId?: number;
  title: string;
  sector: SectorType;
  currentVersionNumber: number;
  visibility: VisibilityLevel;
  standardId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArtifactVersion {
  id: number;
  artifactId: number;
  versionNumber: number;
  canonicalContentJson: CanonicalContent;
  changeDescription?: string;
  createdById: number;
  createdAt: string;
}

export type CanonicalContent = 
  | CanonicalDocument 
  | CanonicalSpreadsheet 
  | CanonicalPresentation 
  | CanonicalEmailDraft;

export interface CanonicalDocument {
  type: 'document';
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
  sections: DocumentSection[];
}

export interface DocumentSection {
  id: string;
  heading: string;
  level: 1 | 2 | 3;
  paragraphs: string[];
  callout?: {
    type: 'info' | 'warning' | 'official_notice';
    text: string;
  };
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface CanonicalSpreadsheet {
  type: 'spreadsheet';
  title: string;
  sheets: SpreadsheetSheet[];
}

export interface SpreadsheetSheet {
  id: string;
  name: string;
  columns: { key: string; label: string; width?: number; format?: string }[];
  rows: Record<string, any>[];
  formulas?: Record<string, string>; // e.g., { "total_budget": "=SUM(C2:C10)" }
  summaryNotes?: string[];
}

export interface CanonicalPresentation {
  type: 'presentation';
  title: string;
  subtitle?: string;
  themeColor?: string;
  slides: PresentationSlide[];
}

export interface PresentationSlide {
  id: string;
  slideNumber: number;
  title: string;
  bulletPoints: string[];
  calloutText?: string;
  speakerNotes?: string;
  layout: 'title_slide' | 'content_split' | 'bullet_summary' | 'conclusion';
}

export interface CanonicalEmailDraft {
  type: 'email';
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  bodyHtml: string;
  bodyText: string;
  attachments?: { name: string; url?: string; artifactId?: number }[];
  isStaged: boolean;
  sentAt?: string;
}

export interface ArtifactProjection {
  id: number;
  artifactVersionId: number;
  format: 'docx' | 'xlsx' | 'pptx' | 'pdf' | 'google_doc' | 'google_sheet' | 'google_slide';
  storagePath?: string;
  externalResourceId?: string;
  createdAt: string;
}

// 4. School Knowledge & Provenance
export interface KnowledgeSource {
  id: number;
  schoolId: number;
  departmentId?: number;
  ownerUserId: number;
  sourceName: string;
  sourceType: 'upload_pdf' | 'upload_docx' | 'upload_xlsx' | 'google_drive_doc' | 'manual_entry' | 'web_link';
  sourceUri?: string;
  category: string;
  visibility: VisibilityLevel;
  currentVersionNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeSourceVersion {
  id: number;
  sourceId: number;
  versionNumber: number;
  contentHash: string; // SHA-256
  rawStoragePath?: string;
  extractedText?: string;
  processingStatus: ProcessingStatus;
  processingError?: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  isApproved: boolean;
  approvedById?: number;
  approvedAt?: string;
  isCurrent: boolean;
  supersededAt?: string;
  supersededById?: number;
  createdAt: string;
}

export interface KnowledgeChunk {
  id: number;
  sourceVersionId: number;
  chunkIndex: number;
  content: string;
  embedding?: number[]; // Represented via PostgreSQL pgvector in DB
  metadata?: {
    heading?: string;
    pageNumber?: number;
    section?: string;
    locationReference?: string;
  };
  createdAt: string;
}

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

// 5. School Standards & Previous Work
export interface Standard {
  id: number;
  schoolId: number;
  name: string;
  sector: SectorType;
  scope: string; // 'school_wide' or department ID
  departmentId?: number;
  description?: string;
  currentVersionNumber: number;
  status: StandardStatus;
  ownerUserId: number;
  createdAt: string;
  updatedAt: string;
}

export interface StandardVersion {
  id: number;
  standardId: number;
  versionNumber: number;
  structureSpec: {
    sections: { title: string; required: boolean; guidance?: string }[];
    formatting: { font?: string; primaryColor?: string; orientation?: 'portrait' | 'landscape' };
    formulas?: { cellTarget: string; formulaExpression: string; description: string }[];
    slideCountTarget?: number;
    toneVoice?: string;
    standardDisclaimers?: string[];
  };
  exemplarArtifactId?: number;
  changeNotes?: string;
  approvedById?: number;
  isCurrent: boolean;
  supersededAt?: string;
  createdAt: string;
}

export interface PreviousWork {
  id: number;
  schoolId: number;
  userId: number;
  artifactId: number;
  tags: string[];
  summary?: string;
  archived: boolean;
  createdAt: string;
  artifact?: Artifact;
}

// 6. Temporal Domain Models (Separated Calendar, Tasks, Reminders)
export interface CalendarEvent {
  id: number;
  schoolId: number;
  userId: number;
  title: string;
  description?: string;
  location?: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  isAllDay: boolean;
  googleEventId?: string;
  googleCalendarId?: string;
  syncStatus: SyncStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  schoolId: number;
  creatorUserId: number;
  assigneeUserId?: number;
  departmentId?: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string; // ISO
  completedAt?: string;
  associatedArtifactId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: number;
  schoolId: number;
  userId: number;
  taskId?: number;
  calendarEventId?: number;
  title: string;
  triggerTime: string; // ISO
  deliveryStatus: 'pending' | 'sent' | 'dismissed' | 'snoozed';
  recurrenceRule?: string;
  createdAt: string;
  updatedAt: string;
}

// 7. External Integrations & Controlled Sync
export interface GoogleIntegration {
  id: number;
  userId: number;
  schoolId: number;
  googleEmail: string;
  authorizedScopes: string[];
  isConnected: boolean;
  lastSyncAt?: string;
  createdAt: string;
}

export interface GoogleResource {
  id: number;
  schoolId: number;
  userId: number;
  googleFileId: string;
  title: string;
  mimeType: string;
  webViewLink?: string;
  lastKnownExternalVersion?: string;
  lastKnownModifiedTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncRecord {
  id: number;
  schoolId: number;
  artifactId: number;
  googleResourceId: number;
  lastImportedVersion?: number;
  lastExportedVersion?: number;
  syncDirection: 'export_to_google' | 'import_to_school_ai';
  syncStatus: SyncStatus;
  conflictStatus: 'none' | 'diverged' | 'deleted_externally';
  conflictDetails?: {
    internalModifiedAt: string;
    externalModifiedAt: string;
    diffSummary?: string;
  };
  lastSyncedAt: string;
}

// 8. Action Confirmations & Security Gates
export interface ActionConfirmation {
  id: number;
  schoolId: number;
  userId: number;
  actionType: 'send_email' | 'delete_artifact' | 'overwrite_standard' | 'share_external';
  actionTargetId: string;
  challengeTokenHash: string; // SHA-256 of the random challenge token
  payloadHash: string;        // SHA-256 of payload elements
  actionPayloadJson: Record<string, any>;
  status: ConfirmationStatus;
  expiresAt: string;
  confirmedAt?: string;
  createdAt: string;
}

// 9. Preferences & Dynamic UI Configuration
export interface UserPreference {
  id: number;
  userId: number;
  preferredDocumentFormat: 'docx' | 'gdoc';
  preferredEmailTone: 'formal' | 'concise' | 'warm';
  customInstructions?: string;
  ambientSuggestionsEnabled: boolean;
  updatedAt: string;
}

export interface UserUiPreference {
  id: number;
  userId: number;
  layoutPreset: 'classic_canvas' | 'dense_workspace' | 'split_inspector';
  themeMode: 'light' | 'dark' | 'system';
  density: 'compact' | 'comfortable' | 'spacious';
  sidebarPosition: 'left' | 'right';
  sidebarWidthPx: number;
  accentPalette: 'navy' | 'slate' | 'emerald' | 'indigo';
  typographyScale: 'compact' | 'standard' | 'large';
  visibleSidebarSections: string[];
  updatedAt: string;
}

// 10. Audit Logging
export interface AuditLog {
  id: number;
  schoolId: number;
  userId: number;
  action: string;
  targetType: string;
  targetId: string;
  payloadDigest?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// 11. AI Orchestration Contracts
export interface AIRequest {
  conversationId: number;
  schoolId: number;
  userId: number;
  userPermissionLevel: PermissionLevel;
  departmentId?: number;
  prompt: string;
  activeArtifactId?: number;
  sectorContext: SectorType;
}

export interface RetrievalResult {
  knowledgeItems: KnowledgeRetrievalItem[];
  standards: { standardId: number; name: string; structureSpec: Record<string, any> }[];
  previousWork: { artifactId: number; title: string; summary: string }[];
  userPreferences: Partial<UserPreference>;
}

export interface AIPlan {
  intent: string;
  requiredCapabilities: ('fast' | 'reasoning' | 'vision' | 'embedding')[];
  proposedTools: { toolId: string; args: Record<string, any> }[];
  riskLevel: 'safe' | 'consequential';
}

export interface AIToolDefinition {
  toolId: string;
  description: string;
  category: 'READ' | 'WRITE_SAFE' | 'WRITE_REQUIRES_CONFIRMATION';
  requiredPermissionLevel: PermissionLevel;
  inputSchema: Record<string, any>;
  outputSchema?: Record<string, any>;
  hasExternalSideEffects: boolean;
  auditEventType: string;
  idempotent: boolean;
}

export interface PolicyEvaluationContext {
  userId: number;
  schoolId: number;
  permissionLevel: PermissionLevel;
  userDepartmentId?: number;
  resourceOwnerId?: number;
  resourceVisibility?: VisibilityLevel;
  resourceDepartmentId?: number;
  explicitGrant?: 'view' | 'comment' | 'edit';
  action: 'read' | 'write' | 'delete' | 'share' | 'confirm';
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  reason?: string;
}

export interface ConfirmationChallengeRequest {
  challengeToken: string; // Random 32-byte hex sent to client
  challengeTokenHash: string; // Hash stored in DB
  actionType: string;
  actionTargetId: string;
  payloadDigest: string;
  payloadBindings: {
    recipients?: string[];
    subject?: string;
    bodySummary?: string;
    attachments?: string[];
  };
  expiresAt: string;
}
