/* Moonphase Studio — rotate a lunar dial to match the observatory's target. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Moonphase Studio','puzzle','🌗','Tune a tiny observatory by aligning the moon to its nightly forecast.','Use the left and right buttons, or tap the arrows, to rotate the moon dial one phase. Match the target phase in the move budget. Complete three observations; three failed attempts or time running out ends the night.'],
    api => {
      const {base,R,O,S,T}=api.art, U=api.colors;
      const names=['New','Waxing crescent','First quarter','Waxing gibbous','Full','Waning gibbous','Last quarter','Waning crescent'];
      const moons=['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
      const rounds=[{start:0,target:2,limit:3},{start:4,target:6,limit:3},{start:7,target:3,limit:5}];
      function setup(){
        const s=api.state, r=rounds[s.level-1];
        s.phase=r.start;s.target=r.target;s.moves=0;s.limit=r.limit;
        s.note='Turn the dial to '+names[s.target]+'.';
      }
      function rotate(dir){
        const s=api.state;
        if(s.ended)return;
        s.phase=(s.phase+dir+8)%8;s.moves++;
        api.beep(280+s.phase*40);
        if(s.phase===s.target){
          api.addScore(100+(s.limit-s.moves)*25+(3-s.errors)*10);
          if(s.level===rounds.length){
            api.finish(true,'Three perfect moon readings! The observatory is saved.');
          }else{
            s.level++;setup();
            s.note='Reading recorded! Find the next phase.';
          }
        }else if(s.moves>=s.limit){
          s.errors++;
          api.beep(150);
          if(s.errors>=3){
            api.finish(false,'Three failed readings. The observatory closes for tonight.');
          }else{
            setup();s.note='Out of turns. Retry this reading ('+(3-s.errors)+' chances left).';
          }
        }else s.note=(s.limit-s.moves)+' turns left to match the target.';
      }
      return {
        init(){
          const s=api.state;s.t=110;s.level=1;s.errors=0;
          setup();
          api.controls([['◀ Rotate left','left',true],['Rotate right ▶','right',true]]);
        },
        action(name){if(name==='left')rotate(-1);if(name==='right')rotate(1);},
        tap(x,y){
          if(y>=278&&y<=372){
            if(x<170)rotate(-1);
            else if(x>190)rotate(1);
          }
        },
        timeout(){if(!api.state.ended)api.finish(false,'Sunrise arrived before the final reading.');},
        draw(){
          const s=api.state;
          base('#11192f');
          T('MOONPHASE STUDIO',180,35,23,U.mint);
          T('READING '+s.level+'/3  •  MISSES '+s.errors+'/3',180,65,14,U.yellow);
          R(23,85,314,80,'#293852',14);
          T('TARGET',180,107,12,U.muted);
          T(moons[s.target]+'  '+names[s.target],180,143,20,U.white);
          S(180,235,63,U.mint,3);
          O(180,235,55,'#25314c');
          T(moons[s.phase],180,258,75,U.white);
          T(names[s.phase],180,313,16,U.white);
          R(24,329,130,56,'#40587b',13);
          R(206,329,130,56,'#40587b',13);
          T('◀ LEFT',89,364,19,U.white);
          T('RIGHT ▶',271,364,19,U.white);
          T('TURNS '+s.moves+'/'+s.limit,180,406,14,U.yellow);
          T(s.note,180,430,12,U.white);
        }
      };
    }
  );
})();
