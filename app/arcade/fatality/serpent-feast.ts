// SERPENT FEAST — the skeletal knight becomes a giant bone-armoured serpent.
// Original pixel geometry: black, ivory and deep red; no copied game artwork.
// Art is built as detailed, raster-stepped body contours rather than rectangles.
import type {World} from './combat';
export type SerpentActor=(who:'barbarian'|'knight',frame:number,x:number,ground:number,size:number,rotation:number,alpha:number,headless?:boolean,spin?:number)=>void;
const BLACK='#050406',WHITE='#f2ede4',RED='#e02042',DARK='#870c27';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{const t=clamp(v);return t*t*(3-2*t)};
function px(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){
 ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));
}
function poly(ctx:CanvasRenderingContext2D,points:number[],color:string,grid=2){
 // Scanline-rasterised polygon: hard square pixels and no vector antialiasing.
 const ys=points.filter((_,i)=>i%2===1);
 const yMin=Math.floor(Math.min(...ys)/grid)*grid;
 const yMax=Math.ceil(Math.max(...ys)/grid)*grid;
 for(let y=yMin;y<yMax;y+=grid){
  const at=y+grid*.5,intersections:number[]=[];
  for(let i=0;i<points.length;i+=2){
   const j=(i+2)%points.length,x1=points[i],y1=points[i+1],x2=points[j],y2=points[j+1];
   if((y1<=at&&at<y2)||(y2<=at&&at<y1))intersections.push(x1+(at-y1)*(x2-x1)/(y2-y1));
  }
  intersections.sort((a,b)=>a-b);
  for(let i=0;i+1<intersections.length;i+=2){
   const x=Math.floor(intersections[i]/grid)*grid,far=Math.ceil(intersections[i+1]/grid)*grid;
   if(far>x)px(ctx,x,y,far-x,grid,color);
  }
 }
}
type Node={x:number;y:number;r:number};
function interpolate(points:Node[]):Node[]{
 const out:Node[]=[];
 for(let i=0;i<points.length-1;i++){
  const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];
  for(let j=0;j<5;j++){
   const t=j/5,t2=t*t,t3=t2*t;
   const val=(a:number,b:number,c:number,d:number)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);
   out.push({x:val(p0.x,p1.x,p2.x,p3.x),y:val(p0.y,p1.y,p2.y,p3.y),r:val(p0.r,p1.r,p2.r,p3.r)});
  }
 }
 out.push(points[points.length-1]);return out;
}
function ribbon(ctx:CanvasRenderingContext2D,nodes:Node[],padding:number,color:string){
 const l:number[]=[],r:number[]=[];
 for(let i=0;i<nodes.length;i++){
  const a=nodes[Math.max(0,i-1)],b=nodes[Math.min(nodes.length-1,i+1)];
  let dx=b.x-a.x,dy=b.y-a.y;
  const length=Math.hypot(dx,dy)||1;dx/=length;dy/=length;
  const half=Math.max(1,nodes[i].r+padding);
  l.push(nodes[i].x-dy*half,nodes[i].y+dx*half);
  r.unshift(nodes[i].x+dy*half,nodes[i].y-dx*half);
 }
 poly(ctx,[...l,...r],color,2);
}
function scaledCoils(ctx:CanvasRenderingContext2D,age:number,lunging:number,dropping:number){
 const wave=Math.sin(age*.12)*3;
 const nodes=interpolate([
  {x:-123,y:-19,r:7},{x:-153,y:-36,r:11},{x:-153,y:-72,r:15},
  {x:-126,y:-94+wave,r:19},{x:-99,y:-84,r:21},{x:-103,y:-49,r:22},
  {x:-73,y:-25,r:25},{x:-29,y:-35,r:26},{x:-11,y:-63,r:24},
  {x:2,y:-112,r:22},{x:24+lunging*10,y:-146+dropping*18,r:20},
  {x:62+lunging*28,y:-159+dropping*28,r:22},
  {x:82+lunging*66,y:-150+dropping*55,r:23}
 ]);
 ribbon(ctx,nodes,6,BLACK);
 ribbon(ctx,nodes,2,WHITE);
 ribbon(ctx,nodes,-5,BLACK);
 // Bony belly plates and interlocking dark scale diamonds, anchored to the curves.
 for(let i=4;i<nodes.length-2;i+=2){
  const p=nodes[i],a=nodes[Math.max(0,i-1)],b=nodes[Math.min(nodes.length-1,i+1)];
  const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1;
  const nx=-dy/length,ny=dx/length;
  // Alternating white ribs over a dark core create high-density ZX Spectrum texture.
  if(i%4===0){
   const x=Math.round((p.x+nx*(p.r*.3))/2)*2,y=Math.round((p.y+ny*(p.r*.3))/2)*2;
   px(ctx,x-4,y-2,10,3,WHITE);
   px(ctx,x+nx*8,y+ny*8,3,5,WHITE);
  }
  if(i%6===0){
   const x=p.x-nx*(p.r*.65),y=p.y-ny*(p.r*.65);
   px(ctx,x,y,5,3,WHITE);
  }
 }
 // Fine black-and-white diagonal hatching on the broad coiled tail.
 for(let i=0;i<35;i++){
  const t=(i*37)%101/100,x=-141+t*122,y=-51+Math.sin(t*7.3)*8;
  if(i%3===0)px(ctx,x,y,7,2,WHITE);
 }
}
function serpentHead(ctx:CanvasRenderingContext2D,x:number,y:number,age:number,jaw:number){
 ctx.save();ctx.translate(Math.round(x/2)*2,Math.round(y/2)*2);
 const nod=age>129&&age<182?Math.sin(age*.33)*5:0;
 ctx.translate(0,nod);
 // Two jagged horn crests echo the skeletal knight's helmet and shield.
 poly(ctx,[-53,-6,-42,-31,-37,-44,-27,-34,-18,-50,-9,-38,4,-40,14,-28,24,-35,39,-18,52,-15,62,-4,59,9,43,15,19,17,-4,25,-28,22,-47,9],BLACK);
 poly(ctx,[-50,-5,-39,-29,-35,-38,-28,-27,-17,-43,-8,-30,5,-34,13,-24,25,-29,40,-14,53,-12,57,-3,54,7,35,11,14,10,-9,18,-29,17,-43,6],WHITE);
 poly(ctx,[-38,-12,-29,-26,-17,-24,-22,-9],BLACK);
 poly(ctx,[-9,-23,2,-29,13,-19,3,-9,-7,-11],BLACK);
 // Armoured scales, angular brow and a small deliberate red eye.
 for(let i=0;i<11;i++){
  const xx=-27+i*7,yy=-14+((i*3)%13);
  poly(ctx,[xx,yy,xx+5,yy-5,xx+10,yy,xx+5,yy+4],i%3===0?BLACK:WHITE);
 }
 px(ctx,17,-10,10,5,BLACK);
 px(ctx,20,-10,5,4,RED);
 px(ctx,22,-11,2,2,WHITE);
 // A long hooked snout with nostril and a sharply outlined upper jaw.
 poly(ctx,[22,-11,37,-15,55,-9,74,-6,87,1,85,10,67,14,47,10,24,15],BLACK);
 poly(ctx,[23,-8,38,-12,54,-7,73,-3,82,2,79,7,67,10,49,7,25,10],WHITE);
 px(ctx,74,0,6,3,BLACK);px(ctx,79,-1,3,3,WHITE);
 // Dark mouth cavity remains visible between the separately hinged jaws.
 poly(ctx,[25,12,56,11,83,10,79,14+jaw,51,19+jaw,25,20+jaw],BLACK);
 ctx.save();ctx.translate(24,10);
 ctx.rotate(Math.min(.22,jaw*.006));
 poly(ctx,[0,3,26,7,52,4,64,5,59,13+jaw,38,15+jaw,15,17+jaw,-4,12+jaw],WHITE);
 poly(ctx,[5,6,32,9,56,7,48,10+jaw,25,11+jaw],BLACK);
 for(let i=0;i<7;i++){
  px(ctx,17+i*6,3,3,6,WHITE);
  px(ctx,17+i*6,12+jaw,3,5,WHITE);
 }
 ctx.restore();
 // The forked red tongue extends during the predatory hiss and lunge.
 if(jaw>12){
  px(ctx,79,16+jaw*.5,15,3,RED);
  px(ctx,92,12+jaw*.5,10,3,RED);
  px(ctx,92,20+jaw*.5,9,3,RED);
 }
 ctx.restore();
}
function serpent(ctx:CanvasRenderingContext2D,x:number,feet:number,face:number,age:number,stage:'morph'|'rear'|'lunge'|'feed'|'idle',grown:number){
 const lunge=stage==='lunge'?ease((age-105)/23):stage==='feed'||stage==='idle'?1:0;
 const drop=stage==='lunge'?lunge:stage==='feed'||stage==='idle'?1:0;
 const feed=stage==='feed';
 const headX=82+lunge*66;
 const headY=-150+drop*55;
 const jaw=stage==='rear'?14:stage==='lunge'?8+lunge*25:feed?10+(Math.floor((age-129)/9)%2)*25:stage==='idle'?4:8;
 ctx.save();ctx.translate(Math.round(x),Math.round(feet));
 ctx.scale(face*Math.max(.06,grown),Math.max(.06,grown));
 scaledCoils(ctx,age,lunge,drop);
 serpentHead(ctx,headX,headY,age,jaw);
 // A few restrained vertebra-like spurs along the rising neck.
 for(let i=0;i<6;i++){
  const y=-71-i*12,x=5+i*5;
  poly(ctx,[x-7,y+6,x-2,y-12,x+6,y+5],i%2===0?WHITE:BLACK);
 }
 ctx.restore();
}
function redWater(ctx:CanvasRenderingContext2D,x:number,y:number,face:number,age:number){
 if(age<124)return;
 const spread=ease((age-124)/70),width=38+Math.round(218*spread);
 px(ctx,x-width/2,337,width,10,DARK);
 px(ctx,x-width/2+5,337,width-10,6,RED);
 px(ctx,x-width/2+20,346,width-40,3,DARK);
 const arcs=[
  {a:125,b:171,r:110,h:78,t:17},
  {a:137,b:182,r:134,h:91,t:16},
  {a:151,b:195,r:96,h:60,t:13}
 ];
 for(const arc of arcs){
  if(age<arc.a||age>=arc.b)continue;
  const v=age-arc.a,amp=ease(v/7)*(1-ease((age-(arc.b-11))/11));
  for(let i=0;i<21;i++){
   const u=i/20;
   const pxX=Math.round((x+face*u*arc.r*amp)/4)*4;
   const pxY=Math.round((y-arc.h*Math.sin(Math.PI*u)*amp+(337-y)*u*u)/4)*4;
   const thick=Math.max(3,Math.round((arc.t-5*u)*amp));
   px(ctx,pxX-2,pxY-2,thick+3,thick+3,DARK);
   px(ctx,pxX,pxY,thick,thick,RED);
  }
 }
 // Just a few coarse 8-bit beads; no particle cloud in front of the snake.
 if(age>=130&&age<180){
  const tick=Math.floor(age/5);
  for(let i=0;i<8;i++){
   const xx=Math.round((x+((i*29+tick*17)%108)-54)/4)*4;
   const yy=Math.round((y-((i*19+tick*13)%72))/4)*4;
   px(ctx,xx,yy,4+(i%2)*2,4,RED);
  }
 }
}
export function drawSerpentFeast(ctx:CanvasRenderingContext2D,w:World,age:number,actor:SerpentActor){
 const side=w.e.x>=w.p.x?1:-1,face=-side;
 const centre=Math.max(275,Math.min(525,(w.e.x+w.p.x)/2));
 const knightX=w.e.x+(centre+side*73-w.e.x)*ease((age-18)/58);
 const heroBase=w.p.x+(centre-side*113-w.p.x)*ease((age-16)/65);
 const changing=ease((age-29)/46);
 const grown=age<30?0:ease((age-30)/41);
 const stage=age<73?'morph':age<105?'rear':age<129?'lunge':age<184?'feed':'idle';
 const bitten=ease((age-127)/55);
 ctx.save();
 // Single consistent stage: knight shrinks away before the fully formed serpent appears.
 if(age<74){
  const visibility=1-changing;
  if(visibility>.01)actor('knight',age<28?0:8,knightX,346,190-78*changing,0,visibility);
 }
 // Keep all red-water jets behind the original fighter sprites.
 if(age>=124)redWater(ctx,heroBase+face*17,264,face,age);
 if(age<130){
  actor('barbarian',age<105?13:12,heroBase,346,189,0,1);
 }else if(age<184){
  // The victim is pulled behind the open jaws, not superimposed on top of them.
  const moved=heroBase+face*77*bitten;
  const size=189-65*bitten;
  const alpha=1-ease((age-142)/35);
  if(alpha>.02)actor('barbarian',15,moved,346+9*bitten,size,face*.12*bitten,alpha);
 }
 if(age>=30)serpent(ctx,knightX,338,face,age,stage,grown);
 if(age>=185){
  // Small, legible remains, rather than overlapping full-body sprites.
  px(ctx,heroBase-20,328,17,5,WHITE);
  px(ctx,heroBase+4,332,21,5,RED);
  px(ctx,heroBase+26,329,10,5,WHITE);
 }
 if(age>=222){
  const fade=ease((age-222)/13);
  px(ctx,218,38,364,94,'rgba(0,0,0,'+(.74*fade).toFixed(3)+')');
  ctx.save();ctx.globalAlpha=fade;ctx.textAlign='center';
  ctx.fillStyle=WHITE;ctx.font='bold 48px monospace';ctx.fillText('FATALITY',400,92);
  ctx.fillStyle=RED;ctx.font='bold 18px monospace';ctx.fillText('SERPENT FEAST',400,123);
  ctx.restore();
 }
 ctx.restore();
}
