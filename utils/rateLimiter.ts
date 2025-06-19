type RateLimitMap = Map<string, { count: number; timestamp: number }>;

const WINDOW_SIZE = 60 * 1000; // 60 секунд
const MAX_REQUESTS = 5000000;

const ipLimitStore: RateLimitMap = new Map();
const loginLimitStore: RateLimitMap = new Map();

/** Удаляет устаревшие записи из Map */
function cleanExpiredEntries(map: RateLimitMap) {
  const now = Date.now();
  for (const [key, entry] of map.entries()) {
    if (now - entry.timestamp > WINDOW_SIZE) {
      map.delete(key);
    }
  }
}

/** Сбрасывает счётчики попыток для IP и логина */
export function resetRateLimit(ip: string, login: string) {
  ipLimitStore.delete(ip);
  loginLimitStore.delete(login);
}

export function rateLimit(ip: string, login: string): {
  allowed: boolean;
  retryAfter?: number;
  reason?: "ip" | "login";
} {
  const now = Date.now();

  // 🧹 Чистим устаревшие записи
  cleanExpiredEntries(ipLimitStore);
  cleanExpiredEntries(loginLimitStore);

  // --- Проверка по IP ---
  const ipEntry = ipLimitStore.get(ip);
  if (!ipEntry || now - ipEntry.timestamp > WINDOW_SIZE) {
    ipLimitStore.set(ip, { count: 1, timestamp: now });
  } else if (ipEntry.count < MAX_REQUESTS) {
    ipEntry.count += 1;
    ipLimitStore.set(ip, ipEntry);
  } else {
    const retryAfter = Math.ceil((WINDOW_SIZE - (now - ipEntry.timestamp)) / 1000);
    return { allowed: false, retryAfter, reason: "ip" };
  }

  // --- Проверка по логину ---
  const loginEntry = loginLimitStore.get(login);
  if (!loginEntry || now - loginEntry.timestamp > WINDOW_SIZE) {
    loginLimitStore.set(login, { count: 1, timestamp: now });
  } else if (loginEntry.count < MAX_REQUESTS) {
    loginEntry.count += 1;
    loginLimitStore.set(login, loginEntry);
  } else {
    const retryAfter = Math.ceil((WINDOW_SIZE - (now - loginEntry.timestamp)) / 1000);
    return { allowed: false, retryAfter, reason: "login" };
  }

  return { allowed: true };
}
