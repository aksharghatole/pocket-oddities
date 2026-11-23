/* Knot Garden — untangle glowing threads by dragging their endpoints. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Knot Garden','puzzle','🧶','Drag glowing pegs until no threads cross.','Touch and drag the numbered pegs to untangle every thread. Clear three gardens before 120 seconds pass. You have 18 moves per garden; running out of moves ends the run.'],
    api => {
      const {base,R,O,S,L,T}=api.art, C=api.colors;
      const layouts=[
        {points:[[90,155],[270,155],[270,330],[90,330]],edges:[[0,1],[1,2],[2,3],[3,0]],order:[0,2,1,3]},
        {points:[[180,120],[290,205],[245,350],[115,350],[70,205]],edges:[[0,1],[1,2],[2,3],[3,4],[4,0]],order:[0,2,4,1,3]},
        {points:[[90,145],[270,145],[300,275],[180,355],[60,275]],edges:[[0,1],[1,2],[2,3],[3,4],[4,0],[0,2]],order:[0,3,1,4,2]}
      ];
      const cross=(a,b,c,d)=>{
        const turn=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);
        const x=turn(a,b,c),y=turn(a,b,d),z=turn(c,d,a),w=turn(c,d,b);
        return x*y< -0.0001 && z*w< -0.0001;
      };
      function crossings(s){
        const edges=layouts[s.stage].edges;
        let count=0;
        for(let i=0;i<edges.length;i++)for(let j=i+1;j<edges.length;j++){
          const [a,b]=edges[i], [c,d]=edges[j];
          if(a===c||a===d||b===c||b===d)continue;
          if(cross(s.points[a],s.points[b],s.points[c],s.points[d]))count++;
        }
        return count;
      }
      function start(s){
        const layout=layouts[s.stage];
        s.points=layout.order.map(i=>({x:layout.points[i][0],y:layout.points[i][1]}));
        s.moves=18;s.drag=-1;s.startPos=null;s.note='Drag a peg to remove crossing threads.';
        s.level=s.stage+1;s.crossings=crossings(s);
      }
      function check(){
        const s=api.state;
        s.crossings=crossings(s);
        if(s.crossings!==0)return;
        api.addScore(100+s.moves*5);
        api.beep(740);
        if(s.stage===layouts.length-1){
          api.finish(true,'All three gardens are free of knots. The threads can finally bloom!');
        }else{
          s.stage++;start(s);s.note='Garden cleared! Untangle the next one.';
        }
      }
      return {
        init(){
          const s=api.state;s.t=120;s.stage=0;start(s);
          api.controls([['Reset garden','reset',true]]);
        },
        down(x,y){
          const s=api.state;if(s.ended)return;
          s.drag=s.points.findIndex(p=>Math.hypot(p.x-x,p.y-y)<=29);
          if(s.drag>=0)s.startPos={...s.points[s.drag]};
        },
        move(x,y){
          const s=api.state;if(s.ended||s.drag<0)return;
          s.points[s.drag].x=Math.max(34,Math.min(326,x));
          s.points[s.drag].y=Math.max(110,Math.min(376,y));
          s.crossings=crossings(s);
        },
        up(){
          const s=api.state;if(s.ended||s.drag<0)return;
          const p=s.points[s.drag],old=s.startPos;
          s.drag=-1;s.startPos=null;
          if(Math.hypot(p.x-old.x,p.y-old.y)<8){p.x=old.x;p.y=old.y;return;}
          s.moves--;check();
          if(s.ended)return;
          if(s.moves<=0&&s.crossings>0)api.finish(false,'The garden ran out of moves. Try a different untangling path.');
          else if(s.crossings>0)s.note=s.crossings+' crossing'+(s.crossings===1?'':'s')+' remain.';
        },
        action(name){
          const s=api.state;if(s.ended||name!=='reset')return;
          start(s);s.note='Garden reset. Moves restored.';
        },
        timeout(){if(!api.state.ended)api.finish(false,'The garden clock ran out. Try again!');},
        draw(){
          const s=api.state;base('#15283a');
          T('KNOT GARDEN',180,35,24,C.mint);
          T('GARDEN '+(s.stage+1)+'/3  ·  MOVES '+s.moves+'  ·  CROSSES '+s.crossings,180,69,13,C.yellow);
          R(17,94,326,304,'#20384a',18);
          const edges=layouts[s.stage].edges;
          edges.forEach(([a,b],i)=>{
            const p=s.points[a],q=s.points[b];
            const tangled=edges.some(([c,d],j)=>i!==j&&a!==c&&a!==d&&b!==c&&b!==d&&cross(p,q,s.points[c],s.points[d]));
            L(p.x,p.y,q.x,q.y,tangled?'#ff8d9b':'#8de4c2',5);
          });
          s.points.forEach((p,i)=>{
            O(p.x,p.y,24,i===s.drag?'#ffe49a':'#9ac8ff');
            S(p.x,p.y,25,'#ffffff',2);
            T(String(i+1),p.x,p.y+1,17,'#14243a');
          });
          T(s.note,180,422,12,C.white);
          T('DRAG PEGS · NO CROSSING THREADS',180,443,10,C.muted);
        }
      };
    }
  );
})();
