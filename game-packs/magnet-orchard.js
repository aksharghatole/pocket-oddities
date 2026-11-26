/* Magnet Orchard — steer falling iron seeds with reversible magnetic fields. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Magnet Orchard','strategy','🧲','Guide falling iron seeds into magnetic flowerpots.','Tap the LEFT or RIGHT half of the field, or use the polarity buttons, to pull each falling seed sideways. Catch two seeds in each of three gardens. Four missed seeds or 115 seconds ends the run.'],
    api => {
      const {base,R,O,S,L,T}=api.art, U=api.colors;
      const targets=[[98,258],[260,105],[120,252]];
      const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
      function newSeed(){
        const s=api.state;
        s.x=180;s.y=110;s.vx=0;s.polarity=0;
        s.target=targets[s.level-1][s.caught%2];
        s.note='Choose a magnet to steer the seed.';
      }
      function steer(direction){
        const s=api.state;
        if(s.ended)return;
        s.polarity=direction;
        s.note=direction<0?'LEFT magnet active':'RIGHT magnet active';
        api.beep(direction<0?340:470);
      }
      function land(){
        const s=api.state;
        const hit=Math.abs(s.x-s.target)<=35;
        if(hit){
          s.caught++;api.addScore(100+Math.max(0,Math.round(35-Math.abs(s.x-s.target))));
          api.beep(650);
          if(s.caught>=2){
            api.addScore(75*s.level);
            if(s.level===3){api.finish(true,'All six iron seeds found their flowerpots!');return;}
            s.level++;s.caught=0;
          }
        }else{
          s.missed++;api.beep(160);
          if(s.missed>=4){api.finish(false,'Too many seeds landed outside the flowerpots.');return;}
        }
        newSeed();
        s.note=hit?'Seed planted! Guide the next one.':'Missed! Adjust the magnet earlier.';
      }
      return {
        init(){
          const s=api.state;
          s.level=1;s.t=115;s.caught=0;s.missed=0;
          newSeed();
          api.controls([['◀ LEFT','left',true],['RIGHT ▶','right',true]]);
        },
        action(name){if(name==='left')steer(-1);else if(name==='right')steer(1);},
        tap(x,y){if(y>=95&&y<=400)steer(x<180?-1:1);},
        update(dt){
          const s=api.state;
          if(s.ended)return;
          const step=Math.min(.06,Math.max(0,dt));
          const acceleration=230+s.level*45;
          s.vx=clamp((s.vx+s.polarity*acceleration*step)*Math.pow(.97,step*60),-165,165);
          s.x=clamp(s.x+s.vx*step,24,336);
          if(s.x===24||s.x===336)s.vx=0;
          s.y+=(82+s.level*13)*step;
          if(s.y>=350)land();
        },
        timeout(){if(!api.state.ended)api.finish(false,'The orchard closed before all seeds were planted.');},
        draw(){
          const s=api.state;
          base('#182c35');
          T('MAGNET ORCHARD',180,40,23,U.yellow);
          T('GARDEN '+s.level+'/3  •  PLANTED '+s.caught+'/2',180,70,14,U.mint);
          T('MISSES '+s.missed+'/4',180,94,12,U.white);
          R(20,112,320,255,'#203f47',18);
          for(let i=0;i<5;i++)L(36,160+i*38,324,160+i*38,'#365962',1);
          R(s.target-38,340,76,26,'#d09a66',8);
          R(s.target-28,332,56,12,'#83d6a2',6);
          T('✿',s.target,334,25,'#b7f2c7');
          S(s.x,s.y,14,'#ffe6a0',3);
          O(s.x,s.y,9,'#f5c77b');
          T('N',s.x,s.y-22,12,U.yellow);
          R(27,378,145,44,s.polarity===-1?'#5a7fb0':'#31485b',12);
          R(188,378,145,44,s.polarity===1?'#5a7fb0':'#31485b',12);
          T('◀ LEFT',99,405,16,U.white);
          T('RIGHT ▶',261,405,16,U.white);
          T(s.note,180,442,11,U.white);
        }
      };
    }
  );
})();
