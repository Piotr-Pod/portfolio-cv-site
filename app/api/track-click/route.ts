import { NextRequest, NextResponse } from 'next/server';
import { getMetricsRepository, ClickType } from '@/lib/metrics/repository';
import { extractIpAddress, formatDayISO, hashFingerprint, isLikelyBot, isRateLimited } from '@/lib/metrics/server';

export async function POST(req: NextRequest) {
  try {
    const repo = getMetricsRepository();
    const body = (await req.json().catch(() => ({}))) as {
      postId?: string;
      clientId?: string;
      type?: ClickType;
      meta?: Record<string, unknown>;
    };

    const { postId, clientId, type, meta } = body;
    if (!postId || typeof postId !== 'string') {
      return NextResponse.json({ ok: false, error: 'invalid_postId' }, { status: 400 });
    }
    if (!type || !['click_outbound', 'click_cta', 'click_toc'].includes(type)) {
      return NextResponse.json({ ok: false, error: 'invalid_type' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || undefined;
    const secChUa = req.headers.get('sec-ch-ua') || null;
    if (isLikelyBot(userAgent, secChUa)) {
      return NextResponse.json({ ok: true, skipped: 'bot' }, { status: 200 });
    }

    const ip = extractIpAddress(req);
    if (isRateLimited(ip)) {
      return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
    }

    const dayISO = formatDayISO(new Date());
    const rotatingSalt = process.env.SECRET_ROTATING_SALT || 'dev-rotate-salt';
    const fpHash = clientId ? undefined : hashFingerprint(ip, userAgent, rotatingSalt);

    await repo.saveClickEvent({
      postId,
      dayISO,
      type,
      clientId,
      fingerprintHash: fpHash,
      meta,
      userAgent,
      secChUa,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}


