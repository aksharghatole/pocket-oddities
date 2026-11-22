/* Orbit Harvest — one-tap timing game: collect passing satellites in the lit arc. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Orbit Harvest','reflex','🪐','Catch wandering satellites as they cross the harvest gate.','Tap anywhere in the arena, or press HARVEST, when the orbiting satellite enters the glowing arc at the top. Collect 4, then 5, then 6 satellites. Three misses or an expired clock end the shift.'],
    api => {
      const {base,R,O,S,L,T}=api.art, U=api.colors;
      const goals=[4,5,6], cx=180, cy=235, radius=105;
      const gate=-Math.PI/2, halfWidth=.43;
      const difference=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
      function harvest(){
        const s=api.state;
        if(s.ended || s.cooldown>0)return;
        s.cooldown=.18;
        if(Math.abs(difference(s.angle,gate))<=halfWidth){
          s.caught++;api.addScore(20+s.level*10);api.beep(520);
          s.note='Perfect catch! The next satellite is approaching.';
          s.angle=gate+Math.PI*(s.direction>0?1:-1);
          if(s.caught>=goals[s.level-1]){
            api.addScore(75+s.level*25);
            if(s.level===goals.length){
              api.finish(true,'All three orbital harvests complete!');
              return;
            }
            s.level++;s.caught=0;s.direction*=-1;
            s.angle=gate+Math.PI*(s.direction>0?1:-1);
            s.note='New orbit! Watch the direction change.';
          }
        }else{
          s.misses++;api.beep(170);
          s.note='Missed the gate! '+(3-s.misses)+' chances left.';
          if(s.misses>=3)api.finish(false,'The satellites drifted away. Try again!');
        }
      }
      return {
        init(){
          const s=api.state;
          s.t=95;s.level=1;s.caught=0;s.misses=0;s.cooldown=0;
          s.angle=gate+Math.PI;s.direction=1;
          s.note='Tap when the satellite reaches the glowing gate.';
          api.controls([['HARVEST','harvest',true]]);
        },
        tap(){harvest();},
        action(name){if(name==='harvest')harvest();},
        update(dt){
          const s=api.state;
          if(s.ended)return;
          s.cooldown=Math.max(0,s.cooldown-dt);
          s.angle+=s.direction*(1.5+(s.level-1)*.38)*dt;
        },
        timeout(){if(!api.state.ended)api.finish(false,'The orbital shift ended before the harvest was complete.');},
        draw(){
          const s=api.state;
          base('#10182d');
          T('ORBIT HARVEST',180,37,22,U.mint);
          T('ORBIT '+s.level+'/3  •  MISSES '+s.misses+'/3',180,66,14,U.yellow);
          S(cx,cy,radius,'#46567a',4);
          for(let i=0;i<=20;i++){
            const a=gate-halfWidth+(2*halfWidth*i/20);
            const x=cx+radius*Math.cos(a),y=cy+radius*Math.sin(a);
            O(x,y,6,U.mint);
          }
          O(cx,cy,46,'#283957');
          S(cx,cy,46,'#6a86ad',3);
          T('✦',cx,cy+12,42,U.yellow);
          const x=cx+radius*Math.cos(s.angle),y=cy+radius*Math.sin(s.angle);
          L(cx,cy,x,y,'#344866',2);
          O(x,y,18,'#f5b8db');S(x,y,18,U.white,2);
          O(x-5,y-5,5,U.white);
          R(24,370,312,64,'#273550',12);
          T('COLLECTED '+s.caught+'/'+goals[s.level-1],180,392,16,U.yellow);
          T(s.note,180,416,11,U.white);
          T('TAP ANYWHERE TO HARVEST',180,447,11,U.mint);
        }
      };
    }
  );
})();
