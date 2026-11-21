/* Ferry Fiasco — carry odd cargo without leaving dangerous pairs alone. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Ferry Fiasco','strategy','⛵','A tiny river crossing with very questionable passengers.','Tap passengers on the boat’s bank to board or unboard them, then tap SAIL. Never leave a dangerous pair together without the ferryman. Cross all three rivers before time runs out.'],
    api => {
      const {base,R,O,L,T}=api.art, C=api.colors;
      const levels=[
        {names:['Wolf','Goat','Cabbage'],pairs:[[0,1],[1,2]],capacity:1,budget:12},
        {names:['Cat','Mouse','Cheese','Candle'],pairs:[[0,1],[1,2],[2,3]],capacity:2,budget:9},
        {names:['Fox','Hen','Grain','Mouse','Cheese'],pairs:[[0,1],[1,2],[2,3],[3,4]],capacity:2,budget:14}
      ];
      const leftX=84,rightX=276;
      function startLevel(s) {
        const level=levels[s.level-1];
        s.sides=level.names.map(()=>0);s.bank=0;s.selected=[];s.moves=0;
        s.note='Tap cargo on the LEFT bank, then SAIL.';
        api.controls([['SAIL ACROSS','sail',true],['CLEAR CARGO','clear',false]]);
      }
      function unsafe(s, nextSides, nextBank) {
        const level=levels[s.level-1], unattended=1-nextBank;
        return level.pairs.some(([a,b])=>nextSides[a]===unattended&&nextSides[b]===unattended);
      }
      function sail() {
        const s=api.state;
        if(s.ended)return;
        const level=levels[s.level-1];
        if(s.moves>=level.budget) {
          api.finish(false,'Out of crossings! Try a more efficient ferry route.');
          return;
        }
        const destination=1-s.bank, next=s.sides.slice();
        for(const i of s.selected)next[i]=destination;
        if(unsafe(s,next,destination)) {
          s.strikes++;
          s.note='Unsafe pair left alone! '+(3-s.strikes)+' warnings remain.';
          api.beep(180);
          if(s.strikes>=3)api.finish(false,'The cargo caused chaos. Keep dangerous pairs apart.');
          return;
        }
        s.sides=next;s.bank=destination;s.selected=[];s.moves++;
        api.addScore(10);
        api.beep(550);
        if(s.sides.every(side=>side===1)) {
          api.addScore(Math.max(0,level.budget-s.moves)*8+30);
          if(s.level===levels.length) {
            api.finish(true,'All three rivers crossed. Every suspicious passenger survived!');
          } else {
            s.level++;
            startLevel(s);
            s.note='River '+s.level+'! Watch the new dangerous pairs.';
          }
        } else if(s.moves>=level.budget) {
          api.finish(false,'No crossings left. Try again with a different route.');
        } else {
          s.note='Safe crossing! Choose cargo or return empty.';
        }
      }
      function toggle(i) {
        const s=api.state,level=levels[s.level-1];
        if(s.ended||s.sides[i]!==s.bank)return;
        const at=s.selected.indexOf(i);
        if(at>=0)s.selected.splice(at,1);
        else if(s.selected.length<level.capacity)s.selected.push(i);
        else {s.note='Boat holds only '+level.capacity+' passenger'+(level.capacity===1?'':'s')+'.';return;}
        s.note=s.selected.length?s.selected.length+' aboard. Tap SAIL when ready.':'Boat empty. You can sail back alone.';
      }
      return {
        init() {
          const s=api.state;
          s.t=150;s.level=1;s.strikes=0;s.score=0;
          startLevel(s);
        },
        action(name) {
          if(name==='sail')sail();
          if(name==='clear'){api.state.selected=[];api.state.note='Cargo cleared. Choose passengers.';}
        },
        tap(x,y) {
          const s=api.state;
          if(s.ended)return;
          const level=levels[s.level-1];
          for(let i=0;i<level.names.length;i++) {
            const bx=s.sides[i]===0?leftX:rightX;
            if(Math.abs(x-bx)<68&&Math.abs(y-(151+i*42))<19){toggle(i);return;}
          }
          if(y>=375&&y<=435)sail();
        },
        timeout() {if(!api.state.ended)api.finish(false,'The river closed for the night. Try the crossing again.');},
        draw() {
          const s=api.state,level=levels[s.level-1];
          base('#15263c');
          T('FERRY FIASCO',180,29,22,C.mint);
          T('RIVER '+s.level+'/3   ·   CROSSINGS '+s.moves+'/'+level.budget,180,57,12,C.yellow);
          T('WARNINGS '+s.strikes+'/3   ·   BOAT '+s.selected.length+'/'+level.capacity,180,78,12,C.white);
          R(154,105,52,259,'#24698b',12);
          for(let y=120;y<365;y+=38){L(163,y,195,y+12,'#75c9e966',3);}
          T('LEFT',leftX,113,13,C.muted);
          T('RIGHT',rightX,113,13,C.muted);
          level.names.forEach((name,i)=>{
            const side=s.sides[i],x=side===0?leftX:rightX,y=151+i*42;
            const selected=s.selected.includes(i);
            R(x-65,y-18,130,36,selected?C.yellow:'#35465f',10);
            T(name+(selected?' ✓':''),x,y,14,selected?'#18243a':C.white);
          });
          R(19,370,322,65,'#2b3c55',13);
          T(s.bank===0?'BOAT AT LEFT BANK':'BOAT AT RIGHT BANK',180,387,12,C.mint);
          T('⛵ TAP HERE TO SAIL →',180,414,16,C.yellow);
          const pairs=level.pairs.map(([a,b])=>level.names[a]+' / '+level.names[b]);
          T('KEEP APART: '+pairs.slice(0,2).join(' · '),180,92,10,C.red);
          T(s.note,180,445,10,C.white);
        }
      };
    }
  );
})();
