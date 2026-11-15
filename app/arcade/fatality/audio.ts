import type {CombatEvent} from './combat';
export type DuelAudio={play:(event:CombatEvent)=>void;dispose:()=>void};
export function makeDuelAudio():DuelAudio{
 const Ctx=window.AudioContext;
 if(!Ctx)return {play:()=>{},dispose:()=>{}};
 const context=new Ctx();
 const output=context.createGain();output.gain.value=.38;output.connect(context.destination);
 const noise=context.createBuffer(1,Math.floor(context.sampleRate*.6),context.sampleRate);
 let last=0,seed=4815;
 const data=noise.getChannelData(0);
 for(let i=0;i<data.length;i++){seed=(1664525*seed+1013904223)>>>0;last=(last+.10*((seed/4294967296)*2-1))/1.10;data[i]=last*3}
 const tone=(frequency:number,seconds:number,volume:number,shape:OscillatorType='triangle',fall=1)=>{
    if(context.state==='closed')return;
    const now=context.currentTime,osc=context.createOscillator(),gain=context.createGain();
    osc.type=shape;osc.frequency.setValueAtTime(frequency,now);osc.frequency.exponentialRampToValueAtTime(Math.max(15,frequency*fall),now+seconds);
    gain.gain.setValueAtTime(Math.max(.0001,volume),now);gain.gain.exponentialRampToValueAtTime(.0001,now+seconds);
    osc.connect(gain);gain.connect(output);osc.start(now);osc.stop(now+seconds+.01);
 };
 const rasp=(seconds:number,volume:number,high:number)=>{
    if(context.state==='closed')return;
    const now=context.currentTime,source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
    source.buffer=noise;filter.type='bandpass';filter.frequency.value=high;filter.Q.value=.8;
    gain.gain.setValueAtTime(volume,now);gain.gain.exponentialRampToValueAtTime(.0001,now+seconds);
    source.connect(filter);filter.connect(gain);gain.connect(output);
    source.start(now);source.stop(now+seconds);
 };
 return {
  play:(e)=>{
    if(context.state==='suspended')context.resume().catch(()=>{});
    switch(e.type){
     case 'swing':rasp(e.strike==='overhead'?.24:.14,.12,e.strike==='low'?440:800);tone(e.strike==='overhead'?100:160,.14,.04,'sawtooth',.44);break;
     case 'hit':tone(59,.20,.30,'sine',.34);tone(92,.16,.18,'triangle',.40);rasp(.16,.27,350);break;
     case 'block':tone(280,.19,.13,'square',.7);rasp(.10,.16,2000);break;
     case 'parry':tone(430,.28,.16,'triangle',1.8);tone(640,.34,.08,'sine',.68);rasp(.09,.23,3700);break;
     case 'finish':tone(48,1.1,.24,'sawtooth',.4);tone(84,.85,.10,'sine',.55);rasp(.42,.16,210);break;
     case 'finisherCharge':tone(115,.52,.19,'sawtooth',.58);tone(58,.62,.17,'sine',.7);rasp(.3,.11,1500);break;
     case 'finisherSmash':tone(47,.62,.35,'sine',.23);tone(80,.27,.24,'sawtooth',.34);rasp(.31,.30,370);break;
     case 'finisherFinal':tone(49,1.1,.24,'sawtooth',.3);tone(73,.94,.18,'sine',.38);rasp(.48,.28,700);break;
     case 'wolfGrowl':tone(82,.85,.17,'sawtooth',.44);tone(52,.94,.17,'triangle',.58);rasp(.73,.15,165);break;
     case 'wolfBite':tone(67,.22,.26,'sawtooth',.32);rasp(.26,.34,330);tone(105,.14,.12,'triangle',.48);break;
     case 'exhausted':tone(120,.11,.04,'triangle',.7);break;
     case 'lose':tone(63,.68,.25,'sawtooth',.4);break;
     case 'win':tone(83,.33,.14,'sawtooth',.7);break;
    }
  },
  dispose:()=>{if(context.state!=='closed')context.close().catch(()=>{})}
 };
}
