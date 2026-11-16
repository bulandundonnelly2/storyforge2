// Original, timing-led duel engine for Fatality Forge. No third-party sprites or audio.
export type Side='p'|'e';
export type Character='barbarian'|'knight'|'vampire'|'warden'|'sorcerer';
export const ROSTER:Record<Character,{name:string;special:string;fatality:string;speed:number;power:number;projectile:'sword'|'dragon'|'blood'|'thorn'|'flame'}>={
 barbarian:{name:'BARBARIAN',special:'FIRE SWORD',fatality:'DECAPITATION',speed:1.08,power:1.05,projectile:'sword'},
 knight:{name:'SKELETON KNIGHT',special:'DRAGON FIRE',fatality:'SERPENT FEAST',speed:1,power:1,projectile:'dragon'},
 vampire:{name:'VAMPIRE LORD',special:'BLOOD LANCE',fatality:'CRIMSON EMBRACE',speed:1.17,power:.93,projectile:'blood'},
 warden:{name:'FOREST WARDEN',special:'THORN STORM',fatality:'ROOT ENTOMBMENT',speed:.96,power:1.13,projectile:'thorn'},
 sorcerer:{name:'FIRE SORCERER',special:'INFERNO',fatality:'ASHES TO ASHES',speed:1.04,power:.98,projectile:'flame'}
};
export type Strike='body'|'overhead'|'low'|'thrust'|'spin'|'uppercut';
export type CombatEvent={type:'windup'|'swing'|'hit'|'block'|'parry'|'guardBreak'|'finish'|'enemyFinisher'|'lose'|'win'|'exhausted'|'finisherCharge'|'finisherSmash'|'finisherFinal'|'wolfGrowl'|'wolfBite';who:Side;strike?:Strike;damage?:number};
export type Fighter={
 x:number;vx:number;hp:number;stamina:number;face:number;character:Character;
 attack:number;attackStart:number;heavy:boolean;action:Strike|null;actionFrame:number;didConnect:boolean;
 stun:number;guard:boolean;guardLow:boolean;guardFrames:number;guardTimer:number;
 crouch:boolean;walk:number;walkClock:number;airY:number;airV:number;projectileCooldown:number;comboHits:number;comboWindow:number;aiMode:'approach'|'retreat'|'hold'|'bait'|'rush';aiTimer:number;
};
export type World={
 p:Fighter;e:Fighter;phase:'fight'|'finish'|'fatality'|'enemyFatality'|'win'|'lose';
 time:number;frame:number;fx:number;step:number;combo:number;enemyCooldown:number;finisherDone?:boolean;enemyFinisherDone?:boolean;
 freeze:number;shake:number;impactX:number;impactY:number;impactKind:'hit'|'block'|'parry'|null;
 bufferedStrike:Strike|null;bufferFrames:number;projectiles:{x:number;y:number;vx:number;who:Side;kind:'sword'|'dragon'|'blood'|'thorn'|'flame';life:number}[];difficulty:'easy'|'normal'|'hard';
};
export type Controls={direction:number;guard:boolean;crouch:boolean;jump?:boolean;cast?:boolean;strike:Strike|null};
export const ATTACKS:Record<Strike,{windup:number;active:number;recovery:number;damage:number;reach:number;cost:number;push:number;hitstop:number}>={
 body:{windup:9,active:6,recovery:17,damage:13,reach:156,cost:15,push:21,hitstop:7},
 overhead:{windup:17,active:7,recovery:25,damage:21,reach:173,cost:29,push:32,hitstop:10},
 low:{windup:12,active:7,recovery:20,damage:12,reach:153,cost:20,push:23,hitstop:8},
 thrust:{windup:8,active:5,recovery:19,damage:11,reach:198,cost:19,push:26,hitstop:7},
 spin:{windup:19,active:12,recovery:28,damage:24,reach:165,cost:38,push:38,hitstop:11},
 uppercut:{windup:13,active:6,recovery:24,damage:18,reach:143,cost:27,push:29,hitstop:10}
};
const fighter=(x:number,face:number,character:Character):Fighter=>({
 x,vx:0,hp:180,stamina:100,face,character,
 attack:0,attackStart:0,heavy:false,action:null,actionFrame:0,didConnect:false,
 stun:0,guard:false,guardLow:false,guardFrames:0,guardTimer:0,
 crouch:false,walk:-1,walkClock:0,airY:0,airV:0,projectileCooldown:0,comboHits:0,comboWindow:0,aiMode:'hold',aiTimer:50
});
export function createDuel(difficulty:'easy'|'normal'|'hard'='normal',player:Character='barbarian',opponent:Character='knight'):World{
 return {p:fighter(233,1,player),e:fighter(567,-1,opponent),phase:'fight',time:0,frame:0,fx:0,step:0,combo:0,enemyCooldown:76,
 freeze:0,shake:0,impactX:400,impactY:225,impactKind:null,finisherDone:false,enemyFinisherDone:false,bufferedStrike:null,bufferFrames:0,projectiles:[],difficulty};
}
function clamp(n:number,lo:number,hi:number){return Math.max(lo,Math.min(hi,n))}
function approach(current:number,target:number,maxChange:number){
 return current<target?Math.min(target,current+maxChange):Math.max(target,current-maxChange)
}
function initiate(f:Fighter,strike:Strike|null,who:Side,events:CombatEvent[]){
 if(!strike||f.action||f.stun>0)return false;
 const move=ATTACKS[strike];
 if(f.stamina<move.cost){if(who==='p')events.push({type:'exhausted',who});return false}
 f.stamina-=move.cost;f.action=strike;f.actionFrame=0;f.didConnect=false;
 f.attackStart=move.windup+move.active+move.recovery;
 f.attack=f.attackStart;f.heavy=strike==='overhead'||strike==='spin'||strike==='uppercut';
 f.guard=false;f.crouch=false;f.vx*=.18;
 // The quiet anticipation is distinct from the blade whoosh at actual contact.
 events.push({type:'windup',who,strike});
 return true;
}
function posture(f:Fighter,move:number,guard:boolean,crouch:boolean){
 const busy=!!f.action||f.stun>0;
 f.crouch=crouch&&!busy;
 f.guard=guard&&!busy&&f.stamina>5;
 f.guardLow=f.guard&&f.crouch;
 f.guardFrames=f.guard?f.guardFrames+1:0;
 if(f.guard){f.stamina=clamp(f.stamina-.22,0,100)}
 else f.stamina=clamp(f.stamina+(f.action?0.2:f.stun>0?0.16:Math.abs(move)>0?0.31:0.49),0,100);
 const velocityLimit=(f.guard?0.48:f.crouch?0.68:f.action?0.36:f.stun>0?0:3.05)*ROSTER[f.character].speed;
 const desired=clamp(move,-1,1)*velocityLimit;
 // Deliberate starts, firmer deceleration. Recoil stops rather than skating.
 const braking=f.stun>0?.72:f.action?.52:move===0?.56:.43;
 f.vx=approach(f.vx,desired,braking);
 if(Math.abs(f.vx)<.065)f.vx=0;
 f.x=clamp(f.x+f.vx,85,715);
 if(Math.abs(f.vx)>.42&&f.stun===0){f.walkClock+=Math.abs(f.vx);f.walk=Math.floor(f.walkClock/12)%4}
 else f.walk=-1;
}
function clash(w:World,attacker:Fighter,defender:Fighter,who:Side,events:CombatEvent[]){
 if(!attacker.action||attacker.didConnect||attacker.stun>0)return;
 const strike=attacker.action, data=ATTACKS[strike];
 if(attacker.actionFrame<data.windup||attacker.actionFrame>=data.windup+data.active)return;
 if(Math.abs(attacker.x-defender.x)>data.reach)return;
 attacker.didConnect=true;
 // A crouching duelist can duck a telegraphed overhead, but not a body or leg chop.
 if((strike==='overhead'||strike==='thrust')&&defender.crouch&&!defender.guard){events.push({type:'block',who,strike});return}
 const guarded=defender.guard&&(strike==='low'?defender.guardLow:!defender.guardLow);
 const perfect=guarded&&defender.guardFrames<=11&&defender.guardFrames>=1;
 const impulse=attacker.x<defender.x?1:-1;
 if(guarded){
    defender.stamina=clamp(defender.stamina-(perfect?8:19),0,100);
    attacker.vx=-impulse*(perfect?3.5:2.1);
    if(perfect)attacker.stun=Math.max(attacker.stun,16);
    const broken=defender.stamina<=1;
    if(broken){defender.guard=false;defender.guardLow=false;defender.stun=Math.max(defender.stun,24)}
    w.freeze=broken?11:perfect?9:7;w.shake=broken?14:perfect?11:8;
    w.impactX=(attacker.x+defender.x)/2;w.impactY=strike==='low'?270:202;
    w.impactKind=perfect?'parry':'block';w.fx=17;
    events.push({type:broken?'guardBreak':perfect?'parry':'block',who,strike});
    return;
 }
 // Counter-hits interrupt the enemy's wind-up: no attacks landing while staggered.
 const counter=!!defender.action&&!defender.didConnect;
 const chain=attacker.comboWindow>0?Math.min(4,attacker.comboHits+1):1;
 const damage=Math.round((data.damage+(counter?3:0)+(attacker.airY>12?7:0)+(chain>=4?7:chain===3?5:chain===2?2:0))*ROSTER[attacker.character].power);
 defender.hp=Math.max(0,defender.hp-damage);
 attacker.comboHits=chain;attacker.comboWindow=88;
 defender.comboHits=0;defender.comboWindow=0;
 defender.stun=Math.max(defender.stun,strike==='overhead'||strike==='spin'?32:strike==='uppercut'?29:strike==='body'?23:21);
 defender.action=null;defender.actionFrame=0;defender.didConnect=false;
 defender.attack=0;defender.attackStart=0;defender.heavy=false;
 // The body takes a short step and slows under friction instead of sliding.
 defender.vx=impulse*Math.min(data.push/7,4.5);
 defender.x=clamp(defender.x+impulse*(data.push*.18),95,705);
 attacker.vx*=.20;
 w.freeze=data.hitstop+(counter?2:0);w.shake=data.hitstop+6;
 w.impactX=defender.x-impulse*22;w.impactY=strike==='low'?272:strike==='overhead'||strike==='uppercut'?176:214;
 w.impactKind='hit';w.fx=21;
 events.push({type:'hit',who,strike,damage});
 if(defender.hp===0){
    if(who==='p'){
      w.phase='finish';w.time=0;w.step=0;
      events.push({type:'finish',who,strike});
    }else{
      // The knight receives a full cinematic finisher on a KO, not an
      // instantaneous YOU LOSE overlay. No additional input is required.
      w.phase='enemyFatality';w.fx=246;w.time=0;w.step=0;
      w.freeze=0;w.shake=0;w.impactKind=null;
      w.enemyFinisherDone=true;w.bufferedStrike=null;w.bufferFrames=0;
      events.push({type:'enemyFinisher',who,strike});
    }
 }
}
function progress(f:Fighter){
 if(f.stun>0)f.stun--;
 if(!f.action)return;
 f.actionFrame++;
 const data=ATTACKS[f.action];
 // Sound the blade only when it enters the active arc, not on key-down.
 // The event is emitted separately by the caller after this state advance.
 f.attack=Math.max(0,f.attackStart-f.actionFrame);
 if(f.actionFrame>=data.windup+data.active+data.recovery){
   f.action=null;f.actionFrame=0;f.didConnect=false;f.attack=0;f.attackStart=0;f.heavy=false;
 }
}
export function advanceDuel(w:World,controls:Controls,random:()=>number=Math.random):CombatEvent[]{
 const events:CombatEvent[]=[];
 if(w.phase==='win'||w.phase==='lose')return events;
 if(w.phase==='fatality'){
    w.frame++;w.fx=Math.max(0,w.fx-1);
    if(w.fx===0){w.phase='win';events.push({type:'win',who:'p'})}
    return events;
 }
 if(w.phase==='enemyFatality'){
    w.frame++;w.fx=Math.max(0,w.fx-1);
    if(w.fx===0){w.phase='lose';events.push({type:'lose',who:'e'})}
    return events;
 }
 if(w.phase==='finish'){
    w.frame++;w.time++;
    if(w.time>480){w.phase='win';events.push({type:'win',who:'p'})}
    return events;
 }
 // Accept taps even during impact freeze or attack recovery. One short buffer
 // prevents dropped input without making long queued auto-combos.
 if(controls.strike){w.bufferedStrike=controls.strike;w.bufferFrames=32}
 w.frame++;w.time++;
 if(w.freeze>0){w.freeze--;return events}
 if(w.fx>0)w.fx--;
 if(w.shake>0)w.shake--;
 if(w.fx===0)w.impactKind=null;
 const p=w.p,e=w.e;
 for(const f of [p,e]){
  if(f.comboWindow>0)f.comboWindow--;else f.comboHits=0;
  if(f.projectileCooldown>0)f.projectileCooldown--;
  if(f.airY>0||f.airV>0){f.airY=Math.max(0,f.airY+f.airV);f.airV-=.73;if(f.airY===0)f.airV=0}
 }
 if(controls.jump&&p.airY===0&&p.stun===0){p.airV=12.6;p.airY=1;p.crouch=false}
 if(controls.cast&&p.projectileCooldown===0&&p.stamina>=25&&p.stun===0){
  p.stamina-=25;p.projectileCooldown=115;
  w.projectiles.push({x:p.x+p.face*50,y:226-p.airY,vx:p.face*7,who:'p',kind:ROSTER[p.character].projectile,life:115});
  events.push({type:'swing',who:'p',strike:'overhead'});
 }
 progress(p);progress(e);
 for(const [side,f] of [['p',p],['e',e]] as const){
  if(f.action&&f.actionFrame===ATTACKS[f.action].windup){
   events.push({type:'swing',who:side,strike:f.action});
  }
 }
 const playerMove=controls.direction;
 posture(p,playerMove,controls.guard,controls.crouch);
 // A landed hit can chain into another distinct move near the end of recovery.
 // The previous strike must connect; missed swings retain their full recovery.
 if(w.bufferedStrike&&p.action&&p.didConnect&&p.stun===0&&
    w.bufferedStrike!==p.action&&p.actionFrame>=ATTACKS[p.action].windup+ATTACKS[p.action].active+5){
   p.action=null;p.attack=0;p.actionFrame=0;p.didConnect=false;
 }
 if(w.bufferedStrike&&!p.action&&p.stun===0){
  initiate(p,w.bufferedStrike,'p',events);
  w.bufferedStrike=null;w.bufferFrames=0;
 }else if(w.bufferFrames>0){
  w.bufferFrames--;
  if(!w.bufferFrames)w.bufferedStrike=null;
 }
 const distance=Math.abs(p.x-e.x);
 if(e.projectileCooldown===0&&e.stamina>=22&&distance>180&&random()<(w.difficulty==='easy'?.012:w.difficulty==='hard'?.043:.028)&&e.stun===0){
  e.stamina-=22;e.projectileCooldown=135;
  w.projectiles.push({x:e.x+e.face*48,y:220-e.airY,vx:e.face*5.8,who:'e',kind:ROSTER[e.character].projectile,life:135});
 }
 if(e.airY===0&&e.stun===0&&distance<180&&random()<(w.difficulty==='easy'?.002:w.difficulty==='hard'?.009:.005)){e.airY=1;e.airV=10.5}
 for(const shot of w.projectiles){
  shot.x+=shot.vx;shot.life--;
  const target=shot.who==='p'?e:p;
  if(shot.life>0&&Math.abs(shot.x-target.x)<37&&Math.abs(shot.y-(225-target.airY))<78){
   if(target.guard){target.stamina=Math.max(0,target.stamina-14);events.push({type:'block',who:shot.who})}
   else{
    const damage=Math.round((shot.kind==='dragon'?19:shot.kind==='thorn'?17:shot.kind==='blood'?18:shot.kind==='flame'?24:22)*ROSTER[shot.who==='p'?p.character:e.character].power);
    target.hp=Math.max(0,target.hp-damage);target.stun=Math.max(target.stun,17);
    target.action=null;target.attack=0;target.actionFrame=0;
    events.push({type:'hit',who:shot.who,damage});
    w.impactX=target.x;w.impactY=shot.y;w.impactKind='hit';w.fx=18;w.shake=8;
    if(target.hp===0){
     if(shot.who==='p'){w.phase='finish';w.time=0;w.step=0;events.push({type:'finish',who:'p'})}
     else{w.phase='enemyFatality';w.fx=246;w.time=0;w.step=0;w.enemyFinisherDone=true;events.push({type:'enemyFinisher',who:'e'})}
    }
   }
   shot.life=0;
  }
 }
 w.projectiles=w.projectiles.filter(q=>q.life>0&&q.x>-90&&q.x<890);
 if(w.phase!=='fight')return events;
 e.guardTimer=Math.max(0,e.guardTimer-1);
 // Reconsider a tactical stance at irregular intervals, not every frame.
 // Holding ground, backing off and baiting attacks are as important as advancing.
 if(e.aiTimer--<=0){
  const roll=random();
  // At low health the knight mixes in evasive play instead of simply rushing.
  const defensive=e.hp<65;
  e.aiMode=defensive?(roll<.34?'retreat':roll<.62?'bait':roll<.78?'hold':roll<.91?'approach':'rush'):(roll<.20?'hold':roll<.42?'retreat':roll<.65?'bait':roll<.85?'approach':'rush');
  e.aiTimer=(w.difficulty==='hard'?20:w.difficulty==='easy'?55:32)+Math.floor(random()*(w.difficulty==='hard'?65:87));
 }
 let enemyMove=0;
 const toward=p.x>e.x?1:-1;
 const incoming=!!p.action&&p.actionFrame<ATTACKS[p.action].windup+ATTACKS[p.action].active;
 if(!e.action&&e.stun===0){
  switch(e.aiMode){
   case 'hold':
    // Stand firm and punish the player's approach.
    enemyMove=distance<90?-toward:0;
    break;
   case 'retreat':
    enemyMove=distance<350?-toward:0;
    break;
   case 'bait':
    enemyMove=incoming&&distance<235?-toward:distance>240?toward:0;
    if(incoming&&distance<195&&e.guardTimer===0&&random()<.12)e.guardTimer=20;
    break;
   case 'rush':
    enemyMove=distance>116?toward:distance<80?-toward:0;
    break;
   default:
    enemyMove=distance>165?toward:distance<105?-toward:0;
  }
  // Sometimes break off an advance to evade an overhead attack.
  if(incoming&&p.action==='overhead'&&distance<195&&random()<.045)enemyMove=-toward;
  // Avoid getting pinned against arena edges forever.
  if(e.x<110&&enemyMove<0||e.x>690&&enemyMove>0){
   enemyMove=distance>175?toward:0;
   if(e.aiMode==='retreat')e.aiTimer=Math.min(e.aiTimer,18);
  }
 }
 posture(e,enemyMove,e.guardTimer>0,e.guardTimer>0&&p.action==='low');
 // On the first active sword frame, push off the planted foot.
 // The quick committed step reads as a heavy cut, not a floating swipe.
 for(const f of [p,e]){
  if(f.action&&f.actionFrame===ATTACKS[f.action].windup){
   const thrust=f.action==='thrust'?23:f.action==='spin'?13:f.action==='overhead'?15:f.action==='body'?11:9;
   f.x=clamp(f.x+f.face*thrust,85,715);
   f.vx=f.face*(f.action==='overhead'?2.2:1.7);
  }
 }
 // Unpredictable attack decisions: defend, feint, wait, or strike.
 w.enemyCooldown--;
 if(w.enemyCooldown<=0&&!e.action&&e.stun===0){
  const roll=random();
  if(incoming&&distance<200&&roll<(w.difficulty==='easy'?.17:w.difficulty==='hard'?.53:.38)){
   e.guardTimer=15+Math.floor(random()*20);
   e.guard=true;e.guardFrames=1;e.guardLow=p.action==='low';
   w.enemyCooldown=(w.difficulty==='easy'?38:w.difficulty==='hard'?13:18)+Math.floor(random()*27);
  }else if(distance<187&&e.stamina>22&&roll<.76){
   const strikeRoll=random();
   const strike:Strike=strikeRoll<.20?'low':strikeRoll<.43?'overhead':strikeRoll<.62?'body':strikeRoll<.79?'thrust':strikeRoll<.92?'uppercut':'spin';
   initiate(e,strike,'e',events);
   w.enemyCooldown=(w.difficulty==='easy'?70:w.difficulty==='hard'?22:36)+Math.floor(random()*(w.difficulty==='hard'?55:90));
   if(random()<.3){e.aiMode='retreat';e.aiTimer=35+Math.floor(random()*50)}
  }else{
   // A deliberate pause prevents an endless attack-and-walk-forward loop.
   w.enemyCooldown=(w.difficulty==='easy'?48:w.difficulty==='hard'?14:20)+Math.floor(random()*60);
   if(distance<150&&random()<.38){e.aiMode='retreat';e.aiTimer=28+Math.floor(random()*55)}
  }
 }
 if(p.x<e.x&&e.x-p.x<113){const mid=(p.x+e.x)/2;p.x=mid-56.5;e.x=mid+56.5;p.vx=Math.min(p.vx,0);e.vx=Math.max(e.vx,0)}
 if(e.x<p.x&&p.x-e.x<113){const mid=(p.x+e.x)/2;e.x=mid-56.5;p.x=mid+56.5;e.vx=Math.min(e.vx,0);p.vx=Math.max(p.vx,0)}
 p.x=clamp(p.x,85,715);e.x=clamp(e.x,85,715);
 p.face=p.x<e.x?1:-1;e.face=-p.face;
 // Only hit during active frames, never on key-down: read wind-up and punish recovery.
 clash(w,p,e,'p',events);
 if(w.phase==='fight')clash(w,e,p,'e',events);
 return events;
}
