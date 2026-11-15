// Original, timing-led duel engine for Fatality Forge. No third-party sprites or audio.
export type Side='p'|'e';
export type Strike='body'|'overhead'|'low';
export type CombatEvent={type:'windup'|'swing'|'hit'|'block'|'parry'|'guardBreak'|'finish'|'lose'|'win'|'exhausted'|'finisherCharge'|'finisherSmash'|'finisherFinal'|'wolfGrowl'|'wolfBite';who:Side;strike?:Strike;damage?:number};
export type Fighter={
 x:number;vx:number;hp:number;stamina:number;face:number;
 attack:number;attackStart:number;heavy:boolean;action:Strike|null;actionFrame:number;didConnect:boolean;
 stun:number;guard:boolean;guardLow:boolean;guardFrames:number;guardTimer:number;
 crouch:boolean;walk:number;walkClock:number;
};
export type World={
 p:Fighter;e:Fighter;phase:'fight'|'finish'|'fatality'|'win'|'lose';
 time:number;frame:number;fx:number;step:number;combo:number;enemyCooldown:number;finisherDone?:boolean;
 freeze:number;shake:number;impactX:number;impactY:number;impactKind:'hit'|'block'|'parry'|null;
 bufferedStrike:Strike|null;bufferFrames:number;
};
export type Controls={direction:number;guard:boolean;crouch:boolean;strike:Strike|null};
export const ATTACKS:Record<Strike,{windup:number;active:number;recovery:number;damage:number;reach:number;cost:number;push:number;hitstop:number}>={
 body:{windup:12,active:5,recovery:22,damage:18,reach:156,cost:17,push:21,hitstop:9},
 overhead:{windup:20,active:6,recovery:31,damage:30,reach:173,cost:33,push:32,hitstop:13},
 low:{windup:15,active:6,recovery:26,damage:17,reach:153,cost:23,push:23,hitstop:10}
};
const fighter=(x:number,face:number):Fighter=>({
 x,vx:0,hp:100,stamina:100,face,
 attack:0,attackStart:0,heavy:false,action:null,actionFrame:0,didConnect:false,
 stun:0,guard:false,guardLow:false,guardFrames:0,guardTimer:0,
 crouch:false,walk:-1,walkClock:0
});
export function createDuel():World{
 return {p:fighter(233,1),e:fighter(567,-1),phase:'fight',time:0,frame:0,fx:0,step:0,combo:0,enemyCooldown:76,
 freeze:0,shake:0,impactX:400,impactY:225,impactKind:null,finisherDone:false,bufferedStrike:null,bufferFrames:0};
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
 f.attack=f.attackStart;f.heavy=strike==='overhead';
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
 const velocityLimit=f.guard?0.37:f.crouch?0.53:f.action?0.25:f.stun>0?0:2.30;
 const desired=clamp(move,-1,1)*velocityLimit;
 // Deliberate starts, firmer deceleration. Recoil stops rather than skating.
 const braking=f.stun>0?.58:f.action?.42:move===0?.31:.24;
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
 if(strike==='overhead'&&defender.crouch&&!defender.guard){events.push({type:'block',who,strike});return}
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
 const damage=data.damage+(counter?4:0);
 defender.hp=Math.max(0,defender.hp-damage);
 defender.stun=Math.max(defender.stun,strike==='overhead'?32:strike==='body'?23:21);
 defender.action=null;defender.actionFrame=0;defender.didConnect=false;
 defender.attack=0;defender.attackStart=0;defender.heavy=false;
 // The body takes a short step and slows under friction instead of sliding.
 defender.vx=impulse*Math.min(data.push/7,4.5);
 defender.x=clamp(defender.x+impulse*(data.push*.18),95,705);
 attacker.vx*=.20;
 w.freeze=data.hitstop+(counter?2:0);w.shake=data.hitstop+6;
 w.impactX=defender.x-impulse*22;w.impactY=strike==='low'?272:strike==='overhead'?176:214;
 w.impactKind='hit';w.fx=21;
 events.push({type:'hit',who,strike,damage});
 if(defender.hp===0){
    w.phase=who==='p'?'finish':'lose';
    w.time=0;w.step=0;
    events.push({type:who==='p'?'finish':'lose',who,strike});
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
 if(w.phase==='finish'){
    w.frame++;w.time++;
    if(w.time>480){w.phase='win';events.push({type:'win',who:'p'})}
    return events;
 }
 // Accept taps even during impact freeze or attack recovery. One short buffer
 // prevents dropped input without making long queued auto-combos.
 if(controls.strike){w.bufferedStrike=controls.strike;w.bufferFrames=22}
 w.frame++;w.time++;
 if(w.freeze>0){w.freeze--;return events}
 if(w.fx>0)w.fx--;
 if(w.shake>0)w.shake--;
 if(w.fx===0)w.impactKind=null;
 const p=w.p,e=w.e;
 progress(p);progress(e);
 for(const [side,f] of [['p',p],['e',e]] as const){
  if(f.action&&f.actionFrame===ATTACKS[f.action].windup){
   events.push({type:'swing',who:side,strike:f.action});
  }
 }
 const playerMove=controls.direction;
 posture(p,playerMove,controls.guard,controls.crouch);
 if(w.bufferedStrike&&!p.action&&p.stun===0){
  initiate(p,w.bufferedStrike,'p',events);
  w.bufferedStrike=null;w.bufferFrames=0;
 }else if(w.bufferFrames>0){
  w.bufferFrames--;
  if(!w.bufferFrames)w.bufferedStrike=null;
 }
 const distance=Math.abs(p.x-e.x);
 e.guardTimer=Math.max(0,e.guardTimer-1);
 // Opponent walks deliberately into sword range rather than teleporting to the player.
 let enemyMove=0;
 if(!e.action&&e.stun===0){
    if(distance>151)enemyMove=p.x>e.x?1:-1;
    else if(distance<106)enemyMove=p.x>e.x?-1:1;
 }
 posture(e,enemyMove,e.guardTimer>0,e.guardTimer>0&&p.action==='low');
 // On the first active sword frame, push off the planted foot.
 // The quick committed step reads as a heavy cut, not a floating swipe.
 for(const f of [p,e]){
  if(f.action&&f.actionFrame===ATTACKS[f.action].windup){
   const thrust=f.action==='overhead'?15:f.action==='body'?11:9;
   f.x=clamp(f.x+f.face*thrust,85,715);
   f.vx=f.face*(f.action==='overhead'?2.2:1.7);
  }
 }
 // AI looks for counter opportunities and telegraphs committed attacks.
 w.enemyCooldown--;
 if(w.enemyCooldown<=0&&!e.action&&e.stun===0){
    if(p.action&&p.actionFrame<ATTACKS[p.action].windup&&random()<.27){
       e.guardTimer=22;e.guard=true;e.guardFrames=1;
       e.guardLow=p.action==='low';
       w.enemyCooldown=43+Math.floor(random()*27);
    }else if(distance<187&&e.stamina>22){
       const roll=random();
       const strike:Strike=roll<.22?'low':roll<.53?'overhead':'body';
       initiate(e,strike,'e',events);
       w.enemyCooldown=61+Math.floor(random()*32);
    }else{
       w.enemyCooldown=21+Math.floor(random()*18);
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
