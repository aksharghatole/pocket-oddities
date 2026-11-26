/* Ribbon Cutter — partition a ribbon into exact requested lengths. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Ribbon Cutter','puzzle','✂️','Measure and snip ribbons into the requested lengths.','Each ribbon is 14 units long. Tap the ribbon at ruler ticks to place or remove cuts, then press CHECK. Match the ordered segment lengths shown below the ribbon. Solve three orders before three wrong checks or time runs out.'],
    api => {
      const {base,R,L,T}=api.art, C=api.colors;
      const orders=[[3,4,7],[2,5,3,4],[4,2,3,2,3]];
      const left=40,top=178,unit=20;
      function goalCuts(parts) {
        let sum=0;
        return parts.slice(0,-1).map(n=>(sum+=n));
      }
      function segments(cuts) {
        let previous=0;
        return [...cuts,14].map(n=>{const size=n-previous;previous=n;return size;});
      }
      function stage(s) {
        s.cuts=[];
        s.note='Tap ruler ticks to place your cuts.';
      }
      function check() {
        const s=api.state;
        if(s.ended)return;
        const expected=goalCuts(orders[s.level-1]);
        if(s.cuts.length===expected.length&&s.cuts.every((n,i)=>n===expected[i])){
          api.addScore(120+(3-s.errors)*25+s.level*20);
          api.beep(660);
          if(s.level===orders.length)api.finish(true,'Every ribbon measured and cut perfectly!');
          else {s.level++;stage(s);s.note='Perfect cut! Next order is trickier.';}
        } else {
          s.errors++;
          api.beep(160);
          s.note='Not quite. '+(3-s.errors)+' checks remaining.';
          if(s.errors>=3)api.finish(false,'The workshop ran out of spare ribbon.');
        }
      }
      return {
        init(){
          const s=api.state;
          s.t=145;s.level=1;s.errors=0;
          stage(s);
          api.controls([['CHECK CUTS','check',true],['REMOVE ALL','clear',false]]);
        },
        tap(x,y){
          const s=api.state;
          if(s.ended||y<top-27||y>top+78||x<left+unit/2||x>left+14*unit-unit/2)return;
          const tick=Math.round((x-left)/unit);
          if(tick<1||tick>13||Math.abs(x-(left+tick*unit))>unit*.44)return;
          const index=s.cuts.indexOf(tick);
          if(index>=0)s.cuts.splice(index,1);
          else {s.cuts.push(tick);s.cuts.sort((a,b)=>a-b);}
          s.note='Cuts: '+s.cuts.length+' · Segments: '+segments(s.cuts).join(' / ');
          api.beep(index>=0?280:460);
        },
        action(name){
          const s=api.state;
          if(s.ended)return;
          if(name==='check')check();
          if(name==='clear'){s.cuts=[];s.note='Cuts cleared. Try a new arrangement.';}
        },
        timeout(){if(!api.state.ended)api.finish(false,'The ribbon orders were not finished in time.');},
        draw(){
          const s=api.state,parts=orders[s.level-1],actual=segments(s.cuts);
          base('#211b32');
          T('RIBBON CUTTER',180,38,24,C.yellow);
          T('ORDER '+s.level+'/3  ·  WRONG CHECKS '+s.errors+'/3',180,69,13,C.mint);
          T('Cut 14 units into these lengths:',180,103,14,C.white);
          T(parts.join('  +  '),180,133,24,C.yellow);
          R(left-8,top-29,296,116,'#342d4c',13);
          R(left,top,280,54,'#ed9bb6',8);
          for(let i=0;i<=14;i++){
            const x=left+i*unit;
            L(x,top-12,x,top+(i%2===0?7:1),'#e8dce9',2);
            if(i%2===0)T(String(i),x,top-19,10,C.white);
          }
          s.cuts.forEach(n=>{
            const x=left+n*unit;
            L(x,top-4,x,top+58,'#2b2341',4);
            T('✂',x,top+34,19,C.white);
          });
          T('Tap a tick to cut · tap again to undo',180,280,13,C.muted);
          T('CURRENT PIECES',180,315,12,C.mint);
          T(actual.join('  +  '),180,345,22,C.white);
          T('Goal: '+parts.length+' pieces · Current: '+actual.length,180,377,12,C.yellow);
          R(14,405,332,35,'#342d4c',10);
          T(s.note.length>46?s.note.slice(0,43)+'…':s.note,180,424,11,C.white);
        }
      };
    }
  );
})();
