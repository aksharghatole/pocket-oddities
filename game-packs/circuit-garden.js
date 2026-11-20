/* Circuit Garden — rotate paths to carry light from seed to flower. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Circuit Garden','puzzle','🌱','Rotate tiny wire paths to grow a glowing garden.','Tap each square to rotate its wire. Connect the seed (top left) to the flower (bottom right) before time runs out. Complete 3 gardens.'],
    api => {
      const {base,R,O,L,T}=api.art, U=api.colors;
      const {irnd}=api.helpers;
      const N=4, SIZE=70, X=40, Y=91;
      const dirs=[[0,-1],[1,0],[0,1],[-1,0]];
      const path=[[0,0],[1,0],[2,0],[3,0],[3,1],[2,1],[1,1],[0,1],[0,2],[1,2],[2,2],[3,2],[3,3]];
      const key=(x,y)=>y*N+x;
      function bitsFor(i) {
        const [x,y]=path[i];
        let bits=0;
        for(const p of [path[i-1],path[i+1]]) {
          if(!p)continue;
          const d=dirs.findIndex(([dx,dy])=>x+dx===p[0]&&y+dy===p[1]);
          bits|=1<<d;
        }
        return bits;
      }
      const rotate=bits=>((bits<<1)|(bits>>3))&15;
      function connected(s) {
        const seen=new Set([0]), queue=[0];
        while(queue.length) {
          const at=queue.shift(), x=at%N,y=Math.floor(at/N),bits=s.cells[at];
          for(let d=0;d<4;d++) {
            if(!(bits&(1<<d)))continue;
            const nx=x+dirs[d][0],ny=y+dirs[d][1];
            if(nx<0||nx>=N||ny<0||ny>=N)continue;
            const next=key(nx,ny);
            if(!(s.cells[next]&(1<<((d+2)%4)))||seen.has(next))continue;
            seen.add(next);queue.push(next);
          }
        }
        return seen;
      }
      function setup(s) {
        s.cells=Array.from({length:N*N},()=>[3,5,6,9,10,12][irnd(0,5)]);
        path.forEach(([x,y],i)=>{s.cells[key(x,y)]=bitsFor(i);});
        s.solution=s.cells.slice();
        // Every path tile is scrambled; the solution is always reachable.
        path.forEach(([x,y])=>{
          const k=key(x,y), turns=irnd(1,3);
          for(let j=0;j<turns;j++)s.cells[k]=rotate(s.cells[k]);
        });
        s.lit=connected(s);
        s.note='Rotate wires to guide the glow';
      }
      return {
        init() {
          const s=api.state;
          s.level=1;s.t=110;s.moves=0;
          api.controls([]);
          setup(s);
        },
        tap(x,y) {
          const s=api.state;
          const col=Math.floor((x-X)/SIZE),row=Math.floor((y-Y)/SIZE);
          if(col<0||col>=N||row<0||row>=N)return;
          const k=key(col,row);
          s.cells[k]=rotate(s.cells[k]);s.moves++;
          s.lit=connected(s);
          if(s.lit.has(key(3,3))) {
            api.addScore(Math.max(10,50-s.moves));
            if(s.level===3) {
              api.finish(true,'All three gardens are glowing! The circuit has bloomed.');
              return;
            }
            s.level++;s.t=Math.min(110,s.t+22);s.moves=0;
            setup(s);s.note='Garden '+s.level+' of 3 — keep growing!';
          } else s.note=s.lit.size+' glowing tiles · '+s.moves+' rotations';
        },
        update(dt) {
          const s=api.state;
          s.t=Math.max(0,s.t-dt);
          if(s.t<=0)api.finish(false,'The garden went dark. Rotate the wires and try again!');
        },
        draw() {
          const s=api.state;
          base('#111c2c');
          T('CIRCUIT GARDEN',180,29,22,U.mint);
          T('GARDEN '+s.level+'/3   ·   '+s.moves+' ROTATIONS',180,59,13,U.yellow);
          for(let y=0;y<N;y++)for(let x=0;x<N;x++) {
            const k=key(x,y), cx=X+x*SIZE+SIZE/2,cy=Y+y*SIZE+SIZE/2;
            const lit=s.lit.has(k),bits=s.cells[k];
            R(X+x*SIZE+2,Y+y*SIZE+2,SIZE-4,SIZE-4,lit?'#275c58':'#26364a',12);
            O(cx,cy,8,lit?U.mint:'#8ba1ba');
            for(let d=0;d<4;d++)if(bits&(1<<d))
              L(cx,cy,cx+dirs[d][0]*29,cy+dirs[d][1]*29,lit?U.mint:'#8ba1ba',9);
          }
          T('🌱',75,108,25);
          T('🌼',285,318,25);
          R(27,389,306,43,'#26364a',12);
          T(s.note,180,411,13,U.white);
          T('Tap a tile to turn it 90° clockwise',180,447,12,U.muted);
        }
      };
    }
  );
})();
