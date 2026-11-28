import {test,expect} from '@playwright/test';
async function launch(page){
  await page.goto('/');
  await page.getByRole('searchbox',{name:'Search games'}).fill('Sunbeam Surveyor');
  await page.getByRole('button',{name:'Play Sunbeam Surveyor'}).click();
  await expect(page.locator('#game-title')).toHaveText('Sunbeam Surveyor');
}
async function mirror(page,r,c){
  const arena=page.locator('#arena');
  await arena.scrollIntoViewIfNeeded();
  const b=await arena.boundingBox();
  expect(b).toBeTruthy();
  const x=79+50*c,y=148+50*r;
  await page.touchscreen.tap(b.x+x*b.width/360,b.y+y*b.height/450);
}
async function fire(page){await page.getByRole('button',{name:'FIRE BEAM'}).click();}
test('Sunbeam Surveyor guides the beam through all three surveys',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await launch(page);
  await mirror(page,1,1);await fire(page);
  await expect(page.locator('#level-pill')).toContainText('02');
  await mirror(page,0,2);await mirror(page,4,2);await fire(page);
  await expect(page.locator('#level-pill')).toContainText('03');
  await mirror(page,4,1);await mirror(page,1,1);await fire(page);
  await expect(page.locator('#overlay-title')).toHaveText('You did it!');
  await expect(page.locator('#overlay-message')).toContainText('Every survey carried sunlight');
  expect(errors).toEqual([]);
});
test('Sunbeam Surveyor ends after three missed beams and can restart',async({page})=>{
  await launch(page);
  await fire(page);await fire(page);await fire(page);
  await expect(page.locator('#overlay-title')).toHaveText('Round over');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#level-pill')).toContainText('01');
});
