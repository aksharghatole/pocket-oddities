import {test,expect} from '@playwright/test';

async function launch(page){
  await page.goto('/');
  await page.getByRole('button',{name:'Play Puddle Painter',exact:true}).click();
  await expect(page.locator('#game-title')).toHaveText('Puddle Painter');
}
async function ink(page,name){await page.locator('#game-controls').getByRole('button',{name,exact:true}).click();}

test('Puddle Painter clears all three mosaics on a mobile screen',async ({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await launch(page);
  for(const name of ['Mint','Gold','Blue'])await ink(page,name);
  await expect(page.locator('#level-pill')).toHaveText('ROUND 02');
  for(const name of ['Mint','Gold','Blue','Pink'])await ink(page,name);
  await expect(page.locator('#level-pill')).toHaveText('ROUND 03');
  for(const name of ['Mint','Gold'])await ink(page,name);
  await expect(page.locator('#overlay-title')).toHaveText('You did it!');
  await expect(page.locator('#score')).toHaveText('720');
  expect(errors).toEqual([]);
});

test('Puddle Painter runs out of moves and can restart',async ({page})=>{
  await launch(page);
  for(const name of ['Mint','Pink','Mint','Pink','Mint','Pink'])await ink(page,name);
  await expect(page.locator('#overlay-title')).toHaveText('Round over');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#level-pill')).toHaveText('ROUND 01');
  await expect(page.locator('#score')).toHaveText('0');
  await ink(page,'Mint');
  await expect(page.locator('#game-overlay')).toBeHidden();
});
