import Script from 'next/script';
import Link from 'next/link';
export default function Home() { return <><div id="app"/><Link href="/snake-fatality" style={{position:'fixed',right:14,bottom:15,zIndex:1000,background:'#120808',border:'1px solid #a22',color:'#fff',padding:'9px 12px',fontFamily:'monospace',fontSize:12,textDecoration:'none',boxShadow:'0 2px 12px #000a'}}>☠ SNAKE FATALITY</Link><Script type="module" src="/assets/story.js" strategy="afterInteractive" /></>; }
