import {test,expect} from '@playwright/test';

async function launch(page,name){
  await page.goto('/');
  await page.locator('#game-grid .game-card').filter({has:page.locator('h3',{hasText:name})}).first().click();
  await expect(page.locator('#game-title')).toHaveText(name);
}
async function tapGrid(page,x,y){
  const b=await page.locator('#arena').boundingBox();
  if(!b)throw Error('Canvas did not render');
  await page.touchscreen.tap(b.x+b.width*(x/360),b.y+b.height*(y/450));
}
test('Shadow Thief: light blocks movement; a shift opens the route',async ({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await launch(page,'Shadow Thief');
  // From (0,5), neighboring (1,5) is dark at phase 0.
  await tapGrid(page,105,357);
  await expect(page.locator('#score')).toHaveText('1');
  // (2,5) is brightly lit at phase 0 and should not count as a move.
  await tapGrid(page,155,357);
  await expect(page.locator('#score')).toHaveText('1');
  // Shift changes the lit cells, making (2,5) a safe next tile.
  await page.locator('#game-controls button').filter({hasText:'SHIFT THE LIGHT'}).click();
  await tapGrid(page,155,357);
  await expect(page.locator('#score')).toHaveText('2');
  await expect(page.locator('#game-overlay')).toBeHidden();
  expect(errors).toEqual([]);
});
test('Shadow Thief uses strong non-color contrast for danger and safe tiles',async ({page})=>{
  await page.setViewportSize({width:360,height:740});
  await page.goto('/');
  await launch(page,'Shadow Thief');
  await page.waitForTimeout(100);
  const [spotlight,shadow]=await page.locator('#arena').evaluate(canvas=>{
    const ctx=canvas.getContext('2d');
    const sample=(x,y)=>Array.from(ctx.getImageData(x,y,1,1).data).slice(0,3);
    return [sample(42,94),sample(92,94)];
  });
  const luminance=rgb=>{
    const channels=rgb.map(v=>v/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
    return 0.2126*channels[0]+0.7152*channels[1]+0.0722*channels[2];
  };
  const a=luminance(spotlight),b=luminance(shadow);
  expect((Math.max(a,b)+0.05)/(Math.min(a,b)+0.05)).toBeGreaterThan(4.5);
});
test('Tiny Traffic God: lane buttons prevent the first intersection collision',async ({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await launch(page,'Tiny Traffic God');
  await expect(page.locator('#game-controls button')).toHaveCount(2);
  // Wait for the first simultaneous pair; hold its vertical car.
  await page.waitForTimeout(700);
  await page.locator('#game-controls button').filter({hasText:'VERTICAL'}).click();
  await page.waitForTimeout(2600);
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect.poll(async()=>Number(await page.locator('#score').textContent()),{timeout:6000}).toBeGreaterThanOrEqual(1);
  expect(errors).toEqual([]);
});
test('The Other Cursor explains its trail and draws a visible echo tether',async ({page})=>{
  await page.setViewportSize({width:360,height:740});
  await page.goto('/');
  await launch(page,'The Other Cursor');
  await expect(page.locator('#instruction')).toContainText('1.2 seconds later');
  await page.waitForTimeout(120);
  const pixel=await page.locator('#arena').evaluate(canvas=>{
    return Array.from(canvas.getContext('2d').getImageData(180,145,1,1).data);
  });
  expect(pixel[0]).toBeGreaterThan(70);
  expect(pixel[1]).toBeLessThan(100);
});
test('Invisible Maze: both generated stages always contain a winning path',async ({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  // Fill all optional cells with walls; the guaranteed path must remain.
  await page.addInitScript(()=>{Math.random=()=>0;});
  await launch(page,'Invisible Maze');
  const buttons=page.locator('#game-controls button');
  // Stage 1 route: along an inner detour, not the simple outside edge.
  const route1=['right','right','up','up','right','right','up','up','right','right','up','up'];
  // Stage 2 route: an alternative hidden corridor.
  const route2=['up','right','right','up','up','right','right','right','up','right','up','up'];
  const index={left:0,up:1,down:2,right:3};
  for(const direction of [...route1,...route2])await buttons.nth(index[direction]).click();
  await expect(page.locator('#overlay-title')).toHaveText('You did it!');
  await expect(page.locator('#score')).toHaveText('24');
  expect(errors).toEqual([]);
});
test('Invisible Maze: touching a wall costs a life and eventually ends the round',async ({page})=>{
  await page.addInitScript(()=>{Math.random=()=>0;});
  await launch(page,'Invisible Maze');
  const up=page.locator('#game-controls button').nth(1);
  // (0,5) is a wall on the carved stage 1 route.
  for(let i=0;i<5;i++)await up.click();
  await expect(page.locator('#overlay-title')).toHaveText('Round over');
});
