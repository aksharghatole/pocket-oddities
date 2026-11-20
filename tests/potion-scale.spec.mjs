import {test,expect} from '@playwright/test';

test('Potion Scale completes three recipes and restarts on a mobile screen',async ({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:360,height:740});
  await page.goto('/');
  await page.locator('#game-search').fill('Potion Scale');
  await expect(page.locator('#game-grid .game-card')).toHaveCount(1);
  await page.locator('#game-grid .game-card').click();
  await expect(page.locator('#game-title')).toHaveText('Potion Scale');
  const press=async name=>page.locator('#game-controls .control-btn').filter({hasText:name}).click();
  await press('+5 drops');await press('+1 drop');await press('+1 drop');
  await press('+5 drops');await press('+5 drops');await press('+1 drop');
  await press('+5 drops');await press('+5 drops');await press('+3 drops');await press('+1 drop');
  await expect(page.locator('#game-overlay')).toBeVisible();
  await expect(page.locator('#overlay-title')).toHaveText('You did it!');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#score')).toHaveText('0');
  expect(errors).toEqual([]);
});

test('Potion Scale fails after three overflows and supports restart',async ({page})=>{
  await page.setViewportSize({width:360,height:740});
  await page.goto('/');
  await page.locator('#game-search').fill('Potion Scale');
  await page.locator('#game-grid .game-card').click();
  const five=page.locator('#game-controls .control-btn').filter({hasText:'+5 drops'});
  await five.click();await five.click();await five.click();await five.click();
  await expect(page.locator('#game-overlay')).toBeVisible();
  await expect(page.locator('#overlay-title')).toHaveText('Round over');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
});
