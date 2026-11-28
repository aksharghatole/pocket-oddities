import {test,expect} from '@playwright/test';
test('Mooncake Stack starts and accepts a touch drop',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await page.getByRole('searchbox',{name:'Search games'}).fill('Mooncake Stack');
  await page.getByRole('button',{name:'Play Mooncake Stack'}).click();
  await expect(page.locator('#game-title')).toHaveText('Mooncake Stack');
  await page.getByRole('button',{name:'DROP'}).click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  expect(errors).toEqual([]);
});
