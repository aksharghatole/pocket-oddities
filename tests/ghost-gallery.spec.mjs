import {test,expect} from '@playwright/test';

test('Ghost Gallery wins, fails and restarts through compact-screen touch input',async ({page})=>{
  // Target room 0 and visitor room 1 stay fixed; freeze the clock for deterministic play.
  await page.addInitScript(()=>{
    Math.random=()=>0;
    window.requestAnimationFrame=()=>0;
  });
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width:360,height:740});
  await page.goto('/');
  await page.locator('#game-search').fill('Ghost Gallery');
  await expect(page.locator('#game-grid .game-card')).toHaveCount(1);
  await page.locator('#game-grid .game-card').first().click();
  await expect(page.locator('#game-title')).toHaveText('Ghost Gallery');

  const canvas=page.locator('#arena');
  async function tapRoom(index){
    const box=await canvas.boundingBox();
    expect(box).toBeTruthy();
    const x=30+(index%3)*100+50;
    const y=111+Math.floor(index/3)*100+50;
    await page.touchscreen.tap(box.x+x*box.width/360,box.y+y*box.height/450);
  }

  for(let portrait=0;portrait<10;portrait++)await tapRoom(0);
  await expect(page.locator('#game-overlay')).toBeVisible();
  await expect(page.locator('#overlay-title')).toHaveText('You did it!');
  await expect(page.locator('#overlay-message')).toContainText('Ten ghost portraits captured');

  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  for(let mistake=0;mistake<4;mistake++)await tapRoom(1);
  await expect(page.locator('#game-overlay')).toBeVisible();
  await expect(page.locator('#overlay-title')).toHaveText('Round over');
  await expect(page.locator('#overlay-message')).toContainText('four mistakes');

  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#score')).toHaveText('0');
  expect(errors).toEqual([]);
});
