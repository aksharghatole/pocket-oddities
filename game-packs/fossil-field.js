/* Fossil Field — a tiny archaeological deduction game. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Fossil Field','puzzle','🦴','Excavate ancient bones while avoiding fragile crystals.','Tap covered squares to dig. Numbers show how many fossils touch that square (including diagonals). Find 5 fossils per dig site, across 3 sites. Four broken crystals end the expedition.'],
    api => {
      const {base,R,O,T}=api.art, U=api.colors, {shuffle}=api.helpers;
      const N=5, SIZE=58, X=35, Y=93, TARGET=5, TRAPS=4;
      const neighbors=k=>{
        const x=k%N,y=Math.floor(k/N),out=[];
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
          if(!dx&&!dy)continue;
          const nx=x+dx,ny=y+dy;
          if(nx>=0&&nx<N&&ny>=0&&ny<N)out.push(ny*N+nx);
        }
        return out;
      };
      function site(s){
        const slots=shuffle(Array.from({length:N*N},(_,i)=>i));
        s.fossils=new Set(slots.slice(0,TARGET));
        s.traps=new Set(slots.slice(TARGET,TARGET+TRAPS));
        s.open=new Set();
        s.found=0;
        s.note='Dig carefully: numbers hint at nearby bones';
      }
      function dig(k){
        const s=api.state;
        if(s.ended||s.open.has(k))return;
        s.open.add(k);
        if(s.traps.has(k)){
          s.strikes++;
          s.note='Crystal cracked! '+(4-s.strikes)+' chances left';
          api.beep(165);
          if(s.strikes>=4){
            api.finish(false,'Too many fragile crystals broke. Try another excavation!');
            return;
          }
        }else if(s.fossils.has(k)){
          s.found++;
          api.addScore(20);
          api.beep(660);
          s.note='Fossil found! '+s.found+'/'+TARGET;
          if(s.found===TARGET){
            api.addScore(30+Math.floor(s.t/3));
            if(s.level===3){
              api.finish(true,'All 15 fossils recovered! The museum celebrates your expedition.');
              return;
            }
            s.level++;
            s.t=Math.min(150,s.t+25);
            site(s);
            s.note='New dig site '+s.level+'/3. Keep searching!';
          }
        }else{
          api.addScore(2);
          s.note='No bone here. Follow the nearby-fossil clues.';
        }
      }
      return {
        init(){
          const s=api.state;
          s.level=1;s.t=150;s.strikes=0;
          api.controls([]);
          site(s);
        },
        tap(x,y){
          const col=Math.floor((x-X)/SIZE),row=Math.floor((y-Y)/SIZE);
          if(col<0||col>=N||row<0||row>=N)return;
          dig(row*N+col);
        },
        update(dt){
          const s=api.state;
          s.t=Math.max(0,s.t-dt);
          if(s.t<=0&&!s.ended)api.finish(false,'Time ran out before the expedition was complete.');
        },
        timeout(){if(!api.state.ended)api.finish(false,'The expedition ran out of time.');},
        draw(){
          const s=api.state;
          base('#19243a');
          T('FOSSIL FIELD',180,30,23,U.yellow);
          T('SITE '+s.level+'/3  ·  BONES '+s.found+'/5',180,59,14,U.mint);
          for(let k=0;k<N*N;k++){
            const x=X+(k%N)*SIZE,y=Y+Math.floor(k/N)*SIZE;
            const opened=s.open.has(k);
            const fossil=opened&&s.fossils.has(k),trap=opened&&s.traps.has(k);
            R(x+2,y+2,SIZE-4,SIZE-4,opened?(fossil?'#426454':trap?'#71404e':'#35455d'):'#967650',9);
            if(!opened){
              O(x+SIZE/2,y+SIZE/2,3,'#c8a77b');
            }else if(fossil){
              T('🦴',x+SIZE/2,y+SIZE/2,26);
            }else if(trap){
              T('💎',x+SIZE/2,y+SIZE/2,25);
            }else{
              const clue=neighbors(k).filter(n=>s.fossils.has(n)).length;
              T(clue?String(clue):'·',x+SIZE/2,y+SIZE/2,21,clue?U.yellow:U.muted);
            }
          }
          R(25,401,310,39,'#28374f',10);
          T('CRACKS '+s.strikes+'/4  ·  '+(25-s.open.size)+' covered',180,419,13,U.white);
          T(s.note,180,389,11,U.mint);
          T('Tap squares · 4 cracks or no time = fail',180,446,10,U.muted);
        }
      };
    }
  );
})();
