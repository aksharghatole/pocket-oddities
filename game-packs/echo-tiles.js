/* Pocket Oddities Volume 2: register mini-games here without changing the original 20. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Echo Tiles', 'puzzle', '🔊', 'Watch four tiles play a pattern, then repeat the echo.', 'Memorize the glowing tile order and tap it back.'],
    (api) => {
      const {base,R,O,S,T}=api.art, U=api.colors, {irnd}=api.helpers;
      const centers=[[103,181],[257,181],[103,318],[257,318]];
      const colors=['#78b9f9','#ed9bca','#ffe087','#79e8bd'];
      return {
        init(){
          const m=api.state;
          m.t=80; m.level=1; m.lives=3; m.pattern=[irnd(0,3),irnd(0,3),irnd(0,3)];
          m.step=0; m.preview=4.5; m.flash=-1;
          api.controls([]);
        },
        tap(x,y){
          const m=api.state;
          if(m.preview>0||x<30||x>330||y<115||y>378)return;
          const tile=(y>249?2:0)+(x>180?1:0);
          m.flash=tile; m.flashTime=.2;
          if(tile===m.pattern[m.step]){
            m.step++; api.addScore();
            if(m.step===m.pattern.length){
              if(m.level===5){api.finish(true,'You echoed five increasingly long patterns!');return}
              m.level++;m.pattern.push(irnd(0,3));m.step=0;m.preview=3.4+m.level*.3;
            }
          }else{
            m.lives--;m.step=0;m.preview=2.5;
            api.beep(170);
            if(m.lives<=0)api.finish(false,'The echo broke! Memorize each sequence before tapping.');
          }
        },
        update(dt){
          const m=api.state;
          m.preview=Math.max(0,m.preview-dt);
          m.flashTime=Math.max(0,(m.flashTime||0)-dt);
          if(m.flashTime===0)m.flash=-1;
        },
        draw(){
          const m=api.state;
          base('#181d38');
          T('ECHO TILES',180,44,23,U.yellow);
          T(m.preview>0?'WATCH THE PATTERN':'REPEAT THE PATTERN',180,75,14,m.preview>0?U.mint:U.pink);
          centers.forEach(([x,y],i)=>{
            const on=m.flash===i;
            R(x-66,y-58,132,116,on?U.white:colors[i],17);
            T(['◆','●','★','▲'][i],x,y,42,on?'#17223b':'#243049');
          });
          if(m.preview>0){
            R(24,393,312,40,'#334063',12);
            const pattern=m.pattern.map(n=>n+1).join('  ·  ');
            T(pattern,180,414,19,U.white);
          }else T('MATCH: '+m.step+' / '+m.pattern.length,180,412,17,U.mint);
          T('LEVEL '+m.level+'/5   ·   '+('♥ '.repeat(m.lives)),180,445,12,U.muted);
        }
      };
    }
  );
})();
