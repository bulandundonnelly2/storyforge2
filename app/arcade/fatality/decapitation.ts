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
// Dramatic original three-colour arcade "red water" fountain. Each burst is
// a deliberate arc with a bright crest and a few falling drops, rather than noise.
function neckFountain(ctx:CanvasRenderingContext2D,x:number,y:number,dir:number,age:number){
 const jets=[
  {start:112,height:83,reach:83,life:28,weight:7},
  {start:132,height:70,reach:72,life:27,weight:6},
  {start:153,height:56,reach:60,life:25,weight:5},
  {start:176,height:40,reach:46,life:23,weight:4}
 ];
 for(let jet=0;jet<jets.length;jet++){
  const p=jets[jet],t=age-p.start;
  if(t<0||t>=p.life)continue;
  const grow=ease(t/5),fade=1-ease((t-(p.life-9))/9);
  const power=grow*fade;
  for(let i=0;i<=18;i++){
   const u=i/18;
   // The stream arcs away from the neck before curling down.
   const px=x+dir*(5+p.reach*u*grow);
   const py=y-p.height*(1-(1-u)*(1-u))*power+u*u*(25+Math.max(0,t-9)*1.8);
   const thick=Math.max(2,Math.round((p.weight-3*u)*power));
   block(ctx,px,py,thick,Math.max(3,thick+1),i%6===0?WHITE:i%3===0?DARK:RED);
  }
  // Individual large droplets, staggered along the ballistic arc.
  for(let j=0;j<7;j++){
   const travel=(t+j*4)/p.life;
   const dx=dir*(13+j*14+travel*21);
   const rise=p.height*(.75-(j%3)*.11);
   const dropY=y-rise+Math.pow(Math.max(0,t-7-j*2),2)*.42;
   if(dropY<334&&dropY>70)
    block(ctx,x+dx,dropY,(j%3===0?6:4)*power+1,5*power+1,j%4===0?WHITE:RED);
  }
 }
 // Pixel "water" lands by the feet and gathers into a shallow rippling red pool.
 // It stays below the action, leaving both characters' silhouettes unobscured.
 if(age>=129){
  const spread=ease((age-129)/77),fade=1-ease((age-222)/24);
  const width=22+Math.round(125*spread);
  for(let i=0;i<width;i+=8){
   const xOffset=dir*(i+7);
   const depth=3+(i%5===0?3:0);
   block(ctx,x+xOffset,334+((i/8)%3),7,depth,i%5===0?WHITE:i%3===0?DARK:RED);
  }
  for(let ripple=0;ripple<3;ripple++){
   const xx=x+dir*(17+ripple*36+spread*18);
   block(ctx,xx,333-ripple%2,17+spread*11,2+ripple%2,ripple===1?DARK:RED);
  }
  // The last splash dies down before the final title reveal.
  if(fade<1)block(ctx,x+dir*8,336,Math.max(1,width*fade),2,DARK);
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
