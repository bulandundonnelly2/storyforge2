import type { ReactNode } from 'react';
import Link from 'next/link';

export function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return <main style={{ minHeight: '100vh', background: '#05051e', color: '#f6f6fd', fontFamily: 'system-ui, sans-serif', padding: 'min(6vw, 48px) 18px' }}>
    <article style={{ maxWidth: 800, margin: '0 auto', border: '3px solid #00eaff', boxShadow: '8px 8px 0 #3540ef', background: '#080b2b', padding: 'clamp(20px, 4vw, 48px)' }}>
      <nav aria-label="Site navigation" style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginBottom: 32, fontWeight: 700 }}>
        <Link href="/" style={{ color: '#00eaff' }}>← ElderNight</Link>
        <Link href="/privacy" style={{ color: '#00eaff' }}>Privacy Policy</Link>
        <Link href="/terms" style={{ color: '#00eaff' }}>Terms of Service</Link>
      </nav>
      <h1 style={{ color: '#ffe500', fontFamily: 'monospace', fontSize: 'clamp(24px,4vw,40px)', textTransform: 'uppercase' }}>{title}</h1>
      <p style={{ color: '#cbd2f5' }}>Last updated: 24 October 2026</p>
      <div className="elder-legal-content" style={{ lineHeight: 1.75, fontSize: 16 }}>{children}</div>
      <footer style={{ marginTop: 42, paddingTop: 18, borderTop: '2px solid #3540ef', color: '#cbd2f5' }}>
        Questions? Contact <a href="mailto:elder@eldernight.com" style={{ color: '#00eaff' }}>elder@eldernight.com</a>.
      </footer>
    </article>
    <style>{`.elder-legal-content h2{font-family:monospace;color:#ffe500;font-size:1.2rem;margin-top:2rem;margin-bottom:.5rem}.elder-legal-content a{color:#00eaff}.elder-legal-content p,.elder-legal-content li{margin-bottom:.85rem}.elder-legal-content ul{padding-left:1.5rem}`}</style>
  </main>;
}
