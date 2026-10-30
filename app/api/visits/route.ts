import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { storyDb } from '@/lib/story-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Anonymous, per-tab session identifiers. No IP addresses or user agents are recorded.
export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return new NextResponse(null, { status: 403 });
    const body = await request.json();
    if (typeof body.session !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.session)) return new NextResponse(null, { status: 400 });
    const day = new Date().toISOString().slice(0, 10);
    const sessionHash = createHash('sha256').update(body.session).digest('hex');
    const db = await storyDb();
    await db.execute(`CREATE TABLE IF NOT EXISTS site_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT NOT NULL,
      session_hash TEXT NOT NULL,
      visited_at INTEGER NOT NULL
    )`);
    await db.execute({
      sql: 'INSERT INTO site_visits(day,session_hash,visited_at) VALUES(?,?,?)',
      args: [day, sessionHash, Date.now()],
    });
    return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
