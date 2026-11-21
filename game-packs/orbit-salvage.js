/* Orbit Salvage — steer between three orbital lanes to collect blue scrap and avoid red debris. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Orbit Salvage','reflex','🛰️','Switch orbital lanes to recover drifting parts without hitting debris.','Tap a lane or use the LEFT / RIGHT buttons to steer. Catch blue parts and dodge red debris. Collect 12 parts to win; three collisions or 90 seconds ends the mission.'],
    api => {
      const {base,R,O,S,L,T}=api.art, C=api.colors;
      const lanes=[80,180,280];
      function spawn(s){
        const lane=Math.floor(Math.random()*3);
        const hazard=Math.random()<0.43;
        s.objects.push({lane,y:90,kind:hazard?'hazard':'part',hit:false});
      }
      function steer(n){
        const s=api.state;
        if(s.ended)return;
        s.lane=Math.max(0,Math.min(2,n));
      }
      return {
        init(){
          const s=api.state;
          s.t=90;s.level=1;s.lane=1;s.parts=0;s.hits=0;s.objects=[];s.spawnIn=0.6;s.note='Collect 12 blue parts. Avoid red debris.';
          api.controls([['◀ LEFT','left'],['RIGHT ▶','right']]);
        },
        action(name){
          if(name==='left')steer(api.state.lane-1);
          if(name==='right')steer(api.state.lane+1);
        },
        tap(x,y){
          if(y>80&&y<425){
            const lane=lanes.reduce((best,l,i)=>Math.abs(l-x)<Math.abs(lanes[best]-x)?i:best,0);
            steer(lane);
          }
        },
        update(dt){
          const s=api.state;
          if(s.ended)return;
          const step=Math.min(dt,0.08);
          s.spawnIn-=step;
          if(s.spawnIn<=0){
            spawn(s);
            s.spawnIn=0.75+Math.random()*0.38-Math.min(0.22,s.parts*0.012);
          }
          const speed=115+Math.min(65,s.parts*4);
          for(const obj of s.objects){
            obj.y+=speed*step;
            if(!obj.hit&&obj.y>=357){
              obj.hit=true;
              if(obj.lane===s.lane){
                if(obj.kind==='part'){
                  s.parts++;api.addScore(20);
                  s.level=1+Math.floor(s.parts/4);
                  s.note='Recovered '+s.parts+'/12 parts';
                  api.beep(550);
                  if(s.parts>=12){api.finish(true,'All 12 parts recovered. The satellite is saved!');return;}
                }else{
                  s.hits++;s.note='Hull hit! '+(3-s.hits)+' shields left';
                  api.beep(150);
                  if(s.hits>=3){api.finish(false,'The debris breached your hull. Try another orbit.');return;}
                }
              }
            }
          }
          s.objects=s.objects.filter(o=>o.y<430);
        },
        timeout(){if(!api.state.ended)api.finish(false,'The salvage window closed before all parts were recovered.');},
        draw(){
          const s=api.state;
          base('#101b33');
          T('ORBIT SALVAGE',180,37,23,C.mint);
          T('PARTS '+s.parts+'/12    SHIELDS '+(3-s.hits)+'/3',180,67,14,C.yellow);
          for(let i=0;i<3;i++){
            R(lanes[i]-43,92,86,321,i===s.lane?'#273f61':'#1a2945',12);
            L(lanes[i],101,lanes[i],404,'#3d5476',2);
          }
          for(const o of s.objects){
            if(o.y>418)continue;
            O(lanes[o.lane],o.y,20,o.kind==='part'?'#67caff':'#f37c8a');
            T(o.kind==='part'?'✦':'×',lanes[o.lane],o.y+6,23,'#11213a');
          }
          O(lanes[s.lane],363,28,C.mint);
          S(lanes[s.lane],363,30,'#ffffff',2);
          T('▲',lanes[s.lane],371,28,'#132740');
          R(19,417,322,29,'#25344f',8);
          T('TAP A LANE OR USE ◀ ▶',180,436,12,C.white);
        }
      };
    }
  );
})();
