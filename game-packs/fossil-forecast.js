/* Fossil Forecast — three pocket-sized nonogram digs with fixed, solvable patterns. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Fossil Forecast','puzzle','🦴','Read the row and column clues to uncover three tiny fossils.','Fill the fossil squares using the row and column run clues, then press Check Dig. Clear three boards; three bad checks end the dig. Tap a filled square again to clear it.'],
    api => {
      const {base,R,O,T}=api.art, U=api.colors;
      const size=44, left=70, top=143, N=5;
      const patterns=[
        [[0,1,0,1,0],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]],
        [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[0,1,1,1,0],[1,0,1,0,1]],
        [[0,1,1,1,0],[1,1,1,1,1],[1,0,1,0,1],[0,1,1,1,0],[0,1,0,1,0]]
      ];
      function clues(line){
        const runs=[];let count=0;
        for(const filled of line){if(filled)count++;else if(count){runs.push(count);count=0}}
        if(count)runs.push(count);
        return runs.length?runs:[0];
      }
      function rows(pattern){return pattern.map(clues)}
      function columns(pattern){return Array.from({length:N},(_,x)=>clues(pattern.map(row=>row[x])))}
      function marked(s){return s.cells.reduce((total,filled)=>total+(filled?1:0),0)}
      function check(s){
        const pattern=patterns[s.round];
        if(s.cells.every((filled,i)=>filled===Boolean(pattern[Math.floor(i/N)][i%N]))){
          api.addScore(Math.max(15,60-s.mistakes*12));
          if(s.round===patterns.length-1){api.finish(true,'All three fossil patterns uncovered! The buried signal has been found.');return}
          s.round++;s.level=s.round+1;s.cells=Array(N*N).fill(false);s.mistakes=0;
          s.note='Fossil '+s.level+' uncovered. Read the new clues.';
          return;
        }
        s.mistakes++;
        s.note='Not quite. Recheck the runs. '+(3-s.mistakes)+' checks left.';
        api.beep(180);
        if(s.mistakes>=3)api.finish(false,'The dig team ran out of chances. Restart and read each clue carefully.');
      }
      return {
        init(){
          const s=api.state;s.t=115;s.round=0;s.level=1;s.mistakes=0;s.cells=Array(N*N).fill(false);
          s.note='Mark the fossil, then check your dig.';
          api.controls([['✓ CHECK DIG','check',true]]);
        },
        action(name){if(name==='check'&&!api.state.ended)check(api.state)},
        tap(x,y){
          const s=api.state;
          const col=Math.floor((x-left)/size),row=Math.floor((y-top)/size);
          if(col<0||col>=N||row<0||row>=N)return;
          const index=row*N+col;s.cells[index]=!s.cells[index];
          s.note=marked(s)+' squares marked · tap again to clear a square.';
        },
        timeout(){api.finish(false,'The dig clock ran out. Use the clues and check each fossil.');},
        draw(){
          const s=api.state,pattern=patterns[s.round],rowHints=rows(pattern),colHints=columns(pattern);
          base('#172238');
          T('FOSSIL FORECAST',180,28,21,U.mint);
          T('DIG '+s.level+'/3  ·  MISREADS '+s.mistakes+'/3',180,55,12,U.yellow);
          for(let c=0;c<N;c++)T(colHints[c].join(' '),left+c*size+size/2,122,11,U.yellow);
          for(let r=0;r<N;r++){
            T(rowHints[r].join(' '),47,top+r*size+size/2,11,U.yellow);
            for(let c=0;c<N;c++){
              const x=left+c*size,y=top+r*size,filled=s.cells[r*N+c];
              R(x+1,y+1,size-2,size-2,filled?'#5a796c':'#2b3a55',7);
              R(x+4,y+4,size-8,size-8,filled?'#dccb91':'#354661',5);
              if(filled)O(x+size/2,y+size/2,7,'#344458');
            }
          }
          R(26,375,308,40,'#293851',11);
          T(s.note,180,395,12,U.white);
          T('ROW + COLUMN CLUES SHOW FILLED RUNS',180,431,11,U.muted);
        }
      };
    }
  );
})();
