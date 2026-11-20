/* Echo Tiles — real animated memory sequence with accessible symbols and retries. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Echo Tiles','puzzle','🔊','Memorize the flashing tiles, then replay their sequence.','Watch the tiles glow one at a time. Repeat the pattern from memory.'],
    api => {
      const {base,R,O,S,T}=api.art, U=api.colors, {irnd}=api.helpers;
      const centers=[[103,181],[257,181],[103,318],[257,318]];
      const colors=['#83c5ff','#f3a5d0','#ffe18d','#8af0c8'];
      const marks=['◆','●','★','▲'];
      const beat=.77, lead=.52;
      function preview(state){
        state.previewActive=true;
        state.previewTime=0;
        state.previewLength=lead+state.pattern.length*beat+.45;
        state.flash=-1;state.flashTime=0;
      }
      function highlighted(state){
        if(!state.previewActive)return state.flashTime>0?state.flash:-1;
        const elapsed=state.previewTime-lead;
        if(elapsed<0)return -1;
        const step=Math.floor(elapsed/beat);
        return step>=0&&step<state.pattern.length&&elapsed%beat<.53?state.pattern[step]:-1;
      }
      return {
        init(){
          const m=api.state;
          m.t=110;m.level=1;m.lives=3;
          m.pattern=[irnd(0,3),irnd(0,3),irnd(0,3)];
          m.step=0;m.note='Remember the order';m.flash=-1;m.flashTime=0;
          preview(m);api.controls([]);
        },
        tap(x,y){
          const m=api.state;
          if(m.previewActive)return;
          const tile=centers.findIndex(([cx,cy])=>Math.abs(cx-x)<=65&&Math.abs(cy-y)<=57);
          if(tile<0)return;
          m.flash=tile;m.flashTime=.22;
          if(tile===m.pattern[m.step]){
            m.step++;m.note='Nice! '+m.step+' of '+m.pattern.length+' tiles matched';
            api.addScore();
            if(m.step===m.pattern.length){
              if(m.level>=5){
                api.finish(true,'Five secret signals remembered. The lost frequency is yours!');
                return;
              }
              m.level++;m.pattern.push(irnd(0,3));m.step=0;
              m.note='Pattern grew! Watch closely.';
              preview(m);
            }
          }else{
            m.lives--;m.step=0;
            api.beep(170);
            if(m.lives<=0){
              api.finish(false,'The signal faded. Watch each tile carefully and try again.');
              return;
            }
            m.note='Not quite. Follow the flashing tiles again.';
            preview(m);
          }
        },
        update(dt){
          const m=api.state;
          if(m.previewActive){
            m.previewTime+=dt;
            if(m.previewTime>=m.previewLength){m.previewActive=false;m.previewTime=m.previewLength;m.note='Your turn. Repeat '+m.pattern.length+' tiles.';}
          }else m.flashTime=Math.max(0,m.flashTime-dt);
        },
        draw(){
          const m=api.state;
          base('#181d38');
          T('ECHO TILES',180,43,23,U.yellow);
          T(m.previewActive?'WATCH THE TILES GLOW':'REPEAT THE PATTERN',180,73,15,m.previewActive?U.mint:U.pink);
          const lit=highlighted(m);
          centers.forEach(([x,y],i)=>{
            const active=lit===i;
            if(active)R(x-69,y-61,138,122,'#ffffff65',19);
            R(x-65,y-57,130,114,active?U.white:colors[i],16);
            T(marks[i],x,y,43,active?'#1b2340':'#24304a');
            if(active)S(x,y,46,'#ffffffad',3);
          });
          R(27,389,306,48,'#293451',13);
          if(m.previewActive){
            const started=Math.max(0,m.previewTime-lead);
            const step=Math.min(m.pattern.length,Math.floor(started/beat)+1);
            T('LISTEN · '+step+'/'+m.pattern.length,180,405,13,U.yellow);
            R(47,422,266,5,'#5b6685',3);
            R(47,422,Math.max(3,266*(m.previewTime/m.previewLength)),5,U.mint,3);
          }else T('MATCHED '+m.step+'/'+m.pattern.length+'  ·  LEVEL '+m.level+'/5',180,414,14,U.white);
          T('♥ '.repeat(m.lives)+'  '+m.note,180,448,11,U.muted);
        }
      };
    }
  );
})();
