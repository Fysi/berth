import crypto from 'node:crypto';

export const REQUIRED_TRAILERS = ['Task:', 'Attempt:', 'Session:', 'Change-Id:'] as const;

export interface CommitTrailers {
  taskId?: string;
  attemptId?: string;
  sessionId?: string;
  changeId?: string;
}

export interface ValidationResult {
  valid: boolean;
  missingTrailers: string[];
  error?: string;
}

/**
 * Validates that all required RFC-2822 trailers exist in the commit message
 */
export function validateCommitMessage(message: string): ValidationResult {
  const missingTrailers = REQUIRED_TRAILERS.filter(trailer => !message.includes(trailer));
  return {
    valid: missingTrailers.length === 0,
    missingTrailers,
    error: missingTrailers.length > 0 
      ? `Missing required commit trailers: ${missingTrailers.join(', ')}`
      : undefined
  };
}

/**
 * Checks if a string contains unresolved Git merge conflict markers
 */
export function containsConflictMarkers(content: string): boolean {
  const markerPatterns = [
    /^[<]{7}\s.*$/m,
    /^[=]{7}$/m,
    /^[>]{7}\s.*$/m
  ];
  return markerPatterns.some(pattern => pattern.test(content));
}

/**
 * Generates a Gerrit/Git standard Change-Id (I + 40-char SHA1 hex)
 */
export function generateChangeId(seed?: string): string {
  const hash = crypto.createHash('sha1');
  if (seed) {
    hash.update(seed);
  } else {
    hash.update(crypto.randomBytes(32));
    hash.update(Date.now().toString());
  }
  return `I${hash.digest('hex')}`;
}

/**
 * Appends missing trailers to a commit message conforming to RFC-2822
 */
export function decorateCommitMessage(
  originalMessage: string, 
  trailers: { taskId: string; attemptId: string; sessionId: string; changeId?: string }
): string {
  let msg = originalMessage.trimEnd();
  const changeId = trailers.changeId || generateChangeId(originalMessage);

  const trailerLines: string[] = [];
  if (!msg.includes('Task:')) {
    trailerLines.push(`Task: ${trailers.taskId}`);
  }
  if (!msg.includes('Attempt:')) {
    trailerLines.push(`Attempt: ${trailers.attemptId}`);
  }
  if (!msg.includes('Session:')) {
    trailerLines.push(`Session: ${trailers.sessionId}`);
  }
  if (!msg.includes('Change-Id:')) {
    trailerLines.push(`Change-Id: ${changeId}`);
  }

  if (trailerLines.length === 0) {
    return originalMessage;
  }

  return `${msg}\n\n${trailerLines.join('\n')}\n`;
}
