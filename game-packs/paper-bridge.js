/* Paper Bridge — build exact-length bridges with limited planks. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Paper Bridge','strategy','🌉','Build tiny bridges across impossible paper ravines.','Tap plank lengths 1, 2, or 3 to span each gap exactly. You have a limited number of planks per bridge. Undo a plank if needed. Three broken builds or running out of time ends the expedition.'],
    api => {
      const {base,R,L,T}=api.art, U=api.colors;
      const stages=[{gap:5,max:3},{gap:7,max:4},{gap:9,max:5}];
      const colors=['#8bd6e8','#ffd47c','#ef9ec8'];
      function stage(s) {
        const spec=stages[s.level-1];
        s.gap=spec.gap;s.max=spec.max;s.parts=[];
        s.note='Choose a plank to cross '+s.gap+' spaces.';
      }
      function place(n) {
        const s=api.state;
        if(s.ended)return;
        const total=s.parts.reduce((a,b)=>a+b,0);
        if(total+n>s.gap) {
          s.errors++;s.note='Too long! The plank falls into the ravine.';
          api.beep(150);
          if(s.errors>=3)api.finish(false,'Three planks fell. The paper bridge collapsed.');
          return;
        }
        s.parts.push(n);
        const next=total+n;
        api.beep(310+n*80);
        if(next===s.gap) {
          api.addScore(100+(s.max-s.parts.length)*25);
          if(s.level===stages.length) {
            api.finish(true,'All three paper ravines crossed. Master bridge builder!');
          } else {
            s.level++;stage(s);
            s.note='Bridge complete! A wider ravine awaits.';
          }
        } else if(s.parts.length>=s.max) {
          s.errors++;s.note='Not enough planks! Start this bridge again.';
          s.parts=[];
          api.beep(160);
          if(s.errors>=3)api.finish(false,'Too many incomplete bridges. Try again.');
        } else {
          s.note=(s.gap-next)+' spaces remain. '+(s.max-s.parts.length)+' planks left.';
        }
      }
      return {
        init() {
          const s=api.state;
          s.t=110;s.level=1;s.errors=0;
          stage(s);
          api.controls([['1 SPACE','one'],['2 SPACES','two'],['3 SPACES','three'],['UNDO','undo']]);
        },
        action(name) {
          const s=api.state;
          if(s.ended)return;
          if(name==='undo') {
            if(s.parts.length){s.parts.pop();s.note='Last plank returned to your hand.';}
          } else if(name==='one')place(1);
          else if(name==='two')place(2);
          else if(name==='three')place(3);
        },
        tap(x,y) {
          if(y<240||y>332)return;
          const n=x<120?1:x<240?2:3;
          place(n);
        },
        timeout() {
          if(!api.state.ended)api.finish(false,'The rain washed the paper bridges away.');
        },
        draw() {
          const s=api.state;
          base('#172b39');
          T('PAPER BRIDGE',180,39,24,U.mint);
          T('RAVINE '+s.level+'/3  •  FALLS '+s.errors+'/3',180,68,14,U.yellow);
          T('SPAN '+s.gap+' SPACES · MAX '+s.max+' PLANKS',180,100,13,U.white);
          const x0=26,unit=308/s.gap,y=171;
          R(10,y-15,16,74,'#76ae7b',5);
          R(334,y-15,16,74,'#76ae7b',5);
          L(26,y+45,334,y+45,'#557080',2);
          let offset=0;
          s.parts.forEach((n,i)=>{
            R(x0+offset*unit+1,y,n*unit-2,32,colors[(n-1)%3],5);
            T(String(n),x0+(offset+n/2)*unit,y+22,15,'#233448');
            offset+=n;
          });
          for(let i=0;i<=s.gap;i++)L(x0+i*unit,y+40,x0+i*unit,y+50,'#9bb1b7',1);
          T('BUILT '+offset+'/'+s.gap+'  ·  PLANKS '+s.parts.length+'/'+s.max,180,253,15,U.mint);
          for(let n=1;n<=3;n++){
            const x=(n-1)*116+12;
            R(x,273,104,59,colors[n-1],13);
            T(n+' SPACE'+(n>1?'S':''),x+52,309,15,'#1b3140');
          }
          R(20,356,320,73,'#293f4d',12);
          T(s.note,180,385,12,U.white);
          T('Use buttons below or tap a colored plank.',180,410,11,U.muted);
        }
      };
    }
  );
})();
