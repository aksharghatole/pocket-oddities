/* Umbrella Parade — catch rain while folding the umbrella for lightning. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Umbrella Parade','reflex','☂️','Catch raindrops, fold for lightning, and survive three storm fronts.','Drag across the arena or use LEFT/RIGHT to move. Tap FOLD/OPEN to switch your umbrella. Catch blue drops while open; fold to let yellow lightning pass harmlessly. Catch 8 drops per storm. Six missed drops or three lightning strikes end the parade.'],
    api => {
      const {base,R,O,L,T}=api.art, U=api.colors, {clamp,rnd}=api.helpers;
      const goal=8, storms=3;
      function spawn(s) {
        const danger=Math.random()<(.18+.045*(s.level-1));
        s.falling.push({x:rnd(30,330),y:104,kind:danger?'bolt':'rain',speed:rnd(105,150)+s.level*28,done:false});
      }
      function shift(x) { const s=api.state;if(!s.ended)s.x=clamp(x,39,321); }
      function toggle() { const s=api.state;if(s.ended)return;s.open=!s.open;s.note=s.open?'OPEN: catch blue drops':'FOLDED: dodge yellow bolts';api.beep(s.open?470:290); }
      function resolve(s,item) {
        if(item.kind==='rain') {
          if(s.open&&Math.abs(item.x-s.x)<48) {
            s.caught++;api.addScore(15+s.level*5);api.beep(580);
            if(s.caught>=goal) {
              api.addScore(60);
              if(s.level>=storms){api.finish(true,'Three storm fronts crossed. Every umbrella deserves a parade!');return;}
              s.level++;s.caught=0;s.falling=[];s.spawnIn=.7;
              s.note='Storm '+s.level+'! Rain is falling faster.';
            }
          } else {
            s.missed++;
            s.note='Missed rain: '+s.missed+'/6';
            if(s.missed>=6)api.finish(false,'Too much rain escaped the umbrella. Try again!');
          }
        } else if(s.open&&Math.abs(item.x-s.x)<48) {
          s.strikes++;s.note='Lightning strikes: '+s.strikes+'/3';
          api.beep(160);
          if(s.strikes>=3)api.finish(false,'The storm caught your open umbrella. Fold for lightning!');
        } else if(item.kind==='bolt') {
          api.addScore(5);
        }
      }
      return {
        init(){
          const s=api.state;
          s.t=115;s.level=1;s.x=180;s.open=true;s.caught=0;s.missed=0;s.strikes=0;
          s.falling=[];s.spawnIn=.65;s.note='OPEN: catch blue drops. FOLD for bolts!';
          api.controls([['◀ LEFT','left',true],['FOLD / OPEN','toggle',true],['RIGHT ▶','right',true]]);
        },
        action(name){
          if(name==='left')shift(api.state.x-47);
          else if(name==='right')shift(api.state.x+47);
          else if(name==='toggle')toggle();
        },
        down(x,y){if(y>95)shift(x);},
        move(x,y){if(y>95)shift(x);},
        tap(x,y){if(y>=365&&y<=441)toggle();else if(y>95)shift(x);},
        update(dt){
          const s=api.state;if(s.ended)return;
          const step=Math.min(dt,.08);
          s.spawnIn-=step;
          if(s.spawnIn<=0){spawn(s);s.spawnIn=rnd(.65,.95)-.10*(s.level-1);}
          for(const item of s.falling){
            item.y+=item.speed*step;
            if(item.y>=350&&!item.done){item.done=true;resolve(s,item);if(s.ended)return;}
          }
          s.falling=s.falling.filter(item=>!item.done&&item.y<460);
        },
        timeout(){if(!api.state.ended)api.finish(false,'The parade ended before the third storm passed.');},
        draw(){
          const s=api.state;
          base('#12243e');
          for(let i=0;i<17;i++)L((i*47+18)%360,95+(i*31)%255,(i*47+9)%360,113+(i*31)%255,'#385775',1);
          T('UMBRELLA PARADE',180,34,23,U.mint);
          T('STORM '+s.level+'/3  •  CAUGHT '+s.caught+'/8',180,64,15,U.yellow);
          T('MISSED '+s.missed+'/6  •  STRIKES '+s.strikes+'/3',180,87,12,U.white);
          s.falling.forEach(item=>{
            if(item.kind==='rain'){
              O(item.x,item.y,9,'#82d9ff');O(item.x-3,item.y-4,3,'#e1f8ff');
            }else{
              L(item.x-5,item.y-12,item.x+4,item.y-2,U.yellow,5);
              L(item.x+4,item.y-2,item.x-4,item.y+12,U.yellow,5);
            }
          });
          R(0,355,360,6,'#4a617b');
          if(s.open){
            O(s.x,345,46,'#6c69b7');R(s.x-48,345,96,13,'#12243e');
            L(s.x,347,s.x,389,'#d8e5ef',4);
            T('OPEN',s.x,326,12,U.white);
          }else{
            L(s.x,319,s.x,391,U.purple,8);
            T('FOLDED',s.x,305,12,U.yellow);
          }
          R(16,399,328,43,'#263d59',11);
          T(s.note,180,421,12,U.white);
        }
      };
    }
  );
})();
