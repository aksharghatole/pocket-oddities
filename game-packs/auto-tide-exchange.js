/* Tide Exchange — balance a harbor's cargo by swapping adjacent stacks. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Tide Exchange','strategy','⚓','Exchange cargo between neighboring docks to balance their loads.','Tap a dock, then an adjacent dock to transfer one crate. Match the target loads in three harbors. Each transfer costs one tide token. Tap the same dock to cancel.'],
    api => {
      const {base,R,T,L,O}=api.art;
      const stages=[
        {start:[4,0,2,2],goal:[2,2,2,2],budget:5},
        {start:[0,4,0,4],goal:[2,1,3,2],budget:7},
        {start:[5,0,3,0],goal:[1,3,1,3],budget:11}
      ];
      const X=20,W=80,Y=145;
      function reset(s){const p=stages[s.level-1];s.loads=p.start.slice();s.left=p.budget;s.selected=-1;s.note='Select a dock with cargo.';}
      function end(s,won,msg){s.pending=true;setTimeout(()=>{if(api.state===s&&!s.ended&&s.pending)api.finish(won,msg);},180);}
      function select(i){
        const s=api.state,p=stages[s.level-1];
        if(s.ended||s.pending)return;
        if(s.selected===i){s.selected=-1;s.note='Selection cleared.';return;}
        if(s.selected<0){if(!s.loads[i]){s.note='That dock is empty.';return;}s.selected=i;s.note='Choose a neighboring dock.';return;}
        const from=s.selected;
        if(Math.abs(from-i)!==1){s.note='Only neighboring docks can exchange.';return;}
        if(s.loads[i]>=5){s.note='Destination is full (5 crates).';return;}
        s.loads[from]--;s.loads[i]++;s.left--;s.selected=-1;api.beep(440);
        if(s.loads.every((v,j)=>v===p.goal[j])){
          api.addScore(100+20*s.left);
          if(s.level===stages.length){s.note='Harbor balanced!';end(s,true,'All three harbors balanced!');return;}
          s.level++;reset(s);s.note='New harbor, fresh tide tokens.';return;
        }
        if(!s.left){end(s,false,'The tide ran out before the cargo balanced.');return;}
        s.note='Cargo moved. Select another dock.';
      }
      return {
        init(){const s=api.state;s.level=1;s.t=180;s.pending=false;reset(s);api.controls([]);},
        tap(x,y){if(x>=X&&x<X+4*W&&y>=Y&&y<365)select(Math.floor((x-X)/W));},
        timeout(){const s=api.state;if(!s.pending&&!s.ended)api.finish(false,'The harbor closed.');},
        draw(){
          const s=api.state,p=stages[s.level-1];base('#102c40');
          T('TIDE EXCHANGE',180,32,25,'#d6f5ee');
          T('HARBOR '+s.level+'/3  ·  '+s.left+' TIDE TOKENS',180,65,14,'#ffd58a');
          R(20,84,320,35,'#21465b',9);
          T('Move one crate between adjacent docks',180,102,12,'#ffffff');
          for(let i=0;i<4;i++){
            const x=X+i*W,ok=s.loads[i]===p.goal[i];
            R(x+3,Y,W-6,220,s.selected===i?'#526d78':'#193c50',10);
            T('DOCK '+(i+1),x+40,Y+20,12,'#d6f5ee');
            T('TARGET '+p.goal[i],x+40,Y+43,12,'#ffd58a');
            for(let j=0;j<5;j++){
              const y=Y+164-j*22;
              R(x+15,y,50,18,j<s.loads[i]?'#dba35e':'#294e61',4);
              if(j<s.loads[i])L(x+20,y+4,x+60,y+4,'#ffe0a1',1);
            }
            T(s.loads[i]+' / '+p.goal[i]+(ok?' ✓':''),x+40,Y+201,14,ok?'#8ef0c8':'#ffffff');
          }
          for(let i=0;i<4;i++)O(60+i*80,386,5,s.selected===i?'#ffd58a':'#426b80');
          T(s.note,180,415,12,'#ffffff');
          T('Tap source, then neighboring destination',180,438,11,'#9bc4d5');
        }
      };
    }
  );
})();
