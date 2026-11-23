/* Pocket Thermostat — tame a drifting machine by managing heat and cooling. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Pocket Thermostat','strategy','🌡️','Keep a peculiar machine comfortable through three shifting climates.','Tap HEAT, COOL, or COAST to set the thermostat. Keep the needle inside the green band for five accumulated seconds per chamber. Touching the red extremes three times ends the shift.'],
    api => {
      const {base,R,O,T,meter}=api.art, U=api.colors;
      const rooms=[
        {name:'FROST CELLAR',low:43,high:57,drift:-7},
        {name:'STEAM ATTIC',low:59,high:73,drift:8},
        {name:'WIND TUNNEL',low:35,high:49,drift:-4}
      ];
      function enter(s){
        const room=rooms[s.level-1];
        s.temp=s.level===1?50:s.level===2?48:65;
        s.held=0;s.mode='coast';s.dangerLatch=false;
        s.note='Hold the needle in the green band.';
        s.room=room;
      }
      return {
        init(){
          const s=api.state;
          s.t=110;s.level=1;s.strikes=0;s.score=0;
          enter(s);
          api.controls([['🔥 HEAT','heat',true],['❄ COOL','cool',true],['◌ COAST','coast',true]]);
        },
        action(name){
          const s=api.state;
          if(s.ended||!['heat','cool','coast'].includes(name))return;
          s.mode=name;api.beep(name==='heat'?440:name==='cool'?280:350);
        },
        tap(x,y){
          if(y>=310&&y<=382){
            const i=Math.floor((x-24)/105);
            if(i>=0&&i<3)this.action(['heat','cool','coast'][i]);
          }
        },
        update(dt){
          const s=api.state;
          if(s.ended)return;
          dt=Math.min(dt,.1);
          const rate=s.mode==='heat'?18:s.mode==='cool'?-18:0;
          s.temp=Math.max(0,Math.min(100,s.temp+(rate+s.room.drift)*dt));
          if(s.temp<=3||s.temp>=97){
            if(!s.dangerLatch){
              s.strikes++;s.dangerLatch=true;s.note='Danger zone! '+(3-s.strikes)+' warnings left.';
              api.beep(140);
              if(s.strikes>=3){api.finish(false,'The machine tripped its safety breaker.');return;}
            }
          }else if(s.temp>10&&s.temp<90)s.dangerLatch=false;
          if(s.temp>=s.room.low&&s.temp<=s.room.high){
            s.held+=dt;
            if(s.held>=5){
              api.addScore(150+Math.round(Math.max(0,s.t)*2)+40*(3-s.strikes));
              if(s.level===rooms.length){api.finish(true,'All three chambers are stable. Master of the thermostat!');return;}
              s.level++;enter(s);api.beep(660);
            }
          }
        },
        timeout(){if(!api.state.ended)api.finish(false,'The maintenance shift ended before all chambers stabilized.');},
        draw(){
          const s=api.state, r=s.room;
          base('#171c35');
          T('POCKET THERMOSTAT',180,35,22,U.mint);
          T(r.name+'  ·  ROOM '+s.level+'/3',180,67,13,U.yellow);
          T('WARNINGS '+s.strikes+'/3',180,94,13,U.white);
          R(32,126,296,46,'#36415c',12);
          R(41,135,278,28,'#d66a78',8);
          R(41+278*r.low/100,135,278*(r.high-r.low)/100,28,'#74ddb3',3);
          const needleX=41+278*s.temp/100;
          R(needleX-3,126,6,46,'#ffffff',3);
          T(Math.round(s.temp)+'°',180,213,52,U.white);
          T('TARGET '+r.low+'–'+r.high+'°',180,242,15,U.mint);
          T('STABLE '+s.held.toFixed(1)+' / 5.0 SEC',180,271,15,U.yellow);
          R(48,282,264,9,'#34425d',5);
          R(48,282,264*Math.min(1,s.held/5),9,'#74ddb3',5);
          ['HEAT','COOL','COAST'].forEach((name,i)=>{
            const x=24+105*i;
            R(x,311,99,68,s.mode===name.toLowerCase()?'#8b73bd':'#364560',12);
            T(['🔥','❄','◌'][i],x+49,335,21,U.white);
            T(name,x+49,361,12,U.white);
          });
          R(24,397,312,40,'#293551',11);
          T(s.note,180,419,11,U.white);
        }
      };
    }
  );
})();
