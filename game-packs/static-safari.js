/* Static Safari — use distance pings to locate a hidden creature. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Static Safari','puzzle','📡','Track shy creatures using distance clues on a tiny radio grid.','Tap a square to send a ping. Its number is the number of horizontal plus vertical steps to the hidden creature. Find it within 7 pings per habitat. Clear 3 habitats; 3 lost signals or running out of time ends the expedition.'],
    api => {
      const {base,R,O,S,T}=api.art, U=api.colors;
      const habitats=[{name:'MOSS GROVE',target:[3,1]},{name:'DUSK MARSH',target:[0,4]},{name:'FROST RIDGE',target:[4,2]}];
      function start(s){
        s.pings=0;s.reveals={};
        s.note='Tap a square to measure the distance.';
      }
      function ping(x,y){
        const s=api.state;
        if(s.ended||x<30||x>=330||y<106||y>=406)return;
        const col=Math.floor((x-30)/60),row=Math.floor((y-106)/60);
        const key=row*5+col;
        if(Object.prototype.hasOwnProperty.call(s.reveals,key))return;
        const target=habitats[s.level-1].target;
        const distance=Math.abs(col-target[0])+Math.abs(row-target[1]);
        s.reveals[key]=distance;s.pings++;
        if(distance===0){
          api.addScore(100+Math.max(0,7-s.pings)*20);
          api.beep(680);
          if(s.level===3)api.finish(true,'All three creatures found! Your radio map is complete.');
          else {s.level++;start(s);s.note='Creature found! Search the next habitat.';}
        }else{
          api.beep(230+distance*35);
          s.note='Distance '+distance+'. '+(7-s.pings)+' pings remain.';
          if(s.pings===7){
            s.lost++;
            if(s.lost>=3)api.finish(false,'Three signals lost. The safari is over.');
            else {start(s);s.note='Signal lost! Retry this habitat. '+(3-s.lost)+' lives left.';}
          }
        }
      }
      return {
        init(){
          const s=api.state;s.t=120;s.level=1;s.lost=0;
          start(s);api.controls([]);
        },
        tap:ping,
        timeout(){if(!api.state.ended)api.finish(false,'The radio batteries ran out before the safari ended.');},
        draw(){
          const s=api.state;
          base('#102a2b');
          T('STATIC SAFARI',180,34,23,U.mint);
          T(habitats[s.level-1].name+'  •  HABITAT '+s.level+'/3',180,61,14,U.yellow);
          T('PINGS '+s.pings+'/7   •   LOST '+s.lost+'/3',180,86,13,U.white);
          for(let row=0;row<5;row++)for(let col=0;col<5;col++){
            const x=30+col*60,y=106+row*60,key=row*5+col;
            const d=s.reveals[key],known=d!==undefined;
            R(x+2,y+2,56,56,known?(d===0?'#397f67':'#365d65'):'#244647',8);
            if(known){
              T(d===0?'★':String(d),x+30,y+37,25,d===0?U.yellow:U.white);
            }else{
              O(x+30,y+30,4,'#57847a');
            }
          }
          R(16,414,328,29,'#244647',8);
          T(s.note,180,433,11,U.white);
        }
      };
    }
  );
})();
