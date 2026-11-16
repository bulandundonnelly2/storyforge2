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
 // A deliberate transformation replaces the knight, not a snake appearing beside him.
 const headX=26+strike*65+feeding*18,headY=-97-rise*50+strike*43+feeding*22;
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
  // Dense interlocking black-and-bone scale plates, similar to the Dire Wolf's fur detail.
  for(let row=0;row<15;row++)for(let col=0;col<29;col++){
   const x=(k===0?-174:-46)+col*9+(row%2)*4;
   const y=-113+row*7;
   const allowed=k===0?(x<-49&&x>-178):(x>-44&&x<117);
   const shape=k===0?Math.pow((x+114)/76,2)+Math.pow((y+65)/56,2)<1:Math.pow((x-34)/91,2)+Math.pow((y+61)/62,2)<1;
   if(allowed&&shape){
    // Fine serrated scales: white ridge, black crescent and shadowed root.
    px(c,x,y,6,2,WHITE);
    px(c,x+2,y+2,5,2,BLACK);
    if((row+col)%3===0)px(c,x+4,y+4,2,2,WHITE);
    if((row*7+col)%17===0)px(c,x+1,y+3,2,2,RED);
   }
  }
  c.restore();
 }
 // A muscular neck, with a tapered S curve that rears and strikes.
 // The serpent's skull stays connected to its thick neck throughout the lunge.
 c.save();c.translate(105+strike*30,0);
 const neckX=-68+strike*29;
 poly(c,[-82,-47,-100,-70,-105,-105-rise*27,-92,-134-rise*28,-69,-144-rise*28,-47,-123-rise*20,-47,-94,-52,-73,neckX,-44],WHITE);
 poly(c,[-88,-57,-91,-89,-88,-119-rise*23,-73,-135-rise*26,-59,-116-rise*19,-60,-92,-64,-68],BLACK);
 for(let i=0;i<14;i++){
  const y=-131+i*6-rise*23*(1-i/14),x=-81+Math.round(Math.sin(i*.6+age*.08)*5);
  px(c,x,y,8,2,WHITE);px(c,x+3,y+3,3,2,WHITE);
 }
 c.restore();
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
 // Dire Wolf density: individually edged temple scales, brow ridges and cheek stippling.
 for(let i=0;i<105;i++){const x=-27+(i*13)%90,y=-33+(i*7)%37;px(c,x,y,2,2,i%19===0?RED:i%4===0?WHITE:BLACK)}
 for(let i=0;i<14;i++){
  const x=-21+i*7,y=-32+Math.round(Math.sin(i*.75)*6);
  px(c,x,y,8,2,WHITE);px(c,x+2,y+3,5,2,BLACK);
 }
 // Horned skull has distinct pixel spikes and ridged cheek scales.
 for(let i=0;i<9;i++){
  const x=-28+i*8;
  poly(c,[x,-35,x+3,-47-(i%3)*4,x+8,-33],WHITE);
  px(c,x+3,-34,3,3,BLACK);
 }
 c.restore();
 if(age>=148&&age<185){for(let i=0;i<7;i++){const x=headX+70+(i%3)*13,y=headY+12+(i-3)*10;px(c,x,y,4+(i%2)*3,4,i%3===0?WHITE:RED)}}
 c.restore();
}
// Six hand-drawn Dire Wolf-style poses from serpent-atlas-256.png (3 columns x 2 rows).
// Keep a procedural fallback until the binary sprite is available in /public.
let atlas:HTMLCanvasElement|null=null;
let loading=false;
function spriteAtlas():HTMLCanvasElement|null{
 if(typeof window==='undefined')return null;
 if(atlas||loading)return atlas;
 loading=true;
 const img=new Image();
 img.onload=()=>{
  const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
  const g=c.getContext('2d',{willReadFrequently:true});if(!g)return;
  g.drawImage(img,0,0);
  const pixels=g.getImageData(0,0,c.width,c.height);
  for(let i=0;i<pixels.data.length;i+=4){
   const r=pixels.data[i],gr=pixels.data[i+1],b=pixels.data[i+2];
   // Remove the sprite sheet's black background to layer it over both fighters.
   if(r<31&&gr<31&&b<31)pixels.data[i+3]=0;
  }
  g.putImageData(pixels,0,0);atlas=c;
 };
 img.onerror=()=>{loading=false};
 img.src='/arcade/serpent-atlas-256.png';
 return null;
}
function drawSprite(c:CanvasRenderingContext2D,age:number,cx:number,side:number):boolean{
 const a=spriteAtlas();if(!a)return false;
 const frame=age<72?0:age<107?1:age<137?2:age<161?3:age<192?4:5;
 const fw=a.width/3,fh=a.height/2;
 c.save();c.imageSmoothingEnabled=false;
 c.translate(Math.round(cx),0);c.scale(side===1?-1:1,1);
 c.drawImage(a,(frame%3)*fw,Math.floor(frame/3)*fh,fw,fh,-190,35,380,330);
 c.restore();return true;
}


