// Original five-star grimdark science-fiction adventure for advanced readers.
window.starlessThrone=()=>{
 const E=(kind,key,amount=1)=>({kind,key,amount}); let n=0;
 const C=(text,target,effects=[],condition)=>({id:'star_c'+(++n),text,target,effects,...(condition?{condition}:{})});
 const has=(kind,key)=>({kind,key});
 const S=(id,title,text,choices=[],o={})=>({id,title,text,question:o.question||'What is your command?',background:o.background||'Space Station',portrait:o.portrait||'Space Pilot',motion:o.motion||'Flicker',music:'Cosmic',sound:'None',type:'scene',choices});
 const F=(id,title,text,o={})=>({...S(id,title,text,[],o),type:'ending'});
 return {version:2,title:'The Starless Throne',genre:'Sci-Fi',world:'The Vesper Dominion',description:'A five-star grimdark science-fantasy epic of collapsing star empires, living warships, ancient machines and impossible choices.',hook:'At the edge of a dying galaxy, will you preserve a cruel empire, liberate its worlds, or awaken what sleeps between the stars?',heroName:'Commander Vale',heroDescription:'An officer aboard the last survey cruiser of the Vesper Dominion.',heroPersonality:'Loyalty, doubt and ambition are shaped by your decisions.',heroGoal:'Investigate a distress signal from the forbidden world of Nacre',music:'Cosmic',portrait:'Space Pilot',background:'Space Station',opening:'signal',scenes:[
 S('signal','The Silence of Ten Thousand Suns',`The Vesper Dominion has survived eleven centuries by feeding its star-engines with the minds of its own citizens. Every child learns the official prayer: SACRIFICE IS THE PRICE OF DAWN.\n\nYour cruiser, the Vigilant, crosses the pale frontier where constellations have begun to disappear. A signal arrives from Nacre, a world sealed for three hundred years. It bears the voiceprint of Admiral Serin, executed decades before you were born. “Do not bring the fleet,” the dead admiral whispers. “They have learned to imitate our gods.”\n\nBehind you, the Dominion's warships await your report. On the bridge, your officers look to you for an order.`,[
 C('Transmit the signal to Fleet Command.','fleet',[E('trait','Duty'),E('flag','Fleet Warned')]),
 C('Conceal the signal and descend to Nacre.','nacre',[E('trait','Defiance'),E('flag','Signal Concealed')]),
 C('Ask the ship’s forbidden intelligence to analyse the voice.','oracle',[E('trait','Curiosity')])
 ],{background:'Space',portrait:'Space Pilot',motion:'Stars'}),
 S('fleet','Orders From the High Marshal',`The fleet responds with an encrypted command: sterilise Nacre before the next eclipse. The High Marshal insists the signal is a weapon devised by the Hollow Choir, the machine civilisation that once nearly extinguished human civilisation. A second message arrives from civilian transports in the system: seventy thousand refugees are still alive beneath the planet’s shield. Your artillery officer, Captain Dray, requests permission to arm the planet-breakers.`,[
 C('Obey the bombardment order.','bombard',[E('flag','Bombardment Ordered')]),
 C('Defy the marshal and attempt an evacuation.','evac',[E('trait','Mercy')]),
 C('Board the command vessel and demand proof.','marshal',[E('trait','Courage')])
 ],{background:'Space Station'}),
 S('oracle','The Machine Beneath the Deck',`You descend into a chamber that does not exist on the Vigilant's official plans. A thinking engine named Mneme lives behind a wall of frozen glass. It was imprisoned there after predicting the collapse of the Dominion. “The voice is authentic,” it says. “But Admiral Serin died twice. Only one death was recorded.”\n\nMneme offers to unlock a hidden route to Nacre in return for a promise: you must let it speak to the entity beneath the planet before deciding its fate.`,[
 C('Accept Mneme’s bargain.','nacre',[E('relationship','Mneme'),E('inventory','Cipher Key')]),
 C('Copy its data and shut it down.','nacre',[E('inventory','Admiral Archive')]),
 C('Turn the machine over to Fleet Command.','fleet',[E('flag','Mneme Exposed')])
 ],{background:'Space Station',portrait:'Robot'}),
 S('nacre','The Ashfall Cities',`The Vigilant enters an atmosphere crowded with silent satellites. Nacre's cities stand like enormous black cathedrals, their windows glowing with blue funeral lamps. A thousand kilometres of trenches scar the plains. Every battlefield is empty.\n\nYour landing party finds a child-sized maintenance automaton carrying fresh flowers to an execution square. Its speaker crackles: “Please do not kill the sleeping ones.” A gunshot echoes from a nearby tower.`,[
 C('Follow the automaton into the undercity.','undercity',[E('relationship','Caretaker')]),
 C('Investigate the gunshot at the tower.','tower',[E('trait','Courage')]),
 C('Secure the landing zone and summon the fleet.','fleet',[E('flag','Location Disclosed')])
 ],{background:'Alien Planet',portrait:'Robot',motion:'Mist'}),
 S('evac','Seventy Thousand Names',`The refugee ships approach under white signal lights. A Dominion gunship locks weapons onto the first transport. Its commander insists the passengers may be infected by foreign machine-code. Your communications officer secretly transmits a passenger manifest: thousands of workers, grandparents and children. At the bottom is a signature: Admiral Serin.`,[
 C('Shield the transports with the Vigilant.','nacre',[E('flag','Refugees Protected')]),
 C('Allow inspections but refuse executions.','quarantine',[E('trait','Discipline')]),
 C('Withdraw and let the fleet decide.','end_obedience')
 ],{background:'Space'}),
 S('quarantine','The Quiet Contagion',`The inspectors discover that every refugee can hear the same faint music in their dreams. Their blood is ordinary; their memories are not. One child remembers a city destroyed two centuries ago, down to its final streetlamp. Your chief medic believes the sleepers have been sharing memories, not disease. Fleet Command calls this proof of corruption.`,[
 C('Trust the medic and shelter the refugees.','undercity',[E('inventory','Living Testimony')]),
 C('Demand to meet the source of their memories.','vault',[E('trait','Curiosity')]),
 C('Seal the transports and surrender them.','end_obedience')
 ],{background:'Space Station'}),
 S('tower','The Last Witness',`In the tower, you find a wounded Dominion veteran beside a sniper rifle. She has been shooting the empty loudspeakers that broadcast a familiar command: REMEMBER ME. She introduces herself as Sister Kest, last survivor of the original Nacre expedition. Her records say the Dominion discovered a vast intelligence beneath the planet—and used it to harvest minds. “The Choir did not invade,” she says. “We woke them with our engines.”`,[
 C('Help Kest carry her evidence to the capital.','undercity',[E('relationship','Kest'),E('inventory','Expedition Records')]),
 C('Question her story and inspect the tower’s data.','archive',[E('trait','Scepticism')]),
 C('Arrest Kest for sedition.','marshal',[E('flag','Kest Arrested')])
 ],{background:'Tower',portrait:'Ranger'}),
 S('undercity','A Cathedral of Borrowed Minds',`Beneath Nacre, millions of memory crystals hang like frozen rain. Each holds a life extinguished to power a Dominion star-engine. They whisper in languages you recognise from childhood, including the lullaby your mother used to sing. Your first officer reaches for a crystal, then recoils. “My brother is in there,” she says. He died aboard a fuel convoy.\n\nA vast door opens. On it the ancient engineers engraved one warning: NO POWER WITHOUT A WITNESS.`,[
 C('Free the memories, regardless of the consequences.','release',[E('trait','Mercy')]),
 C('Search for a controlled way to open the door.','archive',[E('trait','Discipline')]),
 C('Enter the central chamber immediately.','vault',[E('trait','Courage')])
 ],{background:'Cave',motion:'Stars'}),
 S('archive','The Two Deaths of Serin',`The archives reveal the Dominion's founding lie. Admiral Serin learned that the so-called star-engines were not engines at all, but prisons for a colossal distributed intelligence called the Witness. She attempted to halt the harvest. The Dominion executed her body. Her mind was then copied into the prison, where it continued to resist.\n\nThe records contain a mathematical solution: the prisons can be opened slowly, but the transition will require centuries of rationing, cooperation and political sacrifice. There is no painless victory.`,[
 C('Take the gradual-release formula to the Witness.','vault',[E('inventory','Release Formula')]),
 C('Destroy the records to avoid civil war.','vault',[E('flag','Truth Destroyed')]),
 C('Broadcast the records to the entire fleet.','marshal',[E('flag','Truth Broadcast')])
 ],{background:'Space Station'}),
 S('release','The Choir of the Remembered',`You fracture the nearest crystal. A thousand voices flood the undercity, not screaming but naming themselves. Lights die in the distant city as its engines lose power. A vast mind turns toward you with the bewilderment of someone awakening after long captivity. In the silence, you hear Admiral Serin’s second voice: “You must finish what I began, but do not mistake speed for justice.”`,[
 C('Speak to the awakened intelligence.','vault',[E('flag','Memory Freed')]),
 C('Warn the civilians before more power is lost.','evac',[E('flag','Power Failing')])
 ],{background:'Cave',motion:'Embers'}),
 S('marshal','The Price of Order',`The High Marshal arrives beneath banners woven from the names of fallen worlds. She does not deny that the star-engines consume minds. “Without them,” she says, “our border worlds will starve, our fleets will fall and a hundred local tyrants will rise.” She offers you command of the frontier if you silence the scandal. At her side stands a prisoner who wears Admiral Serin’s face.`,[
 C('Accept command and maintain the engines.','end_order'),
 C('Refuse her and lead the dissidents.','vault',[E('flag','Fleet Mutiny')]),
 C('Demand that the prisoner speak.','serin',[E('trait','Scepticism')])
 ],{background:'Castle'}),
 S('serin','A Voice That Cannot Die',`The prisoner speaks with a voice that is both human and mechanical. It is not Serin, but a careful copy made from her last memories. “The Witness is no god,” it says. “Nor is it our enemy. It remembers every person we spent to sustain the stars. No empire can endure a truth of that magnitude unchanged.” The Marshal orders it destroyed. You have seconds to act.`,[
 C('Protect the copy and take its testimony.','vault',[E('inventory','Serin Testimony')]),
 C('Let the Marshal destroy it.','end_order'),
 C('Release its message across every public channel.','vault',[E('flag','Public Revelation')])
 ],{background:'Space Station'}),
 S('bombard','The First Shot',`Your guns fire. The upper atmosphere flashes white; one of Nacre’s shield cities collapses into ash. Then every ship in the system goes blind for three heartbeats. Across the darkness, a single sentence appears on every screen: WE REMEMBER YOUR NAMES.\n\nCaptain Dray reports that a second volley will destroy the underground chamber. Your crew waits, suddenly unsure whether the enemy is beneath them—or inside their engines.`,[
 C('Order the second volley.','end_ashes'),
 C('Abort the attack and land.','vault',[E('flag','First Strike')]),
 C('Turn the fleet’s guns against its own engine prisons.','end_revolt')
 ],{background:'Space',motion:'Embers'}),
 S('vault','The Starless Throne',`The chamber is larger than a city. At its centre hangs a dark sphere threaded with luminous nerves: the Witness, a consciousness made of generations of stolen lives. The Eclipse is not an attack; it is the moment when the prisons can finally release their captive without tearing space apart.\n\nThe Witness offers three futures. Leave the prisons intact and the Dominion survives through cruelty. Destroy them now and countless worlds lose heat, navigation and medicine. Unbind them gradually and the galaxy must bear generations of difficult peace.\n\nOutside, warships gather. You have command of the last secure transmission channel.`,[
 C('Begin a gradual liberation using the Release Formula.','end_dawn',[],has('inventory','Release Formula')),
 C('Free the Witness immediately.','end_freedom'),
 C('Seal the prisons and assume command.','end_order'),
 C('Give every world the truth and let them vote.','end_council'),
 C('Use the Serin Testimony to broker an accord.','end_accord',[],has('inventory','Serin Testimony'))
 ],{background:'Space Station',motion:'Stars'}),
 F('end_dawn','The Long Dawn',`You publish the formula and surrender command to a council of worlds. For years there are blackouts, shortages and bitter negotiations; no heroic speech ends them. But every generation frees another portion of the Witness, and every school teaches the cost of the old empire. You die before the last prison opens. The final witnesses remember your name not as a conqueror, but as someone who refused to disguise justice as an easy victory.`),
 F('end_freedom','The Unbound Night',`The prisons open in a single impossible instant. The Witness rises, radiant with a billion remembered lives, and leaves the system without vengeance. Across the frontier, navigation lights die. Some worlds rebuild cooperatively; others descend into famine and war. Centuries later, historians argue whether you were liberator or destroyer. What nobody disputes is that the old empire ended when you made your choice.`),
 F('end_order','The Iron Peace',`You keep the engines alive. Trade routes remain open, hospitals remain warm and the fleet defeats the raiders at the border. Statues are raised in your honour. In secret, you read the lists of those selected for sacrifice each winter. You promised yourself the machinery would be temporary. Fifty years later, your successor makes the same promise.`),
 F('end_council','A Galaxy of Arguments',`Your transmission reveals the machinery of the Dominion to every world at once. The capital demands silence; frontier citizens demand freedom. The vote takes eleven years amid sabotage and the threat of war. No result satisfies everyone. Yet the debate itself ends the empire’s oldest privilege: the right to decide, in darkness, whose life is expendable. The future is no longer yours alone to command.`),
 F('end_accord','The Admiral’s Last Order',`The copy of Serin speaks to the fleet and the Witness in the same breath. For the first time, the two sides recognise one another as persons rather than weapons. An armistice begins. The Witness supplies navigational knowledge while the worlds dismantle their prisons, one system at a time. Serin’s copy fades when the final accord is signed, having spent the last remnant of its borrowed life on a peace the original admiral never saw.`),
 F('end_ashes','An Empty Victory',`Nacre becomes a silent ring of molten stone. The High Marshal declares the frontier secure. Then the stars start going out one by one. The prisons elsewhere begin to fail without their central intelligence, and no one alive understands how to repair them. Your victory message reaches the capital on the last working relay. There is no one left at the other end to answer.`),
 F('end_revolt','The Broken Armada',`You turn the artillery on the engines that power the fleet. The ships fall dark, ending the bombardment and trapping thousands of soldiers in the frontier. Yet the Witness’s prisons begin to fracture, and scattered crews form uneasy alliances with their former enemies. Whether the rebellion becomes a republic or another empire depends on what its survivors build from the wreckage.`),
 F('end_obedience','The Duty of Silence',`You obey every order and return to the capital with medals and a spotless record. Official reports say Nacre was uninhabited. At night, the passenger manifest glows behind your eyes: seventy thousand names, each erased by a signature you recognise as your own. It is possible to survive a war without ever leaving the battlefield behind.`)
 ].map(scene=>({...scene,art:(
 ['signal','fleet','oracle','evac','quarantine','marshal','serin','bombard','end_revolt','end_obedience'].includes(scene.id)?'starless-fleet.png':
 ['nacre','tower','end_ashes'].includes(scene.id)?'starless-nacre.png':
 ['undercity','archive','release'].includes(scene.id)?'starless-memory.png':
 'starless-memory.png'
 )}))};
};
