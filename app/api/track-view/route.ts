import { NextRequest, NextResponse } from 'next/server';
import { getMetricsRepository } from '@/lib/metrics/repository';
import { extractIpAddress, formatDayISO, hashFingerprint, isLikelyBot, isRateLimited } from '@/lib/metrics/server';

export async function POST(req: NextRequest) {
  try {
    const repo = getMetricsRepository();
    const { postId, clientId } = (await req.json().catch(() => ({}))) as { postId?: string; clientId?: string };
    if (!postId || typeof postId !== 'string') {
      return NextResponse.json({ ok: false, error: 'invalid_postId' }, { status: 400 });
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

    const { inserted } = await repo.saveUniquePageView({
      postId,
      dayISO,
      clientId,
      fingerprintHash: fpHash,
      userAgent,
      secChUa,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, inserted });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}


