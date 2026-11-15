// Original hand-built, high-detail dark-fantasy wolf for Fatality Forge.
// Uses only bone white, true black and sharp red accents, with fine 2px dithering.
// An original animal illustration, not pixel-scraped from any existing game.
type Motion='run'|'pounce'|'feed'|'snarl';
const WHITE='#f3efe7',BLACK='#08070a',RED='#ec2343';
const U=2;
function pixel(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,c:string){
 ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));
}
function polygon(ctx:CanvasRenderingContext2D,pts:number[],c:string){
 // Every edge snaps to a 2px raster; never antialiased vector fills.
 const ys=pts.filter((_,i)=>i%2===1);
 const min=Math.floor(Math.min(...ys)/U)*U;
 const max=Math.ceil(Math.max(...ys)/U)*U;
 for(let y=min;y<=max;y+=U){
  const intersections:number[]=[],sample=y+U*.5;
  for(let i=0;i<pts.length;i+=2){
   const j=(i+2)%pts.length;
   const x1=pts[i],y1=pts[i+1],x2=pts[j],y2=pts[j+1];
   if((y1<=sample&&sample<y2)||(y2<=sample&&sample<y1))
    intersections.push(x1+(sample-y1)*(x2-x1)/(y2-y1));
  }
  intersections.sort((a,b)=>a-b);
  for(let i=0;i+1<intersections.length;i+=2){
   const a=Math.floor(intersections[i]/U)*U,b=Math.ceil(intersections[i+1]/U)*U;
   if(b>a)pixel(ctx,a,y,b-a,U,c);
  }
 }
}
function inside(pts:number[],x:number,y:number){
 let yes=false;
 for(let i=0,j=pts.length-2;i<pts.length;j=i,i+=2){
  const xi=pts[i],yi=pts[i+1],xj=pts[j],yj=pts[j+1];
  if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))yes=!yes;
 }
 return yes;
}
function clippedDither(ctx:CanvasRenderingContext2D,region:number[],contrast:string,seed:number,step=4){
 const xs=region.filter((_,i)=>i%2===0),ys=region.filter((_,i)=>i%2===1);
 const minX=Math.floor(Math.min(...xs)/step)*step,maxX=Math.ceil(Math.max(...xs)/step)*step;
 const minY=Math.floor(Math.min(...ys)/step)*step,maxY=Math.ceil(Math.max(...ys)/step)*step;
 for(let y=minY;y<=maxY;y+=step)for(let x=minX;x<=maxX;x+=step){
  if(!inside(region,x+1,y+1))continue;
  const n=Math.abs(Math.floor((x*41+y*29+seed*73)/step));
  if(n%11===1||n%11===3||n%13===7){
   pixel(ctx,x,y,(n%7===0?4:2),n%5===0?4:2,contrast);
  }
 }
}
const BODY=[-100,-78,-92,-95,-89,-102,-81,-104,-74,-115,-60,-115,-51,-122,-44,-117,-21,-121,2,-115,21,-124,32,-140,38,-132,49,-145,59,-133,79,-140,92,-125,101,-110,92,-84,79,-64,59,-54,32,-60,11,-48,-14,-42,-42,-50,-56,-41,-75,-51,-87,-58,-106,-66];
const SADDLE=[-87,-86,-79,-102,-61,-108,-44,-111,-21,-112,1,-104,22,-111,38,-130,50,-129,68,-126,80,-113,70,-98,54,-91,35,-97,15,-90,-7,-87,-22,-78,-45,-81,-64,-70,-89,-72];
export function drawDetailedDireWolf(ctx:CanvasRenderingContext2D,x:number,feet:number,direction:number,age:number,motion:Motion){
 const step=Math.floor(age/7)%4;
 const running=motion==='run',airborne=motion==='pounce',feeding=motion==='feed';
 const stride=running?[0,11,1,-9][step]:airborne?17:0;
 const hindOffset=running?[-8,5,11,-4][step]:airborne?-9:0;
 const jawOpen=airborne||motion==='snarl'||feeding&&Math.floor((age-121)/9)%2===0;
 const headTilt=feeding?.54+Math.sin((age-120)*.40)*.12:motion==='snarl'?.03:0;
 ctx.save();
 // Deliberately leaner, taller and more lupine than the old chunky toy-like wolf.
 ctx.translate(Math.round(x/U)*U,Math.round(feet/U)*U);
 ctx.scale(direction*.88,.91);
 // Tail behind the body, long with individual jagged hair.
 polygon(ctx,[-79,-81,-108,-105,-119,-119,-123,-111,-131,-116,-124,-100,-140,-102,-118,-86,-129,-84,-103,-66,-85,-67],WHITE);
 polygon(ctx,[-85,-81,-118,-106,-121,-98,-110,-88,-114,-81,-102,-77,-96,-71,-81,-72],BLACK);
 for(let i=0;i<8;i++){
  const xx=-123+i*5,yy=-99+i*3;
  pixel(ctx,xx,yy,3,2,WHITE);
 }
 // Rear/far legs have distinct knee, hock, paw and claw contours.
 polygon(ctx,[-82,-68,-96+hindOffset,-56,-89+hindOffset,-36,-93,-21,-108,-9,-112,-4,-77,-4,-77,-10,-82,-17,-71,-30,-65,-57],WHITE);
 polygon(ctx,[-86,-67,-91+hindOffset,-53,-82+hindOffset,-34,-91,-18,-106,-6,-91,-7,-79,-21,-75,-46],BLACK);
 polygon(ctx,[21,-78,39,-70,49,-42,47,-29,55+stride*.4,-13,46+stride,-6,25+stride*.4,-6,32,-15,29,-39,18,-53],WHITE);
 polygon(ctx,[22,-70,36,-61,39,-42,34,-21,46+stride*.4,-10,37+stride*.4,-9,25,-17,28,-42],BLACK);
 // Main body is anatomically narrower, with a raised mane and muscular back.
 polygon(ctx,BODY,WHITE);
 polygon(ctx,SADDLE,BLACK);
 // Thousands of fine readable B&W elements at native pixel scale: no grey fills.
 clippedDither(ctx,SADDLE,WHITE,13,3);
 for(let i=0;i<13;i++){
  const x=-69+i*11,y=-98+(i%4)*4;
  if(inside(SADDLE,x,y))polygon(ctx,[x,y,x+7,y-3,x+2,y+1],WHITE);
 }
 // Scalloped back fur, but short enough to remain a believable animal silhouette.
 for(let i=0;i<12;i++){
  const xx=-78+i*11,yy=-77+Math.round(Math.sin(i*1.4)*7);
  polygon(ctx,[xx-3,yy-6,xx+7,yy-2,xx+1,yy+11],BLACK);
 }
 const FLANK=[-87,-71,-68,-81,-47,-66,-17,-79,7,-76,25,-88,44,-62,21,-45,-6,-43,-44,-47,-66,-48];
 clippedDither(ctx,FLANK,BLACK,9,5);
 // Individually tapering mane hairs rather than oversized flat triangular teeth.
 polygon(ctx,[28,-114,37,-134,43,-116,50,-140,57,-117,63,-139,71,-118,74,-127,81,-108,70,-91,63,-73,54,-78,48,-61,39,-72,31,-66,25,-83,15,-75,18,-96],WHITE);
 for(let j=0;j<10;j++){
  const tx=26+j*6, yy=-107+(j%3)*10;
  polygon(ctx,[tx,yy-13,tx+5,yy-3,tx+1,yy+14,tx-4,yy+3],BLACK);
  pixel(ctx,tx-2,yy+6,2,6,WHITE);
 }
 // Near hind haunch, angled hock and visible individual toes.
 polygon(ctx,[-78,-75,-57,-73,-43,-55,-58,-38,-60,-20,-73,-15,-77,-6,-69,0,-101,0,-104,-7,-87,-17,-81,-36,-95,-57],WHITE);
 polygon(ctx,[-75,-70,-57,-66,-52,-57,-66,-40,-68,-23,-89,-7,-97,-5,-79,-24,-73,-42,-84,-58],BLACK);
 for(let i=0;i<11;i++){
  const xx=-91+(i*7)%38,yy=-54+(i*13)%27;
  pixel(ctx,xx,yy,2,4,i%4===0?WHITE:BLACK);
 }
 // Front legs: distinct forearms, raised joints, paws, and long white claws.
 const stretch=airborne?15:running?stride:0;
 polygon(ctx,[37,-84,61,-78,69,-56,58,-42,70,-31,71+stretch*.45,-14,82+stretch,-6,89+stretch,-1,88+stretch,1,51,1,47,-7,57,-19,51,-32,44,-44,32,-58],WHITE);
 polygon(ctx,[39,-82,56,-72,60,-52,52,-42,62,-25,61,-13,55,-7,51,-18,45,-32,44,-52,34,-61],BLACK);
 polygon(ctx,[21,-78,39,-70,49,-42,47,-29,55+stretch*.55,-13,46+stretch,-6,25+stretch*.4,-6,32,-15,29,-39,18,-53],WHITE);
 polygon(ctx,[22,-70,36,-61,39,-42,34,-21,46+stretch*.55,-10,37+stretch*.45,-9,25,-17,28,-42],BLACK);
 for(const xx of [-108,-99,-89,-80,54,64,74,84]){
  pixel(ctx,xx+(xx>0?stretch:0),-3,5,3,WHITE);
  pixel(ctx,xx+(xx>0?stretch:0)+2,0,2,2,BLACK);
 }
 // Short white tufts around shoulder; dark linework gives fur volume.
 for(let j=0;j<11;j++){
  const xx=34+j*4,yy=-83+(j%4)*6;
  polygon(ctx,[xx,yy-11,xx+5,yy-3,xx-1,yy+12],j%3===0?BLACK:WHITE);
 }
 // Articulated head rotates around the neck only, instead of swaying the entire wolf.
 ctx.save();ctx.translate(47,-84);ctx.rotate(headTilt);ctx.translate(-47,84);
 // Angular ear bones with sharply defined inner tufts.
 polygon(ctx,[55,-121,58,-156,70,-137,81,-146,91,-132,91,-110,103,-103,121,-103,139,-91,138,-82,118,-77,107,-65,80,-70,60,-84,43,-101],WHITE);
 polygon(ctx,[61,-124,63,-144,70,-132,83,-136,90,-126,92,-109,111,-104,132,-91,129,-85,109,-87,99,-80,83,-78,64,-92,52,-103],BLACK);
 polygon(ctx,[62,-139,66,-150,72,-136,72,-121],WHITE);
 polygon(ctx,[83,-134,88,-143,93,-124,91,-113],WHITE);
 polygon(ctx,[55,-113,66,-116,72,-107,83,-109,77,-96,71,-91,69,-77,58,-89,48,-92],WHITE);
 polygon(ctx,[63,-108,70,-107,68,-95,61,-94,55,-103],BLACK);
 // Muzzle: small intense eye, tapered muzzle bridge and distinct black nose.
 polygon(ctx,[88,-107,106,-107,115,-104,129,-99,140,-91,135,-86,119,-85,103,-91,91,-93],WHITE);
 polygon(ctx,[93,-106,110,-104,128,-96,137,-91,126,-89,111,-93,94,-95],BLACK);
 polygon(ctx,[78,-117,96,-117,99,-111,82,-110],WHITE);
 pixel(ctx,88,-113,6,5,RED);pixel(ctx,90,-111,2,2,BLACK);
 pixel(ctx,134,-92,9,6,BLACK);pixel(ctx,135,-93,5,2,WHITE);
 // Bite action: hinge the lower jaw under the muzzle, showing teeth.
 const drop=jawOpen?12:1;
 polygon(ctx,[93,-92,108,-88,137,-84,126,-73+drop,102,-73+drop,90,-80+drop],WHITE);
 polygon(ctx,[96,-89,111,-86,134,-83,128,-79+drop,110,-80+drop,98,-83],BLACK);
 for(const tx of [109,116,123,131]){
  pixel(ctx,tx,-85,2,5,WHITE);
  pixel(ctx,tx+1,-80+drop,2,4,WHITE);
 }
 ctx.restore();
 // Small blood-red cut on shoulder; red is reserved for bite and eyes.
 polygon(ctx,[47,-106,49,-103,43,-84,39,-87],RED);
 ctx.restore();
}
