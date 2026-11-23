/* Tea Timer Trio — juggle independent brewing clocks by tapping cups at their perfect steep time. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Tea Timer Trio','strategy','🍵','Serve a tray of teas at their exact steeping moments.','Every cup starts brewing together. Tap each cup when its ring turns mint (within 0.65 seconds of the target). Early taps or oversteeping cost a mistake. Clear three trays before three mistakes or the 90-second shift ends.'],
    api => {
      const {base,R,O,S,T}=api.art, U=api.colors;
      const trays=[[2.5,4.5],[2.2,3.8,5.4],[2.3,3.9,5.5,7.1]];
      const positions=[[92,168],[268,168],[92,320],[268,320]];
      const tolerance=.65;
      function prepare(s){
        s.cups=trays[s.level-1].map((target,i)=>({target,elapsed:0,served:false,expired:false,index:i}));
        s.note='Watch the rings. Tap each cup when mint!';
      }
      function miss(s,message){
        s.mistakes++;
        s.note=message+' · '+(3-s.mistakes)+' chances left';
        api.beep(160);
        if(s.mistakes>=3)api.finish(false,'Three teas were spoiled. Start a fresh shift!');
      }
      function checkTray(s){
        if(s.ended||!s.cups.every(c=>c.served||c.expired))return;
        if(s.level===trays.length)api.finish(true,'All three tea trays served. Perfect timing!');
        else {s.level++;prepare(s);s.note='Tray cleared! The next order is brewing.';}
      }
      return {
        init(){
          const s=api.state;
          s.t=90;s.level=1;s.mistakes=0;
          prepare(s);api.controls([]);
        },
        tap(x,y){
          const s=api.state;
          if(s.ended)return;
          const cup=s.cups.find((c)=>Math.hypot(x-positions[c.index][0],y-positions[c.index][1])<=58);
          if(!cup||cup.served||cup.expired)return;
          if(Math.abs(cup.elapsed-cup.target)<=tolerance){
            cup.served=true;
            api.addScore(100+Math.round((tolerance-Math.abs(cup.elapsed-cup.target))*100)+s.level*15);
            api.beep(540);
            s.note='Beautiful brew! '+s.cups.filter(c=>c.served).length+'/'+s.cups.length+' served';
          }else{
            cup.expired=true;
            miss(s,cup.elapsed<cup.target?'Too early!':'Too late!');
          }
          checkTray(s);
        },
        update(dt){
          const s=api.state;
          if(s.ended)return;
          for(const cup of s.cups){
            if(cup.served||cup.expired)continue;
            cup.elapsed+=dt;
            if(cup.elapsed>cup.target+tolerance){
              cup.expired=true;
              miss(s,'Oversteeped!');
              if(s.ended)return;
            }
          }
          checkTray(s);
        },
        timeout(){if(!api.state.ended)api.finish(false,'Closing time! The last teas went cold.');},
        draw(){
          const s=api.state;
          base('#172337');
          T('TEA TIMER TRIO',180,38,23,U.mint);
          T('TRAY '+s.level+'/3   •   MISTAKES '+s.mistakes+'/3',180,69,14,U.yellow);
          T('TAP THE CUP WHEN THE RING TURNS MINT',180,101,11,U.white);
          s.cups.forEach(c=>{
            const [x,y]=positions[c.index];
            const remaining=c.target-c.elapsed;
            const ready=Math.abs(remaining)<=tolerance;
            const ring=c.served?U.mint:c.expired?'#e57c84':ready?U.mint:U.yellow;
            R(x-68,y-63,136,126,'#293c52',17);
            S(x,y-5,46,ring,6);
            O(x,y-5,34,c.served?'#3b887a':c.expired?'#704354':'#4d6784');
            T(c.served?'✓':c.expired?'✕':remaining>0?remaining.toFixed(1):'NOW',x,y+1,remaining>0?21:22,U.white);
            T(c.served?'SERVED':c.expired?'SPOILED':c.target.toFixed(1)+' SEC',x,y+46,12,ring);
          });
          R(20,402,320,38,'#30465a',10);
          T(s.note,180,424,12,U.white);
        }
      };
    }
  );
})();
