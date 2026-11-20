/* Mirror Courier — turn mirrors to deliver a beam through three chambers. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Mirror Courier','puzzle','🪞','Guide a beam of light through a maze of rotating mirrors.','Tap mirrors to turn them. Connect the left-hand emitter to the right-hand receiver in three chambers. You have 14 turns and 120 seconds.'],
    api => {
      const {base,R,O,S,L,T}=api.art, C=api.colors;
      const levels=[
        {start:3,goal:1,mirrors:[[1,3,'/'],[1,1,'/'],[3,3,'\\']]},
        {start:4,goal:2,mirrors:[[1,4,'/'],[1,0,'/'],[3,0,'\\'],[3,2,'\\']]},
        {start:3,goal:0,mirrors:[[0,3,'/'],[0,1,'/'],[2,1,'\\'],[2,4,'\\'],[4,4,'/'],[4,0,'/']]}
      ];
      const cx=c=>46+c*67, cy=r=>113+r*61;
      function begin(s){
        const p=levels[s.level-1];
        s.start=p.start;s.goal=p.goal;
        s.mirrors=p.mirrors.map(([c,r,solution])=>({c,r,solution,kind:solution==='/'?'\\':'/'}));
        s.note='Turn the mirrors to reach the receiver.';
      }
      function trace(s){
        let c=-1,r=s.start,dx=1,dy=0;
        const points=[[12,cy(r)]],visited=new Set();
        for(let step=0;step<55;step++){
          c+=dx;r+=dy;
          if(c===5){points.push([349,cy(r)]);return {points,won:r===s.goal};}
          if(c<0||r<0||r>4){points.push([Math.max(10,Math.min(350,cx(c))),Math.max(88,Math.min(389,cy(r)))]);break;}
          points.push([cx(c),cy(r)]);
          const key=c+','+r+','+dx+','+dy;
          if(visited.has(key))break;
          visited.add(key);
          const mirror=s.mirrors.find(m=>m.c===c&&m.r===r);
          if(mirror){
            const oldDx=dx,oldDy=dy;
            if(mirror.kind==='/'){dx=-oldDy;dy=-oldDx;}
            else {dx=oldDy;dy=oldDx;}
          }
        }
        return {points,won:false};
      }
      function rotate(x,y){
        const s=api.state;
        if(s.ended)return;
        const mirror=s.mirrors.find(m=>Math.abs(cx(m.c)-x)<28&&Math.abs(cy(m.r)-y)<28);
        if(!mirror)return;
        mirror.kind=mirror.kind==='/'?'\\':'/';
        s.turns++;api.beep(380);
        const result=trace(s);
        if(result.won){
          api.addScore(100+Math.max(0,14-s.turns)*10);
          if(s.level===3){api.finish(true,'Every message delivered. The light has found its way!');return;}
          s.level++;begin(s);s.note='Delivery complete! A new chamber awaits.';
        }else if(s.turns>=14)api.finish(false,'The mirrors jammed after fourteen turns. Try a new route.');
        else s.note='Beam redirected. '+(14-s.turns)+' turns left.';
      }
      return {
        init(){
          const s=api.state;s.level=1;s.t=120;s.turns=0;
          begin(s);api.controls([]);
        },
        tap:rotate,
        timeout(){if(!api.state.ended)api.finish(false,'The courier ran out of daylight.');},
        draw(){
          const s=api.state;
          base('#11182d');
          T('MIRROR COURIER',180,38,22,C.mint);
          T('CHAMBER '+s.level+'/3  ·  TURNS '+s.turns+'/14',180,67,14,C.yellow);
          for(let r=0;r<5;r++)for(let c=0;c<5;c++){
            R(cx(c)-27,cy(r)-26,54,52,'#253454',9);
            O(cx(c),cy(r),2,'#667a9c');
          }
          const beam=trace(s);
          for(let i=1;i<beam.points.length;i++){
            const a=beam.points[i-1],b=beam.points[i];
            L(a[0],a[1],b[0],b[1],beam.won?C.mint:C.yellow,4);
          }
          s.mirrors.forEach(m=>{
            R(cx(m.c)-23,cy(m.r)-23,46,46,'#455978',10);
            T(m.kind,cx(m.c),cy(m.r)+12,35,C.white);
          });
          O(13,cy(s.start),9,C.yellow);
          R(341,cy(s.goal)-19,17,38,beam.won?C.mint:'#ed8da9',5);
          T('✦',349,cy(s.goal)+6,19,'#11182d');
          R(18,404,324,36,'#273653',10);
          T(s.note,180,426,12,C.white);
        }
      };
    }
  );
})();
