import {test,expect} from '@playwright/test';

const routes=[
  [[1,3],[1,1]],
  [[1,4],[1,0],[3,0],[3,2]],
  [[0,3],[0,1],[2,1],[2,4],[4,4],[4,0]]
];
async function tapMirror(page,c,r){
  const box=await page.locator('#arena').boundingBox();
  if(!box)throw new Error('Missing game canvas');
  await page.touchscreen.tap(box.x+box.width*(46+c*67)/360,box.y+box.height*(113+r*61)/450);
}
async function launch(page){
  await page.goto('/');
  await page.getByRole('button',{name:/Mirror Courier/}).first().click();
  await expect(page.locator('#game-title')).toHaveText('Mirror Courier');
}
test('Mirror Courier completes all chambers with touch input',async ({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await launch(page);
  for(let i=0;i<routes.length;i++){
    await expect(page.locator('#level-pill')).toHaveText('ROUND '+String(i+1).padStart(2,'0'));
    for(const [c,r] of routes[i])await tapMirror(page,c,r);
  }
  await expect(page.locator('#overlay-title')).toHaveText('You did it!');
  await expect(page.locator('#score')).not.toHaveText('0');
  expect(errors).toEqual([]);
});
test('Mirror Courier turn limit fails and restart resets',async ({page})=>{
  await launch(page);
  for(let i=0;i<14;i++)await tapMirror(page,3,3);
  await expect(page.locator('#overlay-title')).toHaveText('Round over');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#level-pill')).toHaveText('ROUND 01');
  await expect(page.locator('#score')).toHaveText('0');
  await tapMirror(page,1,3);
  await expect(page.locator('#game-overlay')).toBeHidden();
});
