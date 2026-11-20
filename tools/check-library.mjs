import assert from 'node:assert/strict';
import {readFile,readdir,access} from 'node:fs/promises';
const read=async file=>readFile(new URL('../'+file,import.meta.url),'utf8');
const [html,engine,css,manifest,worker,cabinet]=await Promise.all(['index.html','games.js','styles.css','manifest.webmanifest','sw.js','achievements.js'].map(read));
assert.match(html,/id="game-search"/,'Library search input missing');
assert.match(html,/id="cabinet-dialog"/,'Achievement dialog missing');
assert.match(html,/src="\.\/achievements\.js"/,'Achievement script not loaded');
assert.match(cabinet,/oddities-cabinet-v1/,'Local achievements store missing');
assert.match(worker,/\.\/achievements\.js/,'Achievement assets missing from offline cache');
assert.match(engine,/oddities:game-finish/,'Gameplay completion event missing');
assert.match(engine,/PocketOddities=Object\.freeze/,'Game pack registration API missing');
assert.match(engine,/info\.length\+' beaten'/,'Completion count must be dynamic');
const manifestJSON=JSON.parse(manifest);
assert.ok(manifestJSON.name&&manifestJSON.start_url&&manifestJSON.icons.length);
const packNames=(await readdir(new URL('../game-packs/',import.meta.url))).filter(n=>n.endsWith('.js'));
let registered=0;
for(const name of packNames){
  const path='game-packs/'+name;
  const code=await read(path);
  assert.match(code,/PocketOddities\.register\(/,'Pack must register games');
  assert.ok(html.includes('./'+path),'Pack not loaded in index.html: '+path);
  registered+=(code.match(/PocketOddities\.register\(/g)||[]).length;
}
const builtIn=(engine.match(/\bdefine\(\{/g)||[]).length;
const count=builtIn+registered;
const fallbackCountMarkup=[
  `<title>Pocket Oddities · ${count} Mini-Games</title>`,
  `id="game-count-tagline">${count} tiny strange worlds`,
  `id="hero-count">${count}</span> games.`,
  `id="hero-game-count">✦ ${count} playable games`,
  `id="completion">0 / ${count} beaten`,
  `id="all-filter">All ${count}`
];
assert.ok(fallbackCountMarkup.every(markup=>html.includes(markup)),'Static launcher fallback counts must match the registered game catalog');
assert.ok(count>=21,'Expected 20 original games + the expansion');
assert.ok(css.includes('.game-search'));
assert.ok(worker.includes('CACHE='));
await access(new URL('../assets/icon.svg',import.meta.url));
console.log('Verified '+count+' game definitions ('+builtIn+' original, '+registered+' expansion) and web assets.');
