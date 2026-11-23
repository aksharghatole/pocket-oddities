/* Clockwork Crossing — align rotating bridge gears to open the crossing. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Clockwork Crossing','puzzle','⚙️','Turn three concentric gears to complete a tiny clockwork bridge.','Tap a gear ring or use the three buttons to rotate it clockwise. Align each ring’s gold bridge segment with the glowing north marker. Solve three machines before time expires; each machine has a limited number of turns.'],
    api => {
      const {base,R,O,S,L,T}=api.art, C=api.colors;
      const cx=180,cy=231, radii=[52,94,137], widths=[34,34,34];
      const levels=[
        {start:[1,2,3],limit:9},
        {start:[3,1,2],limit:10},
        {start:[2,3,1],limit:10}
      ];
      const names=['INNER','MIDDLE','OUTER'];
      function start(s){
        const stage=levels[s.level-1];
        s.positions=stage.start.slice();
        s.moves=0;s.limit=stage.limit;
        s.note='Turn each gold bridge to the top.';
      }
      function rotate(i){
        const s=api.state;
        if(s.ended||i<0||i>2)return;
        s.positions[i]=(s.positions[i]+1)%4;
        s.moves++;
        api.beep(390+i*85);
        api.addScore(5);
        if(s.positions.every(p=>p===0)){
          api.addScore(120+Math.max(0,s.limit-s.moves)*15);
          if(s.level===3){
            api.finish(true,'All three clockwork bridges aligned. The city is connected!');
          }else{
            s.level++;start(s);
            s.note='Bridge restored! The next machine awaits.';
          }
        }else if(s.moves>=s.limit){
          api.finish(false,'The gears jammed after too many turns. Try the crossing again.');
        }else{
          s.note=(s.positions.filter(p=>p===0).length)+' of 3 bridge gears aligned.';
        }
      }
      return {
        init(){
          const s=api.state;s.t=120;s.level=1;start(s);
          api.controls([['Inner gear','inner',false],['Middle gear','middle',false],['Outer gear','outer',true]]);
        },
        action(name){const i=['inner','middle','outer'].indexOf(name);if(i>=0)rotate(i);},
        tap(x,y){
          const d=Math.hypot(x-cx,y-cy);
          if(d>=34&&d<=158){
            const i=radii.reduce((best,r,j)=>Math.abs(r-d)<Math.abs(radii[best]-d)?j:best,0);
            rotate(i);
          }
        },
        timeout(){if(!api.state.ended)api.finish(false,'The clock struck midnight before the bridges aligned.');},
        draw(){
          const s=api.state;
          base('#101b2e');
          T('CLOCKWORK CROSSING',180,31,21,C.mint);
          T('MACHINE '+s.level+'/3  •  TURNS '+s.moves+'/'+s.limit,180,60,14,C.yellow);
          T('▲ NORTH GATE ▲',180,82,12,C.white);
          L(cx,91,cx,107,C.yellow,3);
          radii.forEach((r,i)=>{
            S(cx,cy,r,'#425b77',widths[i]);
            for(let k=0;k<4;k++){
              const a=-Math.PI/2+k*Math.PI/2;
              const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
              O(x,y,9,'#243d5c');
            }
            const angle=-Math.PI/2+s.positions[i]*Math.PI/2;
            const x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r;
            O(x,y,17,C.yellow);
            O(x,y,8,'#23324b');
            if(s.positions[i]===0)S(x,y,21,C.mint,3);
          });
          O(cx,cy,22,'#1c304b');
          T('✦',cx,cy+7,23,C.white);
          R(18,384,324,54,'#283953',11);
          T(s.note,180,404,12,C.white);
          T('Tap rings or use buttons below',180,425,11,C.muted);
        }
      };
    }
  );
})();
