import {test,expect} from '@playwright/test';
import {readFileSync,readdirSync} from 'node:fs';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const core=readFileSync(new URL('games.js',root),'utf8');
const listMatch=core.match(/const info=\[([\s\S]*?)\];\s*const games=/);
if(!listMatch)throw new Error('Cannot find the built-in game catalog');
const builtIn=vm.runInNewContext('['+listMatch[1]+']',{}, {timeout:1000}).map(entry=>entry[0]);
const expansions=[];
for(const file of readdirSync(new URL('game-packs/',root)).filter(p=>p.endsWith('.js'))){
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
test('winning, local high score, and restart work for a strategy game',async ({page})=>{
  const errors=collectErrors(page);
  await ready(page);
  await page.getByRole('button',{name:/One Minute Villain/}).click();
  const glitch=page.locator('#game-controls .control-btn').filter({hasText:'GLITCH'});
  await expect(glitch).toBeVisible();
  for(let i=0;i<5;i++){
    if(await page.locator('#game-overlay').isVisible())break;
    await glitch.click();
  }
  await expect(page.locator('#game-overlay')).toBeVisible();
  await expect(page.locator('#overlay-title')).toHaveText('You did it!');
  await expect(page.locator('#score')).not.toHaveText('0');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#score')).toHaveText('0');
  await expect(page.locator('#best')).not.toHaveText('0');
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
