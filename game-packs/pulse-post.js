/* Pulse Post — charge a parcel's spring to its delivery window. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Pulse Post','reflex','📮','Charge a spring-powered parcel and release it inside the delivery window.','Press and hold anywhere in the arena to charge the spring; release when the moving needle is inside the green delivery band. Deliver six parcels. Three misses end your shift. Tap or use the large CHARGE button below the arena.'],
    api => {
      const {base,R,O,T}=api.art, U=api.colors;
      const targets=[38,66,26,74,47,58];
      const widths=[16,15,13,12,10,9];
      function resetCharge(s){s.charge=0;s.holding=false;s.direction=1;}
      function deliver(){
        const s=api.state;
        if(s.ended||!s.holding)return;
        s.holding=false;
        const error=Math.abs(s.charge-targets[s.level-1]);
        if(error<=widths[s.level-1]/2){
          api.addScore(100+Math.round((widths[s.level-1]/2-error)*12));
          api.beep(620);
          if(s.level===targets.length){api.finish(true,'All six parcels delivered! The postmaster salutes you.');return;}
          s.level++;
          s.note='Delivered! Charge the next parcel.';
        }else{
          s.misses++;
          api.beep(170);
          if(s.misses>=3){api.finish(false,'Three parcels missed their delivery windows.');return;}
          s.note='Missed the band. '+(3-s.misses)+' chances remain.';
        }
        resetCharge(s);
      }
      function begin(){const s=api.state;if(!s.ended&&!s.holding){s.holding=true;s.note='Release inside the green band!';}}
      return {
        init(){
          const s=api.state;
          s.t=95;s.level=1;s.misses=0;s.note='Hold to charge; release inside green.';
          resetCharge(s);
          api.controls([['HOLD TO CHARGE','charge',true],['RELEASE','release',true]]);
        },
        down(){begin();},
        up(){deliver();},
        tap(){/* Down/up own the touch gesture; avoid duplicate delivery. */},
        action(name){if(name==='charge')begin();else if(name==='release')deliver();},
        update(dt){
          const s=api.state;
          if(s.ended||!s.holding)return;
          s.charge+=s.direction*dt*(48+4*(s.level-1));
          if(s.charge>=100){s.charge=100;s.direction=-1;}
          if(s.charge<=0){s.charge=0;s.direction=1;}
        },
        timeout(){if(!api.state.ended)api.finish(false,'The post office closed before your last delivery.');},
        draw(){
          const s=api.state,target=targets[s.level-1],width=widths[s.level-1];
          base('#16243a');
          T('PULSE POST',180,42,25,U.yellow);
          T('PARCEL '+s.level+'/6   •   MISSES '+s.misses+'/3',180,75,14,U.white);
          T('Hold to wind the spring',180,113,15,U.muted);
          R(30,178,300,55,'#35455e',14);
          R(30+(target-width/2)*3,178,width*3,55,'#74dca8',7);
          R(30+s.charge*3-3,166,6,80,'#fff5c6',3);
          T(Math.round(s.charge)+'%',180,281,34,U.white);
          O(180,343,44,s.holding?'#f0b768':'#547b9d');
          T(s.holding?'HOLD':'PRESS',180,350,17,U.white);
          R(18,402,324,39,'#293b52',9);
          T(s.note,180,423,12,U.white);
        }
      };
    }
  );
})();