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
  // dedupe by (postId, dayISO, clientId|fingerprintHash), always increments total; returns counts
  saveUniquePageView(event: PageViewEvent): Promise<{ inserted: boolean; total: number; unique: number }>;
  saveClickEvent(event: ClickEvent): Promise<void>;
}

export class InMemoryMetricsRepository implements MetricsRepository {
  private readonly viewDedupeKeys = new Set<string>();
  private readonly totalPerDay = new Map<string, number>(); // key: post|day
  private readonly uniquePerDay = new Map<string, number>(); // key: post|day
  private readonly clickEvents: ClickEvent[] = [];

  async saveUniquePageView(event: PageViewEvent): Promise<{ inserted: boolean; total: number; unique: number }> {
    const identity = event.clientId ?? event.fingerprintHash ?? 'anon';
    const dedupeKey = `${event.postId}|${event.dayISO}|${identity}`;
    const dayKey = `${event.postId}|${event.dayISO}`;

    // increment total views
    const prevTotal = this.totalPerDay.get(dayKey) ?? 0;
    const newTotal = prevTotal + 1;
    this.totalPerDay.set(dayKey, newTotal);

    let inserted = false;
    if (!this.viewDedupeKeys.has(dedupeKey)) {
      this.viewDedupeKeys.add(dedupeKey);
      const prevUnique = this.uniquePerDay.get(dayKey) ?? 0;
      this.uniquePerDay.set(dayKey, prevUnique + 1);
      inserted = true;
    }

    const unique = this.uniquePerDay.get(dayKey) ?? 0;
    return { inserted, total: newTotal, unique };
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


