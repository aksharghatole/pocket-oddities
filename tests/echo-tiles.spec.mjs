import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../game-packs/echo-tiles.js',import.meta.url),'utf8');
const centers=[[103,181],[257,181],[103,318],[257,318]];

function createGame(randomValues=[]){
  let factory,metadata,buttons=[];
  const window={PocketOddities:{register:(meta,create)=>{metadata=meta;factory=create;}}};
  vm.runInNewContext(source,{window},{timeout:1000});
  const state={score:0,ended:false,elapsed:0};
  const result={vibrations:[],draws:[],outcome:null};
  const sequence=[...randomValues];
  const api={
    state,
    colors:{mint:'#00ff00',yellow:'#ffff00',white:'#ffffff',muted:'#888888',pink:'#ff00ff'},
    helpers:{irnd(min,max){const value=sequence.length?sequence.shift():min;if(value<min||value>max)throw Error('Random value outside range');return value;}},
    art:{
      base(){},
      R(...args){result.draws.push(['R',...args]);},
      O(...args){result.draws.push(['O',...args]);},
      S(...args){result.draws.push(['S',...args]);},
      T(...args){result.draws.push(['T',...args]);}
    },
    controls(value){buttons=value??[];},
    addScore(value=1){state.score+=value;},
    finish(won,message){state.ended=true;result.outcome={won,message};},
    beep(){},
    vibrate(pattern){result.vibrations.push(pattern);}
  };
  result.metadata=metadata;
  result.game=factory(api);
  result.state=state;
  result.buttons=()=>buttons;
  result.result=result;
  return result;
}

test('Echo Tiles offers three paces, animates the preview, and wins each mode',()=>{
  const expected=[
    ['calm',2,4,1.05],
    ['classic',3,5,.77],
    ['rapid',4,6,.58]
  ];
  for(const [mode,start,goal,beat] of expected){
    const run=createGame(Array.from({length:32},(_,index)=>index%4));
    run.game.init();
    expect(run.buttons().map(button=>button[0])).toEqual(['CALM · 2 TILES','CLASSIC · 3 TILES','RAPID · 4 TILES']);
    expect(run.state.t).toBeNull();
    run.game.action(mode);
    expect(run.state.pattern).toHaveLength(start);
    expect(run.state.goal).toBe(goal);
    expect(run.state.beat).toBe(beat);
    expect(run.state.t).toBe(110);

    run.game.update(run.state.lead+.03);
    expect(run.vibrations).toContain(12);
    run.result.draws.length=0;
    run.game.draw();
    const activeIndex=()=>{
      const fill=run.result.draws.find(entry=>entry[0]==='R'&&entry[3]===130&&entry[4]===114&&entry[5]==='#fff8d9');
      if(!fill)return -1;
      return centers.findIndex(([x,y])=>fill[1]===x-65&&fill[2]===y-57);
    };
    expect(activeIndex()).toBe(0);
    run.game.update(run.state.beat);
    run.game.update(.03);
    run.result.draws.length=0;
    run.game.draw();
    expect(activeIndex()).toBe(1);

    while(!run.state.ended){
      if(run.state.previewActive)run.game.update(run.state.previewLength-run.state.previewTime+.03);
      for(const tile of [...run.state.pattern]){
        run.game.tap(centers[tile][0],centers[tile][1]);
        if(run.state.ended)break;
      }
    }
    expect(run.result.outcome?.won).toBe(true);
  }
});

test('Echo Tiles exposes the app haptics toggle for preview cues on compact mobile screens',async ({page})=>{
  await page.addInitScript(()=>{
    window.vibrationCalls=[];
    Object.defineProperty(navigator,'vibrate',{configurable:true,value:pattern=>{window.vibrationCalls.push(pattern);return true;}});
  });
  await page.setViewportSize({width:360,height:740});
  await page.goto('/');
  await page.getByRole('button',{name:/Echo Tiles/}).first().click();
  const controls=page.locator('#game-controls .control-btn');
  await expect(controls).toHaveCount(3);
  await expect(controls).toHaveText(['CALM · 2 TILES','CLASSIC · 3 TILES','RAPID · 4 TILES']);
  const haptics=page.locator('#haptic-toggle');
  await expect(haptics).toHaveAttribute('aria-pressed','false');
  await controls.filter({hasText:'RAPID'}).click();
  await page.waitForTimeout(650);
  expect(await page.evaluate(()=>window.vibrationCalls.length)).toBe(0);
  await haptics.click();
  await expect(haptics).toHaveAttribute('aria-pressed','true');
  await page.evaluate(()=>window.vibrationCalls.length=0);
  await page.waitForTimeout(650);
  expect(await page.evaluate(()=>window.vibrationCalls.length)).toBeGreaterThan(0);
});
