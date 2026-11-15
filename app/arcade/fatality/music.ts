// Original ZX Spectrum 128-inspired three-channel battle music.
// Composed for Fatality Forge. No melodies or recordings from existing games.
export type SpectrumMusic={start:()=>void;stop:()=>void;dispose:()=>void;isPlaying:()=>boolean};

// Each bar has eight eighth-note steps. E Phrygian gives the theme its
// distinctive medieval semitone tension without borrowing a game soundtrack.
const leadBars=[
 'E5 - G5 E5 F5 E5 D5 -',
 'B4 D5 E5 - G5 F5 E5 -',
 'C5 - E5 G5 F5 E5 C5 -',
 'D5 F5 A5 - G5 F5 E5 -',
 'E5 - G5 A5 B5 A5 G5 -',
 'E5 F5 G5 - E5 D5 C5 -',
 'B4 - D5 F5 E5 D5 B4 -',
 'A4 B4 C5 D5 E5 - D5 -',
 'E5 E5 G5 - E5 F5 G5 -',
 'A5 G5 F5 E5 D5 - B4 -',
 'C5 D5 E5 G5 A5 - G5 -',
 'F5 E5 D5 C5 B4 - D5 -',
 'E5 G5 B5 - A5 G5 F5 -',
 'E5 D5 C5 - B4 C5 D5 -',
 'F5 - E5 D5 C5 B4 A4 -',
 'B4 D5 F5 E5 - E5 - -'
];
const melody=leadBars.flatMap(bar=>bar.split(' '));
const roots=['E2','E2','C3','D3','E2','C3','B2','D3','E2','G2','C3','B2','E2','D3','C3','E2'];
const modes=['min','min','maj','min','min','maj','dim','min','min','maj','maj','dim','min','min','maj','min'] as const;
const LENGTH=leadBars.length*8;
const BEAT=60/116/2;
const semitone:Record<string,number>={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function midi(n:string):number|null {
 if(n==='-')return null;
 const match=/^([A-G])([#b]?)([0-8])$/.exec(n);
 if(!match)return null;
 return (Number(match[3])+1)*12+semitone[match[1]]+(match[2]==='#'?1:match[2]==='b'?-1:0);
}
function hz(note:number){return 440*Math.pow(2,(note-69)/12)}
function makeNoiseBuffer(ctx:AudioContext):AudioBuffer{
 const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.15),ctx.sampleRate);
 const data=buffer.getChannelData(0);let state=302661;
 for(let i=0;i<data.length;i++){state=(state*1664525+1013904223)>>>0;data[i]=state/2147483648-1}
 return buffer;
}
export function makeSpectrumMusic():SpectrumMusic {
 const ctx=new window.AudioContext();
 const master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
 const noise=makeNoiseBuffer(ctx);
 let playing=false,step=0,nextTime=0;
 let clock:ReturnType<typeof setInterval>|null=null;

 function tone(note:number,start:number,duration:number,volume:number){
  const osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type='square';osc.frequency.setValueAtTime(hz(note),start);
  const t=Math.max(.055,duration);
  gain.gain.setValueAtTime(.0001,start);
  gain.gain.linearRampToValueAtTime(volume,start+.005);
  gain.gain.setValueAtTime(volume*.76,start+Math.min(.06,t*.42));
  gain.gain.exponentialRampToValueAtTime(.0001,start+t);
  osc.connect(gain);gain.connect(master);
  osc.start(start);osc.stop(start+t+.008);
 }
 function percussion(start:number,character:'kick'|'snare'|'hat'){
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),amp=ctx.createGain();
  source.buffer=noise;
  filter.type=character==='kick'?'lowpass':'highpass';
  filter.frequency.setValueAtTime(character==='kick'?210:character==='snare'?1250:3500,start);
  const duration=character==='kick'?.105:character==='snare'?.075:.025;
  const peak=character==='kick'?.13:character==='snare'?.075:.037;
  amp.gain.setValueAtTime(peak,start);
  amp.gain.exponentialRampToValueAtTime(.0001,start+duration);
  source.connect(filter);filter.connect(amp);amp.connect(master);
  source.start(start);source.stop(start+duration);
 }
 function noteAt(index:number,time:number){
  const bar=Math.floor(index/8),part=index%8,root=midi(roots[bar])??40;
  const lead=midi(melody[index]);
  // The three AY-like tone voices: melody, bass, and arpeggiated response.
  if(lead!==null)tone(lead,time,BEAT*(part===7?.84:.70),.155);
  if(part===0||part===3||part===4||part===6){
   const offset=part===3?7:part===6?12:0;
   tone(root+offset,time,BEAT*(part===0?1.7:.76),.19);
  }
  if(part===1||part===3||part===5||part===7){
   const triad=modes[bar]==='maj'?[0,4,7,12]:modes[bar]==='dim'?[0,3,6,12]:[0,3,7,12];
   const chordIndex=part===1?0:part===3?2:part===5?1:3;
   tone(root+12+triad[chordIndex],time,BEAT*.43,.067);
  }
  // A single chip-like noise voice supplies the martial beat.
  if(part===0||part===4)percussion(time,'kick');
  else if(part===2||part===6)percussion(time,'snare');
  else percussion(time,'hat');
 }
 function schedule(){
  if(!playing||ctx.state==='closed')return;
  if(nextTime<ctx.currentTime-.12)nextTime=ctx.currentTime+.03;
  while(nextTime<ctx.currentTime+.23){
   noteAt(step,nextTime);
   step=(step+1)%LENGTH;
   nextTime+=BEAT;
  }
 }
 return {
  start:()=>{
   if(playing||ctx.state==='closed')return;
   playing=true;step=0;nextTime=ctx.currentTime+.055;
   master.gain.cancelScheduledValues(ctx.currentTime);
   master.gain.setTargetAtTime(.24,ctx.currentTime,.045);
   void ctx.resume().then(schedule).catch(()=>{});
   schedule();
   clock=setInterval(schedule,45);
  },
  stop:()=>{
   if(!playing)return;
   playing=false;
   if(clock!==null){clearInterval(clock);clock=null}
   if(ctx.state!=='closed'){
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0,ctx.currentTime,.035);
   }
  },
  dispose:()=>{
   if(clock!==null){clearInterval(clock);clock=null}
   playing=false;
   if(ctx.state!=='closed')void ctx.close().catch(()=>{});
  },
  isPlaying:()=>playing
 };
}
