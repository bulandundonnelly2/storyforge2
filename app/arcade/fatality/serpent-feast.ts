// Serpent Feast: original high-detail 2px ZX Spectrum serpent, matching Dire Wolf art direction.
import type {World} from './combat';
export type SerpentActor=(who:'barbarian'|'knight',frame:number,x:number,ground:number,size:number,rotation:number,alpha:number,headless?:boolean,spin?:number)=>void;
const WHITE='#f3efe7',BLACK='#08070a',RED='#ec2343',U=2;
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{const t=clamp(x);return t*t*(3-2*t)};
function px(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))}
function poly(c:CanvasRenderingContext2D,p:number[],color:string){
 const ys=p.filter((_,i)=>i%2===1);
 for(let y=Math.floor(Math.min(...ys)/U)*U;y<=Math.ceil(Math.max(...ys)/U)*U;y+=U){
  const xs:number[]=[];for(let i=0;i<p.length;i+=2){const j=(i+2)%p.length,x1=p[i],y1=p[i+1],x2=p[j],y2=p[j+1],s=y+U/2;
   if((y1<=s&&s<y2)||(y2<=s&&s<y1))xs.push(x1+(s-y1)*(x2-x1)/(y2-y1))}
  xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2){const a=Math.floor(xs[i]/U)*U,b=Math.ceil(xs[i+1]/U)*U;if(b>a)px(c,a,y,b-a,U,color)}
 }
}
function serpent(c:CanvasRenderingContext2D,age:number,cx:number,side:number){
 const coil=ease((age-29)/39),rise=ease((age-75)/28),strike=ease((age-109)/13)-ease((age-137)/19);
 const feeding=ease((age-149)/12)-ease((age-188)/21);
 const pulse=Math.sin(Math.floor(age/4)*.55);
 const headX=-105+strike*102,headY=-96-rise*43+strike*54+feeding*23;
 c.save();c.translate(Math.round(cx),337);c.scale(side,1);c.imageSmoothingEnabled=false;
 // Huge interlocking coils, not a thin spinal line. Body fills the entire lower stage.
 const coils=[
  [-155,-20,-182,-49,-177,-89,-147,-110,-103,-111,-61,-92,-46,-65,-55,-41,-83,-29,-121,-35,-137,-56,-125,-78,-99,-81,-80,-67,-84,-56,-110,-57,-124,-69,-112,-91,-76,-92,-43,-75,-28,-49,-43,-18,-81,-8,-124,-9],
  [-45,-28,-58,-57,-47,-88,-15,-111,25,-117,67,-109,99,-90,121,-61,120,-34,102,-16,70,-8,39,-17,24,-36,31,-61,55,-75,78,-69,89,-49,82,-36,61,-34,41,-46,30,-70,11,-82,-10,-72,-14,-47,-4,-24]
 ];
 c.save();c.globalAlpha=coil;
 for(let k=0;k<coils.length;k++){
  const wobble=Math.round(Math.sin(age*.075+k*1.7)*4/2)*2;
  c.save();c.translate(wobble,0);poly(c,coils[k],WHITE);
  // Heavy dark overlapping back plates and white underside give real volume.
  const plates=k===0?[-156,-48,-159,-82,-137,-98,-109,-99,-81,-88,-61,-69,-67,-56,-95,-48,-123,-48,-145,-66,-139,-83,-112,-87,-91,-77,-88,-67,-115,-68,-132,-79,-122,-91,-93,-89,-67,-71,-64,-48,-91,-34,-130,-36]:[-39,-52,-37,-85,-9,-103,27,-108,63,-101,91,-83,109,-59,107,-38,90,-30,85,-51,71,-77,50,-85,27,-74,12,-56,8,-39,-5,-36,-14,-51];
  poly(c,plates,BLACK);
  // Hand-placed, tightly packed diamond scale highlights.
  for(let row=0;row<8;row++)for(let col=0;col<13;col++){
   const x=(k===0?-159:-36)+col*17+(row%2)*8;
   const y=-97+row*9;
   const allowed=k===0?(x<-63&&x>-172):(x>-42&&x<109);
   if(allowed&&((row*7+col*11+k)%5!==0)){
    px(c,x,y,5,2,WHITE);px(c,x+2,y+3,2,3,WHITE);
   }
  }
  c.restore();
 }
 // A muscular neck, with a tapered S curve that rears and strikes.
 const neckX=-68+strike*29,neckY=-61-rise*27;
 poly(c,[-82,-47,-100,-70,-105,-105-rise*27,-92,-134-rise*28,-69,-144-rise*28,-47,-123-rise*20,-47,-94,-52,-73,neckX,-44],WHITE);
 poly(c,[-88,-57,-91,-89,-88,-119-rise*23,-73,-135-rise*26,-59,-116-rise*19,-60,-92,-64,-68],BLACK);
 for(let i=0;i<14;i++){
  const y=-131+i*6-rise*23*(1-i/14),x=-81+Math.round(Math.sin(i*.6+age*.08)*5);
  px(c,x,y,8,2,WHITE);px(c,x+3,y+3,3,2,WHITE);
 }
 // The neck follows the head; dark silhouette retains width at full extension.
 c.save();c.translate(headX,headY);c.rotate(-.11*rise+.12*strike+Math.sin(age*.06)*.015);
 // Distinct crown horns, cheek plates, broad skull and long crocodilian muzzle.
 poly(c,[-30,-20,-35,-47,-23,-41,-14,-57,-4,-39,15,-38,33,-26,43,-17,33,2,14,13,-9,12,-30,1],WHITE);
 poly(c,[-30,-29,-34,-45,-25,-36,-15,-50,-7,-32,7,-29,22,-30,33,-22,30,-12,14,-8,-4,-13,-21,-9],BLACK);
 poly(c,[-10,-15,22,-23,42,-21,64,-14,85,-10,91,-1,82,8,52,10,32,5,13,9,-8,1],WHITE);
 poly(c,[2,-15,27,-19,46,-16,72,-11,87,-7,81,-3,55,-4,34,-1,12,-4],BLACK);
 // Ridged nose, individual scale plates, nostrils and blood-red eye.
 for(let i=0;i<8;i++){px(c,13+i*8,-16+(i%3)*2,5,3,WHITE);px(c,17+i*8,-11+(i%2)*2,2,2,BLACK)}
 px(c,77,-8,5,4,BLACK);px(c,83,-3,4,3,BLACK);
 poly(c,[-13,-27,3,-31,12,-23,3,-14,-10,-15],WHITE);
 px(c,-3,-25,8,6,RED);px(c,0,-24,3,3,BLACK);px(c,8,-23,3,3,WHITE);
 const gape=feeding>0?Math.round(feeding*23):strike>.45?10:3;
 poly(c,[11,7,37,8,61,10,85,8,78,17+gape,52,23+gape,26,19+gape,7,12+gape],WHITE);
 poly(c,[20,11,51,14,77,13,71,16+gape,48,17+gape,24,14+gape],BLACK);
 px(c,20,10+gape,48,3,RED);
 for(let i=0;i<8;i++){const x=21+i*8;poly(c,[x,6,x+5,6,x+2,13],WHITE);poly(c,[x,13+gape,x+5,13+gape,x+3,8+gape],WHITE)}
 // Crisp 2px dithering across temple and lower cheek.
 for(let i=0;i<27;i++){const x=-25+(i*13)%51,y=-26+(i*7)%27;px(c,x,y,2,2,i%4===0?RED:BLACK)}
 c.restore();
 if(age>=148&&age<185){for(let i=0;i<7;i++){const x=headX+70+(i%3)*13,y=headY+12+(i-3)*10;px(c,x,y,4+(i%2)*3,4,i%3===0?WHITE:RED)}}
 c.restore();
}
export function drawSerpentFeast(ctx:CanvasRenderingContext2D,w:World,age:number,actor:SerpentActor){
 const side=w.e.x>=w.p.x?1:-1,cx=Math.max(270,Math.min(530,(w.e.x+w.p.x)/2));
 const enter=ease((age-18)/48),morph=ease((age-24)/45);
 const victim=w.p.x+(cx+side*119-w.p.x)*enter,knight=w.e.x+(cx-side*77-w.e.x)*enter;
 ctx.save();
 if(age<73)actor('knight',age<29?0:8,knight,346,190-90*morph,0,1-morph);
 if(age<151)actor('barbarian',age<119?13:12,victim,346,188,0,1);
 else if(age<208){const fall=ease((age-151)/31);actor('barbarian',15,victim+side*fall*35,346,188,side*fall*.9,1-ease((age-188)/20))}
 if(age>=28){ctx.globalAlpha=ease((age-28)/25);serpent(ctx,age,cx-side*25,side);ctx.globalAlpha=1}
 if(age>=215){const a=ease((age-215)/17);px(ctx,218,46,364,92,'rgba(0,0,0,'+(.9*a)+')');ctx.globalAlpha=a;ctx.textAlign='center';ctx.fillStyle=WHITE;ctx.font='bold 48px monospace';ctx.fillText('FATALITY',400,92);ctx.fillStyle=RED;ctx.font='bold 18px monospace';ctx.fillText('SERPENT FEAST',400,124);ctx.globalAlpha=1}
 ctx.restore();
}
