// BONE HARVEST — original ZX Spectrum-inspired enemy victory cinematic.
// One readable thrust, lifted opponent, rising slash and heavy kneeling fall.
import type {World} from './combat';
export type BoneActor=(who:'barbarian'|'knight',frame:number,x:number,ground:number,size:number,rotation:number,alpha:number,headless?:boolean,spin?:number)=>void;
const WHITE='#f3eee7',RED='#e02042',DARK='#890d28';
const ease=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t)};
function block(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){
 ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));
}
// Thick stepped 8-bit red-water arcs, behind the combatant silhouettes.
function fountain(ctx:CanvasRenderingContext2D,x:number,y:number,side:number,age:number){
 const streams=[
  {start:94,end:158,h:78,reach:128,width:13},
  {start:118,end:178,h:93,reach:151,width:16},
  {start:151,end:206,h:62,reach:117,width:12},
  {start:175,end:213,h:43,reach:91,width:9}
 ];
 for(const f of streams){
  if(age<f.start||age>=f.end)continue;
  const t=age-f.start,force=ease(t/8)*(1-ease((age-(f.end-11))/11));
  for(let i=0;i<=23;i++){
   const u=i/23;
   const px=Math.round((x+side*u*f.reach*force)/4)*4;
   const py=Math.round((y-f.h*Math.sin(Math.PI*u)*force+(337-y)*u*u)/4)*4;
   const width=Math.max(3,Math.round(f.width*(1-u*.48)*force));
   block(ctx,px-2,py-2,width+3,width+3,DARK);
   block(ctx,px,py,width,width,RED);
  }
 }
 if(age>=98){
  const width=34+Math.round(202*ease((age-98)/104));
  block(ctx,x-width/2,337,width,9,DARK);
  block(ctx,x-width/2+6,337,width-12,5,RED);
  block(ctx,x-width/2+19,344,width-38,3,DARK);
 }
}
// Draw a small convincing single blade gleam without floating extra swords.
function slash(ctx:CanvasRenderingContext2D,x:number,y:number,side:number,age:number){
 if(age<153||age>=164)return;
 const t=(age-153)/11;
 const baseX=x-side*51;
 for(let i=0;i<16;i++){
  const u=i/15;
  block(ctx,baseX+side*(u*108),y+32-93*u+25*t*u,5,5,i%5===0?RED:WHITE);
 }
}
export function drawBoneHarvest(ctx:CanvasRenderingContext2D,w:World,age:number,actor:BoneActor){
 const side=w.e.x>w.p.x?1:-1;
 // Preserve original character facing and do not teleport them on the kill frame.
 const centre=Math.max(215,Math.min(585,(w.p.x+w.e.x)/2));
 const knightStart=w.e.x,heroStart=w.p.x;
 const knightX=knightStart+(centre+side*52-knightStart)*ease((age-29)/49);
 const heroX=heroStart+(centre-side*43-heroStart)*ease((age-30)/57);
 const heroLift=age>=105&&age<166?48*Math.sin(Math.PI*ease((age-105)/61)):0;
 const kneel=ease((age-166)/26);
 const fall=ease((age-193)/27);
 ctx.save();
 // Calm opening and delayed approach communicate the knight's control.
 if(age>=39&&age<71)block(ctx,292,62,216,3,RED);
 // Water sits behind the sprites so the motion is unambiguous.
 if(age>=94)fountain(ctx,heroX+side*11,229+29*kneel,side,age);
 // Victim folds to his knees and collapses after the upward strike.
 if(age<104){
  actor('barbarian',age<56?12:13,heroX,346,189,0,1);
 }else if(age<166){
  actor('barbarian',13,heroX+side*7,346-heroLift,188,side*.05,1);
 }else if(age<193){
  actor('barbarian',13,heroX+side*9,346+8*kneel,185-27*kneel,side*.18*kneel,1);
 }else{
  actor('barbarian',15,heroX+side*(11+fall*26),349,183,side*(.20+fall*.89),1);
 }
 // Three coherent sword positions on the knight, with the actual atlas weapon attached.
 const knightFrame=age<49?0:age<85?8:age<105?9:age<128?11:age<148?10:age<169?11:age<201?7:0;
 actor('knight',knightFrame,knightX,346,189,0,1);
 slash(ctx,heroX+side*3,214,side,age);
 // Tiny block impact marker only at the thrust frame.
 if(age>=94&&age<100)block(ctx,heroX+side*18,229,15,7,WHITE);
 // Final deliberate finishing stab while the victim lies still.
 if(age>=194&&age<202)block(ctx,heroX+side*17,294+(age-194)*3,9,12,RED);
 if(age>=222){
  const reveal=ease((age-222)/12);
  block(ctx,218,39,364,91,'rgba(0,0,0,'+(.79*reveal).toFixed(3)+')');
  ctx.save();ctx.globalAlpha=reveal;ctx.textAlign='center';
  ctx.fillStyle=WHITE;ctx.font='bold 49px monospace';ctx.fillText('FATALITY',400,94);
  ctx.fillStyle=RED;ctx.font='bold 17px monospace';ctx.fillText('BONE HARVEST',400,123);
  ctx.restore();
 }
 ctx.restore();
}
