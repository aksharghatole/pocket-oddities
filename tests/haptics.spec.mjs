import {test,expect} from '@playwright/test';

async function start(page,title){
  await page.getByRole('button',{name:new RegExp(title)}).first().click();
}

test('win and loss haptics are distinct, optional and persistent',async ({page})=>{
  await page.addInitScript(()=>{
    window.__vibrations=[];
    Object.defineProperty(navigator,'vibrate',{configurable:true,value:pattern=>{window.__vibrations.push(pattern);return true}});
  });
  await page.goto('/');
  const toggle=page.locator('#haptic-toggle');
  await expect(toggle).toHaveAttribute('aria-pressed','false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed','true');
  await page.evaluate(()=>{window.__vibrations.length=0});
  await start(page,'One Minute Villain');
  const glitch=page.locator('#game-controls button').filter({hasText:'GLITCH'});
  for(let i=0;i<4;i++){
    if(await page.locator('#game-overlay').isVisible())break;
    await glitch.click();
  }
  await expect(page.locator('#overlay-title')).toHaveText('You did it!');
  expect(await page.evaluate(()=>window.__vibrations)).toEqual([[24,30,48]]);

  await page.reload();
  await expect(page.locator('#haptic-toggle')).toHaveAttribute('aria-pressed','true');
  await page.evaluate(()=>{window.__vibrations.length=0});
  await start(page,'The Button Has Feelings');
  const arena=page.locator('#arena');
  for(let i=0;i<4;i++){
    if(await page.locator('#game-overlay').isVisible())break;
    await arena.click({position:{x:180,y:230}});
  }
  await expect(page.locator('#overlay-title')).toHaveText('Round over');
  expect(await page.evaluate(()=>window.__vibrations)).toEqual([[48,30,24]]);

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed','false');
  await page.evaluate(()=>{window.__vibrations.length=0});
  await page.reload();
  await expect(page.locator('#haptic-toggle')).toHaveAttribute('aria-pressed','false');
  await start(page,'One Minute Villain');
  const finalGlitch=page.locator('#game-controls button').filter({hasText:'GLITCH'});
  for(let i=0;i<4;i++){
    if(await page.locator('#game-overlay').isVisible())break;
    await finalGlitch.click();
  }
  await expect(page.locator('#overlay-title')).toHaveText('You did it!');
  expect(await page.evaluate(()=>window.__vibrations)).toEqual([]);
});
