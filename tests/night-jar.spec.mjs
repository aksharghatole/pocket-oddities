import {test,expect} from '@playwright/test';
test('Night Jar starts and responds to touch movement',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await page.getByRole('searchbox',{name:'Search games'}).fill('Night Jar');
 await page.getByRole('button',{name:'Play Night Jar'}).click();
 await expect(page.locator('#game-title')).toHaveText('Night Jar');
 const canvas=page.locator('canvas').last(),box=await canvas.boundingBox();
 await page.touchscreen.tap(box.x+box.width*.72,box.y+box.height*.48);
 await page.getByRole('button',{name:'▶'}).tap();
 await expect(page.locator('#game-overlay')).toBeHidden();
 expect(errors).toEqual([]);
});