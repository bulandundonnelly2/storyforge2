import { createClerkClient } from '@clerk/backend';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import AdminDashboard from './admin-dashboard';

export const dynamic = 'force-dynamic';

// Authorize before rendering the administrator UI. The stats API separately
// authenticates every request and remains the source of truth for data access.
export default async function AdminPage() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const adminUserId = process.env.ELDERNIGHT_ADMIN_USER_ID;
  if (!secretKey || !publishableKey || !adminUserId) notFound();

  const incomingHeaders = await headers();
  const host = incomingHeaders.get('x-forwarded-host') ?? incomingHeaders.get('host');
  const protocol = incomingHeaders.get('x-forwarded-proto') === 'http' ? 'http' : 'https';
  if (!host) notFound();

  try {
    const origin = new URL(`${protocol}://${host}`).origin;
    const request = new Request(new URL('/admin', origin), { headers: incomingHeaders });
    const clerk = createClerkClient({ secretKey, publishableKey });
    const authState = await clerk.authenticateRequest(request, {
      authorizedParties: [origin],
      acceptsToken: 'session_token',
    });
    if (authState.toAuth()?.userId !== adminUserId) notFound();
  } catch {
    notFound();
  }

  return <AdminDashboard />;
}
