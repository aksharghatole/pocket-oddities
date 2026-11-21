/* Color Customs — tune three additive light channels to match a requested signal. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Color Customs','puzzle','🎨','Mix red, green and blue light to reproduce three secret signals.','Tap + or − beside each color to adjust its light by one step. Match all three channels to the target in 18 adjustments per signal. Three failed signals or the timer end the shift.'],
    api => {
      const {base,R,O,S,T}=api.art, U=api.colors;
      const targets=[[2,0,1],[1,3,2],[3,1,3]];
      const names=['RED','GREEN','BLUE'];
      const inks=['#ff7676','#83e5a5','#88b9ff'];
      const xPositions=[75,180,285];
      const clamp=v=>Math.max(0,Math.min(3,v));
      const color=values=>'rgb('+values.map(v=>35+v*73).join(',')+')';
      function begin(s){
        s.channels=[0,0,0];s.moves=0;s.note='Match the target light.';
      }
      function adjust(index,delta){
        const s=api.state;
        if(s.ended||s.moves>=18)return;
        const old=s.channels[index],next=clamp(old+delta);
        if(old===next)return;
        s.channels[index]=next;s.moves++;
        api.beep(260+index*110);
        const target=targets[s.level-1];
        if(s.channels.every((v,i)=>v===target[i])){
          api.addScore(120+(18-s.moves)*10);
          if(s.level===targets.length)api.finish(true,'All three signal lamps calibrated. The customs gate opens!');
          else {s.level++;begin(s);s.note='Signal cleared! Calibrate the next lamp.';}
        }else if(s.moves===18){
          s.failures++;
          if(s.failures>=3)api.finish(false,'Too many lamps went out of tune. Try the shift again.');
          else {begin(s);s.note='Adjustment budget spent. Retry this signal ('+(3-s.failures)+' chances left).';}
        }else s.note='Adjust each channel until the lights match.';
      }
      return {
        init(){
          const s=api.state;s.t=120;s.level=1;s.failures=0;begin(s);
          api.controls([]);
        },
        tap(x,y){
          if(y<258||y>365)return;
          const i=xPositions.findIndex(cx=>Math.abs(x-cx)<=43);
          if(i<0)return;
          if(y>=260&&y<=303)adjust(i,1);
          else if(y>=320&&y<=365)adjust(i,-1);
        },
        timeout(){if(!api.state.ended)api.finish(false,'The customs desk closed before the lights matched.');},
        draw(){
          const s=api.state,target=targets[s.level-1];
          base('#141b2f');
          T('COLOR CUSTOMS',180,37,23,U.mint);
          T('SIGNAL '+s.level+'/3   •   FAILED '+s.failures+'/3',180,65,13,U.yellow);
          R(22,83,316,134,'#26344d',14);
          R(38,102,135,94,color(target),13);
          R(187,102,135,94,color(s.channels),13);
          T('TARGET',105,211,12,U.white);
          T('YOUR MIX',254,211,12,U.white);
          names.forEach((name,i)=>{
            const cx=xPositions[i];
            T(name,cx,245,13,inks[i]);
            R(cx-35,260,70,42,'#394b6c',12);
            T('+',cx,288,27,U.white);
            T(s.channels[i]+'/3',cx,316,15,U.yellow);
            R(cx-35,323,70,42,'#394b6c',12);
            T('−',cx,352,27,U.white);
          });
          R(23,379,314,58,'#26344d',12);
          T('ADJUSTMENTS '+s.moves+'/18',180,398,14,U.yellow);
          T(s.note,180,423,11,U.white);
        }
      };
    }
  );
})();
