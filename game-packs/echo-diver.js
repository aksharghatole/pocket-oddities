/* Echo Diver — sonar exploration and underwater salvage in three compact dives. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Echo Diver','strategy','🫧','Navigate dark reefs with a limited supply of sonar pings.','Tap a neighboring square to swim one step. Dark squares may hide reefs! Tap PING to reveal nearby water for 2 oxygen. Collect both glowing pearls, then reach the green exit. Clear three dives before oxygen or your three hull points run out.'],
    api => {
      const {base,R,O,S,L,T}=api.art, C=api.colors;
      const SIZE=5, LEFT=30, TOP=115, CELL=60;
      const maps=[
        {reefs:['1,0','1,1','3,1','2,3','0,4','3,4'],pearls:['2,1','3,3']},
        {reefs:['1,0','2,0','1,2','3,2','1,4','3,4'],pearls:['0,3','4,1']},
        {reefs:['0,1','2,1','3,1','1,3','2,3','4,3'],pearls:['1,1','3,3']}
      ];
      const key=(x,y)=>x+','+y;
      const inside=(x,y)=>x>=0&&x<SIZE&&y>=0&&y<SIZE;
      function reveal(s,radius){
        for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
          if(Math.abs(x-s.x)+Math.abs(y-s.y)<=radius)s.seen.add(key(x,y));
        }
      }
      function newDive(){
        const s=api.state;
        s.x=0;s.y=0;s.oxygen=24;s.collected=new Set();s.seen=new Set();
        s.note='Explore. Avoid the red reef tiles.';
        reveal(s,1);
      }
      function lose(message){
        const s=api.state;
        if(s.hull<=0)api.finish(false,'The reef broke your hull. '+message);
        else if(s.oxygen<=0)api.finish(false,'Out of oxygen! '+message);
      }
      function ping(){
        const s=api.state;
        if(s.ended)return;
        if(s.oxygen<=2){s.note='Not enough oxygen for sonar. Swim instead.';return;}
        s.oxygen-=2;reveal(s,2);s.ripple=1;
        s.note='Sonar reveals water up to two steps away.';
        api.beep(560);
      }
      function swim(x,y){
        const s=api.state;
        if(s.ended||!inside(x,y))return;
        if(Math.abs(x-s.x)+Math.abs(y-s.y)!==1){
          s.note='Tap one adjacent square (not diagonally).';return;
        }
        const map=maps[s.level-1],tile=key(x,y);
        s.seen.add(tile);
        if(map.reefs.includes(tile)){
          s.hull--;s.oxygen=Math.max(0,s.oxygen-2);
          api.beep(140);
          s.note='Reef collision! Hull: '+s.hull+'/3.';
          lose('Use sonar before risky moves.');
          return;
        }
        s.x=x;s.y=y;s.oxygen--;
        reveal(s,1);
        if(map.pearls.includes(tile)&&!s.collected.has(tile)){
          s.collected.add(tile);api.addScore(60);api.beep(780);
          s.note='Pearl recovered! '+s.collected.size+'/2 collected.';
        }else{
          s.note='Swim to both pearls, then the green exit.';
          api.beep(370);
        }
        if(x===4&&y===4&&s.collected.size===2){
          api.addScore(100+s.oxygen*5+s.hull*20);
          if(s.level===maps.length){
            api.finish(true,'Three dives complete! Every lost pearl is home.');
            return;
          }
          s.level++;newDive();s.note='Dive cleared! Fresh oxygen and darker reefs.';
          api.beep(690);
          return;
        }
        if(x===4&&y===4)s.note='Exit locked: recover both pearls first!';
        lose('Try the route again.');
      }
      return {
        init(){
          const s=api.state;s.t=180;s.level=1;s.hull=3;s.ripple=0;
          newDive();
          api.controls([['SONAR PING · 2 O₂','ping',true]]);
        },
        action(name){if(name==='ping')ping();},
        tap(x,y){
          const s=api.state;
          if(s.ended)return;
          if(y>=TOP&&y<TOP+SIZE*CELL&&x>=LEFT&&x<LEFT+SIZE*CELL){
            swim(Math.floor((x-LEFT)/CELL),Math.floor((y-TOP)/CELL));
          }else if(y>=72&&y<=110){ping();}
        },
        update(dt){const s=api.state;s.ripple=Math.max(0,(s.ripple||0)-dt);},
        timeout(){if(!api.state.ended)api.finish(false,'The dive clock ran out before the pearls were recovered.');},
        draw(){
          const s=api.state,map=maps[s.level-1];
          base('#101f35');
          T('ECHO DIVER',180,34,26,C.mint);
          T('DIVE '+s.level+'/3  ·  PEARLS '+s.collected.size+'/2',180,63,14,C.yellow);
          R(26,76,308,30,'#263c52',9);
          T('O₂ '+s.oxygen+'/24    ♥ '+s.hull+'/3    SONAR: PING',180,95,13,C.white);
          for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
            const tile=key(x,y),seen=s.seen.has(tile);
            const reef=map.reefs.includes(tile),pearl=map.pearls.includes(tile);
            const px=LEFT+x*CELL,py=TOP+y*CELL;
            const background=!seen?'#203046':reef?'#753c52':'#234b62';
            R(px+2,py+2,CELL-4,CELL-4,background,9);
            if(!seen){T('?',px+CELL/2,py+CELL/2,19,'#52677d');continue;}
            if(reef){
              T('✕',px+CELL/2,py+CELL/2,25,'#ff9ba1');
            }else if(pearl&&!s.collected.has(tile)){
              O(px+CELL/2,py+CELL/2,12,'#ffe5a1');
              S(px+CELL/2,py+CELL/2,17,'#f6d989',2);
            }else if(x===4&&y===4){
              O(px+CELL/2,py+CELL/2,17,'#2cae83');
              T('⇣',px+CELL/2,py+CELL/2,21,'#ffffff');
            }else if(pearl){
              T('✓',px+CELL/2,py+CELL/2,18,C.mint);
            }else{
              O(px+CELL/2,py+CELL/2,2,'#548ca1');
            }
          }
          const cx=LEFT+s.x*CELL+CELL/2,cy=TOP+s.y*CELL+CELL/2;
          if(s.ripple>0)S(cx,cy,18+80*(1-s.ripple),'#8bdbea',2);
          O(cx,cy,18,'#b0eeeb');S(cx,cy,18,'#ffffff',2);
          T('◆',cx,cy,19,'#174859');
          R(16,426,328,22,'#263c52',8);
          T(s.note.length>48?s.note.slice(0,45)+'…':s.note,180,439,11,C.white);
        }
      };
    }
  );
})();
