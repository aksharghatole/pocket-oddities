/* Moon Mail Sorter — one-finger postal sorting against a ticking clock. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Moon Mail Sorter','reflex','📮','Sort cosmic parcels into the right moon mailboxes before your shift ends.','Read the symbol on each parcel. Tap its matching mailbox or use the large labeled buttons. Deliver 15 parcels before time runs out; 3 mistakes end your shift.'],
    api => {
      const {base,R,O,S,L,T}=api.art, U=api.colors, {irnd}=api.helpers;
      const symbols=['★','◆','●'], names=['STAR','DIAMOND','MOON'];
      const hues=['#ffe18d','#91baff','#8af0c8'];
      const boxes=[{x:15,y:258},{x:127,y:258},{x:239,y:258}];
      function nextParcel(){
        const s=api.state;
        s.parcel=irnd(0,2);
        s.travel=0;
        s.note='Sort the '+names[s.parcel]+' parcel';
      }
      function sort(which){
        const s=api.state;
        if(s.ended||s.cooldown>0)return;
        if(which===s.parcel){
          api.addScore(10+Math.max(0,Math.floor((s.t||0)/10)));
          s.delivered++;s.combo++;s.note='Delivered! '+s.delivered+'/15';
          api.beep(640);
          if(s.delivered>=15){api.finish(true,'All 15 cosmic parcels delivered! The moon postmaster approves.');return;}
        }else{
          s.mistakes++;s.combo=0;s.note='Wrong mailbox! '+(3-s.mistakes)+' chances left';
          api.beep(170);
          if(s.mistakes>=3){api.finish(false,'Three parcels went astray. Try matching the symbol before tapping.');return;}
        }
        nextParcel();s.cooldown=.18;
      }
      return {
        init(){
          const s=api.state;
          s.t=75;s.level=1;s.delivered=0;s.mistakes=0;s.combo=0;s.cooldown=0;
          nextParcel();
          api.controls([['★ STAR','star',true],['◆ DIAMOND','diamond'],['● MOON','moon']]);
        },
        action(name){const i=['star','diamond','moon'].indexOf(name);if(i>=0)sort(i);},
        tap(x,y){
          if(y>=251&&y<=393){
            const i=boxes.findIndex(b=>x>=b.x&&x<=b.x+106);
            if(i>=0)sort(i);
          }
        },
        update(dt){
          const s=api.state;
          s.cooldown=Math.max(0,s.cooldown-dt);
          s.travel=Math.min(1,s.travel+dt*.16);
          s.level=1+Math.floor(s.delivered/5);
        },
        timeout(){api.finish(false,'The postal shift ended before all 15 parcels were delivered.');},
        draw(){
          const s=api.state;
          base('#17223b');
          T('MOON MAIL',180,39,25,U.yellow);
          T('DELIVER '+s.delivered+'/15',180,74,16,U.mint);
          T('MISROUTED '+s.mistakes+'/3',180,99,13,s.mistakes?U.red:U.muted);
          R(30,125,300,101,'#283756',17);
          L(40,210,320,210,'#62738f',7);
          for(let i=0;i<8;i++)O(54+i*37,210,5,'#b3c3e5');
          const px=180+Math.sin(s.travel*Math.PI*2)*17;
          R(px-48,137,96,65,'#f2d5a1',12);
          R(px-44,143,88,53,'#ffe9c6',8);
          T(symbols[s.parcel],px,166,35,'#25314b');
          T(names[s.parcel]+' PARCEL',180,242,12,U.white);
          boxes.forEach((b,i)=>{
            R(b.x,b.y,106,129,'#293c5d',14);
            R(b.x+7,b.y+8,92,112,hues[i],10);
            R(b.x+17,b.y+45,72,11,'#283b59',5);
            T(symbols[i],b.x+53,b.y+29,28,'#1b2d48');
            T(names[i],b.x+53,b.y+91,11,'#1b2d48');
            T('TAP',b.x+53,b.y+108,10,'#1b2d48');
          });
          T(s.note,180,412,12,U.white);
          T('Match symbol • 3 strikes ends shift',180,437,11,U.muted);
        }
      };
    }
  );
})();