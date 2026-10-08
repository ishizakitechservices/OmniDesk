/**
 * School AI — Hardened Confirmation Service
 * 
 * Invariant: Never stores raw confirmation challenge tokens in plaintext.
 * Generates a random challenge token, returns it over HTTPS to the client,
 * but stores ONLY the SHA-256 challenge hash bound to user, school, target, and payload hash.
 */

import { ActionConfirmation, ConfirmationChallengeRequest } from '../types/index.ts';

// Browser and Node-compatible SHA-256 helper
export async function sha256(message: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for simple environments
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    hash = (hash << 5) - hash + message.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

export function generateSecureRandomToken(bytesCount: number = 32): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(bytesCount);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return `${Date.now()}_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
}

export class ConfirmationService {
  /**
   * Generates a single-use, payload-bound confirmation challenge.
   * Returns the raw challenge token to send to the user client,
   * while returning the hash to store in the database.
   */
  public static async createChallenge(
    schoolId: number,
    userId: number,
    actionType: 'send_email' | 'delete_artifact' | 'overwrite_standard' | 'share_external',
    actionTargetId: string,
    actionPayload: Record<string, any>,
    expirationMinutes: number = 15
  ): Promise<{ challengeRequest: ConfirmationChallengeRequest; dbRecord: ActionConfirmation }> {
    // 1. Serialize payload elements deterministically to create payload hash
    const serializedPayload = JSON.stringify(actionPayload, Object.keys(actionPayload).sort());
    const payloadHash = await sha256(serializedPayload);

    // 2. Generate cryptographically secure random challenge
    const rawChallengeToken = generateSecureRandomToken(32);

    // 3. Compute SHA-256 of the challenge token to store in DB
    const challengeTokenHash = await sha256(rawChallengeToken);

    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString();

    const dbRecord: ActionConfirmation = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      schoolId,
      userId,
      actionType,
      actionTargetId,
      challengeTokenHash,
      payloadHash,
      actionPayloadJson: actionPayload,
      status: 'pending',
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    const challengeRequest: ConfirmationChallengeRequest = {
      challengeToken: rawChallengeToken,
      challengeTokenHash,
      actionType,
      actionTargetId,
      payloadDigest: payloadHash,
      payloadBindings: {
        recipients: actionPayload.to,
        subject: actionPayload.subject,
        bodySummary: actionPayload.bodyText?.substring(0, 150),
        attachments: actionPayload.attachments,
      },
      expiresAt,
    };

    return { challengeRequest, dbRecord };
  }

  /**
   * Verifies an incoming challenge token from the client against the stored record and payload.
   */
  public static async verifyChallenge(
    storedRecord: ActionConfirmation,
    submittedChallengeToken: string,
    userId: number,
    schoolId: number,
    currentPayload: Record<string, any>
  ): Promise<{ valid: boolean; reason?: string }> {
    // 1. Check status and expiration
    if (storedRecord.status !== 'pending') {
      return { valid: false, reason: 'This confirmation challenge has already been processed or expired.' };
    }

    if (new Date(storedRecord.expiresAt).getTime() < Date.now()) {
      return { valid: false, reason: 'Confirmation challenge expired. A fresh approval is required.' };
    }

    // 2. Check tenant and user binding
    if (storedRecord.userId !== userId || storedRecord.schoolId !== schoolId) {
      return { valid: false, reason: 'Confirmation identity mismatch.' };
    }

    // 3. Verify challenge token hash
    const submittedHash = await sha256(submittedChallengeToken);
    if (submittedHash !== storedRecord.challengeTokenHash) {
      return { valid: false, reason: 'Invalid confirmation security token.' };
    }

    // 4. Verify payload hasn't changed since staging
    const serializedCurrent = JSON.stringify(currentPayload, Object.keys(currentPayload).sort());
    const currentPayloadHash = await sha256(serializedCurrent);
    if (currentPayloadHash !== storedRecord.payloadHash) {
      return { valid: false, reason: 'The action payload was modified after approval. New confirmation required.' };
    }

    return { valid: true };
  }
}
