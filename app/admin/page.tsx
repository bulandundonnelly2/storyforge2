import AdminStatsClient from './admin-stats-client';

// Do not prerender authentication-dependent admin pages.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function AdminPage() {
  // When Clerk is not configured, fail closed rather than render a page
  // that calls Clerk hooks outside a provider.
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY || !process.env.ELDERNIGHT_ADMIN_USER_ID) {
    return <main><h1>Admin unavailable</h1><p>Administrator authentication has not been configured.</p></main>;
  }
  return <AdminStatsClient />;
}
