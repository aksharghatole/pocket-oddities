import {test,expect} from '@playwright/test';

test('Orbit Locksmith counts misses and restarts on a compact touch screen',async ({page})=>{
  // Keep the opening orbit position fixed so each LOCK tap is predictably outside the gate.
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:360,height:740});
  await page.goto('/');
  await page.locator('#game-search').fill('Orbit Locksmith');
  await expect(page.locator('#game-grid .game-card')).toHaveCount(1);
  await page.locator('#game-grid .game-card').first().click();
  await expect(page.locator('#game-title')).toHaveText('Orbit Locksmith');
  const lock=page.getByRole('button',{name:/LOCK/});
  await expect(lock).toBeVisible();
  for(let miss=0;miss<4;miss++){
    await lock.click();
  }
  await expect(page.locator('#game-overlay')).toBeVisible();
  await expect(page.locator('#overlay-title')).toHaveText('Round over');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#score')).toHaveText('0');
  expect(errors).toEqual([]);
});
