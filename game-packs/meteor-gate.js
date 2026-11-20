/* Meteor Gate — time a rotating beacon to catch falling meteors. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Meteor Gate','reflex','☄️','Catch wandering meteors by timing a spinning gate.','Tap anywhere or press CATCH when the moving pointer overlaps the glowing green sector. Catch four meteors in each of three skies. Three misses or an expired timer ends the watch.'],
    api => {
      const {base,R,O,S,L,T}=api.art, C=api.colors;
      const TAU=Math.PI*2;
      const wrap=a=>(a%TAU+TAU)%TAU;
      const distance=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
      function newSky(s){
        s.caught=0;
        s.angle=-Math.PI/2;
        s.target=wrap(0.5+s.level*0.85);
        s.width=0.85-(s.level-1)*0.13;
        s.speed=1.8+(s.level-1)*0.55;
        s.message='Tap when the pointer reaches the green gate.';
      }
      function catchMeteor(){
        const s=api.state;
        if(s.ended)return;
        if(distance(s.angle,s.target)<=s.width/2){
          s.caught++;
          api.addScore(25+s.level*10);
          api.beep(520);
          if(s.caught===4){
            api.addScore(50);
            if(s.level===3){
              api.finish(true,'All twelve meteors safely guided home!');
              return;
            }
            s.level++;
            newSky(s);
            s.message='New sky! The beacon spins faster.';
          }else{
            s.target=wrap(s.target+1.65+0.23*s.caught);
            s.message='Captured! Find the next green gate.';
          }
        }else{
          s.misses++;
          api.beep(145);
          s.message='Missed! '+(3-s.misses)+' chances left.';
          if(s.misses>=3)api.finish(false,'Three meteors escaped the watch.');
        }
      }
      return {
        init(){
          const s=api.state;
          s.t=90;s.level=1;s.misses=0;
          newSky(s);
          api.controls([['☄ CATCH','catch',true]]);
        },
        action(name){if(name==='catch')catchMeteor();},
        tap(){catchMeteor();},
        update(dt){
          const s=api.state;
          if(!s.ended)s.angle=wrap(s.angle+s.speed*Math.min(dt,0.1));
        },
        timeout(){if(!api.state.ended)api.finish(false,'The meteor shower has passed.');},
        draw(){
          const s=api.state;
          base('#10182d');
          T('METEOR GATE',180,43,24,C.yellow);
          T('SKY '+s.level+'/3  ·  CAUGHT '+s.caught+'/4',180,76,15,C.white);
          const cx=180,cy=234,r=110;
          S(cx,cy,r,'#475578',12);
          // The gate is drawn as short overlapping dots to avoid depending on canvas internals.
          for(let i=0;i<=32;i++){
            const a=s.target-s.width/2+s.width*i/32;
            O(cx+Math.cos(a)*r,cy+Math.sin(a)*r,7,'#74e8a7');
          }
          const px=cx+Math.cos(s.angle)*r,py=cy+Math.sin(s.angle)*r;
          L(cx,cy,px,py,C.yellow,5);
          O(px,py,14,C.yellow);
          O(cx,cy,24,'#33466b');
          T('☄',cx,cy+10,29,C.white);
          T('MISSES '+s.misses+'/3',180,367,16,s.misses?C.pink:C.mint);
          R(18,389,324,47,'#263650',12);
          T(s.message,180,417,12,C.white);
        }
      };
    }
  );
})();
