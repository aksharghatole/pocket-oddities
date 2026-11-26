import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readdirSync,readFileSync} from 'node:fs';

export function readAutoPacks(root){
  const directory=new URL('game-packs/',root);
  return readdirSync(directory).filter(name=>name.startsWith('auto-')&&name.endsWith('.js')).sort().map(name=>{
    assert.match(name,/^auto-[a-z0-9]+(?:-[a-z0-9]+)*\.js$/,'Invalid automatic pack filename');
    const code=readFileSync(new URL(name,directory),'utf8');
    assert.equal((code.match(/PocketOddities\.register\(/g)||[]).length,1,name+' must register exactly one game');
    return {name,code,key:'pack:'+name.slice(5,-3)};
  });
}

export function withGameCount(html,count){
  const counts=[
    /(<title>Pocket Oddities · )\d+( Mini-Games<\/title>)/,
    /(id="game-count-tagline">)\d+( tiny strange worlds)/,
    /(id="hero-count">)\d+(<\/span> games\.)/,
    /(id="hero-game-count">✦ )\d+( playable games)/,
    /(id="completion">0 \/ )\d+( beaten)/,
    /(id="all-filter">All )\d+(<\/button>)/
  ];
  for(const markup of counts){
    assert.match(html,markup,'Missing static launcher count: '+markup);
    html=html.replace(markup,(_,before,after)=>before+count+after);
  }
  return html;
}

export function expandAutoPacks(html,worker,packs){
  if(!packs.length)return {html,worker};
  const legacyCount=Number(html.match(/<title>Pocket Oddities · (\d+) Mini-Games<\/title>/)?.[1]);
  assert.ok(legacyCount,'Missing legacy launcher count');
  const anchor='  <script src="./achievements.js" defer></script>';
  assert.ok(html.includes(anchor),'Missing automatic pack insertion point');
  const scripts=packs.map(({name,key})=>`  <script src="./game-packs/${name}" data-progress-key="${key}" defer></script>`);
  html=withGameCount(html,legacyCount+packs.length).replace(anchor,[...scripts,anchor].join('\n'));

  const hash=createHash('sha256');
  for(const {name,code} of packs)hash.update(JSON.stringify([name,code]));
  const version=hash.digest('hex').slice(0,16);
  const cachePattern=/(const CACHE=CACHE_PREFIX\+'[^']+)(';)/;
  const precachePattern=/(const PRECACHE=\[[^\]]+)(\];)/;
  assert.match(worker,cachePattern,'Missing cache version');
  assert.match(worker,precachePattern,'Missing offline precache list');
  worker=worker.replace(cachePattern,(_,start,end)=>start+'-'+version+end)
    .replace(precachePattern,(_,start,end)=>start+packs.map(({name})=>", './game-packs/"+name+"'").join('')+end);
  return {html,worker};
}
