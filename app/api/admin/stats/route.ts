import { createClerkClient } from '@clerk/backend';
import { NextRequest, NextResponse } from 'next/server';
import { storyDb } from '@/lib/story-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const denied = () => NextResponse.json({ error: 'Not authorized' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const adminId = process.env.ELDERNIGHT_ADMIN_USER_ID;
  if (!secretKey || !publishableKey || !adminId) return denied();
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return denied();
  try {
    const clerk = createClerkClient({ secretKey, publishableKey });
    const authState = await clerk.authenticateRequest(request, {
      authorizedParties: [new URL(request.url).origin],
      acceptsToken: 'session_token',
    });
    const userId = authState.toAuth()?.userId;
    if (!userId || userId !== adminId) return denied();
    const db = await storyDb();
    const monthStart = new Date();
    monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0);
    const [gameCounts, publishedCounts, logicalBytes, monthlyEdits, owners] = await Promise.all([
      db.execute('SELECT COUNT(*) AS total FROM stories'),
      db.execute('SELECT COUNT(*) AS total FROM published_stories'),
      db.execute('SELECT COALESCE(SUM(LENGTH(CAST(content AS BLOB))),0) AS bytes FROM stories'),
      db.execute({ sql: 'SELECT COUNT(*) AS total FROM stories WHERE updated_at >= ?', args: [monthStart.getTime()] }),
      db.execute("SELECT COUNT(DISTINCT owner_key) AS total FROM stories WHERE owner_key LIKE 'user:%'"),
    ]);
    const publishedBytes = await db.execute('SELECT COALESCE(SUM(LENGTH(CAST(content AS BLOB))),0) AS bytes FROM published_stories');
    let registeredUsers: number | null = null;
    try {
      const userList = await clerk.users.getUserList({ limit: 1 });
      registeredUsers = userList.totalCount ?? null;
    } catch (error) {
      console.error('Could not fetch Clerk user count', error);
    }
    return NextResponse.json({
      registeredUsers,
      creatorsWithSavedGames: Number(owners.rows[0]?.total ?? 0),
      totalGames: Number(gameCounts.rows[0]?.total ?? 0),
      publishedGames: Number(publishedCounts.rows[0]?.total ?? 0),
      storedContentBytes: Number(logicalBytes.rows[0]?.bytes ?? 0) + Number(publishedBytes.rows[0]?.bytes ?? 0),
      gamesUpdatedThisMonth: Number(monthlyEdits.rows[0]?.total ?? 0),
      month: monthStart.toISOString().slice(0,7),
      note: 'Storage is measured story-content bytes, not billed Turso database size. Monthly metric is games last updated this month, not total read/write requests. Provider usage must be checked in the hosting and database dashboards.',
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Eldernight admin stats error', error);
    return NextResponse.json({ error: 'Could not load statistics' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
