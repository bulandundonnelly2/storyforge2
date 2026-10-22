import { createClerkClient } from '@clerk/backend';
import { NextRequest } from 'next/server';

export async function storyOwner(request: NextRequest) {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const anonymous = { owner: null, signedIn: false };
  if (!secretKey || !publishableKey || !request.headers.get('authorization')?.startsWith('Bearer ')) return anonymous;
  const clerk = createClerkClient({ secretKey, publishableKey });
  // Clerk's session token contains the frontend origin (azp). Accept the live
  // ElderNight domains as well as the deployment's configured canonical URL.
  const allowedOrigins = new Set([
    'https://eldernight.com',
    'https://www.eldernight.com',
    'https://storyforge2-red.vercel.app',
    process.env.STORYFORGE_APP_URL,
  ].filter((origin): origin is string => Boolean(origin)));
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.add('http://localhost:3000');
    allowedOrigins.add('http://127.0.0.1:3101');
  }
  const state = await clerk.authenticateRequest(request, {
    authorizedParties: [...allowedOrigins],
    acceptsToken: 'session_token',
  });
  const auth = state.toAuth();
  if (!auth?.userId) return anonymous;
  const user = await clerk.users.getUser(auth.userId);
  if (!user.emailAddresses.some(email => email.verification?.status === 'verified')) return anonymous;
  return { owner: 'user:' + user.id, signedIn: true };
}
