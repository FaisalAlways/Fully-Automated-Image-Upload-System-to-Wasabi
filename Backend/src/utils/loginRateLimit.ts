interface RateLimitEntry {
  attempts: number;
  lockUntil: number | null;
}

const rateLimitData: Record<string, RateLimitEntry> = {};

const MAX_ATTEMPTS = 5; // allowed wrong tries
const LOCK_TIME = 3 * 60 * 1000; // 3 minutes

export function isLocked(email: string): boolean {
  const entry = rateLimitData[email];
  if (!entry) return false;
  if (entry.lockUntil && Date.now() < entry.lockUntil) return true;
  return false;
}

export function recordFailedAttempt(email: string) {
  if (!rateLimitData[email]) {
    rateLimitData[email] = { attempts: 0, lockUntil: null };
  }

  rateLimitData[email].attempts += 1;

  if (rateLimitData[email].attempts >= MAX_ATTEMPTS) {
    rateLimitData[email].lockUntil = Date.now() + LOCK_TIME;
    rateLimitData[email].attempts = 0;
  }
}

export function resetAttempts(email: string) {
  if (rateLimitData[email]) {
    rateLimitData[email].attempts = 0;
    rateLimitData[email].lockUntil = null;
  }
}
