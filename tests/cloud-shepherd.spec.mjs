import {test,expect} from '@playwright/test';

async function start(page){
  await page.goto('/');
  await page.getByRole('button',{name:/Cloud Shepherd/}).first().click();
  await expect(page.locator('#game-title')).toHaveText('Cloud Shepherd');
}
async function selectLane(page,lane){
  const box=await page.locator('#arena').boundingBox();
  await page.locator('#arena').click({position:{x:(48+lane*66)*box.width/360,y:300*box.height/450}});
}
async function water(page,lane){
  await selectLane(page,lane);
  await page.locator('#game-controls button').filter({hasText:'RAIN'}).click();
  await page.waitForTimeout(520);
}

test('Cloud Shepherd waters three gardens and wins on a compact touchscreen',async ({page})=>{
  await start(page);
  await expect(page.locator('#instruction')).toContainText('Tap a garden lane');
  const flowers=[[0,2,4],[1,2,4],[0,3,4]];
  for(let garden=0;garden<flowers.length;garden++){
    for(const lane of flowers[garden]){await water(page,lane);await water(page,lane);}
    if(garden<2)await expect(page.locator('#level-pill')).toHaveText('ROUND 0'+(garden+2));
  }
  await expect(page.locator('#overlay-title')).toHaveText('You win!');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#score')).toHaveText('0');
});

test('Cloud Shepherd ends after three mushroom mistakes and restarts',async ({page})=>{
  await start(page);
  for(let i=0;i<3;i++)await water(page,1);
  await expect(page.locator('#overlay-title')).toHaveText('Round over');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#level-pill')).toHaveText('ROUND 01');
});
