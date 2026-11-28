/* Pendulum Post — time a swinging parcel release to land on each moving dock. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Pendulum Post','reflex','📦','Release a swinging parcel when its shadow lines up with the dock.','The parcel swings left and right. Tap RELEASE PARCEL when the bright target marker lines up with the pendulum. Make three deliveries; three missed releases end the shift.'],
    api => {
      const {base,R,O,L,T}=api.art;
      const targets=[0.54,-0.47,0.72], pivot={x:180,y:139}, length=143;
      function release(){
        const s=api.state;
        if(s.ended||s.pending)return;
        const angle=Math.sin(s.elapsed*(2.5+s.level*0.16))*0.82;
        if(Math.abs(angle-targets[s.level-1])<0.19){
          api.beep(760);api.addScore(120+s.misses*20);
          if(s.level===targets.length){
            s.pending=true;
            setTimeout(()=>{if(api.state===s&&!s.ended&&s.pending)api.finish(true,'Three parcels landed safely on the docks!');},180);
          }else{
            s.level++;s.note='Nice landing! Watch for the next dock.';s.pending=true;
            setTimeout(()=>{if(api.state===s&&!s.ended)s.pending=false;},500);
          }
        }else{
          s.misses++;api.beep(180);
          s.note='Missed the dock · '+Math.max(0,3-s.misses)+' tries left.';
          if(s.misses>=3)api.finish(false,'The parcels missed too many docks. Watch the target marker and release again.');
        }
      }
      return {
        init(){
          const s=api.state;s.level=1;s.t=90;s.misses=0;s.pending=false;s.note='Wait for the gold marker.';
          api.controls([['RELEASE PARCEL','release',true]]);
        },
        action(name){if(name==='release')release();},
        tap(){release();},
        timeout(){const s=api.state;if(!s.ended&&!s.pending)api.finish(false,'The delivery shift ended before all three parcels landed.');},
        draw(){
          const s=api.state;
          const angle=Math.sin(s.elapsed*(2.5+s.level*0.16))*0.82;
          const target=targets[s.level-1];
          const end={x:pivot.x+Math.sin(angle)*length,y:pivot.y+Math.cos(angle)*length};
          const mark={x:pivot.x+Math.sin(target)*length,y:pivot.y+Math.cos(target)*length};
          base('#17213b');
          T('PENDULUM POST',180,30,24,'#f4ead0');
          T('DELIVERY '+s.level+'/3',180,61,14,'#91e0d0');
          T('MISSED '+s.misses+'/3',180,84,11,'#ffb5a5');
          R(31,100,298,286,'#202e4b',18);
          L(52,344,308,344,'#778aa7',4);
          for(let i=0;i<3;i++)R(82+i*98,333,72,11,i===s.level-1?'#f4c96b':'#3c4c68',6);
          L(pivot.x,pivot.y,mark.x,mark.y,'#f4c96b',2);
          O(mark.x,mark.y,8,'#f4c96b');
          O(mark.x,mark.y,15,'rgba(244,201,107,.22)');
          L(pivot.x,pivot.y,end.x,end.y,'#d7e4f0',4);
          O(end.x,end.y,22,'#dfb879');
          R(end.x-18,end.y-16,36,32,'#d9ad72',5);
          L(end.x-10,end.y-6,end.x+10,end.y-6,'#76563e',2);
          O(pivot.x,pivot.y,9,'#f7e4b0');
          T(s.note,180,411,11,'#ffffff');
          T('GOLD = LANDING WINDOW',180,438,10,'#a9b8d1');
        }
      };
    }
  );
})();
