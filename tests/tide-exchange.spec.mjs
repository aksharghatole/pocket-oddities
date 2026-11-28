import {test,expect} from '@playwright/test';
async function launch(page){
  await page.goto('/');
  await page.getByRole('searchbox',{name:'Search games'}).fill('Tide Exchange');
  await page.getByRole('button',{name:'Play Tide Exchange'}).click();
  await expect(page.locator('#game-title')).toHaveText('Tide Exchange');
}
async function dock(page,i){
  const b=await page.locator('#arena').boundingBox();
  await page.touchscreen.tap(b.x+(60+80*i)*b.width/360,b.y+240*b.height/450);
}
async function transfer(page,a,b){await dock(page,a);await dock(page,b);}
test('Tide Exchange balances all three harbors',async({page})=>{
  await launch(page);
  const routes=[[[0,1],[0,1]],[[1,0],[1,0],[1,2],[3,2],[3,2]],[[0,1],[0,1],[0,1],[0,1],[1,2],[2,3],[2,3],[2,3]]];
  for(let i=0;i<routes.length;i++){
    for(const [a,b] of routes[i])await transfer(page,a,b);
    if(i<2)await expect(page.locator('#level-pill')).toContainText(String(i+2).padStart(2,'0'));
  }
  await expect(page.locator('#overlay-title')).toHaveText('You did it!');
  await expect(page.locator('#overlay-message')).toContainText('All three harbors');
});
test('Tide Exchange spends tokens and restarts',async({page})=>{
  await launch(page);
  for(let i=0;i<5;i++)await transfer(page,i%2?3:2,i%2?2:3);
  await expect(page.locator('#overlay-title')).toHaveText('Round over');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#score')).toHaveText('0');
});
