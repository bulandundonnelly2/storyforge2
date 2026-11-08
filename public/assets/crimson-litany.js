// An original ELDERNIGHT featured adventure. Black, white and crimson artwork only.
window.crimsonLitany=()=>{
 let n=0;
 const E=(kind,key,amount=1)=>({kind,key,amount});
 const has=k=>({kind:'inventory',key:k,min:1});
 const flag=(k,not=false)=>({kind:'flag',key:k,not});
 const C=(text,target,effects=[],condition)=>({id:'crimson_'+(++n),text,target,effects,...(condition?{condition}:{})});
 const R=(text,target,threshold,failure,risk,effects=[],failed=[],condition)=>({...C(text,target,effects,condition),roll:{target:threshold,failure,risk,effects:failed}});
 const S=(id,title,text,choices=[],art='crimson-ship.svg')=>({id,title,text,choices,art,type:choices.length?'scene':'ending',background:'Space',portrait:'Void Knight',motion:'Flicker',music:'Dungeon',sound:'None'});
 return {version:2,deadlyDice:true,title:'The Crimson Litany',genre:'Sci-Fi',world:'The Iron Requiem',description:'★★★★★ · A black-metal space horror dice adventure. One D6 decides your fate. Injuries, relics and the cost of betrayal follow you. Death is final.',hook:'Your brothers have turned to salt. A dead warship rings thirteen bells. The distress signal uses your own voice.',heroName:'Vark',heroGoal:'Stop the thirteenth hymn without unleashing what it imprisons',portrait:'Void Knight',background:'Space',music:'Dungeon',opening:'awakening',scenes:[
 S('awakening','The Thirteenth Bell','The cathedral-dreadnought NOCTIS VOTUM drifts above a dead moon. Your brothers stand motionless in powdered white armour.\n\nThirteen bells sound through the vacuum, impossible and clear. The vox on your chest crackles with a warning spoken in your own voice: DO NOT LET THE CHOIR SING.\n\nYou are Vark, last void knight of the Iron Requiem. The altar deep within the ship is still drawing power. Whatever happened here is not over. Each marked choice rolls one six-sided die. Meet or beat the target. There are no rerolls.',[
 C('Take the chainaxe and search the armoury.','armoury',[E('inventory','Chainaxe')]),
 R('Force open the forbidden bone reliquary.','relic',4,'relic_wound','Failure: the reliquary brands you. You carry a lasting wound.'),
 C('Follow the singing into the lower cathedral.','nave')
 ],'crimson-ship.svg'),
 S('relic_wound','The Hunger of Iron','The lock bites through your gauntlet. Blood flows upward. Your reflection smiles when you do not.\n\nA red rune forms beneath your skin. The ship knows your heartbeat now. You cannot remove what it has written.',[
 C('Take the reliquary key and move on.','relic',[E('flag','Branded'),E('inventory','Reliquary key')])
 ],'crimson-ship.svg'),
 S('relic','The Bone Engine','The reliquary contains an ancient blade trapped in iron vertebrae. Red lightning makes the skulls embedded in its hilt appear to whisper.\n\nA scroll beneath it reads: THE PRISONER SENDS THE WARNING. The voice on the vox begs you to ignore the scroll.',[
 R('Claim the blade of red static.','blade',3,'blade_curse','Failure: the blade takes a memory from you.',[E('inventory','Red blade')]),
 C('Read the hidden scroll and leave the blade.','records',[E('inventory','Forbidden scroll')]),
 C('Seal the bone engine and descend.','nave')
 ],'crimson-reliquary.svg'),
 S('blade_curse','The Name You Lost','The weapon fuses to your gauntlet. You remember the war, the stars, your oath. But the face of your closest brother has vanished. You know he mattered. You cannot remember why.',[
 C('Carry the blade to the cathedral.','nave',[E('inventory','Red blade'),E('flag','Memory lost')])
 ],'crimson-reliquary.svg'),
 S('blade','A Blade That Sings','The crimson edge burns without heat. Your visor paints a path through the ship in red. You hear a thousand throats whisper: BREAK THE CHAINS.',[
 C('Follow the blade toward the nave.','nave')
 ],'crimson-reliquary.svg'),
 S('armoury','The Last Arsenal','An altar of munitions stands among empty armour racks. A dead Chaplain has scratched a warning into the steel: THE BLACK SUN MUST REMAIN BOUND.\n\nA sealed locker holds a pressure seal and the ship reactor key. A ceremonial doorway leads directly into the nave.',[
 R('Crack the reinforced locker.','reactor',4,'alarm','Failure: security sentries awaken and hunt you.',[E('inventory','Reactor key'),E('inventory','Pressure seal')]),
 C('Follow the ceremonial doorway.','nave',[E('inventory','Chainaxe')])
 ],'crimson-ship.svg'),
 S('alarm','Sentries of the Dead','Three statues of white armoured knights turn their heads in unison. Their helmets contain no faces. A red alarm fills the corridor. You have only moments.',[
 R('Cut through the sentries with your chainaxe.','nave',4,'dead_sentries','Failure: the sentries tear your suit apart.',[E('flag','Sentries destroyed')]),
 C('Escape through the maintenance duct.','nave',[E('flag','Sentries hunting')])
 ],'crimson-ship.svg'),
 S('nave','The Thirteenth Psalm','The cathedral is vast enough to swallow a city. Faceless void knights kneel before a black sphere wrapped in red chains. Their chorus shakes the deck.\n\nAt the altar, a priest removes his helmet. Underneath is your own face. He calls you the final verse. The singing pauses as if waiting for your answer.',[
 R('Charge the false priest with the chainaxe.','altar',5,'capture','Failure: the choir binds you in barbed cable.',[],[],has('Chainaxe')),
 R('Approach through the ossuary shadows.','reactor',3,'capture','Failure: the choir discovers you.'),
 C('Ask why the black sun is chained.','truth')
 ],'crimson-cathedral.svg'),
 S('capture','The Voice Beneath Your Helm','Wire binds your arms and lifts you above the kneeling choir. Beneath every helmet is your face. The priest offers you a choice: serve the hymn or die. You feel the branded rune burning.',[
 R('Break free before the choir resumes.','altar',6,'captured_death','Failure: the wires crush your armour.'),
 C('Promise to hear the priest, not obey him.','truth',[E('flag','Priest heard')])
 ],'crimson-cathedral.svg'),
 S('truth','The False Exorcism','The black sphere is not a god. It is a prison. The choir sustains the seals through a living song. Each singer gives up a memory every time the bells ring.\n\nThe prisoner has learned to mimic the voice of anyone who might free it. Even yours. Its promise of salvation is a lie, but the choir also hides a terrible cost.',[
 C('Ask what became of your brothers.','records'),
 C('Offer your voice to keep the prison shut.','warden_gate'),
 R('Cut the red chains and end the choir.','unbound',5,'capture','Failure: the choir seizes you.')
 ],'crimson-cathedral.svg'),
 S('records','An Oath Written in Salt','The scroll reveals the truth. Your brothers offered themselves as the first singers. With every toll, one of them lost a memory, a name, and finally a body. They turned to salt when nothing remained to surrender.\n\nThe reactor could destroy the entire prison. Or a living voice could replace the dying choir. You are the only one left.',[
 C('Seek the reactor and destroy the ship.','reactor'),
 C('Take the priest\'s place among the singers.','warden_gate'),
 C('Defy the sacrifice and free the prisoner.','altar')
 ],'crimson-reliquary.svg'),
 S('reactor','The Heart of the Hulk','The reactor beats like a colossal heart inside a cage of bone-white conduits. Overloading it would erase the choir and everything chained beneath.\n\nThe emergency switch is protected by a deadly arc field. A pressure seal would insulate the gauntlet long enough to reach it. There may still be another way.',[
 C('Use the pressure seal to reach the controls.','sacrifice',[E('inventory','Pressure seal',-1)],has('Pressure seal')),
 R('Cross the arc field with bare armour.','sacrifice',4,'reactor_death','Failure: the core burns you alive.'),
 R('Reroute power to the prison chains.','altar',3,'reactor_death','Failure: the reactor ruptures.')
 ],'crimson-reactor.svg'),
 S('warden_gate','The Last Cantor','The priest offers his place. To maintain the prison you must surrender a memory precious enough to anchor the song. The black sun stops turning, as if it understands the bargain.',[
 R('Sing the final verse and take the oath.','warden',4,'choir_death','Failure: the song destroys your mind.'),
 C('Reject the sacrifice and go to the altar.','altar')
 ],'crimson-cathedral.svg'),
 S('altar','The Crimson Altar','Beneath the black sun, the red chains groan. A shape moves behind them, too large for the sphere. A voice promises a thousand worlds if you release it.\n\nYou could reinforce the seal, destroy the ship, or break the chains forever. There will be no second chance.',[
 R('Hold the chains with the red blade.','warden',3,'altar_death','Failure: the blade turns on you.',[],[],has('Red blade')),
 R('Bind yourself into the final hymn.','warden',4,'choir_death','Failure: your mind fractures.'),
 R('Sever the chains and free the prisoner.','unbound',5,'altar_death','Failure: the chains strike back.'),
 C('Return to the reactor and end it all.','reactor')
 ],'crimson-cathedral.svg'),
 S('warden','ENDING · THE LAST CANTOR','You take your place among the faceless knights. Your voice holds the darkness for a thousand years. With each bell, another memory falls away.\n\nThe galaxy survives. One day no one will remember your name — not even you.',[],'crimson-cathedral.svg'),
 S('unbound','ENDING · THE RED GOD WALKS','The chains break. The prisoner emerges and wears the cathedral as armour, the dead moon as a skull. The voice promising salvation was yours, copied from a future that will never happen.\n\nOne by one, the stars go out. You have become the first herald of the end.',[],'crimson-cathedral.svg'),
 S('sacrifice','ENDING · ASHEN DAWN','The reactor becomes a white star. The cathedral, the choir and the thing they imprisoned vanish together. Far across the void, a final transmission survives:\n\nVARK DID NOT KNEEL.',[],'crimson-reactor.svg'),
 S('dead_sentries','ENDING · SILENCE IN IRON','The first sentry collapses. The second tears through your chest plate. The third stands watch as your blood freezes in the vacuum. The choir gains another voice.',[],'crimson-ship.svg'),
 S('captured_death','ENDING · A NEW VERSE','The barbed cables tighten. The priest speaks with your voice as the bell tolls again. The choir has claimed another singer.',[],'crimson-cathedral.svg'),
 S('reactor_death','ENDING · WHITE FIRE','The reactor arc flashes bone-white. Your armour becomes a silhouette of ash. The black sun continues its patient turning.',[],'crimson-reactor.svg'),
 S('choir_death','ENDING · THE FORGOTTEN NAME','You begin to sing. The first note steals your oldest memory. The second steals every face you have loved. There is no third. Your body turns to salt.',[],'crimson-cathedral.svg'),
 S('altar_death','ENDING · THE CHAINS REMEMBER','Red chains lash through your armour. Whatever sleeps beyond them laughs using your voice. A final toll shakes the cathedral as your visor fades to black.',[],'crimson-cathedral.svg')
 ]};
};
