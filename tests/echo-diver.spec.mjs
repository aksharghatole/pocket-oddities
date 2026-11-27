import {test,expect} from '@playwright/test';

const routes=[
  [[0,1],[0,2],[1,2],[2,2],[2,1],[2,2],[3,2],[4,2],[4,3],[3,3],[4,3],[4,4]],
  [[0,1],[0,2],[0,3],[0,2],[0,1],[1,1],[2,1],[3,1],[4,1],[4,2],[4,3],[4,4]],
  [[1,0],[1,1],[1,2],[2,2],[3,2],[3,3],[3,4],[4,4]]
];

async function launch(page){
  await page.goto('/');
  await page.getByRole('searchbox',{name:'Search games'}).fill('Echo Diver');
  await page.getByRole('button',{name:'Play Echo Diver'}).click();
  await expect(page.locator('#game-title')).toHaveText('Echo Diver');
}
async function tile(page,x,y){
  const box=await page.locator('#arena').boundingBox();
  expect(box).toBeTruthy();
  await page.touchscreen.tap(box.x+(60+x*60)*box.width/360,box.y+(145+y*60)*box.height/450);
}

test('Echo Diver clears three dives via touch and keeps a score',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await launch(page);
  await expect(page.locator('#instruction')).toContainText('Collect both glowing pearls');
  await page.getByRole('button',{name:/SONAR PING/}).click();
  for(let i=0;i<routes.length;i++){
    for(const [x,y] of routes[i])await tile(page,x,y);
    if(i<routes.length-1)await expect(page.locator('#level-pill')).toContainText(String(i+2).padStart(2,'0'));
  }
  await expect(page.locator('#game-overlay')).toBeVisible();
  await expect(page.locator('#overlay-title')).toHaveText('You did it!');
  await expect(page.locator('#overlay-message')).toContainText('Three dives complete');
  expect(Number(await page.locator('#score').textContent())).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('Echo Diver handles reef collision, loss and restart',async({page})=>{
  await launch(page);
  for(let i=0;i<3;i++)await tile(page,1,0);
  await expect(page.locator('#game-overlay')).toBeVisible();
  await expect(page.locator('#overlay-title')).toHaveText('Round over');
  await expect(page.locator('#overlay-message')).toContainText('reef broke your hull');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#score')).toHaveText('0');
  await tile(page,0,1);
  await expect(page.locator('#game-overlay')).toBeHidden();
});