// Impact: one clear bite, then an enormous pixel-red splash and spreading floor pool.
function bloodBurst(c:CanvasRenderingContext2D,age:number,x:number,y:number){
 const t=age-143;if(t<0)return;
 // ZX Spectrum-inspired 4px grid, three reds, and hard stepped silhouettes.
 const P=4,DEEP='#790d27',MID='#b20f31',BRIGHT='#ef2148';
 const snap=(n:number)=>Math.round(n/P)*P;
 const block=(xx:number,yy:number,ww:number,hh:number,color:string)=>
  px(c,snap(xx),snap(yy),Math.max(P,snap(ww)),Math.max(P,snap(hh)),color);
 const pool=ease((t-5)/53),impact=ease(t/8);
 c.save();c.imageSmoothingEnabled=false;
 // Broad liquid flood is made from rectangular 4px tiles with an uneven staircase edge.
 const reach=24+302*pool;
 for(let row=0;row<11;row++){
  const width=reach*(1-row*.035)+((row*7)%5)*P;
  const yy=337+row*P;
  block(x-width,yy,width*2,P,row%4===0?DEEP:row%3===0?MID:BRIGHT);
 }
 // Ragged outer rim, never smooth circles or translucent gradients.
 for(let i=0;i<35;i++){
  const side=i%2===0?1:-1;
  const xx=x+side*(reach*(.55+(i%9)*.052));
  const yy=337-((i*7)%5)*P;
  block(xx,yy,8+(i%4)*P,4+(i%3)*P,i%5===0?DEEP:BRIGHT);
 }
 // The initial blast: bold stair-step red pillars and chunky splatter fragments.
 if(t<34){
  const burst=Math.sin(Math.PI*clamp(t/34));
  for(let i=0;i<19;i++){
   const xx=x+(i-9)*P*4;
   const hh=snap((16+(i*17)%96)*burst*impact);
   if(hh>0)block(xx,330-hh,P*(1+i%3),hh,i%4===0?DEEP:i%3===0?MID:BRIGHT);
  }
 }
 // Each droplet is a small, sharp pixel cluster with ballistic motion, no antialiasing.
 if(t<85)for(let i=0;i<130;i++){
  const delay=(i%13)*1.25,dt=t-delay;if(dt<=0)continue;
  const vx=Math.sin(i*2.399)*(1.1+(i%11)*.28);
  const vy=-2.4-(i%9)*.38;
  const xx=x+vx*dt*2.4,yy=y+vy*dt*2.5+.12*dt*dt;
  if(yy>=339)continue;
  const unit=(i%5===0?3:i%3===0?2:1)*P;
  block(xx,yy,unit,P*(i%7===0?3:1),i%7===0?MID:i%6===0?DEEP:BRIGHT);
  if(i%8===0)block(xx+P,yy+P,P,P,BRIGHT);
 }
 // Sparse 4px highlights break up the pool into old-school dither patterns.
 for(let i=0;i<45;i++){
  const xx=x-reach+((i*73)%Math.max(P,Math.floor(reach*2/P)*P));
  const yy=345+(i*11)%29;
  block(xx,yy,P*(i%3===0?2:1),P,i%4===0?BRIGHT:DEEP);
 }
 c.restore();
}

