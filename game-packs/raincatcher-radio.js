/* Raincatcher Radio — slide the antenna to catch falling signals, not static. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Raincatcher Radio','reflex','📻','Catch falling radio signals while dodging bursts of static.','Drag anywhere across the playfield to move the antenna, or use LEFT and RIGHT buttons. Catch 5 blue signals per wave for 3 waves. Missing 3 signals, catching 3 red static bursts, or running out of time ends the broadcast.'],
    api => {
      const {base,R,O,T,L}=api.art, U=api.colors;
      const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
      const W=360, catcherY=373, catcherHalf=36;
      function spawn(s) {
        const hazard=Math.random()<0.24;
        s.falls.push({x:28+Math.random()*304,y:112,r:hazard?13:12,
          speed:95+s.level*24+Math.random()*26,kind:hazard?'static':'signal'});
      }
      function resetWave(s) {
        s.caught=0;s.falls=[];s.spawnClock=0.5;
        s.note='Wave '+s.level+': collect 5 blue signals.';
      }
      function moveTo(x) { api.state.antenna=clamp(x,catcherHalf+8,W-catcherHalf-8); }
      return {
        init() {
          const s=api.state;
          s.t=105;s.level=1;s.antenna=180;s.missed=0;s.staticHits=0;
          s.falls=[];s.caught=0;s.note='';
          api.controls([['◀ LEFT','left'],['RIGHT ▶','right']]);
          resetWave(s);
        },
        down(x,y) { if(y>=105&&y<=440)moveTo(x); },
        move(x,y) { if(y>=105&&y<=440)moveTo(x); },
        tap(x,y) { if(y>=105&&y<=440)moveTo(x); },
        action(name) {
          if(api.state.ended)return;
          if(name==='left')moveTo(api.state.antenna-48);
          if(name==='right')moveTo(api.state.antenna+48);
        },
        update(dt) {
          const s=api.state;
          if(s.ended)return;
          const step=Math.min(dt,0.08);
          s.spawnClock-=step;
          if(s.spawnClock<=0) {
            if(s.falls.length<3)spawn(s);
            s.spawnClock=0.78-s.level*0.09;
          }
          for(let i=s.falls.length-1;i>=0;i--) {
            const f=s.falls[i];
            f.y+=f.speed*step;
            if(f.y>=catcherY-12&&f.y<=catcherY+15&&Math.abs(f.x-s.antenna)<catcherHalf+f.r*0.5) {
              s.falls.splice(i,1);
              if(f.kind==='static') {
                s.staticHits++;api.beep(155);
                s.note='Static hit! '+(3-s.staticHits)+' shields left.';
                if(s.staticHits>=3){api.finish(false,'The radio shorted out from static.');return;}
              } else {
                s.caught++;api.addScore(10+s.level*5);api.beep(560);
                s.note='Signal '+s.caught+'/5 collected!';
                if(s.caught>=5) {
                  api.addScore(30);
                  if(s.level===3){api.finish(true,'All three radio waves received. Perfect transmission!');return;}
                  s.level++;resetWave(s);return;
                }
              }
            } else if(f.y>420) {
              s.falls.splice(i,1);
              if(f.kind==='signal') {
                s.missed++;s.note='Missed signal! '+(3-s.missed)+' chances left.';
                if(s.missed>=3){api.finish(false,'Too many signals faded into the rain.');return;}
              }
            }
          }
        },
        timeout(){if(!api.state.ended)api.finish(false,'The radio station signed off before your broadcast.');},
        draw(){
          const s=api.state;
          base('#101d34');
          T('RAINCATCHER RADIO',180,37,23,U.yellow);
          T('WAVE '+s.level+'/3   •   SIGNALS '+s.caught+'/5',180,68,15,U.mint);
          T('MISSED '+s.missed+'/3   •   STATIC '+s.staticHits+'/3',180,91,12,U.white);
          for(let j=0;j<7;j++)L(18+j*53,116,18+j*53,420,'#28425b',1);
          for(const f of s.falls){
            if(f.kind==='signal'){
              O(f.x,f.y,14,'#4fc5ff');T('✦',f.x,f.y+1,18,'#08233d');
            }else{
              O(f.x,f.y,14,'#ff778c');T('×',f.x,f.y+1,20,'#401527');
            }
          }
          R(s.antenna-catcherHalf,catcherY-10,catcherHalf*2,22,'#8af0c8',10);
          R(s.antenna-4,catcherY-29,8,22,'#e6f9ff',3);
          O(s.antenna,catcherY-30,6,'#ffdc7a');
          R(24,421,312,23,'#233c54',8);
          T(s.note,180,433,11,U.white);
        }
      };
    }
  );
})();
