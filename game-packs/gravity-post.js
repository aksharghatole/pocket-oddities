/* Gravity Post — flip between ceiling and floor to dodge incoming shutters. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Gravity Post','reflex','📮','A gravity-flipping courier races through a dangerous mail tunnel.','Tap anywhere or press FLIP to switch between ceiling and floor. Dodge 15 shutters across three increasingly fast routes. Three collisions end the delivery.'],
    api => {
      const {base,R,O,L,T}=api.art, C=api.colors;
      const routes=[2.4,2.85,3.3];
      function nextGate(s) {
        // Alternate predictable and surprise shutters; always allow a safe lane.
        s.blocked=(s.passed%3===2)?s.lane:(s.passed%2);
        s.gateX=390;
        s.counted=false;
      }
      function flip() {
        const s=api.state;
        if(s.ended)return;
        s.lane=1-s.lane;
        api.beep(340+s.lane*130);
      }
      function collide(s) {
        s.hits++;
        s.note='Shutter hit! '+(3-s.hits)+' chances left';
        api.beep(130);
        if(s.hits>=3)api.finish(false,'The mail was lost in the gravity tunnel. Try again!');
      }
      return {
        init() {
          const s=api.state;
          s.t=100;s.level=1;s.lane=1;s.passed=0;s.hits=0;s.gateX=390;
          s.blocked=0;s.counted=false;s.note='Tap to flip gravity';
          api.controls([['FLIP GRAVITY','flip',true]]);
        },
        action(name) {if(name==='flip')flip();},
        tap() {flip();},
        update(dt) {
          const s=api.state;
          if(s.ended)return;
          // Clamp frame jumps so background tabbing cannot skip an obstacle.
          let remaining=Math.min(dt,.2);
          while(remaining>0&&!s.ended){
            const step=Math.min(remaining,.025);
            s.gateX-=routes[s.level-1]*70*step;
            if(!s.counted&&s.gateX<=102){
              s.counted=true;
              if(s.lane===s.blocked)collide(s);
              else {api.addScore(20+s.level*10);s.note='Safe delivery!';}
            }
            if(s.gateX< -42){
              s.passed++;
              if(s.passed===15){
                api.addScore(Math.max(0,3-s.hits)*50);
                api.finish(true,'All fifteen shutters cleared. Express delivery complete!');
                break;
              }
              s.level=Math.floor(s.passed/5)+1;
              nextGate(s);
            }
            remaining-=step;
          }
        },
        timeout(){if(!api.state.ended)api.finish(false,'The tunnel closed before the mail arrived.');},
        draw(){
          const s=api.state;
          base('#101a30');
          T('GRAVITY POST',180,35,23,C.mint);
          T('ROUTE '+s.level+'/3  •  GATES '+s.passed+'/15',180,65,14,C.yellow);
          R(20,106,320,240,'#253451',14);
          L(20,226,340,226,'#617396',2);
          R(25,113,310,12,'#58738c',4);
          R(25,329,310,12,'#58738c',4);
          const y=s.lane===0?154:293;
          O(102,y,21,C.yellow);
          R(89,y-10,26,20,'#f8d8a1',4);
          T('✉',102,y+6,19,'#27324b');
          const gy=s.blocked===0?115:231;
          R(s.gateX,gy,34,112,'#e66e88',6);
          R(s.gateX+6,gy+8,22,96,'#ffb1bd',4);
          T(s.blocked===0?'CEILING BLOCKED':'FLOOR BLOCKED',180,375,12,C.pink);
          R(22,390,316,48,'#273653',12);
          T('♥ '.repeat(Math.max(0,3-s.hits))+'  '+s.note,180,419,13,C.white);
        }
      };
    }
  );
})();
