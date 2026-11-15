// Original ZX Spectrum-style sword finisher: flourish, single chop, airborne head,
// three restrained crimson fountains, a headless kneel, collapse, and delayed title.
import type {World} from './combat';
type Actor=(who:'barbarian'|'knight',frame:number,x:number,ground:number,size:number,rotation:number,alpha:number,headless?:boolean)=>void;
type Helmet=(x:number,y:number,rotation:number,size:number)=>void;
const RED='#e02042',DARK='#8b0e29',WHITE='#f3eee7';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>{const x=clamp(n);return x*x*(3-2*x)};
function block(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,c:string){
 ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));
}
function slash(ctx:CanvasRenderingContext2D,x:number,y:number,xx:number,yy:number,c:string,width:number){
 for(let i=0;i<=32;i++){const t=i/32;block(ctx,x+(xx-x)*t,y+(yy-y)*t,width,width,c)}
}
function neckFountain(ctx:CanvasRenderingContext2D,x:number,y:number,dir:number,age:number){
 // Three separate, short-lived, clearly outlined arcs. No random visual noise.
 for(const [start,height,length] of [[112,40,13],[129,29,12],[150,17,10]]){
  const t=age-start;if(t<0||t>=length)continue;
  const fade=1-t/length;
  for(let i=0;i<11;i++){
   const progress=i/10;
   const distance=(i*2.0)+(t*.7);
   const px=x+dir*distance;
   const py=y-height*progress*(1-progress*.36)+t*t*.20;
   block(ctx,px,py,progress<.35?5:3,progress<.35?6:4,i%4===0?WHITE:i%2===0?RED:DARK);
  }
  for(let i=0;i<4;i++){
   const dx=dir*(13+i*11+t);
   block(ctx,x+dx,y-height*.63+t*1.7+i*i,3+Math.ceil(fade*2),3,RED);
  }
 }
}
export function drawDecapitation(ctx:CanvasRenderingContext2D,w:World,age:number,actor:Actor,helmet?:Helmet){
 const enemy=w.e.x,dir=w.p.x<enemy?1:-1;
 const hero=w.p.x+(enemy-dir*170-w.p.x)*ease((age-19)/64);
 const headOff=age>=111;
 ctx.save();
 // The knight does not fall immediately. Each of the four dedicated headless sprite
 // poses lasts long enough to read: standing, stunned, kneeling, and on the floor.
 if(!headOff){
  const frame=age<76?0:12;
  actor('knight',frame,enemy,346,185,0,1);
 }else if(age<130){
  actor('knight',0,enemy,346,185,0,1,true);
 }else if(age<153){
  actor('knight',1,enemy+dir*6,346,185,0,1,true);
 }else if(age<188){
  const drop=ease((age-153)/27);
  actor('knight',2,enemy+dir*8,346+drop*5,185-drop*8,0,1,true);
 }else{
  const slump=ease((age-188)/23);
  actor('knight',3,enemy+dir*(10+slump*21),346+slump*4,183,dir*slump*.11,1,true);
 }
 // Flourish: timed sword poses with a single constrained blade trail; the whole
 // character does NOT rotate, which previously made the sprite look weightless.
 let barbarianFrame=0;
 if(age>=23&&age<45)barbarianFrame=8;
 else if(age>=45&&age<62)barbarianFrame=10;
 else if(age>=62&&age<82)barbarianFrame=8;
 else if(age>=82&&age<100)barbarianFrame=10;
 else if(age>=100&&age<121)barbarianFrame=9;
 else if(age>=121&&age<174)barbarianFrame=10;
 actor('barbarian',barbarianFrame,hero,346,190,0,1);
 if(age>=27&&age<78){
  const t=age-27,arc=t<21?t/21:t<39?(t-21)/18:(t-39)/12;
  const turn=t<21?0:t<39?1:2;
  const x=hero+dir*(44+Math.round(Math.sin(arc*Math.PI)*17));
  const y=turn===0?222-arc*82:turn===1?140+arc*22:162-arc*15;
  slash(ctx,hero+dir*33,196,x,y,t%8<4?WHITE:RED,4);
 }
 // Contact: a single horizontal neck-height swipe.
 if(age>=99&&age<116){
  const t=(age-99)/17;
  slash(ctx,hero+dir*58,205-t*19,enemy+dir*(10+18*t),193+t*11,age<109?WHITE:RED,age<108?8:4);
 }
 if(age===111||age===112)block(ctx,0,39,800,339,age===111?'rgba(245,239,229,.54)':'rgba(245,239,229,.19)');
 if(headOff){
  neckFountain(ctx,enemy+dir*11,205,dir,age);
  // The detached helmet follows an arc, bounces once, and comes to rest.
  if(helmet){
   const flight=clamp((age-111)/62);
   const still=age>=173;
   const x=still?enemy+dir*180:enemy+dir*(8+172*flight);
   const y=still?316-16*Math.abs(Math.sin((age-173)*.16))*Math.exp(-(age-173)/17)
      :197-116*Math.sin(flight*Math.PI)+112*flight*flight;
   helmet(x,y,dir*(still?5.4+(age-173)*.015:5.4*flight),51);
  }
 }
 if(age>=211){
  const opacity=ease((age-211)/14);
  block(ctx,182,90,436,121,'rgba(0,0,0,'+(.88*opacity).toFixed(3)+')');
  ctx.save();ctx.globalAlpha=opacity;ctx.textAlign='center';
  ctx.fillStyle=WHITE;ctx.font='bold 54px monospace';ctx.fillText('FATALITY',400,155);
  ctx.fillStyle=RED;ctx.font='bold 19px monospace';ctx.fillText('DECAPITATION',400,190);
  ctx.restore();
 }
 ctx.restore();
}
