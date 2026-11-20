/* Ink Tide — flood the whole paper from the upper-left corner. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Ink Tide','puzzle','🖌️','Recolor a spreading ink pool to claim every square of paper.','Choose one of four ink colors. The connected pool starts at the top-left and absorbs matching neighboring tiles. Fill all 25 squares in 12 moves per sheet; complete three sheets before the clock runs out.'],
    api => {
      const {base,R,T}=api.art, U=api.colors;
      const palette=['#ff8c91','#76d9e4','#ffe087','#b9a1ff'];
      const names=['CORAL','CYAN','GOLD','LILAC'];
      const N=5, cell=54, left=45, top=107, maxMoves=12;
      function board(round) {
        return Array.from({length:N*N},(_,i)=>(Math.floor(i/N)+i%N+round)%4);
      }
      function region(cells) {
        const found=new Set([0]), queue=[0], color=cells[0];
        while(queue.length){
          const i=queue.shift(),x=i%N,y=Math.floor(i/N);
          for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){
            const nx=x+dx,ny=y+dy,j=ny*N+nx;
            if(nx>=0&&nx<N&&ny>=0&&ny<N&&!found.has(j)&&cells[j]===color){
              found.add(j);queue.push(j);
            }
          }
        }
        return found;
      }
      function choose(color) {
        const s=api.state;
        if(s.ended||color===s.cells[0])return;
        const before=region(s.cells);
        for(const i of before)s.cells[i]=color;
        const after=region(s.cells);
        s.moves++;
        api.addScore((after.size-before.size)*10);
        s.note=after.size+' / 25 squares covered';
        api.beep(320+color*95);
        if(after.size===N*N){
          api.addScore(50+(maxMoves-s.moves)*5);
          if(s.round===2){
            api.finish(true,'All three ink sheets restored. The paper sea is yours!');
          }else{
            s.round++;s.level=s.round+1;s.cells=board(s.round);s.moves=0;
            s.note='Fresh sheet! Start from the top-left.';
          }
        }else if(s.moves>=maxMoves){
          api.finish(false,'Out of ink moves! Try choosing colors that absorb more tiles.');
        }
      }
      return {
        init(){
          const s=api.state;s.t=150;s.round=0;s.level=1;s.moves=0;
          s.cells=board(0);s.note='Spread the ink from the upper-left.';
          api.controls(names.map((name,i)=>[name,'ink-'+i,i===0]));
        },
        action(name){
          if(name.startsWith('ink-'))choose(Number(name.slice(4)));
        },
        tap(x,y){
          if(y>=394&&y<=443&&x>=26&&x<334){
            choose(Math.min(3,Math.floor((x-26)/77)));
          }
        },
        timeout(){
          if(!api.state.ended)api.finish(false,'The ink dried before you restored all three sheets.');
        },
        draw(){
          const s=api.state,covered=region(s.cells);
          base('#172238');
          T('INK TIDE',180,31,25,U.mint);
          T('SHEET '+(s.round+1)+'/3  ·  MOVES '+s.moves+'/'+maxMoves,180,61,14,U.yellow);
          T('CHANGE THE CONNECTED TOP-LEFT POOL',180,86,11,U.muted);
          for(let i=0;i<N*N;i++){
            const x=left+(i%N)*cell,y=top+Math.floor(i/N)*cell;
            R(x+2,y+2,cell-4,cell-4,palette[s.cells[i]],8);
            if(covered.has(i))R(x+6,y+6,cell-12,cell-12,'#ffffff26',5);
          }
          T(s.note,180,395,13,U.white);
          for(let i=0;i<4;i++){
            const x=26+i*77;
            R(x,409,72,36,palette[i],10);
            T(names[i],x+36,427,10,'#19253d');
          }
        }
      };
    }
  );
})();
