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
test('Daily Rush offers a stable three-game route and records a completed local run',async ({page})=>{
  const errors=collectErrors(page);
  await ready(page);
  await page.locator('[data-view="daily"]').click();
  const route=page.locator('.daily-rush-route li');
  await expect(route).toHaveCount(3);
  const titles=await route.allTextContents();
  expect(new Set(titles).size).toBe(3);
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
      await page.locator('#rush-next').click();
      await expect(page.locator('#game-title')).toHaveText(titles[position+1].replace(/^\d+\s*/, '').trim());
    }
  }
  await expect(page.locator('#overlay-title')).toHaveText('Daily Rush complete!');
  await page.locator('#overlay-home').click();
  await page.locator('[data-view="daily"]').click();
  await expect(page.locator('.daily-rush-stats')).toContainText('30.0s');
  await expect(page.locator('.daily-rush-stats')).toContainText('1');
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
