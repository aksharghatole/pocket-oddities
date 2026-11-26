/* Palindrome Press — compose mirror-reading words from loose letter tiles. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Palindrome Press','puzzle','🪞','Build words that read identically forwards and backwards.','Tap loose letters to fill the printing line. The completed line must read the same from both ends. Use UNDO to return the last tile; CHECK to submit. Print three palindromes before time runs out or three bad checks.'],
    api => {
      const {base,R,T}=api.art, U=api.colors;
      const words=['RADAR','LEVEL','ROTATOR'];
      const shuffle=api.helpers.shuffle;
      function setup(s) {
        const letters=[...words[s.level-1]];
        s.tiles=shuffle([...letters]).map((letter,id)=>({letter,id,used:false}));
        s.chosen=[];s.note='Tap letters to build a mirror word.';
      }
      function undo() {
        const s=api.state;
        if(!s.chosen.length)return;
        const id=s.chosen.pop();
        s.tiles.find(tile=>tile.id===id).used=false;
        s.note='Last letter returned.';
      }
      return {
        init() {
          const s=api.state;
          s.t=145;s.level=1;s.errors=0;
          setup(s);
          api.controls([['UNDO','undo'],['CHECK PRINT','check',true],['CLEAR','clear']]);
        },
        action(name) {
          const s=api.state;
          if(s.ended)return;
          if(name==='undo')undo();
          if(name==='clear') {
            s.chosen=[];s.tiles.forEach(tile=>{tile.used=false;});
            s.note='Letters returned to the tray.';
          }
          if(name!=='check')return;
          if(s.chosen.length!==s.tiles.length) {
            s.note='Fill every printing slot first.';
            return;
          }
          const text=s.chosen.map(id=>s.tiles.find(tile=>tile.id===id).letter).join('');
          if(text===text.split('').reverse().join('')) {
            api.addScore(100+s.level*40+(3-s.errors)*15);
            api.beep(620);
            if(s.level===words.length)api.finish(true,'Three perfect mirror words printed!');
            else {s.level++;setup(s);s.note='Perfect print! Next word is longer.';}
          } else {
            s.errors++;api.beep(170);
            s.note='The ends do not mirror. '+(3-s.errors)+' checks remain.';
            if(s.errors>=3)api.finish(false,'The press jammed after three incorrect prints.');
          }
        },
        tap(x,y) {
          const s=api.state;
          if(s.ended)return;
          if(y>=154&&y<=224&&s.chosen.length) {
            const n=s.tiles.length, width=42,gap=4,left=(360-(n*width+(n-1)*gap))/2;
            const slot=Math.floor((x-left)/(width+gap));
            if(slot===s.chosen.length-1&&x>=left+slot*(width+gap)&&x<=left+slot*(width+gap)+width)undo();
            return;
          }
          if(y<272||y>349)return;
          const n=s.tiles.length,width=42,gap=4,left=(360-(n*width+(n-1)*gap))/2;
          const i=Math.floor((x-left)/(width+gap));
          if(i<0||i>=n||x<left+i*(width+gap)||x>left+i*(width+gap)+width)return;
          const tile=s.tiles[i];
          if(tile.used)return;
          tile.used=true;s.chosen.push(tile.id);
          api.beep(370+s.chosen.length*35);
          s.note=s.chosen.length===n?'All slots filled. Check the mirror!':'Tap the next letter.';
        },
        timeout(){if(!api.state.ended)api.finish(false,'The printing shop closed before the last word.');},
        draw() {
          const s=api.state,n=s.tiles.length,width=42,gap=4,left=(360-(n*width+(n-1)*gap))/2;
          base('#211b36');
          T('PALINDROME PRESS',180,38,23,U.yellow);
          T('PRINT '+s.level+'/3  ·  BAD CHECKS '+s.errors+'/3',180,70,13,U.mint);
          T('READ THE SAME IN BOTH DIRECTIONS',180,106,12,U.white);
          T('→',35,191,24,U.yellow);T('←',325,191,24,U.yellow);
          for(let i=0;i<n;i++) {
            const x=left+i*(width+gap);
            R(x,158,width,62,'#39445c',7);
            const id=s.chosen[i];
            if(id!==undefined) {
              R(x+2,160,width-4,58,'#f5d9a7',6);
              T(s.tiles.find(tile=>tile.id===id).letter,x+width/2,191,25,'#28213d');
            } else T('·',x+width/2,191,24,U.muted);
          }
          T('LETTER TRAY',180,254,13,U.mint);
          for(let i=0;i<n;i++) {
            const tile=s.tiles[i],x=left+i*(width+gap);
            R(x,275,width,70,tile.used?'#343049':'#8cced0',8);
            T(tile.used?'·':tile.letter,x+width/2,311,24,tile.used?'#65617a':'#1b3041');
          }
          R(15,385,330,49,'#34304b',10);
          T(s.note,180,409,11,U.white);
          T('Tap the last printed letter to undo.',180,444,10,U.muted);
        }
      };
    }
  );
})();
