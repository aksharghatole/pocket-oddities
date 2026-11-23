/* Parcel Parity — flip parcel stamps to satisfy row and column parity. */
(() => {
  'use strict';
  window.PocketOddities.register(
    ['Parcel Parity','puzzle','📦','Fix the post office grid using odd and even stamp rules.','Tap squares to flip their stamps. Every row must have an EVEN number of stamps, and every column an ODD number. Solve three boards before time runs out. Each board has a move budget; three failed boards end the shift.'],
    api => {
      const {base,R,T}=api.art, U=api.colors;
      const starts=[
        [1,0,0,1, 0,1,1,0, 1,0,0,0, 0,0,0,0],
        [1,1,0,0, 1,0,1,1, 0,1,0,0, 0,0,0,1],
        [0,1,1,1, 1,1,0,0, 1,0,0,1, 0,0,1,0]
      ];
      const budgets=[9,11,13];
      function status(s){
        const rows=[],cols=[];
        for(let n=0;n<4;n++){
          let r=0,c=0;
          for(let j=0;j<4;j++){r+=s.cells[n*4+j];c+=s.cells[j*4+n];}
          rows.push(r%2===0);cols.push(c%2===1);
        }
        return {rows,cols,solved:rows.every(Boolean)&&cols.every(Boolean)};
      }
      function load(s){
        s.cells=starts[s.level-1].slice();
        s.moves=0;s.limit=budgets[s.level-1];
        s.note='Rows EVEN · Columns ODD';
      }
      function flip(i){
        const s=api.state;
        if(s.ended||i<0||i>=16)return;
        s.cells[i]^=1;s.moves++;
        api.beep(340+s.cells[i]*110);
        const result=status(s);
        if(result.solved){
          api.addScore(120+Math.max(0,s.limit-s.moves)*15);
          if(s.level===3)api.finish(true,'All three parcel grids passed inspection!');
          else {s.level++;load(s);s.note='Sorted! Next parcel grid.';}
        }else if(s.moves>=s.limit){
          s.fails++;
          if(s.fails>=3)api.finish(false,'Three parcel batches failed inspection.');
          else {load(s);s.note='Out of flips. Fresh batch! '+(3-s.fails)+' retries left.';}
        }else s.note=(s.limit-s.moves)+' flips left · '+result.rows.filter(Boolean).length+'/4 rows · '+result.cols.filter(Boolean).length+'/4 columns';
      }
      return {
        init(){
          const s=api.state;s.t=120;s.level=1;s.fails=0;load(s);
          api.controls([['Restart board','reset',false]]);
        },
        action(name){
          const s=api.state;
          if(name==='reset'&&!s.ended){load(s);s.note='Board reset. No penalty.';}
        },
        tap(x,y){
          if(x<40||x>=320||y<119||y>=399)return;
          flip(Math.floor((y-119)/70)*4+Math.floor((x-40)/70));
        },
        timeout(){if(!api.state.ended)api.finish(false,'The post office closed before inspection finished.');},
        draw(){
          const s=api.state, p=status(s);
          base('#161e32');
          T('PARCEL PARITY',180,35,23,U.yellow);
          T('BATCH '+s.level+'/3   ·   FAILED '+s.fails+'/3',180,64,13,U.white);
          T('ROWS EVEN  /  COLUMNS ODD',180,92,13,U.mint);
          for(let i=0;i<16;i++){
            const row=Math.floor(i/4),col=i%4,x=40+col*70,y=119+row*70;
            R(x+3,y+3,64,64,s.cells[i]?'#f5c76d':'#303e59',10);
            T(s.cells[i]?'✦':'·',x+35,y+35,28,s.cells[i]?'#263047':'#a2b0c8');
          }
          for(let i=0;i<4;i++){
            T(p.rows[i]?'✓':'×',24,154+i*70,17,p.rows[i]?U.mint:U.pink);
            T(p.cols[i]?'✓':'×',75+i*70,411,17,p.cols[i]?U.mint:U.pink);
          }
          T('FLIPS '+s.moves+'/'+s.limit,180,437,13,U.white);
        }
      };
    }
  );
})();
