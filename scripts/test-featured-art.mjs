import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
globalThis.window={};
const games=[['choir-of-iron','choirOfIron'],['crown','crownOfAsh'],['pip','pipAdventure'],['city','cityBelow'],['clock','clockworkKingdom'],['blackwater','bellsBeneathBlackwater'],['moonberry','moonberryPicnic'],['ember-vault','emberVaultAdventure'],['starless-throne','starlessThrone'],['hollow-king','hollowKing']];
const owners=new Map();let scenes=0;
for(const [file,fn] of games){
 await import('../public/assets/'+file+'.js');
 const game=window[fn]();
 for(const scene of game.scenes){
  assert.ok(scene.art,`${game.title}: ${scene.id} falls back to shared art`);
  const path=new URL('../public/assets/'+scene.art,import.meta.url);
  assert.ok(existsSync(path),`Missing artwork ${scene.art}`);
  const hash=createHash('sha256').update(readFileSync(path)).digest('hex');
  assert.ok(!owners.has(hash)||owners.get(hash)===game.title,`${scene.art} is shared by ${game.title} and ${owners.get(hash)}`);
  owners.set(hash,game.title);scenes++;
 }
}
console.log(`${games.length} games, ${scenes} scenes, ${owners.size} distinct assets: no shared scene artwork across games.`);
