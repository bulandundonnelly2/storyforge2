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
 // Close the gap at contact. The atlas blade should reach the knight's neck,
 // without drawing a second disconnected sword over the existing sword sprite.
 const approach=w.p.x+(enemy-dir*158-w.p.x)*ease((age-22)/65);
 const lunge=42*ease((age-94)/18);
 const hero=Math.max(96,Math.min(704,approach+dir*lunge));
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
 // These source atlas poses contain the actual sword, correctly attached to the
 // fighter's hand: 7 = upright blade, 10 = overhead, 8 = drawn back,
 // 9 = horizontal neck-height attack. Do not paint additional floating blade lines.
 let pose=0;
 if(age>=23&&age<42)pose=7;           // draw sword high
 else if(age>=42&&age<59)pose=10;    // start short flourish
 else if(age>=59&&age<77)pose=8;     // rotate to rear guard
 else if(age>=77&&age<94)pose=10;    // finish the sword twirl overhead
 else if(age>=94&&age<106)pose=8;    // wind up for the one decisive swing
 else if(age>=106&&age<123)pose=9;   // connected sword strike, contact at 111
 else if(age>=123&&age<144)pose=8;   // follow through and recover
 else if(age>=144&&age<180)pose=7;   // composed victor posture
 actor('barbarian',pose,hero,346,190,0,1);
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
