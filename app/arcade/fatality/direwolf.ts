// Dire Wolf: an original, procedural ZX Spectrum-style finishing creature.
// All artwork is coarse-grid pixel geometry, not external game frames.
import type {World} from './combat';
import {drawDetailedDireWolf} from './direwolf-art';

type Actor=(who:'barbarian'|'knight',frame:number,x:number,ground:number,size:number,rotation:number,alpha:number,headless?:boolean,spin?:number)=>void;
export type WolfSpritePainter=(ctx:CanvasRenderingContext2D,x:number,y:number,face:number,age:number,motion:'run'|'pounce'|'feed'|'snarl')=>boolean;
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
function aftermath(ctx:CanvasRenderingContext2D,cx:number,age:number){
 if(age<112)return;
 const spread=ease((age-112)/69),width=35+Math.round(150*spread);
 pix(ctx,cx-width*.5,338,width,7,BLOOD);
 pix(ctx,cx-width*.5+5,338,width-10,4,RED);
 if(age>=133){
  const ticks=Math.floor(age/6),splash=age<182?1:0;
  if(splash)for(let j=0;j<9;j++){
   const dx=((j*29+ticks*13)%92)-46, rise=12+((j*11+ticks*7)%28);
   pix(ctx,cx+dx,332-rise,4+(j%3)*2,4,j%3===0?WHITE:RED);
  }
 }
 // A few scattered bits of old armour remain when the wolf is finished.
 if(age>174){
  pix(ctx,cx-40,327,14,5,WHITE);pix(ctx,cx-16,333,17,4,BONE);
  pix(ctx,cx+37,330,10,4,BONE);
 }
}
export function drawDireWolfFinisher(ctx:CanvasRenderingContext2D,w:World,age:number,actor:Actor,wolfSprite?:WolfSpritePainter){
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
  const biteBob=age>119&&age<182?Math.sin((age-119)*.49)*5:0;
  if(!wolfSprite?.(ctx,wx,337-jump+biteBob,wolfFacing,age,movement))
   drawDetailedDireWolf(ctx,wx,337-jump+biteBob,wolfFacing,age,movement);
 }
 // Small, individual bright-red slashes track the bite at the knight's position.
 if(age>=116&&age<178&&Math.floor(age/9)%3!==2){
  const n=Math.floor(age/9)%3;
  pix(ctx,foe-side*(8+n*8),256+n*7,22,6,RED);
  pix(ctx,foe-side*2,265+n*7,8,5,WHITE);
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
