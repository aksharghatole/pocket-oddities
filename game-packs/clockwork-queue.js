/* Clockwork Queue — sort mischievous clockwork parcels with adjacent swaps. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Clockwork Queue','strategy','⚙️','Put the clockwork parcels back in order with limited swaps.','Tap the gap between two parcels (or its Swap button) to exchange neighbors. Arrange numbers from 1 upward in three shifts. Each shift has a move limit; three failed shifts or the timer ending loses.'],
    api => {
      const {base,R,O,T}=api.art, U=api.colors;
      const shifts=[
        {start:[2,1,3],limit:2},
        {start:[3,1,4,2],limit:4},
        {start:[3,5,1,4,2],limit:8}
      ];
      function setup(s){
        const shift=shifts[s.level-1];
        s.queue=shift.start.slice();s.moves=shift.limit;
        s.note='Swap neighboring parcels to sort the queue.';
        api.controls(s.queue.slice(1).map((_,i)=>['Swap '+(i+1)+' & '+(i+2),'swap'+i,true]));
      }
      function swap(i){
        const s=api.state;
        if(s.ended||i<0||i>=s.queue.length-1)return;
        [s.queue[i],s.queue[i+1]]=[s.queue[i+1],s.queue[i]];
        s.moves--;api.beep(360+i*65);
        if(s.queue.every((n,j)=>n===j+1)){
          api.addScore(100+s.moves*25+s.level*20);
          if(s.level===shifts.length)api.finish(true,'All three clockwork queues are back in perfect order!');
          else {s.level++;setup(s);s.note='Sorted! The next shift is ready.';}
        }else if(s.moves===0){
          s.fails++;api.beep(145);
          if(s.fails>=3)api.finish(false,'Three jammed shifts stopped the clockwork factory.');
          else {setup(s);s.note='Out of swaps! Shift reset. '+(3-s.fails)+' retries left.';}
        }else s.note=s.moves+' swaps left. Find the next pair.';
      }
      return {
        init(){
          const s=api.state;s.level=1;s.t=110;s.fails=0;
          setup(s);
        },
        action(name){if(/^swap[0-3]$/.test(name))swap(Number(name.slice(4)));},
        tap(x,y){
          const s=api.state;
          if(s.ended||y<174||y>310)return;
          const n=s.queue.length, left=20, cell=320/n;
          for(let i=0;i<n-1;i++){
            const gap=left+(i+1)*cell;
            if(Math.abs(x-gap)<=18){swap(i);return;}
          }
        },
        timeout(){if(!api.state.ended)api.finish(false,'The factory bell rang before the parcels were sorted.');},
        draw(){
          const s=api.state;
          base('#171d35');
          T('CLOCKWORK QUEUE',180,38,23,U.mint);
          T('SHIFT '+s.level+'/3  •  JAMS '+s.fails+'/3',180,69,14,U.yellow);
          T('ORDER THE PARCELS: 1 → '+s.queue.length,180,112,17,U.white);
          T('SWAPS LEFT: '+s.moves,180,144,17,U.yellow);
          const n=s.queue.length,cell=320/n;
          s.queue.forEach((number,i)=>{
            const x=20+i*cell;
            R(x+4,197,cell-8,77,['#4c6f9b','#745c9e','#7b7560','#468779','#985f76'][number-1],10);
            T(String(number),x+cell/2,245,28,U.white);
            if(i<n-1){
              O(x+cell,278,17,'#e9bb61');
              T('↔',x+cell,284,20,'#18243a');
            }
          });
          T('TAP THE ↔ BETWEEN PARCELS',180,338,15,U.mint);
          R(20,379,320,56,'#2b3651',11);
          T(s.note,180,408,12,U.white);
        }
      };
    }
  );
})();
