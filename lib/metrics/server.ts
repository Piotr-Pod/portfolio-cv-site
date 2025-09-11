import crypto from 'crypto';

const BOT_UA_PATTERNS: RegExp[] = [
  /bot/i,
  /spider/i,
  /crawler/i,
  /curl\//i,
  /wget\//i,
  /headless/i,
  /pingdom/i,
  /lighthouse/i,
  /pagespeed/i,
];

export function isLikelyBot(userAgent: string | undefined | null, secChUa: string | undefined | null): boolean {
  const ua = userAgent || '';
  if (!ua) return false; // if missing, don't block
  if (BOT_UA_PATTERNS.some((re) => re.test(ua))) return true;
  if (secChUa && /Not.?A.?Brand/i.test(secChUa) && /Chromium/i.test(secChUa) === false) {
    // some automation tools spoof headers poorly; conservative signal
    return true;
  }
  return false;
}

export function extractIpAddress(req: Request): string {
  // Next.js route handlers run on Edge/Node; trust x-forwarded-for if present
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) {
    const first = fwd.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  // Fallback: anonymized placeholder
  return '0.0.0.0';
}

// Very simple in-memory rate limit: key -> [timestamps]
const RATE_WINDOW_MS = 60_000; // 1 minute
const MAX_EVENTS_PER_WINDOW = parseInt(process.env.METRICS_RATE_LIMIT_PER_MIN || '60', 10);
const ipBuckets = new Map<string, number[]>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = ipBuckets.get(ip) || [];
  const recent = arr.filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  ipBuckets.set(ip, recent);
  return recent.length > MAX_EVENTS_PER_WINDOW;
}

export function formatDayISO(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function hashFingerprint(ip: string, userAgent: string | null | undefined, rotatingSalt: string): string {
  // Don't store raw IP; hash(ip + ua + salt)
  const h = crypto.createHash('sha256');
  h.update(ip);
  h.update('|');
  h.update(userAgent || '');
  h.update('|');
  h.update(rotatingSalt);
  return h.digest('hex');
}


