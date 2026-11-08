// Original procedural cosmic-horror ambience for The Crimson Litany.
// Low sub-bass, unstable ritual drones, filtered void noise and distant hull pulses.
// No borrowed melodies or samples. Audio starts only after user interaction.
window.createCrimsonSoundscape=function(){
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx)return {stop(){}};
  const ctx=new AudioCtx();
  const master=ctx.createGain();master.gain.value=0.26;
  const compressor=ctx.createDynamicsCompressor();
  compressor.threshold.value=-20;compressor.knee.value=16;
  compressor.ratio.value=3;compressor.attack.value=0.01;compressor.release.value=0.4;
  master.connect(compressor);compressor.connect(ctx.destination);
  const nodes=[],sources=[],timers=[];
  const connect=(source,target)=>{source.connect(target);return source};
  const osc=(type,freq,volume,filterFreq,pan=0)=>{
    const o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
    const p=ctx.createStereoPanner();
    o.type=type;o.frequency.value=freq;f.type="lowpass";f.frequency.value=filterFreq;f.Q.value=1.8;
    g.gain.value=volume;p.pan.value=pan;
    o.connect(f);f.connect(g);g.connect(p);p.connect(master);
    o.start();sources.push(o);nodes.push(g,f,p);return {o,g,f,p};
  };
  // Dissonant very low tones, not a tune: faraway reactor hum.
  const low=osc("sawtooth",43.65,0.15,94,-0.28);
  const shadow=osc("triangle",46.25,0.11,90,0.26);
  const sub=osc("sine",32.7,0.23,70);
  const choir=osc("sawtooth",116.54,0.022,260,0.3);
  const ghost=osc("sine",123.47,0.036,360,-0.35);
  const breathe=ctx.createOscillator();breathe.type="sine";breathe.frequency.value=0.055;
  const breathDepth=ctx.createGain();breathDepth.gain.value=0.075;
  breathe.connect(breathDepth);breathDepth.connect(low.g.gain);breathe.start();sources.push(breathe);
  const pitchLfo=ctx.createOscillator();pitchLfo.type="sine";pitchLfo.frequency.value=0.083;
  const pitchDepth=ctx.createGain();pitchDepth.gain.value=1.2;
  pitchLfo.connect(pitchDepth);pitchDepth.connect(choir.o.frequency);pitchLfo.start();sources.push(pitchLfo);
  // Filtered analog-style noise suggests interstellar wind and distant static.
  const len=ctx.sampleRate*3,buffer=ctx.createBuffer(1,len,ctx.sampleRate),data=buffer.getChannelData(0);
  let last=0;for(let i=0;i<len;i++){last=(last+0.021*(Math.random()*2-1))/1.021;data[i]=last*3;}
  const wind=ctx.createBufferSource();wind.buffer=buffer;wind.loop=true;
  const windBand=ctx.createBiquadFilter();windBand.type="bandpass";windBand.frequency.value=160;windBand.Q.value=0.7;
  const windGain=ctx.createGain();windGain.gain.value=0.09;
  wind.connect(windBand);windBand.connect(windGain);windGain.connect(master);
  wind.start();sources.push(wind);nodes.push(windBand,windGain);
  const windLfo=ctx.createOscillator();windLfo.frequency.value=0.033;
  const windDepth=ctx.createGain();windDepth.gain.value=100;
  windLfo.connect(windDepth);windDepth.connect(windBand.frequency);
  windLfo.start();sources.push(windLfo);
  const pulse=()=>{
    if(ctx.state==="closed")return;
    const now=ctx.currentTime;
    // A distant, heavy metal hull strike, with a long fall into silence.
    const o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();
    o.type="sine";o.frequency.setValueAtTime(72,now);
    o.frequency.exponentialRampToValueAtTime(31,now+1.15);
    f.type="lowpass";f.frequency.value=170;
    g.gain.setValueAtTime(0.0001,now);
    g.gain.exponentialRampToValueAtTime(0.23,now+0.055);
    g.gain.exponentialRampToValueAtTime(0.0001,now+2.7);
    o.connect(f);f.connect(g);g.connect(master);
    o.start(now);o.stop(now+2.8);
    // Occasional distant metallic screech without a rhythmic melody.
    if(Math.random()>0.55){
      const distant=ctx.createOscillator(),dg=ctx.createGain(),df=ctx.createBiquadFilter();
      distant.type="sawtooth";
      distant.frequency.setValueAtTime(184,now+0.3);
      distant.frequency.exponentialRampToValueAtTime(132,now+2.8);
      df.type="bandpass";df.frequency.value=480;df.Q.value=1.3;
      dg.gain.setValueAtTime(0.0001,now+0.3);
      dg.gain.exponentialRampToValueAtTime(0.012,now+1.3);
      dg.gain.exponentialRampToValueAtTime(0.0001,now+3.7);
      distant.connect(df);df.connect(dg);dg.connect(master);
      distant.start(now+0.3);distant.stop(now+3.8);
    }
  };
  const interval=window.setInterval(pulse,6100);
  timers.push(interval);
  pulse();
  if(ctx.state==="suspended")ctx.resume().catch(()=>{});
  let stopped=false;
  return {stop(){
    if(stopped)return;stopped=true;
    timers.forEach(id=>window.clearInterval(id));
    const at=ctx.currentTime;
    master.gain.cancelScheduledValues(at);
    master.gain.setValueAtTime(master.gain.value,at);
    master.gain.linearRampToValueAtTime(0,at+0.16);
    window.setTimeout(()=>{sources.forEach(src=>{try{src.stop()}catch{}});ctx.close().catch(()=>{})},190);
  }};
};
