/* Echo Tiles — paced memory rounds with animated previews and optional haptic cues. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Echo Tiles','puzzle','🔊','Memorize the flashing tiles, then replay their sequence.','Choose Calm, Classic, or Rapid. Watch each glowing tile, then repeat the pattern. Preview vibrations follow the optional vibration setting.'],
    api => {
      const {base,R,O,S,T}=api.art, U=api.colors, {irnd}=api.helpers;
      const centers=[[103,181],[257,181],[103,318],[257,318]];
      const colors=['#83c5ff','#f3a5d0','#ffe18d','#8af0c8'];
      const marks=['◆','●','★','▲'];
      const modes={
        calm:{label:'CALM',beat:1.05,lead:.72,flashWindow:.78,start:2,goal:4},
        classic:{label:'CLASSIC',beat:.77,lead:.52,flashWindow:.53,start:3,goal:5},
        rapid:{label:'RAPID',beat:.58,lead:.4,flashWindow:.38,start:4,goal:6}
      };
      function preview(state){
        state.previewActive=true;
        state.previewTime=0;
        state.previewLength=state.lead+state.pattern.length*state.beat+.45;
        state.previewCueStep=-1;
        state.flash=-1;state.flashTime=0;
      }
      function highlighted(state){
        if(!state.previewActive)return state.flashTime>0?state.flash:-1;
        const elapsed=state.previewTime-state.lead;
        if(elapsed<0)return -1;
        const step=Math.floor(elapsed/state.beat);
        return step>=0&&step<state.pattern.length&&elapsed%state.beat<state.flashWindow?state.pattern[step]:-1;
      }
      return {
        init(){
          const m=api.state;
          m.t=null;m.level=1;m.lives=3;m.awaitMode=true;
          m.modeKey='';m.modeLabel='';m.pattern=[];m.step=0;
          m.previewActive=false;m.previewTime=0;m.previewLength=0;
          m.flash=-1;m.flashTime=0;m.note='Choose a pace to begin.';
          api.controls([['CALM · 2 TILES','calm'],['CLASSIC · 3 TILES','classic'],['RAPID · 4 TILES','rapid']]);
        },
        action(name){
          const m=api.state,mode=modes[name];
          if(!m.awaitMode||!mode)return;
          m.awaitMode=false;m.modeKey=name;m.modeLabel=mode.label;
          m.beat=mode.beat;m.lead=mode.lead;m.flashWindow=mode.flashWindow;m.goal=mode.goal;
          m.t=110;m.elapsed=0;m.level=1;m.lives=3;m.step=0;
          m.pattern=Array.from({length:mode.start},()=>irnd(0,3));
          m.note='Remember the order';
          preview(m);api.controls([]);
        },
        tap(x,y){
          const m=api.state;
          if(m.awaitMode||m.previewActive)return;
          const tile=centers.findIndex(([cx,cy])=>Math.abs(cx-x)<=65&&Math.abs(cy-y)<=57);
          if(tile<0)return;
          m.flash=tile;m.flashTime=.22;
          if(tile===m.pattern[m.step]){
            m.step++;m.note='Nice! '+m.step+' of '+m.pattern.length+' tiles matched';
            api.addScore();
            if(m.step===m.pattern.length){
              if(m.level>=m.goal){
                api.finish(true,'The '+m.modeLabel.toLowerCase()+' signal is yours. You remembered every sequence!');
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
          if(m.awaitMode)return;
          if(m.previewActive){
            m.previewTime+=dt;
            const elapsed=m.previewTime-m.lead;
            const step=Math.floor(elapsed/m.beat);
            if(step>=0&&step<m.pattern.length&&step!==m.previewCueStep){
              m.previewCueStep=step;
              api.vibrate?.(12);
            }
            if(m.previewTime>=m.previewLength){
              m.previewActive=false;m.previewTime=m.previewLength;
              m.note='Your turn. Repeat '+m.pattern.length+' tiles.';
            }
          }else m.flashTime=Math.max(0,m.flashTime-dt);
        },
        draw(){
          const m=api.state;
          base('#181d38');
          T('ECHO TILES',180,43,23,U.yellow);
          T(m.awaitMode?'CHOOSE YOUR PACE':m.previewActive?'WATCH THE TILES GLOW':'REPEAT THE PATTERN',180,73,15,m.awaitMode?U.mint:m.previewActive?U.mint:U.pink);
          if(!m.awaitMode)T(m.modeLabel+' · LEVEL '+m.level+'/'+m.goal,180,98,11,U.white);
          const lit=highlighted(m);
          centers.forEach(([x,y],i)=>{
            const active=lit===i;
            if(active){
              const elapsed=Math.max(0,m.previewTime-m.lead);
              const phase=m.previewActive?(elapsed%m.beat)/m.flashWindow:.5;
              const pulse=.5+.5*Math.sin(Math.PI*Math.min(1,phase));
              O(x,y,48+6*pulse,'rgba(255,255,255,'+(.1+.16*pulse)+')');
              R(x-69,y-61,138,122,'rgba(255,255,255,'+(.12+.18*pulse)+')',19);
            }
            R(x-65,y-57,130,114,active?'#fff8d9':colors[i],16);
            T(marks[i],x,y,43,active?'#1b2340':'#24304a');
            if(active)S(x,y,46,'#ffffffad',3);
          });
          R(27,389,306,48,'#293451',13);
          if(m.awaitMode){
            T('CALM: 2 TILES · CLASSIC: 3 · RAPID: 4',180,414,11,U.white);
          }else if(m.previewActive){
            const started=Math.max(0,m.previewTime-m.lead);
            const step=Math.min(m.pattern.length,Math.floor(started/m.beat)+1);
            T('LISTEN · '+step+'/'+m.pattern.length,180,405,13,U.yellow);
            R(47,422,266,5,'#5b6685',3);
            R(47,422,Math.max(3,266*(m.previewTime/m.previewLength)),5,U.mint,3);
          }else T('MATCHED '+m.step+'/'+m.pattern.length+'  ·  '+m.modeLabel+' '+m.level+'/'+m.goal,180,414,12,U.white);
          T('♥ '.repeat(m.lives)+'  '+m.note,180,442,11,U.muted);
        }
      };
    }
  );
})();
