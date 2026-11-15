'use client';
import {useEffect,useRef,useState} from 'react';
type Fighter={x:number,hp:number,face:number,attack:number,stun:number,guard:boolean,walk?:number,pose?:number};
type World={p:Fighter,e:Fighter,phase:'fight'|'finish'|'fatality'|'win'|'lose',time:number,frame:number,fx:number,combo:number,step:number,enemyCooldown:number};
const moves=['SWORD STORM','HELLFIRE','SKULL CRUSH'];
export default function Fatality(){
 const canvas=useRef<HTMLCanvasElement>(null),world=useRef<World|null>(null),held=useRef(new Set<string>()),[phase,setPhase]=useState('fight'),[move,setMove]=useState(0),[message,setMessage]=useState('FIGHT!'),[score,setScore]=useState(0),[round,setRound]=useState(1);
 // The source files are complete concept images, not transparent character sprites.
 // Use their central castle artwork as a stage backdrop while keeping the fighters fully animated.
 const [arena,setArena]=useState(0),arenaImage=useRef<HTMLImageElement|null>(null);
 useEffect(()=>{let active=true;const img=new Image();arenaImage.current=null;
 img.onload=()=>{if(active)arenaImage.current=img};
 img.src=arena===0?'/assets/fatality-forge-castle-duel.png':'/assets/fatality-forge-barbarian-vs-skeleton.png';
 if(img.complete&&img.naturalWidth)arenaImage.current=img;
 return()=>{active=false;img.onload=null};},[arena]);
 const start=()=>{world.current={p:{x:68,hp:100,face:1,attack:0,stun:0,guard:false},e:{x:250,hp:100,face:-1,attack:0,stun:0,guard:false},phase:'fight',time:0,frame:0,fx:0,combo:0,step:0,enemyCooldown:35};setPhase('fight');setMessage('FIGHT!')};
 const press=(k:string)=>{held.current.add(k);if(k==='j'||k==='k'||k===' '){const w=world.current;if(!w)return;if(w.phase==='finish'){const expected=['j','k','j'];if(k===expected[w.step]){w.step++;setMessage('COMBO '+w.step+'/3');if(w.step===3){w.phase='fatality';w.fx=110;setPhase('fatality');setMessage(moves[move]+'!');setScore(s=>s+500)}}else{w.step=0;setMessage('COMBO RESET — J K J')}}else if(w.phase==='fight'&&w.p.attack===0&&w.p.stun===0){w.p.attack=k==='k'?18:12;if(Math.abs(w.p.x-w.e.x)<(k==='k'?72:54)&&!w.e.guard){w.e.hp=Math.max(0,w.e.hp-(k==='k'?18:10));w.e.stun=14;w.fx=12;setScore(s=>s+10);if(w.e.hp<=0){w.phase='finish';w.time=0;w.step=0;setPhase('finish');setMessage('FINISH HIM!  J → K → J')}}}}};
 useEffect(()=>{start();return()=>{}},[]);
 useEffect(()=>{const c=canvas.current;if(!c)return;const ctx=c.getContext('2d');if(!ctx)return;ctx.imageSmoothingEnabled=false;let raf=0;const down=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup',' ','j','k','l','a','d'].includes(k)){e.preventDefault();if(!held.current.has(k))press(k)}};const up=(e:KeyboardEvent)=>held.current.delete(e.key.toLowerCase());window.addEventListener('keydown',down);window.addEventListener('keyup',up);
 const rect=(x:number,y:number,w:number,h:number,color:string)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h)};
 const poly=(pts:number[],color:string)=>{ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)ctx.lineTo(pts[i],pts[i+1]);ctx.closePath();ctx.fill()};
 const fighter=(f:Fighter,enemy=false)=>{const x=Math.round(f.x),y=275,white='#f4eee4',shadow='#797681',red=enemy?'#d51b37':'#ed2844',dark='#100b13';ctx.save();const stride=f.walk||0;const bob=stride===1||stride===3?2:0;ctx.translate(x,y+bob);ctx.scale(f.face,1);if(f.stun>0&&f.stun%4<2)ctx.globalAlpha=.55;
 // hand-pixelled silhouette: layered armour, limbs, face, cloth and weapon
 const leftStep=stride===1?-6:stride===3?5:0,rightStep=stride===1?5:stride===3?-6:0;poly([-19+leftStep,-6,-5,-9,2+leftStep,3,-2+leftStep,23,-12+leftStep,25,-17+leftStep,13],dark);poly([2+rightStep,-5,18,-9,19+rightStep,11,16+rightStep,27,5+rightStep,26],dark);
 poly([-16+leftStep,1,-7,1,-5+leftStep,20,-10+leftStep,23,-19+leftStep,21],white);poly([5+rightStep,1,15,1,17+rightStep,21,8+rightStep,23,3+rightStep,18],white);
 for(let i=0;i<5;i++){rect(-17+i*2,8+i*2,2,2,shadow);rect(7+i*2,8+i*2,2,2,shadow)}
 rect(-22+leftStep,21,19,5,dark);rect(3+rightStep,21,19,5,dark);rect(-20+leftStep,20,17,4,red);rect(4+rightStep,20,16,4,red);
 poly([-17,-40,-7,-49,8,-49,19,-40,18,-12,12,1,-12,1,-20,-15],dark);
 poly([-16,-39,-7,-46,9,-46,17,-37,14,-15,7,-5,-9,-5,-16,-17],enemy?red:white);
 poly([-12,-38,-4,-42,4,-37,1,-28,-11,-29],enemy?'#671328':'#b8aeb0');
 poly([5,-40,13,-38,12,-28,4,-27],enemy?'#8b162d':'#ded8d1');
 rect(-13,-22,27,6,dark);rect(-12,-20,24,3,red);
 for(let i=0;i<5;i++)rect(-9+i*5,-13+(i%2)*2,3,2,shadow);
 poly([-16,-40,-24,-33,-22,-15,-16,-11,-10,-29],dark);
 poly([-18,-37,-22,-31,-20,-19,-16,-17,-12,-31],white);
 poly([14,-40,22,-34,24,-17,17,-11,11,-27],dark);
 poly([16,-36,21,-31,21,-21,17,-18,14,-30],white);
 rect(-23,-17,8,5,red);rect(17,-17,8,5,red);
 // illustrated head, helmet or skull
 poly([-12,-66,-8,-75,5,-78,15,-72,18,-59,12,-48,-8,-49,-15,-57],dark);
 if(enemy){poly([-10,-69,-2,-75,10,-71,13,-59,7,-51,-8,-54],white);rect(-7,-63,6,5,dark);rect(4,-63,6,5,dark);rect(0,-57,3,5,dark);for(let i=0;i<5;i++)rect(-7+i*4,-52,2,4,dark);poly([-17,-73,-11,-85,7,-86,20,-72,15,-67,7,-78,-7,-78],red)}
 else{poly([-10,-68,-4,-73,9,-71,13,-60,8,-52,-6,-53,-12,-60],'#f1d7c7');rect(-13,-72,25,6,dark);rect(-14,-70,7,13,dark);rect(8,-71,8,15,dark);rect(5,-64,4,2,dark);rect(-7,-58,14,3,'#6c4142');rect(-5,-55,11,3,dark);rect(-13,-75,19,3,red)}
 // leather belt and pixel highlights
 for(let i=0;i<6;i++)rect(-14+i*5,-44+(i%2)*7,2,2,shadow);
 if(f.guard){poly([18,-57,27,-50,27,-25,18,-17,13,-30,13,-48],dark);poly([18,-53,24,-48,24,-27,18,-22,16,-31,16,-46],red);rect(17,-40,7,3,white)}
 else {poly([18,-22,27,-26,30,-45,25,-48,20,-36],white);rect(25,-49,5,7,dark);
 if(f.attack){const swing=f.attack>12?0:f.attack>6?1:2;if(swing===0){poly([23,-52,36,-103,42,-110,40,-100,32,-48],white);rect(20,-54,17,5,red)}else if(swing===1){poly([23,-52,69,-62,73,-59,32,-44],white);poly([31,-48,70,-59,69,-55,32,-44],shadow);rect(24,-52,12,4,red)}else{poly([24,-45,72,-26,76,-22,67,-23,25,-39],white);rect(23,-44,14,5,red)}}
 else{poly([27,-48,29,-91,33,-98,36,-92,32,-48],white);poly([31,-86,34,-93,34,-53,30,-52],shadow);rect(21,-52,18,4,red);rect(28,-59,4,17,dark)}}
 // individual animation-frame details: hair movement, armour highlights and skeletal joints
 if(!enemy){for(let i=0;i<9;i++){const sway=(stride===1?2:stride===3?-2:0);rect(-16-i%3+sway,-69+i*3,2,4,dark)}rect(-8,-35,4,2,'#fff');rect(5,-35,4,2,'#fff')}else{for(let i=0;i<6;i++){rect(-13+i*5,-32+(i%2)*4,2,3,white)}rect(-20,-43,4,4,red);rect(16,-43,4,4,red)}
 ctx.restore()};
 const draw=()=>{const w=world.current;if(!w)return;w.frame++;if(w.phase==='fight'){w.time++;const p=w.p,e=w.e;const movingLeft=held.current.has('arrowleft')||held.current.has('a'),movingRight=held.current.has('arrowright')||held.current.has('d');if(movingLeft)p.x-=2.4;if(movingRight)p.x+=2.4;p.walk=(movingLeft||movingRight)?Math.floor(w.frame/7)%4:0;p.guard=held.current.has('l');p.x=Math.max(20,Math.min(300,p.x));p.face=p.x<e.x?1:-1;e.face=-p.face;if(p.attack>0)p.attack--;if(e.attack>0)e.attack--;if(p.stun>0)p.stun--;if(e.stun>0)e.stun--;w.enemyCooldown--;if(w.enemyCooldown<=0){const distance=Math.abs(p.x-e.x);if(distance>52){e.x+=Math.sign(p.x-e.x)*9;e.walk=Math.floor(w.frame/8)%4}else if(e.stun===0){e.walk=0;e.attack=15;if(!p.guard){p.hp=Math.max(0,p.hp-8);p.stun=12;w.fx=10;if(p.hp<=0){w.phase='lose';setPhase('lose');setMessage('YOU HAVE FALLEN')}}}w.enemyCooldown=26+Math.floor(Math.random()*22)}}else if(w.phase==='finish'){w.time++;if(w.time>480){w.phase='win';setPhase('win');setMessage('VICTORY — FINISH MISSED');setScore(s=>s+100)}}else if(w.phase==='fatality'){w.fx--;if(w.fx<=0){w.phase='win';setPhase('win');setMessage('FATALITY!');setScore(s=>s+250)}}if(w.fx>0&&w.phase==='fight')w.fx--;
 rect(0,0,320,330,'#08070d');rect(0,0,320,140,'#120b15');
 // gothic red moon and craggy castle silhouette
 ctx.fillStyle='#c31b37';ctx.beginPath();ctx.arc(245,80,45,0,Math.PI*2);ctx.fill();
 for(let i=0;i<70;i++){const xx=(i*79)%320,yy=25+(i*43)%130;rect(xx,yy,i%3===0?2:1,1,i%4?'#4d2635':'#d0b9b9')}
 poly([0,173,28,141,50,155,72,121,91,143,113,106,146,142,176,112,197,141,218,96,243,127,270,105,320,151,320,290,0,290],'#21101c');
 poly([135,196,135,116,146,116,146,98,154,98,154,81,161,81,161,103,170,103,170,130,183,130,183,92,192,92,192,66,200,66,200,91,208,91,208,146,222,146,222,105,231,105,231,83,239,83,239,118,251,118,251,195],'#0b090f');
 for(let i=0;i<11;i++){const xx=i*32;rect(xx,194+(i%3)*9,25,100,'#30232a');rect(xx+5,188+(i%3)*9,5,7,'#7c7479');rect(xx+17,205+(i%3)*9,3,5,'#827d80')}
 // Imported battle painting: crop just the architecture/sky to avoid static duplicate fighters.
 const stageArt=arenaImage.current;
 if(stageArt?.complete&&stageArt.naturalWidth){
   const sx=Math.round(stageArt.naturalWidth*.36);
   const sy=Math.round(stageArt.naturalHeight*.20);
   const sw=Math.round(stageArt.naturalWidth*.38);
   const sh=Math.round(stageArt.naturalHeight*.30);
   ctx.drawImage(stageArt,sx,sy,sw,sh,0,53,320,227);
   rect(0,235,320,46,'rgba(0,0,0,.42)');
 }
 rect(0,286,320,44,'#1b171d');rect(0,287,320,5,'#b0a9a8');
 for(let i=0;i<26;i++){const xx=i*13;rect(xx,293+(i%2)*8,12,6,'#706a72');rect(xx+2,307+(i%3)*6,11,5,'#45404a');rect(xx,325,12,3,'#98939a')}
 for(let i=0;i<4;i++){const xx=i*101+5;rect(xx,163,8,123,'#c1b9b6');rect(xx+8,170,5,116,'#514b55');rect(xx-7,158,27,8,'#e2dad6');rect(xx-4,150,20,6,'#61545d');rect(xx-2,146,16,4,'#a5a0a0');rect(xx+2,210,3,3,'#251820');rect(xx+2,241,3,3,'#251820')}
 rect(10,10,138,12,'#4d1824');rect(172,10,138,12,'#4d1824');rect(10,10,138*w.p.hp/100,12,'#ed304c');rect(172,10,138*w.e.hp/100,12,'#ed304c');ctx.font='bold 9px monospace';ctx.fillStyle='#fff';ctx.fillText('BARBARIAN',10,34);ctx.fillText('WARLOCK',265,34);ctx.fillText('ROUND '+round,137,49);
 fighter(w.p);if(w.phase!=='fatality'||w.fx>55)fighter(w.e,true);if(w.phase==='fatality'){for(let i=0;i<35;i++){const a=i*2.4+w.frame*.2;rect(w.e.x+Math.sin(a)*((110-w.fx)*.5),235+Math.cos(a)*((110-w.fx)*.45),3,3,i%2?'#f33':'#eee')}if(move===1)for(let i=0;i<14;i++)rect(w.e.x-20+(i*11)%40,290-((w.frame*3+i*19)%95),5,18,'#f33');if(move===2)rect(w.e.x-35,180,70,8,'#f33')}
 if(w.phase==='finish'||w.phase==='fatality'){ctx.textAlign='center';ctx.font='bold 21px monospace';ctx.fillStyle=w.frame%25<18?'#f33':'#fff';ctx.fillText(w.phase==='finish'?'FINISH HIM!':'FATALITY!',160,137);ctx.textAlign='left'}if(w.phase==='lose'||w.phase==='win'){ctx.textAlign='center';ctx.font='bold 24px monospace';ctx.fillStyle='#fff';ctx.fillText(w.phase==='win'?'YOU WIN':'YOU LOSE',160,145);ctx.textAlign='left'}raf=requestAnimationFrame(draw)};raf=requestAnimationFrame(draw);return()=>{cancelAnimationFrame(raf);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}},[move,round]);
 const button=(label:string,key:string)=><button onPointerDown={e=>{e.preventDefault();press(key)}} onPointerUp={()=>held.current.delete(key)} onPointerCancel={()=>held.current.delete(key)} onPointerLeave={()=>held.current.delete(key)} style={{background:'#24131c',border:'2px solid #d82b49',color:'#fff',padding:'14px 16px',font:'bold 15px monospace',touchAction:'none'}}>{label}</button>;
 return <main style={{background:'#09070d',color:'#eee',minHeight:'100vh',fontFamily:'monospace',textAlign:'center',padding:'18px 10px'}}><a href="/arcade" style={{color:'#fff'}}>← RETRO ARCADE</a><h1 style={{color:'#ef314c',fontSize:'clamp(24px,7vw,44px)',margin:'16px 0 0'}}>FATALITY FORGE</h1><p style={{letterSpacing:3,fontSize:12}}>BARBARIAN SWORD DUELS · 8-BIT FINISHERS</p><div style={{maxWidth:820,margin:'auto'}}><img src="/assets/fatality-forge-barbarian-vs-skeleton.png" alt="Fatality Forge concept battle showing a barbarian and skeletal knight beneath a red moon" style={{width:'100%',maxHeight:380,objectFit:'cover',objectPosition:'center 46%',imageRendering:'pixelated',border:'3px solid #eee',display:'block',margin:'0 auto 14px'}}/><p style={{color:'#a9a5ab',fontSize:11,letterSpacing:2}}>ART REFERENCE ABOVE · PLAYABLE BATTLE BELOW</p><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,margin:'12px auto',flexWrap:'wrap'}}><span style={{fontSize:12,color:'#ddd'}}>CHOOSE ARENA:</span><button onClick={()=>setArena(0)} style={{padding:'8px 12px',background:arena===0?'#b91532':'#21151e',color:'#fff',border:'1px solid #ff4560'}}>CASTLE DUEL</button><button onClick={()=>setArena(1)} style={{padding:'8px 12px',background:arena===1?'#b91532':'#21151e',color:'#fff',border:'1px solid #ff4560'}}>BLOOD MOON</button></div><div style={{maxWidth:640,margin:'auto'}}><canvas ref={canvas} width={320} height={330} style={{width:'100%',imageRendering:'pixelated',border:'3px solid #eee',background:'#08070d'}}/><p style={{color:'#f44',fontWeight:'bold',minHeight:20}}>{message}</p><div style={{display:'flex',gap:6,justifyContent:'center',flexWrap:'wrap'}}>{button('◀','arrowleft')}{button('▶','arrowright')}{button('SWORD J','j')}{button('HEAVY K','k')}{button('BLOCK L','l')}</div><p style={{fontSize:12,color:'#aaa'}}>MOVE: ← → / A D · SWORD: J · HEAVY: K · BLOCK: L</p><div style={{border:'2px solid #642035',padding:14,marginTop:16}}><h2 style={{fontSize:17}}>DESIGN YOUR FATALITY</h2><p style={{fontSize:12}}>Choose a finishing style. Defeat your opponent, then enter J → K → J.</p><div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>{moves.map((m,i)=><button key={m} onClick={()=>setMove(i)} style={{padding:10,color:'#fff',background:move===i?'#ae1733':'#20151e',border:'1px solid #ef314c',fontFamily:'monospace'}}>{m}</button>)}</div></div><p>SCORE: {score}</p><button onClick={()=>{setRound(r=>r+1);start()}} style={{background:'#e62b49',color:'#fff',border:0,padding:'15px 25px',font:'bold 16px monospace'}}>NEW ROUND / RETRY</button><details style={{margin:'20px auto 8px',padding:12,border:'1px solid #743244',textAlign:'left'}}><summary style={{cursor:'pointer',color:'#fff',fontWeight:'bold'}}>VIEW FATALITY DESIGN ARTWORK</summary><p style={{fontSize:12,color:'#d4cad0',marginTop:12}}>Original design reference for the fatality builder. The playable combat and three selectable finishers above remain interactive.</p><img src="/assets/fatality-forge-ui-concept.png" alt="Retro black-and-red Fatality Forge design interface artwork" loading="lazy" style={{width:'100%',maxHeight:540,objectFit:'contain',imageRendering:'pixelated'}}/></details></div></div></main>
}