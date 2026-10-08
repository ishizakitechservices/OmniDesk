/**
 * School AI — Full-Stack Server Entry Point
 * Mounts Express API proxy endpoints and Vite dev server middlewares.
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { AIOrchestrator } from './src/lib/aiOrchestrator.ts';
import { schoolRepository } from './src/lib/storage.ts';
import { ConfirmationService } from './src/lib/confirmationService.ts';
import { getAIConfig } from './src/config/aiConfig.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));

app.get('/api/debug-env', (req, res) => {
  res.json({
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    keyPrefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.slice(0, 6) : null,
    envKeys: Object.keys(process.env).filter((k) => k.includes('GEMINI') || k.includes('API') || k.includes('AI')),
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  const config = getAIConfig();
  res.json({
    status: 'ok',
    school: "St. Jude's Academy",
    activeProvider: config.activeProviderId,
    timestamp: new Date().toISOString(),
  });
});

// Chat & AI Orchestration Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, conversationId = 1, sectorContext = 'document', userId = 1, schoolId = 1 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const membership = schoolRepository.memberships.get(userId);
    const permissionLevel = membership?.permissionLevel || 'admin';

    const result = await AIOrchestrator.processRequest({
      conversationId: Number(conversationId),
      schoolId: Number(schoolId),
      userId: Number(userId),
      userPermissionLevel: permissionLevel,
      prompt,
      sectorContext,
    });

    // Save message to conversation history
    const existingMessages = schoolRepository.messages.get(Number(conversationId)) || [];
    existingMessages.push({
      id: Date.now() - 100,
      conversationId: Number(conversationId),
      role: 'user',
      content: prompt,
      createdAt: new Date().toISOString(),
    });
    existingMessages.push(result.message);
    schoolRepository.messages.set(Number(conversationId), existingMessages);

    res.json(result);
  } catch (error: any) {
    console.error('API /api/chat error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Consequential Action Confirmation Verification & Dispatch
app.post('/api/confirm-action', async (req, res) => {
  try {
    const { challengeToken, challengeTokenHash, userId = 1, schoolId = 1 } = req.body;

    if (!challengeToken || !challengeTokenHash) {
      return res.status(400).json({ error: 'Missing confirmation security challenge token.' });
    }

    const storedRecord = schoolRepository.confirmations.get(challengeTokenHash);
    if (!storedRecord) {
      return res.status(404).json({ error: 'Confirmation challenge record not found or already redeemed.' });
    }

    const verification = await ConfirmationService.verifyChallenge(
      storedRecord,
      challengeToken,
      Number(userId),
      Number(schoolId),
      storedRecord.actionPayloadJson
    );

    if (!verification.valid) {
      return res.status(403).json({ error: verification.reason || 'Confirmation failed.' });
    }

    // Mark as confirmed (single-use enforcement)
    storedRecord.status = 'confirmed';
    storedRecord.confirmedAt = new Date().toISOString();
    schoolRepository.confirmations.set(challengeTokenHash, storedRecord);

    // Execute the consequential action (e.g. Gmail outbound dispatch)
    if (storedRecord.actionType === 'send_email') {
      schoolRepository.logAudit({
        schoolId: Number(schoolId),
        userId: Number(userId),
        action: 'gmail_email_dispatched',
        targetType: 'email',
        targetId: 'gmail_outbound',
        metadata: {
          recipients: storedRecord.actionPayloadJson.to,
          subject: storedRecord.actionPayloadJson.subject,
          confirmedBy: userId,
        },
      });
    }

    res.json({
      success: true,
      actionType: storedRecord.actionType,
      message: 'Action successfully verified and executed. Audit event logged.',
      confirmedAt: storedRecord.confirmedAt,
    });
  } catch (error: any) {
    console.error('API /api/confirm-action error:', error);
    res.status(500).json({ error: error.message || 'Confirmation execution error' });
  }
});

// Knowledge Sources & Provenance Query
app.get('/api/knowledge', (req, res) => {
  const sources = Array.from(schoolRepository.knowledgeSources.values());
  const versions = Array.from(schoolRepository.knowledgeSourceVersions.values());
  res.json({ sources, versions });
});

// Official Institutional Standards
app.get('/api/standards', (req, res) => {
  const standards = Array.from(schoolRepository.standards.values()).map((s) => {
    const versions = schoolRepository.standardVersions.get(s.id) || [];
    return { ...s, currentVersion: versions.find((v) => v.isCurrent) || versions[0] };
  });
  res.json(standards);
});

// Artifacts Query
app.get('/api/artifacts', (req, res) => {
  const artifacts = Array.from(schoolRepository.artifacts.values()).map((a) => {
    const versions = schoolRepository.artifactVersions.get(a.id) || [];
    return { ...a, versions };
  });
  res.json(artifacts);
});

// Calendar, Tasks & Reminders
app.get('/api/calendar', (req, res) => {
  const events = Array.from(schoolRepository.calendarEvents.values());
  res.json(events);
});

app.get('/api/tasks', (req, res) => {
  const tasks = Array.from(schoolRepository.tasks.values());
  const reminders = Array.from(schoolRepository.reminders.values());
  res.json({ tasks, reminders });
});

// UI Preferences & Dynamic UI
app.get('/api/ui-preferences', (req, res) => {
  const prefs = schoolRepository.userUiPreferences.get(1);
  res.json(prefs || {});
});

app.post('/api/ui-preferences', (req, res) => {
  const current = schoolRepository.userUiPreferences.get(1) || {
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
  };

  const updated = { ...current, ...req.body, updatedAt: new Date().toISOString() };
  schoolRepository.userUiPreferences.set(1, updated);
  res.json(updated);
});

// Audit Log Viewer
app.get('/api/audit-logs', (req, res) => {
  res.json(schoolRepository.auditLogs);
});

// Mount Vite or Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`School AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
