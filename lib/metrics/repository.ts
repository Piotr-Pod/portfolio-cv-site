export type ClickType = 'click_outbound' | 'click_cta' | 'click_toc';

export interface PageViewEvent {
  postId: string;
  dayISO: string; // YYYY-MM-DD
  clientId?: string; // set when user gave consent
  fingerprintHash?: string; // set when no consent
  userAgent?: string;
  secChUa?: string | null;
  createdAt: Date;
}

export interface ClickEvent {
  postId: string;
  dayISO: string; // YYYY-MM-DD
  type: ClickType;
  clientId?: string;
  fingerprintHash?: string;
  meta?: Record<string, unknown>;
  userAgent?: string;
  secChUa?: string | null;
  createdAt: Date;
}

export interface MetricsRepository {
  saveUniquePageView(event: PageViewEvent): Promise<{ inserted: boolean }>; // dedupe by (postId, dayISO, clientId|fingerprintHash)
  saveClickEvent(event: ClickEvent): Promise<void>;
}

export class InMemoryMetricsRepository implements MetricsRepository {
  private readonly viewDedupeKeys = new Set<string>();
  private readonly clickEvents: ClickEvent[] = [];

  async saveUniquePageView(event: PageViewEvent): Promise<{ inserted: boolean }> {
    const identity = event.clientId ?? event.fingerprintHash ?? 'anon';
    const key = `${event.postId}|${event.dayISO}|${identity}`;
    if (this.viewDedupeKeys.has(key)) {
      return { inserted: false };
    }
    this.viewDedupeKeys.add(key);
    return { inserted: true };
  }

  async saveClickEvent(event: ClickEvent): Promise<void> {
    this.clickEvents.push(event);
  }
}

// Singleton for simplicity in the current runtime instance
let singletonRepo: MetricsRepository | null = null;

export function getMetricsRepository(): MetricsRepository {
  if (!singletonRepo) {
    singletonRepo = new InMemoryMetricsRepository();
  }
  return singletonRepo;
}


