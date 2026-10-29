// Original tabletop-inspired branching fantasy adventure (ages roughly 13–15).
window.emberVaultAdventure=()=>{
 const E=(kind,key,amount=1)=>({kind,key,amount});
 let n=0;
 const C=(text,target,effects=[],condition)=>({id:'ember_c'+(++n),text,target,effects,...(condition?{condition}:{})});
 const has=(kind,key)=>({kind,key});
 const S=(id,title,text,choices=[],o={})=>({id,title,text,question:o.question||'What will you do?',background:o.background||'Castle',portrait:o.portrait||'Knight',motion:o.motion||'Flicker',music:o.music||'Dungeon',sound:'None',type:'scene',choices});
 const F=(id,title,text)=>({...S(id,title,text,[]),type:'ending'});
 return {version:2,title:'The Ember Vault',genre:'Fantasy',world:'The Shattered Marches',description:'A tabletop-inspired adventure of dangerous ruins, difficult bargains, unlikely allies and an imprisoned dragon.',hook:'Will you claim a dragon’s fire, set it free, or let the kingdom fall into darkness?',heroName:'The Wanderer',heroDescription:'A young adventurer carrying a broken compass and a letter sealed with dragon wax.',heroPersonality:'Your choices decide',heroGoal:'Find the Ember Vault before the Eclipse Court',music:'Dungeon',portrait:'Knight',background:'Castle',opening:'tavern',scenes:[
 S('tavern','A Map Written in Ash',`At the edge of the Shattered Marches, the windows of the Crooked Lantern glow against the rain. An injured courier collapses at your table. He presses a warm, black coin into your palm. “The Ember Vault opens at moonrise,” he whispers. “If the Eclipse Court reaches it first, every hearth in the kingdom will go cold.”\n\nThree travellers watch you: Mara, a quick-handed scout; Brother Orren, a healer; and Vex, a goblin scholar with ink-stained claws. Outside, armoured riders dismount.`,[
 C('Recruit Mara, the scout.','forest',[E('relationship','Mara'),E('trait','Cunning')]),
 C('Ask Brother Orren to come.','forest',[E('relationship','Orren'),E('trait','Mercy')]),
 C('Trust Vex and his forbidden maps.','forest',[E('relationship','Vex'),E('trait','Knowledge')])
 ],{background:'Tavern',motion:'Rain'}),
 S('forest','The Three Roads',`Your companion leads you beyond the village into the Thornwood. A stone marker offers three routes: the King’s Causeway, the whispering marsh and the ruined watchtower. The broken compass spins toward the tower. Behind you, the riders’ horns sound through the trees. There is no time to explore every path.`,[
 C('Cross the causeway and face the patrol.','patrol',[E('trait','Courage')]),
 C('Slip through the whispering marsh.','marsh',[E('trait','Cunning')]),
 C('Climb the ruined watchtower.','tower',[E('trait','Knowledge')])
 ],{background:'Forest',motion:'Mist'}),
 S('patrol','A Guard Who Will Not Fight',`The patrol’s captain raises his sword, then hesitates. He recognises the black coin. His orders are to seize it, but his daughter is sick, and the Court has promised her medicine. His hands shake as he asks you to surrender.`,[
 C('Offer to help his daughter if he lets you pass.','gate',[E('flag','Captain Spared')]),
 C('Challenge him and break through the line.','gate',[E('flag','Patrol Defeated'),E('trait','Courage')]),
 C('Hand him a false coin and escape.','gate',[E('flag','Captain Deceived')])
 ],{background:'Valley'}),
 S('marsh','The Toll of Whisperfen',`Faces appear beneath the black water. A ferryman with no reflection offers a dry crossing. “A memory,” he says, “or a truth spoken aloud.” The marsh mist is thick with voices that sound like people you miss.`,[
 C('Give the ferryman a cherished memory.','gate',[E('flag','Memory Given')]),
 C('Tell him you are afraid, and cross honestly.','gate',[E('trait','Resolve')]),
 C('Refuse the bargain and wade through the water.','gate',[E('flag','Marsh Wound')])
 ],{background:'Swamp',motion:'Mist'}),
 S('tower','The Watchtower Riddle',`Inside the tower a brass owl guards a broken staircase. “I have cities but no houses, rivers but no water, and mountains but no stone. What am I?” Its glass eyes brighten. Dust falls from an ancient map case.`,[
 C('A map.','maproom',[E('inventory','Star Map')]),
 C('A dream.','gate',[E('flag','Owl Angered')]),
 C('A book.','gate',[E('flag','Owl Angered')])
 ],{background:'Tower'}),
 S('maproom','The Star Map',`The owl bows and reveals a map marked with a secret tunnel beneath the Ember Vault. On the back someone has written: “The dragon is a prisoner, not a monster.” Below those words sits the name of the first king, crossed out in red ink.`,[C('Carry the map to the mountain.','gate')],{background:'Tower'}),
 S('gate','The Door of Seven Blades',`At sunset you reach the fortress cut into the mountainside. Seven swords stand upright in the stone gate. The black coin fits the centre of a carved dragon’s eye. A wounded stone guardian opens one enormous hand. “Only those who understand the cost of power may enter.”`,[
 C('Offer your black coin to unlock the door.','hall',[E('inventory','Ember Key')]),
 C('Search for a secret passage with the Star Map.','tunnel',[],has('inventory','Star Map')),
 C('Ask the guardian who imprisoned the dragon.','guardian',[E('trait','Knowledge')])
 ],{background:'Mountain',motion:'Wind'}),
 S('guardian','The Guardian’s Confession',`“The first king stole fire from a living dragon,” the guardian says. “His heirs built their kingdom upon its chains. The Court intends to bind it again.” The guardian sets a glowing ember in your hand. “You may command fire once, but the choice afterward must be your own.”`,[
 C('Take the ember and enter.','hall',[E('inventory','Guardian Ember')])
 ],{background:'Cave'}),
 S('tunnel','The Forgotten Passage',`The map guides you into an old drainage shaft. Bones of long-dead miners line the steps. An inscription describes a pact between a dragon called Aurelith and the first king: warmth for the people in exchange for freedom after one hundred winters. Three centuries have passed. At the end of the tunnel you hear voices arguing.`,[
 C('Listen before revealing yourself.','court',[E('flag','Court Secret')]),
 C('Go straight toward the dragon’s voice.','dragon')
 ],{background:'Cave'}),
 S('hall','The Hall of Unkept Promises',`Hundreds of iron lanterns hang from chains, each containing a tiny stolen flame. The Eclipse Court’s masked leader stands beside a staircase descending into red light. “We can keep the kingdom warm forever,” she says, “if you help us hold the dragon.” Your companion looks at you, waiting.`,[
 C('Hear the Court’s proposal.','court'),
 C('Reject her offer and rush downstairs.','dragon',[E('trait','Courage')]),
 C('Break the lanterns to free their flames.','lanterns',[E('trait','Mercy')])
 ],{background:'Castle'}),
 S('lanterns','A Thousand Small Fires',`Glass breaks like winter hail. The stolen flames race through the hall, lighting names on the walls: villages sacrificed so the capital might stay bright. The Court’s leader steps back as the doors swing open below. Your decision has weakened her magic.`,[C('Descend into the vault.','dragon',[E('flag','Lanterns Freed')])],{background:'Castle',motion:'Embers'}),
 S('court','The Eclipse Court',`The masked leader removes her veil. She is Princess Selene, last heir of the first king. “If we free Aurelith, the mountain’s magic will fade. Our city could freeze before dawn.” She offers you a golden chain and a place at her side. “Sometimes a cruel choice saves more lives than a kind one.” You know she is telling part of the truth—but not all of it.`,[
 C('Accept the chain and protect the city.','end_chain'),
 C('Demand another way.','dragon',[E('flag','Refused Chain')]),
 C('Pretend to agree, then steal the chain.','dragon',[E('inventory','Golden Chain')])
 ],{background:'Castle'}),
 S('dragon','The Ember Vault',`Aurelith lies beneath the mountain, bound by iron roots. The ancient dragon is vast, but its voice is tired. “The king asked for a century. I gave him one. His children gave me three.” Above you, the mountain groans. Selene’s soldiers race toward the chamber.\n\nAurelith tells you the final truth: the magical hearths can be relit, but not without sacrifice. The dragon could surrender its remaining power and die, or the people could learn to survive without stolen fire.`,[
 C('Break the roots and release Aurelith.','end_freedom',[E('trait','Mercy')]),
 C('Ask Aurelith to share its fire willingly.','end_pact',[E('trait','Wisdom')]),
 C('Use the Golden Chain to rule its fire.','end_tyrant',[],has('inventory','Golden Chain')),
 C('Use the Guardian Ember to shatter the binding spell.','end_guardian',[],has('inventory','Guardian Ember')),
 C('Leave the vault sealed and warn the kingdom.','end_warning')
 ],{background:'Cave',motion:'Embers'}),
 F('end_freedom','The Dragon Unbound',`You strike the final iron root. Aurelith rises, breaking the mountain like a shell. By dawn the stolen hearths have gone dark—but the dragon does not burn the towns. Instead it carries survivors to the warm southern valleys. The kingdom loses its easy magic and gains an uncertain future. You have chosen freedom without pretending it has no price.`),
 F('end_pact','The Firekeepers’ Oath',`You offer Aurelith a bargain no king ever made: the people will tend their own fires, and the dragon may leave whenever it chooses. Aurelith lends a single living spark to each village. None may be owned. None may be taken by force. When the first hearth is lit, the dragon flies into the dawn. Your victory is not a crown but a promise that must be kept.`),
 F('end_tyrant','The Ashen Crown',`The golden chain answers your command. Flames blaze across the kingdom, and crowds cheer a new saviour. Beneath the mountain, Aurelith grows silent. Each night your throne feels colder despite the roaring fires. The people are safe for now. You have become the next keeper of the prison—and the next chapter of its curse.`),
 F('end_guardian','The Seventh Blade',`The Guardian Ember falls between the roots. The spell fractures without breaking the mountain, and the captive dragon awakens. Aurelith bows to the wounded guardian, who at last turns to stone in peace. Together you and the dragon carry new fire to the villages. The ancient debt is settled, though the rebuilding has only begun.`),
 F('end_warning','The Long Winter',`You seal the vault and flee with the truth. No dragon burns the kingdom, but the hearths weaken, village by village. You spend the winter organising shelters and sharing the story the kings tried to erase. Your choice did not end the danger. It gave the people a chance to decide for themselves before the next moonrise.`)
 ].map(scene=>({...scene,art:(
 ['tavern'].includes(scene.id)?'ember-tavern.png':
 ['forest','patrol','marsh','tower','maproom','gate','guardian'].includes(scene.id)?'ember-gateway.png':
 ['court','end_tyrant'].includes(scene.id)?'ember-court.png':
 ['dragon','end_freedom','end_pact','end_guardian'].includes(scene.id)?'ember-dragon.png':
 'ember-vault.png'
 )}))};
};
