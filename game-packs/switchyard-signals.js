/* Switchyard Signals — route approaching cargo trains to matching depots. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Switchyard Signals','reflex','🚂','Flip the junction before each cargo train reaches the fork.','Each approaching train has a colored cargo symbol. Tap the matching depot button (or depot on the canvas) before the train reaches the fork. Route 12 trains correctly; three misroutes end the shift.'],
    api => {
      const {base,R,O,L,T}=api.art, U=api.colors;
      const depots=[
        {name:'SUN',symbol:'◆',color:'#ffcc70',x:72},
        {name:'MOON',symbol:'●',color:'#8cd9ff',x:180},
        {name:'LEAF',symbol:'▲',color:'#9bf0b7',x:288}
      ];
      const sequence=[0,2,1,1,0,2,2,0,1,2,1,0];
      function advance(s) {
        s.done++;
        if(s.done===sequence.length){
          api.finish(true,'All twelve deliveries reached their depots. Junction mastered!');
          return;
        }
        s.level=1+Math.floor(s.done/4);
        s.target=sequence[s.done];
        s.progress=0;
        s.selected=1;
        s.note='Train '+(s.done+1)+' approaching — choose a depot!';
      }
      function choose(i){
        const s=api.state;
        if(s.ended||i<0||i>2)return;
        s.selected=i;
        s.note=depots[i].name+' track selected';
        api.beep(320+i*90);
      }
      return {
        init(){
          const s=api.state;
          s.t=100;s.level=1;s.done=0;s.errors=0;
          s.target=sequence[0];s.selected=1;s.progress=0;
          s.note='Match the cargo symbol to its depot.';
          api.controls([['◆ SUN','sun',true],['● MOON','moon',true],['▲ LEAF','leaf',true]]);
        },
        action(name){
          const i={sun:0,moon:1,leaf:2}[name];
          if(i!==undefined)choose(i);
        },
        tap(x,y){
          if(y>=95&&y<=190)choose(x<120?0:x<240?1:2);
        },
        update(dt){
          const s=api.state;
          if(s.ended)return;
          // Clamp unusually long frames so backgrounding the app is not an instant loss.
          s.progress+=Math.min(dt,.1)/(4.2-.45*(s.level-1));
          if(s.progress<1)return;
          if(s.selected===s.target){
            api.addScore(100+25*s.level);
            s.note='Delivered!';
          }else{
            s.errors++;
            api.beep(150);
            s.note='Wrong depot! '+(3-s.errors)+' chances left.';
            if(s.errors>=3){
              api.finish(false,'Three trains reached the wrong depot. Try the shift again.');
              return;
            }
          }
          advance(s);
        },
        timeout(){
          if(!api.state.ended)api.finish(false,'The shift ended before all trains were routed.');
        },
        draw(){
          const s=api.state;
          base('#151d34');
          T('SWITCHYARD SIGNALS',180,36,22,U.yellow);
          T('DELIVERED '+s.done+'/12   •   ERRORS '+s.errors+'/3',180,66,13,U.white);
          depots.forEach((d,i)=>{
            const active=s.selected===i;
            R(d.x-49,98,98,85,active?'#445477':'#283650',13);
            R(d.x-43,104,86,73,d.color,10);
            T(d.symbol,d.x,130,29,'#17253c');
            T(d.name,d.x,159,12,'#17253c');
            if(active)T('▼',d.x,194,17,U.yellow);
            L(180,348,d.x,214,active?U.yellow:'#52627e',active?6:3);
          });
          L(180,427,180,349,'#9ba8be',6);
          const y=420-72*Math.min(1,s.progress);
          R(130,y-23,100,47,'#e2e7ee',11);
          R(140,y-15,80,28,depots[s.target].color,8);
          T(depots[s.target].symbol,180,y+4,27,'#19243b');
          O(148,y+25,9,'#4e5c72');O(212,y+25,9,'#4e5c72');
          R(28,260,304,15,'#303d57',7);
          R(28,260,304*Math.min(1,s.progress),15,U.mint,7);
          T('TRAIN '+(s.done+1)+' / 12  •  STAGE '+s.level+'/3',180,246,13,U.white);
          T('Tap the matching depot before the bar fills',180,297,12,U.muted);
          T('CARGO: '+depots[s.target].symbol+'  '+depots[s.target].name,180,322,17,depots[s.target].color);
          T(s.note,180,443,11,U.white);
        }
      };
    }
  );
})();
