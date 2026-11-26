/* Clockwork Rosette — coupled-ring rotation puzzle. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Clockwork Rosette','puzzle','⚙️','Untangle three linked clockwork dials.','Tap a dial to rotate it and its neighbor one notch. Switch between clockwise and counterclockwise with the button. Align all three golden pointers to the top in three puzzles. Each puzzle has a move limit.'],
    api => {
      const {base,R,O,S,L,T}=api.art, U=api.colors;
      const scrambles=[[0,1,0],[2,1,0,2],[1,2,0,1,2]];
      const limits=[7,9,11];
      const ys=[176,260,344];
      const mod=n=>(n+6)%6;
      function rotate(s,i,dir){
        s.dials[i]=mod(s.dials[i]+dir);
        s.dials[(i+1)%3]=mod(s.dials[(i+1)%3]+dir);
      }
      function load(){
        const s=api.state;
        s.dials=[0,0,0];s.moves=0;s.limit=limits[s.level-1];s.direction=1;
        scrambles[s.level-1].forEach(i=>rotate(s,i,1));
        s.note='Align every pointer with the top mark.';
      }
      function turn(i){
        const s=api.state;
        if(s.ended||i<0||i>2)return;
        rotate(s,i,s.direction);s.moves++;
        api.beep(330+i*70);
        if(s.dials.every(n=>n===0)){
          api.addScore(120+(s.limit-s.moves)*15+(3-s.level)*10);
          if(s.level===3)api.finish(true,'The rosette is perfectly aligned. The machine hums again!');
          else{s.level++;load();s.note='Aligned! A more tangled rosette awaits.';}
        }else if(s.moves>=s.limit){
          api.finish(false,'The mechanism jammed. Try a different sequence of rotations.');
        }else s.note='Keep turning. '+(s.limit-s.moves)+' moves remain.';
      }
      return {
        init(){
          const s=api.state;s.t=150;s.level=1;
          load();
          api.controls([['↻ Clockwise / ↺ Counterclockwise','reverse',true],['Restart puzzle','reset',false]]);
        },
        action(name){
          const s=api.state;if(s.ended)return;
          if(name==='reverse'){s.direction*=-1;s.note=s.direction===1?'Clockwise turns selected.':'Counterclockwise turns selected.';}
          if(name==='reset')load();
        },
        tap(x,y){
          if(x<36||x>324)return;
          const i=ys.findIndex(cy=>Math.abs(y-cy)<=35);
          if(i>=0)turn(i);
        },
        timeout(){if(!api.state.ended)api.finish(false,'Time ran out before the clockwork could be aligned.');},
        draw(){
          const s=api.state;
          base('#171c31');
          T('CLOCKWORK ROSETTE',180,37,23,U.yellow);
          T('PUZZLE '+s.level+'/3  •  MOVES '+s.moves+'/'+s.limit,180,70,14,U.white);
          T('TURN '+(s.direction===1?'CLOCKWISE ↻':'COUNTERCLOCKWISE ↺'),180,101,13,U.mint);
          ys.forEach((cy,i)=>{
            const cx=180,a=-Math.PI/2+s.dials[i]*Math.PI/3;
            R(41,cy-36,278,72,'#26334c',16);
            O(cx,cy,30,'#3c4c66');
            S(cx,cy,28,'#b8c4d7',2);
            for(let j=0;j<6;j++){
              const ang=-Math.PI/2+j*Math.PI/3;
              O(cx+24*Math.cos(ang),cy+24*Math.sin(ang),2.5,j===0?U.yellow:'#8d9db6');
            }
            L(cx,cy,cx+22*Math.cos(a),cy+22*Math.sin(a),U.yellow,5);
            O(cx,cy,5,U.white);
            T('DIAL '+(i+1),88,cy,13,U.white);
            T('↻',273,cy,24,U.mint);
          });
          R(22,390,316,44,'#293651',11);
          T(s.note,180,412,12,U.white);
          T('Each tap also turns the NEXT dial',180,446,11,U.muted);
        }
      };
    }
  );
})();
