"use client";
import {useState} from "react";
type Choice={label:string;to:string;dc?:number};
type Scene={title:string;text:string;choices?:Choice[]};
const story:Record<string,Scene>={
start:{title:"I · THE THIRTEENTH BELL",text:"The cathedral-dreadnought NOCTIS VOTUM drifts above a dead moon. Thirteen bells ring. Your brothers stand frozen in their armour. A broken vox whispers: DO NOT LET THE CHOIR SING.",choices:[{label:"Break open the bone reliquary",to:"relic",dc:4},{label:"Descend toward the forbidden choir",to:"choir"},{label:"Search the armoury",to:"armoury",dc:3}]},
relic:{title:"II · THE BONE ENGINE",text:"Inside a coffin of iron ribs lies a blade of crackling red light. It speaks your name. Something beneath the chapel begins to wake.",choices:[{label:"Claim the cursed blade",to:"blade",dc:3},{label:"Smash the relic and escape",to:"choir",dc:5}]},
armoury:{title:"II · THE EMPTY ARMOURY",text:"A chainaxe hangs from ammunition belts. Across the wall is carved: THE BLACK SUN MUST REMAIN BOUND.",choices:[{label:"Take the chainaxe and charge",to:"altar",dc:5},{label:"Find the reactor controls",to:"reactor",dc:3}]},
blade:{title:"III · THE RED BLADE",text:"The blade tears free. Its crimson lightning reveals thousands of faces beneath the chapel floor. All are singing.",choices:[{label:"Cut through the choir",to:"altar",dc:4},{label:"Listen to the hidden voices",to:"truth",dc:3}]},
choir:{title:"III · THE THIRTEENTH PSALM",text:"Faceless void knights kneel beneath a chained black sun. Their hymn rattles your skull. Their leader removes his helm. Beneath it is your own face.",choices:[{label:"Attack the choir",to:"altar",dc:5},{label:"Enter the ossuary vents",to:"reactor",dc:3},{label:"Demand the truth",to:"truth",dc:4}]},
reactor:{title:"IV · HEART OF THE HULK",text:"The reactor pulses like a colossal heart. Overloading it will erase this cathedral, its prisoners and every soul aboard.",choices:[{label:"Overload the reactor",to:"sacrifice",dc:4},{label:"Divert power to the chains",to:"altar",dc:3}]},
truth:{title:"IV · THE FALSE EXORCISM",text:"The black sun is a prison, not a weapon. The choir keeps an ancient god asleep. The vox warning came from the prisoner itself.",choices:[{label:"Join the choir and guard the prison",to:"warden",dc:4},{label:"Break the chains",to:"unbound",dc:5},{label:"Destroy the ship and prisoner",to:"sacrifice",dc:4}]},
altar:{title:"V · THE CRIMSON ALTAR",text:"A giant priest in spiked armour offers you dominion over a thousand worlds if you free what lies beneath the song. Your chainaxe trembles.",choices:[{label:"Reinforce the seal",to:"warden",dc:4},{label:"Sever the chains",to:"unbound",dc:5},{label:"Fight toward the reactor",to:"reactor",dc:4}]},
warden:{title:"ENDING · THE LAST CANTOR",text:"You join the faceless knights. Your voice holds darkness at bay for a thousand years. The galaxy survives. Your name is forgotten."},
unbound:{title:"ENDING · THE RED GOD WALKS",text:"The chains snap. Something wears the cathedral as armour and the moon as a skull. You have freed a god that knows only hunger."},
sacrifice:{title:"ENDING · ASHEN DAWN",text:"The reactor becomes a white star. The cathedral, the choir and its prisoner vanish. One final vox transmission survives: VARK DID NOT KNEEL."},
death:{title:"ENDING · SILENCE IN THE VOID",text:"Your armour splits. The final heartbeat echoes through the ship. The thirteenth bell rings once more, and the choir gains a voice."}
};
const pixel={fontFamily:'"Courier New",monospace'} as const;
export default function CrimsonLitany(){
 const [scene,setScene]=useState("start"),[hp,setHp]=useState(3),[roll,setRoll]=useState<number|null>(null),[log,setLog]=useState(""),[turn,setTurn]=useState(1);
 const s=story[scene];
 function choose(c:Choice){let next=c.to;let message="YOU ADVANCE INTO THE DARKNESS.";let n:number|null=null;
 if(c.dc){n=Math.floor(Math.random()*6)+1;if(n>=c.dc){message="SUCCESS · ROLLED "+n+" · NEEDED "+c.dc;}else{message="FAILED · ROLLED "+n+" · NEEDED "+c.dc+" · -1 HEALTH";const h=hp-1;setHp(h);if(h<=0)next="death";}}
 setRoll(n);setLog(message);setScene(next);setTurn(t=>t+1);}
 function restart(){setScene("start");setHp(3);setRoll(null);setLog("");setTurn(1);}
 return <main style={{minHeight:"100vh",background:"#050505",color:"#fff",padding:"24px 12px",...pixel}}>
 <div style={{maxWidth:820,margin:"0 auto",border:"3px solid #e6e6e6",boxShadow:"8px 8px 0 #7c0b0b",background:"#090909"}}>
 <header style={{padding:"22px 18px",borderBottom:"3px solid #fff",textAlign:"center"}}>
 <div style={{color:"#ed1414",fontSize:"clamp(32px,8vw,64px)",fontWeight:900,textShadow:"3px 3px #6c0000",letterSpacing:4}}>ELDERNIGHT</div>
 <div style={{fontSize:19,fontWeight:900,letterSpacing:3,marginTop:12}}>THE CRIMSON LITANY</div>
 <div style={{color:"#ddd",fontSize:12,marginTop:12}}>BLACK METAL × VOID KNIGHTS · D6 DICE ADVENTURE</div>
 </header>
 <div style={{padding:18,borderBottom:"2px solid #fff",display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap",fontWeight:700}}>
 <span>HEALTH: <span style={{color:"#f33"}}>{"■".repeat(hp)}</span><span style={{color:"#444"}}>{"□".repeat(3-hp)}</span></span><span>TURN: {turn}</span><span>DICE: D6</span>
 </div>
 <div style={{padding:"30px 22px",minHeight:360,background:"repeating-linear-gradient(135deg,#090909,#090909 6px,#100707 6px,#100707 8px)"}}>
 <div style={{border:"2px solid #a31919",padding:22,marginBottom:26,textAlign:"center",background:"#050505"}}>
 <div style={{fontSize:80,color:"#e71919",lineHeight:1}}>☩</div><div style={{letterSpacing:4,fontSize:12}}>NOCTIS VOTUM // DEAD MOON</div>
 <div style={{marginTop:12,fontSize:14,color:"#bbb"}}>IRON · BLOOD · SILENCE</div></div>
 <h1 style={{fontSize:"clamp(20px,4vw,28px)",color:"#f33",margin:"0 0 20px"}}>{s.title}</h1>
 <p style={{lineHeight:1.8,fontSize:17,marginBottom:24}}>{s.text}</p>
 {roll!==null&&<div role="status" style={{border:"2px solid #b71c1c",padding:18,marginBottom:20,textAlign:"center"}}><div style={{fontSize:11,color:"#aaa"}}>LAST DICE ROLL</div><div style={{fontSize:58,fontWeight:900,color:"#f33"}}>⚄ {roll}</div><div style={{fontSize:13}}>{log}</div></div>}
 {s.choices?<><div style={{fontSize:12,color:"#aaa",marginBottom:12}}>CHOOSE YOUR FATE · FAILED CHECKS COST 1 HEALTH</div>
 {s.choices.map((c,i)=><button key={i} onClick={()=>choose(c)} style={{display:"block",width:"100%",textAlign:"left",padding:16,marginBottom:12,color:"#fff",border:"2px solid #9d1919",background:"#1b0808",fontSize:16,cursor:"pointer",...pixel}}>➤ {c.label}<span style={{display:"block",fontSize:12,color:"#f88",marginTop:7}}>{c.dc?"ROLL "+c.dc+"+ ON A SIX-SIDED DIE":"NO ROLL REQUIRED"}</span></button>)}</>:<button onClick={restart} style={{padding:18,color:"#fff",background:"#9d1111",border:"2px solid white",fontSize:17,cursor:"pointer",...pixel}}>↻ PLAY AGAIN</button>}
 </div><footer style={{padding:18,textAlign:"center",fontSize:11,color:"#aaa",borderTop:"2px solid #fff"}}>ELDERNIGHT · ORIGINAL INTERACTIVE FICTION · BLACK / WHITE / RED ONLY</footer></div></main>
}
