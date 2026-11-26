/* Negative Space — identify the absent shape in a shifting gallery. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Negative Space','weird','◻️','Find the one symbol missing from each gallery wall.','Study the five symbols shown in the legend. Tap the symbol that does NOT appear in the large gallery grid. Clear three walls before the clock runs out. Three wrong guesses close the gallery.'],
    api => {
      const {base,R,O,L,T}=api.art, U=api.colors;
      const glyphs=['●','◆','▲','✚','★'];
      const walls=[
        {missing:2,grid:[0,1,3,4,1,0,4,3,0,4,1,3]},
        {missing:4,grid:[2,1,0,3,2,0,1,3,0,2,3,1]},
        {missing:0,grid:[4,2,1,3,4,1,2,3,1,4,3,2]}
      ];
      const xs=[48,114,180,246,312];
      function guess(i){
        const s=api.state;
        if(s.ended||i<0||i>4)return;
        if(i===walls[s.level-1].missing){
          api.addScore(100+Math.max(0,3-s.mistakes)*20);
          api.beep(590);
          if(s.level===walls.length){api.finish(true,'Every missing mark has been recovered.');return;}
          s.level++;s.note='Correct! Another wall awaits.';
        }else{
          s.mistakes++;api.beep(170);
          if(s.mistakes>=3){api.finish(false,'The gallery closed after three wrong guesses.');return;}
          s.note='That symbol is on the wall. Look again!';
        }
      }
      return {
        init(){
          const s=api.state;s.level=1;s.t=100;s.mistakes=0;s.note='Which shape is absent?';
          api.controls(glyphs.map((g,i)=>[g,'pick-'+i,true]));
        },
        action(name){if(name.startsWith('pick-'))guess(Number(name.slice(5)));},
        tap(x,y){
          if(y>=365&&y<=432){
            const i=xs.findIndex(cx=>Math.abs(x-cx)<=29);
            if(i>=0)guess(i);
          }
        },
        timeout(){if(!api.state.ended)api.finish(false,'Time ran out before the gallery was restored.');},
        draw(){
          const s=api.state, wall=walls[s.level-1];
          base('#151b30');
          T('NEGATIVE SPACE',180,38,23,U.mint);
          T('WALL '+s.level+'/3  •  ERRORS '+s.mistakes+'/3',180,70,14,U.yellow);
          T('ONE OF THESE SHAPES IS MISSING',180,102,12,U.white);
          R(24,123,312,221,'#29344f',15);
          wall.grid.forEach((v,i)=>{
            const x=72+(i%4)*72,y=160+Math.floor(i/4)*70;
            R(x-27,y-25,54,53,'#3d4c68',10);
            T(glyphs[v],x,y+2,29,['#8ce6d5','#ffd18a','#f2a8ce','#aabaff','#f9e9a0'][v]);
          });
          T('TAP THE ABSENT SHAPE',180,362,14,U.white);
          xs.forEach((x,i)=>{
            R(x-28,377,56,52,'#344362',10);
            T(glyphs[i],x,403,25,U.yellow);
          });
          T(s.note,180,445,11,U.muted);
        }
      };
    }
  );
})();
