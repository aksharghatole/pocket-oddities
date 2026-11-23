/* Queue Curator — restore an eccentric museum queue using adjacent swaps. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Queue Curator','puzzle','🎟️','Reorder a peculiar museum queue, one neighboring swap at a time.','Tap a visitor, then tap a neighboring visitor to swap them. Arrange badge numbers from 1 at the top to the highest at the bottom. Clear three queues within their swap budgets.'],
    api => {
      const {base,R,O,T}=api.art, U=api.colors;
      const stages=[
        {order:[2,1,3,4],budget:3},
        {order:[3,1,4,2,5],budget:5},
        {order:[4,2,6,1,5,3],budget:10}
      ];
      const hues=['#eaa0b8','#9bdac8','#e9ca80','#9cb7ed','#c7a5ec','#f0aa8c'];
      function load(s){
        const stage=stages[s.level-1];
        s.queue=[...stage.order];s.remaining=stage.budget;s.selected=-1;
        s.note='Select two neighbors to exchange places.';
      }
      function solved(queue){return queue.every((v,i)=>v===i+1);}
      return {
        init(){
          const s=api.state;s.t=125;s.level=1;s.swaps=0;load(s);
          api.controls([]);
        },
        tap(x,y){
          const s=api.state;if(s.ended||x<24||x>336)return;
          const i=Math.floor((y-132)/44);
          if(i<0||i>=s.queue.length||y>132+i*44+39)return;
          if(s.selected===-1){s.selected=i;s.note='Now tap a neighboring visitor.';return;}
          if(i===s.selected){s.selected=-1;s.note='Selection cleared.';return;}
          if(Math.abs(i-s.selected)!==1){s.selected=i;s.note='Only neighboring visitors can swap.';return;}
          const a=s.selected;s.selected=-1;
          [s.queue[a],s.queue[i]]=[s.queue[i],s.queue[a]];
          s.remaining--;s.swaps++;api.beep(330);api.addScore(10);
          if(solved(s.queue)){
            api.addScore(50+s.remaining*20);
            if(s.level===stages.length){api.finish(true,'All three museum queues are in perfect order!');return;}
            s.level++;load(s);s.note='Queue cleared! The next crowd has arrived.';return;
          }
          if(s.remaining<=0){api.finish(false,'The doors opened before the queue was sorted. Try again!');return;}
          s.note='Good swap. '+s.remaining+' exchanges left.';
        },
        timeout(){if(!api.state.ended)api.finish(false,'The museum opened before the last queue was ready.');},
        draw(){
          const s=api.state;base('#151c35');
          T('QUEUE CURATOR',180,34,23,U.mint);
          T('GALLERY '+s.level+'/3  ·  SWAPS LEFT '+s.remaining,180,66,14,U.yellow);
          T('TARGET: 1 → '+s.queue.length+' FROM TOP TO BOTTOM',180,94,12,U.white);
          s.queue.forEach((badge,i)=>{
            const y=132+i*44,chosen=i===s.selected;
            R(27,y,306,39,chosen?'#506186':'#293650',10);
            R(35,y+5,35,29,hues[badge-1],8);
            T(String(badge),52,y+20,18,'#1a2437');
            T('Visitor '+badge,104,y+20,14,U.white,'left');
            if(badge===i+1)T('✓',303,y+20,18,U.mint);
            else if(chosen)T('SELECTED',275,y+20,11,U.yellow);
          });
          R(23,408,314,34,'#25314b',9);
          T(s.note,180,425,11,U.white);
        }
      };
    }
  );
})();
