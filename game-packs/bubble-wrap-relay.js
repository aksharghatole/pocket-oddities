/* Bubble Wrap Relay — pop numbered bubbles in order as the tray shifts. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Bubble Wrap Relay','reflex','🫧','Pop numbered bubbles in order while the tray keeps shifting.','Tap 1, then 2, and so on. After every correct pop, the remaining bubbles shift one slot clockwise. Clear three trays before 90 seconds; three wrong taps end the run.'],
    api => {
      const {base,R,O,S,T}=api.art, C=api.colors;
      const slots=Array.from({length:9},(_,i)=>({x:66+(i%3)*114,y:143+Math.floor(i/3)*105}));
      const goals=[4,6,8];
      function startTray(s){
        s.goal=goals[s.level-1];s.next=1;
        const positions=api.helpers.shuffle([...Array(9).keys()]).slice(0,s.goal);
        s.bubbles=positions.map((pos,i)=>({number:i+1,pos}));
        s.note='Find bubble 1';
      }
      function pop(index){
        const s=api.state;
        if(s.ended)return;
        const bubble=s.bubbles.find(b=>b.pos===index);
        if(!bubble)return;
        if(bubble.number!==s.next){
          s.errors++;s.note='Wrong bubble! '+(3-s.errors)+' mistakes left';
          api.beep(160);
          if(s.errors>=3)api.finish(false,'Three wrong pops. The bubbles won this round.');
          return;
        }
        s.bubbles=s.bubbles.filter(b=>b!==bubble);
        api.addScore(10+s.level*5);
        api.beep(420+s.next*35);
        s.next++;
        if(s.next>s.goal){
          api.addScore(50);
          if(s.level===3){api.finish(true,'Every bubble popped in order. Perfect relay!');return;}
          s.level++;startTray(s);
          return;
        }
        // Every surviving bubble moves exactly one position clockwise in the
        // fixed nine-slot ring, preserving distinct positions and solvability.
        const ring=[0,1,2,5,8,7,6,3,4];
        s.bubbles.forEach(b=>{b.pos=ring[(ring.indexOf(b.pos)+1)%ring.length];});
        s.note='Tray shifted! Find '+s.next;
      }
      return {
        init(){
          const s=api.state;s.t=90;s.level=1;s.errors=0;
          startTray(s);
          api.controls([['Restart tray','reset-tray',false]]);
        },
        action(name){
          const s=api.state;if(s.ended)return;
          if(name==='reset-tray'){s.errors++;if(s.errors>=3)api.finish(false,'Too many tray resets.');else startTray(s);}
        },
        tap(x,y){
          const index=slots.findIndex(p=>Math.abs(x-p.x)<=43&&Math.abs(y-p.y)<=42);
          if(index!==-1)pop(index);
        },
        timeout(){if(!api.state.ended)api.finish(false,'Time ran out before the last bubble.');},
        draw(){
          const s=api.state;
          base('#15233b');
          T('BUBBLE WRAP RELAY',180,36,22,C.mint);
          T('TRAY '+s.level+'/3  ·  WRONG '+s.errors+'/3',180,67,14,C.yellow);
          T('POP '+s.next+' OF '+s.goal,180,99,20,C.white);
          slots.forEach((p,i)=>{
            R(p.x-48,p.y-46,96,92,'#253b57',17);
            const b=s.bubbles.find(v=>v.pos===i);
            if(b){
              O(p.x,p.y,38,'#65b9e8');S(p.x-8,p.y-9,19,'#d6f7ff',3);
              T(String(b.number),p.x,p.y+5,29,'#132c49');
            }else{
              O(p.x,p.y,29,'#1a2d44');S(p.x,p.y,27,'#45617a',2);
            }
          });
          R(22,391,316,47,'#263a55',12);
          T(s.note,180,413,14,C.white);
        }
      };
    }
  );
})();
