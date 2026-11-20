import {test,expect} from '@playwright/test';

test('Ink Tide clears three sheets, fails on move limit, and restarts on a mobile screen',async ({page})=>{
  await page.setViewportSize({width:360,height:740});
  await page.goto('/');
  await page.locator('#game-search').fill('Ink Tide');
  await expect(page.locator('#game-grid .game-card')).toHaveCount(1);
  await page.locator('#game-grid .game-card').first().click();
  await expect(page.locator('#game-title')).toHaveText('Ink Tide');
  const controls=page.locator('#game-controls .control-btn');
  await expect(controls).toHaveCount(4);
  const colors=['CORAL','CYAN','GOLD','LILAC'];
  // Each deterministic diagonal sheet is solved by eight advancing colors.
  for(let round=0;round<3;round++){
    for(let move=1;move<=8;move++){
      await controls.filter({hasText:colors[(round+move)%4]}).click();
    }
  }
  await expect(page.locator('#game-overlay')).toBeVisible();
  await expect(page.locator('#overlay-title')).toHaveText('You did it!');
  await expect(page.locator('#overlay-message')).toContainText('All three ink sheets');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#score')).toHaveText('0');
  for(let move=0;move<12;move++){
    await controls.filter({hasText:move%2?'CORAL':'CYAN'}).click();
  }
  await expect(page.locator('#game-overlay')).toBeVisible();
  await expect(page.locator('#overlay-title')).toHaveText('Round over');
  await expect(page.locator('#overlay-message')).toContainText('Out of ink moves');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#score')).toHaveText('0');
});
