/* Orbit Locksmith — time taps to stop orbiting tumblers inside the glowing gate. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Orbit Locksmith','reflex','🪐','Crack tiny celestial locks by timing the orbiting key.','Watch the orbiting dot. Tap the arena or LOCK button while it crosses the bright gate. Align three rings to open each lock. Open five locks before time or mistakes run out.'],
    api => {
      const {base,R,O,S,L,T}=api.art, U=api.colors;
      const TAU=Math.PI*2, CX=180,CY=229, RADII=[68,100,132];
      const difference=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
      const position=(radius,angle)=>[CX+radius*Math.cos(angle),CY+radius*Math.sin(angle)];
      function setup(s) {
        s.ring=0;
        s.angle=-Math.PI/2;
        s.gate=((s.level*1.91+0.4)%TAU)-Math.PI;
        s.speed=1.65+(s.level-1)*.22;
        s.note='Catch the glowing gate!';
      }
      function lock() {
        const s=api.state;
        if(s.ended)return;
        const tolerance=.32;
        if(difference(s.angle,s.gate)<=tolerance){
          api.addScore(10+s.level*2);
          api.beep(650);
          s.ring++;
          if(s.ring===3){
            if(s.level===5){api.finish(true,'All five celestial locks opened!');return;}
            s.level++;s.t=Math.min(95,s.t+8);setup(s);
            s.note='Lock '+s.level+' of 5 — keep going!';
          }else{
            s.gate+=1.63;
            s.angle+=.37;
            s.note='Aligned! '+s.ring+'/3 rings secured';
          }
        }else{
          s.misses++;
          api.beep(180);
          if(s.misses>=4){api.finish(false,'Four missed gates. The locks reset. Try again!');return;}
          s.note='Missed! '+(4-s.misses)+' chances remain';
        }
      }
      return {
        init(){
          const s=api.state;
          s.level=1;s.t=95;s.misses=0;
          setup(s);
          api.controls([['LOCK','lock',true]]);
        },
        tap(){lock();},
        action(name){if(name==='lock')lock();},
        update(dt){
          const s=api.state;
          s.angle=(s.angle+s.speed*dt*(s.ring%2===0?1:-1))%TAU;
          s.t=Math.max(0,s.t-dt);
          if(s.t<=0)api.finish(false,'Time ran out. The orbiting locks stayed shut.');
        },
        draw(){
          const s=api.state;
          base('#101b32');
          T('ORBIT LOCKSMITH',180,33,22,U.mint);
          T('LOCK '+s.level+'/5   ·   RING '+(s.ring+1)+'/3',180,61,14,U.yellow);
          for(let i=0;i<3;i++){
            const radius=RADII[i];
            S(CX,CY,radius,i<s.ring?U.mint:'#405777',i<s.ring?7:4);
            if(i===s.ring){
              const gate=position(radius,s.gate);
              const left=position(radius,s.gate-.32),right=position(radius,s.gate+.32);
              L(left[0],left[1],gate[0],gate[1],U.yellow,12);
              L(gate[0],gate[1],right[0],right[1],U.yellow,12);
              const needle=position(radius,s.angle);
              O(needle[0],needle[1],12,U.pink);
              O(needle[0],needle[1],5,U.white);
            }
          }
          O(CX,CY,32,'#293b57');
          T('🔐',CX,CY+2,31);
          R(26,384,308,43,'#273b55',11);
          T(s.note,180,405,13,U.white);
          T('MISSES '+s.misses+'/4   ·   TAP TO LOCK',180,445,12,U.muted);
        }
      };
    }
  );
})();
