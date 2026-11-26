/* Counterspin Observatory — spot the one moon orbiting backwards. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Counterspin Observatory','reflex','🪐','Find the moon that orbits against the others.','Watch the four moving moons. Three orbit clockwise; one moves counterclockwise. Tap the backwards moon to advance through three skies. Three wrong guesses or the 100-second clock ends your shift.'],
    api => {
      const {base,R,O,S,T,L}=api.art, C=api.colors;
      const centers=[[98,159],[262,159],[98,314],[262,314]];
      const stages=[{odd:2,speed:1.45},{odd:0,speed:1.95},{odd:3,speed:2.4}];
      function resetSky(s){
        s.phase=0;s.odd=stages[s.level-1].odd;
        s.speed=stages[s.level-1].speed;
        s.note='Watch the direction, then tap the odd orbit.';
      }
      return {
        init(){
          const s=api.state;
          s.level=1;s.t=100;s.mistakes=0;s.phase=0;
          resetSky(s);api.controls([]);
        },
        update(dt){api.state.phase+=Math.min(dt,.05)*api.state.speed;},
        tap(x,y){
          const s=api.state;
          if(s.ended)return;
          const choice=centers.findIndex(([cx,cy])=>Math.hypot(x-cx,y-cy)<=69);
          if(choice<0)return;
          if(choice!==s.odd){
            s.mistakes++;api.beep(170);
            s.note='That moon follows the crowd. '+(3-s.mistakes)+' guesses left.';
            if(s.mistakes>=3)api.finish(false,'The observatory closed. Watch the orbit direction carefully.');
            return;
          }
          api.addScore(25+Math.max(0,3-s.mistakes)*5);
          if(s.level===3){
            api.finish(true,'Three backwards moons spotted. The night sky is mapped!');
            return;
          }
          s.level++;resetSky(s);api.beep(700);
        },
        timeout(){if(!api.state.ended)api.finish(false,'Dawn arrived before you mapped every sky.');},
        draw(){
          const s=api.state;
          base('#10192e');
          T('COUNTERSPIN OBSERVATORY',180,37,20,C.yellow);
          T('SKY '+s.level+'/3  ·  WRONG '+s.mistakes+'/3',180,68,13,C.mint);
          T('Which moon moves the OTHER way?',180,91,13,C.white);
          centers.forEach(([cx,cy],i)=>{
            R(cx-70,cy-65,140,130,'#222e4a',15);
            S(cx,cy,42,'#627494',2);
            O(cx,cy,13,'#e7c17e');
            const angle=(i===s.odd?-1:1)*s.phase+(i*.9);
            const mx=cx+42*Math.cos(angle),my=cy+42*Math.sin(angle);
            L(cx,cy,mx,my,'#536786',1);
            O(mx,my,12,['#8ce6de','#f3a7d3','#c7b4ff','#a6d7ff'][i]);
            T(String(i+1),cx,cy+56,12,C.white);
          });
          R(22,402,316,37,'#293754',11);
          T(s.note,180,420,11,C.white);
        }
      };
    }
  );
})();
