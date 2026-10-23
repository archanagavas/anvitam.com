/**
 * Client-side Rate Limiting & Cooldown Helper
 * Prevents rapid double-submissions, spam clicks, and bot abuse on lead forms.
 */

interface RateLimitConfig {
  key: string;
  cooldownSeconds?: number;
  maxAttempts?: number;
  windowMinutes?: number;
}

export interface RateLimitStatus {
  allowed: boolean;
  remainingSeconds: number;
  message?: string;
}

export function checkClientRateLimit({
  key,
  cooldownSeconds = 30,
  maxAttempts = 3,
  windowMinutes = 10,
}: RateLimitConfig): RateLimitStatus {
  try {
    const storageKey = `anvitam_rl_${key}`;
    const raw = localStorage.getItem(storageKey);
    const now = Date.now();

    if (!raw) {
      return { allowed: true, remainingSeconds: 0 };
    }

    const data: { lastSubmit: number; attempts: number[]; windowStart: number } = JSON.parse(raw);

    // 1. Immediate cooldown check (prevent rapid button mashing)
    const elapsedSinceLast = (now - data.lastSubmit) / 1000;
    if (elapsedSinceLast < cooldownSeconds) {
      const remaining = Math.ceil(cooldownSeconds - elapsedSinceLast);
      return {
        allowed: false,
        remainingSeconds: remaining,
        message: `Please wait ${remaining} second${remaining !== 1 ? 's' : ''} before submitting again.`,
      };
    }

    // 2. Sliding window attempt count check
    const windowMs = windowMinutes * 60 * 1000;
    const activeAttempts = (data.attempts || []).filter(ts => now - ts < windowMs);

    if (activeAttempts.length >= maxAttempts) {
      const oldest = activeAttempts[0];
      const resetIn = Math.ceil((windowMs - (now - oldest)) / 1000);
      return {
        allowed: false,
        remainingSeconds: resetIn,
        message: `Submission limit reached. Please wait ${Math.ceil(resetIn / 60)} minute(s) before sending another inquiry.`,
      };
    }

    return { allowed: true, remainingSeconds: 0 };
  } catch (err) {
    console.warn('[RateLimiter] Error reading rate limit state:', err);
    return { allowed: true, remainingSeconds: 0 };
  }
}

export function recordClientSubmission(key: string, windowMinutes = 10): void {
  try {
    const storageKey = `anvitam_rl_${key}`;
    const raw = localStorage.getItem(storageKey);
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    let attempts: number[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        attempts = (parsed.attempts || []).filter((ts: number) => now - ts < windowMs);
      } catch {}
    }

    attempts.push(now);

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        lastSubmit: now,
        attempts,
        windowStart: now,
      })
    );
  } catch (err) {
    console.warn('[RateLimiter] Error recording submission:', err);
  }
}
