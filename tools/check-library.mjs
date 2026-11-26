import assert from 'node:assert/strict';
import {readFile,readdir,access,writeFile} from 'node:fs/promises';
import {readAutoPacks,withGameCount} from './auto-packs.mjs';
const source=file=>new URL('../'+file,import.meta.url);
const read=file=>readFile(source(file),'utf8');
const sync=process.argv[2]==='--sync';
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
const autoPacks=readAutoPacks(source('./'));
const automaticNames=new Set(autoPacks.map(pack=>pack.name));
const packPaths=(await readdir(source('game-packs/')))
  .filter(name=>name.endsWith('.js')&&!automaticNames.has(name))
  .map(name=>'game-packs/'+name)
  .sort();
const launcherPacks=[...html.matchAll(/<script\b[^>]*\bsrc=["']\.\/(game-packs\/[^"']+\.js)["'][^>]*>/g)]
  .map(match=>match[1]);
assert.equal(new Set(launcherPacks).size,launcherPacks.length,'Duplicate game pack script in index.html');
assert.deepEqual([...launcherPacks].sort(),packPaths,'Launcher scripts must match the files in game-packs/');

let registered=0;
for(const path of launcherPacks){
  const code=await read(path);
  assert.match(code,/PocketOddities\.register\(/,'Pack must register a game: '+path);
  registered+=(code.match(/PocketOddities\.register\(/g)||[]).length;
}
const builtIn=(engine.match(/\bdefine\(\{/g)||[]).length;
const count=builtIn+registered;
const syncedHtml=withGameCount(html,count);

const precachePattern=/const PRECACHE=(\[[^\n]*\]);/;
const precache=worker.match(precachePattern);
assert.ok(precache,'Missing offline precache list');
const assets=[...precache[1].matchAll(/['"]([^'"]+)['"]/g)].map(match=>match[1]);
const offlinePacks=assets.filter(path=>path.startsWith('./game-packs/'));
const expectedPacks=launcherPacks.map(path=>'./'+path);
const packsChanged=JSON.stringify([...offlinePacks].sort())!==JSON.stringify([...expectedPacks].sort());
let syncedWorker=worker;
if(packsChanged&&sync){
  const coreAssets=assets.filter(path=>!path.startsWith('./game-packs/'));
  const updatedAssets=[...coreAssets,...expectedPacks].map(asset=>"'"+asset+"'").join(',');
  const versionPattern=/(const CACHE=CACHE_PREFIX\+')([0-9]+)(';)/;
  assert.match(worker,versionPattern,'Missing offline cache version');
  syncedWorker=worker.replace(precachePattern,'const PRECACHE=['+updatedAssets+'];')
    .replace(versionPattern,(_,before,version,after)=>before+(Number(version)+1)+after);
}

if(!sync){
  assert.equal(html,syncedHtml,'Static launcher fallback counts are stale. Run npm run sync:catalog.');
  assert.ok(!packsChanged,'Offline game packs are out of sync. Run npm run sync:catalog.');
}
assert.ok(count>=21,'Expected 20 original games + the expansion');
assert.ok(css.includes('.game-search'));
assert.ok(worker.includes('CACHE='));
await access(new URL('../assets/icon.svg',import.meta.url));
if(sync){
  if(syncedHtml!==html)await writeFile(source('index.html'),syncedHtml);
  if(syncedWorker!==worker)await writeFile(source('sw.js'),syncedWorker);
}
console.log('Verified '+(count+autoPacks.length)+' game definitions ('+builtIn+' original, '+(registered+autoPacks.length)+' expansion) and web assets.');
