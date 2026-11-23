/* Thread Needle — stitch through every peg without crossing your own thread. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Thread Needle','strategy','🪡','Sew a winding route through glowing pegs without crossing your thread.','Tap unvisited pegs to stitch from START to FINISH. Visit every peg before tapping FINISH. A stitch cannot cross an earlier stitch. Three snags end the run; complete three cloths to win.'],
    api => {
      const {base,R,O,S,L,T}=api.art, C=api.colors;
      const cloths=[
        [[82,145],[128,285],[174,155],[220,295],[268,175]],
        [[73,285],[114,145],[154,300],[194,155],[236,295],[280,145]],
        [[65,155],[102,290],[139,145],[176,305],[213,165],[250,290],[288,150]]
      ];
      const start=[30,225], end=[330,225];
      const cross=(a,b,c,d)=>{
        const orient=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);
        const o1=orient(a,b,c),o2=orient(a,b,d),o3=orient(c,d,a),o4=orient(c,d,b);
        return o1*o2<0&&o3*o4<0;
      };
      function setup(s){
        s.pegs=cloths[s.level-1].map(([x,y])=>[x,y]);
        s.path=[start];s.used=[];s.note='Tap any peg. Plan a route without crossing.';
      }
      function snag(message){
        const s=api.state;s.snags++;s.note=message+'  '+(3-s.snags)+' chances left.';
        api.beep(160);
        if(s.snags>=3)api.finish(false,'Three tangled stitches. Try another route!');
      }
      function stitch(target,index){
        const s=api.state;if(s.ended)return;
        const from=s.path[s.path.length-1];
        if(s.path.length>1){
          for(let i=1;i<s.path.length-1;i++){
            if(cross(from,target,s.path[i-1],s.path[i])){snag('Thread crossed itself!');return;}
          }
        }
        if(index===-1){
          if(s.used.length!==s.pegs.length){snag('Visit every peg first!');return;}
          api.addScore(120+Math.max(0,3-s.snags)*20);
          if(s.level===cloths.length){api.finish(true,'All three cloths stitched without a tangle!');return;}
          s.level++;setup(s);s.note='Cloth '+s.level+' ready. Keep stitching!';api.beep(620);return;
        }
        s.path.push(target);s.used.push(index);
        api.beep(370+index*35);
        s.note=s.used.length+'/'+s.pegs.length+' pegs sewn. '+(s.pegs.length-s.used.length)+' left.';
      }
      return {
        init(){const s=api.state;s.t=115;s.level=1;s.snags=0;setup(s);api.controls([['Undo stitch','undo',true],['Reset cloth','reset',false]]);},
        action(name){
          const s=api.state;if(s.ended)return;
          if(name==='undo'&&s.used.length){s.used.pop();s.path.pop();s.note='Last stitch removed.';}
          if(name==='reset'){setup(s);s.note='Cloth reset. Try a new route.';}
        },
        tap(x,y){
          const s=api.state;if(s.ended)return;
          if(Math.hypot(x-end[0],y-end[1])<=25){stitch(end,-1);return;}
          const i=s.pegs.findIndex((p,j)=>!s.used.includes(j)&&Math.hypot(x-p[0],y-p[1])<=25);
          if(i>=0)stitch(s.pegs[i],i);
        },
        timeout(){if(!api.state.ended)api.finish(false,'The sewing bell rang before all cloths were finished.');},
        draw(){
          const s=api.state;
          base('#181b35');T('THREAD NEEDLE',180,38,24,C.mint);
          T('CLOTH '+s.level+'/3   •   SNAGS '+s.snags+'/3',180,70,14,C.yellow);
          R(12,91,336,291,'#2b3153',16);
          for(let y=104;y<375;y+=22)L(18,y,342,y,'#3d4467',1);
          for(let x=22;x<345;x+=22)L(x,99,x,375,'#343b5d',1);
          s.path.forEach((p,i)=>{if(i)L(s.path[i-1][0],s.path[i-1][1],p[0],p[1],C.yellow,5);});
          O(start[0],start[1],20,'#55aa9d');T('S',start[0],start[1]+1,17,'#11283a');
          s.pegs.forEach((p,i)=>{
            const used=s.used.includes(i);O(p[0],p[1],21,used?'#5c7384':'#f3a7d3');
            S(p[0],p[1],23,used?C.mint:C.white,2);
            T(used?'✓':String(i+1),p[0],p[1]+1,16,'#18213a');
          });
          O(end[0],end[1],22,s.used.length===s.pegs.length?C.mint:'#8190a8');
          T('F',end[0],end[1]+1,17,'#17223a');
          T('START',49,399,11,C.muted);T('FINISH',307,399,11,C.muted);
          T('PEGS '+s.used.length+'/'+s.pegs.length,180,401,14,C.white);
          T(s.note,180,431,11,C.white);
        }
      };
    }
  );
})();
