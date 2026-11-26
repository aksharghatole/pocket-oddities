/* Staircase Architect — build three miniature skylines from a limited brick supply. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Staircase Architect','strategy','🧱','Build strange miniature stairways with a fixed brick budget.','Tap a column to add one brick. Tap a full column to remove its bricks and start it over, or use UNDO. Match every glowing target height, then tap INSPECT. Complete three blueprints before time expires; three incorrect inspections end the shift.'],
    api => {
      const {base,R,T,L}=api.art,U=api.colors;
      const plans=[[1,2,3,4],[2,4,1,3,5],[3,1,5,2,4,6]];
      function load(){
        const s=api.state;
        s.target=plans[s.level-1].slice();s.heights=s.target.map(()=>0);
        s.bricks=s.target.reduce((a,b)=>a+b,0);s.history=[];
        s.note='Tap columns to place bricks.';
      }
      function place(i){
        const s=api.state;if(s.ended||i<0||i>=s.heights.length)return;
        const old=s.heights[i];
        if(old===s.target[i]+1){s.bricks+=old;s.heights[i]=0;s.history.push([i,old]);s.note='Column cleared.';return;}
        if(s.bricks===0){s.note='No bricks left. Undo or clear a column.';api.beep(170);return;}
        s.heights[i]++;s.bricks--;s.history.push([i,old]);api.beep(390);
        s.note='Match the dotted height markers.';
      }
      function undo(){
        const s=api.state;if(!s.history.length)return;
        const [i,old]=s.history.pop();s.bricks+=s.heights[i]-old;s.heights[i]=old;
        s.note='Last placement undone.';
      }
      function inspect(){
        const s=api.state;if(s.ended)return;
        if(s.heights.every((h,i)=>h===s.target[i])){
          api.addScore(120+20*s.bricks+30*(3-s.errors));
          api.beep(660);
          if(s.level===plans.length)api.finish(true,'All three impossible stairways are ready for visitors!');
          else{s.level++;load();s.note='Blueprint approved! Next staircase.';}
        }else{
          s.errors++;api.beep(160);
          if(s.errors>=3)api.finish(false,'Three inspections failed. The architect closes the site.');
          else s.note='Not quite! '+(3-s.errors)+' inspections remain.';
        }
      }
      return {
        init(){const s=api.state;s.t=140;s.level=1;s.errors=0;load();
          api.controls([['INSPECT','inspect',true],['UNDO','undo',false],['RESET','reset',false]]);
        },
        action(name){
          const s=api.state;if(s.ended)return;
          if(name==='inspect')inspect();
          if(name==='undo')undo();
          if(name==='reset'){load();s.note='Blueprint reset. Try another arrangement.';}
        },
        tap(x,y){
          const s=api.state,n=s.heights.length;
          if(y<145||y>372||x<18||x>342)return;
          const step=324/n,i=Math.floor((x-18)/step);
          if(i>=0&&i<n)place(i);
        },
        timeout(){if(!api.state.ended)api.finish(false,'The building permit expired before inspection.');},
        draw(){
          const s=api.state,n=s.heights.length,step=324/n;
          base('#1b2438');
          T('STAIRCASE ARCHITECT',180,38,21,U.mint);
          T('BLUEPRINT '+s.level+'/3   ·   FAILED '+s.errors+'/3',180,70,13,U.yellow);
          T('BRICKS LEFT: '+s.bricks,180,105,18,U.white);
          T('Target heights: '+s.target.join('  ·  '),180,130,13,U.muted);
          R(14,373,332,10,'#8d7181',3);
          for(let i=0;i<n;i++){
            const x=18+i*step+3,w=step-7,unit=32;
            const targetY=367-s.target[i]*unit;
            L(x,targetY,x+w,targetY,U.yellow,3);
            for(let j=0;j<s.heights[i];j++){
              const y=367-(j+1)*unit;
              R(x,y,w,unit-3,j%2?'#e6a875':'#f0c494',4);
              L(x+5,y+unit-8,x+w-5,y+unit-8,'#ae775c',1);
            }
            T(String(i+1),x+w/2,394,13,U.white);
          }
          R(15,408,330,32,'#304158',8);
          T(s.note,180,425,12,U.white);
        }
      };
    }
  );
})();
