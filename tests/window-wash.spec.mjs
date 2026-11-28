import {test,expect} from '@playwright/test';
test('Window Wash accepts touch wipes and completes panes',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await page.getByRole('searchbox',{name:'Search games'}).fill('Window Wash');
  await page.getByRole('button',{name:'Play Window Wash'}).click();
  await expect(page.locator('#game-title')).toHaveText('Window Wash');
  const canvas=page.locator('canvas').last();
  const box=await canvas.boundingBox();
  for(let pane=0;pane<5;pane++){
    for(let wipe=0;wipe<3;wipe++){
      await page.getByRole('button',{name:'WIPE'}).tap();
    }
  }
  await expect(page.locator('#game-overlay')).toBeVisible();
  expect(errors).toEqual([]);
});