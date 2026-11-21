/* Mirror Moth — reflect a lantern moth through a glowing mirror line. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Mirror Moth','puzzle','🦋','Catch the reflected moth, not the real one.','Study the bright moth and the glowing mirror. Tap where its reflection belongs. Vertical, horizontal and double mirrors appear across 9 rounds. Three mistakes end the hunt.'],
    api => {
      const {base,R,O,S,L,T}=api.art, U=api.colors;
      const spots=[68,124,180,236,292];
      const stages=['vertical','vertical','horizontal','horizontal','both','vertical','horizontal','both','both'];
      function newRound(s) {
        const mode=stages[s.round-1];
        // Never place the source on either mirror line.
        const xs=[68,124,236,292], ys=[110,166,278,334];
        s.source={x:xs[(s.round*3+1)%xs.length],y:ys[(s.round*5+2)%ys.length]};
        s.mode=mode;
        s.target={x:mode==='vertical'||mode==='both'?360-s.source.x:s.source.x,
                  y:mode==='horizontal'||mode==='both'?444-s.source.y:s.source.y};
        s.note='Tap the empty spot where the reflection should be.';
      }
      function pick(x,y) {
        const s=api.state;
        if(s.ended)return;
        if(Math.hypot(x-s.target.x,y-s.target.y)<=28) {
          api.addScore(100+Math.max(0,3-s.mistakes)*10);
          api.beep(520);
          if(s.round===stages.length) {
            api.finish(true,'Nine reflections caught! The moths return to their lantern.');
          } else {
            s.round++;s.level=s.round;newRound(s);
          }
        } else if(y>=76&&y<=374) {
          s.mistakes++;
          api.beep(170);
          if(s.mistakes>=3)api.finish(false,'The mirrors went dark. Try again!');
          else s.note='Not there! '+(3-s.mistakes)+' chances left.';
        }
      }
      return {
        init() {
          const s=api.state;
          s.t=100;s.round=1;s.level=1;s.mistakes=0;
          newRound(s);api.controls([]);
        },
        tap:pick,
        timeout(){if(!api.state.ended)api.finish(false,'The lantern faded before the last reflection.');},
        draw(){
          const s=api.state;
          base('#101b32');
          T('MIRROR MOTH',180,33,23,U.mint);
          T('ROUND '+s.round+'/9  •  MISTAKES '+s.mistakes+'/3',180,60,14,U.yellow);
          R(25,77,310,302,'#202c4b',14);
          for(const x of spots)for(const y of [110,166,222,278,334])O(x,y,2,'#526487');
          if(s.mode==='vertical'||s.mode==='both')L(180,81,180,372,U.mint,3);
          if(s.mode==='horizontal'||s.mode==='both')L(30,222,330,222,U.pink,3);
          O(s.source.x,s.source.y,20,U.yellow);
          S(s.source.x,s.source.y,26,U.white,2);
          T('✦',s.source.x,s.source.y+7,25,'#24304a');
          T(s.mode==='both'?'REFLECT ACROSS BOTH LINES':s.mode==='vertical'?'REFLECT LEFT ↔ RIGHT':'REFLECT TOP ↕ BOTTOM',180,402,13,U.mint);
          T(s.note,180,428,11,U.white);
        }
      };
    }
  );
})();