export function drawSerpentFeast(ctx:CanvasRenderingContext2D,w:World,age:number,actor:SerpentActor){
 // The skeletal knight transforms, the serpent bites the barbarian, and a red liquid explosion fills the arena.
 const side=w.p.x>=w.e.x?1:-1;
 const cx=Math.max(285,Math.min(515,(w.e.x+w.p.x)/2));
 const knightX=w.e.x+(cx-side*86-w.e.x)*ease((age-6)/32);
 const victimX=w.p.x+(cx+side*105-w.p.x)*ease((age-6)/37);
 const morph=ease((age-32)/38);
 ctx.save();
 // 0-32: Both combatants are visible. The skeletal knight raises his weapon.
 if(age<70){
  const tremor=age>30?Math.sin(age*1.6)*4*morph:0;
  actor('knight',age<22?0:age<43?10:12,knightX+tremor,346,190+30*morph,0,1-morph);
  // Skeleton-to-serpent change: growing white scale blocks erupt from the knight.
  if(age>=34){
   const growth=ease((age-34)/33);
   for(let i=0;i<19;i++){
    const a=i*2.399+age*.07,r=(12+i*4)*growth;
    px(ctx,knightX+Math.cos(a)*r,255+Math.sin(a)*r,4+(i%3)*3,4+(i%2)*4,i%7===0?RED:WHITE);
   }
  }
 }
 // 42-82: A giant serpent grows out of the knight's position, not from off-screen.
 if(age>=43){
  ctx.save();ctx.globalAlpha=ease((age-43)/29);
  if(!drawSprite(ctx,age,cx-side*43,side))serpent(ctx,age,cx-side*43,side);
  ctx.restore();
 }
 // Bite lands at frame 143: the fighter disappears in a single explosive impact.
 // Do not show the previous shrinking/swallowing or detached-skull pose.
 if(age<143){
  const panic=age>=107?Math.sin(age*.45)*3:0;
  const lift=age>=124?ease((age-124)/19)*20:0;
  actor('barbarian',age<107?0:12,victimX+panic,346-lift,188,0,1);
 }
 if(age>=143)bloodBurst(ctx,age,victimX,260);
 // Unboxed 8-bit title: sharp bitmap lettering and red liquid dripping from the glyphs.
 if(age>=214){
  const reveal=ease((age-214)/16),t=age-214;
  const title=document.createElement('canvas');
  title.width=360;title.height=82;
  const g=title.getContext('2d');
  if(g){
   g.textAlign='center';g.textBaseline='top';
   g.fillStyle=WHITE;g.font='bold 46px monospace';g.fillText('FATALITY',180,0);
   g.fillStyle=RED;g.font='bold 18px monospace';g.fillText('SERPENT FEAST',180,54);
   ctx.save();ctx.globalAlpha=reveal;ctx.imageSmoothingEnabled=false;
   // Render at half resolution then enlarge: authentic blocky, stepped letter edges.
   const pixel=document.createElement('canvas');pixel.width=180;pixel.height=41;
   const pg=pixel.getContext('2d');
   if(pg){
    pg.imageSmoothingEnabled=false;pg.drawImage(title,0,0,180,41);
    ctx.drawImage(pixel,220,36,360,82);
    // Red drips start directly beneath the smaller red text, with no backdrop.
    for(let i=0;i<24;i++){
     const x=263+i*12;
     const dropDelay=(i*11)%35;
     const length=Math.min(44,Math.max(0,(t-dropDelay)*.65));
     if(length<4)continue;
     const bottom=113+length;
     px(ctx,x,112,4,length,i%5===0?'#9a0c29':RED);
     px(ctx,x-2,bottom,8,4,RED);
     if(t>dropDelay+48)px(ctx,x+2,bottom+6+((t-dropDelay)*2)%37,4,6,RED);
    }
   }
   ctx.restore();
  }
 }
 ctx.restore();
}
