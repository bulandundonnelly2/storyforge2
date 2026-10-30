import type { Metadata } from 'next';
import './globals.css';
import { StoryAuth } from '@/components/story-auth';
import { PageVisitTracker } from '@/components/page-visit-tracker';

export const metadata: Metadata = { title: 'ELDERNIGHT — Legends you create. Adventures you forge.', description: 'Create, save and share interactive story games.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><head><link rel="stylesheet" href="/assets/story.css" /></head><body><StoryAuth publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}><PageVisitTracker />{children}</StoryAuth></body></html>; }
