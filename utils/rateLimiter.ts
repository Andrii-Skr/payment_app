type RateLimitMap = Map<string, { count: number; timestamp: number }>;

const WINDOW_SIZE = 60 * 1000; // 60 секунд
const MAX_REQUESTS = 5;

const rateLimitStore: RateLimitMap = new Map();

export function rateLimit(ip: string): {
  allowed: boolean;
  retryAfter?: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.timestamp > WINDOW_SIZE) {
    rateLimitStore.set(ip, { count: 1, timestamp: now });
    return { allowed: true };
  }

  if (entry.count < MAX_REQUESTS) {
    entry.count += 1;
    rateLimitStore.set(ip, entry);
    return { allowed: true };
  }

  const retryAfter = Math.ceil((WINDOW_SIZE - (now - entry.timestamp)) / 1000);
  return { allowed: false, retryAfter };
}
