import {test,expect} from '@playwright/test';

test('Counterweight Courier supports mobile touch, victory, failure and fresh restart',async({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await page.getByRole('searchbox',{name:'Search games'}).fill('Counterweight Courier');
  await page.getByRole('button',{name:'Play Counterweight Courier'}).click();
  await expect(page.locator('#instruction')).toContainText('Match the left-side torque');
  const canvas=page.locator('#arena');
  async function hook(i) {
    const box=await canvas.boundingBox();
    await page.touchscreen.tap(box.x+(222+55*i)*box.width/360,box.y+338*box.height/450);
  }
  await page.getByRole('button',{name:'2 units'}).click();
  await hook(1); // 2 × 2 = 4
  await page.getByRole('button',{name:'1 unit'}).click();
  await hook(0);
  await page.getByRole('button',{name:'3 units'}).click();
  await hook(1); // 1 × 1 + 3 × 2 = 7
  await hook(2); // 3 × 3 = 9
  await expect(page.locator('#game-overlay')).not.toHaveClass(/hidden/);
  await expect(page.locator('#overlay-message')).toContainText('three bridges balanced');
  await page.getByRole('button',{name:/Play again/}).click();
  await expect(page.locator('#game-overlay')).toHaveClass(/hidden/);
  await page.getByRole('button',{name:'3 units'}).click();
  await hook(2); // overshoot bridge 1
  await expect(page.locator('#overlay-message')).toContainText('Too much torque');
  expect(errors).toEqual([]);
});
