// Original, legible 8-bit cinematic finishers: pause, one focused action, aftermath.
// Palette is deliberately restricted to black, off-white and blood-red.
import type {World} from './combat';
import {drawDecapitation} from './decapitation';
export const FINISHER_FRAMES=246;
export const FINISHER_NAMES=['DECAPITATION','HELLFIRE','SKULL CRUSH'] as const;
export type CinematicActor=(who:'barbarian'|'knight',frame:number,x:number,ground:number,size:number,rotation:number,alpha:number,headless?:boolean,spin?:number)=>void;
export type CinematicHelmet=(x:number,y:number,rotation:number,size:number)=>void;
const BLACK='#050406',WHITE='#f3eee7',RED='#e02042',DARKRED='#8b0e29';
const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
const ease=(v:number)=>{const t=clamp(v);return t*t*(3-2*t)};
function box(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){
 ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));
}
function stroke(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,width:number,color:string){
 const steps=Math.max(2,Math.round(Math.hypot(x2-x1,y2-y1)/4));
 for(let i=0;i<=steps;i++){const t=i/steps;box(ctx,x1+(x2-x1)*t,y1+(y2-y1)*t,width,width,color)}
}
function ring(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,color:string){
 const steps=38;
 for(let i=0;i<steps;i++){
  const theta=i/steps*Math.PI*2;
  box(ctx,x+Math.cos(theta)*r,y+Math.sin(theta)*r*.55,5,5,color);
 }
}
function skull(ctx:CanvasRenderingContext2D,cx:number,cy:number,scale:number){
 // A tiny original tiled skull: kept away from the fighters for a clean silhouette.
 const bits=['  XXXXXXXX  ',' XXXXXXXXXX ','XXXXXXXXXXXX','XXX XX XX XX','XXX XX XX XX','XXXXXXXXXXXX',' XXXX  XXXX ','  X X  X X  ','  XXXXXXXX  '];
 const x=cx-bits[0].length*scale/2,y=cy-bits.length*scale/2;
 for(let row=0;row<bits.length;row++)for(let col=0;col<bits[row].length;col++)
  if(bits[row][col]==='X')box(ctx,x+col*scale,y+row*scale,scale,scale,row<6?WHITE:RED);
}
function impact(ctx:CanvasRenderingContext2D,x:number,y:number,age:number,at:number){
 const dt=age-at;if(dt<0||dt>=17)return;
 if(dt<2)box(ctx,0,0,800,390,'rgba(243,238,231,'+(dt===0?'.70':'.26')+')');
 ring(ctx,x,y,dt*7+12,dt<8?WHITE:RED);
 // Just eight large, readable pixels, not a cloud of random sparks.
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4;
  box(ctx,x+Math.cos(a)*(20+dt*5),y+Math.sin(a)*(14+dt*3),dt<7?8:4,dt<7?8:4,i%3?RED:WHITE);
 }
}
export function finisherAge(w:World):number{
 return w.phase==='win'&&w.finisherDone?FINISHER_FRAMES:clamp(FINISHER_FRAMES-w.fx,0,FINISHER_FRAMES);
}
export function hasFinisherScene(w:World){return Boolean(w.finisherDone)&&(w.phase==='fatality'||w.phase==='win')}
export function drawFinisherBackdrop(ctx:CanvasRenderingContext2D,w:World){
 if(!hasFinisherScene(w))return;
 const age=finisherAge(w),fade=ease(age/34);
 ctx.save();
 // Darken the entire game including normal HUD: fatalities have their own stage.
 box(ctx,0,0,800,390,'rgba(0,0,0,'+(.25+.75*fade).toFixed(3)+')');
 if(age>=28){
  box(ctx,0,0,800,390,BLACK);
  // Single muted red moon and one horizon line. Never copy the reference art or HUD.
  const x=Math.round((w.p.x+w.e.x)/2);
  for(let row=-9;row<=9;row++){
   const half=Math.floor(Math.sqrt(Math.max(0,1-row*row/100))*70/8)*8;
   box(ctx,x-half,137+row*6,half*2,5,DARKRED);
  }
  box(ctx,0,337,800,5,RED);
  box(ctx,0,344,800,46,'#10060b');
 }
 // Slim cinematic letterbox, no HUD or overlapping floating labels.
 box(ctx,0,0,800,40,BLACK);box(ctx,0,377,800,13,BLACK);
 ctx.restore();
}
export function drawFinisherSequence(ctx:CanvasRenderingContext2D,w:World,move:number,actor:CinematicActor,helmet?:CinematicHelmet){
 if(!hasFinisherScene(w))return;
 if(move===0){drawDecapitation(ctx,w,finisherAge(w),actor,helmet);return}
 const age=finisherAge(w);
 const face=w.p.face||1,enemyX=w.e.x;
 const idealX=clamp(enemyX-face*160,110,690);
 const attackerX=w.p.x+(idealX-w.p.x)*ease((age-16)/46);
 const opponentRecoil=move===0?Math.max(0,Math.min(20,(age-89)*.4)):0;
 const opponentX=enemyX+face*opponentRecoil;
 const finalBlow=move===0?148:move===1?162:149;
 const fall=ease((age-finalBlow)/25);
 const fade=move===1?1-ease((age-165)/28):1;
 const attackerStrike=move===0?[88,115,143].some(at=>age>=at-10&&age<at+12):move===1?age>=92&&age<150:age>=126&&age<154;
 const attackerFrame=age<60?0:attackerStrike?move===2?11:move===1?10:9:age>finalBlow?10:8;
 const enemyFrame=age<60?12:fall>0?15:13;
 ctx.save();
 // Opponent collapses only after the actual blow. A single readable pose.
 if(fade>.03)actor('knight',enemyFrame,opponentX+face*fall*36,346,184,face*fall*.9,fade);
 actor('barbarian',attackerFrame,attackerX,346,188,0,1);
 if(age>=56&&age<74){
  // A single omen before the fatality, then clear the screen.
  box(ctx,268,62,264,3,RED);
  ctx.textAlign='center';ctx.font='bold 19px monospace';ctx.fillStyle=WHITE;
  ctx.fillText('FINAL STRIKE',400,86);
  ctx.textAlign='left';
 }
 if(move===0){
  // Three timed cuts, never more than one sword arc at once.
  for(const [i,at] of [88,115,143].entries()){
   const dt=age-at;if(dt>=0&&dt<13){
    const x=enemyX-face*55,top=i%2?263:143,bottom=i%2?135:274;
    stroke(ctx,x-face*52,top,x+face*70,bottom,dt<4?9:5,dt<7?WHITE:RED);
    if(dt<9)box(ctx,x+face*75,Math.min(top,bottom)+65,9,9,RED);
   }
   impact(ctx,enemyX,208,age,at+5);
  }
 }else if(move===1){
  // Hellfire rises once and subsides; no particles over the sword silhouettes.
  if(age>=88&&age<=193){
   const amount=ease((age-88)/40)*(1-ease((age-165)/30));
   for(let i=0;i<7;i++){
    const x=enemyX+(i-3)*19;
    const h=amount*(72+(i%3)*27+Math.sin(age*.17+i)*9);
    if(h>2){
     box(ctx,x,337-h,11,h,i%2?RED:DARKRED);
     if(i%3===0)box(ctx,x+3,337-h+13,4,h*.67,WHITE);
    }
   }
  }
  impact(ctx,enemyX,245,age,151);
 }else{
  // Skull omen approaches, one vertical crushing shockwave, then silence.
  if(age>=74&&age<142){
   const downward=ease((age-112)/30)*70;
   skull(ctx,enemyX,116+downward,age<112?5:6);
  }
  if(age>=143&&age<159){
   const dt=age-143;
   box(ctx,enemyX-91,137+dt*9,182,7,dt<5?WHITE:RED);
  }
  impact(ctx,enemyX,235,age,149);
 }
 // Empty aftermath beat: the title only appears once the opponent has fallen.
 if(age>=211){
  const reveal=ease((age-211)/14);
  box(ctx,171,91,458,121,'rgba(0,0,0,'+(.92*reveal).toFixed(3)+')');
  ctx.save();ctx.globalAlpha=reveal;ctx.textAlign='center';
  ctx.fillStyle=WHITE;ctx.font='bold 57px monospace';ctx.fillText('FATALITY',400,158);
  ctx.fillStyle=RED;ctx.font='bold 20px monospace';
  ctx.fillText(FINISHER_NAMES[move]??'FINISHER',400,192);
  ctx.restore();
 }
 ctx.restore();
}
