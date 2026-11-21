/* Quiet Quarry — tap touching stone clusters to excavate three tiny caverns. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Quiet Quarry','strategy','🪨','Excavate matching clusters before the quarry closes.','Tap a group of two or more touching stones of the same color. Stones above fall into the gaps. Clear at least 15 stones in each of three caverns before time runs out. Single stones do nothing.'],
    api => {
      const {base,R,O,T}=api.art, U=api.colors;
      const palette=['#f4b67b','#83c5ff','#b6e58b','#e6a5e7'];
      const N=5, size=56, left=40, top=103;
      function fresh(s){
        // Each column starts with a guaranteed triple, so all 15 target stones are reachable.
        s.grid=Array.from({length:N},(_,row)=>Array.from({length:N},(_,col)=>{
          const pair=(col+s.level)%4;
          return row>=2?pair:(row+col*2+s.level)%4;
        }));
        s.dug=0;s.note='Tap a matching cluster (2+ stones).';
      }
      function cluster(grid,r,c){
        const color=grid[r]?.[c];
        if(color===null||color===undefined)return [];
        const found=[],seen=new Set(),todo=[[r,c]];
        while(todo.length){
          const [y,x]=todo.pop(),key=y*N+x;
          if(y<0||y>=N||x<0||x>=N||seen.has(key)||grid[y][x]!==color)continue;
          seen.add(key);found.push([y,x]);
          todo.push([y-1,x],[y+1,x],[y,x-1],[y,x+1]);
        }
        return found;
      }
      function hasGroup(grid){
        for(let r=0;r<N;r++)for(let c=0;c<N;c++)
          if(grid[r][c]!==null&&cluster(grid,r,c).length>=2)return true;
        return false;
      }
      function dig(x,y){
        const s=api.state;
        if(s.ended)return;
        const c=Math.floor((x-left)/size),r=Math.floor((y-top)/size);
        if(r<0||r>=N||c<0||c>=N)return;
        const group=cluster(s.grid,r,c);
        if(group.length<2){s.note='Find two or more touching stones.';return;}
        group.forEach(([rr,cc])=>{s.grid[rr][cc]=null;});
        for(let cc=0;cc<N;cc++){
          const remaining=[];
          for(let rr=N-1;rr>=0;rr--)if(s.grid[rr][cc]!==null)remaining.push(s.grid[rr][cc]);
          for(let rr=N-1;rr>=0;rr--)s.grid[rr][cc]=remaining[N-1-rr]??null;
        }
        s.dug+=group.length;
        api.addScore(group.length*10+Math.max(0,group.length-2)*5);
        api.beep(280+group.length*28);
        if(s.dug>=15){
          api.addScore(50);
          if(s.level===3){api.finish(true,'All three caverns excavated. The quarry is yours!');return;}
          s.level++;fresh(s);s.note='Cavern '+s.level+'! Keep digging.';
        }else if(!hasGroup(s.grid)){
          api.finish(false,'No matching clusters remain. Try a different excavation order.');
        }else s.note='Nice cluster! '+Math.max(0,15-s.dug)+' stones to go.';
      }
      return {
        init(){const s=api.state;s.t=110;s.level=1;fresh(s);api.controls([]);},
        tap:dig,
        timeout(){if(!api.state.ended)api.finish(false,'The quarry bell rang before the last cavern was cleared.');},
        draw(){
          const s=api.state;
          base('#182336');
          T('QUIET QUARRY',180,35,23,U.mint);
          T('CAVERN '+s.level+'/3  •  DUG '+s.dug+'/15',180,67,14,U.yellow);
          R(30,94,300,300,'#283750',12);
          for(let r=0;r<N;r++)for(let c=0;c<N;c++){
            const color=s.grid[r][c];
            if(color===null)continue;
            const x=left+c*size,y=top+r*size;
            R(x+2,y+2,size-4,size-4,color,10);
            O(x+size*.38,y+size*.34,5,'#ffffff55');
            R(x+13,y+size-13,30,3,'#00000022',2);
          }
          R(25,409,310,32,'#293951',9);
          T(s.note,180,430,12,U.white);
        }
      };
    }
  );
})();
