/* Flock Flight — steer a migrating flock between gifts and gusts. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Flock Flight','reflex','🪶','Guide a small flock through shifting winds to gather eight bright feathers.','Use LEFT and RIGHT to change lanes. Catch golden feathers, avoid dark gusts, and reach eight feathers before dusk. You can also tap either side of the field.'],
    api => {
      const {base,R,O,L,T}=api.art;
      const laneX=[78,180,282], playerY=365;
      const route=[
        [1,'feather'],[2,'gust'],[0,'feather'],[1,'gust'],[2,'feather'],[0,'gust'],
        [1,'feather'],[2,'feather'],[0,'gust'],[1,'feather'],[2,'gust'],[0,'feather'],
        [1,'gust'],[2,'feather'],[0,'feather'],[1,'gust'],[2,'feather'],[0,'gust']
      ];
      function move(dir){
        const s=api.state;
        if(s.ended)return;
        s.lane=Math.max(0,Math.min(2,s.lane+dir));
        api.beep(360+s.lane*90);
      }
      return {
        init(){
          const s=api.state;s.t=120;s.lane=1;s.lives=3;s.feathers=0;
          s.objects=[];s.spawn=0.65;s.index=0;s.elapsed=0;s.note='Stay light on your wings.';
          api.controls([['LEFT','left',true],['RIGHT','right',true]]);
        },
        action(name){if(name==='left')move(-1);if(name==='right')move(1);},
        tap(x){move(x<180?-1:1);},
        update(dt){
          const s=api.state;s.elapsed+=dt;s.spawn-=dt;
          if(s.spawn<=0){
            const [lane,type]=route[s.index%route.length];
            s.objects.push({lane,type,y:104,phase:s.index%4});
            s.index++;s.spawn=0.92;
          }
          const speed=152+Math.min(46,s.feathers*4);
          for(const o of s.objects){
            o.y+=speed*dt;
            if(!o.resolved&&o.y>=playerY-13){
              o.resolved=true;
              if(o.lane===s.lane){
                if(o.type==='feather'){
                  s.feathers++;api.addScore(30+Math.max(0,3-s.lives)*5);api.beep(700);
                  s.note='Feather caught · '+s.feathers+'/8';
                  if(s.feathers>=8){api.finish(true,'Eight bright feathers carried the flock safely home!');return;}
                }else{
                  s.lives--;api.beep(150);s.note='A gust scattered the flock · '+s.lives+' hearts left.';
                  if(s.lives<=0){api.finish(false,'The flock lost its lift. Catch feathers and steer clear of gusts.');return;}
                }
              }
            }
          }
          s.objects=s.objects.filter(o=>o.y<430);
        },
        timeout(){const s=api.state;if(!s.ended)api.finish(false,'Dusk arrived before the flock gathered enough feathers.');},
        draw(){
          const s=api.state;
          base('#13213b');
          T('FLOCK FLIGHT',180,30,24,'#f7f1d2');
          T('FEATHERS '+s.feathers+'/8',180,61,14,'#ffd879');
          T('♥ '.repeat(s.lives),180,86,14,'#ff9baf');
          for(let i=0;i<3;i++){
            const x=laneX[i];
            L(x,108,x,402,i===s.lane?'#7bd7c2':'#344764',i===s.lane?3:1);
            for(let j=0;j<3;j++)O(x,142+j*85,2,'#657895');
          }
          for(const o of s.objects){
            const x=laneX[o.lane];
            if(o.type==='feather'){
              O(x,o.y,14,'rgba(255,216,121,.18)');
              T('✦',x,o.y,23,'#ffd879');
            }else{
              O(x,o.y,17,'#34415b');T('〰',x,o.y,20,'#8996ad');
            }
          }
          const px=laneX[s.lane],flap=Math.sin(s.elapsed*12)*4;
          O(px,playerY,23,'#284f67');
          T('🕊',px,playerY-flap,30,'#e6f4ef');
          T(s.note,180,414,11,'#ffffff');
          T('GOLD = FEATHER · BLUE-GREY = GUST',180,438,9,'#9eb1cd');
        }
      };
    }
  );
})();
