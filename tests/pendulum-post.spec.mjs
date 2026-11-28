import {test,expect} from '@playwright/test';
test('Pendulum Post starts and accepts a parcel release',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await page.getByRole('searchbox',{name:'Search games'}).fill('Pendulum Post');
  await page.getByRole('button',{name:'Play Pendulum Post'}).click();
  await expect(page.locator('#game-title')).toHaveText('Pendulum Post');
  await page.getByRole('button',{name:'RELEASE PARCEL'}).click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  expect(errors).toEqual([]);
});
