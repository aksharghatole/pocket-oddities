import {test,expect} from '@playwright/test';
test('Flock Flight starts and responds to both lane controls on touch',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await page.getByRole('searchbox',{name:'Search games'}).fill('Flock Flight');
  await page.getByRole('button',{name:'Play Flock Flight'}).click();
  await expect(page.locator('#game-title')).toHaveText('Flock Flight');
  await page.getByRole('button',{name:'LEFT'}).click();
  await page.getByRole('button',{name:'RIGHT'}).click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  expect(errors).toEqual([]);
});
