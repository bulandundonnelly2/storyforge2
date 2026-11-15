// Original, timing-led duel engine for Fatality Forge. No third-party sprites or audio.
export type Side='p'|'e';
export type Strike='body'|'overhead'|'low';
export type CombatEvent={type:'swing'|'hit'|'block'|'parry'|'finish'|'lose'|'win'|'exhausted'|'finisherCharge'|'finisherSmash'|'finisherFinal';who:Side;strike?:Strike;damage?:number};
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
};
export type Controls={direction:number;guard:boolean;crouch:boolean;strike:Strike|null};
export const ATTACKS:Record<Strike,{windup:number;active:number;recovery:number;damage:number;reach:number;cost:number;push:number;hitstop:number}>={
 body:{windup:9,active:6,recovery:20,damage:17,reach:156,cost:15,push:17,hitstop:6},
 overhead:{windup:17,active:7,recovery:29,damage:29,reach:173,cost:31,push:28,hitstop:10},
 low:{windup:12,active:7,recovery:24,damage:15,reach:153,cost:21,push:17,hitstop:7}
};
const fighter=(x:number,face:number):Fighter=>({
 x,vx:0,hp:100,stamina:100,face,
 attack:0,attackStart:0,heavy:false,action:null,actionFrame:0,didConnect:false,
 stun:0,guard:false,guardLow:false,guardFrames:0,guardTimer:0,
 crouch:false,walk:-1,walkClock:0
});
export function createDuel():World{
 return {p:fighter(233,1),e:fighter(567,-1),phase:'fight',time:0,frame:0,fx:0,step:0,combo:0,enemyCooldown:76,
 freeze:0,shake:0,impactX:400,impactY:225,impactKind:null,finisherDone:false};
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
 f.guard=false;f.crouch=false;f.vx*=.32;
 events.push({type:'swing',who,strike});
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
 const velocityLimit=f.guard?0.52:f.crouch?0.62:f.action?0.48:f.stun>0?0:2.65;
 const desired=clamp(move,-1,1)*velocityLimit;
 f.vx=approach(f.vx,desired,f.action?0.26:.32);
 if(Math.abs(f.vx)<.065)f.vx=0;
 f.x=clamp(f.x+f.vx,85,715);
 if(Math.abs(f.vx)>.42&&f.stun===0){f.walkClock+=Math.abs(f.vx);f.walk=Math.floor(f.walkClock/12)%4}
 else f.walk=-1;
}
function clash(w:World,attacker:Fighter,defender:Fighter,who:Side,events:CombatEvent[]){
 if(!attacker.action||attacker.didConnect)return;
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
    defender.stamina=clamp(defender.stamina-(perfect?7:13),0,100);
    attacker.vx-=impulse*(perfect?3.7:1.8);
    if(perfect)attacker.stun=Math.max(attacker.stun,9);
    w.freeze=perfect?7:5;w.shake=perfect?6:4;
    w.impactX=(attacker.x+defender.x)/2;w.impactY=strike==='low'?270:202;
    w.impactKind=perfect?'parry':'block';w.fx=13;
    events.push({type:perfect?'parry':'block',who,strike});
    return;
 }
 const damage=data.damage;
 defender.hp=Math.max(0,defender.hp-damage);
 defender.stun=Math.max(defender.stun,strike==='overhead'?27:18);
 defender.vx=impulse*data.push/4;
 defender.x=clamp(defender.x+impulse*data.push,95,705);
 w.freeze=data.hitstop;w.shake=data.hitstop+3;
 w.impactX=defender.x-impulse*22;w.impactY=strike==='low'?272:strike==='overhead'?176:214;
 w.impactKind='hit';w.fx=18;
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
 w.frame++;w.time++;
 if(w.freeze>0){w.freeze--;return events}
 if(w.fx>0)w.fx--;
 if(w.shake>0)w.shake--;
 if(w.fx===0)w.impactKind=null;
 const p=w.p,e=w.e;
 progress(p);progress(e);
 const playerMove=controls.direction;
 posture(p,playerMove,controls.guard,controls.crouch);
 initiate(p,controls.strike,'p',events);
 const distance=Math.abs(p.x-e.x);
 e.guardTimer=Math.max(0,e.guardTimer-1);
 // Opponent walks deliberately into sword range rather than teleporting to the player.
 let enemyMove=0;
 if(!e.action&&e.stun===0){
    if(distance>151)enemyMove=p.x>e.x?1:-1;
    else if(distance<106)enemyMove=p.x>e.x?-1:1;
 }
 posture(e,enemyMove,e.guardTimer>0,e.guardTimer>0&&p.action==='low');
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
