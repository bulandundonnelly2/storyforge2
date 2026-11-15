// Dire Wolf: an original, procedural ZX Spectrum-style finishing creature.
// All artwork is coarse-grid pixel geometry, not external game frames.
import type {World} from './combat';

type Actor=(who:'barbarian'|'knight',frame:number,x:number,ground:number,size:number,rotation:number,alpha:number,headless?:boolean,spin?:number)=>void;
const WHITE='#eee9e2',BONE='#bbb3ac',BLACK='#07060a',INK='#1b1920';
const RED='#e02042',BLOOD='#940e2b';
const CELL=4;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{const t=clamp(v);return t*t*(3-2*t)};
function pix(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){
 ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));
}
// Pixel-rasterise original angular wolf silhouette polygons along scanlines.
function shape(ctx:CanvasRenderingContext2D,pts:number[],color:string,unit=CELL){
 const ys=pts.filter((_,i)=>i%2===1);
 const minY=Math.floor(Math.min(...ys)/unit)*unit;
 const maxY=Math.ceil(Math.max(...ys)/unit)*unit;
 for(let y=minY;y<=maxY;y+=unit){
  const crossing:number[]=[];
  for(let i=0;i<pts.length;i+=2){
   const j=(i+2)%pts.length;
   const x1=pts[i],y1=pts[i+1],x2=pts[j],y2=pts[j+1];
   const sample=y+unit*.5;
   if((y1<=sample&&sample<y2)||(y2<=sample&&sample<y1))
    crossing.push(x1+(sample-y1)*(x2-x1)/(y2-y1));
  }
  crossing.sort((a,b)=>a-b);
  for(let k=0;k+1<crossing.length;k+=2){
   const a=Math.floor(crossing[k]/unit)*unit;
   const b=Math.ceil(crossing[k+1]/unit)*unit;
   if(b>a)pix(ctx,a,y,b-a,unit,color);
  }
 }
}
function direWolf(ctx:CanvasRenderingContext2D,x:number,feet:number,direction:number,age:number,action:'run'|'pounce'|'feed'|'snarl'){
 const stride=Math.floor(age/6)%4,run=action==='run',feeding=action==='feed';
 const attackBite=feeding&&Math.floor((age-121)/11)%2===0;
 const openJaw=attackBite||action==='snarl'||action==='pounce';
 const legSwing=run?[0,11,1,-9][stride]:action==='pounce'?16:0;
 const headNod=feeding?Math.sin((age-121)*.43)*10:action==='snarl'?-7:0;
 ctx.save();
 ctx.translate(Math.round(x/CELL)*CELL,Math.round(feet/CELL)*CELL);
 ctx.scale(direction,1);
 // Angular wind-swept tail and rear haunch silhouette.
 shape(ctx,[-61,-69,-88,-89,-111,-95,-103,-81,-113,-72,-94,-56,-77,-53],WHITE);
 shape(ctx,[-84,-75,-106,-89,-98,-75,-110,-69,-89,-61],INK);
 // Rear legs, alternating stride and landing; oversized paws and claw pixels.
 shape(ctx,[-67,-47,-43,-46,-47,-23,-66,-11,-75,-2,-84,-3,-78,-16,-69,-29],BONE);
 shape(ctx,[-61,-38,-46,-41,-42,-22,-47,-9,-44,-4,-63,-4,-65,-13],INK);
 shape(ctx,[-51,-50,-28,-54,-23,-33,-35,-17,-34+legSwing,-3,-56+legSwing,-2,-60,-11,-48,-24],WHITE);
 // Body outline, coarse tufts on neck and back, lowered shoulders.
 shape(ctx,[-87,-65,-73,-84,-56,-98,-40,-91,-18,-101,2,-89,24,-93,42,-112,53,-95,70,-91,82,-66,65,-42,42,-34,19,-43,-3,-35,-35,-41,-62,-38],WHITE);
 shape(ctx,[-78,-65,-56,-77,-38,-82,-17,-80,0,-82,16,-76,38,-88,49,-71,60,-62,43,-48,10,-53,-8,-47,-47,-53,-66,-48],INK);
 // Rich halftone fur texture, deliberately directional and stable across frames.
 for(let i=0;i<61;i++){
  const xx=-70+(i*17)%117, yy=-76+(i*23)%31;
  if(xx>33&&yy<-60)continue;
  pix(ctx,xx,yy, i%5===0?8:4, i%3===0?4:2, i%4===0?WHITE:i%3===0?BONE:BLACK);
 }
 // Tapered chest and shoulder mane with separate sharp tufts.
 shape(ctx,[25,-93,43,-108,50,-91,68,-97,65,-80,78,-73,71,-47,54,-37,32,-49,14,-62],BONE);
 shape(ctx,[27,-89,39,-102,47,-83,53,-97,61,-79,70,-76,60,-59,70,-54,46,-52,31,-62],WHITE);
 for(let k=0;k<9;k++){
  const tx=26+k*5,yy=-71+(k%3)*7;
  shape(ctx,[tx,yy,tx-5,yy+12,tx+1,yy+6,tx+3,yy-1],k%2?INK:BONE,3);
 }
 // Front limbs: separate readable knees, extended paws and white claws.
 shape(ctx,[30,-58,47,-64,59,-43,54,-22,63,-5,48,-3,40,-23,35,-32],INK);
 shape(ctx,[37,-56,51,-60,55,-42,46,-24,53,-7,44,-7,37,-28],BONE);
 shape(ctx,[54,-53,69,-58,72,-38,80,-18,94,-6,86,0,73,-2,65,-20,57,-33],WHITE);
 shape(ctx,[62,-45,70,-51,71,-32,80,-18,82,-11,76,-15,64,-32],INK);
 for(let i=0;i<3;i++){pix(ctx,85+i*5,-7,6,4,WHITE);pix(ctx,48+i*5,-7,5,4,WHITE)}
 // Ears, cheek fur and long, wolf-like muzzle (not a domestic dog silhouette).
 const hy=headNod;
 ctx.save();ctx.translate(0,hy);
 shape(ctx,[45,-96,49,-118,59,-108,66,-106,76,-119,84,-99,86,-75,74,-60,49,-68],WHITE);
 shape(ctx,[50,-104,53,-113,59,-99,60,-89,51,-91],INK);
 shape(ctx,[72,-107,78,-114,80,-94,70,-94],INK);
 shape(ctx,[50,-92,65,-97,78,-90,93,-88,109,-78,115,-67,110,-59,94,-60,79,-68,59,-65,44,-74],WHITE);
 shape(ctx,[55,-91,69,-88,78,-83,93,-82,106,-76,95,-74,78,-76,59,-73],BONE);
 shape(ctx,[94,-77,108,-77,116,-69,109,-65,96,-67],INK);
 pix(ctx,80,-82,7,6,BLACK);pix(ctx,83,-83,4,4,RED);pix(ctx,87,-84,3,3,WHITE);
 pix(ctx,109,-73,9,8,BLACK);pix(ctx,112,-75,4,4,WHITE);
 // Hinged jaw creates recognizable repeated bites without moving a floating head.
 const jawDrop=openJaw?13:4;
 shape(ctx,[74,-63,95,-65,116,-60,111,-57+jawDrop,96,-55+jawDrop,78,-57+jawDrop],BLACK);
 shape(ctx,[75,-58+jawDrop,90,-54+jawDrop,107,-54+jawDrop,113,-59+jawDrop,104,-49+jawDrop,85,-49+jawDrop],WHITE);
 shape(ctx,[80,-55+jawDrop,101,-55+jawDrop,109,-51+jawDrop,92,-50+jawDrop],BLOOD);
 // Crisp stepped teeth.
 for(let i=0;i<5;i++){
  const tx=84+i*5;pix(ctx,tx,-62,3,5,WHITE);
  pix(ctx,tx+2,-55+jawDrop,3,4,WHITE);
 }
 ctx.restore();
 // A single red scar-like stripe across the neck, not a noisy glow effect.
 shape(ctx,[34,-80,44,-91,48,-78,42,-62],RED,3);
 ctx.restore();
}
function aftermath(ctx:CanvasRenderingContext2D,cx:number,age:number){
 if(age<112)return;
 const spread=ease((age-112)/69),width=35+Math.round(150*spread);
 pix(ctx,cx-width*.5,338,width,7,BLOOD);
 pix(ctx,cx-width*.5+5,338,width-10,4,RED);
 if(age>=133){
  const ticks=Math.floor(age/6),splash=age<182?1:0;
  if(splash)for(let j=0;j<9;j++){
   const dx=((j*29+ticks*13)%92)-46, rise=12+((j*11+ticks*7)%28);
   pix(ctx,cx+dx,332-rise,4+(j%3)*2,4,j%3===0?WHITE:RED);
  }
 }
 // A few scattered bits of old armour remain when the wolf is finished.
 if(age>174){
  pix(ctx,cx-40,327,14,5,WHITE);pix(ctx,cx-16,333,17,4,BONE);
  pix(ctx,cx+37,330,10,4,BONE);
 }
}
export function drawDireWolfFinisher(ctx:CanvasRenderingContext2D,w:World,age:number,actor:Actor){
 const side=w.e.x>=w.p.x?1:-1;
 const foe=w.e.x+(400-w.e.x)*ease(age/40);
 const player=w.p.x+(foe-side*193-w.p.x)*ease(age/49);
 const start=side===1?970:-170;
 const target=foe+side*91;
 const approach=ease((age-34)/75);
 const wx=start+(target-start)*approach;
 const jump=age>=67&&age<=121?57*Math.sin(Math.PI*clamp((age-67)/54)):0;
 const movement=age<83?'run':age<119?'pounce':age<185?'feed':'snarl';
 const wolfFacing=-side;
 ctx.save();
 // Approach and the sudden leap are easy to read against the dark background.
 if(age>=31&&age<72){
  // Eyes in the dark telegraph where the predator will come from.
  pix(ctx,start-side*42,221,8,5,RED);pix(ctx,start-side*59,216,6,5,RED);
 }
 // Draw bite aftermath behind the wolf and fighters.
 aftermath(ctx,foe,age);
 if(age<111){
  actor('knight',age<88?0:12,foe,346,187,0,1);
 }else if(age<143){
  const fallen=ease((age-111)/28);
  actor('knight',13,foe+side*fallen*17,346,183,side*fallen*.82,1);
 }else if(age<189){
  const disappear=ease((age-164)/25);
  actor('knight',15,foe+side*24,343,164,side*.98,1-disappear);
 }
 // Barbarian observes the wolf, sword lowered and out of the creature's way.
 actor('barbarian',age<100?7:0,player,346,189,0,1);
 if(age>=34){
  const biteBob=age>119&&age<182?Math.sin((age-119)*.49)*5:0;
  direWolf(ctx,wx,337-jump+biteBob,wolfFacing,age,movement);
 }
 // Small, individual bright-red slashes track the bite at the knight's position.
 if(age>=116&&age<178&&Math.floor(age/9)%3!==2){
  const n=Math.floor(age/9)%3;
  pix(ctx,foe-side*(8+n*8),256+n*7,22,6,RED);
  pix(ctx,foe-side*2,265+n*7,8,5,WHITE);
 }
 if(age>=214){
  const alpha=ease((age-214)/14);
  pix(ctx,244,38,312,87,'rgba(0,0,0,'+(.74*alpha).toFixed(3)+')');
  ctx.save();ctx.globalAlpha=alpha;ctx.textAlign='center';
  ctx.font='bold 47px monospace';ctx.fillStyle=WHITE;ctx.fillText('FATALITY',400,89);
  ctx.font='bold 19px monospace';ctx.fillStyle=RED;ctx.fillText('DIRE WOLF',400,117);
  ctx.restore();
 }
 ctx.restore();
}
