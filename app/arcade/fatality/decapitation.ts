// Fatality Forge: clean ZX Spectrum-style finisher.
// Flying neck chop, small detailed skull, bold stepped red streams, kneel, collapse and clear title.
// All artwork and effects are original, drawn using crisp unfiltered pixels.
import type {World} from './combat';
type Actor=(who:'barbarian'|'knight',frame:number,x:number,ground:number,size:number,rotation:number,alpha:number,headless?:boolean,spin?:number)=>void;
type Helmet=(x:number,y:number,rotation:number,size:number)=>void;
const RED='#ef2245',DARK='#a80b2b',WHITE='#f3eee7';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>{const x=clamp(n);return x*x*(3-2*x)};
function block(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){
 ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));
}
// Four bold, connected RED-water arcs, each starting at the exposed neck.
// They sit BEHIND the body so the skull flight, kneeling and collapse remain readable.
// Clear, thick, stepped 8-bit red-water arcs drawn behind the body.
// Strong connected streams, a few blocky highlights and one grounded pool.
function redWater(ctx:CanvasRenderingContext2D,x:number,y:number,dir:number,age:number){
 const streams=[
  {start:111,end:218,height:118,reach:158,width:20},
  {start:130,end:226,height:94,reach:138,width:17},
  {start:153,end:232,height:72,reach:112,width:15}
 ];
 for(const p of streams){
  if(age<p.start||age>=p.end)continue;
  const elapsed=age-p.start;
  const growth=ease(elapsed/10);
  const fade=1-ease((age-(p.end-15))/15);
  const strength=growth*fade;
  if(strength<=0)continue;
  const reach=p.reach*growth;
  // The four-pixel coordinate grid makes each bend a visible staircase.
  for(let i=0;i<=24;i++){
   const u=i/24;
   const px=Math.round((x+dir*(5+u*reach))/4)*4;
   const py=Math.round((y-p.height*Math.sin(Math.PI*u)*strength+(338-y)*u*u)/4)*4;
   const width=Math.max(5,Math.round(p.width*(1-.32*u)*strength));
   block(ctx,px-2,py-2,width+4,width+3,DARK);
   block(ctx,px,py,width,width,RED);
   if(i%7===0&&strength>.4)block(ctx,px+2,py+2,Math.max(3,width-5),3,WHITE);
  }
 }
 // Ground pool extends in the direction of the stream; never across the sprite.
 if(age>=126){
  const spread=ease((age-126)/76);
  const span=60+Math.round(206*spread);
  const left=dir>0?x-28:x-span+28;
  block(ctx,left,338,span,10,DARK);
  block(ctx,left+4,338,Math.max(8,span-8),7,RED);
  block(ctx,left+18,346,Math.max(8,span-42),3,DARK);
  block(ctx,left+12,335,Math.max(8,span-76),4,RED);
 }
}
export function drawDecapitation(ctx:CanvasRenderingContext2D,w:World,age:number,actor:Actor,helmet?:Helmet){
 const enemy=w.e.x,dir=w.p.x<enemy?1:-1;
 // Close the gap at contact. The atlas blade should reach the knight's neck,
 // without drawing a second disconnected sword over the existing sword sprite.
 // One smooth traveling trajectory from takeoff through impact: no sudden
 // extra lunge when the character changes its aerial sword pose.
 const launchX=w.p.x;
 const impactX=enemy-dir*116;
 const travel=ease((age-22)/96);
 const hero=Math.max(96,Math.min(704,launchX+(impactX-launchX)*travel));
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
 // The original Barbarian's Flying Neck Chop is an airborne turning attack,
 // not a stationary sprite flattened by a cosine transform. We show the takeoff,
 // traveling leap, turn, connected horizontal slash, then the landing.
 // The existing 16-frame atlas provides real sword-in-hand attack and side poses.
 const takeoff=32,turnStart=44,turnEnd=103,landing=145;
 const airPhase=clamp((age-takeoff)/(landing-takeoff));
 // Smooth takeoff and landing tangents, with a slightly longer controlled hang.
 const lift=age>=takeoff&&age<landing
   ?64*Math.pow(Math.sin(Math.PI*airPhase),1.25):0;
 const turnProgress=ease((age-turnStart)/(turnEnd-turnStart));
 const spinAngle=(age>=turnStart&&age<turnEnd)?Math.PI*2*turnProgress:0;
 let pose=0;
 if(age>=19&&age<32)pose=6;           // gather momentum
 else if(age>=32&&age<turnStart)pose=7; // takeoff, sword high
 else if(age>=turnStart&&age<turnEnd){
  // More evenly spaced pose beats give the turn a steadier rhythm.
  if(turnProgress<.15)pose=7;
  else if(turnProgress<.29)pose=3;
  else if(turnProgress<.43)pose=4;
  else if(turnProgress<.58)pose=10;
  else if(turnProgress<.72)pose=4;
  else if(turnProgress<.86)pose=3;
  else pose=8;
 }else if(age>=turnEnd&&age<106)pose=8; // prepare horizontal strike
 else if(age>=106&&age<125)pose=9;      // flying neck chop; contact at 111
 else if(age>=125&&age<landing)pose=8;  // follow-through in air
 else if(age>=landing&&age<155)pose=6;  // controlled landing
 else if(age>=155)pose=7;              // victory silhouette
 // Ground is the actor's feet position, so the arc lifts the whole body and sword.
 actor('barbarian',pose,hero,346-lift,190,0,1,false,spinAngle);
 if(cut){
  if(helmet){
   const flight=clamp((age-111)/63);
   const landed=age>=174;
   const x=landed?enemy+dir*180:enemy+dir*(8+172*flight);
   const y=landed?316-14*Math.abs(Math.sin((age-174)*.16))*Math.exp(-(age-174)/15)
      :197-116*Math.sin(Math.PI*flight)+112*flight*flight;
   helmet(x,y,dir*(landed?5.4+(age-174)*.012:5.4*flight),37);
  }
 }
 // Clean aftermath, then the large title only once all action has settled.
 // Compact title above the action; no rectangle crosses the fighters.
 if(age>=228){
  const alpha=ease((age-228)/12);
  block(ctx,220,38,360,92,'rgba(0,0,0,'+(.72*alpha).toFixed(3)+')');
  ctx.save();ctx.globalAlpha=alpha;ctx.textAlign='center';
  ctx.fillStyle=WHITE;ctx.font='bold 48px monospace';ctx.fillText('FATALITY',400,92);
  ctx.fillStyle=RED;ctx.font='bold 17px monospace';ctx.fillText('DECAPITATION',400,122);
  ctx.restore();
 }
 ctx.restore();
}
