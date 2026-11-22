/* Firefly Census — count a fleeting species before the meadow goes dark. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Firefly Census','puzzle','✨','Count the glowing fireflies before the meadow goes dark.','Watch the meadow for five seconds. Count only the yellow diamond fireflies, ignoring blue circles. When the lights go out, choose the count. Solve five meadows; three wrong counts end the survey.'],
    api => {
      const {base,R,O,T}=api.art, U=api.colors;
      const {shuffle}=api.helpers;
      const TOTAL=5;
      const targets=[3,4,5,6,7];
      function begin(s){
        const count=targets[s.level-1];
        const items=shuffle(Array.from({length:count+4},(_,i)=>({
          target:i<count,
          x:43+(i%4)*90,
          y:145+Math.floor(i/4)*67
        })));
        // Shuffle symbols independently of positions, so layouts vary each run.
        s.items=items.map((item,i)=>({...item,x:43+(i%4)*90,y:145+Math.floor(i/4)*67}));
        s.answer=count;s.preview=5;s.phase='watch';
        s.note='Count yellow diamonds — ignore blue circles!';
      }
      function guess(value){
        const s=api.state;
        if(s.ended||s.phase!=='answer')return;
        if(value===s.answer){
          api.addScore(100+s.level*25+Math.max(0,3-s.errors)*15);
          api.beep(560);
          if(s.level===TOTAL)api.finish(true,'All five meadows counted. Your firefly census is complete!');
          else {s.level++;begin(s);}
        }else{
          s.errors++;api.beep(155);
          if(s.errors>=3)api.finish(false,'Three incorrect counts ended the survey. Try again!');
          else {s.phase='watch';s.preview=5;s.note='Not quite! Study this meadow again. '+(3-s.errors)+' chances left.';}
        }
      }
      return {
        init(){
          const s=api.state;s.t=110;s.level=1;s.errors=0;
          api.controls([]);
          begin(s);
        },
        update(dt){
          const s=api.state;
          if(s.ended||s.phase!=='watch')return;
          s.preview=Math.max(0,s.preview-dt);
          if(s.preview===0){s.phase='answer';s.note='How many yellow diamonds did you see?';}
        },
        action(name){if(/^count-[1-7]$/.test(name))guess(Number(name.slice(6)));},
        tap(x,y){
          const s=api.state;
          if(s.phase!=='answer'||y<326||y>428)return;
          const col=Math.floor((x-21)/46);
          if(col>=0&&col<7)guess(col+1);
        },
        timeout(){if(!api.state.ended)api.finish(false,'Night fell before the census was finished.');},
        draw(){
          const s=api.state;
          base('#112a31');
          T('FIREFLY CENSUS',180,38,23,U.mint);
          T('MEADOW '+s.level+'/'+TOTAL+'  ·  ERRORS '+s.errors+'/3',180,68,14,U.yellow);
          R(18,90,324,223,'#173c42',18);
          if(s.phase==='watch'){
            s.items.forEach((p,i)=>{
              if(p.target){
                O(p.x,p.y,19,'rgba(255,223,105,0.17)');
                T('◆',p.x,p.y+9,29,'#ffe18d');
              }else{
                O(p.x,p.y,13,'#70b9dc');
                O(p.x-4,p.y-4,3,'#d2f5ff');
              }
            });
            T('LIGHTS OUT IN '+Math.ceil(s.preview),180,300,14,U.yellow);
          }else{
            T('THE MEADOW IS DARK',180,189,20,U.mint);
            T('Remember the yellow diamonds',180,220,13,U.white);
          }
          if(s.phase==='answer'){
            for(let i=0;i<7;i++){
              const x=21+i*46;
              R(x,331,42,88,'#42637a',9);
              T(String(i+1),x+21,383,23,U.white);
            }
          }else{
            R(30,339,300,64,'#2d5155',12);
            T('WATCH · COUNT · REMEMBER',180,376,16,U.white);
          }
          T(s.note,180,443,11,U.white);
        }
      };
    }
  );
})();
