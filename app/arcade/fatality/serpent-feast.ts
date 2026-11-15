// SERPENT FEAST: render the approved, detailed black/white/red pixel-art atlas.
// Do not regenerate the serpent with polygons or simplified vector geometry.
import type {World} from './combat';
export type SerpentActor=(who:'barbarian'|'knight',frame:number,x:number,ground:number,size:number,rotation:number,alpha:number,headless?:boolean,spin?:number)=>void;
const WHITE='#f2ede4',RED='#e02042';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{const t=clamp(x);return t*t*(3-2*t)};
let atlas:HTMLImageElement|null=null;
let loading=false;
function serpentAtlas(){
 if(typeof window==='undefined')return null;
 if(atlas?.complete&&atlas.naturalWidth>0)return atlas;
 if(!loading){
  loading=true;
  const image=new Image();
  image.onload=()=>{atlas=image;loading=false};
  image.onerror=()=>{loading=false};
  image.src='/assets/snake-fatality-sprites.png';
 }
 return null;
}
const phases=[
 {start:0,frame:0},{start:44,frame:1},{start:69,frame:2},
 {start:90,frame:3},{start:105,frame:4},{start:120,frame:5},
 {start:132,frame:6},{start:145,frame:7},{start:159,frame:8},
 {start:177,frame:9},{start:197,frame:10},{start:218,frame:11}
];
function atlasFrame(age:number){
 let frame=0;
 for(const phase of phases){if(age>=phase.start)frame=phase.frame;else break}
 return frame;
}
function drawAtlas(ctx:CanvasRenderingContext2D,img:HTMLImageElement,frame:number,centre:number,age:number){
 // Image consists of four columns by three rows, twelve original full-colour illustrations.
 const cols=4,rows=3;
 const col=frame%cols,row=Math.floor(frame/cols);
 const sx=Math.round(col*img.naturalWidth/cols),sy=Math.round(row*img.naturalHeight/rows);
 const ex=Math.round((col+1)*img.naturalWidth/cols),ey=Math.round((row+1)*img.naturalHeight/rows);
 // Preserve source detail and original aspect ratio. Never use geometric fallback art.
 const width=395,height=340;
 const x=Math.round(Math.max(width/2+24,Math.min(800-width/2-24,centre)));
 ctx.save();
 ctx.imageSmoothingEnabled=false;
 ctx.drawImage(img,sx,sy,ex-sx,ey-sy,Math.round(x-width/2),40,width,height);
 ctx.restore();
}
export function drawSerpentFeast(ctx:CanvasRenderingContext2D,w:World,age:number,actor:SerpentActor){
 const sheet=serpentAtlas();
 const side=w.e.x>=w.p.x?1:-1;
 const centre=Math.max(275,Math.min(525,(w.e.x+w.p.x)/2));
 const victimX=w.p.x+(centre-side*154-w.p.x)*ease((age-19)/54);
 const knightX=w.e.x+(centre+side*65-w.e.x)*ease((age-15)/56);
 const changed=ease((age-29)/43);
 ctx.save();
 // In the opening beat the knight transforms; subsequent shots are actual authored art.
 if(age<76){
  const visibility=1-changed;
  if(visibility>.01)actor('knight',age<28?0:8,knightX,346,190-85*changed,0,visibility);
 }
 if(age<85)actor('barbarian',13,victimX,346,189,0,1);
 // All detail comes directly from the 12-frame illustrated atlas. No flat-shape serpent.
 if(age>=30&&sheet){
  const entry=ease((age-30)/28);
  ctx.save();ctx.globalAlpha=entry;
  drawAtlas(ctx,sheet,atlasFrame(age),centre+side*60,age);
  ctx.restore();
 }else if(age>=30&&!sheet){
  // No inaccurate placeholder. Loading the correct atlas is preferable to wrong artwork.
  ctx.fillStyle=WHITE;ctx.font='bold 14px monospace';ctx.textAlign='center';
  ctx.fillText('SUMMONING THE SERPENT...',400,180);
 }
 if(age>=222){
  const fade=ease((age-222)/14);
  ctx.fillStyle='rgba(0,0,0,'+(.88*fade).toFixed(3)+')';
  ctx.fillRect(210,44,380,90);
  ctx.save();ctx.globalAlpha=fade;ctx.textAlign='center';
  ctx.fillStyle=WHITE;ctx.font='bold 48px monospace';ctx.fillText('FATALITY',400,92);
  ctx.fillStyle=RED;ctx.font='bold 18px monospace';ctx.fillText('SERPENT FEAST',400,123);
  ctx.restore();
 }
 ctx.restore();
}
