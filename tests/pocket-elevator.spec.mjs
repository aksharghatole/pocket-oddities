import {test,expect} from '@playwright/test';

test('Pocket Elevator launches and accepts touch and floor-button dispatch',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await page.getByRole('searchbox',{name:'Search games'}).fill('Pocket Elevator');
  await page.getByRole('button',{name:'Play Pocket Elevator'}).click();
  await expect(page.locator('#game-title')).toHaveText('Pocket Elevator');
  await expect(page.locator('#instruction')).toContainText('Deliver 8 passengers');
  await page.getByRole('button',{name:'Floor 3'}).click();
  await page.waitForTimeout(1900);
  await page.locator('#arena').click({position:{x:300,y:248}});
  await page.waitForTimeout(1200);
  await expect(page.locator('#game-overlay')).toHaveClass(/hidden/);
  await page.getByRole('button',{name:'All games'}).first().click();
  await expect(page.locator('#home-screen')).not.toHaveClass(/hidden/);
  expect(errors).toEqual([]);
});

test('Pocket Elevator game logic supports victory, timeout, and retry',async({page})=>{
  await page.goto('/');
  const result=await page.evaluate(async()=>{
    const source=await (await fetch('./game-packs/pocket-elevator.js')).text();
    const real=window.PocketOddities;
    let factory;
    Object.defineProperty(window,'PocketOddities',{configurable:true,value:{register:(_meta,fn)=>factory=fn}});
    try { (0,eval)(source); }
    finally {Object.defineProperty(window,'PocketOddities',{configurable:true,value:real});}
    const outcomes=[];
    function setup(){
      const state={score:0,ended:false};
      const api={
        state,colors:{mint:'#fff',yellow:'#fff',white:'#fff',muted:'#fff',red:'#fff'},
        helpers:{irnd:(a,b)=>a},
        art:{base(){},R(){},O(){},L(){},T(){}},
        controls(){},addScore(n){state.score+=n},
        finish(won,msg){state.ended=true;outcomes.push({won,msg})},beep(){}
      };
      const game=factory(api);game.init();
      return {state,game};
    }
    const a=setup();
    a.state.waiting=[];a.state.rider={to:2,patience:10};
    a.state.delivered=7;
    a.game.action('floor2');a.game.update(1);
    const win=a.state.ended&&outcomes.at(-1)?.won===true&&a.state.delivered===8;
    const b=setup();
    b.game.timeout();
    const loss=b.state.ended&&outcomes.at(-1)?.won===false;
    const c=setup();
    const restart=!c.state.ended&&c.state.delivered===0&&c.state.t===100;
    return {win,loss,restart};
  });
  expect(result).toEqual({win:true,loss:true,restart:true});
});
