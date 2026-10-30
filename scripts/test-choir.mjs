import assert from 'node:assert/strict';
globalThis.window={};
await import('../public/assets/choir-of-iron.js');
const {resolveRoll}=await import('../public/assets/hollow-king.js');
const game=window.choirOfIron(),scenes=new Map(game.scenes.map(s=>[s.id,s]));
const allowed=(rule,bags)=>!rule?true:rule.all?rule.all.every(r=>allowed(r,bags)):rule.any?rule.any.some(r=>allowed(r,bags)):rule.not?!((bags[rule.kind]?.[rule.key]||0)>=Math.max(1,rule.min||1)):((bags[rule.kind]?.[rule.key]||0)>=Math.max(1,rule.min||1));
const queue=[{id:game.opening,bags:{}}],visited=new Set(),endings=new Set();let paths=0;
while(queue.length){
 const state=queue.pop(),key=JSON.stringify(state);if(visited.has(key))continue;visited.add(key);
 const scene=scenes.get(state.id);assert.ok(scene,`Missing destination ${state.id}`);
 if(scene.type==='ending'){endings.add(scene.id);continue}
 const choices=scene.choices.filter(c=>allowed(c.condition,state.bags));assert.ok(choices.length,`Dead end ${state.id}`);
 for(const choice of choices){
  if(choice.text.includes('Ask your companion'))assert.ok(!state.bags.flag?.['Companion dead']&&!state.bags.flag?.['Companion left behind']);
  const faces=choice.roll?[1,2,3,4,5,6]:[null];
  for(const face of faces){
   const c=face?resolveRoll(choice,face):choice,bags=structuredClone(state.bags);
   if(face)assert.equal(c.target,face>=choice.roll.target?choice.target:choice.roll.failure);
   for(const effect of c.effects){bags[effect.kind]??={};bags[effect.kind][effect.key]=(bags[effect.kind][effect.key]||0)+effect.amount}
   queue.push({id:c.target,bags});paths++;
  }
 }
}
assert.equal(endings.size,game.scenes.filter(s=>s.type==='ending').length);
console.log(`${visited.size} reachable game states, ${paths} transitions: all ${endings.size} endings reachable, no dead ends, companion restrictions respected.`);
