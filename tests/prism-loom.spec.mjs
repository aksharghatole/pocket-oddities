import {test,expect} from '@playwright/test';
// Minimum-move equivalent phases prevent a solved prefix from spilling taps into the next round.
const patterns=[
  {r:[1,0,1,0],c:[0,1,0,1]},
  {r:[0,1,2,0],c:[0,1,2,0]},
  {r:[0,2,0,1],c:[1,2,0,1]}
];
async function launch(page){
  await page.goto('/');
  await page.getByRole('searchbox',{name:'Search games'}).fill('Prism Loom');
  await page.getByRole('button',{name:'Play Prism Loom'}).click();
  await expect(page.locator('#game-title')).toHaveText('Prism Loom');
}
async function spool(page,axis,i){
  const arena=page.locator('#arena');
  await arena.scrollIntoViewIfNeeded();
  const b=await arena.boundingBox();
  expect(b).toBeTruthy();
  const x=axis==='row'?45:103+i*54,y=axis==='row'?217+i*54:160;
  await page.touchscreen.tap(b.x+x*b.width/360,b.y+y*b.height/450);
}
test('Prism Loom solves all three patterns with touch',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await launch(page);
  for(let p=0;p<patterns.length;p++){
    for(const [axis,values] of [['row',patterns[p].r],['col',patterns[p].c]]){
      for(let i=0;i<4;i++)for(let j=0;j<values[i];j++){
        await spool(page,axis,i);
        await page.waitForTimeout(80);
      }
    }
    if(p<2)await expect(page.locator('#level-pill')).toContainText(String(p+2).padStart(2,'0'));
  }
  await expect(page.locator('#overlay-title')).toHaveText('You did it!');
  await expect(page.locator('#game-overlay')).toBeVisible();
  await expect(page.locator('#overlay-message')).toContainText('Three prism patterns');
  expect(Number(await page.locator('#score').textContent())).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
test('Prism Loom exhausts its move budget and restarts',async({page})=>{
  await launch(page);
  for(let i=0;i<9;i++)await spool(page,'row',0);
  await expect(page.locator('#game-overlay')).toBeVisible();
  await expect(page.locator('#overlay-title')).toHaveText('Round over');
  await expect(page.locator('#overlay-message')).toContainText('ran out of moves');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#score')).toHaveText('0');
  await spool(page,'col',1);
  await expect(page.locator('#game-overlay')).toBeHidden();
});
