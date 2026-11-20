import {test,expect} from '@playwright/test';

test('Orbit Locksmith launches, counts misses, fails and restarts on touch screens',async ({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await page.locator('#game-search').fill('Orbit Locksmith');
  await expect(page.locator('#game-grid .game-card')).toHaveCount(1);
  await page.locator('#game-grid .game-card').first().click();
  await expect(page.locator('#game-title')).toHaveText('Orbit Locksmith');
  await expect(page.locator('#game-controls button')).toContainText('LOCK');
  // Initial needle is at -PI/2, while the gate is offset: repeated immediate
  // attempts are misses. This also exercises the mobile canvas touch handler.
  const canvas=page.locator('#arena');
  const box=await canvas.boundingBox();
  expect(box).toBeTruthy();
  for(let i=0;i<4;i++){
    if(await page.locator('#game-overlay').isVisible())break;
    await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
  }
  await expect(page.locator('#overlay-title')).toHaveText('Round over');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#score')).toHaveText('0');
  expect(errors).toEqual([]);
});
