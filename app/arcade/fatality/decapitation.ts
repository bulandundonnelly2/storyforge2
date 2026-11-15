// Original ZX Spectrum-style sword finishing animation: one cut, a flying helmet,
// a headless collapse, and a restrained final title. Uses existing knight sprite.
import type {World} from './combat';
type Actor=(who:'barbarian'|'knight',frame:number,x:number,ground:number,size:number,rotation:number,alpha:number,headless?:boolean)=>void;
type Helmet=(x:number,y:number,rotation:number,size:number)=>void;
const RED='#e02042',WHITE='#f3eee7';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>{const x=clamp(n);return x*x*(3-2*x)};
function block(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,c:string){
 ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
}
function slash(ctx:CanvasRenderingContext2D,x:number,y:number,xx:number,yy:number,c:string,width:number){
 for(let i=0;i<=35;i++){const t=i/35;block(ctx,x+(xx-x)*t,y+(yy-y)*t,width,width,c)}
}
export function drawDecapitation(ctx:CanvasRenderingContext2D,w:World,age:number,actor:Actor,helmet?:Helmet){
 const enemy=w.e.x,dir=w.p.x<enemy?1:-1;
 const hero=w.p.x+(enemy-dir*167-w.p.x)*ease((age-27)/49);
 const headOff=age>=111,fall=ease((age-117)/54);
 const pose=age<61?0:age<99?8:age<125?9:age<171?10:0;
 ctx.save();
 if(!headOff){
  actor('knight',age<70?0:12,enemy,346,185,0,1);
 }else{
  actor('knight',0,enemy+dir*fall*19,346,185,dir*(.08+fall*1.10),1,true);
  // Small two-tone edge at the neckline; no particle clutter.
  if(age<155)block(ctx,enemy-dir*11+dir*fall*15,208+fall*34,8,5,RED);
 }
 actor('barbarian',pose,hero,346,190,0,1);
 // One unmistakable horizontal sword swipe, then a flash at the precise hit frame.
 if(age>=97&&age<118){
  const dt=age-97;
  slash(ctx,hero+dir*48,age<107?157:188,enemy+dir*40,age<107?161:208,dt<14?WHITE:RED,dt<9?8:4);
 }
 if(age>=111&&age<127){
  const dt=age-111;
  if(dt<2)block(ctx,0,39,800,339,'rgba(245,239,229,'+(dt===0?'.62':'.25')+')');
  for(let i=0;i<10;i++){
   const a=i*Math.PI/5;
   block(ctx,enemy+Math.cos(a)*(16+dt*6),201+Math.sin(a)*(11+dt*4),5,5,i%3?RED:WHITE);
  }
 }
 // Helmet + skull crop from the original atlas. An arc, one bounce, then stillness.
 if(headOff&&helmet){
  const t=clamp((age-111)/69),flying=age<=180;
  const x=flying?enemy+dir*(8+187*t):enemy+dir*(195+(age-180)*.96);
  const y=flying?204-117*Math.sin(Math.PI*t)+109*t*t
                :314-20*Math.abs(Math.sin((age-180)*.2))*Math.exp(-(age-180)/15);
  helmet(x,y,dir*(flying?6.2*t:6.2+(age-180)*.045),52);
 }
 // Leave space for the aftermath. Title appears after the body has fallen.
 if(age>=211){
  const opacity=ease((age-211)/14);
  block(ctx,182,90,436,121,'rgba(0,0,0,'+(.87*opacity).toFixed(3)+')');
  ctx.save();ctx.globalAlpha=opacity;ctx.textAlign='center';
  ctx.fillStyle=WHITE;ctx.font='bold 54px monospace';ctx.fillText('FATALITY',400,155);
  ctx.fillStyle=RED;ctx.font='bold 19px monospace';ctx.fillText('DECAPITATION',400,190);
  ctx.restore();
 }
 ctx.restore();
}
