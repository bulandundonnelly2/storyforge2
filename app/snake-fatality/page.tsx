'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';

const total=12;
const durations=[500,430,480,400,390,360,430,520,490,580,660,1150];
const captions=['THE SERPENT AWAKENS','IT RISES','THE HUNGER','A WARRIOR APPROACHES','VENOM STRIKE','THE COILS CLOSE','NO ESCAPE','THE FINAL CRUSH','BLOOD FOR THE SERPENT','SILENCE','VICTORY','FATALITY'];
export default function SnakeFatality(){
 const [frame,setFrame]=useState(0),[playing,setPlaying]=useState(false),[repeat,setRepeat]=useState(false),[assetError,setAssetError]=useState(false);
 const audio=useRef<AudioContext|null>(null);
 const start=()=>{setFrame(0);setPlaying(true);};
 useEffect(()=>{if(!playing)return;const timer=window.setTimeout(()=>{if(frame===total-1){if(repeat)setFrame(0);else setPlaying(false)}else setFrame(n=>n+1)},durations[frame]);return()=>clearTimeout(timer)},[playing,frame,repeat]);
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.code==='Space' && !(e.target instanceof HTMLButtonElement)){e.preventDefault();setPlaying(x=>!x)}if(e.key==='ArrowRight'){setPlaying(false);setFrame(x=>Math.min(total-1,x+1))}if(e.key==='ArrowLeft'){setPlaying(false);setFrame(x=>Math.max(0,x-1))}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[]);
 const x=frame%4,y=Math.floor(frame/4);
 return <main className="sf">
 <header><Link href="/">← ELDERNIGHT</Link><span>THE FATALITY FORGE / FINISHER 01</span></header>
 <section className="stage">
  <div className="eyebrow">ZX SPECTRUM // BLACK · WHITE · RED</div><h1>THE SERPENT'S KISS</h1>
  <div className="viewport">
   {!assetError?<div className="sprite" role="img" aria-label={captions[frame]} style={{backgroundPosition:`${x*100/3}% ${y*50}%`}}/>:<div className="missing">SNAKE SPRITE ASSET REQUIRED<br/><small>Upload snake-fatality-sprites.png to public/assets/</small></div>}
   <img alt="" src="/assets/snake-fatality-sprites.png" className="preload" onError={()=>setAssetError(true)} onLoad={()=>setAssetError(false)}/>
  </div>
  <div className="caption">{captions[frame]}</div>
  <div className="track">{Array.from({length:total},(_,i)=><button key={i} aria-label={`Frame ${i+1}`} title={`Frame ${i+1}`} className={i===frame?'active':''} onClick={()=>{setPlaying(false);setFrame(i)}}/>)}</div>
  <div className="actions"><button onClick={start}>▶ PLAY FATALITY</button><button onClick={()=>setPlaying(p=>!p)}>{playing?'Ⅱ PAUSE':'▶ RESUME'}</button><button onClick={()=>{setPlaying(false);setFrame(0)}}>↺ RESET</button><label><input type="checkbox" checked={repeat} onChange={e=>setRepeat(e.target.checked)}/> LOOP</label></div>
  <p className="hint">SPACE to pause · ← → to step frames</p>
 </section>
 <style jsx>{`
 .sf{background:#000;color:#f1eee9;min-height:100vh;font-family:ui-monospace,Consolas,monospace;padding:22px 24px 70px;text-align:center}
 header{display:flex;justify-content:space-between;gap:12px;max-width:1050px;margin:auto;padding-bottom:20px;border-bottom:1px solid #333;font-size:12px;letter-spacing:2px;color:#aaa}header a{color:#f44;text-decoration:none}
 .stage{max-width:940px;margin:35px auto}.eyebrow{color:#e33;font-size:12px;letter-spacing:2px}h1{font-size:clamp(24px,5vw,52px);letter-spacing:4px;margin:16px 0 28px}
 .viewport{display:grid;place-items:center;position:relative;background:#000;border:1px solid #333;min-height:320px;overflow:hidden}
 .sprite{width:min(100%,850px);aspect-ratio:384/341.333;background-image:url('/assets/snake-fatality-sprites.png');background-size:400% 300%;background-repeat:no-repeat;image-rendering:pixelated}
 .preload{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
 .missing{font-size:22px;color:#e33;padding:100px 8px;letter-spacing:1px}.missing small{display:block;font-size:12px;color:#aaa;padding:18px}
 .caption{font-size:clamp(18px,4vw,35px);font-weight:900;color:#fa3030;letter-spacing:4px;min-height:70px;padding:20px 0;text-shadow:2px 2px #500}
 .track{display:flex;justify-content:center;gap:8px;margin:10px 0 28px}.track button{height:11px;width:clamp(13px,4vw,38px);padding:0;background:#444;border:0;cursor:pointer}.track button.active{background:#f33}
 .actions{display:flex;gap:10px;justify-content:center;align-items:center;flex-wrap:wrap}.actions button{border:1px solid #bbb;background:#111;color:white;padding:13px 15px;cursor:pointer;font:inherit;font-size:12px}.actions button:first-child{background:#a00;border-color:#e33}.actions button:hover{border-color:#f33}.actions label{font-size:12px;color:#aaa;display:flex;align-items:center;gap:6px}.actions input{accent-color:red}.hint{color:#777;font-size:11px;margin-top:25px}
 `}</style>
 </main>
}
