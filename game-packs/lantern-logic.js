/* Lantern Logic — restore a festival of lamps by toggling neighbors. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Lantern Logic','puzzle','🏮','Light every lantern by flipping its neighbors.','Tap a lantern to toggle it and its up/down/left/right neighbors. Light all 16 lanterns within the move limit. Clear three patterns to win; running out of moves or time ends the game.'],
    api => {
      const {base,R,O,T}=api.art, U=api.colors, {irnd}=api.helpers;
      const n=4, size=72, left=36, top=108;
      function flip(board,idx){
        const x=idx%n,y=Math.floor(idx/n);
        [[0,0],[-1,0],[1,0],[0,-1],[0,1]].forEach(([dx,dy])=>{
          const xx=x+dx,yy=y+dy;
          if(xx>=0&&xx<n&&yy>=0&&yy<n)board[yy*n+xx]=!board[yy*n+xx];
        });
      }
      function setup(s){
        s.board=Array(16).fill(true);
        const used=new Set();
        while(used.size<s.level+3)used.add(irnd(0,15));
        used.forEach(i=>flip(s.board,i));
        // Every generated board is solvable in at most level+3 moves.
        s.moves=0;s.limit=9+s.level*3;
        s.note='Restore all 16 lights.';
      }
      return {
        init(){
          const s=api.state;
          s.t=105;s.level=1;s.note='Tap a lantern to change nearby lights.';
          api.controls([]);
          setup(s);
        },
        tap(x,y){
          const s=api.state;
          if(s.ended)return;
          const col=Math.floor((x-left)/size),row=Math.floor((y-top)/size);
          if(col<0||col>=4||row<0||row>=4)return;
          flip(s.board,row*4+col);
          s.moves++;
          api.beep(380);
          if(s.board.every(Boolean)){
            api.addScore(Math.max(10,100-s.moves*5)+s.level*20);
            if(s.level===3){
              api.finish(true,'All three lantern courtyards are glowing. Festival saved!');
              return;
            }
            s.level++;
            setup(s);
            s.note='Courtyard '+s.level+'! New lantern pattern.';
            return;
          }
          if(s.moves>=s.limit){
            api.finish(false,'No moves left. Try a different order of lanterns!');
            return;
          }
          s.note=(s.limit-s.moves)+' moves remaining.';
        },
        timeout(){if(!api.state.ended)api.finish(false,'The festival began before the lanterns were lit.');},
        draw(){
          const s=api.state;
          base('#171b32');
          T('LANTERN LOGIC',180,36,24,U.yellow);
          T('COURTYARD '+s.level+'/3   •   MOVES '+s.moves+'/'+s.limit,180,66,14,U.mint);
          T('TAP TO FLIP A LAMP + ITS NEIGHBORS',180,88,11,U.muted);
          for(let i=0;i<16;i++){
            const x=left+(i%4)*size,y=top+Math.floor(i/4)*size;
            R(x+3,y+3,size-6,size-6,s.board[i]?'#5c4932':'#26334e',12);
            if(s.board[i]){
              O(x+size/2,y+size/2,24,'#ffd47b45');
              T('✦',x+size/2,y+size/2+2,39,'#ffe18d');
            }else{
              O(x+size/2,y+size/2,18,'#1a263d');
              T('◇',x+size/2,y+size/2+2,28,'#6d829f');
            }
          }
          R(30,413,300,28,'#28324b',10);
          T(s.note,180,427,12,U.white);
        }
      };
    }
  );
})();
