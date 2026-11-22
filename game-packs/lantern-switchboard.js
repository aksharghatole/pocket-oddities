/* Lantern Switchboard — a three-stage neighborhood-toggle logic puzzle. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Lantern Switchboard','puzzle','🏮','Restore a grid of lanterns by flipping neighboring switches.','Tap a lantern to flip it and its orthogonal neighbors. Light all nine lanterns in each of three rooms before your switch budget runs out. Reset the current room to retry.'],
    api => {
      const {base,R,O,T}=api.art, C=api.colors;
      const seeds=[[0,8],[0,4,8],[1,3,5,7]];
      const budgets=[7,10,13];
      function flip(board,index) {
        const row=Math.floor(index/3),col=index%3;
        [index,row>0?index-3:-1,row<2?index+3:-1,col>0?index-1:-1,col<2?index+1:-1]
          .forEach(i=>{if(i>=0)board[i]=!board[i];});
      }
      function startRoom(s) {
        s.board=Array(9).fill(true);
        seeds[s.level-1].forEach(i=>flip(s.board,i));
        s.moves=0;s.budget=budgets[s.level-1];
        s.note='Light every lantern. '+s.budget+' switches available.';
      }
      function choose(i) {
        const s=api.state;
        if(s.ended||i<0||i>8)return;
        flip(s.board,i);s.moves++;
        api.beep(310+i*27);
        if(s.board.every(Boolean)){
          api.addScore(100+Math.max(0,s.budget-s.moves)*15);
          if(s.level===3)api.finish(true,'All three rooms shine! The switchboard is restored.');
          else {s.level++;startRoom(s);s.note='Room restored! Now light room '+s.level+'.';}
        }else if(s.moves>=s.budget) {
          api.finish(false,'The switches ran out. Try a different sequence!');
        }else s.note=(s.budget-s.moves)+' switches left · '+s.board.filter(Boolean).length+'/9 lit';
      }
      return {
        init(){
          const s=api.state;s.t=150;s.level=1;
          startRoom(s);
          api.controls([['Reset room','reset',true]]);
        },
        action(name){
          if(name==='reset'&&!api.state.ended)startRoom(api.state);
        },
        tap(x,y){
          if(x<35||x>=325||y<116||y>=406)return;
          const col=Math.floor((x-35)/100),row=Math.floor((y-116)/100);
          if(col>=0&&col<3&&row>=0&&row<3)choose(row*3+col);
        },
        timeout(){if(!api.state.ended)api.finish(false,'The lantern keeper closed the doors. Try again!');},
        draw(){
          const s=api.state;
          base('#141c30');
          T('LANTERN SWITCHBOARD',180,36,21,C.yellow);
          T('ROOM '+s.level+'/3  ·  SWITCHES '+s.moves+'/'+s.budget,180,72,15,C.white);
          T('Tap a lamp: it and its neighbors flip',180,99,12,C.muted);
          s.board.forEach((lit,i)=>{
            const x=35+(i%3)*100,y=116+Math.floor(i/3)*100;
            R(x+4,y+4,92,92,lit?'#f3cb72':'#34415b',14);
            O(x+50,y+50,lit?28:23,lit?'#fff1b0':'#18263e');
            T(lit?'✦':'·',x+50,y+54,lit?30:32,lit?'#78531e':'#7d91aa');
          });
          T(s.note,180,429,12,C.white);
        }
      };
    }
  );
})();
