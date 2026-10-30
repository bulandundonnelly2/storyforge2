'use client';
import { useEffect } from 'react';

export function PageVisitTracker() {
  useEffect(() => {
    // Count page loads, not every hash change in the interactive adventure.
    // sessionStorage lasts for this tab only; it isn't a cross-visit user identifier.
    try {
      const key = 'eldernight-visit-session';
      let session = sessionStorage.getItem(key);
      if (!session) {
        session = crypto.randomUUID();
        sessionStorage.setItem(key, session);
      }
      void fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session }),
        keepalive: true,
      });
    } catch {
      // Analytics failure must never interrupt gameplay.
    }
  }, []);
  return null;
}
