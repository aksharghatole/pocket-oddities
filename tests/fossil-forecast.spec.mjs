import {test,expect} from '@playwright/test';

async function start(page){
  await page.getByRole('button',{name:'Play Fossil Forecast',exact:true}).click();
}

async function tapCell(page,row,col){
  const arena=page.locator('#arena');
  const bounds=await arena.boundingBox();
  await arena.click({position:{x:(70+col*44+22)*bounds.width/360,y:(143+row*44+22)*bounds.height/450}});
}

test('Fossil Forecast accepts a solved board, supports correction, and can fail cleanly',async ({page})=>{
  await page.goto('/');
  await start(page);
  await expect(page.locator('#game-title')).toHaveText('Fossil Forecast');
  await expect(page.locator('#instruction')).toContainText('row and column');
  const check=page.locator('#game-controls button').filter({hasText:'CHECK DIG'});
  await expect(check).toBeVisible();
  const solution=[[0,1,0,1,0],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]];
  for(let row=0;row<5;row++)for(let col=0;col<5;col++)if(solution[row][col])await tapCell(page,row,col);
  await check.click();
  await expect(page.locator('#level-pill')).toHaveText('ROUND 02');

  await page.reload();
  await start(page);
  const checkAgain=page.locator('#game-controls button').filter({hasText:'CHECK DIG'});
  await tapCell(page,0,0);
  await tapCell(page,0,0);
  await checkAgain.click();
  await expect(page.locator('#score')).toHaveText('0');
  await checkAgain.click();
  await checkAgain.click();
  await expect(page.locator('#overlay-title')).toHaveText('Round over');
  await page.locator('#restart-btn').click();
  await expect(page.locator('#game-overlay')).toBeHidden();
  await expect(page.locator('#level-pill')).toHaveText('ROUND 01');
});
