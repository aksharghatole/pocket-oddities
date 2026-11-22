/* Parcel Parity — solve row and column odd/even stamps. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Parcel Parity','puzzle','📦','Stamp a parcel grid until every row and column matches its parity seal.','Tap boxes to flip their stamp. Each row and column must contain an ODD or EVEN number of stamped boxes as shown. Solve three manifests before the clock expires; exceeding a stamp budget loses the shift.'],
    api => {
      const {base,R,T,S,O}=api.art, U=api.colors;
      const patterns=[
        [[1,0,1],[0,1,0],[0,0,1]],
        [[1,0,1,1],[0,1,0,0],[1,0,0,1],[0,1,1,0]],
        [[1,0,1,0],[1,1,0,0],[0,1,0,1],[1,0,0,1]]
      ];
      const budgets=[7,11,12];
      const parity=arr=>arr.reduce((a,v)=>a+v,0)%2;
      function setup(s){
        const target=patterns[s.level-1], n=target.length;
        s.n=n;s.rows=target.map(parity);
        s.cols=Array.from({length:n},(_,c)=>parity(target.map(row=>row[c])));
        s.cells=Array.from({length:n},()=>Array(n).fill(0));
        s.moves=0;s.budget=budgets[s.level-1];
        s.note='Match every row and column seal.';
      }
      function solved(s){
        return s.cells.every((row,r)=>parity(row)===s.rows[r]) &&
          s.cols.every((v,c)=>parity(s.cells.map(row=>row[c]))===v);
      }
      function tap(x,y){
        const s=api.state;if(s.ended)return;
        const size=s.n===3?76:62, gap=6, left=(360-(size+gap)*s.n+gap)/2;
        const top=126, c=Math.floor((x-left)/(size+gap)),r=Math.floor((y-top)/(size+gap));
        if(r<0||c<0||r>=s.n||c>=s.n||x<left+c*(size+gap)||x>=left+c*(size+gap)+size||y<top+r*(size+gap)||y>=top+r*(size+gap)+size)return;
        s.cells[r][c]^=1;s.moves++;api.beep(320+s.cells[r][c]*180);
        if(solved(s)){
          api.addScore(120+s.level*35+Math.max(0,s.budget-s.moves)*15);
          if(s.level===3)api.finish(true,'All three parcel manifests sealed. Perfect parity!');
          else {s.level++;setup(s);s.note='Manifest sealed! Next delivery.';}
        }else if(s.moves>=s.budget)api.finish(false,'The stamp allowance ran out. Try the route again.');
        else s.note=(s.budget-s.moves)+' stamps remain. Match ODD / EVEN seals.';
      }
      return {
        init(){const s=api.state;s.t=145;s.level=1;setup(s);api.controls([]);},
        tap,
        timeout(){if(!api.state.ended)api.finish(false,'The mail truck departed before the manifests were sealed.');},
        draw(){
          const s=api.state,n=s.n,size=n===3?76:62,gap=6,left=(360-(size+gap)*n+gap)/2,top=126;
          base('#17213b');
          T('PARCEL PARITY',180,37,24,U.mint);
          T('MANIFEST '+s.level+'/3  •  STAMPS '+s.moves+'/'+s.budget,180,67,14,U.yellow);
          T('Tap a box to stamp / unstamp it',180,99,13,U.white);
          for(let r=0;r<n;r++){
            const ok=parity(s.cells[r])===s.rows[r];
            for(let c=0;c<n;c++){
              const x=left+c*(size+gap),y=top+r*(size+gap);
              R(x,y,size,size,s.cells[r][c]?'#347f84':'#33415e',9);
              if(s.cells[r][c]){S(x+size/2,y+size/2,size*.25,U.mint,3);T('✓',x+size/2,y+size/2+7,24,U.white);}
            }
            T((s.rows[r]?'O':'E')+(ok?'✓':''),left+(size+gap)*n+10,top+r*(size+gap)+size/2+5,13,ok?U.mint:U.yellow);
          }
          for(let c=0;c<n;c++){
            const ok=parity(s.cells.map(row=>row[c]))===s.cols[c];
            T((s.cols[c]?'O':'E')+(ok?'✓':''),left+c*(size+gap)+size/2,top+n*(size+gap)+15,13,ok?U.mint:U.yellow);
          }
          R(19,401,322,37,'#293653',9);
          T(s.note,180,423,12,U.white);
        }
      };
    }
  );
})();