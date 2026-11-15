// Fatality Forge: clean ZX Spectrum-style finisher.
// One flourish, one cut, three bold connected RED-water streams, kneel, collapse, title.
// All artwork and effects are original, drawn using crisp unfiltered pixels.
import type {World} from './combat';
type Actor=(who:'barbarian'|'knight',frame:number,x:number,ground:number,size:number,rotation:number,alpha:number,headless?:boolean)=>void;
type Helmet=(x:number,y:number,rotation:number,size:number)=>void;
const RED='#ef2245',DARK='#a80b2b',WHITE='#f3eee7';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>{const x=clamp(n);return x*x*(3-2*x)};
function block(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){
 ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));
}
function blade(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,width:number){
 const steps=Math.max(10,Math.ceil(Math.hypot(x2-x1,y2-y1)/3));
 for(let i=0;i<=steps;i++){
  const u=i/steps;
  block(ctx,x1+(x2-x1)*u,y1+(y2-y1)*u,width,width,WHITE);
 }
}
// RED WATER: three large, continuous arcade fountains, never particle noise.
// Each thick arch starts at the moving knight's neck and visibly lands at the feet.
function redWater(ctx:CanvasRenderingContext2D,x:number,y:number,dir:number,age:number){
 const streams=[
  {start:111,end:175,height:104,reach:143,width:12},
  {start:129,end:196,height:85,reach:120,width:11},
  {start:151,end:213,height:64,reach:91,width:10}
 ];
 for(const stream of streams){
  const elapsed=age-stream.start;
  if(elapsed<0||age>stream.end)continue;
  const emerge=ease(elapsed/9);
  const finish=1-ease((age-stream.end+13)/13);
  const strength=emerge*finish;
  if(strength<=0)continue;
  const reach=stream.reach*emerge;
  const thickness=Math.max(2,Math.round(stream.width*strength));
  for(let i=0;i<=36;i++){
   const u=i/36;
   // Smooth parabola rendered as stepped rectangular 8-bit ribbons.
   const px=x+dir*(5+u*reach);
   const py=y-stream.height*Math.sin(Math.PI*u)*strength+(336-y)*u*u;
   const w=Math.max(3,Math.round(thickness*(1-u*.36)));
   block(ctx,px,py,w,w+1,RED);
   if(i%3===0)block(ctx,px,py+w-1,w,2,DARK);
  }
  // Three chunky drops, not dozens of scattered red pixels.
  for(let j=0;j<3;j++){
   const u=.53+j*.16;
   const px=x+dir*(7+u*reach);
   const py=y-stream.height*Math.sin(Math.PI*u)*strength+(336-y)*u*u+Math.max(0,elapsed-12)*1.7;
   if(py<339)block(ctx,px,py,5,7,RED);
  }
 }
 // Water gathers in one clear, expanding pool under the knight.
 if(age>=127){
  const grow=ease((age-127)/65);
  const span=35+Math.round(130*grow);
  const left=dir>0?x-25:x-span+25;
  block(ctx,left,338,span,7,DARK);
  block(ctx,left+8,338,Math.max(3,span-18),4,RED);
  block(ctx,left+Math.round(12*grow),345,Math.max(3,span-33),3,DARK);
 }
}
export function drawDecapitation(ctx:CanvasRenderingContext2D,w:World,age:number,actor:Actor,helmet?:Helmet){
 const enemy=w.e.x,dir=w.p.x<enemy?1:-1;
 const hero=w.p.x+(enemy-dir*167-w.p.x)*ease((age-22)/65);
 const cut=age>=111;
 ctx.save();
 // The knight remains upright first, slowly drops onto its knees, then slumps.
 if(!cut){
  actor('knight',age<81?0:12,enemy,346,185,0,1);
 }else if(age<137){
  actor('knight',0,enemy,346,185,0,1,true);
 }else if(age<156){
  actor('knight',1,enemy+dir*4,346,185,0,1,true);
 }else if(age<192){
  const kneel=ease((age-156)/26);
  actor('knight',2,enemy+dir*8,346+6*kneel,185-7*kneel,0,1,true);
 }else{
  const slump=ease((age-192)/24);
  actor('knight',3,enemy+dir*(10+slump*22),348+slump*3,184,dir*slump*.08,1,true);
 }
 // A readable sword flourish: pose changes, no long animated streaks.
 const pose=age<24?0:age<43?8:age<65?10:age<87?8:age<99?10:age<120?9:age<177?10:0;
 actor('barbarian',pose,hero,346,190,0,1);
 // One restrained glint during the twirl, then ONE neck-height finishing stroke.
 if(age>=50&&age<=56){
  const u=(age-50)/6;
  blade(ctx,hero+dir*33,194,hero+dir*(45+16*u),151-13*u,3);
 }
 if(age>=101&&age<=113){
  const u=(age-101)/12;
  blade(ctx,hero+dir*53,204-17*u,enemy+dir*(9+19*u),199+4*u,age<109?7:4);
 }
 // A tiny clean contact flash rather than a full-screen strobe.
 if(age===111)block(ctx,enemy-dir*10,193,29,8,WHITE);
 if(cut){
  // As the body kneels, lower the fountain's origin with the neck.
  const bend=ease((age-150)/39);
  const neckX=enemy+dir*(10+8*bend);
  const neckY=205+28*bend;
  redWater(ctx,neckX,neckY,dir,age);
  if(helmet){
   const flight=clamp((age-111)/63);
   const landed=age>=174;
   const x=landed?enemy+dir*180:enemy+dir*(8+172*flight);
   const y=landed?316-14*Math.abs(Math.sin((age-174)*.16))*Math.exp(-(age-174)/15)
      :197-116*Math.sin(Math.PI*flight)+112*flight*flight;
   helmet(x,y,dir*(landed?5.4+(age-174)*.012:5.4*flight),51);
  }
 }
 // Clean aftermath, then the large title only once all action has settled.
 if(age>=222){
  const alpha=ease((age-222)/12);
  block(ctx,183,90,434,119,'rgba(0,0,0,'+(.9*alpha).toFixed(3)+')');
  ctx.save();ctx.globalAlpha=alpha;ctx.textAlign='center';
  ctx.fillStyle=WHITE;ctx.font='bold 53px monospace';ctx.fillText('FATALITY',400,155);
  ctx.fillStyle=RED;ctx.font='bold 19px monospace';ctx.fillText('DECAPITATION',400,190);
  ctx.restore();
 }
 ctx.restore();
}
