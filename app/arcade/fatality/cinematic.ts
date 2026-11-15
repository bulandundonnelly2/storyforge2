// Original, high-contrast 8-bit finisher cinematics for Fatality Forge.
// Screen staging, pixels and effects are procedural; the existing sprites stay intact.
import type {World} from './combat';

export const FINISHER_FRAMES=246;
export const FINISHER_NAMES=['SWORD STORM','HELLFIRE','SKULL CRUSH'] as const;

function pixel(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){
 ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));
}
function clamp(v:number,min=0,max=1){return Math.max(min,Math.min(max,v))}
function slash(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,color:string,size=5){
 const steps=36;
 for(let i=0;i<=steps;i++){
  const x=x1+(x2-x1)*i/steps,y=y1+(y2-y1)*i/steps;
  pixel(ctx,x,y,size+(i%5===0?5:0),size,color);
 }
}
function ring(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,color:string){
 for(let i=0;i<48;i++){
  const theta=i*Math.PI/24;
  pixel(ctx,x+Math.cos(theta)*r,y+Math.sin(theta)*r*.60,5,4,color);
 }
}
function splinters(ctx:CanvasRenderingContext2D,x:number,y:number,t:number,move:number){
 const distance=Math.max(0,t-83);
 for(let i=0;i<65;i++){
  const angle=(i*2.39996)+move*.35;
  const speed=1.5+(i%9)*.48;
  const outward=clamp(distance,0,60)*speed;
  const px=x+Math.cos(angle)*outward;
  const py=y+Math.sin(angle)*outward*.68+Math.max(0,distance-28)*.24;
  if(px<15||px>785||py<76||py>338)continue;
  pixel(ctx,px,py,i%4===0?7:3,i%6===0?5:3,i%6===0?'#f5f0e8':i%3===0?'#970d28':'#fa173a');
 }
}
function skullSigil(ctx:CanvasRenderingContext2D,x:number,y:number,scale:number){
 const glyph=[
  '  XXXXXXXX  ',
  ' XXXXXXXXXX ',
  'XXX XX XX XX',
  'XXX XX XX XX',
  'XXXXXXXXXXXX',
  ' XXXX  XXXX ',
  '  X X  X X  ',
  '  XXXXXXXX  ',
  '   X X X X  '
 ];
 glyph.forEach((line,row)=>{for(let col=0;col<line.length;col++)if(line[col]==='X')pixel(ctx,x+col*scale,y+row*scale,scale,scale,row<6?'#e8203c':'#f1f0e8')});
}
export function finisherAge(w:World):number{
 return w.phase==='win'&&w.finisherDone?FINISHER_FRAMES:clamp(FINISHER_FRAMES-w.fx,0,FINISHER_FRAMES);
}
export function hasFinisherScene(w:World){return Boolean(w.finisherDone)&&(w.phase==='fatality'||w.phase==='win')}
export function drawFinisherBackdrop(ctx:CanvasRenderingContext2D,w:World){
 if(!hasFinisherScene(w))return;
 const age=finisherAge(w);
 ctx.save();
 // Fade to near-black in the first half-second, keeping the white fighters readable.
 const darkness=.15+.80*clamp(age/38);
 pixel(ctx,0,57,800,333,'rgba(0,0,0,'+darkness.toFixed(3)+')');
 const x=w.e.x;
 if(age>=23){
  // Ritual red backlight / blood moon, drawn with hard-edged Spectrum pixels.
  for(let row=0;row<17;row++){
   const yy=89+row*9,halfWidth=Math.sqrt(Math.max(0,1-Math.pow((row-8)/9,2)))*92;
   const glint=age<65?(age-23)/42:1;
   pixel(ctx,x-halfWidth,yy,halfWidth*2,6,'rgba(137,9,30,'+(glint*.66).toFixed(3)+')');
  }
  pixel(ctx,0,325,800,4,'#891026');
  pixel(ctx,0,329,800,4,'#16040a');
  // Red pools of light beneath the combatants, not detailed gore.
  for(let i=0;i<9;i++)pixel(ctx,x-66+i*14,332,7+(i%3)*5,3,'#b30b31');
 }
 // Letterbox bands make the sequence a distinct cutscene.
 pixel(ctx,0,57,800,age<28?Math.round(age*.46):14,'#010103');
 pixel(ctx,0,382-Math.min(14,age*.46),800,14,'#010103');
 ctx.restore();
}
export function drawFinisherSequence(ctx:CanvasRenderingContext2D,w:World,move:number,drawSprite:(frame:number,x:number,y:number,size?:number)=>void){
 if(!hasFinisherScene(w))return;
 const age=finisherAge(w),x=w.e.x,y=217;
 ctx.save();
 const heartbeat=[82,120,168,200];
 // Wind-up: stark white blade and restrained warning typography.
 if(age>30&&age<82){
  const glimmer=age%18<7;
  if(glimmer)slash(ctx,w.p.x+20,201,x-34,158,'#f6f0e4',3);
  if(age%22<12)pixel(ctx,x-63,140,126,3,'#e32441');
 }
 // Each selectable finishing style has a distinct readable, original animation.
 if(age>=72&&age<=208){
  if(move===0){ // Sword Storm: successive monumental blade cuts and bursts of 8-bit sparks.
   for(let strike=0;strike<4;strike++){
    const onset=79+strike*27,delta=age-onset;
    if(delta>=0&&delta<26){
     const alpha=1-delta/27;
     const tilt=strike%2?-1:1;
     const sx=x-105+delta*5,sy=126+(strike%3)*31;
     slash(ctx,sx,sy,x+75-delta*1.5,sy+tilt*95,'#f5efe4',delta<8?7:4);
     if(delta<15)slash(ctx,sx+7,sy+5,x+84-delta*1.5,sy+tilt*96,'rgba(238,18,55,'+alpha.toFixed(3)+')',4);
     drawSprite(strike%2?5:6,x,210,110+Math.round((1-alpha)*18));
    }
   }
  }else if(move===1){ // Hellfire: flickering flame columns and searing floor cracks.
   const height=clamp((age-72)/45)*160;
   for(let i=0;i<17;i++){
    const off=(i-8)*13,wiggle=Math.sin((age+i*13)*.19)*8;
    const h=height*(.52+(i%5)*.13);
    pixel(ctx,x+off+wiggle,330-h,7+(i%3)*3,h,i%3===0?'#f7e7d9':i%2===0?'#ea1b3c':'#9e092c');
    if(i%4===0)pixel(ctx,x+off+wiggle,330-h-17,5,12,'#fa4351');
   }
   for(let i=0;i<22;i++)pixel(ctx,x-135+i*12,329-((age+i*7)%11),7,3,'#f0203d');
   drawSprite(9,x,246,150);
  }else{ // Skull Crush: enormous spectral omen followed by a seismic impact.
   if(age<150){
    skullSigil(ctx,x-75,83,12);
    const rr=65+Math.sin(age*.20)*14;
    ring(ctx,x,174,rr,'#c90d30');
   }
   if(age>=128){
    const rr=(age-128)*5;
    if(rr<240){ring(ctx,x,245,rr,'#f2e9e4');ring(ctx,x,245,rr*.82,'#e91e43')}
    for(let i=0;i<24;i++){
     const xx=x-140+i*12;
     pixel(ctx,xx,325-Math.abs(Math.sin(i*3.2+age*.08))*((age-128)%48),7,7,i%3?'#bd1332':'#f8efe6');
    }
    drawSprite(11,x,224,145);
   }
  }
 }
 // Three separate impact peaks: white strobe, shock wave and heavy pixel fragments.
 const impactTimes=move===0?[101,146,183]:move===1?[119,160,192]:[132,165,196];
 for(const [index,impact] of impactTimes.entries()){
  const delta=age-impact;
  if(delta>=0&&delta<24){
   if(delta<3)pixel(ctx,0,57,800,333,'rgba(255,246,240,'+(index===2?.64:.40)*(1-delta/3)+')');
   const radius=delta*6;
   ring(ctx,x,213,radius,index===2?'#f7f0e7':'#e92546');
   for(let p=0;p<25;p++){
    const angle=p*6.283/25;
    pixel(ctx,x+Math.cos(angle)*radius,y+Math.sin(angle)*radius*.68,4,4,p%3?'#eb2140':'#fff3e6');
   }
  }
 }
 if(age>=91&&age<216)splinters(ctx,x,217,age,move);
 if(age>=172){
  for(let i=0;i<34;i++){
   const px=x-120+((i*47)%239),fall=((i*29+age*(2+i%4))%198);
   pixel(ctx,px,84+fall,2+i%3,4+i%5,i%5?'#b90c2d':'#f4eee4');
  }
 }
 if(age>=205){
  const panelOpacity=clamp((age-205)/12);
  pixel(ctx,132,108,536,115,'rgba(0,0,0,'+(panelOpacity*.89).toFixed(3)+')');
  ctx.textAlign='center';
  ctx.font='bold 54px monospace';
  ctx.fillStyle=age%12<8?'#f2ede5':'#d51b3f';
  ctx.fillText('FATALITY',400,164);
  ctx.font='bold 19px monospace';ctx.fillStyle='#f03b54';
  ctx.fillText(['SWORD STORM','HELLFIRE','SKULL CRUSH'][move]??'FINISHER',400,196);
  ctx.textAlign='left';
 }
 ctx.restore();
}
