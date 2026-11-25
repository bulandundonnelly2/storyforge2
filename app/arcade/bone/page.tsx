'use client';
import {useEffect,useRef,useState} from 'react';

type Phase='ready'|'fight'|'win'|'lose'|'locked';
type Shot={x:number;y:number;vx:number;vy:number;damage?:number;kind?:Power;rocket?:boolean;age?:number};
type Power='spread'|'laser'|'rapid'|'shield'|'life';
type Pickup={x:number;y:number;kind:Power};
type Enemy={x:number;y:number;hp:number;seed:number};
export default function BoneBoss(){
 const canvas=useRef<HTMLCanvasElement>(null),keys=useRef(new Set<string>()),touch=useRef<{x:number;y:number}|null>(null),[phase,setPhase]=useState<Phase>('ready'),[run,setRun]=useState(0),[muted,setMuted]=useState(false),audio=useRef<AudioContext|null>(null),sound=useRef(true);
 useEffect(()=>{try{if(new URLSearchParams(window.location.search).get('test')!=='1'&&sessionStorage.getItem('eldernight-bone-boss')!=='unlocked')setPhase('locked')}catch{setPhase('locked')}},[]);
 useEffect(()=>{sound.current=!muted},[muted]);
 useEffect(()=>()=>{audio.current?.close().catch(()=>{})},[]);
 const tone=(freq:number,duration=.07)=>{if(!sound.current||!audio.current)return;try{const a=audio.current,o=a.createOscillator(),g=a.createGain();o.type='square';o.frequency.setValueAtTime(freq,a.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(35,freq/2),a.currentTime+duration);g.gain.setValueAtTime(.035,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+duration);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+duration)}catch{}};
 const start=()=>{try{audio.current??=new AudioContext();audio.current.resume().catch(()=>{})}catch{}keys.current.clear();touch.current=null;setRun(x=>x+1);setPhase('fight')};
 useEffect(()=>{
  const cv=canvas.current,ctx=cv?.getContext('2d');if(!cv||!ctx)return;
  ctx.imageSmoothingEnabled=false;
  const W=640,H=320;let frame=0,raf=0,last=0,debt=0,px=72,py=160,hp=3,inv=0,score=0,bossHP=480,bossStage=1,chargeY=160,bossFlash=0,finale=0,attackClock=0,beamY=160,ended=false,cool=0,death=0,shield=0,weapon:Power='rapid',weaponTime=0,bossY=160,bossX=phase==='ready'?505:760;
  let bullets:Shot[]=[],hazards:Shot[]=[],enemies:Enemy[]=[];let pickups:Pickup[]=[],kills=0;const kinds:Power[]=['spread','laser','rapid','shield','life'];const colors:Record<Power,string>={spread:'#ff9c45',laser:'#e879ff',rapid:'#64e8ff',shield:'#70ffb5',life:'#ff557c'};const stars=Array.from({length:100},(_,i)=>({x:(i*137.31)%W,y:(i*79.17)%H,s:1+i%3,v:.4+i%4*.45}));
  const rect=(x:number,y:number,w:number,h:number,c:string)=>{ctx.fillStyle=c;ctx.fillRect(Math.floor(x),Math.floor(y),w,h)};
  const poly=(a:number[],c:string)=>{ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(a[0],a[1]);for(let i=2;i<a.length;i+=2)ctx.lineTo(a[i],a[i+1]);ctx.closePath();ctx.fill()};
  const label=(s:string,x:number,y:number,c='#fff',size=12)=>{ctx.fillStyle=c;ctx.font='bold '+size+'px monospace';ctx.fillText(s,x,y)};
  const hit=()=>{if(inv>0||death||finale||ended)return;if(shield>0){shield=0;inv=65;tone(480,.12);return}hp--;inv=100;tone(75,.18);if(hp<=0){death=1;tone(45,.65)}};
  const win=()=>{if(death||ended||finale)return;finale=1;bossHP=0;hazards=[];bullets=[];enemies=[];pickups=[];score+=2500;tone(85,.7)};
  const down=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' '].includes(k)){e.preventDefault();keys.current.add(k)}};
  const up=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase());const blur=()=>{keys.current.clear();touch.current=null};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);
  const tick=()=>{
   frame++;if(phase!=='fight'||ended)return;if(finale){finale++;if([18,38,58,78,98,118].includes(finale))tone(70+finale/2,.24);if(finale===140)tone(38,1);if(finale===220){tone(440,.25)}if(finale===240)tone(660,.35);if(finale>=300&&finale<450){px+=3.8;py+=(160-py)*.035}if([320,345,370,395,480,510,540,570,660,690,720].includes(finale))tone([262,330,392,523][Math.floor(finale/25)%4],.27);if(finale>=900){ended=true;try{sessionStorage.setItem('eldernight-bone-victory','yes')}catch{}setPhase('win')}return}if(death){if(++death>=85){ended=true;setPhase('lose')}return}
   const k=keys.current;const dx=Number(k.has('arrowright')||k.has('d'))-Number(k.has('arrowleft')||k.has('a')),dy=Number(k.has('arrowdown')||k.has('s'))-Number(k.has('arrowup')||k.has('w'));
   px=Math.max(18,Math.min(385,px+dx*3.5));py=Math.max(40,Math.min(H-24,py+dy*3.5));
   if(touch.current){px+=Math.max(-5,Math.min(5,touch.current.x-px));py+=Math.max(-5,Math.min(5,touch.current.y-py));px=Math.max(18,Math.min(385,px));py=Math.max(40,Math.min(H-24,py))}
   if(bossFlash>0)bossFlash--;if(inv>0)inv--;if(cool>0)cool--;if(shield>0)shield--;if(weaponTime>0)weaponTime--;if(frame%240===120&&frame<850)pickups.push({x:W-20,y:75+(frame*13)%160,kind:kinds[Math.floor(frame/240)%5]});
   if((k.has(' ')||touch.current)&&cool===0){const mode=weaponTime>0?weapon:null;for(const vy of mode==='spread'?[-2.4,0,2.4]:[0])bullets.push({x:px+18,y:py,vx:mode==='laser'?14:8.5,vy,damage:mode==='laser'?3:1,kind:mode??undefined});cool=mode==='rapid'?3:mode==='laser'?10:7;tone(mode==='laser'?650:310,.035)}
   if(frame<850&&frame%68===1)enemies.push({x:W+25,y:48+(frame*37)%238,hp:3,seed:frame});
   for(const e of enemies){e.x-=2.1;e.y+=Math.sin((frame+e.seed)/25)*.7;if((frame+e.seed)%100===0)hazards.push({x:e.x,y:e.y,vx:-3.4,vy:(py-e.y)/100});if(Math.abs(e.x-px)<22&&Math.abs(e.y-py)<15){hit();e.hp=0}}
   if(frame>=870){
    if(!attackClock&&bossX>505){bossX=Math.max(505,bossX-1.6);bossY=160+Math.sin(frame/75)*47}
    if(bossX<=505||attackClock){attackClock++;const cycle=attackClock%240;
     if(bossStage!==3){bossX=Math.min(505,bossX+6);bossY=160+Math.sin(frame/(bossStage===4?36:65))*55}
     if(bossStage===1&&cycle%36===10){for(const off of [-.28,.28]){const a=Math.atan2(py-bossY,px-bossX)+off;hazards.push({x:bossX-65,y:bossY+off*85,vx:Math.cos(a)*3.1,vy:Math.sin(a)*3.1,rocket:true,age:0})}tone(90,.12)}
     if(bossStage===2||bossStage===4){const c=attackClock%120;if(c===1){beamY=py;tone(260,.3)}if(c>=35&&c<65){const ys=bossStage===4?[beamY-25,beamY+25]:[beamY];for(const y of ys)if(Math.abs(py-y)<(bossStage===4?10:15)&&px<bossX-50)hit()}if(c===35)tone(55,.4);if(bossStage===4&&c%15===0){for(const off of [-.5,-.25,0,.25,.5]){const a=Math.PI+off+Math.sin(frame/20)*.22;hazards.push({x:bossX-50,y:bossY-25,vx:Math.cos(a)*4.2,vy:Math.sin(a)*4.2})}}}
     if(bossStage===3){if(cycle===1){chargeY=py;tone(100,.35)}if(cycle<50){bossY+=(chargeY-bossY)*.08;bossX=Math.min(505,bossX+6)}else if(cycle<95){bossX=Math.max(80,bossX-11)}else if(cycle<115){bossX=80}else if(cycle<185){bossX=Math.min(505,bossX+7)}else{bossX=505;bossY=160+Math.sin(frame/50)*45}if(cycle===50)tone(55,.6)}
     const floorHP=[0,360,240,120,0][bossStage];if(bossHP<=floorHP&&attackClock>=240&&bossStage<4){bossStage++;attackClock=0;bossX=505;hazards=[];tone(440,.3);pickups.push({x:410,y:160,kind:bossStage===3?'shield':'rapid'})}
    }
    if(Math.abs(px-bossX)<65&&Math.abs(py-bossY)<65)hit()
   }
   for(const b of bullets){b.x+=b.vx;b.y+=b.vy;for(const e of enemies){if(e.hp>0&&Math.abs(b.x-e.x)<15&&Math.abs(b.y-e.y)<12){e.hp=Math.max(0,e.hp-(b.damage??1));b.x=W+100;if(e.hp===0){score+=100;tone(140,.1);if(++kills%2===0)pickups.push({x:e.x,y:e.y,kind:kinds[(kills/2-1)%5]})}break}}if(!death&&frame>=870&&b.x<W+50&&b.x+(b.kind==='laser'?24:10)>=bossX-75&&b.x-b.vx<=bossX+155&&Math.abs(b.y-bossY)<=102){bossHP=Math.max(bossStage===4&&attackClock<240?1:[0,360,240,120,0][bossStage],bossHP-(b.damage??1));bossFlash=7;b.x=W+100;score+=10;tone(180,.025);if(bossHP<=0&&bossStage===4&&attackClock>=240){win();return}}}
   for(const b of hazards){if(b.rocket){b.age=(b.age??0)+1;if(b.age<75){const a=Math.atan2(py-b.y,px-b.x),v=Math.atan2(b.vy,b.vx),d=Math.atan2(Math.sin(a-v),Math.cos(a-v));const next=v+Math.max(-.035,Math.min(.035,d));b.vx=Math.cos(next)*3.6;b.vy=Math.sin(next)*3.6}}b.x+=b.vx;b.y+=b.vy;if(Math.abs(b.x-px)<12&&Math.abs(b.y-py)<9){hit();b.x=-100}}
   for(const p of pickups){p.x-=1.5;if(!death&&Math.abs(p.x-px)<23&&Math.abs(p.y-py)<18){if(p.kind==='life')hp=Math.min(5,hp+1);else if(p.kind==='shield')shield=600;else{weapon=p.kind;weaponTime=720}p.x=-100;tone(880,.16)}}pickups=pickups.filter(p=>p.x>-20);
   bullets=bullets.filter(b=>b.x<W+20&&b.y>23&&b.y<H);hazards=hazards.filter(b=>b.x>-30&&b.x<W+80&&b.y>20&&b.y<H+20);enemies=enemies.filter(e=>e.hp>0&&e.x>-30);
  };

  // Extract independent sprites and scenery from the approved concept artwork.
  // Normalized coordinates refer to the original 1672 x 941 image.
  const art=new Image();art.crossOrigin='anonymous';art.src='https://cdn.shopify.com/s/files/1/1119/4587/5846/files/eldernight-ossuary-approved.png?v=1795555498';
  let ship:HTMLCanvasElement|null=null,skull:HTMLCanvasElement|null=null,back:HTMLCanvasElement|null=null,roof:HTMLCanvasElement|null=null,floor:HTMLCanvasElement|null=null;
  const cut=(x:number,y:number,w:number,h:number,outline?:number[])=>{
   const out=document.createElement('canvas');out.width=w;out.height=h;const a=out.getContext('2d')!;
   if(outline){a.beginPath();a.moveTo(outline[0]-x,outline[1]-y);for(let i=2;i<outline.length;i+=2)a.lineTo(outline[i]-x,outline[i+1]-y);a.closePath();a.clip()}
   a.drawImage(art,x,y,w,h,0,0,w,h);return out;
  };
  art.onload=()=>{
   // Tight silhouettes prevent the concept's HUD, bullets and environment from travelling with the sprites.
   ship=cut(83,395,225,110,[87,398,151,398,190,425,234,428,302,454,258,471,209,475,151,500,95,500,121,474,87,467,87,435,121,430]);
   skull=cut(1040,149,632,607,[1040,320,1065,260,1113,217,1190,182,1270,160,1348,152,1430,155,1500,186,1672,193,1672,750,1500,750,1430,728,1360,742,1260,728,1190,696,1120,640,1095,590,1070,530,1045,480]);
   // The clean central strip is mirrored at tile seams, avoiding baked-in ships, shots and boss.
   back=cut(320,155,650,235);
   roof=cut(310,76,335,152);
   floor=cut(0,765,1030,176);
  };
  const tiled=(img:HTMLCanvasElement,y:number,h:number,speed:number,tw:number)=>{
   const o=(frame*speed)%(tw*2);for(let j=-2;j<Math.ceil(W/tw)+3;j++){ctx.save();ctx.translate(Math.round(j*tw-o),y);if(j%2!==0){ctx.translate(tw,0);ctx.scale(-1,1)}ctx.drawImage(img,0,0,tw,h);ctx.restore()}
  };
  const drawSkull=()=>{
   if(skull){ctx.drawImage(skull,Math.round(bossX-75),Math.round(bossY-102),240,230);const pulse=frame%18;ctx.globalAlpha=.45+pulse/40;rect(bossX-52,bossY+16,8,8,'#58eaff');ctx.globalAlpha=1;return}
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
   if(back){tiled(back,23,255,.22,510)}
   // Scrolling industrial superstructure, with repeating hand-pixelled trusses.
   const offset=(frame*.8)%128;
   if(roof&&floor){tiled(roof,23,53,.75,145);tiled(floor,276,44,1.15,258)}else for(let i=-1;i<7;i++){const x=i*128-offset;rect(x,24,115,18,'#201035');rect(x,26,112,3,'#7036a1');rect(x,278,115,42,'#19102b');rect(x,283,110,3,'#502b85');for(let j=0;j<6;j++){rect(x+j*18,33,9,5,'#13445e');rect(x+j*18,290,12,19,'#34205f');rect(x+j*18+3,292,3,12,'#15718a')}poly([x,39,x+8,39,x+31,79,x+24,79],'#292044');poly([x+82,278,x+90,278,x+115,241,x+107,241],'#30204b');for(let j=0;j<35;j++){rect(x+(j*19)%110,282+(j*13)%36,2,2,j%3?'#472879':'#1b7494')}}
   for(const e of enemies){poly([e.x-17,e.y,e.x-4,e.y-10,e.x+17,e.y-7,e.x+9,e.y,e.x+17,e.y+7,e.x-4,e.y+10],'#8044bf');rect(e.x-10,e.y-3,18,6,'#64e8ff');rect(e.x+5,e.y-2,6,4,'#fff')}
   if((frame>=870||phase==='ready')&&finale<140&&phase!=='win'){ctx.save();if(finale){ctx.translate(Math.sin(finale*2.1)*Math.min(8,finale/12),Math.cos(finale*1.7)*4);ctx.filter='brightness('+ (1+Math.abs(Math.sin(finale*.22))*1.8)+')';}if(bossFlash>0)ctx.filter='brightness(1.8)';drawSkull();ctx.restore();if(bossFlash>0)label('HIT!',Math.min(W-40,bossX-35),Math.max(36,bossY-95),'#ffcf55',12)}
   if(!death&&(inv%8<4||inv===0)){if(ship){ctx.drawImage(ship,Math.round(px-24),Math.round(py-12),49,24);rect(px-27-(frame%5),py-1,10+frame%5,3,'#38eaff');rect(px-24,py,8,1,'#fff')}else{poly([px-17,py-7,px+2,py-7,px+19,py,px+2,py+7,px-17,py+7,px-10,py],'#d7e4eb');poly([px-7,py-4,px+7,py-4,px+15,py,px-5,py+2],'#147fa7');rect(px-24-(frame%4),py-2,12+frame%4,4,'#13d6fc');rect(px-20,py-1,8,2,'#fff')}}
   if(attackClock&&!finale&&!death){const c=attackClock%120,cycle=attackClock%240;const names=['','ROCKET ASSAULT','LASER ARRAY','RAMMING ATTACK','EYES OF OSSUARY'];label('STAGE '+bossStage+' / 4: '+names[bossStage],12,42,'#ffcf55',12);
    if((bossStage===2||bossStage===4)&&c>=1&&c<65){const ys=bossStage===4?[beamY-25,beamY+25]:[beamY];for(const y of ys){if(c<35){for(let x=0;x<bossX-50;x+=18)rect(x,y-1,10,2,'#ff436b')}else{rect(0,y-10,bossX-50,20,'#aa164e');rect(0,y-4,bossX-50,8,'#ff487c');rect(0,y-1,bossX-50,3,'#fff')}}if(c<35)label('LASER WARNING',20,Math.max(65,beamY-40),'#ff668b',11)}
    if(bossStage===4){for(const y of [bossY-32,bossY-12]){rect(bossX-45,y,13,7,'#ff245f');rect(bossX-43,y+2,8,3,'#fff')}}
    if(bossStage===3&&cycle<50){for(let x=0;x<bossX-60;x+=16)rect(x,chargeY-1,8,2,'#ff9c45');label('INCOMING CHARGE!',180,Math.max(65,chargeY-15),'#ffcf55',14)}
   }
   if(finale){const t=finale;const cx=Math.min(W-30,bossX+20);if(t<140){for(let i=0;i<7;i++){const age=t-i*18;if(age>=0&&age<42){const x=cx-65+(i*47)%120,y=bossY-80+(i*67)%160;ctx.fillStyle=age<10?'#fff':'#ff7638';ctx.beginPath();ctx.arc(x,y,Math.max(2,age*1.1),0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffcf55';ctx.beginPath();ctx.arc(x,y,Math.max(1,age*.45),0,Math.PI*2);ctx.fill()}}label('CORE COLLAPSE',245,55,'#ffcf55',16)}else{const age=t-140;for(let i=0;i<180;i++){const a=i*2.39996,v=.65+(i%19)*.27,x=cx+Math.cos(a)*v*age,y=bossY+Math.sin(a)*v*age;ctx.globalAlpha=Math.max(0,1-age/130);rect(x,y,3+i%7,3+i%7,['#fff','#ffcf55','#ff4168','#8c54dd','#64e8ff'][i%5])}ctx.globalAlpha=1;if(age<75){ctx.strokeStyle='#ffb45b';ctx.lineWidth=Math.max(1,8-age/10);ctx.beginPath();ctx.arc(cx,bossY,age*7+10,0,Math.PI*2);ctx.stroke()}if(age<24){ctx.globalAlpha=(24-age)/24;rect(0,23,W,H-23,'#fff');ctx.globalAlpha=1}if(age>55){label('OSSUARY DESTROYED',190,145,'#ffcf55',22);label('FREE WILL RESTORED',231,173,'#64e8ff',15)}}}
   for(const b of bullets){rect(b.x,b.y-1,b.kind==='laser'?24:10,b.kind==='laser'?5:3,b.kind?colors[b.kind]:'#78edff');rect(b.x+7,b.y,5,1,'#fff')}for(const b of hazards){if(b.rocket){ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));rect(-7,-3,14,6,'#e9d7be');rect(5,-2,4,4,'#ff4168');rect(-13,-2,6+frame%3,4,'#ff9c45');ctx.restore()}else{rect(b.x-3,b.y-3,6,6,'#ef235c');rect(b.x-1,b.y-1,2,2,'#fff')}}
   for(const p of pickups){const c=colors[p.kind];poly([p.x,p.y-10,p.x+10,p.y,p.x,p.y+10,p.x-10,p.y],c);rect(p.x-6,p.y-6,12,12,'#090713');label(({spread:'S',laser:'L',rapid:'R',shield:'D',life:'+'})[p.kind],p.x-3,p.y+4,c,11)}
   if(shield&&!death){ctx.strokeStyle=colors.shield;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(px,py,30,19,0,0,Math.PI*2);ctx.stroke()}
   if(death){const t=death;for(let i=0;i<70;i++){const a=i*2.39996,v=0.5+(i%11)*.34;const x=px+Math.cos(a)*v*t,y=py+Math.sin(a)*v*t;ctx.globalAlpha=Math.max(0,1-t/85);rect(x,y,2+i%4,2+i%4,['#fff','#ffcf55','#ff4168','#8c54dd','#64e8ff'][i%5])}ctx.globalAlpha=1;if(t<18){ctx.fillStyle=t%4<2?'#fff':'#ff7638';ctx.beginPath();ctx.arc(px,py,Math.max(1,30-t),0,Math.PI*2);ctx.fill()}label('INTERCEPTOR DESTROYED',210,155,'#ff557c',15)}
   if(finale>=300){const t=finale;rect(0,0,W,24,'#050510');rect(0,296,W,24,'#050510');if(t<450){label('TRANSMISSION: ALL SYSTEMS COLLAPSING',130,49,'#ffcf55',13);label('PILOT 07 — ESCAPING THE OSSUARY',145,282,'#64e8ff',12);for(let i=0;i<18;i++){const x=((i*91-(t-300)*9)%W+W)%W;rect(x,40+(i*53)%240,12+i%14,2,'#b15a7e')}}else{
    rect(0,0,W,H,'#050510');for(const star of stars)rect(star.x,star.y,star.s,star.s,star.s===3?'#9bb9d3':'#414b70');
    const rise=Math.min(1,(t-450)/100);const cy=310-rise*72;ctx.save();ctx.beginPath();ctx.arc(320,cy+90,205,0,Math.PI*2);ctx.clip();rect(110,cy-120,420,420,'#102e58');for(let i=0;i<85;i++){const x=125+(i*83)%390,y=cy-100+(i*47)%270;rect(x,y,14+i%31,5+i%13,i%3?'#245d75':'#387b68')}for(let i=0;i<65;i++){const x=130+(i*71)%380,y=cy-80+(i*29)%200;if(t>565+i*2)rect(x,y,2+i%3,2,'#ffe5a0')}ctx.restore();ctx.strokeStyle='#63c7ed';ctx.lineWidth=2;ctx.beginPath();ctx.arc(320,cy+90,205,Math.PI,2*Math.PI);ctx.stroke();
    const centered=(str:string,y:number,c:string,size:number)=>{ctx.font='bold '+size+'px monospace';label(str,(W-ctx.measureText(str).width)/2,y,c,size)};
    if(t<600){centered('EARTH — SIGNAL RESTORED',58,'#64e8ff',19);centered('Across the planet, the machines fall silent.',90,'#e3e9f3',13)}else if(t<750){centered('FOR THE FIRST TIME IN GENERATIONS...',54,'#e3e9f3',14);centered('HUMANITY THINKS FOR ITSELF.',86,'#ffcf55',19);centered('PILOT 07 HAS RETURNED.',116,'#64e8ff',12)}else{centered('SPIT OUT THE BONE',65,'#e3e9f3',28);centered('HUMANITY IS FREE',100,'#64e8ff',19);centered('MISSION COMPLETE  /  SCORE '+String(score).padStart(5,'0'),128,'#ffcf55',13);centered('THE END',170,'#fff',20)}
   }return}
   rect(0,0,W,23,'#090713');label('PILOT 07  '+('♥ '.repeat(Math.max(0,hp))),10,16,'#74e8fc');label('SCORE '+String(score).padStart(5,'0'),238,16);if(frame>=870){label('OSSUARY',455,15,'#f95b88');rect(523,7,106,9,'#30152d');rect(523,7,Math.max(0,bossHP)/480*106,9,'#df285b')}else label('APPROACH '+Math.min(100,Math.floor(frame/8.7))+'%',475,16,'#ac80e6');
   if(phase==='fight'&&!death){label(weaponTime>0?weapon.toUpperCase()+' '+Math.ceil(weaponTime/60)+'s':'STANDARD CANNON',12,309,weaponTime>0?colors[weapon]:'#74e8fc',10);if(shield)label('SHIELD '+Math.ceil(shield/60)+'s',180,309,colors.shield,10)}
   if(!finale&&frame>780&&frame<890&&phase==='fight')label('WARNING: OSSUARY CORE',202,155,'#ff4d80',17);
  };
  const loop=(t:number)=>{if(!last)last=t;debt=Math.min(50,debt+t-last);last=t;while(debt>=1000/60){tick();debt-=1000/60}paint();raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  return()=>{art.onload=null;cancelAnimationFrame(raf);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur)};
 },[phase,run]);
 // Keep result screen above the canvas; entering or leaving the battle clears controls.
 const move=(e:React.PointerEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect();touch.current={x:(e.clientX-r.left)*640/r.width,y:(e.clientY-r.top)*320/r.height}};
 return <main style={{minHeight:'100vh',background:'#050510',color:'#e3e9f3',fontFamily:'monospace',textAlign:'center',padding:'20px 12px'}}><a href="/#bone" style={{color:'#af8af0'}}>← SPIT OUT THE BONE</a><h1 style={{color:'#bd76ff',fontSize:'clamp(22px,5vw,44px)',letterSpacing:3}}>SPIT OUT THE BONE</h1><p style={{color:'#58e9ff',letterSpacing:2}}>SECRET LEVEL · OSSUARY CORE</p><div style={{maxWidth:1200,margin:'auto',position:'relative'}}><canvas ref={canvas} width={640} height={320} onPointerDown={e=>{if(phase==='fight'){e.currentTarget.setPointerCapture(e.pointerId);move(e)}}} onPointerMove={e=>{if(touch.current)move(e)}} onPointerUp={()=>{touch.current=null}} onPointerCancel={()=>{touch.current=null}} style={{display:'block',width:'100%',height:'auto',imageRendering:'pixelated',border:'2px solid #7546ba',touchAction:'none',boxSizing:'border-box'}}/>{phase!=='fight'&&<section style={{position:'absolute',inset:'0',display:'flex',alignItems:'center',justifyContent:'center',background:'#05051088'}}><div style={{background:'#080713',border:'2px solid #9c59ec',padding:'clamp(12px,3vw,32px)',maxWidth:'78%'}}><h2 style={{color:'#fff',fontSize:'clamp(16px,3.5vw,32px)'}}>{phase==='locked'?'SECRET LEVEL LOCKED':phase==='win'?'MISSION COMPLETE':phase==='lose'?'TRANSMISSION LOST':'DESTROY OSSUARY'}</h2><p style={{color:'#61eaff',fontSize:'clamp(10px,1.6vw,16px)'}}>{phase==='win'?'Pilot 07 has returned to Earth. Ossuary is destroyed. Humanity is free. THE END.':phase==='locked'?'Find the true path in the story.':phase==='lose'?'The interceptor was destroyed. Try again.':'Three lives. One interceptor. No surrender.'}</p>{phase==='locked'||phase==='win'?<a href="/#bone" style={{color:'#fff'}}>RETURN TO THE STORY →</a>:<button onClick={start} style={{background:'#6e37ad',border:'2px solid #c58aff',color:'#fff',font:'bold 16px monospace',padding:'12px 22px',cursor:'pointer'}}>{phase==='lose'?'RETRY MISSION':'START MISSION'}</button>}</div></section>}</div><p>MOVE: ARROWS / WASD · FIRE: SPACE · TOUCH: DRAG TO MOVE AND FIRE</p><p style={{color:'#a994c5'}}>Collect S (spread), L (laser), R (rapid fire), D (shield) and + (extra life). Fire anywhere at the skull to damage it.</p><button onClick={()=>setMuted(v=>!v)} style={{background:'#211638',color:'#fff',border:'1px solid #895ac7',padding:'9px 15px',cursor:'pointer'}}>{muted?'SOUND OFF':'SOUND ON'}</button></main>
}
