import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../game-packs/lantern-logic.js',import.meta.url),'utf8');

function createGame(randomCells){
  let factory,metadata;
  const window={PocketOddities:{register:(meta,create)=>{metadata=meta;factory=create;}}};
  vm.runInNewContext(source,{window},{timeout:1000});
  const state={score:0,ended:false};
  let outcome=null;
  const sequence=[...randomCells];
  const api={
    state,
    colors:{mint:'#fff',yellow:'#fff,',muted:'#fff',white:'#fff'},
    helpers:{irnd(min,max){const value=sequence.shift();if(value===undefined||value<min||value>max)throw Error('Unexpected random draw');return value;}},
    art:{base(){},R(){},O(){},T(){}},
    controls(){},
    addScore(points){state.score+=points;},
    finish(won,message){state.ended=true;outcome={won,message};},
    beep(){}
  };
  return {metadata,game:factory(api),state,get outcome(){return outcome;}};
}

test('Lantern Logic solves three generated patterns and loses at its move limit',()=>{
  const win=createGame([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14]);
  win.game.init();
  const solutions=[[0,1,2,3],[4,5,6,7,8],[9,10,11,12,13,14]];
  for(const solution of solutions)for(const cell of solution){
    win.game.tap(36+(cell%4)*72+36,108+Math.floor(cell/4)*72+36);
  }
  expect(win.metadata[0]).toBe('Lantern Logic');
  expect(win.outcome?.won).toBe(true);
  expect(win.state.score).toBeGreaterThan(0);

  const loss=createGame([0,1,2,3]);
  loss.game.init();
  for(let move=0;move<12;move++)loss.game.tap(72,144);
  expect(loss.outcome?.won).toBe(false);
  expect(loss.state.ended).toBe(true);
});
