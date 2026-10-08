/**
 * School AI — Machine-Readable Tool Safety Registry
 * Formal tool contracts categorizing actions into READ, WRITE_SAFE, and WRITE_REQUIRES_CONFIRMATION.
 */

import { AIToolDefinition } from '../types/index.ts';

export const AI_TOOL_REGISTRY: Record<string, AIToolDefinition> = {
  search_school_knowledge: {
    toolId: 'search_school_knowledge',
    description: 'Searches approved institutional school knowledge with provenance citations (policies, handbooks, fee tables, curriculum).',
    category: 'READ',
    requiredPermissionLevel: 'viewer',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Semantic search query for school knowledge' },
        category: { type: 'string', description: 'Optional category: policy, handbook, curriculum, fees, staffing' },
      },
      required: ['query'],
    },
    hasExternalSideEffects: false,
    auditEventType: 'knowledge_search',
    idempotent: true,
  },

  get_school_standard: {
    toolId: 'get_school_standard',
    description: 'Retrieves an approved institutional formatting and structural standard (e.g. financial report standard, parent communication standard).',
    category: 'READ',
    requiredPermissionLevel: 'viewer',
    inputSchema: {
      type: 'object',
      properties: {
        sector: { type: 'string', enum: ['document', 'spreadsheet', 'presentation', 'email'], description: 'Sector of the standard' },
        name: { type: 'string', description: 'Name or keywords of the standard' },
      },
      required: ['sector'],
    },
    hasExternalSideEffects: false,
    auditEventType: 'standard_inspection',
    idempotent: true,
  },

  search_previous_work: {
    toolId: 'search_previous_work',
    description: 'Searches previous school letters, reports, spreadsheets, and slide decks for reference or reuse.',
    category: 'READ',
    requiredPermissionLevel: 'viewer',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term for past work' },
        sector: { type: 'string', enum: ['document', 'spreadsheet', 'presentation', 'email'] },
      },
      required: ['query'],
    },
    hasExternalSideEffects: false,
    auditEventType: 'previous_work_search',
    idempotent: true,
  },

  generate_document: {
    toolId: 'generate_document',
    description: 'Generates an institutional document (letter to parents, policy draft, meeting minutes, department report).',
    category: 'WRITE_SAFE',
    requiredPermissionLevel: 'member',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Document title' },
        subtitle: { type: 'string', description: 'Optional subtitle or recipient header' },
        sections: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              heading: { type: 'string' },
              level: { type: 'integer', enum: [1, 2, 3] },
              paragraphs: { type: 'array', items: { type: 'string' } },
              calloutText: { type: 'string' },
            },
            required: ['heading', 'paragraphs'],
          },
        },
      },
      required: ['title', 'sections'],
    },
    hasExternalSideEffects: false,
    auditEventType: 'document_generated',
    idempotent: false,
  },

  generate_spreadsheet: {
    toolId: 'generate_spreadsheet',
    description: 'Generates a financial ledger, fee schedule, budget analyzer, or inventory spreadsheet with calculated formulas.',
    category: 'WRITE_SAFE',
    requiredPermissionLevel: 'member',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Spreadsheet title' },
        sheets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              columns: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    key: { type: 'string' },
                    label: { type: 'string' },
                    format: { type: 'string' },
                  },
                  required: ['key', 'label'],
                },
              },
              rows: { type: 'array', items: { type: 'object' } },
              formulas: { type: 'object', description: 'Key-value mapping of computed formula summaries' },
            },
            required: ['name', 'columns', 'rows'],
          },
        },
      },
      required: ['title', 'sheets'],
    },
    hasExternalSideEffects: false,
    auditEventType: 'spreadsheet_generated',
    idempotent: false,
  },

  generate_presentation: {
    toolId: 'generate_presentation',
    description: 'Generates a structured slide presentation for school assemblies, board meetings, or staff briefings.',
    category: 'WRITE_SAFE',
    requiredPermissionLevel: 'member',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Presentation title' },
        subtitle: { type: 'string' },
        slides: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              bulletPoints: { type: 'array', items: { type: 'string' } },
              layout: { type: 'string', enum: ['title_slide', 'content_split', 'bullet_summary', 'conclusion'] },
              speakerNotes: { type: 'string' },
            },
            required: ['title', 'bulletPoints'],
          },
        },
      },
      required: ['title', 'slides'],
    },
    hasExternalSideEffects: false,
    auditEventType: 'presentation_generated',
    idempotent: false,
  },

  stage_email_draft: {
    toolId: 'stage_email_draft',
    description: 'Stages a formal email draft (for parents, governors, or staff) in School AI and Gmail drafts.',
    category: 'WRITE_SAFE',
    requiredPermissionLevel: 'member',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'array', items: { type: 'string' }, description: 'Recipient emails' },
        cc: { type: 'array', items: { type: 'string' } },
        subject: { type: 'string', description: 'Email subject line' },
        bodyHtml: { type: 'string', description: 'HTML content of email' },
        bodyText: { type: 'string', description: 'Plain text fallback' },
        attachments: { type: 'array', items: { type: 'string' }, description: 'Artifact titles to attach' },
      },
      required: ['to', 'subject', 'bodyText'],
    },
    hasExternalSideEffects: false,
    auditEventType: 'email_staged',
    idempotent: false,
  },

  send_email: {
    toolId: 'send_email',
    description: 'Dispatches an email externally to recipients via Gmail. STRICT CONFIRMATION MANDATORY.',
    category: 'WRITE_REQUIRES_CONFIRMATION',
    requiredPermissionLevel: 'member',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'array', items: { type: 'string' } },
        subject: { type: 'string' },
        bodyText: { type: 'string' },
        attachments: { type: 'array', items: { type: 'string' } },
      },
      required: ['to', 'subject', 'bodyText'],
    },
    hasExternalSideEffects: true,
    auditEventType: 'email_sent_external',
    idempotent: false,
  },

  create_calendar_event: {
    toolId: 'create_calendar_event',
    description: 'Schedules an event, meeting, or appointment in School AI Calendar with optional Google Calendar link.',
    category: 'WRITE_SAFE',
    requiredPermissionLevel: 'member',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Event title' },
        description: { type: 'string' },
        startTime: { type: 'string', description: 'ISO 8601 start time' },
        endTime: { type: 'string', description: 'ISO 8601 end time' },
        location: { type: 'string' },
      },
      required: ['title', 'startTime', 'endTime'],
    },
    hasExternalSideEffects: false,
    auditEventType: 'calendar_event_created',
    idempotent: false,
  },

  create_task_and_reminder: {
    toolId: 'create_task_and_reminder',
    description: 'Creates an actionable administrative task with an associated notification reminder.',
    category: 'WRITE_SAFE',
    requiredPermissionLevel: 'member',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string' },
        dueDate: { type: 'string', description: 'ISO 8601 due timestamp' },
        reminderTime: { type: 'string', description: 'ISO 8601 alert timestamp' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
      },
      required: ['title', 'dueDate'],
    },
    hasExternalSideEffects: false,
    auditEventType: 'task_and_reminder_created',
    idempotent: false,
  },

  apply_ui_configuration: {
    toolId: 'apply_ui_configuration',
    description: 'Adjusts the user interface theme, density, layout preset, or sidebar configuration safely.',
    category: 'WRITE_SAFE',
    requiredPermissionLevel: 'viewer',
    inputSchema: {
      type: 'object',
      properties: {
        layoutPreset: { type: 'string', enum: ['classic_canvas', 'dense_workspace', 'split_inspector'] },
        themeMode: { type: 'string', enum: ['light', 'dark', 'system'] },
        density: { type: 'string', enum: ['compact', 'comfortable', 'spacious'] },
        sidebarPosition: { type: 'string', enum: ['left', 'right'] },
        accentPalette: { type: 'string', enum: ['navy', 'slate', 'emerald', 'indigo'] },
        typographyScale: { type: 'string', enum: ['compact', 'standard', 'large'] },
      },
    },
    hasExternalSideEffects: false,
    auditEventType: 'ui_config_adjusted',
    idempotent: true,
  },
};
