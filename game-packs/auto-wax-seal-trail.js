/* Wax Seal Trail — draw a continuous route through numbered seals. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Wax Seal Trail','weird','✉️','Draw a single unbroken wax trail across a secret letter.','Touch seal 1, keep your finger down, and trace through the numbered seals in order. Avoid the black ink blots. Lifting early or touching ink costs a smudge. Finish three letters before time runs out.'],
    api => {
      const {base,R,O,S,L,T}=api.art, U=api.colors;
      const letters=[
        {seals:[[55,155],[155,155],[255,155],[255,265]],blots:[[105,245,21],[210,340,22]]},
        {seals:[[55,300],[55,170],[175,170],[285,275]],blots:[[168,310,24],[270,165,24]]},
        {seals:[[55,165],[165,165],[165,295],[285,295],[285,170]],blots:[[75,285,23],[260,230,18]]}
      ];
      const hit=(x,y,c,r)=>Math.hypot(x-c[0],y-c[1])<=r;
      function segmentDistance(ax,ay,bx,by,cx,cy){
        const dx=bx-ax,dy=by-ay,den=dx*dx+dy*dy;
        const t=den?Math.max(0,Math.min(1,((cx-ax)*dx+(cy-ay)*dy)/den)):0;
        return Math.hypot(cx-ax-t*dx,cy-ay-t*dy);
      }
      function resetTrail(note){
        const s=api.state;
        s.drawing=false;s.next=0;s.trail=[];s.note=note;
      }
      function smudge(message){
        const s=api.state;
        s.smudges++;api.beep(155);
        if(s.smudges>=3)api.finish(false,'Three ink smudges spoiled the letter. Try a steadier hand.');
        else resetTrail(message+' '+(3-s.smudges)+' tries left.');
      }
      function progress(x,y){
        const s=api.state,letter=letters[s.level-1];
        if(!s.drawing||s.ended)return;
        const previous=s.trail[s.trail.length-1];
        if(letter.blots.some(b=>segmentDistance(previous[0],previous[1],x,y,b[0],b[1])<=b[2]+5)){
          smudge('Ink blot!');return;
        }
        s.trail.push([x,y]);
        const next=letter.seals[s.next];
        if(next&&segmentDistance(previous[0],previous[1],x,y,next[0],next[1])<=19){
          s.next++;api.beep(520+s.next*55);
          if(s.next===letter.seals.length){
            api.addScore(100+Math.max(0,3-s.smudges)*30);
            if(s.level===letters.length)api.finish(true,'All three letters sealed with a perfect continuous flourish!');
            else{s.level++;resetTrail('Letter sealed! Trace the next one.');}
          }else s.note='Now reach seal '+(s.next+1)+' without lifting.';
        }
      }
      return {
        init(){
          const s=api.state;s.t=145;s.level=1;s.smudges=0;
          resetTrail('Start on seal 1. Hold and drag.');
          api.controls([['Clear trail','clear',false]]);
        },
        action(name){
          const s=api.state;
          if(name==='clear'&&!s.ended)resetTrail('Trail cleared. Start again at seal 1.');
        },
        down(x,y){
          const s=api.state;
          if(s.ended||s.drawing)return;
          const first=letters[s.level-1].seals[0];
          if(!hit(x,y,first,24)){s.note='Begin directly on seal 1.';return;}
          s.drawing=true;s.next=1;s.trail=[[x,y]];
          s.note='Keep holding. Trace to seal 2.';
        },
        move(x,y){progress(x,y);},
        up(){
          const s=api.state;
          if(s.ended||!s.drawing)return;
          smudge('You lifted before the last seal!');
        },
        timeout(){if(!api.state.ended)api.finish(false,'The wax cooled before all letters were sealed.');},
        draw(){
          const s=api.state,letter=letters[s.level-1];
          base('#171a2c');
          T('WAX SEAL TRAIL',180,36,24,U.yellow);
          T('LETTER '+s.level+'/3   •   SMUDGES '+s.smudges+'/3',180,69,13,U.mint);
          R(20,93,320,291,'#e9d9b7',16);
          R(32,105,296,267,'#f4e9d2',10);
          letter.blots.forEach(([x,y,r])=>{
            O(x,y,r+6,'#a8a0a0');O(x,y,r,'#353344');
            T('×',x,y,20,'#eee5d5');
          });
          if(s.trail.length>1)for(let i=1;i<s.trail.length;i++){
            const a=s.trail[i-1],b=s.trail[i];
            L(a[0],a[1],b[0],b[1],'#a73550',8);
          }
          letter.seals.forEach(([x,y],i)=>{
            O(x,y,23,i<s.next?'#a73550':'#a98b78');
            S(x,y,23,'#fff0dc',2);
            T(i+1,x,y,19,'#fff6e5');
          });
          T(s.drawing?'KEEP HOLDING':'START AT SEAL 1',180,408,15,U.yellow);
          T(s.note,180,434,11,U.white);
        }
      };
    }
  );
})();
