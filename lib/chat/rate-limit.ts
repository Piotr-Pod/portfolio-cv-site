interface RateLimitResult {
  allowed: boolean;
  resetTime?: number;
  remaining?: number;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 20;

  const key = `chat:${ip}`;
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (current.count >= maxRequests) {
    return { allowed: false, resetTime: current.resetTime, remaining: 0 };
  }

  current.count++;
  rateLimitStore.set(key, current);

  return { allowed: true, remaining: maxRequests - current.count };
}


