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
// Three broad and continuous red-water fountains, with no random droplets or sparks.
// Layered BEHIND the body so the armour, kneeling poses and skull remain easy to read.
function redWater(ctx:CanvasRenderingContext2D,x:number,y:number,dir:number,age:number){
 const streams=[
  {start:111,end:204,height:113,reach:150,width:18},
  {start:127,end:217,height:93,reach:134,width:16},
  {start:147,end:226,height:70,reach:107,width:14}
 ];
 // One smooth, expanding red pool at the base. Keep it beneath the figures.
 if(age>=125){
  const growth=ease((age-125)/74),span=32+Math.round(179*growth);
  const left=dir>0?x-23:x-span+23;
  block(ctx,left,337,span,9,DARK);
  block(ctx,left+4,337,Math.max(4,span-8),6,RED);
  block(ctx,left+18,344,Math.max(4,span-42),3,DARK);
 }
 for(const p of streams){
  const elapsed=age-p.start;
  if(elapsed<0||age>=p.end)continue;
  const rise=ease(elapsed/10),fade=1-ease((age-(p.end-14))/14);
  const strength=rise*fade;
  if(strength<=0)continue;
  const reach=p.reach*rise;
  for(let i=0;i<=50;i++){
   const u=i/50;
   const px=x+dir*(4+u*reach);
   const py=y-p.height*Math.sin(Math.PI*u)*strength+(337-y)*u*u;
   const thickness=Math.max(3,Math.round(p.width*(1-.26*u)*strength));
   // Thick stepped ribbons: red core, dark outline; never a spray of loose particles.
   block(ctx,px-1,py-1,thickness+2,thickness+2,DARK);
   block(ctx,px,py,thickness,thickness,RED);
  }
 }
}
export function drawDecapitation(ctx:CanvasRenderingContext2D,w:World,age:number,actor:Actor,helmet?:Helmet){
 const enemy=w.e.x,dir=w.p.x<enemy?1:-1;
 const hero=w.p.x+(enemy-dir*167-w.p.x)*ease((age-22)/65);
 const cut=age>=111;
 ctx.save();
 if(cut){
  const kneel=ease((age-150)/39);
  // Attach the streams to the neck as the knight sinks, but keep them behind the silhouette.
  redWater(ctx,enemy+dir*(10+8*kneel),205+28*kneel,dir,age);
 }
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
 if(age>=101&&age<=113){
  const u=(age-101)/12;
  blade(ctx,hero+dir*53,204-17*u,enemy+dir*(9+19*u),199+4*u,age<109?7:4);
 }
 // A tiny clean contact flash rather than a full-screen strobe.
 if(age===111)block(ctx,enemy-dir*10,193,29,8,WHITE);
 if(cut){
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
