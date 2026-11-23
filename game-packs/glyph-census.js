/* Glyph Census — count the matching symbols, not the decoys. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Glyph Census','puzzle','🔎','A tiny visual census of mysterious symbols.','Count only the highlighted target glyph in the 5×5 field. Tap the matching number below. Solve five fields before time expires; three incorrect counts end the survey.'],
    api => {
      const {base,R,T}=api.art, U=api.colors;
      const glyphs=['◆','●','▲','✦','■'];
      const rounds=5;
      function field(s) {
        const target=s.level%glyphs.length;
        const count=2+s.level;
        s.target=target;s.answer=count;
        const cells=Array.from({length:25},(_,i)=>({glyph:(target+1+(i*7)%4)%5,order:(i*11+3*s.level)%25}));
        const chosen=new Set();
        for(let j=0;j<count;j++)chosen.add((j*7+s.level*3)%25);
        cells.forEach((c,i)=>{if(chosen.has(i))c.glyph=target;});
        s.cells=cells;s.note='Count the '+glyphs[target]+' symbols.';
      }
      return {
        init() {
          const s=api.state;s.level=1;s.t=100;s.errors=0;
          field(s);
          api.controls([1,2,3,4,5,6,7].map(n=>[String(n),'count-'+n,true]));
        },
        action(name) {
          const s=api.state;
          if(s.ended||!/^count-[1-7]$/.test(name))return;
          const n=Number(name.slice(6));
          if(n!==s.answer) {
            s.errors++;s.note='Not quite. '+(3-s.errors)+' mistakes left.';
            api.beep(175);
            if(s.errors>=3)api.finish(false,'The glyph ledger is too smudged. Try a fresh survey.');
            return;
          }
          api.addScore(100+s.level*20);api.beep(490);
          if(s.level===rounds) {
            api.finish(true,'Every strange symbol accounted for. Census complete!');
          } else {
            s.level++;field(s);
          }
        },
        timeout(){if(!api.state.ended)api.finish(false,'The census bell rang before the final count.');},
        draw(){
          const s=api.state;
          base('#141b34');
          T('GLYPH CENSUS',180,35,23,U.mint);
          T('FIELD '+s.level+'/'+rounds+'  ·  ERRORS '+s.errors+'/3',180,62,14,U.yellow);
          R(30,79,300,52,'#2c3855',12);
          T('COUNT ONLY:  '+glyphs[s.target],180,113,22,U.yellow);
          s.cells.forEach((c,i)=>{
            const x=38+(i%5)*58,y=148+Math.floor(i/5)*46;
            R(x,y,52,41,'#283450',8);
            T(glyphs[c.glyph],x+26,y+28,25,c.glyph===s.target?U.yellow:U.white);
          });
          R(24,395,312,45,'#293653',10);
          T(s.note,180,423,13,U.white);
        }
      };
    }
  );
})();
