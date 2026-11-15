'use client';
import {useEffect,useRef,useState} from 'react';
import {createDuel,advanceDuel,ATTACKS,type Fighter,type World,type Strike,type CombatEvent} from './combat';
import {makeDuelAudio,type DuelAudio} from './audio';
import {makeSpectrumMusic,type SpectrumMusic} from './music';
import {FINISHER_FRAMES,finisherAge,hasFinisherScene,drawFinisherBackdrop,drawFinisherSequence} from './cinematic';
const moves=['DECAPITATION','HELLFIRE','SKULL CRUSH'];
export default function Fatality(){
 const canvas=useRef<HTMLCanvasElement>(null),world=useRef<World|null>(null),held=useRef(new Set<string>()),queued=useRef<Strike|null>(null),audio=useRef<DuelAudio|null>(null),music=useRef<SpectrumMusic|null>(null),[musicOn,setMusicOn]=useState(true),[soundOn,setSoundOn]=useState(true),[phase,setPhase]=useState('fight'),[move,setMove]=useState(0),[message,setMessage]=useState('FIGHT!'),[score,setScore]=useState(0),[round,setRound]=useState(1);
 // The source files are complete concept images, not transparent character sprites.
 // Use their central castle artwork as a stage backdrop while keeping the fighters fully animated.
 const [arena,setArena]=useState(0),arenaImage=useRef<HTMLImageElement|null>(null);
 const sprites=useRef<Record<'barbarian'|'knight'|'fx'|'headless',HTMLImageElement|null>>({barbarian:null,knight:null,fx:null,headless:null});
 useEffect(()=>{
   let active=true;
   const sources:[keyof typeof sprites.current,string][]=[
     ['barbarian','/assets/fatality-barbarian-sprites.webp'],
     ['knight','/assets/fatality-knight-sprites.webp'],
     ['fx','/assets/fatality-fx-sprites.webp'],
     ['headless','/assets/fatality-knight-headless-poses.webp']
   ];
   const pending=sources.map(([key,path])=>{
     const image=new Image();
     image.onload=()=>{if(active)sprites.current[key]=image};
     image.onerror=()=>{if(active)sprites.current[key]=null};
     image.src=path;
     if(image.complete&&image.naturalWidth&&active)sprites.current[key]=image;
     return image;
   });
   return()=>{active=false;pending.forEach(image=>{image.onload=null;image.onerror=null})};
 },[]);
 useEffect(()=>{let active=true;const img=new Image();arenaImage.current=null;
 img.onload=()=>{if(active)arenaImage.current=img};
 img.src=arena===0?'/assets/fatality-forge-castle-duel.png':'/assets/fatality-forge-barbarian-vs-skeleton.png';
 if(img.complete&&img.naturalWidth)arenaImage.current=img;
 return()=>{active=false;img.onload=null};},[arena]);
 const start=()=>{world.current=createDuel();held.current.clear();queued.current=null;setPhase('fight');setMessage('FIGHT!')};
 const playSound=(event:CombatEvent)=>{if(!soundOn)return;if(!audio.current)audio.current=makeDuelAudio();audio.current.play(event)};
 useEffect(()=>()=>{audio.current?.dispose();audio.current=null;music.current?.dispose();music.current=null},[]);
 const startMusic=()=>{if(!music.current)music.current=makeSpectrumMusic();music.current.start()};
 const press=(k:string)=>{held.current.add(k);const w=world.current;if(!w)return;if(musicOn&&w.phase==='fight')startMusic();if(soundOn&&!audio.current)audio.current=makeDuelAudio();
 if(k==='j'||k==='k'||k==='i'||k===' '){
  if(w.phase==='finish'){
   const expected=['j','k','j'];if(k===expected[w.step]){w.step++;setMessage('FINISHER '+w.step+'/3');if(w.step===3){w.phase='fatality';w.fx=FINISHER_FRAMES;w.finisherDone=true;w.freeze=0;w.shake=0;w.impactKind=null;music.current?.stop();setPhase('fatality');setMessage(moves[move]+'!');setScore(v=>v+500);playSound({type:'finish',who:'p'})}}else{w.step=0;setMessage('FINISHER RESET — J K J')}
  }else if(w.phase==='fight')queued.current=k==='k'?'overhead':k==='i'?'low':'body';
 }
};
 useEffect(()=>{start();return()=>{}},[]);
 useEffect(()=>{const c=canvas.current;if(!c)return;const ctx=c.getContext('2d');if(!ctx)return;ctx.imageSmoothingEnabled=false;let raf=0;const down=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup','arrowdown',' ','j','k','i','l','a','d','s'].includes(k)){e.preventDefault();if(!held.current.has(k))press(k)}};const up=(e:KeyboardEvent)=>held.current.delete(e.key.toLowerCase());window.addEventListener('keydown',down);window.addEventListener('keyup',up);
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
 const fighterSprite=(f:Fighter,enemy=false)=>{
   const img=sprites.current[enemy?'knight':'barbarian'];
   // Preserve the current playable artwork if the new sheet has not yet been uploaded.
   if(!img?.complete||img.naturalWidth!==1024){fighter(f,enemy);return}
   let frame=0;
   const phase=world.current?.phase;
   if(phase==='fatality'&&enemy)frame=(world.current?.fx||0)>52?12:15;
   else if(phase==='fatality')frame=(world.current?.fx||0)>65?10:15;
   else if(phase==='finish'&&enemy)frame=world.current&&world.current.frame%25<12?12:13;
   else if(phase==='lose'&&!enemy)frame=13;
   else if(f.stun>0)frame=f.stun>7?12:13;
   else if(f.guard)frame=enemy?6:7;
   else if(f.crouch)frame=enemy?6:6;
   else if(f.action){
      const data=ATTACKS[f.action],at=f.actionFrame,wind=data.windup,hit=data.active;
      if(f.action==='overhead')frame=at<wind?10:at<wind+hit?11:10;
      else if(f.action==='low')frame=at<wind?6:at<wind+hit?11:7;
      else frame=at<wind?8:at<wind+hit?9:10;
   }
   else if(f.walk>=0)frame=2+(f.walk%4);
   else frame=world.current&&Math.floor(world.current.frame/38)%2?1:0;
   // Sprite cells are square but the fighters are tall; keep silhouettes upright and leave room between them.
   const unit=256,renderWidth=190,renderHeight=190,ground=347;
   ctx.save();ctx.translate(Math.round(f.x),0);ctx.scale(f.face,1);
   if(f.stun>0&&f.stun%4<2)ctx.globalAlpha=.8;
   ctx.drawImage(img,(frame%4)*unit,Math.floor(frame/4)*unit,unit,unit,-renderWidth/2,ground-renderHeight,renderWidth,renderHeight);
   ctx.restore();
 };
 const renderSpriteEffect=(frame:number,x:number,y:number,size=68)=>{
   const img=sprites.current.fx;
   if(!img?.complete||img.naturalWidth!==1024)return;
   const unit=256;ctx.drawImage(img,(frame%4)*unit,Math.floor(frame/4)*unit,unit,unit,Math.round(x-size/2),Math.round(y-size/2),size,size)
 };
 const draw=()=>{const w=world.current;if(!w)return;
 const direction=(held.current.has('arrowright')||held.current.has('d')?1:0)-(held.current.has('arrowleft')||held.current.has('a')?1:0);
 const controls={direction,guard:held.current.has('l'),crouch:held.current.has('s')||held.current.has('arrowdown'),strike:queued.current};
 queued.current=null;
 const events=advanceDuel(w,controls);
 if(hasFinisherScene(w)&&w.phase==='fatality'){
   const age=finisherAge(w);
   if(age===(move===0?26:57))playSound({type:'finisherCharge',who:'p'});
   if(move===0&&(age===137||age===186))playSound({type:'finisherSmash',who:'p'});
   const strikes=move===0?[111]:move===1?[151]:[149];
   if(strikes.includes(age))playSound({type:age===strikes[strikes.length-1]?'finisherFinal':'finisherSmash',who:'p'});
 }
 for(const event of events){
   playSound(event);
   if(event.type==='hit'){setScore(v=>v+(event.who==='p'?event.damage||0:0));setMessage(event.who==='p'?'SOLID HIT':'YOU WERE STRUCK')}
   else if(event.type==='parry'){if(event.who==='p')setScore(v=>v+10);setMessage(event.who==='p'?'PARRY!':'BLADE DEFLECTED')}
   else if(event.type==='block')setMessage(event.who==='p'?'BLOCKED':'BLADE STOPPED');
   else if(event.type==='exhausted')setMessage('EXHAUSTED — RECOVER STAMINA');
   else if(event.type==='swing'&&event.who==='p')setMessage(event.strike==='overhead'?'HEAVY OVERHEAD':event.strike==='low'?'LOW SWEEP':'SWORD SLASH');
   else if(event.type==='finish'){setPhase('finish');setMessage('FINISH HIM!  J → K → J')}
   else if(event.type==='lose'){setPhase('lose');setMessage('YOU HAVE FALLEN')}
   else if(event.type==='win'){setPhase('win');setMessage('VICTORY')}
 }
 ctx.save();if(w.shake>0&&w.freeze>0){ctx.translate((w.frame%3-1)*Math.min(4,w.shake*.35),(w.frame%2?1:-1)*Math.min(3,w.shake*.25))}
 rect(0,0,800,390,'#020203');
 const scenery=arenaImage.current;
 if(scenery?.complete&&scenery.naturalWidth){
   // A layered 2:1 arena assembled only from architecture, castle, moon and stone in uploaded artwork.
   const isCastle=arena===0;
   const crop=(sx:number,sy:number,sw:number,sh:number,dx:number,dy:number,dw:number,dh:number)=>{
     ctx.drawImage(scenery,sx,sy,sw,sh,dx,dy,dw,dh);
   };
   if(isCastle){
     crop(500,170,660,305,172,57,456,230);
     crop(10,207,310,458,0,57,171,270);
     crop(1320,207,285,458,630,57,170,270);
     rect(170,260,460,73,'#050505');
     for(const x of [153,325,497])crop(700,612,175,69,x,264,175,69);
     crop(0,785,1626,58,0,329,800,58);
   }else{
     crop(540,205,720,285,185,47,430,190);
     crop(8,225,278,425,0,58,168,255);
     crop(1378,225,287,425,632,58,168,255);
     rect(165,230,469,100,'#020204');
     for(const x of [168,332,495])crop(710,555,170,108,x,218,170,115);
     rect(160,311,480,19,'#060607');
     for(const x of [152,252,352,452,552])crop(700,641,195,56,x,286,104,43);
     crop(0,800,1672,37,0,331,800,52);
   }
   rect(0,326,800,5,'#09090b');
 }else{
   // Atmospheric fallback while high-detail arena imagery loads.
   rect(0,58,800,270,'#08060d');
   ctx.fillStyle='#a91429';ctx.beginPath();ctx.arc(400,149,79,0,Math.PI*2);ctx.fill();
   for(let x=0;x<800;x+=25)rect(x,320,23,12,'#474047');
   rect(0,333,800,57,'#201d22');
 }
 // Clean integrated game HUD, instead of stretching the HUD baked into the concept painting.
 rect(0,0,800,57,'#050409');
 rect(25,14,290,14,'#3c101a');rect(485,14,290,14,'#3c101a');
 rect(25,14,290*w.p.hp/100,14,'#e21c36');rect(485,14,290*w.e.hp/100,14,'#e21c36');
 ctx.fillStyle='#f4f4f4';ctx.font='bold 16px monospace';ctx.textAlign='left';
 ctx.fillText('BARBARIAN',25,47);ctx.textAlign='right';ctx.fillText('SKELETAL KNIGHT',775,47);
 ctx.textAlign='center';ctx.font='bold 27px monospace';ctx.fillText(String(Math.max(0,99-Math.floor(w.time/60))),400,34);ctx.textAlign='left';
 rect(25,54,290,5,'#26232c');rect(485,54,290,5,'#26232c');rect(25,54,290*w.p.stamina/100,5,'#c9b8a1');rect(485,54,290*w.e.stamina/100,5,'#c9b8a1');
 if(hasFinisherScene(w)){
  drawFinisherBackdrop(ctx,w);
  // Draw each fighter exactly once, using the selected atlas frame and staging position.
  // Portraits never float over the arena or duplicate already-rendered combat sprites.
  drawFinisherSequence(ctx,w,move,(who,frame,x,ground,size,rotation,alpha,headless=false,spin=0)=>{
   const img=sprites.current[who==='barbarian'?'barbarian':'knight'];
   const f=who==='barbarian'?w.p:w.e;
   ctx.save();
   ctx.translate(Math.round(x),Math.round(ground));
   ctx.rotate(rotation);
   // Full-width pose-based turning: switch facing through the back half of
   // the leap instead of compressing the fighter to a thin line. The distinct
   // atlas frames supply the rotation impression while the silhouette stays crisp.
   const turnedAway=spin>Math.PI*.5&&spin<Math.PI*1.5;
   ctx.scale(f.face*(turnedAway?-1:1),1);
   ctx.globalAlpha=Math.max(0,Math.min(1,alpha));
   if(img?.complete&&img.naturalWidth===1024){
    const u=256,sx=(frame%4)*u,sy=Math.floor(frame/4)*u;
    if(headless&&who==='knight'){
      const pose=sprites.current.headless;
      if(pose?.complete&&pose.naturalWidth===1024&&pose.naturalHeight===256){
        // The four 256px cells are original, pre-masked standing/stagger/kneel/collapse poses.
        const poseIndex=Math.max(0,Math.min(3,frame));
        ctx.drawImage(pose,poseIndex*256,0,256,256,-size/2,-size,size,size);
      }else{
        // Fallback to the existing knight atlas while the dedicated sheet loads.
        ctx.drawImage(img,sx,sy,u,u,-size/2,-size,size,size);
      }
    }else{
      ctx.drawImage(img,sx,sy,u,u,-size/2,-size,size,size);
    }
   }else{
    // Keep a visible silhouette on slow connections while atlases load.
    ctx.fillStyle=who==='barbarian'?'#eee6db':'#bcbbc1';
    ctx.fillRect(-29,-117,58,103);
    ctx.fillStyle='#e02042';ctx.fillRect(-39,-40,78,10);
   }
   ctx.restore();
  },(x,y,rotation,size)=>{
   // An original skull-only sprite, drawn as crisp 8-bit pixels.
   // Do NOT crop the helmet from the knight atlas: it includes shoulders and armour.
   ctx.save();
   ctx.translate(Math.round(x),Math.round(y));
   ctx.rotate(rotation);
   const p=size/16;
   const skull=[
     '.....XXXXXX.....',
     '...XXXXXXXXXX...',
     '..XXXXXXXXXXXX..',
     '.XXXXXXXXXXXXXX.',
     '.XXXXXXXXXXXXXX.',
     '.XXX...XX...XXX.',
     '.XX....XX....XX.',
     '.XXX...XX...XXX.',
     '.XXXXXXXXXXXXXX.',
     '..XXXXXXXXXXXX..',
     '..XXXX.XX.XXXX..',
     '...XXXXXXXXXX...',
     '....XXXXXXXX....',
     '.....XXXXXX.....',
     '.....X.X.X......',
     '......XXX.......'
   ];
   for(let row=0;row<skull.length;row++){
    for(let col=0;col<16;col++){
     if(skull[row][col]==='X'){
      ctx.fillStyle=(row>=13?'#e5ddd2':row===0||col===1||col===14?'#c3b9af':'#f3eee7');
      ctx.fillRect(Math.round((col-8)*p),Math.round((row-8)*p),Math.ceil(p),Math.ceil(p));
     }
    }
   }
   // Dark recessed eye sockets and nasal cavity make it unmistakably a skull.
   ctx.fillStyle='#050406';
   ctx.fillRect(Math.round(-5*p),Math.round(-2*p),Math.ceil(3*p),Math.ceil(3*p));
   ctx.fillRect(Math.round(2*p),Math.round(-2*p),Math.ceil(3*p),Math.ceil(3*p));
   ctx.fillRect(Math.round(-p),Math.round(2*p),Math.ceil(2*p),Math.ceil(2*p));
   // Teeth: alternate dark gaps rather than adding armour or a helmet.
   for(const ix of [-3,-1,1,3]){
    ctx.fillRect(Math.round(ix*p),Math.round(5*p),Math.ceil(p*.7),Math.ceil(p));
   }
   ctx.restore();
  });
 }else{
  fighterSprite(w.p);
  fighterSprite(w.e,true);
  if(w.fx>0){const n=w.impactKind==='parry'?6:w.impactKind==='block'?6:w.fx>12?1:w.fx>7?2:3;renderSpriteEffect(n,w.impactX,w.impactY,105)}
 }
 if(w.phase==='finish'){ctx.textAlign='center';ctx.font='bold 31px monospace';ctx.fillStyle=w.frame%25<18?'#f33':'#fff';ctx.fillText('FINISH HIM!',400,182);ctx.textAlign='left'}
 if(w.phase==='lose'||(w.phase==='win'&&!w.finisherDone)){ctx.textAlign='center';ctx.font='bold 34px monospace';ctx.fillStyle='#fff';ctx.fillText(w.phase==='win'?'YOU WIN':'YOU LOSE',400,189);ctx.textAlign='left'}ctx.restore();raf=requestAnimationFrame(draw)};raf=requestAnimationFrame(draw);return()=>{cancelAnimationFrame(raf);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}},[move,round,soundOn]);
 const button=(label:string,key:string)=><button onPointerDown={e=>{e.preventDefault();press(key);if(e.currentTarget.setPointerCapture)e.currentTarget.setPointerCapture(e.pointerId)}} onPointerUp={()=>held.current.delete(key)} onPointerCancel={()=>held.current.delete(key)} onPointerLeave={()=>held.current.delete(key)} style={{background:'#24131c',border:'2px solid #d82b49',color:'#fff',padding:'13px 14px',font:'bold 14px monospace',touchAction:'none',cursor:'pointer'}}>{label}</button>;
 return <main style={{background:'#09070d',color:'#eee',minHeight:'100vh',fontFamily:'monospace',textAlign:'center',padding:'18px 10px'}}><a href="/arcade" style={{color:'#fff'}}>← RETRO ARCADE</a><h1 style={{color:'#ef314c',fontSize:'clamp(24px,7vw,44px)',margin:'16px 0 0'}}>FATALITY FORGE</h1><p style={{letterSpacing:3,fontSize:12}}>BARBARIAN SWORD DUELS · 8-BIT FINISHERS</p><div style={{maxWidth:1480,width:'100%',margin:'auto'}}><p style={{color:'#a9a5ab',fontSize:11,letterSpacing:2}}>WIDESCREEN PIXEL-ART DUELS · MOVE / ATTACK / BLOCK / FINISH</p><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,margin:'12px auto',flexWrap:'wrap'}}><span style={{fontSize:12,color:'#ddd'}}>CHOOSE ARENA:</span><button onClick={()=>setArena(0)} style={{padding:'8px 12px',background:arena===0?'#b91532':'#21151e',color:'#fff',border:'1px solid #ff4560'}}>CASTLE DUEL</button><button onClick={()=>setArena(1)} style={{padding:'8px 12px',background:arena===1?'#b91532':'#21151e',color:'#fff',border:'1px solid #ff4560'}}>BLOOD MOON</button></div><div style={{maxWidth:1480,width:'100%',margin:'auto'}}><canvas ref={canvas} width={800} height={390} style={{display:'block',width:'100%',height:'auto',aspectRatio:'800 / 390',boxSizing:'border-box',imageRendering:'pixelated',border:'3px solid #eee',background:'#08070d',margin:'0 auto'}}/><p style={{color:'#f44',fontWeight:'bold',minHeight:20}}>{message}</p><div style={{display:'flex',gap:6,justifyContent:'center',flexWrap:'wrap'}}>{button('◀','arrowleft')}{button('▶','arrowright')}{button('SLASH J','j')}{button('OVERHEAD K','k')}{button('LOW I','i')}{button('GUARD L','l')}{button('CROUCH S','s')}</div><p style={{fontSize:12,color:'#aaa'}}>MOVE ← → / A D · SLASH J · OVERHEAD K · LOW SWEEP I · GUARD L · CROUCH S / ↓</p><p style={{fontSize:12,color:'#c1a99f'}}>Time your blocks to parry. Guard high against swords, crouch + guard against low sweeps. Every strike has wind-up, contact and recovery.</p><p style={{fontSize:12,color:'#d6cbc8'}}>Red = health · pale bar = stamina · heavy strikes consume more stamina</p><button onClick={()=>{if(soundOn){audio.current?.dispose();audio.current=null}setSoundOn(v=>!v)}} style={{margin:'4px 0 10px',padding:'8px 12px',background:'#24131c',border:'1px solid #d82b49',color:'#fff',cursor:'pointer'}}>{soundOn?'SOUND ON 🔊':'SOUND OFF 🔇'}</button> <button onClick={()=>{if(musicOn){music.current?.stop();setMusicOn(false)}else{startMusic();setMusicOn(true)}}} style={{margin:'4px 0 10px',padding:'8px 12px',background:'#24131c',border:'1px solid #d82b49',color:'#fff',cursor:'pointer'}}>{musicOn?'MUSIC ON ♪':'MUSIC OFF ♫'}</button><p style={{fontSize:12,color:'#c1a99f',margin:'0 0 14px'}}>ORIGINAL SPECTRUM-STYLE BATTLE THEME · Starts when you first use the controls</p><div style={{border:'2px solid #642035',padding:14,marginTop:16}}><h2 style={{fontSize:17}}>DESIGN YOUR FATALITY</h2><p style={{fontSize:12}}>Select a finishing style. Win by landing deliberate blows, then enter J → K → J.</p><div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>{moves.map((m,i)=><button key={m} onClick={()=>setMove(i)} style={{padding:10,color:'#fff',background:move===i?'#ae1733':'#20151e',border:'1px solid #ef314c',fontFamily:'monospace'}}>{m}</button>)}</div></div><p>SCORE: {score}</p><button onClick={()=>{setRound(r=>r+1);start();if(musicOn)startMusic()}} style={{background:'#e62b49',color:'#fff',border:0,padding:'15px 25px',font:'bold 16px monospace'}}>NEW ROUND / RETRY</button><details style={{margin:'20px auto 8px',padding:12,border:'1px solid #743244',textAlign:'left'}}><summary style={{cursor:'pointer',color:'#fff',fontWeight:'bold'}}>VIEW FATALITY DESIGN ARTWORK</summary><p style={{fontSize:12,color:'#d4cad0',marginTop:12}}>Original design reference for the fatality builder. The playable combat and three selectable finishers above remain interactive.</p><img src="/assets/fatality-forge-ui-concept.png" alt="Retro black-and-red Fatality Forge design interface artwork" loading="lazy" style={{width:'100%',maxHeight:540,objectFit:'contain',imageRendering:'pixelated'}}/></details></div></div></main>
}