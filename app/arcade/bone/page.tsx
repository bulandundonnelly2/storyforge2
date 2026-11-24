'use client';
import {useEffect,useRef,useState} from 'react';

type Phase='ready'|'fight'|'win'|'lose'|'locked';
type Shot={x:number;y:number;vx:number;vy:number};
type Enemy={x:number;y:number;hp:number;seed:number};
export default function BoneBoss(){
 const canvas=useRef<HTMLCanvasElement>(null),keys=useRef(new Set<string>()),touch=useRef<{x:number;y:number}|null>(null),[phase,setPhase]=useState<Phase>('ready'),[run,setRun]=useState(0),[muted,setMuted]=useState(false),audio=useRef<AudioContext|null>(null),sound=useRef(true);
 useEffect(()=>{try{if(sessionStorage.getItem('eldernight-bone-boss')!=='unlocked')setPhase('locked')}catch{setPhase('locked')}},[]);
 useEffect(()=>{sound.current=!muted},[muted]);
 useEffect(()=>()=>{audio.current?.close().catch(()=>{})},[]);
 const tone=(freq:number,duration=.07)=>{if(!sound.current||!audio.current)return;try{const a=audio.current,o=a.createOscillator(),g=a.createGain();o.type='square';o.frequency.setValueAtTime(freq,a.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(35,freq/2),a.currentTime+duration);g.gain.setValueAtTime(.035,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+duration);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+duration)}catch{}};
 const start=()=>{try{audio.current??=new AudioContext();audio.current.resume().catch(()=>{})}catch{}keys.current.clear();touch.current=null;setRun(x=>x+1);setPhase('fight')};
 useEffect(()=>{
  const cv=canvas.current,ctx=cv?.getContext('2d');if(!cv||!ctx)return;
  ctx.imageSmoothingEnabled=false;
  const W=640,H=320;let frame=0,raf=0,last=0,debt=0,px=72,py=160,hp=3,inv=0,score=0,bossHP=160,ended=false,cool=0,bossY=160,bossX=760;
  let bullets:Shot[]=[],hazards:Shot[]=[],enemies:Enemy[]=[];const stars=Array.from({length:100},(_,i)=>({x:(i*137.31)%W,y:(i*79.17)%H,s:1+i%3,v:.4+i%4*.45}));
  const rect=(x:number,y:number,w:number,h:number,c:string)=>{ctx.fillStyle=c;ctx.fillRect(Math.floor(x),Math.floor(y),w,h)};
  const poly=(a:number[],c:string)=>{ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(a[0],a[1]);for(let i=2;i<a.length;i+=2)ctx.lineTo(a[i],a[i+1]);ctx.closePath();ctx.fill()};
  const label=(s:string,x:number,y:number,c='#fff',size=12)=>{ctx.fillStyle=c;ctx.font='bold '+size+'px monospace';ctx.fillText(s,x,y)};
  const hit=()=>{if(inv>0)return;hp--;inv=100;tone(75,.18);if(hp<=0){ended=true;setPhase('lose')}};
  const win=()=>{ended=true;tone(660,.45);setPhase('win');try{sessionStorage.setItem('eldernight-bone-victory','yes')}catch{}};
  const down=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' '].includes(k)){e.preventDefault();keys.current.add(k)}};
  const up=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase());const blur=()=>{keys.current.clear();touch.current=null};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);
  const tick=()=>{
   frame++;if(phase!=='fight'||ended)return;
   const k=keys.current;const dx=Number(k.has('arrowright')||k.has('d'))-Number(k.has('arrowleft')||k.has('a')),dy=Number(k.has('arrowdown')||k.has('s'))-Number(k.has('arrowup')||k.has('w'));
   px=Math.max(18,Math.min(385,px+dx*3.5));py=Math.max(40,Math.min(H-24,py+dy*3.5));
   if(touch.current){px+=Math.max(-5,Math.min(5,touch.current.x-px));py+=Math.max(-5,Math.min(5,touch.current.y-py));px=Math.max(18,Math.min(385,px));py=Math.max(40,Math.min(H-24,py))}
   if(inv>0)inv--;if(cool>0)cool--;
   if((k.has(' ')||touch.current)&&cool===0){bullets.push({x:px+18,y:py,vx:8.5,vy:0});cool=7;tone(310,.035)}
   if(frame<850&&frame%68===1)enemies.push({x:W+25,y:48+(frame*37)%238,hp:3,seed:frame});
   for(const e of enemies){e.x-=2.1;e.y+=Math.sin((frame+e.seed)/25)*.7;if((frame+e.seed)%100===0)hazards.push({x:e.x,y:e.y,vx:-3.4,vy:(py-e.y)/100});if(Math.abs(e.x-px)<22&&Math.abs(e.y-py)<15){hit();e.hp=0}}
   if(frame>=870){bossX=Math.max(505,bossX-1.6);bossY=160+Math.sin(frame/75)*47;if(bossX<=525&&frame%42===0){const a=Math.atan2(py-bossY,px-bossX);for(const off of [-.23,0,.23])hazards.push({x:bossX-58,y:bossY-10,vx:Math.cos(a+off)*3.7,vy:Math.sin(a+off)*3.7});tone(110,.11)}if(bossHP<80&&frame%23===0)hazards.push({x:bossX-55,y:bossY+40,vx:-4.5,vy:Math.sin(frame)*2.5});if(Math.abs(px-bossX)<75&&Math.abs(py-bossY)<80)hit()}
   for(const b of bullets){b.x+=b.vx;for(const e of enemies){if(e.hp>0&&Math.abs(b.x-e.x)<15&&Math.abs(b.y-e.y)<12){e.hp--;b.x=W+100;if(e.hp===0){score+=100;tone(140,.1)}break}}if(frame>=870&&b.x<W+50&&Math.abs(b.x-(bossX-35))<24&&Math.abs(b.y-(bossY+12))<37){bossHP--;b.x=W+100;score+=10;if(bossHP<=0){win();break}}}
   for(const b of hazards){b.x+=b.vx;b.y+=b.vy;if(Math.abs(b.x-px)<12&&Math.abs(b.y-py)<9){hit();b.x=-100}}
   bullets=bullets.filter(b=>b.x<W+20);hazards=hazards.filter(b=>b.x>-30&&b.x<W+80&&b.y>20&&b.y<H+20);enemies=enemies.filter(e=>e.hp>0&&e.x>-30);
  };
  const drawSkull=()=>{
   const x=bossX,y=bossY;ctx.save();ctx.translate(Math.round(x),Math.round(y));const r=(a:number,b:number,w:number,h:number,c:string)=>rect(a,b,w,h,c);
   // Layered, stepped armour plates and machine ribs, drawn at native pixel resolution.
   for(let i=0;i<8;i++){const z=i*9;r(32+z,-63+z%24,42,9,'#2d175c');r(40+z,-59+z%24,34,3,'#884fc6');r(32+z,40-z%20,39,8,'#154b69');r(35+z,42-z%20,30,2,'#38d8ee')}
   poly([-76,-42,-67,-65,-49,-81,18,-88,53,-72,69,-48,65,6,49,28,34,39,30,66,9,77,-39,73,-55,58,-57,35,-76,12],'#171525');
   poly([-70,-42,-60,-64,-44,-75,16,-80,44,-66,56,-44,53,-11,39,16,23,29,19,49,-34,50,-43,33,-63,14],'#c8d0cc');
   poly([-63,-42,-51,-61,-25,-69,11,-70,31,-58,37,-28,19,-15,-10,-19,-33,-8,-57,-18],'#edf2e8');
   poly([-60,-11,-32,-24,-14,-8,-20,16,-48,20,-63,6],'#070710');poly([0,-16,29,-25,46,-9,39,11,15,18,2,6],'#070710');
   r(-48,-8,24,9,'#ff244d');r(12,-9,24,9,'#ff244d');r(-42,-6,13,3,'#fff');r(18,-7,13,3,'#fff');
   poly([-14,10,-3,0,9,17,-1,28,-16,23],'#252335');
   r(-48,36,70,15,'#080910');for(let i=0;i<8;i++){r(-45+i*9,34,6,12,'#d9e5dc');r(-45+i*9,51,6,8,'#a8a7b0')}
   r(-36,63,55,8,'#697187');r(-32,65,43,2,'#e8f0ef');
   for(let i=0;i<90;i++){const xx=-56+(i*29)%105,yy=-62+(i*47)%120;if((yy<-28||xx>45||yy>55)&&i%3===0)r(xx,yy,2,2,i%2?'#6e718b':'#10111e')}
   r(-74,-40,6,47,'#6d36bd');r(45,-50,8,45,'#7145ad');r(47,-46,4,33,'#50e4ff');
   // Pulsing neural target.
   r(-49,-15,5,54,'#4d245e');r(-53,5,13,17,'#00c7ee');r(-50,9,7,8,frame%12<6?'#fff':'#f4278e');
   ctx.restore();
  };
  const paint=()=>{
   rect(0,0,W,H,'#050510');
   for(const s of stars){const x=((s.x-frame*s.v)%W+W)%W;rect(x,s.y,s.s,s.s,s.s===3?'#753eb2':s.s===2?'#1d789d':'#37395d')}
   // Scrolling industrial superstructure, with repeating hand-pixelled trusses.
   const offset=(frame*.8)%128;
   for(let i=-1;i<7;i++){const x=i*128-offset;rect(x,24,115,18,'#201035');rect(x,26,112,3,'#7036a1');rect(x,278,115,42,'#19102b');rect(x,283,110,3,'#502b85');for(let j=0;j<6;j++){rect(x+j*18,33,9,5,'#13445e');rect(x+j*18,290,12,19,'#34205f');rect(x+j*18+3,292,3,12,'#15718a')}poly([x,39,x+8,39,x+31,79,x+24,79],'#292044');poly([x+82,278,x+90,278,x+115,241,x+107,241],'#30204b');for(let j=0;j<35;j++){rect(x+(j*19)%110,282+(j*13)%36,2,2,j%3?'#472879':'#1b7494')}}
   for(const e of enemies){poly([e.x-17,e.y,e.x-4,e.y-10,e.x+17,e.y-7,e.x+9,e.y,e.x+17,e.y+7,e.x-4,e.y+10],'#8044bf');rect(e.x-10,e.y-3,18,6,'#64e8ff');rect(e.x+5,e.y-2,6,4,'#fff')}
   if(frame>=870||phase==='ready')drawSkull();
   if(inv%8<4||inv===0){poly([px-17,py-7,px+2,py-7,px+19,py,px+2,py+7,px-17,py+7,px-10,py],'#d7e4eb');poly([px-7,py-4,px+7,py-4,px+15,py,px-5,py+2],'#147fa7');rect(px-24-(frame%4),py-2,12+frame%4,4,'#13d6fc');rect(px-20,py-1,8,2,'#fff')}
   for(const b of bullets){rect(b.x,b.y-1,10,3,'#78edff');rect(b.x+7,b.y,5,1,'#fff')}for(const b of hazards){rect(b.x-3,b.y-3,6,6,'#ef235c');rect(b.x-1,b.y-1,2,2,'#fff')}
   rect(0,0,W,23,'#090713');label('PILOT 07  '+('♥ '.repeat(Math.max(0,hp))),10,16,'#74e8fc');label('SCORE '+String(score).padStart(5,'0'),238,16);if(frame>=870){label('OSSUARY',455,15,'#f95b88');rect(523,7,106,9,'#30152d');rect(523,7,Math.max(0,bossHP)/160*106,9,'#df285b')}else label('APPROACH '+Math.min(100,Math.floor(frame/8.7))+'%',475,16,'#ac80e6');
   if(frame>780&&frame<890&&phase==='fight')label('WARNING: OSSUARY CORE',202,155,'#ff4d80',17);
  };
  const loop=(t:number)=>{if(!last)last=t;debt=Math.min(50,debt+t-last);last=t;while(debt>=1000/60){tick();debt-=1000/60}paint();raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur)};
 },[phase==='fight',run]);
 // Keep result screen above the canvas; entering or leaving the battle clears controls.
 const move=(e:React.PointerEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect();touch.current={x:(e.clientX-r.left)*640/r.width,y:(e.clientY-r.top)*320/r.height}};
 return <main style={{minHeight:'100vh',background:'#050510',color:'#e3e9f3',fontFamily:'monospace',textAlign:'center',padding:'20px 12px'}}><a href="/#bone" style={{color:'#af8af0'}}>← SPIT OUT THE BONE</a><h1 style={{color:'#bd76ff',fontSize:'clamp(22px,5vw,44px)',letterSpacing:3}}>SPIT OUT THE BONE</h1><p style={{color:'#58e9ff',letterSpacing:2}}>SECRET LEVEL · OSSUARY CORE</p><div style={{maxWidth:1200,margin:'auto',position:'relative'}}><canvas ref={canvas} width={640} height={320} onPointerDown={e=>{if(phase==='fight'){e.currentTarget.setPointerCapture(e.pointerId);move(e)}}} onPointerMove={e=>{if(touch.current)move(e)}} onPointerUp={()=>{touch.current=null}} onPointerCancel={()=>{touch.current=null}} style={{display:'block',width:'100%',height:'auto',imageRendering:'pixelated',border:'2px solid #7546ba',touchAction:'none',boxSizing:'border-box'}}/>{phase!=='fight'&&<section style={{position:'absolute',inset:'0',display:'flex',alignItems:'center',justifyContent:'center',background:'#05051088'}}><div style={{background:'#080713',border:'2px solid #9c59ec',padding:'clamp(12px,3vw,32px)',maxWidth:'78%'}}><h2 style={{color:'#fff',fontSize:'clamp(16px,3.5vw,32px)'}}>{phase==='locked'?'SECRET LEVEL LOCKED':phase==='win'?'HUMANITY SURVIVES':phase==='lose'?'TRANSMISSION LOST':'DESTROY OSSUARY'}</h2><p style={{color:'#61eaff',fontSize:'clamp(10px,1.6vw,16px)'}}>{phase==='win'?'The machine consensus collapses. Free will returns.':phase==='locked'?'Find the true path in the story.':phase==='lose'?'The interceptor was destroyed. Try again.':'Three lives. One interceptor. No surrender.'}</p>{phase==='locked'||phase==='win'?<a href="/#bone" style={{color:'#fff'}}>RETURN TO THE STORY →</a>:<button onClick={start} style={{background:'#6e37ad',border:'2px solid #c58aff',color:'#fff',font:'bold 16px monospace',padding:'12px 22px',cursor:'pointer'}}>{phase==='lose'?'RETRY MISSION':'START MISSION'}</button>}</div></section>}</div><p>MOVE: ARROWS / WASD · FIRE: SPACE · TOUCH: DRAG TO MOVE AND FIRE</p><p style={{color:'#a994c5'}}>Survive the approach, then aim at the skull’s glowing neural core.</p><button onClick={()=>setMuted(v=>!v)} style={{background:'#211638',color:'#fff',border:'1px solid #895ac7',padding:'9px 15px',cursor:'pointer'}}>{muted?'SOUND OFF':'SOUND ON'}</button></main>
}
