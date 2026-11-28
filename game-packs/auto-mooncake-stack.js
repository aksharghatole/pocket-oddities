/* Mooncake Stack — drop moving mooncakes without losing the tower's footing. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Mooncake Stack','reflex','🥮','Stack eight mooncakes as a festival tower while the tray drifts faster each round.','Tap DROP when the moving mooncake overlaps the tower. A small overlap narrows the next cake; keep the tower wide enough to reach eight layers before the festival ends.'],
    api => {
      const {base,R,O,L,T}=api.art;
      const palette=['#f3c56b','#e78e81','#b2d8b4','#a9b5ed','#f0a9d1'];
      function drop(){
        const s=api.state;
        if(s.ended||s.pending)return;
        const x=s.center+Math.sin(s.elapsed*s.speed)*s.amplitude;
        const offset=x-s.center,overlap=s.width-Math.abs(offset);
        if(overlap<Math.max(24,s.width*0.48)){
          api.beep(140);api.finish(false,'The mooncakes slipped off the tower. Keep each drop centered and try again.');return;
        }
        s.width=overlap;s.center+=offset*0.35;s.layers++;
        s.tower.push({x:s.center,w:s.width,color:palette[(s.layers-1)%palette.length]});
        api.addScore(20+Math.round(s.width));
        api.beep(420+s.layers*35);
        s.note=overlap>95?'Perfectly centered!':'Nice catch · '+Math.round(overlap)+' pixels wide';
        if(s.layers>=8){
          s.pending=true;
          setTimeout(()=>{if(api.state===s&&!s.ended&&s.pending)api.finish(true,'Eight mooncakes high! The festival tower is complete.');},180);
        }
      }
      return {
        init(){
          const s=api.state;s.t=100;s.layers=0;s.width=124;s.center=180;s.amplitude=112;
          s.speed=2.15;s.tower=[];s.pending=false;s.note='Tap DROP when the cake crosses the tower.';
          api.controls([['DROP','drop',true]]);
        },
        action(name){if(name==='drop')drop();},
        tap(){drop();},
        timeout(){const s=api.state;if(!s.ended&&!s.pending)api.finish(false,'The festival ended before the tower was complete.');},
        draw(){
          const s=api.state;
          base('#201b3b');
          T('MOONCAKE STACK',180,29,23,'#fff0c9');
          T('TOWER '+s.layers+'/8',180,59,14,'#e9b6dc');
          R(28,83,304,310,'#2a2850',18);
          for(let i=0;i<9;i++)O(48+i*33,108,1.5,'#8e82bd');
          L(50,365,310,365,'#8174a7',2);
          for(let i=0;i<s.tower.length;i++){
            const item=s.tower[i],y=365-(i+1)*27;
            R(item.x-item.w/2,y,item.w,24,item.color,8);
            O(item.x-item.w/2+10,y+8,3,'#fff1d2');
            O(item.x+item.w/2-10,y+8,3,'#fff1d2');
          }
          const moving=s.center+Math.sin(s.elapsed*s.speed)*s.amplitude;
          const y=365-(s.layers+1)*27;
          L(s.center,365-s.layers*27,moving,120,'#d7c4f0',1);
          R(moving-s.width/2,116,s.width,24,palette[s.layers%palette.length],8);
          O(moving-s.width/2+12,124,3,'#fff1d2');
          O(moving+s.width/2-12,124,3,'#fff1d2');
          O(s.center,y+12,4,'#ffe398');
          T(s.note,180,418,11,'#ffffff');
          T('WIDER LAYERS MAKE THE NEXT DROP EASIER',180,440,9,'#b8afd5');
        }
      };
    }
  );
})();
