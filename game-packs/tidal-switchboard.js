/* Tidal Switchboard — toggle neighboring lanterns to restore the harbor. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Tidal Switchboard','puzzle','🌊','Restore the harbor lantern grid with clever taps.','Tap a lantern to toggle it and its orthogonal neighbors. Turn every lantern ON in three harbors. Each harbor has a move budget; three failed attempts or the 120-second timer end the game.'],
    api => {
      const {base,R,O,T}=api.art, C=api.colors;
      const N=4, solutions=[[0,5,10],[1,6,11,12],[2,4,7,9,14]];
      function toggle(board,i){
        const r=Math.floor(i/N),c=i%N;
        [[r,c],[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([y,x])=>{
          if(y>=0&&y<N&&x>=0&&x<N)board[y*N+x]=!board[y*N+x];
        });
      }
      function prepare(s){
        const seq=solutions[s.level-1];
        s.board=Array(16).fill(true);
        seq.forEach(i=>toggle(s.board,i));
        s.moves=0;s.limit=seq.length+3;
        s.note='Light every lantern in '+s.limit+' taps.';
      }
      function press(i){
        const s=api.state;
        if(s.ended||i<0||i>=16)return;
        toggle(s.board,i);s.moves++;
        api.beep(300+i*13);
        if(s.board.every(Boolean)){
          api.addScore(100+Math.max(0,s.limit-s.moves)*25);
          if(s.level===solutions.length){
            api.finish(true,'Every harbor is glowing. The tide is safe!');
          }else{
            s.level++;prepare(s);
            s.note='Harbor restored! Now light harbor '+s.level+'.';
          }
        }else if(s.moves>=s.limit){
          s.strikes++;
          if(s.strikes>=3)api.finish(false,'Three dark harbors ended your shift.');
          else {prepare(s);s.note='Out of moves! Harbor reset. '+(3-s.strikes)+' attempts remain.';}
        }else s.note=(s.limit-s.moves)+' taps left. '+s.board.filter(Boolean).length+'/16 lit.';
      }
      return {
        init(){
          const s=api.state;
          s.t=120;s.level=1;s.strikes=0;prepare(s);
          api.controls([['Reset harbor','reset',true]]);
        },
        action(name){
          const s=api.state;
          if(name==='reset'&&!s.ended){prepare(s);s.note='Harbor reset. Try a new pattern.';}
        },
        tap(x,y){
          if(api.state.ended)return;
          const col=Math.floor((x-32)/75),row=Math.floor((y-114)/75);
          if(col>=0&&col<4&&row>=0&&row<4&&x<32+col*75+68&&y<114+row*75+68)press(row*4+col);
        },
        timeout(){if(!api.state.ended)api.finish(false,'The tide arrived before the lanterns were restored.');},
        draw(){
          const s=api.state;
          base('#14243b');
          T('TIDAL SWITCHBOARD',180,37,22,C.mint);
          T('HARBOR '+s.level+'/3  ·  FAILED '+s.strikes+'/3',180,68,14,C.yellow);
          T('TAPS '+s.moves+'/'+s.limit,180,94,14,C.white);
          s.board.forEach((lit,i)=>{
            const x=32+(i%4)*75,y=114+Math.floor(i/4)*75;
            R(x,y,68,68,lit?'#f5d877':'#34465e',13);
            O(x+34,y+34,lit?18:12,lit?'#fff7c4':'#17283e');
            T(lit?'✦':'·',x+34,y+35,lit?26:28,lit?'#9b6c28':'#9eb1c8');
          });
          R(20,421,320,24,'#263b55',8);
          T(s.note,180,433,11,C.white);
        }
      };
    }
  );
})();
