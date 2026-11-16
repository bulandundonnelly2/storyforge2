// Animated ZX Spectrum-style Serpent Feast. No static atlas frames.
import type {World} from './combat';
export type SerpentActor=(who:'barbarian'|'knight',frame:number,x:number,ground:number,size:number,rotation:number,alpha:number,headless?:boolean,spin?:number)=>void;
const WHITE='#f3eee7',GREY='#aaa3a3',RED='#e02042',DARKRED='#801127',INK='#100b10',BLACK='#050406';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{const t=clamp(v);return t*t*(3-2*t)};
function px(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))}
function snake(c:CanvasRenderingContext2D,age:number,cx:number,side:number){
 const tick=Math.floor(age/3),t=tick*.18;
 const coil=ease((age-31)/35),rear=ease((age-77)/23),lunge=ease((age-106)/13)-ease((age-131)/16);
 const bite=ease((age-143)/10)-ease((age-182)/20);
 const hx=cx-side*(132+rear*23-lunge*105),hy=275-rear*78+lunge*57+bite*23;
 c.save();c.imageSmoothingEnabled=false;
 // Articulated overlapping body links with travelling waves and scale markings.
 for(let i=0;i<=44;i++){
  const u=i/44,phase=t-u*9.2,r=3+17*Math.sin(Math.PI*u);
  const x=cx+side*(161-293*u+Math.sin(phase)*15*(1-u))+(hx-(cx-side*132))*Math.pow(u,5);
  const y=308-65*Math.sin(Math.PI*u)*coil+Math.sin(phase)*13*(.3+u*.7)+(hy-275)*Math.pow(u,6);
  px(c,x-r-4,y-r-4,2*r+8,2*r+8,INK);
  px(c,x-r,y-r,2*r,2*r,WHITE);
  px(c,x-r+3,y+2,Math.max(2,2*r-6),Math.max(2,r-2),GREY);
  px(c,x-r+4,y-r+3,Math.max(2,r*1.4),3,BLACK);
  if(i%3===0&&i>3&&i<41){px(c,x-3,y-r+4,5,5,DARKRED);px(c,x+4,y-r+9,3,3,RED)}
 }
 // Pixel-built crocodilian serpent head, with distinct hinged lower jaw.
 c.save();c.translate(Math.round(hx),Math.round(hy));c.scale(side,1);
 px(c,-34,-18,57,36,INK);px(c,-37,-14,55,27,WHITE);
 px(c,-67,-5,45,19,INK);px(c,-65,-4,44,14,WHITE);
 px(c,-69,1,23,5,GREY);px(c,-17,-16,29,6,GREY);
 px(c,-22,-21,13,9,WHITE);px(c,-15,-19,8,7,RED);px(c,-13,-18,4,4,BLACK);
 px(c,-52,-9,5,4,BLACK);px(c,-60,-2,5,3,BLACK);
 const jaw=3+Math.round(bite*17);
 px(c,-65,13,52,7,INK);px(c,-63,14+jaw,51,8,WHITE);
 px(c,-60,14+jaw,45,3,RED);
 for(let i=0;i<6;i++){px(c,-59+i*8,11,3,6,WHITE);px(c,-56+i*8,16+jaw,3,5,WHITE)}
 px(c,10,-17,7,5,DARKRED);px(c,19,-9,5,6,RED);
 c.restore();
 // Readable bite sparks and restrained red impact pixels.
 if(age>=151&&age<178){const n=age-151;for(let i=0;i<5;i++)px(c,hx-side*(75+n*(i%2+1)),hy-5+(i-2)*12,5,5,i%2?WHITE:RED)}
 c.restore();
}
export function drawSerpentFeast(ctx:CanvasRenderingContext2D,w:World,age:number,actor:SerpentActor){
 const side=w.e.x>=w.p.x?1:-1,cx=Math.max(280,Math.min(520,(w.e.x+w.p.x)/2));
 const approach=ease((age-17)/53),transform=ease((age-27)/42);
 const victimX=w.p.x+(cx-side*160-w.p.x)*approach;
 const knightX=w.e.x+(cx+side*70-w.e.x)*approach;
 ctx.save();
 if(age<72)actor('knight',age<28?0:8,knightX,346,190-85*transform,0,1-transform);
 if(age<148)actor('barbarian',age>118?12:13,victimX,346,189,0,1);
 else if(age<214){const fall=ease((age-151)/30);actor('barbarian',15,victimX-side*fall*36,346,189,side*fall*.95,1-ease((age-193)/21))}
 if(age>=29){ctx.globalAlpha=ease((age-29)/22);snake(ctx,age,cx+side*55,side);ctx.globalAlpha=1}
 if(age>=218){const a=ease((age-218)/15);px(ctx,205,44,390,98,'rgba(0,0,0,'+(.92*a)+')');ctx.globalAlpha=a;ctx.textAlign='center';ctx.fillStyle=WHITE;ctx.font='bold 48px monospace';ctx.fillText('FATALITY',400,94);ctx.fillStyle=RED;ctx.font='bold 18px monospace';ctx.fillText('SERPENT FEAST',400,125);ctx.globalAlpha=1}
 ctx.restore();
}
