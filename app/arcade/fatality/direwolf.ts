// Dire Wolf: an original, procedural ZX Spectrum-style finishing creature.
// All artwork is coarse-grid pixel geometry, not external game frames.
import type {World} from './combat';
import {drawDetailedDireWolf} from './direwolf-art';

type Actor=(who:'barbarian'|'knight',frame:number,x:number,ground:number,size:number,rotation:number,alpha:number,headless?:boolean,spin?:number)=>void;
export type DireWolfSprite=(sequence:'run'|'pounce'|'attack'|'bite',frame:number,x:number,feet:number,facing:number)=>void;
const WHITE='#eee9e2',BONE='#bbb3ac',BLACK='#07060a',INK='#1b1920';
const RED='#e02042',BLOOD='#940e2b';
const CELL=4;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{const t=clamp(v);return t*t*(3-2*t)};
function pix(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){
 ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));
}
// Pixel-rasterise original angular wolf silhouette polygons along scanlines.
function shape(ctx:CanvasRenderingContext2D,pts:number[],color:string,unit=CELL){
 const ys=pts.filter((_,i)=>i%2===1);
 const minY=Math.floor(Math.min(...ys)/unit)*unit;
 const maxY=Math.ceil(Math.max(...ys)/unit)*unit;
 for(let y=minY;y<=maxY;y+=unit){
  const crossing:number[]=[];
  for(let i=0;i<pts.length;i+=2){
   const j=(i+2)%pts.length;
   const x1=pts[i],y1=pts[i+1],x2=pts[j],y2=pts[j+1];
   const sample=y+unit*.5;
   if((y1<=sample&&sample<y2)||(y2<=sample&&sample<y1))
    crossing.push(x1+(sample-y1)*(x2-x1)/(y2-y1));
  }
  crossing.sort((a,b)=>a-b);
  for(let k=0;k+1<crossing.length;k+=2){
   const a=Math.floor(crossing[k]/unit)*unit;
   const b=Math.ceil(crossing[k+1]/unit)*unit;
   if(b>a)pix(ctx,a,y,b-a,unit,color);
  }
 }
}
// The wolf's attack unleashes dramatic, deliberately chunky 8-bit red water.
// Keep the main jets and pooling BEHIND the approved detailed wolf sprite.
function aftermath(ctx:CanvasRenderingContext2D,cx:number,age:number){
 if(age<108)return;
 const spread=ease((age-108)/78);
 const width=55+Math.round(235*spread);
 // One substantial stepped pool beneath the victim, with restrained highlights.
 pix(ctx,cx-width*.5,337,width,10,BLOOD);
 pix(ctx,cx-width*.5+5,337,width-10,6,RED);
 pix(ctx,cx-width*.5+20,345,width-40,3,BLOOD);
 pix(ctx,cx-width*.5+34,334,Math.max(8,width-68),3,RED);
 // The first contact releases several high, connected, red-water fountains.
 // Pixel-locked stair-step ribbons read clearly at arcade resolution.
 if(age>=112&&age<155){
  const t=age-112;
  const enter=ease(t/6),exit=1-ease((t-30)/13);
  const intensity=enter*exit;
  for(let jet=0;jet<5;jet++){
   const dir=jet%2===0?1:-1;
   const range=50+jet*15;
   const height=48+(jet%3)*20;
   const originX=cx+(jet-2)*11;
   for(let i=0;i<=14;i++){
    const u=i/14;
    const px=Math.round((originX+dir*u*range*enter)/4)*4;
    const py=Math.round((309-height*Math.sin(Math.PI*u)*intensity+26*u*u)/4)*4;
    const thick=Math.max(3,Math.round((12-5*u)*intensity));
    pix(ctx,px,py,thick+3,thick+3,BLOOD);
    pix(ctx,px+1,py+1,thick,thick,RED);
   }
  }
 }
 // Sustained pulses while the wolf bites. Droplets are pixel blocks, not
 // soft particles or smooth particle-system noise.
 if(age>=124&&age<188){
  const tick=Math.floor(age/5);
  for(let j=0;j<18;j++){
   const dx=((j*23+tick*13)%164)-82;
   const rise=12+((j*13+tick*9)%57);
   const block=3+(j%3)*2;
   pix(ctx,Math.round((cx+dx)/4)*4,Math.round((331-rise)/4)*4,block,block,j%8===0?WHITE:RED);
  }
  for(let stream=0;stream<5;stream++){
   const fx=cx-23+stream*11;
   const height=18+((tick+stream*3)%15);
   pix(ctx,fx,326-height,6,height,stream%3===0?BLOOD:RED);
   pix(ctx,fx+2,326-height-6,4,7,RED);
  }
 }
 // Heavy runoff along the floor, without covering the characters.
 if(age>=136){
  for(let d=0;d<13;d++){
   const xx=cx-65+d*11;
   const h=5+(d*7)%12;
   pix(ctx,xx,337-h,5,h,d%4===0?BLOOD:RED);
  }
 }
 // Small pieces of fallen armour, kept secondary to the wolf.
 if(age>174){
  pix(ctx,cx-40,328,13,4,WHITE);
  pix(ctx,cx+38,330,11,4,BONE);
 }
}
export function drawDireWolfFinisher(ctx:CanvasRenderingContext2D,w:World,age:number,actor:Actor,sprite?:DireWolfSprite){
 const side=w.e.x>=w.p.x?1:-1;
 const foe=w.e.x+(400-w.e.x)*ease(age/40);
 const player=w.p.x+(foe-side*193-w.p.x)*ease(age/49);
 const start=side===1?970:-170;
 const target=foe+side*91;
 const approach=ease((age-34)/75);
 const wx=start+(target-start)*approach;
 const jump=age>=67&&age<=121?57*Math.sin(Math.PI*clamp((age-67)/54)):0;
 const movement=age<83?'run':age<119?'pounce':age<185?'feed':'snarl';
 const wolfFacing=-side;
 ctx.save();
 // Approach and the sudden leap are easy to read against the dark background.
 if(age>=31&&age<72){
  // Eyes in the dark telegraph where the predator will come from.
  pix(ctx,start-side*42,221,8,5,RED);pix(ctx,start-side*59,216,6,5,RED);
 }
 // Draw bite aftermath behind the wolf and fighters.
 aftermath(ctx,foe,age);
 if(age<111){
  actor('knight',age<88?0:12,foe,346,187,0,1);
 }else if(age<143){
  const fallen=ease((age-111)/28);
  actor('knight',13,foe+side*fallen*17,346,183,side*fallen*.82,1);
 }else if(age<189){
  const disappear=ease((age-164)/25);
  actor('knight',15,foe+side*24,343,164,side*.98,1-disappear);
 }
 // Barbarian observes the wolf, sword lowered and out of the creature's way.
 actor('barbarian',age<100?7:0,player,346,189,0,1);
 if(age>=34){
  const biteBob=age>119&&age<182?Math.sin((age-119)*.49)*3:0;
  // Use the approved hand-drawn 6-frame atlases for each animation phase.
  // The bitmap artwork is displayed pixel-perfect with no canvas smoothing.
  const sequence=age<77?'run':age<106?'pounce':age<129?'attack':age<186?'bite':'run';
  const startFrame=sequence==='run'?34:sequence==='pounce'?77:sequence==='attack'?106:129;
  const frame=age>=186?0:Math.floor((age-startFrame)/(sequence==='bite'?8:5))%6;
  if(sprite)sprite(sequence,Math.max(0,frame),wx,337-jump+biteBob,wolfFacing);
  else drawDetailedDireWolf(ctx,wx,337-jump+biteBob,wolfFacing,age,movement);
 }
 // Bite-synchronised chunky red-water bursts, in front of the sprites.
 // Keep the accents concentrated at the contact point instead of covering the wolf.
 if(age>=116&&age<186){
  const n=Math.floor(age/6)%4;
  pix(ctx,foe-side*(10+n*7),255+n*5,26,7,RED);
  pix(ctx,foe-side*(4+n*4),264+n*5,10,6,BLOOD);
  pix(ctx,foe-side*(15+n*5),247+n*4,8,5,RED);
 }
 if(age>=214){
  const alpha=ease((age-214)/14);
  pix(ctx,244,38,312,87,'rgba(0,0,0,'+(.74*alpha).toFixed(3)+')');
  ctx.save();ctx.globalAlpha=alpha;ctx.textAlign='center';
  ctx.font='bold 47px monospace';ctx.fillStyle=WHITE;ctx.fillText('FATALITY',400,89);
  ctx.font='bold 19px monospace';ctx.fillStyle=RED;ctx.fillText('DIRE WOLF',400,117);
  ctx.restore();
 }
 ctx.restore();
}
