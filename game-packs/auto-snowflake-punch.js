/* Snowflake Punch — fold a paper pattern by punching mirrored holes. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Snowflake Punch','puzzle','❄️','Punch a folded paper snowflake to match a secret pattern.','Tap squares on the LEFT half to punch or restore mirrored holes. Match the glowing blueprint, then press CHECK. Finish three flakes before three failed checks or the timer runs out.'],
    api => {
      const {base,R,O,L,T}=api.art, C=api.colors;
      const patterns=[
        [0,2,4,7,10,13],
        [1,3,5,6,9,11,14],
        [0,1,4,6,8,10,12,14]
      ];
      const X=30,Y=130,CELL=50,ROWS=5,COLS=3;
      function startLevel(){
        const s=api.state;
        s.punched=new Set();
        s.note='Punch the left side. Both halves change together.';
      }
      function check(){
        const s=api.state;
        if(s.ended)return;
        const goal=patterns[s.level-1];
        if(s.punched.size===goal.length && goal.every(i=>s.punched.has(i))){
          api.addScore(100+20*(3-s.misses));
          api.beep(680);
          if(s.level===3){
            api.finish(true,'Three perfect snowflakes! The paper gallery sparkles.');
          }else{
            s.level++;
            startLevel();
            s.note='Perfect fold! A new blueprint awaits.';
          }
        }else{
          s.misses++;
          api.beep(160);
          s.note='Not quite. Compare the blue dots. '+(3-s.misses)+' checks left.';
          if(s.misses>=3)api.finish(false,'The paper ran out. Try the mirrored blueprint again.');
        }
      }
      return {
        init(){
          const s=api.state;
          s.level=1;s.t=130;s.misses=0;
          startLevel();
          api.controls([['CHECK PATTERN','check',true],['CLEAR HOLES','clear']]);
        },
        action(name){
          const s=api.state;
          if(s.ended)return;
          if(name==='check')check();
          if(name==='clear'){s.punched.clear();s.note='Clean paper. Start punching again.';}
        },
        tap(x,y){
          const s=api.state;
          if(s.ended||x<X||x>=X+COLS*CELL||y<Y||y>=Y+ROWS*CELL)return;
          const col=Math.floor((x-X)/CELL),row=Math.floor((y-Y)/CELL),id=row*COLS+col;
          if(s.punched.has(id))s.punched.delete(id);else s.punched.add(id);
          s.note=s.punched.size+' punches placed. Compare the blueprint.';
          api.beep(370);
        },
        timeout(){if(!api.state.ended)api.finish(false,'The snow melted before the final fold.');},
        draw(){
          const s=api.state,goal=patterns[s.level-1];
          base('#14283b');
          T('SNOWFLAKE PUNCH',180,38,23,C.yellow);
          T('FLAKE '+s.level+'/3   ·   FAILED CHECKS '+s.misses+'/3',180,69,12,C.mint);
          T('BLUEPRINT: match these blue dots',180,100,13,C.white);
          // Left half is interactive; right half shows the mirrored result.
          for(let row=0;row<ROWS;row++){
            for(let col=0;col<COLS*2;col++){
              const left=col<COLS,source=left?col:COLS*2-1-col;
              const id=row*COLS+source;
              const punched=s.punched.has(id),target=goal.includes(id);
              const px=X+col*CELL,py=Y+row*CELL;
              R(px+2,py+2,CELL-4,CELL-4,'#d7e8ec',7);
              if(punched)O(px+CELL/2,py+CELL/2,15,'#14283b');
              if(target)O(px+CELL/2,py+CELL/2,5,'#4d91f5');
              if(left)R(px+3,py+3,4,CELL-6,'#6ba6bb',2);
            }
          }
          L(180,123,180,387,'#f7c86c',3);
          T('TAP TO PUNCH',104,405,12,C.mint);
          T('MIRROR',255,405,12,C.yellow);
          T('HOLES '+s.punched.size+'/'+goal.length,180,425,12,C.white);
          T(s.note,180,444,10,C.muted);
        }
      };
    }
  );
})();
