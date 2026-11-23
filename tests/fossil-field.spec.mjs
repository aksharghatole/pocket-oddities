import {test,expect} from '@playwright/test';

test('Fossil Field supports mobile touch, three-site victory, four-crack failure and restart',async ({page})=>{
  // Stable shuffle for deterministic end-to-end coverage: first five are fossils, next four crystals.
  await page.addInitScript(()=>{Math.random=()=>0.5;});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button',{name:'Play Fossil Field',exact:true}).click();
  await expect(page.locator('#game-title')).toHaveText('Fossil Field');
  await expect(page.locator('#instruction')).toContainText('Four broken crystals');
  const canvas=page.locator('#arena');
  async function tapCell(index){
    await canvas.scrollIntoViewIfNeeded();
    const box=await canvas.boundingBox();
    const x=35+(index%5)*58+29,y=93+Math.floor(index/5)*58+29;
    await page.touchscreen.tap(box.x+x*box.width/360,box.y+y*box.height/450);
  }
  for(let site=0;site<3;site++)for(let k=0;k<5;k++)await tapCell(k);
  await expect(page.locator('#game-overlay')).toBeVisible();
  await expect(page.locator('#overlay-title')).toContainText(/win|victory|you did|success/i);
  const won=await page.evaluate(()=>JSON.parse(localStorage.getItem('oddities-wins')||'{}'));
  expect(Object.values(won)).toContain(true);
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  for(let k=5;k<9;k++)await tapCell(k);
  await expect(page.locator('#game-overlay')).toBeVisible();
  await expect(page.locator('#overlay-message')).toContainText('crystals');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  expect(errors).toEqual([]);
});
