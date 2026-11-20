import {test,expect} from '@playwright/test';

const maps=[
  [[76,164],[176,113],[284,170],[243,289],[106,314]],
  [[83,123],[247,119],[295,216],[201,312],[75,279],[157,208]],
  [[64,157],[155,103],[273,136],[293,253],[198,329],[91,317],[180,215]]
];

async function launch(page){
  await page.goto('/');
  await page.getByRole('button',{name:/Star Cartographer/}).first().click();
  await expect(page.locator('#game-title')).toHaveText('Star Cartographer');
}
async function tapStar(page,[x,y]){
  const box=await page.locator('#arena').boundingBox();
  if(!box)throw new Error('Star Cartographer canvas did not render');
  await page.touchscreen.tap(box.x+box.width*x/360,box.y+box.height*y/450);
}

test('Star Cartographer completes all three constellations in order',async ({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await launch(page);
  for(const [level,points] of maps.entries()){
    await expect(page.locator('#level-pill')).toHaveText('ROUND '+String(level+1).padStart(2,'0'));
    for(const point of points)await tapStar(page,point);
  }
  await expect(page.locator('#overlay-title')).toHaveText('You did it!');
  await expect(page.locator('#score')).toHaveText('775');
  expect(errors).toEqual([]);
});

test('Star Cartographer ends after three wrong stars and retry resets progress',async ({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await launch(page);
  for(let mistake=0;mistake<3;mistake++)await tapStar(page,maps[0][1]);
  await expect(page.locator('#overlay-title')).toHaveText('Round over');
  await expect(page.locator('#score')).toHaveText('0');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#level-pill')).toHaveText('ROUND 01');
  await expect(page.locator('#score')).toHaveText('0');
  await tapStar(page,maps[0][0]);
  await expect(page.locator('#score')).toHaveText('25');
  expect(errors).toEqual([]);
});
