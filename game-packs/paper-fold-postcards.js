/* Paper Fold Postcards — reflect the ink stamp across the correct crease. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Paper Fold Postcards','puzzle','✉️','Fold tiny postcards so an ink stamp lands exactly on its destination.','The blue dot is your stamp; the gold ring is its destination. Tap crease A, B, or C to mirror the stamp across that line. Solve three postcards before time runs out. Three wrong folds end the delivery.'],
    api => {
      const {base,R,O,S,L,T}=api.art, U=api.colors;
      const stages=[
        {dot:[1,1],goal:[3,1],folds:[['V',2],['H',2],['V',1]],answer:0},
        {dot:[3,0],goal:[3,2],folds:[['V',2],['H',1],['H',2]],answer:1},
        {dot:[0,3],goal:[2,3],folds:[['H',2],['V',2],['V',1]],answer:2}
      ];
      const startX=62,startY=114,step=59;
      function point(p){return [startX+p[0]*step,startY+p[1]*step];}
      function options(){
        api.controls([['CREASE A','fold-0'],['CREASE B','fold-1'],['CREASE C','fold-2']]);
      }
      function apply(index){
        const s=api.state;
        if(s.ended || !Number.isInteger(index) || index<0 || index>2)return;
        const stage=stages[s.level-1],fold=stage.folds[index];
        const x=fold[0]==='V'?2*fold[1]-stage.dot[0]:stage.dot[0];
        const y=fold[0]==='H'?2*fold[1]-stage.dot[1]:stage.dot[1];
        if(x===stage.goal[0]&&y===stage.goal[1]){
          api.addScore(100+(3-s.errors)*20);
          api.beep(520);
          if(s.level===stages.length){
            api.finish(true,'All three postcards folded perfectly. Special delivery!');
          }else{
            s.level++;s.note='Delivered! Find the next crease.';
          }
        }else{
          s.errors++;api.beep(180);
          s.note='That fold misses the ring. '+(3-s.errors)+' tries left.';
          if(s.errors>=3)api.finish(false,'The paper ran out. Try a fresh stack!');
        }
      }
      return {
        init(){
          const s=api.state;s.t=90;s.level=1;s.errors=0;
          s.note='Choose the crease that lands on gold.';
          options();
        },
        action(name){
          if(/^fold-[012]$/.test(name))apply(Number(name.slice(-1)));
        },
        timeout(){if(!api.state.ended)api.finish(false,'The post office closed before delivery.');},
        draw(){
          const s=api.state,stage=stages[Math.min(s.level-1,2)];
          base('#15263a');
          T('PAPER FOLD POSTCARDS',180,37,21,U.mint);
          T('POSTCARD '+s.level+'/3  ·  MISFOLDS '+s.errors+'/3',180,66,13,U.yellow);
          R(34,85,292,292,'#f6e8c8',15);
          for(let i=0;i<5;i++){
            L(startX+i*step,startY,startX+i*step,startY+4*step,'#b6aa96',1);
            L(startX,startY+i*step,startX+4*step,startY+i*step,'#b6aa96',1);
          }
          const colors=['#e4749d','#65a6e7','#6baf82'];
          stage.folds.forEach((fold,i)=>{
            const axis=fold[1],pos=fold[0]==='V'?point([axis,0])[0]:point([0,axis])[1];
            if(fold[0]==='V')L(pos,98,pos,365,colors[i],2);
            else L(44,pos,316,pos,colors[i],2);
            const lx=fold[0]==='V'?pos:52,ly=fold[0]==='V'?103:pos-7;
            T('ABC'[i],lx,ly,13,colors[i]);
          });
          const [gx,gy]=point(stage.goal),[dx,dy]=point(stage.dot);
          S(gx,gy,17,'#bd8b19',5);O(gx,gy,6,'#bd8b19');
          O(dx,dy,15,'#3675b9');S(dx,dy,16,'#ffffff',2);
          T('STAMP → GOLD RING',180,397,14,U.yellow);
          T(s.note,180,424,11,U.white);
        }
      };
    }
  );
})();
