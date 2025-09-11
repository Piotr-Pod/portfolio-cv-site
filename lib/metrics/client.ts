'use client';

const CLIENT_ID_COOKIE = 'client_id';
const CLIENT_ID_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2; // 2 years

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';').map((c) => c.trim());
  for (const c of cookies) {
    if (c.startsWith(name + '=')) {
      return decodeURIComponent(c.substring(name.length + 1));
    }
  }
  return null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return;
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

export function getOrCreateClientId(consentGiven: boolean): { clientId?: string } {
  if (!consentGiven) {
    return {};
  }
  const existing = getCookie(CLIENT_ID_COOKIE);
  if (existing) {
    return { clientId: existing };
  }
  const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  setCookie(CLIENT_ID_COOKIE, id, CLIENT_ID_COOKIE_MAX_AGE);
  return { clientId: id };
}

const SESSION_KEY = 'anon_session_ids';

export function rememberAnonView(postId: string): boolean {
  // returns true if already stored for this session (used to limit multiple sends per session)
  if (typeof sessionStorage === 'undefined') return false;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    const set = new Set<string>(raw ? JSON.parse(raw) : []);
    const key = `view:${postId}`;
    if (set.has(key)) return true;
    set.add(key);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(Array.from(set)));
    return false;
  } catch {
    return false;
  }
}

const DEBUG = process.env.NEXT_PUBLIC_METRICS_DEBUG === 'true';

export async function fireAndForget(url: string, payload: unknown): Promise<void> {
  try {
    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: 'same-origin',
    })
      .then(async (res) => {
        if (!DEBUG) return;
        try {
          const data = await res.json().catch(() => ({}));
          // eslint-disable-next-line no-console
          console.log('[metrics]', url, { status: res.status, data, payload });
        } catch (_) {}
      })
      .catch(() => {});
  } catch {}
}


