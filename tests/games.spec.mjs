import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const core=readFileSync(new URL('games.js',root),'utf8');
const listMatch=core.match(/const info=\[([\s\S]*?)\];\s*const games=/);
if(!listMatch)throw new Error('Cannot find the built-in game catalog');
const builtIn=vm.runInNewContext('['+listMatch[1]+']',{}, {timeout:1000}).map(entry=>entry[0]);
const indexHtml=readFileSync(new URL('index.html',root),'utf8');
const extensionFiles=[...indexHtml.matchAll(/<script[^>]+src=["']\.\/game-packs\/([^"']+\.js)["']/g)].map(match=>match[1]);
const expansions=[];
for(const file of extensionFiles){
  const content=readFileSync(new URL('game-packs/'+file,root),'utf8');
  const names=content.matchAll(/PocketOddities\.register\(\s*\[\s*(['"])(.*?)\1/g);
  for(const m of names)expansions.push(m[2]);
}
const titles=[...builtIn,...expansions];
if(titles.length<21)throw new Error('Catalog unexpectedly has fewer than 21 games');
if(new Set(titles).size!==titles.length)throw new Error('Duplicate game titles');

function collectErrors(page){
  const errors=[];
  page.on('pageerror',e=>errors.push('Uncaught JS: '+e.message));
  page.on('console',message=>{
    if(message.type()==='error')errors.push('Console: '+message.text());
  });
  return errors;
}
async function ready(page){
  await page.goto('/');
  await expect(page.locator('#game-grid .game-card')).toHaveCount(titles.length);
}
test('the library shows all registered games with a dynamic count',async ({page})=>{
  const errors=collectErrors(page);
  await ready(page);
  await expect(page.locator('#hero-count')).toHaveText(String(titles.length));
  await expect(page.locator('#all-filter')).toContainText(String(titles.length));
  await expect(page.locator('#completion')).toContainText('/ '+titles.length+' beaten');
  await expect(page.locator('#game-grid .game-card')).toHaveCount(titles.length);
  expect(errors).toEqual([]);
});
test('Moon Mail Sorter is registered and launches with touch-sized controls',async ({page})=>{
  const errors=collectErrors(page);
  await ready(page);
  await expect(page.locator('#game-grid')).toContainText('Moon Mail Sorter');
  await page.getByRole('button',{name:/Moon Mail Sorter/}).click();
  await expect(page.locator('#game-title')).toHaveText('Moon Mail Sorter');
  await expect(page.locator('#game-controls .control-btn')).toHaveCount(3);
  await page.locator('#game-controls .control-btn').first().click();
  await expect(page.locator('#play-screen')).toBeVisible();
  expect(errors).toEqual([]);
});
test('progress backup exports local records and merges an import without replacing progress',async ({page})=>{
  const initialDate='2026-11-19';
  await page.addInitScript(date=>{
    if(localStorage.getItem('__backup-test-seeded'))return;
    localStorage.setItem('__backup-test-seeded','yes');
    localStorage.setItem('oddities-wins',JSON.stringify({0:true}));
    localStorage.setItem('oddities-highs',JSON.stringify({0:7}));
    localStorage.setItem('oddities-favorites',JSON.stringify(['The Button Has Feelings']));
    localStorage.setItem('oddities-recent',JSON.stringify(['The Button Has Feelings']));
    localStorage.setItem('oddities-fastest-clears',JSON.stringify({'One Minute Villain':{seconds:40,score:5,date}}));
    localStorage.setItem('oddities-daily-records',JSON.stringify({[date]:{date,seconds:80,score:9,attempts:1,completed:true,splits:[]}}));
    localStorage.setItem('oddities-cabinet-v1',JSON.stringify({plays:{'The Button Has Feelings':2},earned:{},found:{},theme:'default',bestStreak:2,completedRounds:4}));
  },initialDate);
  await ready(page);
  await page.locator('#cabinet-trigger').click();
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#progress-export').click();
  const download=await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^pocket-oddities-progress-\d{4}-\d{2}-\d{2}\.json$/);
  const exported=JSON.parse(readFileSync(await download.path(),'utf8'));
  expect(exported.format).toBe('pocket-oddities-progress');
  expect(exported.data['oddities-wins']['0']).toBe(true);
  const backup={format:'pocket-oddities-progress',version:1,data:{
    'oddities-wins':{1:true},
    'oddities-highs':{0:12,1:6},
    'oddities-favorites':['Moon Mail Sorter'],
    'oddities-recent':['Moon Mail Sorter'],
    'oddities-fastest-clears':{'One Minute Villain':{seconds:25,score:10,date:'2026-11-20'}},
    'oddities-daily-records':{[initialDate]:{date:initialDate,seconds:70,score:5,attempts:2,completed:true,splits:[]}},
    'oddities-cabinet-v1':{plays:{'The Button Has Feelings':5,'Moon Mail Sorter':1},bestStreak:4,completedRounds:9}
  }};
  const reloaded=page.waitForNavigation({waitUntil:'load'});
  await page.locator('#progress-import-file').setInputFiles({name:'progress.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await reloaded;
  const values=await page.evaluate(()=>({
    wins:JSON.parse(localStorage.getItem('oddities-wins')),
    highs:JSON.parse(localStorage.getItem('oddities-highs')),
    favorites:JSON.parse(localStorage.getItem('oddities-favorites')),
    fastest:JSON.parse(localStorage.getItem('oddities-fastest-clears')),
    daily:JSON.parse(localStorage.getItem('oddities-daily-records'))['2026-11-19'],
    cabinet:JSON.parse(localStorage.getItem('oddities-cabinet-v1'))
  }));
  expect(values.wins).toMatchObject({'0':true,'1':true});
  expect(values.highs).toMatchObject({'0':12,'1':6});
  expect(values.favorites).toEqual(['The Button Has Feelings','Moon Mail Sorter']);
  expect(values.fastest['One Minute Villain'].seconds).toBe(25);
  expect(values.daily).toMatchObject({seconds:70,score:9,attempts:2});
  expect(values.cabinet.plays).toMatchObject({'The Button Has Feelings':5,'Moon Mail Sorter':1});
  expect(values.cabinet.bestStreak).toBe(4);
  expect(values.cabinet.completedRounds).toBe(9);
});
test('vibration is an optional independent setting that persists',async ({page})=>{
  await page.addInitScript(()=>{window.vibrationCalls=[];Object.defineProperty(navigator,'vibrate',{configurable:true,value:pattern=>{window.vibrationCalls.push(pattern);return true}})});
  await ready(page);
  const vibration=page.locator('#haptic-toggle');
  const sound=page.locator('#sound-toggle');
  await expect(vibration).toHaveAttribute('aria-pressed','false');
  await expect(sound).toHaveAttribute('aria-pressed','false');
  await vibration.click();
  await expect(vibration).toHaveAttribute('aria-pressed','true');
  expect(await page.evaluate(()=>localStorage.getItem('oddities-haptics'))).toBe('true');
  expect(await page.evaluate(()=>localStorage.getItem('oddities-sound'))).toBeNull();
  expect(await page.evaluate(()=>window.vibrationCalls.length)).toBe(1);
  await page.reload();
  await expect(page.locator('#haptic-toggle')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed','false');
  await sound.click();
  await expect(page.locator('#sound-toggle')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#haptic-toggle')).toHaveAttribute('aria-pressed','true');
});
test('Game of the Day is stable and Surprise Me avoids recent games',async ({page})=>{
  await page.addInitScript(names=>localStorage.setItem('oddities-recent',JSON.stringify(names)),titles.slice(0,-1));
  await ready(page);
  const featured=page.locator('#game-of-day');
  const featuredTitle=await page.locator('#game-of-day-title').textContent();
  const featuredIndex=await featured.getAttribute('data-game-index');
  await page.reload();
  await expect(page.locator('#game-of-day-title')).toHaveText(featuredTitle);
  await expect(page.locator('#game-of-day')).toHaveAttribute('data-game-index',featuredIndex);
  await page.locator('#surprise-me').click();
  await expect(page.locator('#game-title')).toHaveText(titles[titles.length-1]);
  await page.locator('#back-btn').click();
  await page.locator('#game-of-day-play').click();
  await expect(page.locator('#game-title')).toHaveText(featuredTitle);
});
test('Moon Mail Sorter connects a new hidden thread and achievement',async ({page})=>{
  const names=['Moon Mail Sorter','The Game Is Lying','One Finger Orchestra'];
  const wins=Object.fromEntries(names.map(name=>[titles.indexOf(name),true]));
  expect(Object.values(wins)).toHaveLength(3);
  await page.addInitScript(value=>localStorage.setItem('oddities-wins',JSON.stringify(value)),wins);
  await ready(page);
  await page.locator('#cabinet-trigger').click();
  const thread=page.locator('[data-thread="lunar-mail"]');
  await expect(thread).toHaveClass(/completed/);
  await expect(thread).toContainText('Moonpost');
  await expect(page.locator('[data-achievement="lunar-courier"]')).toHaveClass(/earned/);
  await expect(page.locator('#cabinet-subtitle')).toContainText('1 / 5 threads connected');
});
test('Oddity Passport displays a stamp for every game and reflects saved clears',async ({page})=>{
  await page.addInitScript(()=>localStorage.setItem('oddities-wins',JSON.stringify({0:true,1:true})));
  await ready(page);
  await page.locator('#cabinet-trigger').click();
  const stamps=page.locator('#cabinet-passport .passport-stamp');
  await expect(stamps).toHaveCount(titles.length);
  await expect(stamps.nth(0)).toHaveClass(/collected/);
  await expect(stamps.nth(1)).toHaveClass(/collected/);
  await expect(stamps.nth(2)).not.toHaveClass(/collected/);
  await expect(page.locator('#cabinet-passport-count')).toHaveText('2 / '+titles.length+' stamps collected');
});
test('completed and unfinished shelves follow saved game progress',async ({page})=>{
  await page.addInitScript(()=>localStorage.setItem('oddities-wins',JSON.stringify({0:true,1:true})));
  await ready(page);
  await page.locator('[data-view="completed"]').click();
  const completed=page.locator('#game-grid .game-card');
  await expect(completed).toHaveCount(2);
  await expect(completed.nth(0).locator('h3')).toHaveText(titles[0]);
  await expect(completed.nth(1).locator('h3')).toHaveText(titles[1]);
  await expect(page.locator('#completion')).toHaveText('2 completed games');
  await page.locator('[data-view="unfinished"]').click();
  const unfinished=page.locator('#game-grid .game-card');
  await expect(unfinished).toHaveCount(titles.length-2);
  await expect(unfinished.filter({has:page.locator('h3',{hasText:titles[0]})})).toHaveCount(0);
  await expect(page.locator('#completion')).toHaveText((titles.length-2)+' games to discover');
});
test('Daily Rush offers a stable five-game route and records a completed local run',async ({page})=>{
  const errors=collectErrors(page);
  await ready(page);
  await page.locator('[data-view="daily"]').click();
  const route=page.locator('.daily-rush-route li');
  await expect(route).toHaveCount(5);
  const titles=await route.allTextContents();
  expect(new Set(titles).size).toBe(5);
  const indexes=await route.evaluateAll(items=>items.map(item=>Number(item.dataset.gameIndex)));
  await page.reload();
  await page.locator('[data-view="daily"]').click();
  await expect(page.locator('.daily-rush-route li')).toHaveText(titles);
  await page.locator('#daily-rush-start').click();
  await expect(page.locator('#game-title')).toHaveText(titles[0].replace(/^\d+\s*/, '').trim());
  for(let position=0;position<indexes.length;position++){
    await page.evaluate(({index,won})=>{document.querySelector('#game-overlay').classList.remove('hidden');window.dispatchEvent(new CustomEvent('oddities:game-finish',{detail:{index,won,score:5,elapsed:10}}))},{index:indexes[position],won:true});
    if(position<indexes.length-1){
      await expect(page.locator('#rush-next')).toBeVisible();
      if(position===0){
        await expect(page.locator('#game-title')).toHaveText(titles[position+1].replace(/^\d+\s*/, '').trim(),{timeout:5000});
      }else{
        await page.locator('#rush-next').click();
        await expect(page.locator('#game-title')).toHaveText(titles[position+1].replace(/^\d+\s*/, '').trim());
      }
    }
  }
  await expect(page.locator('#overlay-title')).toHaveText('Daily Rush complete!');
  await page.locator('#overlay-home').click();
  await page.locator('[data-view="daily"]').click();
  await expect(page.locator('.daily-rush-stats')).toContainText('50.0s');
  await expect(page.locator('.daily-rush-stats')).toContainText('1');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('oddities-daily-records')||'{}'));
  expect(saved[Object.keys(saved)[0]].splits).toHaveLength(5);
  expect(errors).toEqual([]);
});
test('Quick Play, recent games, and favorites are easy to reach and persist',async ({page})=>{
  const errors=collectErrors(page);
  await ready(page);
  await page.locator('[data-view="quick"]').click();
  const quickCount=await page.locator('#game-grid .game-card').count();
  expect(quickCount).toBeGreaterThan(0);
  await page.locator('#game-grid .game-launch').first().click();
  const played=await page.locator('#game-title').textContent();
  await page.locator('#back-btn').click();
  await page.locator('[data-view="recent"]').click();
  await expect(page.locator('#game-grid .game-card')).toHaveCount(1);
  await expect(page.locator('#game-grid .game-card')).toContainText(played);
  await page.locator('[data-view="discover"]').click();
  const card=page.locator('#game-grid .game-card').filter({has:page.locator('h3',{hasText:played})});
  await card.locator('.favorite-toggle').click();
  await page.locator('[data-view="favorites"]').click();
  await expect(page.locator('#game-grid .game-card')).toHaveCount(1);
  await expect(page.locator('#game-grid .game-card')).toContainText(played);
  await page.reload();
  await page.locator('[data-view="favorites"]').click();
  await expect(page.locator('#game-grid .game-card')).toHaveCount(1);
  expect(errors).toEqual([]);
});
test('search, categories, and no-results state work',async ({page})=>{
  const errors=collectErrors(page);
  await ready(page);
  await page.locator('#game-search').fill('Echo Tiles');
  await expect(page.locator('#game-grid .game-card')).toHaveCount(1);
  await expect(page.locator('#game-grid .game-card').first()).toContainText('Echo Tiles');
  await page.locator('#game-search').fill('xxxxxxxxxx-not-real');
  await expect(page.locator('.no-results')).toBeVisible();
  await page.locator('#game-search').fill('');
  await page.locator('[data-filter="strategy"]').click();
  const count=await page.locator('#game-grid .game-card').count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(titles.length);
  await page.locator('[data-filter="all"]').click();
  await expect(page.locator('#game-grid .game-card')).toHaveCount(titles.length);
  expect(errors).toEqual([]);
});
for(let index=0;index<titles.length;index++){
  const title=titles[index];
  test('game '+String(index+1).padStart(2,'0')+': '+title+' opens, renders, accepts touch, and returns home',async ({page})=>{
    const errors=collectErrors(page);
    await ready(page);
    await page.locator('#game-grid .game-card').nth(index).click();
    await expect(page.locator('#game-title')).toHaveText(title);
    await expect(page.locator('#arena')).toBeVisible();
    await expect(page.locator('#play-screen')).toBeVisible();
    await page.waitForTimeout(160);
    // Exercise the actual touch/pointer event route in the canvas game engine.
    const canvas=page.locator('#arena');
    await canvas.scrollIntoViewIfNeeded();
    const box=await canvas.boundingBox();
    expect(box).not.toBeNull();
    const x=box.x+box.width*0.5,y=box.y+box.height*0.48;
    await page.touchscreen.tap(x,y);
    await page.waitForTimeout(80);
    const actionButton=page.locator('#game-controls button').first();
    if(await actionButton.count()){
      if(await actionButton.isVisible())await actionButton.click();
    }
    await page.waitForTimeout(150);
    expect(errors,'Runtime errors in '+title).toEqual([]);
    await page.locator('#back-btn').click();
    await expect(page.locator('#game-grid .game-card')).toHaveCount(titles.length);
    await expect(page.locator('#play-screen')).toBeHidden();
  });
}
test('Speedruns lists the fastest successful personal clears first',async ({page})=>{
  await page.addInitScript(()=>localStorage.setItem('oddities-fastest-clears',JSON.stringify({
    'The Button Has Feelings':{seconds:12.3,score:5,date:'2026-11-20'},
    'Circuit Garden':{seconds:40.5,score:25,date:'2026-11-20'}
  })));
  await ready(page);
  await page.locator('[data-view="speedrun"]').click();
  const cards=page.locator('#game-grid .game-card');
  await expect(cards).toHaveCount(titles.length);
  await expect(cards.nth(0).locator('h3')).toHaveText('The Button Has Feelings');
  await expect(cards.nth(0)).toContainText('12.3s');
  await expect(cards.nth(1).locator('h3')).toHaveText('Circuit Garden');
  await expect(page.locator('#completion')).toHaveText('2 personal bests');
});
test('winning, local high score, and restart work for a strategy game',async ({page})=>{
  const errors=collectErrors(page);
  await ready(page);
  await page.getByRole('button',{name:/One Minute Villain/}).click();
  await page.waitForTimeout(120);
  const glitch=page.locator('#game-controls .control-btn').filter({hasText:'GLITCH'});
  await expect(glitch).toBeVisible();
  for(let i=0;i<5;i++){
    if(await page.locator('#game-overlay').isVisible())break;
    await glitch.click();
  }
  await expect(page.locator('#game-overlay')).toBeVisible();
  await expect(page.locator('#overlay-title')).toHaveText('You did it!');
  await expect(page.locator('#score')).not.toHaveText('0');
  const clears=await page.evaluate(()=>JSON.parse(localStorage.getItem('oddities-fastest-clears')||'{}'));
  expect(clears['One Minute Villain'].seconds).toBeGreaterThan(0);
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#score')).toHaveText('0');
  await expect(page.locator('#best')).not.toHaveText('0');
  const clear=await page.evaluate(()=>JSON.parse(localStorage.getItem('oddities-fastest-clears'))?.['One Minute Villain']);
  expect(clear?.seconds).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
test('losing after eight turns shows a retry path',async ({page})=>{
  const errors=collectErrors(page);
  await ready(page);
  await page.getByRole('button',{name:/One Minute Villain/}).click();
  const decoy=page.locator('#game-controls .control-btn').filter({hasText:'DECOY'});
  for(let turn=0;turn<8;turn++)await decoy.click();
  await expect(page.locator('#game-overlay')).toBeVisible();
  await expect(page.locator('#overlay-title')).toHaveText('Round over');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  expect(errors).toEqual([]);
});
